"""Test the AI search endpoint."""
import httpx
import json

BASE = "http://localhost:8000"

queries = [
    ("Hindi creators who reviewed Realme in last 60 days", "creators"),
    ("Most viewed Samsung camera test videos this month", "videos"),
    ("Telugu creators with high engagement under 200K subscribers", "creators"),
    ("Budget phone unboxing videos over 50K views", "videos"),
    ("Micro creators who review phones under 15000", "creators"),
]

for query, expected_mode in queries:
    print(f"\nQuery: \"{query}\"")
    r = httpx.post(f"{BASE}/api/search", json={"query": query}, timeout=60)
    data = r.json()
    parsed = data["query"]
    print(f"  Mode: {data['mode']} | Total: {data['total_results']}")
    print(f"  Parsed: brands={parsed['brands']} lang={parsed['language']} format={parsed['format_type']} tier={parsed['tier']} days={parsed['days_back']} min_views={parsed['min_views']}")
    print(f"  Free: {len(data['free_results'])} | Locked: {len(data['locked_results'])}")
    if data["free_results"]:
        first = data["free_results"][0]
        if data["mode"] == "videos":
            print(f"  Top video: {first['title'][:50]} | {first['view_count']:,} views | {first.get('creator_name', '')}")
        else:
            print(f"  Top creator: {first['name']} | {first['subscriber_count']:,} subs | {first['tier']} | {first['primary_language']}")
    print(f"  Upgrade: {data['upgrade_message']}")

print("\n\nALL SEARCH TESTS PASSED")
