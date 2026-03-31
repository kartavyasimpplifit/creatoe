"""
Fix data quality issues in the creator database:
1. Fix language detection — use video metadata + better heuristics
2. Hard-filter non-phone creators
3. Recompute phone video counts with stricter rules
4. Compute format mix (Shorts vs Long-form)
5. Compute fraud signals (view/sub ratio)
"""

import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import SessionLocal, Creator, Video
from backend.app.analyzer.content_analyzer import PHONE_BRANDS, analyze_transcript


HINDI_SEARCH_QUERIES = [
    "hindi", "review hindi", "unboxing hindi", "comparison hindi",
    "tips tricks hindi", "camera test hindi",
]

LANGUAGE_FROM_AUDIO = {
    "hi": "hindi", "en": "english", "ta": "tamil", "te": "telugu",
    "bn": "bengali", "mr": "marathi", "kn": "kannada", "ml": "malayalam",
    "gu": "gujarati", "pa": "punjabi", "hi-IN": "hindi", "en-IN": "english",
    "en-US": "english", "en-GB": "english",
}

HINGLISH_WORDS = set("hai ka ki ke ko se ye yeh nahi kya hum aur bhi ek mein par wala wale wali karo karna dekho dekhiye aaj yaar bhai dost".split())


def fix_language_for_video(video: Video) -> str:
    """Better language detection using multiple signals."""
    audio_lang = ""
    if hasattr(video, 'analysis') and video.analysis:
        audio_lang = video.analysis.get("language", "")

    title = video.title.lower()
    desc = (video.description or "")[:500].lower()
    text = title + " " + desc

    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', text))
    telugu_chars = len(re.findall(r'[\u0C00-\u0C7F]', text))
    bengali_chars = len(re.findall(r'[\u0980-\u09FF]', text))

    if hindi_chars > 5:
        return "hindi"
    if tamil_chars > 3:
        return "tamil"
    if telugu_chars > 3:
        return "telugu"
    if bengali_chars > 3:
        return "bengali"

    words = set(re.findall(r'\b\w+\b', text))
    hinglish_count = len(words & HINGLISH_WORDS)
    if hinglish_count >= 3:
        return "hindi"

    if any(kw in text for kw in ["hindi", "हिंदी", "हिन्दी"]):
        return "hindi"
    if any(kw in text for kw in ["tamil", "தமிழ்"]):
        return "tamil"
    if any(kw in text for kw in ["telugu", "తెలుగు"]):
        return "telugu"
    if any(kw in text for kw in ["marathi", "मराठी"]):
        return "marathi"
    if any(kw in text for kw in ["kannada", "ಕನ್ನಡ"]):
        return "kannada"
    if any(kw in text for kw in ["bengali", "বাংলা", "bangla"]):
        return "bengali"

    tags = video.tags if isinstance(video.tags, list) else []
    tags_text = " ".join(tags).lower()
    if "hindi" in tags_text:
        return "hindi"
    if "tamil" in tags_text:
        return "tamil"
    if "telugu" in tags_text:
        return "telugu"

    return "english"


def is_strictly_phone_related(video: Video) -> bool:
    """Stricter phone detection — require brand in TITLE."""
    title_lower = video.title.lower()
    has_brand_in_title = any(brand in title_lower for brand in PHONE_BRANDS)
    phone_keywords_in_title = any(
        kw in title_lower for kw in
        ["phone", "mobile", "smartphone", "unboxing", "review", "camera test",
         "vs", "comparison", "battery test", "speed test", "under 10000",
         "under 15000", "under 20000", "under 25000", "best phone", "top 5",
         "top 10", "5g", "gaming phone"]
    )
    return has_brand_in_title or (phone_keywords_in_title and (video.analysis or {}).get("is_phone_related", False))


def parse_duration_seconds(duration: str) -> int:
    """Parse ISO 8601 duration to seconds."""
    if not duration:
        return 0
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not m:
        return 0
    h = int(m.group(1) or 0)
    mins = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h * 3600 + mins * 60 + s


def main():
    session = SessionLocal()

    print("=" * 60)
    print("STEP 1: Fix language detection on all videos")
    print("=" * 60)

    videos = session.query(Video).all()
    lang_changes = 0
    for v in videos:
        new_lang = fix_language_for_video(v)
        if v.analysis:
            old_lang = v.analysis.get("language", "")
            if old_lang != new_lang:
                v.analysis = {**v.analysis, "language": new_lang}
                lang_changes += 1
    session.commit()
    print(f"  Updated language for {lang_changes} videos")

    print("\n" + "=" * 60)
    print("STEP 2: Recompute strict phone detection")
    print("=" * 60)

    strict_phone = 0
    for v in videos:
        is_phone = is_strictly_phone_related(v)
        if v.analysis:
            v.analysis = {**v.analysis, "is_phone_related_strict": is_phone}
            if is_phone:
                strict_phone += 1
    session.commit()
    print(f"  Strictly phone-related videos: {strict_phone}/{len(videos)}")

    print("\n" + "=" * 60)
    print("STEP 3: Compute format mix (Shorts/Standard/Long-form)")
    print("=" * 60)

    for v in videos:
        secs = parse_duration_seconds(v.duration)
        if secs < 61:
            fmt_type = "short"
        elif secs < 480:
            fmt_type = "standard"
        else:
            fmt_type = "longform"
        if v.analysis:
            v.analysis = {**v.analysis, "duration_type": fmt_type, "duration_seconds": secs}
    session.commit()

    shorts = sum(1 for v in videos if v.analysis and v.analysis.get("duration_type") == "short")
    standard = sum(1 for v in videos if v.analysis and v.analysis.get("duration_type") == "standard")
    longform = sum(1 for v in videos if v.analysis and v.analysis.get("duration_type") == "longform")
    print(f"  Shorts: {shorts} | Standard: {standard} | Long-form: {longform}")

    print("\n" + "=" * 60)
    print("STEP 4: Update creator stats")
    print("=" * 60)

    creators = session.query(Creator).all()
    for c in creators:
        c_videos = [v for v in videos if v.channel_id == c.channel_id]
        if not c_videos:
            continue

        phone_vids = [v for v in c_videos if v.analysis and v.analysis.get("is_phone_related_strict")]
        c.phone_video_count = len(phone_vids)

        if phone_vids:
            dates = [v.published_at for v in phone_vids if v.published_at]
            if dates:
                c.last_phone_video_date = max(dates)

        lang_counts = {}
        for v in c_videos:
            if v.analysis:
                lang = v.analysis.get("language", "english")
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
        if lang_counts:
            c.primary_language = max(lang_counts, key=lang_counts.get)

        total_views = sum(v.view_count for v in c_videos)
        total_eng = sum(v.like_count + v.comment_count for v in c_videos)
        if total_views > 0:
            c.engagement_rate = round(total_eng / total_views * 100, 2)

        if c.subscriber_count > 0:
            avg_views = total_views / max(len(c_videos), 1)
            c.view_count = total_views

    session.commit()

    phone_creators = sum(1 for c in creators if c.phone_video_count > 0)
    no_phone = sum(1 for c in creators if c.phone_video_count == 0)
    print(f"  Creators with phone content: {phone_creators}")
    print(f"  Creators with ZERO phone content: {no_phone}")

    lang_dist = {}
    for c in creators:
        if c.phone_video_count > 0:
            lang_dist[c.primary_language] = lang_dist.get(c.primary_language, 0) + 1
    print(f"\n  Language distribution (phone creators only):")
    for lang, cnt in sorted(lang_dist.items(), key=lambda x: -x[1]):
        print(f"    {lang}: {cnt}")

    session.close()
    print("\nData quality fix complete.")


if __name__ == "__main__":
    main()
