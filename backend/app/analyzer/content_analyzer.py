"""
Content analyzer for YouTube video transcripts.
Extracts product mentions, format classification, hook type, language, etc.

Uses a structured prompt approach compatible with any LLM (local or API).
For MVP: uses simple keyword/rule-based extraction as the primary method,
with LLM enhancement when available.
"""

import re
import json
from dataclasses import dataclass, asdict


@dataclass
class VideoAnalysis:
    products_mentioned: list[dict]
    format: str
    hook_type: str
    language: str
    competitor_mentions: list[str]
    cta_type: str
    is_sponsored: bool
    confidence: float


PHONE_BRANDS = [
    "samsung", "realme", "redmi", "xiaomi", "oneplus", "vivo", "oppo", "iqoo",
    "poco", "motorola", "moto", "nokia", "apple", "iphone", "google pixel",
    "nothing", "tecno", "infinix", "lava", "micromax", "honor",
]

PHONE_KEYWORDS = [
    "phone", "mobile", "smartphone", "handset", "device",
    "camera", "battery", "display", "processor", "chipset",
    "megapixel", "mp camera", "mah battery", "amoled", "snapdragon",
    "mediatek", "dimensity", "unboxing", "review", "comparison",
]

FORMAT_PATTERNS = {
    "unboxing": r"\b(unbox|unboxing|first look|what.s in the box)\b",
    "review": r"\b(review|honest review|full review|detailed review|long term|after \d+ (day|week|month))\b",
    "comparison": r"\b(vs|versus|comparison|compare|which is better|head to head)\b",
    "camera_test": r"\b(camera test|camera review|camera comparison|photo|video test|camera sample)\b",
    "first_impressions": r"\b(first impression|first look|hands on|quick look)\b",
    "tips_tricks": r"\b(tips|tricks|hidden features|features|settings)\b",
    "best_of": r"\b(best phone|top \d|best.*under)\b",
    "speed_test": r"\b(speed test|benchmark|antutu|geekbench)\b",
}

HOOK_PATTERNS = {
    "question": r"^.{0,80}\?",
    "statement": r"^(this|the|i |my |we |today|finally|here)",
    "trending_audio": r"\b(trending|viral|you won.t believe)\b",
}

PRICE_PATTERNS = [
    (r"under\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)", "max"),
    (r"(?:rs\.?|₹|inr)\s*(\d[\d,]*)", "exact"),
    (r"(\d[\d,]*)\s*(?:rs|rupees|inr)", "exact"),
]

SPONSORED_PATTERNS = [
    r"\b(sponsored|paid promotion|ad|#ad|collaboration|collab)\b",
    r"\b(provided by|sent by|gifted)\b",
]


def detect_language(text: str) -> str:
    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', text))
    telugu_chars = len(re.findall(r'[\u0C00-\u0C7F]', text))
    total = len(text) if text else 1

    if hindi_chars / total > 0.1:
        return "hindi"
    if tamil_chars / total > 0.05:
        return "tamil"
    if telugu_chars / total > 0.05:
        return "telugu"

    hindi_words = len(re.findall(r'\b(hai|ka|ki|ke|ko|se|ye|yeh|nahi|kya|hum|aur|bhi|ek|mein|par)\b', text.lower()))
    if hindi_words > 5:
        return "hinglish"
    return "english"


def extract_price_range(text: str) -> str:
    for pattern, ptype in PRICE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            price_str = matches[0].replace(",", "")
            try:
                price = int(price_str)
                if price < 10000:
                    return "under_10k"
                elif price < 15000:
                    return "10k_15k"
                elif price < 20000:
                    return "15k_20k"
                elif price < 25000:
                    return "20k_25k"
                elif price < 35000:
                    return "25k_35k"
                elif price < 50000:
                    return "35k_50k"
                else:
                    return "above_50k"
            except ValueError:
                pass
    return "unknown"


def analyze_transcript(title: str, description: str, transcript: str, tags: list[str] = None) -> dict:
    """
    Rule-based content analysis. Fast, free, no API needed.
    Returns a dict matching the VideoAnalysis structure.
    """
    full_text = f"{title} {description} {transcript}".lower()
    title_lower = title.lower()
    tags_text = " ".join(tags or []).lower()

    products = []
    for brand in PHONE_BRANDS:
        if brand in full_text:
            model_patterns = re.findall(
                rf'{brand}\s+([a-z0-9][\w\s]*?)(?:\s+[-–|,.]|\s+review|\s+vs|\s+unbox|\s+camera|\s+price|\s*$)',
                full_text
            )
            model = model_patterns[0].strip()[:50] if model_patterns else ""
            sentiment = "neutral"
            products.append({
                "brand": brand.title(),
                "model": model.title() if model else "",
                "price_range": extract_price_range(full_text),
                "sentiment": sentiment,
            })

    seen_brands = set()
    unique_products = []
    for p in products:
        if p["brand"] not in seen_brands:
            seen_brands.add(p["brand"])
            unique_products.append(p)

    detected_format = "review"
    for fmt, pattern in FORMAT_PATTERNS.items():
        if re.search(pattern, title_lower) or re.search(pattern, tags_text):
            detected_format = fmt
            break

    hook_type = "statement"
    for htype, pattern in HOOK_PATTERNS.items():
        if re.search(pattern, title_lower, re.IGNORECASE):
            hook_type = htype
            break

    language = detect_language(transcript if transcript else title)

    competitor_mentions = [p["brand"] for p in unique_products[1:]]

    is_sponsored = any(re.search(p, full_text) for p in SPONSORED_PATTERNS)

    cta_type = "none"
    if re.search(r"link.*(description|bio|below)", full_text):
        cta_type = "link_in_description"
    elif re.search(r"(affiliate|commission)", full_text):
        cta_type = "affiliate"
    elif re.search(r"(coupon|code|discount)", full_text):
        cta_type = "coupon_code"

    is_phone_related = (
        any(brand in full_text for brand in PHONE_BRANDS) or
        any(kw in full_text for kw in PHONE_KEYWORDS)
    )
    confidence = 0.8 if is_phone_related else 0.3

    return {
        "products_mentioned": unique_products[:5],
        "format": detected_format,
        "hook_type": hook_type,
        "language": language,
        "competitor_mentions": competitor_mentions[:5],
        "cta_type": cta_type,
        "is_sponsored": is_sponsored,
        "is_phone_related": is_phone_related,
        "confidence": confidence,
    }
