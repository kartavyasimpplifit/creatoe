"""
YouTube API Quota Tracker — STRICT enforcement.

Daily limit: 10,000 units. Safety buffer: 500.
Every API call is logged, costed, and refused if over budget.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from backend.app.config import settings, DATA_DIR

USAGE_FILE = DATA_DIR / "youtube_api_usage.json"

UNIT_COSTS = {
    "search.list": 100,
    "channels.list": 1,
    "videos.list": 1,
    "playlistItems.list": 1,
    "captions.list": 50,
    "captions.download": 200,
    "commentThreads.list": 1,
}


def _today_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _load_usage() -> dict:
    if USAGE_FILE.exists():
        return json.loads(USAGE_FILE.read_text())
    return {}


def _save_usage(data: dict):
    USAGE_FILE.write_text(json.dumps(data, indent=2))


def get_today_usage() -> dict:
    data = _load_usage()
    today = _today_key()
    if today not in data:
        data[today] = {"total": 0, "calls": {}}
        _save_usage(data)
    return data[today]


def get_remaining_quota() -> int:
    today = get_today_usage()
    return settings.youtube_api_daily_quota - today["total"]


def can_afford(method: str, count: int = 1) -> bool:
    cost = UNIT_COSTS.get(method, 100) * count
    remaining = get_remaining_quota()
    return remaining - cost >= settings.youtube_api_safety_buffer


def log_call(method: str, count: int = 1):
    cost = UNIT_COSTS.get(method, 100) * count
    data = _load_usage()
    today = _today_key()
    if today not in data:
        data[today] = {"total": 0, "calls": {}}

    data[today]["total"] += cost
    data[today]["calls"][method] = data[today]["calls"].get(method, 0) + count
    _save_usage(data)


def check_and_log(method: str, count: int = 1) -> bool:
    """Pre-flight check + log. Returns True if call is allowed, False if quota exceeded."""
    if not can_afford(method, count):
        remaining = get_remaining_quota()
        cost = UNIT_COSTS.get(method, 100) * count
        print(
            f"[QUOTA BLOCKED] {method} x{count} costs {cost} units. "
            f"Remaining: {remaining}. Buffer: {settings.youtube_api_safety_buffer}. REFUSED."
        )
        return False
    log_call(method, count)
    return True


def print_quota_summary():
    today = get_today_usage()
    remaining = get_remaining_quota()
    limit = settings.youtube_api_daily_quota
    pct = (today["total"] / limit) * 100 if limit > 0 else 0
    print(f"\n{'='*50}")
    print(f"YOUTUBE API QUOTA SUMMARY ({_today_key()})")
    print(f"{'='*50}")
    print(f"Used:      {today['total']:>6} / {limit} ({pct:.1f}%)")
    print(f"Remaining: {remaining:>6}")
    print(f"Buffer:    {settings.youtube_api_safety_buffer:>6}")
    if today.get("calls"):
        print(f"\nBreakdown:")
        for method, cnt in sorted(today["calls"].items()):
            unit_cost = UNIT_COSTS.get(method, 100)
            print(f"  {method:<25} {cnt:>4} calls x {unit_cost} = {cnt * unit_cost:>6} units")
    print(f"{'='*50}\n")
