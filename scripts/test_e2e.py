"""End-to-end test of the full API."""
import httpx
import json

BASE = "http://localhost:8000"

print("=" * 60)
print("END-TO-END TEST")
print("=" * 60)

# Test 1: Analyze product
print("\n1. Analyze Realme Narzo 70 5G")
r = httpx.post(f"{BASE}/api/analyze", json={
    "url": "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"
}, timeout=60)
assert r.status_code == 200
data = r.json()

print(f"   Product: {data['product']['brand']} {data['product']['model']} | {data['product']['price_band']}")
print(f"   Matched: {data['total_matched']} | Disqualified: {data['total_disqualified']}")
print(f"   Top 3:")
for c in data["creators"][:3]:
    ev = len(c["brand_evidence"])
    print(f"     #{c['rank']} {c['match_score']:.1f} | {c['creator']['name'][:30]} | {c['creator']['tier']} | {c['creator']['primary_language']} | {ev} brand vids")

di = data["demand_intelligence"]
print(f"\n   Demand Intel:")
print(f"     {data['product']['brand']} videos: {di['current_brand_videos']}")
print(f"     Top competitor: {di['top_competitor']['brand']} ({di['top_competitor']['videos']})")
print(f"     Flipkart: {di['flipkart_associated']} | Amazon: {di['amazon_associated']}")
print(f"     Language gaps: {len(di['language_gaps'])}")

# Test 2: Creator detail
if data["creators"]:
    cid = data["creators"][0]["creator"]["id"]
    print(f"\n2. Creator Detail: ID={cid}")
    r = httpx.get(f"{BASE}/api/creator/{cid}", params={
        "product_url": "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"
    }, timeout=30)
    assert r.status_code == 200
    detail = r.json()
    print(f"   Name: {detail['name']}")
    print(f"   Phone videos: {detail['phone_video_count']}")
    if detail.get("score_data"):
        print(f"   Score: {detail['score_data']['match_score']}")

# Test 3: Campaign builder
if len(data["creators"]) >= 3:
    ids = [c["creator"]["id"] for c in data["creators"][:5]]
    print(f"\n3. Campaign Builder: {len(ids)} creators")
    r = httpx.post(f"{BASE}/api/campaign/build", json={
        "creator_ids": ids,
        "product_url": "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"
    }, timeout=30)
    assert r.status_code == 200
    campaign = r.json()
    s = campaign["summary"]
    print(f"   Creators: {s['creator_count']}")
    print(f"   Budget: INR {s['budget_min']:,} - {s['budget_max']:,}")
    print(f"   Reach: {s['estimated_reach']:,}")
    print(f"   CPV: INR {s['avg_cpv']:.2f}")
    print(f"   Languages: {s['language_mix']}")

# Test 4: Stats
print(f"\n4. Stats")
r = httpx.get(f"{BASE}/api/stats")
stats = r.json()
print(f"   Phone creators: {stats['phone_creators']}")
print(f"   Videos: {stats['total_videos']}")
print(f"   Languages: {stats['languages']}")

# Test 5: Outreach email
if data["creators"]:
    cid = data["creators"][0]["creator"]["id"]
    print(f"\n5. Outreach Email Draft")
    r = httpx.get(f"{BASE}/api/creator/{cid}/outreach", params={
        "product_url": "https://www.flipkart.com/realme-narzo-70-5g-forest-green-128-gb/p/itmb71c5e63b49db"
    })
    email = r.json()
    print(f"   Subject: {email['subject']}")
    print(f"   Body (first 150 chars): {email['body'][:150]}...")

print("\n" + "=" * 60)
print("ALL TESTS PASSED")
print("=" * 60)
