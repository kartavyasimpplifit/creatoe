"""
Creator Intelligence Graph — FastAPI Backend v2

Product-aware matching with 3-dimension scoring, demand intelligence,
competitive intel, campaign builder, and creator audit.
"""

import csv
import io
from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from backend.app.models.database import SessionLocal, Creator, Video, init_db
from backend.app.scraper.product_scraper import scrape_product, ProductData
from backend.app.scorer.scoring_engine import score_all_for_product, score_creator_for_product

app = FastAPI(title="CreatorLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class ProductRequest(BaseModel):
    url: str


class CampaignRequest(BaseModel):
    creator_ids: list[int]
    product_url: Optional[str] = ""


class CompareRequest(BaseModel):
    creator_ids: list[int]
    product_url: Optional[str] = ""


# ── Stats ────────────────────────────────────────────────

@app.get("/api/stats")
def get_stats():
    session = SessionLocal()
    total_creators = session.query(Creator).count()
    phone_creators = session.query(Creator).filter(Creator.phone_video_count > 0, Creator.subscriber_count >= 1000).count()
    total_videos = session.query(Video).count()
    analyzed = session.query(Video).filter(Video.is_analyzed == True).count()

    tiers = {}
    for tier in ["mega", "macro", "mid", "micro", "nano"]:
        tiers[tier] = session.query(Creator).filter(
            Creator.tier == tier, Creator.phone_video_count > 0, Creator.subscriber_count >= 1000
        ).count()

    languages = {}
    for c in session.query(Creator).filter(Creator.phone_video_count > 0, Creator.subscriber_count >= 1000).all():
        lang = c.primary_language or "unknown"
        languages[lang] = languages.get(lang, 0) + 1

    session.close()
    return {
        "total_creators": total_creators,
        "phone_creators": phone_creators,
        "total_videos": total_videos,
        "analyzed_videos": analyzed,
        "tiers": tiers,
        "languages": languages,
    }


# ── Product Analysis + Creator Matching ──────────────────

@app.post("/api/analyze")
def analyze_product_and_match(req: ProductRequest):
    """
    Main endpoint: paste a product URL, get matched creators with full intelligence.
    """
    product = scrape_product(req.url)
    result = score_all_for_product(product, limit=200)

    session = SessionLocal()

    lang_coverage = {}
    for c in result["creators"]:
        lang = c["creator"]["primary_language"] or "unknown"
        lang_coverage[lang] = lang_coverage.get(lang, 0) + 1

    all_phone_creators = session.query(Creator).filter(
        Creator.phone_video_count > 0, Creator.subscriber_count >= 1000
    ).all()
    total_by_lang = {}
    for c in all_phone_creators:
        lang = c.primary_language or "unknown"
        total_by_lang[lang] = total_by_lang.get(lang, 0) + 1

    lang_gaps = []
    state_map = {
        "hindi": "UP, Bihar, MP, Rajasthan, Delhi, Haryana",
        "tamil": "Tamil Nadu",
        "telugu": "Andhra Pradesh, Telangana",
        "bengali": "West Bengal",
        "marathi": "Maharashtra",
        "kannada": "Karnataka",
        "malayalam": "Kerala",
        "gujarati": "Gujarat",
        "punjabi": "Punjab",
    }
    state_market_size = {
        "hindi": 450_000_000, "tamil": 80_000_000, "telugu": 85_000_000,
        "bengali": 100_000_000, "marathi": 120_000_000, "kannada": 65_000_000,
        "malayalam": 35_000_000, "gujarati": 65_000_000, "punjabi": 30_000_000,
    }
    for lang, states in state_map.items():
        count = total_by_lang.get(lang, 0)
        market = state_market_size.get(lang, 0)
        if count < 5 and market > 30_000_000:
            lang_gaps.append({
                "language": lang,
                "creator_count": count,
                "states": states,
                "market_population": market,
                "opportunity": f"Only {count} {lang.title()} creators cover {product.brand}. {states} has {market//1_000_000}M smartphone users.",
            })

    brand_video_counts = {}
    competitor_brands = []
    from backend.app.scorer.scoring_engine import COMPETING_BRANDS
    competitors = COMPETING_BRANDS.get(product.brand, [])

    for brand_name in [product.brand] + competitors[:5]:
        count = 0
        for v in session.query(Video).filter(Video.is_analyzed == True).all():
            if v.analysis:
                for p in v.analysis.get("products_mentioned", []):
                    if p.get("brand", "").lower() == brand_name.lower():
                        count += 1
                        break
        brand_video_counts[brand_name] = count

    flipkart_videos = 0
    amazon_videos = 0
    for v in session.query(Video).filter(Video.is_analyzed == True).all():
        desc = (v.description or "").lower()
        if "flipkart" in desc or "flipkart.com" in desc:
            flipkart_videos += 1
        if "amazon" in desc or "amazon.in" in desc or "amzn" in desc:
            amazon_videos += 1

    our_brand_videos = brand_video_counts.get(product.brand, 0)
    top_competitor = max(
        [(b, c) for b, c in brand_video_counts.items() if b != product.brand],
        key=lambda x: x[1],
        default=("", 0)
    )

    demand_intel = {
        "current_brand_videos": our_brand_videos,
        "top_competitor": {"brand": top_competitor[0], "videos": top_competitor[1]},
        "brand_video_counts": brand_video_counts,
        "flipkart_associated": flipkart_videos,
        "amazon_associated": amazon_videos,
        "language_coverage": lang_coverage,
        "language_gaps": lang_gaps,
        "activation_scenario": {
            "creators_to_activate": 30,
            "estimated_budget_min": sum(c.get("cost_estimate", {}).get("min", 15000) for c in result["creators"][:30]),
            "estimated_budget_max": sum(c.get("cost_estimate", {}).get("max", 75000) for c in result["creators"][:30]),
            "estimated_reach": sum(c.get("predicted_views", 0) for c in result["creators"][:30]),
            "estimated_cpv": round(
                sum(c.get("cost_estimate", {}).get("min", 15000) + c.get("cost_estimate", {}).get("max", 75000) for c in result["creators"][:30]) / 2
                / max(sum(c.get("predicted_views", 1) for c in result["creators"][:30]), 1),
                2
            ),
        },
    }

    if top_competitor[1] > our_brand_videos:
        gap = top_competitor[1] - our_brand_videos
        demand_intel["competitive_gap"] = {
            "message": f"{top_competitor[0]} has {top_competitor[1]} creator videos vs your {our_brand_videos}. Gap: {gap} videos.",
            "creators_needed": gap,
            "estimated_cost_to_close": gap * 50000,
        }

    session.close()

    return {
        "product": product.to_dict(),
        "total_matched": result["total_matched"],
        "total_disqualified": result["total_disqualified"],
        "creators": result["creators"],
        "demand_intelligence": demand_intel,
    }


# ── Creator Detail ───────────────────────────────────────

@app.get("/api/creator/{creator_id}")
def get_creator_detail(creator_id: int, product_url: Optional[str] = None):
    session = SessionLocal()
    creator = session.query(Creator).filter(Creator.id == creator_id).first()
    if not creator:
        session.close()
        raise HTTPException(404, "Creator not found")

    videos = (
        session.query(Video)
        .filter(Video.channel_id == creator.channel_id, Video.is_analyzed == True)
        .order_by(Video.view_count.desc())
        .limit(50)
        .all()
    )

    phone_videos = [
        v for v in videos
        if v.analysis and v.analysis.get("is_phone_related_strict", v.analysis.get("is_phone_related"))
    ]

    format_counts = {}
    brands_reviewed = {}
    for v in phone_videos:
        if v.analysis:
            fmt = v.analysis.get("format", "review")
            format_counts[fmt] = format_counts.get(fmt, 0) + 1
            for p in v.analysis.get("products_mentioned", []):
                b = p.get("brand", "")
                if b:
                    brands_reviewed[b] = brands_reviewed.get(b, 0) + 1

    shorts = sum(1 for v in videos if v.analysis and v.analysis.get("duration_type") == "short")
    longform = sum(1 for v in videos if v.analysis and v.analysis.get("duration_type") == "longform")

    score_data = None
    if product_url:
        product = scrape_product(product_url)
        score_data = score_creator_for_product(creator, product, session)

    result = {
        "id": creator.id,
        "channel_id": creator.channel_id,
        "name": creator.channel_title,
        "thumbnail_url": creator.thumbnail_url,
        "subscriber_count": creator.subscriber_count,
        "video_count": creator.video_count,
        "view_count": creator.view_count,
        "tier": creator.tier,
        "primary_language": creator.primary_language,
        "engagement_rate": creator.engagement_rate,
        "custom_url": creator.custom_url,
        "country": creator.country,
        "phone_video_count": len(phone_videos),
        "estimated_cost_min": creator.estimated_cost_min,
        "estimated_cost_max": creator.estimated_cost_max,
        "content_fingerprint": {
            "format_distribution": format_counts,
            "strongest_format": max(format_counts, key=format_counts.get) if format_counts else "review",
            "brands_reviewed": dict(sorted(brands_reviewed.items(), key=lambda x: -x[1])[:10]),
            "phone_video_count": len(phone_videos),
            "total_video_count": len(videos),
            "shorts_count": shorts,
            "longform_count": longform,
            "avg_phone_engagement": round(
                sum(v.engagement_rate for v in phone_videos) / max(len(phone_videos), 1), 2
            ),
        },
        "videos": [
            {
                "video_id": v.video_id,
                "title": v.title,
                "thumbnail_url": v.thumbnail_url,
                "published_at": v.published_at,
                "view_count": v.view_count,
                "like_count": v.like_count,
                "comment_count": v.comment_count,
                "engagement_rate": v.engagement_rate,
                "duration": v.duration,
                "analysis": v.analysis or {},
            }
            for v in videos[:30]
        ],
        "phone_videos": [
            {
                "video_id": v.video_id,
                "title": v.title,
                "thumbnail_url": v.thumbnail_url,
                "published_at": v.published_at,
                "view_count": v.view_count,
                "like_count": v.like_count,
                "engagement_rate": v.engagement_rate,
                "analysis": v.analysis or {},
            }
            for v in phone_videos[:20]
        ],
        "score_data": score_data,
    }

    session.close()
    return result


# ── Compare ──────────────────────────────────────────────

@app.post("/api/compare")
def compare_creators(req: CompareRequest):
    if len(req.creator_ids) < 2:
        raise HTTPException(400, "Need at least 2 creators")

    session = SessionLocal()
    product = scrape_product(req.product_url) if req.product_url else None

    results = []
    for cid in req.creator_ids[:5]:
        creator = session.query(Creator).filter(Creator.id == cid).first()
        if not creator:
            continue

        score_data = score_creator_for_product(creator, product, session) if product else None

        videos = session.query(Video).filter(
            Video.channel_id == creator.channel_id, Video.is_analyzed == True
        ).all()
        phone_vids = [v for v in videos if v.analysis and v.analysis.get("is_phone_related_strict", v.analysis.get("is_phone_related"))]

        formats = {}
        for v in phone_vids:
            if v.analysis:
                fmt = v.analysis.get("format", "review")
                formats[fmt] = formats.get(fmt, 0) + 1

        results.append({
            "id": creator.id,
            "name": creator.channel_title,
            "thumbnail_url": creator.thumbnail_url,
            "subscriber_count": creator.subscriber_count,
            "tier": creator.tier,
            "primary_language": creator.primary_language,
            "engagement_rate": creator.engagement_rate,
            "phone_video_count": len(phone_vids),
            "estimated_cost_min": creator.estimated_cost_min,
            "estimated_cost_max": creator.estimated_cost_max,
            "format_strengths": formats,
            "score_data": score_data,
        })

    overlap_warnings = []
    for i, a in enumerate(results):
        for b in results[i+1:]:
            if a["primary_language"] == b["primary_language"] and a["tier"] == b["tier"]:
                overlap_warnings.append(
                    f"{a['name'][:20]} and {b['name'][:20]} likely share audience "
                    f"(both {a['primary_language']}, {a['tier']} tier)"
                )

    session.close()
    return {"creators": results, "overlap_warnings": overlap_warnings}


# ── Campaign Builder ─────────────────────────────────────

@app.post("/api/campaign/build")
def build_campaign(req: CampaignRequest):
    session = SessionLocal()
    product = scrape_product(req.product_url) if req.product_url else None

    creators_data = []
    total_min = 0
    total_max = 0
    total_reach = 0
    lang_mix = {}

    for cid in req.creator_ids:
        creator = session.query(Creator).filter(Creator.id == cid).first()
        if not creator:
            continue

        score_data = score_creator_for_product(creator, product, session) if product else None
        cost_min = score_data["cost_estimate"]["min"] if score_data else creator.estimated_cost_min
        cost_max = score_data["cost_estimate"]["max"] if score_data else creator.estimated_cost_max
        predicted_views = score_data["predicted_views"] if score_data else 0

        total_min += cost_min
        total_max += cost_max
        total_reach += predicted_views

        lang = creator.primary_language or "unknown"
        lang_mix[lang] = lang_mix.get(lang, 0) + 1

        yt_url = f"https://youtube.com/{creator.custom_url}" if creator.custom_url else f"https://youtube.com/channel/{creator.channel_id}"

        creators_data.append({
            "id": creator.id,
            "name": creator.channel_title,
            "thumbnail_url": creator.thumbnail_url,
            "subscriber_count": creator.subscriber_count,
            "tier": creator.tier,
            "primary_language": lang,
            "cost_min": cost_min,
            "cost_max": cost_max,
            "predicted_views": predicted_views,
            "cpv": round((cost_min + cost_max) / 2 / max(predicted_views, 1), 2),
            "youtube_url": yt_url,
            "match_score": score_data["match_score"] if score_data else 0,
        })

    avg_cpv = round((total_min + total_max) / 2 / max(total_reach, 1), 2)

    session.close()
    return {
        "creators": creators_data,
        "summary": {
            "creator_count": len(creators_data),
            "budget_min": total_min,
            "budget_max": total_max,
            "estimated_reach": total_reach,
            "avg_cpv": avg_cpv,
            "language_mix": lang_mix,
        },
        "product": product.to_dict() if product else None,
    }


@app.post("/api/campaign/export")
def export_campaign_csv(req: CampaignRequest):
    campaign = build_campaign(req)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Creator", "Tier", "Language", "Subscribers", "Cost Min (INR)", "Cost Max (INR)",
                      "Predicted Views", "CPV (INR)", "Match Score", "YouTube URL"])

    for c in campaign["creators"]:
        writer.writerow([
            c["name"], c["tier"], c["primary_language"], c["subscriber_count"],
            c["cost_min"], c["cost_max"], c["predicted_views"], c["cpv"],
            c["match_score"], c["youtube_url"],
        ])

    writer.writerow([])
    writer.writerow(["SUMMARY"])
    s = campaign["summary"]
    writer.writerow(["Total Creators", s["creator_count"]])
    writer.writerow(["Budget Range", f"INR {s['budget_min']:,} - {s['budget_max']:,}"])
    writer.writerow(["Estimated Reach", f"{s['estimated_reach']:,} views"])
    writer.writerow(["Avg CPV", f"INR {s['avg_cpv']:.2f}"])
    writer.writerow(["Language Mix", str(s["language_mix"])])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campaign_plan.csv"},
    )


# ── Creator Audit (CSV Upload) ───────────────────────────

@app.post("/api/audit/upload")
async def audit_creator_list(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")

    urls = []
    for line in text.strip().split("\n"):
        line = line.strip().strip(",").strip('"')
        if "youtube.com" in line or "youtu.be" in line:
            urls.append(line)
        elif line.startswith("UC") or line.startswith("@"):
            urls.append(line)

    session = SessionLocal()
    results = {"found": [], "not_found": [], "total_uploaded": len(urls)}

    for url_or_id in urls:
        channel_id = url_or_id
        if "youtube.com/channel/" in url_or_id:
            channel_id = url_or_id.split("youtube.com/channel/")[-1].split("/")[0].split("?")[0]
        elif "youtube.com/@" in url_or_id:
            handle = url_or_id.split("youtube.com/@")[-1].split("/")[0].split("?")[0]
            creator = session.query(Creator).filter(Creator.custom_url == f"@{handle}").first()
            if creator:
                channel_id = creator.channel_id
            else:
                results["not_found"].append(url_or_id)
                continue

        creator = session.query(Creator).filter(Creator.channel_id == channel_id).first()
        if not creator:
            creator = session.query(Creator).filter(Creator.custom_url.contains(channel_id)).first()

        if creator:
            status = "active"
            if not creator.last_phone_video_date:
                status = "inactive"
            elif "2024" in creator.last_phone_video_date or "2023" in creator.last_phone_video_date:
                status = "declining"

            results["found"].append({
                "name": creator.channel_title,
                "channel_id": creator.channel_id,
                "subscribers": creator.subscriber_count,
                "tier": creator.tier,
                "phone_videos": creator.phone_video_count,
                "language": creator.primary_language,
                "engagement_rate": creator.engagement_rate,
                "status": status,
                "last_phone_video": creator.last_phone_video_date,
            })
        else:
            results["not_found"].append(url_or_id)

    active = sum(1 for c in results["found"] if c["status"] == "active")
    declining = sum(1 for c in results["found"] if c["status"] == "declining")
    inactive = sum(1 for c in results["found"] if c["status"] == "inactive")

    results["summary"] = {
        "matched": len(results["found"]),
        "not_found": len(results["not_found"]),
        "active": active,
        "declining": declining,
        "inactive": inactive,
    }

    session.close()
    return results


# ── Outreach Email Draft ─────────────────────────────────

@app.get("/api/creator/{creator_id}/outreach")
def draft_outreach_email(creator_id: int, product_url: Optional[str] = None):
    session = SessionLocal()
    creator = session.query(Creator).filter(Creator.id == creator_id).first()
    if not creator:
        session.close()
        raise HTTPException(404, "Creator not found")

    product = scrape_product(product_url) if product_url else None

    phone_videos = session.query(Video).filter(
        Video.channel_id == creator.channel_id,
        Video.is_analyzed == True,
    ).order_by(Video.view_count.desc()).limit(5).all()

    recent_video = phone_videos[0] if phone_videos else None
    recent_title = recent_video.title[:50] if recent_video else "your recent content"
    recent_views = f"{recent_video.view_count:,}" if recent_video else "strong"

    product_name = f"{product.brand} {product.model}" if product else "our latest smartphone"
    price_text = f"INR {product.price:,}" if product and product.price > 0 else ""
    features_text = ", ".join(product.key_features[:3]) if product else ""

    cost_mid = (creator.estimated_cost_min + creator.estimated_cost_max) // 2

    email = {
        "to": creator.channel_title,
        "subject": f"Collaboration Opportunity — {product_name} Review",
        "body": (
            f"Hi {creator.channel_title},\n\n"
            f"I've been following your channel and particularly enjoyed \"{recent_title}\" "
            f"which resonated with {recent_views} viewers.\n\n"
            f"We're promoting the {product_name}"
            + (f" ({price_text})" if price_text else "")
            + (f" featuring {features_text}" if features_text else "")
            + f" and believe your audience aligns perfectly with our target buyers.\n\n"
            f"What we're looking for:\n"
            f"• Format: Dedicated review video\n"
            f"• Budget: INR {creator.estimated_cost_min:,} - {creator.estimated_cost_max:,}\n"
            f"• Timeline: Within the next 2 weeks\n\n"
            f"Would you be open to discussing this further?\n\n"
            f"Best regards"
        ),
        "youtube_url": f"https://youtube.com/{creator.custom_url}" if creator.custom_url else f"https://youtube.com/channel/{creator.channel_id}",
    }

    session.close()
    return email
