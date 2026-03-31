"""
Expand the creator database with new categories and more creators.
Runs in phases, respecting YouTube API quota (10K units/day).
Waits for quota reset if needed, then continues.

Categories to add:
- Fashion & Lifestyle (India)
- Beauty & Skincare (India)
- Electronics & Gadgets (broader than just phones)

Run: python -m scripts.expand_database
"""

import sys, os, time
from datetime import datetime, timezone, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import init_db, SessionLocal, Creator, Video
from backend.app.youtube.client import (
    search_channels, get_channel_details, get_playlist_videos,
    get_video_details,
)
from backend.app.youtube.quota_tracker import (
    print_quota_summary, get_remaining_quota, get_today_usage,
)
from backend.app.analyzer.content_analyzer import analyze_transcript
from scripts.seed_database import classify_tier, estimate_cost

PHONE_QUERIES_EXTRA = [
    "phone review under 10000 hindi",
    "best 5g phone 2026 india",
    "poco vs redmi comparison",
    "iqoo review hindi",
    "nothing phone review india",
    "motorola review hindi",
    "phone review gujarati",
    "phone review malayalam",
    "infinix tecno review hindi",
    "honor phone review india",
    "oneplus nord review",
    "samsung galaxy a series review",
    "vivo v series review hindi",
    "oppo reno review india",
    "phone long term review hindi",
    "phone camera night mode test",
    "phone gaming test india",
    "foldable phone review india",
    "flagship killer 2026 india",
    "best camera phone 2026",
]


def wait_for_quota_reset():
    """Wait until quota resets (midnight Pacific = 7:00 UTC / 12:30 IST)."""
    now = datetime.now(timezone.utc)
    pacific_now = now - timedelta(hours=7)
    next_midnight_pacific = pacific_now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    reset_utc = next_midnight_pacific + timedelta(hours=7)
    wait_seconds = (reset_utc - now).total_seconds()

    if wait_seconds <= 0:
        print("Quota should have reset already.")
        return

    hours = wait_seconds / 3600
    print(f"\n[QUOTA EXHAUSTED] Waiting {hours:.1f} hours for reset at {reset_utc.strftime('%H:%M UTC')}...")
    print(f"Will resume at approximately {reset_utc.strftime('%Y-%m-%d %H:%M UTC')}")

    while wait_seconds > 0:
        sleep_chunk = min(wait_seconds, 300)
        time.sleep(sleep_chunk)
        wait_seconds -= sleep_chunk
        remaining_hours = wait_seconds / 3600
        if remaining_hours > 0 and int(remaining_hours * 12) % 12 == 0:
            print(f"  ... {remaining_hours:.1f} hours remaining")

    print("Quota reset! Resuming...")


def run_search_phase(queries, category_label):
    """Search for creators using given queries."""
    print(f"\n{'='*60}")
    print(f"SEARCH: {category_label}")
    print(f"{'='*60}")

    session = SessionLocal()
    existing_ids = {r[0] for r in session.query(Creator.channel_id).all()}
    new_channels = []

    for i, query in enumerate(queries):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"[QUOTA LOW] {remaining} units left. Stopping searches.")
            break

        print(f"  [{i+1}/{len(queries)}] '{query}' ...")
        channels = search_channels(query, max_results=50, region_code="IN")
        for ch in channels:
            if ch["channel_id"] not in existing_ids:
                existing_ids.add(ch["channel_id"])
                new_channels.append(ch["channel_id"])

        time.sleep(0.3)

    print(f"  Found {len(new_channels)} new channels")

    if new_channels:
        print(f"  Fetching details...")
        details = get_channel_details(new_channels)
        count = 0
        for ch in details:
            tier = classify_tier(ch["subscriber_count"])
            cost_min, cost_max = estimate_cost(tier)
            creator = Creator(
                channel_id=ch["channel_id"],
                channel_title=ch["title"],
                description=ch["description"][:2000],
                subscriber_count=ch["subscriber_count"],
                video_count=ch["video_count"],
                view_count=ch["view_count"],
                thumbnail_url=ch["thumbnail_url"],
                country=ch["country"],
                custom_url=ch["custom_url"],
                published_at=ch["published_at"],
                tier=tier,
                estimated_cost_min=cost_min,
                estimated_cost_max=cost_max,
                category_affinity=category_label.lower(),
            )
            session.add(creator)
            count += 1
        session.commit()
        print(f"  Saved {count} new creators")

    session.close()
    print_quota_summary()
    return new_channels


def run_video_phase(min_subs=1000, max_creators=200):
    """Pull videos for creators that don't have video data yet."""
    print(f"\n{'='*60}")
    print(f"VIDEOS: Pulling for creators without video data")
    print(f"{'='*60}")

    session = SessionLocal()
    creators = (
        session.query(Creator)
        .filter(Creator.subscriber_count >= min_subs)
        .order_by(Creator.subscriber_count.desc())
        .all()
    )

    channels_with_videos = {
        r[0] for r in session.query(Video.channel_id).distinct().all()
    }

    to_process = [c for c in creators if c.channel_id not in channels_with_videos][:max_creators]
    print(f"  {len(to_process)} creators need video data")

    total_videos = 0
    for i, creator in enumerate(to_process):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"[QUOTA LOW] {remaining} units. Stopping.")
            break

        uploads_pid = f"UU{creator.channel_id[2:]}"
        video_ids = get_playlist_videos(uploads_pid, max_results=30)
        if not video_ids:
            continue

        videos = get_video_details(video_ids)
        for v in videos:
            existing = session.query(Video).filter_by(video_id=v["video_id"]).first()
            if existing:
                continue

            eng_rate = 0.0
            if v["view_count"] > 0:
                eng_rate = (v["like_count"] + v["comment_count"]) / v["view_count"] * 100

            video = Video(
                video_id=v["video_id"],
                channel_id=v["channel_id"],
                title=v["title"],
                description=v["description"][:2000],
                published_at=v["published_at"],
                view_count=v["view_count"],
                like_count=v["like_count"],
                comment_count=v["comment_count"],
                duration=v["duration"],
                thumbnail_url=v["thumbnail_url"],
                tags=v["tags"][:20] if v["tags"] else [],
                has_caption=v["caption_available"],
                engagement_rate=round(eng_rate, 2),
            )
            session.add(video)
            total_videos += 1

        session.commit()
        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{len(to_process)} creators, {total_videos} videos")

        time.sleep(0.15)

    session.commit()
    print(f"  Total new videos: {total_videos}")
    print_quota_summary()
    session.close()


def run_analysis_phase():
    """Analyze all unanalyzed videos."""
    print(f"\n{'='*60}")
    print(f"ANALYSIS: Processing unanalyzed videos")
    print(f"{'='*60}")

    session = SessionLocal()
    videos = session.query(Video).filter(Video.is_analyzed == False).all()
    print(f"  {len(videos)} videos to analyze")

    phone_count = 0
    for i, v in enumerate(videos):
        tags = v.tags if isinstance(v.tags, list) else []
        result = analyze_transcript(v.title, v.description[:1000], v.caption_text or "", tags)
        v.is_analyzed = True
        v.analysis = result
        if result.get("is_phone_related"):
            phone_count += 1

        if (i + 1) % 1000 == 0:
            session.commit()
            print(f"  {i+1}/{len(videos)}, {phone_count} phone-related")

    session.commit()
    print(f"  Analyzed: {len(videos)}, phone-related: {phone_count}")
    session.close()


def run_marketplace_extraction():
    """Extract marketplace links from new videos."""
    import re
    MARKETPLACE_PATTERNS = {
        "flipkart": [r"flipkart\.com", r"fkrt\.it", r"dl\.flipkart"],
        "amazon": [r"amazon\.in", r"amzn\.to", r"amazon\.co\.in"],
        "meesho": [r"meesho\.com"],
        "myntra": [r"myntra\.com"],
    }

    session = SessionLocal()
    videos = session.query(Video).filter(Video.is_analyzed == True).all()
    updated = 0
    for v in videos:
        if v.analysis and "marketplace_links" not in v.analysis:
            desc = f"{v.title} {v.description or ''}".lower()
            found = []
            for marketplace, patterns in MARKETPLACE_PATTERNS.items():
                for p in patterns:
                    if re.search(p, desc):
                        found.append(marketplace)
                        break
            v.analysis = {**v.analysis, "marketplace_links": found}
            updated += 1

    session.commit()
    print(f"  Marketplace links extracted for {updated} new videos")
    session.close()


def run_stats_update():
    """Update creator stats after new data."""
    from scripts.fix_data_quality import fix_language_for_video, is_strictly_phone_related, parse_duration_seconds

    session = SessionLocal()
    creators = session.query(Creator).all()

    for c in creators:
        c_videos = session.query(Video).filter(Video.channel_id == c.channel_id).all()
        if not c_videos:
            continue

        phone_vids = [v for v in c_videos if v.analysis and v.analysis.get("is_phone_related_strict", v.analysis.get("is_phone_related"))]
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

    session.commit()
    session.close()
    print("  Creator stats updated")


def print_db_summary():
    session = SessionLocal()
    total_c = session.query(Creator).count()
    phone_c = session.query(Creator).filter(Creator.phone_video_count > 0).count()
    total_v = session.query(Video).count()
    analyzed = session.query(Video).filter(Video.is_analyzed == True).count()

    print(f"\n{'='*60}")
    print(f"DATABASE SUMMARY")
    print(f"{'='*60}")
    print(f"  Total creators: {total_c}")
    print(f"  Phone creators: {phone_c}")
    print(f"  Total videos: {total_v}")
    print(f"  Analyzed: {analyzed}")

    for tier in ["mega", "macro", "mid", "micro", "nano"]:
        cnt = session.query(Creator).filter(Creator.tier == tier, Creator.phone_video_count > 0).count()
        if cnt > 0:
            print(f"  {tier}: {cnt}")

    lang_counts = {}
    for c in session.query(Creator).filter(Creator.phone_video_count > 0).all():
        lang = c.primary_language or "unknown"
        lang_counts[lang] = lang_counts.get(lang, 0) + 1
    print(f"  Languages: {dict(sorted(lang_counts.items(), key=lambda x: -x[1]))}")

    session.close()


def main():
    init_db()

    print("#" * 60)
    print("# CREATOE — DATABASE EXPANSION")
    print("# Expanding creators and categories")
    print("#" * 60)

    remaining = get_remaining_quota()
    print(f"\nCurrent quota remaining: {remaining}")

    if remaining < 600:
        print("Quota too low for searches today. Will pull videos for existing creators instead.")
        run_video_phase(min_subs=500, max_creators=100)
        run_analysis_phase()
        run_marketplace_extraction()
        run_stats_update()
        print_db_summary()
        print_quota_summary()

        print("\nWaiting for quota reset to continue with searches...")
        wait_for_quota_reset()
        remaining = get_remaining_quota()
        print(f"Post-reset quota: {remaining}")

    if remaining >= 600:
        run_search_phase(PHONE_QUERIES_EXTRA, "smartphone")
        run_video_phase(min_subs=1000, max_creators=300)

    run_analysis_phase()
    run_marketplace_extraction()
    run_stats_update()
    print_db_summary()
    print_quota_summary()

    print("\nEXPANSION COMPLETE.")


if __name__ == "__main__":
    main()
