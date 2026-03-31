"""
Natural language query parser for creator/video search.
Converts queries like "Hindi creators who reviewed Realme in last 60 days with over 50K views"
into structured SQL-compatible filters.
"""

import re
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field, asdict
from typing import Optional

BRAND_PATTERNS = {
    "samsung": "Samsung", "realme": "Realme", "redmi": "Redmi", "xiaomi": "Xiaomi",
    "oneplus": "OnePlus", "one plus": "OnePlus", "vivo": "Vivo", "oppo": "OPPO",
    "iqoo": "iQOO", "poco": "POCO", "motorola": "Motorola", "moto": "Motorola",
    "nokia": "Nokia", "apple": "Apple", "iphone": "Apple", "google pixel": "Google",
    "nothing": "Nothing", "tecno": "Tecno", "infinix": "Infinix", "lava": "Lava",
    "honor": "Honor",
}

LANGUAGE_PATTERNS = {
    "hindi": "hindi", "tamil": "tamil", "telugu": "telugu", "bengali": "bengali",
    "marathi": "marathi", "kannada": "kannada", "malayalam": "malayalam",
    "english": "english", "gujarati": "gujarati", "punjabi": "punjabi",
}

FORMAT_PATTERNS = {
    "unboxing": "unboxing", "unbox": "unboxing",
    "review": "review", "reviews": "review",
    "comparison": "comparison", "compare": "comparison", "vs": "comparison",
    "camera test": "camera_test", "camera comparison": "camera_test", "camera review": "camera_test",
    "speed test": "speed_test", "benchmark": "speed_test",
    "tips": "tips_tricks", "tricks": "tips_tricks", "hidden features": "tips_tricks",
    "best phone": "best_of", "top 5": "best_of", "top 10": "best_of", "best under": "best_of",
    "first impression": "first_impressions", "first look": "first_impressions", "hands on": "first_impressions",
}

TIER_PATTERNS = {
    r"mega\s*(creator|influencer)?s?": "mega",
    r"macro\s*(creator|influencer)?s?": "macro",
    r"mid[\s-]*(tier|size)?\s*(creator|influencer)?s?": "mid",
    r"micro\s*(creator|influencer)?s?": "micro",
    r"nano\s*(creator|influencer)?s?": "nano",
}


@dataclass
class ParsedQuery:
    raw_query: str = ""
    mode: str = "creators"
    brands: list = field(default_factory=list)
    language: str = ""
    format_type: str = ""
    tier: str = ""
    min_views: int = 0
    max_views: int = 0
    min_subscribers: int = 0
    max_subscribers: int = 0
    min_engagement: float = 0.0
    days_back: int = 0
    price_band: str = ""
    sort_by: str = "match_score"
    sort_order: str = "desc"
    keywords: list = field(default_factory=list)

    def to_dict(self):
        return asdict(self)


def parse_number(text: str) -> int:
    text = text.strip().lower().replace(",", "")
    multipliers = {"k": 1000, "m": 1000000, "l": 100000, "lakh": 100000, "cr": 10000000, "crore": 10000000}
    for suffix, mult in multipliers.items():
        if text.endswith(suffix):
            try:
                return int(float(text[:-len(suffix)]) * mult)
            except ValueError:
                pass
    try:
        return int(text)
    except ValueError:
        return 0


def parse_query(query: str) -> ParsedQuery:
    result = ParsedQuery(raw_query=query)
    q = query.lower().strip()

    if any(w in q for w in ["video", "videos", "content", "reel", "reels", "most viewed", "most liked", "highest views"]):
        result.mode = "videos"
    else:
        result.mode = "creators"

    for pattern, brand in BRAND_PATTERNS.items():
        if pattern in q:
            if brand not in result.brands:
                result.brands.append(brand)

    for pattern, lang in LANGUAGE_PATTERNS.items():
        if pattern in q:
            result.language = lang
            break

    for pattern, fmt in FORMAT_PATTERNS.items():
        if pattern in q:
            result.format_type = fmt
            break

    for pattern, tier in TIER_PATTERNS.items():
        if re.search(pattern, q):
            result.tier = tier
            break

    time_patterns = [
        (r"last\s+(\d+)\s+days?", lambda m: int(m.group(1))),
        (r"past\s+(\d+)\s+days?", lambda m: int(m.group(1))),
        (r"last\s+(\d+)\s+weeks?", lambda m: int(m.group(1)) * 7),
        (r"last\s+(\d+)\s+months?", lambda m: int(m.group(1)) * 30),
        (r"this\s+month", lambda m: 30),
        (r"this\s+week", lambda m: 7),
        (r"today", lambda m: 1),
        (r"yesterday", lambda m: 2),
        (r"recent", lambda m: 30),
        (r"latest", lambda m: 14),
    ]
    for pattern, extractor in time_patterns:
        match = re.search(pattern, q)
        if match:
            result.days_back = extractor(match)
            break

    view_patterns = [
        (r"(?:over|above|more than|>\s*|atleast|at least)\s*([\d,.]+[kmKM]?)\s*views?", "min"),
        (r"([\d,.]+[kmKM]?)\+\s*views?", "min"),
        (r"(?:under|below|less than|<\s*)\s*([\d,.]+[kmKM]?)\s*views?", "max"),
    ]
    for pattern, vtype in view_patterns:
        match = re.search(pattern, q)
        if match:
            val = parse_number(match.group(1))
            if vtype == "min":
                result.min_views = val
            else:
                result.max_views = val

    sub_patterns = [
        (r"(?:over|above|more than)\s*([\d,.]+[kmKM]?)\s*(?:subs|subscribers|followers)", "min"),
        (r"(?:under|below|less than)\s*([\d,.]+[kmKM]?)\s*(?:subs|subscribers|followers)", "max"),
    ]
    for pattern, stype in sub_patterns:
        match = re.search(pattern, q)
        if match:
            val = parse_number(match.group(1))
            if stype == "min":
                result.min_subscribers = val
            else:
                result.max_subscribers = val

    eng_patterns = [
        (r"(?:engagement|eng)\s*(?:over|above|>)\s*([\d.]+)%?", None),
        (r"(?:over|above)\s*([\d.]+)%?\s*engagement", None),
        (r"high\s*engagement", 3.0),
    ]
    for item in eng_patterns:
        if len(item) == 2 and isinstance(item[1], float):
            if item[1] and re.search(item[0], q):
                result.min_engagement = item[1]
                break
        else:
            match = re.search(item[0], q)
            if match:
                result.min_engagement = float(match.group(1))
                break

    price_patterns = [
        (r"(?:under|below)\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)", None),
        (r"budget\s*(?:phone|mobile|smartphone)?", "budget"),
        (r"mid[\s-]*range", "mid"),
        (r"premium\s*(?:phone|mobile|smartphone)?", "premium"),
        (r"flagship", "ultra-premium"),
    ]
    for item in price_patterns:
        if item[1]:
            if re.search(item[0], q):
                result.price_band = item[1]
                break
        else:
            match = re.search(item[0], q)
            if match:
                price = parse_number(match.group(1))
                if price < 15000:
                    result.price_band = "budget"
                elif price < 25000:
                    result.price_band = "mid"
                elif price < 40000:
                    result.price_band = "mid-premium"
                else:
                    result.price_band = "premium"
                break

    sort_patterns = [
        (r"most\s*viewed|highest\s*views|top\s*views", "view_count", "desc"),
        (r"most\s*liked|highest\s*likes", "like_count", "desc"),
        (r"most\s*engaged|highest\s*engagement|best\s*engagement", "engagement_rate", "desc"),
        (r"newest|latest|most\s*recent", "published_at", "desc"),
        (r"oldest|earliest", "published_at", "asc"),
        (r"cheapest|lowest\s*cost", "subscriber_count", "asc"),
        (r"most\s*(?:subs|subscribers|popular)", "subscriber_count", "desc"),
    ]
    for pattern, sort_field, order in sort_patterns:
        if re.search(pattern, q):
            result.sort_by = sort_field
            result.sort_order = order
            break

    return result


def get_date_cutoff(days_back: int) -> str:
    if days_back <= 0:
        return ""
    dt = datetime.now(timezone.utc) - timedelta(days=days_back)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
