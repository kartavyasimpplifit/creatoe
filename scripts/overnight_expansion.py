"""
Overnight expansion — waits for quota reset then expands the database.
Designed to run unattended while the founder sleeps.

Adds more phone creators across languages + categories.
"""
import sys, os, time, json
from datetime import datetime, timezone, timedelta
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import init_db, SessionLocal, Creator, Video
from backend.app.youtube.client import (
    search_channels, get_channel_details, get_playlist_videos, get_video_details,
)
from backend.app.youtube.quota_tracker import (
    print_quota_summary, get_remaining_quota, _load_usage, _save_usage, _today_key,
)
from backend.app.analyzer.content_analyzer import analyze_transcript
from scripts.seed_database import classify_tier, estimate_cost

EXPANSION_QUERIES = [
    "phone review under 10000 hindi",
    "best 5g phone 2026 india",
    "poco vs redmi comparison hindi",
    "iqoo review hindi",
    "nothing phone review india",
    "motorola review hindi",
    "phone review gujarati",
    "phone review malayalam",
    "infinix tecno review hindi",
    "honor phone review india",
    "oneplus nord review hindi",
    "samsung galaxy a series review hindi",
    "vivo v series review hindi",
    "oppo reno review india",
    "flagship killer 2026 india",
    "best camera phone under 20000",
    "best gaming phone under 25000",
    "phone comparison tamil 2026",
    "smartphone review telugu 2026",
    "phone unboxing bengali 2026",
]


def wait_for_fresh_quota():
    """Wait until quota resets (midnight Pacific)."""
    remaining = get_remaining_quota()
    if remaining >= 5000:
        print(f"Quota looks fresh ({remaining} remaining). Proceeding.")
        return

    print(f"Current quota: {remaining}. Waiting for reset...")
    now = datetime.now(timezone.utc)
    pacific = now - timedelta(hours=7)
    next_midnight = pacific.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    reset_utc = next_midnight + timedelta(hours=7)
    wait_secs = max(0, (reset_utc - now).total_seconds()) + 120

    hours = wait_secs / 3600
    print(f"Sleeping {hours:.1f} hours until {reset_utc.strftime('%H:%M UTC')} + 2 min buffer...")

    while wait_secs > 0:
        chunk = min(wait_secs, 600)
        time.sleep(chunk)
        wait_secs -= chunk
        if wait_secs > 0:
            print(f"  {wait_secs/3600:.1f} hours remaining...")

    data = _load_usage()
    today = _today_key()
    if today not in data:
        data[today] = {"total": 0, "calls": {}}
        _save_usage(data)

    print(f"Quota reset! New day: {today}. Remaining: {get_remaining_quota()}")


def search_and_save(queries, label):
    """Search for creators and save to DB."""
    session = SessionLocal()
    existing = {r[0] for r in session.query(Creator.channel_id).all()}
    new_ids = []

    for i, q in enumerate(queries):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"  [QUOTA LOW] Stopping searches at {remaining} remaining.")
            break

        print(f"  [{i+1}/{len(queries)}] '{q}'...")
        channels = search_channels(q, max_results=50, region_code="IN")
        for ch in channels:
            if ch["channel_id"] not in existing:
                existing.add(ch["channel_id"])
                new_ids.append(ch["channel_id"])
        time.sleep(0.3)

    print(f"  Found {len(new_ids)} new channels")

    if new_ids:
        details = get_channel_details(new_ids)
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
                category_affinity=label,
            )
            session.add(creator)
        session.commit()
        print(f"  Saved {len(details)} creators")

    session.close()


def pull_videos_for_new_creators(max_creators=300):
    """Pull videos for creators missing video data."""
    session = SessionLocal()
    channels_with_videos = {r[0] for r in session.query(Video.channel_id).distinct().all()}
    creators = (
        session.query(Creator)
        .filter(Creator.subscriber_count >= 500)
        .order_by(Creator.subscriber_count.desc())
        .all()
    )
    to_process = [c for c in creators if c.channel_id not in channels_with_videos][:max_creators]
    print(f"  {len(to_process)} creators need videos")

    total = 0
    for i, c in enumerate(to_process):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"  [QUOTA LOW] Stopping at {remaining}.")
            break

        pid = f"UU{c.channel_id[2:]}"
        vids = get_playlist_videos(pid, max_results=30)
        if not vids:
            continue

        details = get_video_details(vids)
        for v in details:
            if session.query(Video).filter_by(video_id=v["video_id"]).first():
                continue
            eng = (v["like_count"] + v["comment_count"]) / max(v["view_count"], 1) * 100
            session.add(Video(
                video_id=v["video_id"], channel_id=v["channel_id"],
                title=v["title"], description=v["description"][:2000],
                published_at=v["published_at"], view_count=v["view_count"],
                like_count=v["like_count"], comment_count=v["comment_count"],
                duration=v["duration"], thumbnail_url=v["thumbnail_url"],
                tags=v["tags"][:20] if v["tags"] else [],
                has_caption=v["caption_available"], engagement_rate=round(eng, 2),
            ))
            total += 1

        session.commit()
        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{len(to_process)}, {total} videos")
        time.sleep(0.1)

    session.commit()
    print(f"  Total new videos: {total}")
    session.close()


def analyze_new_videos():
    """Analyze unanalyzed videos."""
    session = SessionLocal()
    videos = session.query(Video).filter(Video.is_analyzed == False).all()
    print(f"  {len(videos)} to analyze")
    for i, v in enumerate(videos):
        tags = v.tags if isinstance(v.tags, list) else []
        result = analyze_transcript(v.title, v.description[:1000], v.caption_text or "", tags)
        v.is_analyzed = True
        v.analysis = result
        if (i + 1) % 500 == 0:
            session.commit()
    session.commit()
    print(f"  Analyzed {len(videos)} videos")
    session.close()


def update_stats():
    """Update creator-level stats."""
    session = SessionLocal()
    creators = session.query(Creator).all()
    for c in creators:
        vids = session.query(Video).filter(Video.channel_id == c.channel_id).all()
        if not vids:
            continue
        phone = [v for v in vids if v.analysis and v.analysis.get("is_phone_related_strict", v.analysis.get("is_phone_related"))]
        c.phone_video_count = len(phone)
        if phone:
            dates = [v.published_at for v in phone if v.published_at]
            if dates:
                c.last_phone_video_date = max(dates)
        langs = {}
        for v in vids:
            if v.analysis:
                l = v.analysis.get("language", "english")
                langs[l] = langs.get(l, 0) + 1
        if langs:
            c.primary_language = max(langs, key=langs.get)
        tv = sum(v.view_count for v in vids)
        te = sum(v.like_count + v.comment_count for v in vids)
        if tv > 0:
            c.engagement_rate = round(te / tv * 100, 2)
    session.commit()
    session.close()


def main():
    init_db()
    print("=" * 60)
    print("CREATOE — OVERNIGHT DATABASE EXPANSION")
    print(f"Started: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print("=" * 60)

    wait_for_fresh_quota()

    print("\n--- PHASE 1: Search for more phone creators ---")
    search_and_save(EXPANSION_QUERIES, "smartphone")
    print_quota_summary()

    print("\n--- PHASE 2: Pull videos ---")
    pull_videos_for_new_creators(max_creators=300)
    print_quota_summary()

    print("\n--- PHASE 3: Analyze ---")
    analyze_new_videos()

    print("\n--- PHASE 4: Update stats ---")
    update_stats()

    session = SessionLocal()
    print(f"\n{'='*60}")
    print(f"FINAL DATABASE:")
    print(f"  Creators: {session.query(Creator).count()}")
    print(f"  Phone creators: {session.query(Creator).filter(Creator.phone_video_count > 0).count()}")
    print(f"  Videos: {session.query(Video).count()}")
    print(f"  Analyzed: {session.query(Video).filter(Video.is_analyzed == True).count()}")
    session.close()
    print_quota_summary()
    print(f"\nCompleted: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")


if __name__ == "__main__":
    main()
