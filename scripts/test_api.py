"""Quick API endpoint tests."""
import httpx
import json
import sys

BASE = "http://localhost:8000"


def test_stats():
    r = httpx.get(f"{BASE}/api/stats")
    assert r.status_code == 200
    data = r.json()
    print("STATS:", json.dumps(data, indent=2))
    assert data["total_creators"] > 0
    assert data["total_videos"] > 0
    return data


def test_creators():
    r = httpx.get(f"{BASE}/api/creators", params={"limit": 5})
    assert r.status_code == 200
    data = r.json()
    print(f"\nCREATORS: {data['total']} total, showing {len(data['creators'])}")
    print(f"Tier breakdown: {data['tier_breakdown']}")
    print(f"Language breakdown: {data['language_breakdown']}")
    for c in data["creators"]:
        print(
            f"  {c['combined_score']:>5.1f} | {c['name'][:35]:<35} "
            f"| {c['subscriber_count']:>10,} | {c['tier']:<6} | {c['primary_language']}"
        )
    return data


def test_creator_detail(creator_id: int):
    r = httpx.get(f"{BASE}/api/creator/{creator_id}")
    assert r.status_code == 200
    d = r.json()
    print(f"\nDETAIL: {d['name']}")
    print(f"  Subscribers: {d['subscriber_count']:,}")
    print(f"  Videos: {len(d['videos'])}")
    print(f"  Phone videos: {len(d['phone_videos'])}")
    print(f"  Content fingerprint: {json.dumps(d['content_fingerprint'], indent=2)}")
    return d


def test_compare(ids: list[int]):
    r = httpx.post(f"{BASE}/api/compare", json={"creator_ids": ids})
    assert r.status_code == 200
    data = r.json()
    print(f"\nCOMPARE: {len(data['creators'])} creators")
    for c in data["creators"]:
        print(f"  {c['name'][:30]}: AF={c['audience_fit_score']}, CP={c['content_proof_score']}, formats={c['format_strengths']}")
    return data


def test_filter():
    r = httpx.get(f"{BASE}/api/creators", params={"tier": "mid", "limit": 5})
    assert r.status_code == 200
    data = r.json()
    print(f"\nFILTERED (mid tier): {data['total']} total")
    for c in data["creators"]:
        print(f"  {c['combined_score']:>5.1f} | {c['name'][:35]:<35} | {c['tier']}")


if __name__ == "__main__":
    print("=" * 60)
    print("API ENDPOINT TESTS")
    print("=" * 60)

    stats = test_stats()
    creators = test_creators()

    if creators["creators"]:
        cid = creators["creators"][0]["id"]
        test_creator_detail(cid)

        if len(creators["creators"]) >= 3:
            ids = [c["id"] for c in creators["creators"][:3]]
            test_compare(ids)

    test_filter()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)
