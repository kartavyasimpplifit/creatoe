"""
Scoring Engine v2 — Dynamic per-product matching.

Three dimensions:
- Brand + Price Fit (30%): Does this creator review this brand at this price point?
- Feature Relevance (40%): Format match, recency, language, content mix (Shorts/Long-form)
- Creator Quality (30%): Engagement health, fraud signals, trend direction

Each creator is scored DYNAMICALLY against the specific product.
Different products produce completely different rankings.
"""

import re
from datetime import datetime, timezone, timedelta
from backend.app.models.database import SessionLocal, Creator, Video
from backend.app.scraper.product_scraper import ProductData

COMPETING_BRANDS = {
    "Realme": ["Redmi", "Samsung", "POCO", "Infinix", "Tecno", "Motorola"],
    "Redmi": ["Realme", "Samsung", "POCO", "Infinix", "Tecno", "Motorola"],
    "Samsung": ["Realme", "Redmi", "Vivo", "OPPO", "OnePlus", "Motorola"],
    "Apple": ["Samsung", "OnePlus", "Google", "Nothing"],
    "OnePlus": ["Samsung", "Apple", "iQOO", "Realme", "Nothing"],
    "Vivo": ["OPPO", "Samsung", "Realme", "Redmi"],
    "OPPO": ["Vivo", "Samsung", "Realme", "Redmi"],
    "POCO": ["Realme", "Redmi", "iQOO", "Motorola"],
    "iQOO": ["POCO", "OnePlus", "Realme", "Samsung"],
    "Motorola": ["Realme", "Redmi", "Samsung", "POCO"],
    "Nothing": ["OnePlus", "Samsung", "Google"],
    "Google": ["Apple", "Samsung", "OnePlus", "Nothing"],
    "Infinix": ["Tecno", "Realme", "Redmi"],
    "Tecno": ["Infinix", "Realme", "Redmi"],
}

PRICE_BANDS = {
    "budget": (0, 15000),
    "mid": (15000, 25000),
    "mid-premium": (25000, 40000),
    "premium": (40000, 80000),
    "ultra-premium": (80000, 999999),
}

ADJACENT_BANDS = {
    "budget": ["mid"],
    "mid": ["budget", "mid-premium"],
    "mid-premium": ["mid", "premium"],
    "premium": ["mid-premium", "ultra-premium"],
    "ultra-premium": ["premium"],
}

TIER_PRICE_ALIGNMENT = {
    "budget": {"micro": 20, "mid": 18, "nano": 12, "macro": 8, "mega": 5},
    "mid": {"mid": 20, "micro": 15, "macro": 15, "nano": 8, "mega": 8},
    "mid-premium": {"mid": 18, "macro": 20, "micro": 10, "mega": 12, "nano": 5},
    "premium": {"macro": 20, "mega": 18, "mid": 12, "micro": 5, "nano": 3},
    "ultra-premium": {"mega": 20, "macro": 18, "mid": 8, "micro": 3, "nano": 2},
}

COST_BY_TIER = {
    "nano": (5000, 15000),
    "micro": (15000, 75000),
    "mid": (75000, 300000),
    "macro": (300000, 1000000),
    "mega": (1000000, 5000000),
}


def _get_creator_videos(session, channel_id: str) -> list[Video]:
    return (
        session.query(Video)
        .filter(Video.channel_id == channel_id, Video.is_analyzed == True)
        .all()
    )


def _get_phone_videos(videos: list[Video]) -> list[Video]:
    return [
        v for v in videos
        if v.analysis and v.analysis.get("is_phone_related_strict", v.analysis.get("is_phone_related"))
    ]


def _extract_brands_from_videos(phone_videos: list[Video]) -> dict[str, int]:
    brand_counts = {}
    for v in phone_videos:
        if not v.analysis:
            continue
        for p in v.analysis.get("products_mentioned", []):
            b = p.get("brand", "")
            if b:
                brand_counts[b] = brand_counts.get(b, 0) + 1
    return brand_counts


def _extract_price_bands_from_videos(phone_videos: list[Video]) -> dict[str, int]:
    band_counts = {}
    for v in phone_videos:
        if not v.analysis:
            continue
        for p in v.analysis.get("products_mentioned", []):
            pr = p.get("price_range", "unknown")
            if pr != "unknown":
                band_counts[pr] = band_counts.get(pr, 0) + 1
    return band_counts


def _is_recent(published_at: str, days: int) -> bool:
    if not published_at:
        return False
    try:
        dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - dt).days <= days
    except (ValueError, TypeError):
        return False


def _recency_weight(published_at: str) -> float:
    if not published_at:
        return 0.3
    try:
        dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        days = (datetime.now(timezone.utc) - dt).days
        if days <= 90:
            return 3.0
        elif days <= 180:
            return 2.0
        elif days <= 365:
            return 1.0
        return 0.3
    except (ValueError, TypeError):
        return 0.3


def compute_brand_price_fit(creator: Creator, product: ProductData, phone_videos: list[Video]) -> dict:
    """D1: Brand + Price Fit (30% weight)."""
    score = 0.0
    reasons = []

    brand_counts = _extract_brands_from_videos(phone_videos)
    target_brand = product.brand

    if target_brand in brand_counts:
        count = brand_counts[target_brand]
        recent_brand = [
            v for v in phone_videos
            if v.analysis and any(
                p.get("brand") == target_brand
                for p in v.analysis.get("products_mentioned", [])
            ) and _is_recent(v.published_at, 180)
        ]
        if recent_brand:
            score += 40
            reasons.append(f"Reviewed {target_brand} {len(recent_brand)}x in last 6 months")
        else:
            score += 20
            reasons.append(f"Has reviewed {target_brand} ({count} videos, not recent)")
    else:
        competitors = COMPETING_BRANDS.get(target_brand, [])
        competing_count = sum(brand_counts.get(c, 0) for c in competitors)
        if competing_count > 0:
            score += 15
            comp_names = [c for c in competitors if brand_counts.get(c, 0) > 0][:3]
            reasons.append(f"Reviews competing brands: {', '.join(comp_names)}")
        else:
            reasons.append(f"No {target_brand} or competitor reviews found")

    price_band = product.price_band
    tier_bonus = TIER_PRICE_ALIGNMENT.get(price_band, {}).get(creator.tier, 10)
    score += tier_bonus
    if tier_bonus >= 18:
        reasons.append(f"{creator.tier.title()} tier aligns well with {price_band} segment")

    price_bands = _extract_price_bands_from_videos(phone_videos)
    if price_bands:
        band_map = {
            "under_10k": "budget", "10k_15k": "budget",
            "15k_20k": "mid", "20k_25k": "mid",
            "25k_35k": "mid-premium", "35k_50k": "premium",
            "above_50k": "ultra-premium",
        }
        matched_band_videos = sum(
            cnt for band, cnt in price_bands.items()
            if band_map.get(band) == price_band
        )
        total_priced = sum(price_bands.values())
        if total_priced > 0:
            ratio = matched_band_videos / total_priced
            if ratio > 0.5:
                score += 20
                reasons.append(f"{ratio*100:.0f}% of priced content in {price_band} range")
            elif ratio > 0.2:
                score += 10
                reasons.append(f"{ratio*100:.0f}% of priced content in {price_band} range")

    return {"score": min(score, 100), "reasons": reasons}


def compute_feature_relevance(creator: Creator, product: ProductData, phone_videos: list[Video], all_videos: list[Video]) -> dict:
    """D2: Feature Relevance (40% weight)."""
    score = 0.0
    reasons = []
    concerns = []

    formats = {}
    for v in phone_videos:
        if v.analysis:
            fmt = v.analysis.get("format", "review")
            formats[fmt] = formats.get(fmt, 0) + 1

    hero = product.hero_feature.lower()
    format_feature_map = {
        "camera": ["camera_test", "comparison"],
        "display": ["review", "comparison"],
        "performance": ["speed_test", "comparison", "review"],
        "battery": ["review", "tips_tricks"],
        "5g": ["review", "comparison", "first_impressions"],
        "gaming": ["speed_test", "review"],
        "charging": ["review", "tips_tricks"],
    }
    best_formats = format_feature_map.get(hero, ["review"])
    has_format_match = any(formats.get(f, 0) > 0 for f in best_formats)
    if has_format_match:
        score += 25
        matched = [f for f in best_formats if formats.get(f, 0) > 0]
        reasons.append(f"Creates {', '.join(matched)} content (ideal for {hero} phones)")
    elif formats:
        score += 10
        top_fmt = max(formats, key=formats.get)
        reasons.append(f"Primarily creates {top_fmt} content")

    recent_phone = [v for v in phone_videos if _is_recent(v.published_at, 90)]
    if recent_phone:
        score += 20
        reasons.append(f"Active: {len(recent_phone)} phone videos in last 90 days")
    elif any(_is_recent(v.published_at, 180) for v in phone_videos):
        score += 10
        reasons.append("Somewhat active (phone content in last 6 months)")
    else:
        concerns.append("No phone content in 6+ months")

    if creator.primary_language == "hindi":
        score += 15
        reasons.append("Hindi content (largest Indian market)")
    elif creator.primary_language in ("tamil", "telugu", "bengali", "marathi", "kannada"):
        score += 18
        reasons.append(f"{creator.primary_language.title()} content (regional market)")
    elif creator.primary_language == "english":
        score += 8
        reasons.append("English content")

    shorts_count = sum(1 for v in all_videos if v.analysis and v.analysis.get("duration_type") == "short")
    longform_count = sum(1 for v in all_videos if v.analysis and v.analysis.get("duration_type") == "longform")
    total = max(len(all_videos), 1)

    has_both = shorts_count > 0 and longform_count > 0
    if has_both:
        score += 12
        reasons.append("Hybrid creator (Shorts + Long-form) — best for reach + conversion")
    elif longform_count / total > 0.5:
        score += 8
        reasons.append("Long-form focused — strong for conversion")
    elif shorts_count / total > 0.8:
        score -= 5
        concerns.append("Shorts-dominant — low conversion potential")

    return {"score": min(max(score, 0), 100), "reasons": reasons, "concerns": concerns}


def compute_creator_quality(creator: Creator, phone_videos: list[Video], all_videos: list[Video]) -> dict:
    """D3: Creator Quality (30% weight)."""
    score = 0.0
    reasons = []
    concerns = []
    fraud_flags = []

    if creator.subscriber_count > 0:
        avg_views = sum(v.view_count for v in all_videos[-10:]) / max(len(all_videos[-10:]), 1)
        view_sub_ratio = avg_views / creator.subscriber_count
        if view_sub_ratio > 0.10:
            score += 25
            reasons.append(f"Healthy view/sub ratio ({view_sub_ratio*100:.0f}%)")
        elif view_sub_ratio > 0.03:
            score += 15
            reasons.append(f"Decent view/sub ratio ({view_sub_ratio*100:.0f}%)")
        elif view_sub_ratio > 0.01:
            score += 8
        else:
            fraud_flags.append(f"Low view/sub ratio ({view_sub_ratio*100:.1f}%) — possible inactive or inflated subs")

    if len(all_videos) >= 6:
        recent_3 = sorted(all_videos, key=lambda v: v.published_at or "", reverse=True)[:3]
        older_3 = sorted(all_videos, key=lambda v: v.published_at or "", reverse=True)[3:6]
        recent_eng = sum(v.engagement_rate for v in recent_3) / 3
        older_eng = sum(v.engagement_rate for v in older_3) / 3

        if older_eng > 0:
            trend = recent_eng / older_eng
            if trend > 1.2:
                score += 20
                reasons.append(f"Rising engagement ({trend:.1f}x recent vs older)")
            elif trend > 0.8:
                score += 12
                reasons.append("Stable engagement trend")
            else:
                score += 3
                concerns.append(f"Declining engagement ({trend:.1f}x, dropping)")
        else:
            score += 10

    eng = creator.engagement_rate
    if eng > 5.0:
        score += 20
        reasons.append(f"Excellent engagement rate ({eng:.1f}%)")
    elif eng > 3.0:
        score += 15
        reasons.append(f"Strong engagement ({eng:.1f}%)")
    elif eng > 1.5:
        score += 10
    elif eng > 0.5:
        score += 5
    else:
        concerns.append(f"Low engagement rate ({eng:.1f}%)")

    if phone_videos:
        phone_eng = sum(v.engagement_rate for v in phone_videos) / len(phone_videos)
        all_eng = sum(v.engagement_rate for v in all_videos) / max(len(all_videos), 1)
        if all_eng > 0 and phone_eng > all_eng * 1.3:
            score += 15
            reasons.append("Phone content outperforms their average — audience wants this")

    if creator.subscriber_count >= 5000:
        score += 5
    if creator.subscriber_count >= 100000:
        score += 5

    return {
        "score": min(score, 100),
        "reasons": reasons,
        "concerns": concerns,
        "fraud_flags": fraud_flags,
    }


def get_brand_evidence(phone_videos: list[Video], brand: str) -> list[dict]:
    """Get specific videos where this creator reviewed the target brand."""
    evidence = []
    for v in phone_videos:
        if not v.analysis:
            continue
        for p in v.analysis.get("products_mentioned", []):
            if p.get("brand", "").lower() == brand.lower():
                evidence.append({
                    "video_id": v.video_id,
                    "title": v.title,
                    "views": v.view_count,
                    "engagement": v.engagement_rate,
                    "published_at": v.published_at,
                    "thumbnail": v.thumbnail_url,
                    "brand": p.get("brand"),
                    "model": p.get("model", ""),
                })
                break
    return sorted(evidence, key=lambda x: x["views"], reverse=True)[:5]


TIER_AVG_CPV = {"mega": 5.0, "macro": 8.0, "mid": 15.0, "micro": 25.0, "nano": 40.0}

STATE_MAP = {
    "hindi": "North India", "tamil": "Tamil Nadu", "telugu": "AP & Telangana",
    "bengali": "West Bengal", "kannada": "Karnataka", "malayalam": "Kerala",
    "marathi": "Maharashtra", "gujarati": "Gujarat", "punjabi": "Punjab",
}


def _compute_insight_flags(
    creator: Creator, product: ProductData,
    phone_videos: list, all_videos: list,
    brand_counts: dict, brand_evidence: list,
    predicted_cpv: float, format_mix: str,
) -> list[dict]:
    flags = []
    target = product.brand

    recent_brand_count = len([
        v for v in phone_videos
        if v.analysis and any(
            p.get("brand") == target for p in v.analysis.get("products_mentioned", [])
        ) and _is_recent(v.published_at, 180)
    ])

    if recent_brand_count >= 5:
        flags.append({"label": "Brand saturated", "type": "amber"})
    elif recent_brand_count == 0 and brand_counts:
        competitors = COMPETING_BRANDS.get(target, [])
        if any(brand_counts.get(c, 0) > 0 for c in competitors):
            flags.append({"label": "Fresh voice", "type": "green"})

    unique_brands = len([b for b, cnt in brand_counts.items() if cnt > 0])
    if unique_brands >= 4:
        flags.append({"label": "Multi-brand", "type": "blue"})
    elif unique_brands <= 1 and brand_counts:
        top_brand = max(brand_counts, key=brand_counts.get) if brand_counts else ""
        total_vids = sum(brand_counts.values())
        if total_vids > 0 and brand_counts.get(top_brand, 0) / total_vids > 0.7:
            flags.append({"label": "Single-brand", "type": "amber"})

    shorts = sum(1 for v in all_videos if v.analysis and v.analysis.get("duration_type") == "short")
    if len(all_videos) > 0 and shorts / len(all_videos) > 0.6:
        flags.append({"label": "Shorts-heavy", "type": "amber"})

    formats = {}
    for v in phone_videos:
        if v.analysis:
            fmt = v.analysis.get("format", "review")
            formats[fmt] = formats.get(fmt, 0) + 1
    if formats:
        top_fmt = max(formats, key=formats.get)
        total_fmt = sum(formats.values())
        if total_fmt > 0 and formats[top_fmt] / total_fmt > 0.6 and total_fmt >= 3:
            label_map = {
                "camera_test": "Camera specialist", "comparison": "Comparison expert",
                "unboxing": "Unboxing specialist", "review": "Review focused",
                "first_impressions": "First-look specialist",
            }
            flags.append({"label": label_map.get(top_fmt, f"{top_fmt.replace('_',' ').title()} specialist"), "type": "blue"})

    lang = creator.primary_language or ""
    if lang and lang != "english" and lang in STATE_MAP:
        flags.append({"label": f"{STATE_MAP[lang]} reach", "type": "blue"})

    tier_avg = TIER_AVG_CPV.get(creator.tier, 15.0)
    if predicted_cpv > tier_avg * 2 and predicted_cpv > 0:
        flags.append({"label": "High CPV", "type": "amber"})

    return flags


def score_creator_for_product(creator: Creator, product: ProductData, session=None) -> dict:
    """Score a single creator against a specific product. Returns full breakdown."""
    close_session = False
    if session is None:
        session = SessionLocal()
        close_session = True

    all_videos = _get_creator_videos(session, creator.channel_id)
    phone_videos = _get_phone_videos(all_videos)

    has_recent_phone = any(_is_recent(v.published_at, 180) for v in phone_videos)
    if not has_recent_phone and phone_videos:
        pass
    if not phone_videos:
        if close_session:
            session.close()
        return {
            "match_score": 0,
            "disqualified": True,
            "disqualified_reason": "No phone-related content found",
            "dimensions": {},
            "brand_evidence": [],
            "predicted_views": 0,
            "predicted_cpv": 0,
        }

    if creator.subscriber_count < 1000:
        if close_session:
            session.close()
        return {
            "match_score": 0,
            "disqualified": True,
            "disqualified_reason": "Below minimum subscriber threshold (1,000)",
            "dimensions": {},
            "brand_evidence": [],
            "predicted_views": 0,
            "predicted_cpv": 0,
        }

    d1 = compute_brand_price_fit(creator, product, phone_videos)
    d2 = compute_feature_relevance(creator, product, phone_videos, all_videos)
    d3 = compute_creator_quality(creator, phone_videos, all_videos)

    combined = d1["score"] * 0.30 + d2["score"] * 0.40 + d3["score"] * 0.30

    brand_evidence = get_brand_evidence(phone_videos, product.brand)

    recent_phone = sorted(phone_videos, key=lambda v: v.published_at or "", reverse=True)[:5]
    predicted_views = int(sum(v.view_count for v in recent_phone) / max(len(recent_phone), 1))

    cost_min, cost_max = COST_BY_TIER.get(creator.tier, (15000, 75000))
    cost_mid = (cost_min + cost_max) / 2
    predicted_cpv = round(cost_mid / max(predicted_views, 1), 2)

    shorts_count = sum(1 for v in all_videos if v.analysis and v.analysis.get("duration_type") == "short")
    longform_count = sum(1 for v in all_videos if v.analysis and v.analysis.get("duration_type") == "longform")
    total = max(len(all_videos), 1)
    if shorts_count > 0 and longform_count > 0:
        format_mix = "hybrid"
    elif longform_count / total > 0.5:
        format_mix = "longform"
    elif shorts_count / total > 0.8:
        format_mix = "shorts_only"
    else:
        format_mix = "balanced"

    all_reasons = d1["reasons"] + d2["reasons"] + d3["reasons"]
    all_concerns = d2.get("concerns", []) + d3.get("concerns", [])

    fk_vids = [v for v in all_videos if v.analysis and "flipkart" in v.analysis.get("marketplace_links", [])]
    amz_vids = [v for v in all_videos if v.analysis and "amazon" in v.analysis.get("marketplace_links", [])]
    marketplace = {
        "flipkart_videos": len(fk_vids),
        "amazon_videos": len(amz_vids),
        "primary": "flipkart" if len(fk_vids) > len(amz_vids) else "amazon" if len(amz_vids) > len(fk_vids) else "none",
        "last_flipkart": max((v.published_at for v in fk_vids if v.published_at), default=""),
        "last_amazon": max((v.published_at for v in amz_vids if v.published_at), default=""),
    }
    marketplace_timeline = []
    for v in sorted(all_videos, key=lambda x: x.published_at or "", reverse=True)[:20]:
        if v.analysis:
            mlinks = v.analysis.get("marketplace_links", [])
            brands = [p.get("brand", "") for p in v.analysis.get("products_mentioned", [])]
            if mlinks:
                marketplace_timeline.append({
                    "date": v.published_at or "",
                    "title": v.title[:60],
                    "marketplace": mlinks,
                    "brands": brands[:3],
                    "views": v.view_count,
                    "video_id": v.video_id,
                })

    brand_counts = _extract_brands_from_videos(phone_videos)
    flags = _compute_insight_flags(
        creator, product, phone_videos, all_videos,
        brand_counts, brand_evidence, predicted_cpv, format_mix
    )

    if close_session:
        session.close()

    return {
        "match_score": round(combined, 1),
        "disqualified": False,
        "dimensions": {
            "brand_price_fit": {"score": d1["score"], "reasons": d1["reasons"], "weight": "30%"},
            "feature_relevance": {"score": d2["score"], "reasons": d2["reasons"], "weight": "40%"},
            "creator_quality": {"score": d3["score"], "reasons": d3["reasons"], "weight": "30%"},
        },
        "match_reasons": all_reasons[:5],
        "concerns": all_concerns[:3],
        "fraud_flags": d3.get("fraud_flags", []),
        "brand_evidence": brand_evidence,
        "predicted_views": predicted_views,
        "predicted_cpv": predicted_cpv,
        "cost_estimate": {"min": cost_min, "max": cost_max},
        "format_mix": format_mix,
        "phone_video_count": len(phone_videos),
        "last_phone_date": max((v.published_at for v in phone_videos if v.published_at), default=""),
        "marketplace": marketplace,
        "marketplace_timeline": marketplace_timeline[:5],
        "flags": flags,
    }


def score_all_for_product(product: ProductData, limit: int = 200) -> list[dict]:
    """Score all eligible creators for a specific product. Returns ranked list."""
    session = SessionLocal()

    creators = (
        session.query(Creator)
        .filter(
            Creator.phone_video_count > 0,
            Creator.subscriber_count >= 1000,
        )
        .all()
    )

    results = []
    disqualified_count = 0

    for creator in creators:
        score_data = score_creator_for_product(creator, product, session)

        if score_data["disqualified"]:
            disqualified_count += 1
            continue

        results.append({
            "creator": {
                "id": creator.id,
                "channel_id": creator.channel_id,
                "name": creator.channel_title,
                "thumbnail_url": creator.thumbnail_url,
                "subscriber_count": creator.subscriber_count,
                "tier": creator.tier,
                "primary_language": creator.primary_language,
                "engagement_rate": creator.engagement_rate,
                "custom_url": creator.custom_url,
                "country": creator.country,
            },
            **score_data,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    for i, r in enumerate(results):
        r["rank"] = i + 1

    session.close()

    return {
        "product": product.to_dict(),
        "total_matched": len(results),
        "total_disqualified": disqualified_count,
        "creators": results[:limit],
    }
