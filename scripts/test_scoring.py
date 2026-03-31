"""Test the new dynamic scoring engine with different products."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.scraper.product_scraper import scrape_product
from backend.app.scorer.scoring_engine import score_all_for_product


def test_product(url, label):
    product = scrape_product(url)
    print(f"\n{'='*70}")
    print(f"PRODUCT: {product.brand} {product.model}")
    print(f"Price: INR {product.price:,} | Band: {product.price_band} | Hero: {product.hero_feature}")
    print(f"{'='*70}")

    result = score_all_for_product(product, limit=10)
    print(f"Matched: {result['total_matched']} | Disqualified: {result['total_disqualified']}")
    print()
    print(f"{'Rank':<5} {'Score':>5} {'Creator':<32} {'Tier':<7} {'Lang':<9} {'Mix':<10} {'Evidence'}")
    print("-" * 100)

    for c in result["creators"][:10]:
        ev_count = len(c["brand_evidence"])
        ev_text = f"{ev_count} {product.brand} videos" if ev_count > 0 else "No brand match"
        print(
            f"#{c['rank']:<4} {c['match_score']:>5.1f} "
            f"{c['creator']['name'][:31]:<32} "
            f"{c['creator']['tier']:<7} "
            f"{c['creator']['primary_language']:<9} "
            f"{c['format_mix']:<10} "
            f"{ev_text}"
        )

    if result["creators"]:
        top = result["creators"][0]
        print(f"\n  TOP MATCH DETAILS:")
        for dim_name, dim_data in top["dimensions"].items():
            print(f"    {dim_name} ({dim_data['weight']}): {dim_data['score']:.0f}/100")
            for r in dim_data["reasons"]:
                print(f"      + {r}")
        if top["concerns"]:
            print(f"    Concerns: {top['concerns']}")
        if top["fraud_flags"]:
            print(f"    Fraud flags: {top['fraud_flags']}")
        print(f"    Predicted views: {top['predicted_views']:,}")
        print(f"    Predicted CPV: INR {top['predicted_cpv']:.2f}")
        print(f"    Cost estimate: INR {top['cost_estimate']['min']:,} - {top['cost_estimate']['max']:,}")

    return set(c["creator"]["name"] for c in result["creators"][:10])


if __name__ == "__main__":
    top_realme = test_product(
        "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db",
        "Budget Realme"
    )

    top_iphone = test_product(
        "https://www.flipkart.com/apple-iphone-16-pro-max-desert-titanium-256-gb/p/itm03ae47a282e51",
        "Premium iPhone"
    )

    top_samsung = test_product(
        "https://www.flipkart.com/samsung-galaxy-m15-5g-celestial-blue-128-gb/p/itm6e4f3e948c499",
        "Mid Samsung"
    )

    print(f"\n{'='*70}")
    print("DIFFERENTIATION CHECK")
    print(f"{'='*70}")
    overlap_ri = top_realme & top_iphone
    overlap_rs = top_realme & top_samsung
    overlap_is = top_iphone & top_samsung
    print(f"Realme vs iPhone overlap:  {len(overlap_ri)}/10 {overlap_ri if overlap_ri else '(zero - good!)'}")
    print(f"Realme vs Samsung overlap: {len(overlap_rs)}/10 {overlap_rs if overlap_rs else '(zero - good!)'}")
    print(f"iPhone vs Samsung overlap: {len(overlap_is)}/10 {overlap_is if overlap_is else '(zero - good!)'}")
