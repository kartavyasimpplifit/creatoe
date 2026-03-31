"""
Batch analyze video transcripts using rule-based content analysis.

This runs locally, no API cost. Processes all videos with captions.

Run: python -m scripts.analyze_videos
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import SessionLocal, Creator, Video
from backend.app.analyzer.content_analyzer import analyze_transcript
from backend.app.scorer.scoring_engine import score_all_creators


def analyze_all_videos(batch_size: int = 5000):
    """Run content analysis on all videos with transcripts."""
    print("="*60)
    print("CONTENT ANALYSIS — Rule-Based Extraction")
    print("="*60)

    session = SessionLocal()

    videos = (
        session.query(Video)
        .filter(Video.is_analyzed == False)
        .limit(batch_size)
        .all()
    )

    print(f"Videos to analyze: {len(videos)}")

    analyzed = 0
    phone_related = 0

    for i, video in enumerate(videos):
        text = video.caption_text or ""
        tags = video.tags if isinstance(video.tags, list) else []

        result = analyze_transcript(
            title=video.title,
            description=video.description[:1000],
            transcript=text[:10000],
            tags=tags,
        )

        video.is_analyzed = True
        video.analysis = result

        analyzed += 1
        if result.get("is_phone_related"):
            phone_related += 1

        if (i + 1) % 500 == 0:
            session.commit()
            print(f"  Processed {i+1}/{len(videos)}, {phone_related} phone-related")

    session.commit()
    print(f"\nAnalysis complete: {analyzed} videos processed, {phone_related} phone-related")
    session.close()


def update_creator_stats():
    """Update creator-level stats based on analyzed videos."""
    print("\n" + "="*60)
    print("UPDATING CREATOR STATS")
    print("="*60)

    session = SessionLocal()
    creators = session.query(Creator).all()

    for creator in creators:
        videos = (
            session.query(Video)
            .filter(Video.channel_id == creator.channel_id)
            .all()
        )

        if not videos:
            continue

        phone_videos = [
            v for v in videos
            if v.is_analyzed and v.analysis and v.analysis.get("is_phone_related")
        ]
        creator.phone_video_count = len(phone_videos)

        if phone_videos:
            dates = [v.published_at for v in phone_videos if v.published_at]
            if dates:
                creator.last_phone_video_date = max(dates)

        total_views = sum(v.view_count for v in videos)
        total_eng = sum(v.like_count + v.comment_count for v in videos)
        if total_views > 0:
            creator.engagement_rate = round(total_eng / total_views * 100, 2)

        languages = {}
        for v in videos:
            if v.is_analyzed and v.analysis:
                lang = v.analysis.get("language", "unknown")
                languages[lang] = languages.get(lang, 0) + 1
        if languages:
            creator.primary_language = max(languages, key=languages.get)

    session.commit()
    print(f"Updated stats for {len(creators)} creators.")
    session.close()


def main():
    analyze_all_videos()
    update_creator_stats()

    print("\n" + "="*60)
    print("SCORING ALL CREATORS")
    print("="*60)
    score_all_creators()

    session = SessionLocal()
    top = (
        session.query(Creator)
        .filter(Creator.combined_score > 0)
        .order_by(Creator.combined_score.desc())
        .limit(20)
        .all()
    )
    print(f"\nTop 20 creators by combined score:")
    print(f"{'Name':<40} {'Subs':>10} {'AF':>5} {'CP':>5} {'Combined':>8} {'Lang':<10}")
    print("-" * 85)
    for c in top:
        subs = f"{c.subscriber_count:,}"
        print(f"{c.channel_title[:39]:<40} {subs:>10} {c.audience_fit_score:>5.1f} {c.content_proof_score:>5.1f} {c.combined_score:>8.1f} {c.primary_language or 'unk':<10}")

    session.close()


if __name__ == "__main__":
    main()
