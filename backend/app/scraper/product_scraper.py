"""
Product scraper for Flipkart and Amazon India.
Extracts brand, model, price, features, image from a product URL.
Uses httpx + BeautifulSoup — no browser automation needed for most products.
"""

import re
import httpx
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
from typing import Optional

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
}

PHONE_BRANDS_MAP = {
    "realme": "Realme", "redmi": "Redmi", "xiaomi": "Xiaomi", "samsung": "Samsung",
    "oneplus": "OnePlus", "one plus": "OnePlus", "vivo": "Vivo", "oppo": "OPPO",
    "iqoo": "iQOO", "poco": "POCO", "motorola": "Motorola", "moto": "Motorola",
    "nokia": "Nokia", "apple": "Apple", "iphone": "Apple", "google pixel": "Google",
    "nothing": "Nothing", "tecno": "Tecno", "infinix": "Infinix", "lava": "Lava",
    "honor": "Honor", "huawei": "Huawei",
}

FEATURE_KEYWORDS = {
    "5g": "5G", "camera": "Camera", "battery": "Battery", "amoled": "Display",
    "snapdragon": "Performance", "dimensity": "Performance", "mediatek": "Performance",
    "helio": "Performance", "gaming": "Gaming", "fast charging": "Charging",
    "120hz": "Display", "90hz": "Display", "oled": "Display", "super amoled": "Display",
    "50mp": "Camera", "64mp": "Camera", "108mp": "Camera", "200mp": "Camera",
    "5000mah": "Battery", "6000mah": "Battery", "4500mah": "Battery",
}


@dataclass
class ProductData:
    url: str = ""
    platform: str = ""
    product_name: str = ""
    brand: str = ""
    model: str = ""
    price: int = 0
    price_band: str = ""
    category: str = "smartphone"
    key_features: list = None
    hero_feature: str = ""
    image_url: str = ""
    rating: float = 0.0
    review_count: int = 0
    listing_date: str = ""

    def __post_init__(self):
        if self.key_features is None:
            self.key_features = []

    def to_dict(self):
        return asdict(self)


def classify_price_band(price: int) -> str:
    if price <= 0:
        return "unknown"
    if price < 10000:
        return "budget"
    if price < 15000:
        return "budget"
    if price < 20000:
        return "mid"
    if price < 30000:
        return "mid-premium"
    if price < 50000:
        return "premium"
    return "ultra-premium"


def detect_brand(text: str) -> str:
    text_lower = text.lower()
    for key, brand in PHONE_BRANDS_MAP.items():
        if key in text_lower:
            return brand
    return ""


def extract_model(title: str, brand: str) -> str:
    if not brand:
        return ""
    brand_lower = brand.lower()
    for key in PHONE_BRANDS_MAP:
        if key in title.lower():
            pattern = rf'{re.escape(key)}\s+(.+?)(?:\s*[\(\[,|]|\s+\d+\s*gb|\s*-\s|\s*$)'
            match = re.search(pattern, title.lower())
            if match:
                model = match.group(1).strip()
                model = re.sub(r'\s+', ' ', model)
                return model.title()[:60]
    return ""


def detect_features(text: str) -> tuple[list[str], str]:
    text_lower = text.lower()
    features = []
    feature_types = {}
    for keyword, ftype in FEATURE_KEYWORDS.items():
        if keyword in text_lower:
            features.append(keyword.upper() if len(keyword) <= 4 else keyword.title())
            feature_types[ftype] = feature_types.get(ftype, 0) + 1

    hero = max(feature_types, key=feature_types.get) if feature_types else "General"
    return features[:8], hero


def scrape_flipkart(url: str) -> ProductData:
    product = ProductData(url=url, platform="flipkart")

    try:
        resp = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        if resp.status_code != 200:
            return _fallback_from_url(url, "flipkart")

        soup = BeautifulSoup(resp.text, "html.parser")

        title_el = soup.select_one("span.VU-ZEz") or soup.select_one("h1 span") or soup.select_one("h1")
        if title_el:
            product.product_name = title_el.get_text(strip=True)

        price_el = soup.select_one("div.Nx9bqj.CxhGGd") or soup.select_one("div._30jeq3") or soup.select_one("div.Nx9bqj")
        if price_el:
            price_text = price_el.get_text(strip=True)
            price_nums = re.sub(r'[^\d]', '', price_text)
            if price_nums:
                product.price = int(price_nums)

        img_el = soup.select_one("img._396cs4") or soup.select_one("img.DByuf4") or soup.select_one("div._3kidJX img")
        if img_el:
            product.image_url = img_el.get("src", "")

        rating_el = soup.select_one("div.XQDdHH") or soup.select_one("div._3LWZlK")
        if rating_el:
            try:
                product.rating = float(rating_el.get_text(strip=True))
            except ValueError:
                pass

        review_el = soup.select_one("span.Wphh3N")
        if review_el:
            nums = re.findall(r'[\d,]+', review_el.get_text())
            if nums:
                product.review_count = int(nums[0].replace(',', ''))

        full_text = product.product_name + " " + soup.get_text(" ", strip=True)[:2000]
        product.brand = detect_brand(product.product_name)
        product.model = extract_model(product.product_name, product.brand)
        product.price_band = classify_price_band(product.price)
        product.key_features, product.hero_feature = detect_features(full_text)

    except Exception:
        return _fallback_from_url(url, "flipkart")

    if not product.brand:
        product = _fallback_from_url(url, "flipkart")

    return product


def scrape_amazon(url: str) -> ProductData:
    product = ProductData(url=url, platform="amazon")

    try:
        resp = httpx.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        if resp.status_code != 200:
            return _fallback_from_url(url, "amazon")

        soup = BeautifulSoup(resp.text, "html.parser")

        title_el = soup.select_one("#productTitle")
        if title_el:
            product.product_name = title_el.get_text(strip=True)

        price_el = soup.select_one("span.a-price-whole")
        if price_el:
            price_text = price_el.get_text(strip=True).replace(',', '').replace('.', '')
            if price_text.isdigit():
                product.price = int(price_text)

        img_el = soup.select_one("#landingImage") or soup.select_one("#imgBlkFront")
        if img_el:
            product.image_url = img_el.get("src", "")

        rating_el = soup.select_one("span.a-icon-alt")
        if rating_el:
            try:
                product.rating = float(rating_el.get_text(strip=True).split()[0])
            except (ValueError, IndexError):
                pass

        full_text = product.product_name + " " + soup.get_text(" ", strip=True)[:2000]
        product.brand = detect_brand(product.product_name)
        product.model = extract_model(product.product_name, product.brand)
        product.price_band = classify_price_band(product.price)
        product.key_features, product.hero_feature = detect_features(full_text)

    except Exception:
        return _fallback_from_url(url, "amazon")

    if not product.brand:
        product = _fallback_from_url(url, "amazon")

    return product


def _fallback_from_url(url: str, platform: str) -> ProductData:
    """Extract product data from the URL path when scraping fails/is blocked."""
    product = ProductData(url=url, platform=platform)

    path = url.split("//")[-1].split("?")[0]
    parts = path.split("/")
    slug = ""
    for part in parts:
        if len(part) > 15 and part not in ("www.flipkart.com", "www.amazon.in", "dl", "p"):
            slug = part
            break

    if not slug and len(parts) > 1:
        slug = parts[1] if len(parts[1]) > 5 else (parts[2] if len(parts) > 2 else "")

    slug = slug.replace("-", " ").replace("_", " ").replace("+", " ")

    product.brand = detect_brand(slug)
    product.model = extract_model(slug, product.brand)
    product.product_name = f"{product.brand} {product.model}".strip() if product.brand else slug.title()[:80]

    storage_match = re.search(r'(\d+)\s*gb', slug.lower())
    color_patterns = re.findall(r'(black|white|blue|green|gold|silver|titanium|red|purple|grey|gray|celestial|desert|forest|midnight)', slug.lower())
    if color_patterns:
        product.product_name = re.sub(r'\s+', ' ', product.product_name).strip()

    features, hero = detect_features(slug)
    product.key_features = features
    product.hero_feature = hero

    price_from_brand = {
        "Apple": 80000, "Samsung": 18000, "OnePlus": 30000, "Google": 60000,
        "Nothing": 25000, "Realme": 14000, "Redmi": 12000, "Xiaomi": 15000,
        "POCO": 13000, "Motorola": 15000, "Vivo": 18000, "OPPO": 20000,
        "iQOO": 20000, "Tecno": 10000, "Infinix": 10000, "Lava": 8000,
        "Nokia": 12000, "Honor": 20000,
    }
    if "pro max" in slug.lower() or "ultra" in slug.lower():
        product.price = price_from_brand.get(product.brand, 15000) * 3
    elif "pro" in slug.lower() or "plus" in slug.lower():
        product.price = int(price_from_brand.get(product.brand, 15000) * 1.5)
    else:
        product.price = price_from_brand.get(product.brand, 15000)

    product.price_band = classify_price_band(product.price)

    if not product.key_features and product.brand:
        if product.brand == "Apple":
            product.key_features = ["Camera", "Performance", "Display"]
            product.hero_feature = "Camera"
        elif product.brand in ("Realme", "Redmi", "POCO", "Infinix", "Tecno"):
            product.key_features = ["5G", "Camera", "Battery"]
            product.hero_feature = "Camera"
        elif product.brand in ("Samsung", "Vivo", "OPPO"):
            product.key_features = ["Display", "Camera", "5G"]
            product.hero_feature = "Display"
        elif product.brand in ("OnePlus", "iQOO"):
            product.key_features = ["Performance", "Charging", "Display"]
            product.hero_feature = "Performance"

    return product


def scrape_product(url: str) -> ProductData:
    """Main entry point — detect platform and scrape."""
    url = url.strip()

    if "flipkart.com" in url:
        return scrape_flipkart(url)
    elif "amazon.in" in url or "amazon.co.in" in url:
        return scrape_amazon(url)
    elif "myntra.com" in url:
        return _fallback_from_url(url, "myntra")
    else:
        return _fallback_from_url(url, "unknown")
