"""
Seed the creator database with Indian smartphone YouTube creators.

This script:
1. Searches YouTube for Indian smartphone/tech creators
2. Pulls channel details and stats
3. Pulls video metadata for top creators
4. Downloads auto-captions where available
5. Stores everything in SQLite

Run: python -m scripts.seed_database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import init_db, SessionLocal, Creator, Video
from backend.app.youtube.client import (
    search_channels, get_channel_details, get_playlist_videos,
    get_video_details, get_video_captions,
)
from backend.app.youtube.quota_tracker import print_quota_summary, get_remaining_quota
import time

SEARCH_QUERIES = [
    "smartphone review hindi",
    "mobile phone unboxing india",
    "phone comparison hindi",
    "budget phone review hindi",
    "best phone under 15000",
    "best phone under 20000",
    "best phone under 25000",
    "5g phone review india",
    "phone camera test hindi",
    "gaming phone review hindi",
    "realme review hindi",
    "redmi review hindi",
    "samsung review hindi",
    "oneplus review hindi",
    "vivo review hindi",
    "oppo review hindi",
    "iphone review hindi",
    "phone unboxing telugu",
    "smartphone review telugu",
    "mobile review tamil",
    "smartphone review tamil",
    "phone review english india",
    "tech review india",
    "mobile comparison india",
    "phone speed test india",
    "phone battery test hindi",
    "camera comparison smartphone hindi",
    "phone review marathi",
    "budget smartphone india 2025",
    "budget smartphone india 2026",
    "phone review kannada",
    "phone review bengali",
    "tech youtube india",
    "gadget review hindi",
    "phone durability test india",
    "smartphone tips tricks hindi",
    "phone accessories india",
    "flipkart phone review",
    "amazon phone review india",
    "which phone to buy india",
]


def classify_tier(sub_count: int) -> str:
    if sub_count >= 1_000_000:
        return "mega"
    elif sub_count >= 500_000:
        return "macro"
    elif sub_count >= 100_000:
        return "mid"
    elif sub_count >= 10_000:
        return "micro"
    return "nano"


def estimate_cost(tier: str) -> tuple[int, int]:
    costs = {
        "nano": (5_000, 15_000),
        "micro": (15_000, 50_000),
        "mid": (50_000, 300_000),
        "macro": (300_000, 1_000_000),
        "mega": (1_000_000, 5_000_000),
    }
    return costs.get(tier, (5_000, 15_000))


def step1_search_creators():
    """Search YouTube for smartphone creators in India."""
    print("\n" + "="*60)
    print("STEP 1: Searching for Indian smartphone creators")
    print("="*60)

    session = SessionLocal()
    all_channel_ids = set()

    existing = session.query(Creator.channel_id).all()
    for row in existing:
        all_channel_ids.add(row[0])
    print(f"Already have {len(all_channel_ids)} creators in database.")

    new_channels = []
    for i, query in enumerate(SEARCH_QUERIES):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"[QUOTA LOW] Remaining: {remaining}. Stopping searches.")
            break

        print(f"  [{i+1}/{len(SEARCH_QUERIES)}] Searching: '{query}' ...")
        channels = search_channels(query, max_results=50, region_code="IN")
        for ch in channels:
            if ch["channel_id"] not in all_channel_ids:
                all_channel_ids.add(ch["channel_id"])
                new_channels.append(ch["channel_id"])

        time.sleep(0.2)

    print(f"\nFound {len(new_channels)} new unique channels.")
    print_quota_summary()
    session.close()
    return list(all_channel_ids)


def step2_get_channel_details(channel_ids: list[str]):
    """Fetch detailed stats for all discovered channels."""
    print("\n" + "="*60)
    print(f"STEP 2: Getting details for {len(channel_ids)} channels")
    print("="*60)

    session = SessionLocal()
    existing_ids = {r[0] for r in session.query(Creator.channel_id).all()}
    new_ids = [cid for cid in channel_ids if cid not in existing_ids]

    if not new_ids:
        print("All channels already in database.")
        session.close()
        return

    print(f"  Fetching details for {len(new_ids)} new channels...")
    details = get_channel_details(new_ids)

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
        )
        session.add(creator)
        count += 1

    session.commit()
    print(f"  Saved {count} creators to database.")
    print_quota_summary()
    session.close()


def step3_pull_videos(min_subscribers: int = 1000, max_creators: int = 500):
    """Pull recent videos for top creators."""
    print("\n" + "="*60)
    print(f"STEP 3: Pulling videos for top creators (min {min_subscribers} subs)")
    print("="*60)

    session = SessionLocal()
    creators = (
        session.query(Creator)
        .filter(Creator.subscriber_count >= min_subscribers)
        .order_by(Creator.subscriber_count.desc())
        .limit(max_creators)
        .all()
    )

    existing_channels_with_videos = {
        r[0] for r in session.query(Video.channel_id).distinct().all()
    }

    creators_to_process = [
        c for c in creators if c.channel_id not in existing_channels_with_videos
    ]

    print(f"  {len(creators)} creators meet threshold.")
    print(f"  {len(creators_to_process)} need video data.")

    total_videos = 0
    for i, creator in enumerate(creators_to_process):
        remaining = get_remaining_quota()
        if remaining < 600:
            print(f"\n[QUOTA LOW] Remaining: {remaining}. Stopping video pulls.")
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

            avg_views = creator.view_count / max(creator.video_count, 1)
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

        if (i + 1) % 10 == 0:
            print(f"  Processed {i+1}/{len(creators_to_process)} creators, {total_videos} videos total")

        time.sleep(0.1)

    session.commit()
    print(f"\n  Total new videos saved: {total_videos}")
    print_quota_summary()
    session.close()


def step4_pull_captions(batch_size: int = 500):
    """Download auto-captions for videos that have them."""
    print("\n" + "="*60)
    print("STEP 4: Downloading YouTube auto-captions")
    print("="*60)

    session = SessionLocal()
    videos = (
        session.query(Video)
        .filter(Video.has_caption == True, Video.caption_text == "")
        .limit(batch_size)
        .all()
    )

    print(f"  {len(videos)} videos need captions.")

    success = 0
    for i, video in enumerate(videos):
        caption = get_video_captions(video.video_id)
        if caption and len(caption) > 50:
            video.caption_text = caption[:50000]
            success += 1

        if (i + 1) % 50 == 0:
            session.commit()
            print(f"  Processed {i+1}/{len(videos)}, {success} captions found")

        time.sleep(0.3)

    session.commit()
    print(f"\n  Captions downloaded: {success}/{len(videos)}")
    session.close()


def print_db_stats():
    """Print database statistics."""
    session = SessionLocal()
    total_creators = session.query(Creator).count()
    total_videos = session.query(Video).count()
    videos_with_captions = session.query(Video).filter(Video.caption_text != "").count()
    analyzed_videos = session.query(Video).filter(Video.is_analyzed == True).count()

    tier_counts = {}
    for tier in ["nano", "micro", "mid", "macro", "mega"]:
        tier_counts[tier] = session.query(Creator).filter(Creator.tier == tier).count()

    print(f"\n{'='*50}")
    print("DATABASE STATS")
    print(f"{'='*50}")
    print(f"Creators:           {total_creators}")
    print(f"Videos:             {total_videos}")
    print(f"With captions:      {videos_with_captions}")
    print(f"Analyzed:           {analyzed_videos}")
    print(f"\nCreator tiers:")
    for tier, count in tier_counts.items():
        print(f"  {tier:<8} {count:>6}")
    print(f"{'='*50}\n")
    session.close()


def main():
    print("\n" + "#"*60)
    print("# CREATOR INTELLIGENCE — DATABASE SEEDER")
    print("# Category: Smartphones (India)")
    print("#"*60)

    init_db()
    print("Database initialized.")

    channel_ids = step1_search_creators()
    step2_get_channel_details(channel_ids)
    step3_pull_videos(min_subscribers=1000, max_creators=500)
    step4_pull_captions(batch_size=500)

    print_db_stats()
    print_quota_summary()
    print("SEEDING COMPLETE. Run again tomorrow to continue with remaining quota.")


if __name__ == "__main__":
    main()
