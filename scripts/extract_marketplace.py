"""
Extract marketplace links (Flipkart/Amazon/Meesho/Myntra) from video descriptions.
Aggregate per creator. Zero API cost — uses existing data.
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.database import SessionLocal, Creator, Video

MARKETPLACE_PATTERNS = {
    "flipkart": [r"flipkart\.com", r"fkrt\.it", r"dl\.flipkart"],
    "amazon": [r"amazon\.in", r"amzn\.to", r"amazon\.co\.in"],
    "meesho": [r"meesho\.com"],
    "myntra": [r"myntra\.com"],
    "croma": [r"croma\.com"],
    "jiomart": [r"jiomart\.com"],
    "tatacliq": [r"tatacliq\.com"],
}


def detect_marketplaces(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for marketplace, patterns in MARKETPLACE_PATTERNS.items():
        for p in patterns:
            if re.search(p, text_lower):
                found.append(marketplace)
                break
    return found


def main():
    session = SessionLocal()
    print("=" * 60)
    print("EXTRACTING MARKETPLACE LINKS")
    print("=" * 60)

    videos = session.query(Video).filter(Video.is_analyzed == True).all()
    print(f"Total videos: {len(videos)}")

    marketplace_counts = {}
    videos_updated = 0

    for v in videos:
        desc = v.description or ""
        title = v.title or ""
        full_text = f"{title} {desc}"

        marketplaces = detect_marketplaces(full_text)
        if v.analysis:
            v.analysis = {**v.analysis, "marketplace_links": marketplaces}
            videos_updated += 1

        for m in marketplaces:
            marketplace_counts[m] = marketplace_counts.get(m, 0) + 1

    session.commit()
    print(f"\nVideos updated: {videos_updated}")
    print(f"Marketplace distribution:")
    for m, c in sorted(marketplace_counts.items(), key=lambda x: -x[1]):
        print(f"  {m}: {c}")

    print("\n" + "=" * 60)
    print("AGGREGATING PER CREATOR")
    print("=" * 60)

    creators = session.query(Creator).all()
    for c in creators:
        c_videos = [v for v in videos if v.channel_id == c.channel_id]

        fk = 0
        amz = 0
        other = 0
        fk_dates = []
        amz_dates = []

        for v in c_videos:
            if not v.analysis:
                continue
            mlinks = v.analysis.get("marketplace_links", [])
            if "flipkart" in mlinks:
                fk += 1
                if v.published_at:
                    fk_dates.append(v.published_at)
            if "amazon" in mlinks:
                amz += 1
                if v.published_at:
                    amz_dates.append(v.published_at)
            if any(m in mlinks for m in ["meesho", "myntra", "croma", "jiomart"]):
                other += 1

        primary = "none"
        if fk > amz and fk > 0:
            primary = "flipkart"
        elif amz > fk and amz > 0:
            primary = "amazon"
        elif fk > 0 and amz > 0:
            primary = "both"

        if c.description is None:
            c.description = ""

    session.commit()

    fk_creators = sum(1 for c in creators if any(
        v.analysis and "flipkart" in v.analysis.get("marketplace_links", [])
        for v in videos if v.channel_id == c.channel_id
    ))
    amz_creators = sum(1 for c in creators if any(
        v.analysis and "amazon" in v.analysis.get("marketplace_links", [])
        for v in videos if v.channel_id == c.channel_id
    ))

    print(f"Creators with Flipkart links: {fk_creators}")
    print(f"Creators with Amazon links: {amz_creators}")

    session.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
