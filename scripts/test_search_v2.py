"""Test the improved search with explicit mode control."""
import httpx

BASE = "http://localhost:8000"

tests = [
    ("Samsung unboxing videos this month", "videos"),
    ("Most viewed Realme camera test", "videos"),
    ("Budget phone reviews over 50K views", "videos"),
    ("Hindi creators who reviewed Realme", "creators"),
    ("Micro creators for Samsung", "creators"),
]

for query, mode in tests:
    r = httpx.post(f"{BASE}/api/search", json={"query": query, "mode": mode}, timeout=60)
    data = r.json()
    print(f"\n[{mode.upper()}] \"{query}\"")
    print(f"  Total: {data['total_results']} | Free: {len(data['free_results'])} | Locked: {len(data['locked_results'])}")

    if data["free_results"]:
        if mode == "videos":
            for v in data["free_results"][:3]:
                print(f"  > {v['title'][:55]} | {v['view_count']:,} views | {v.get('creator_name', '?')}")
        else:
            for c in data["free_results"][:3]:
                print(f"  > {c['name'][:35]} | {c['subscriber_count']:,} subs | {c['tier']} | {c['primary_language']}")
    else:
        print("  (no results)")

print("\n\nDONE")
