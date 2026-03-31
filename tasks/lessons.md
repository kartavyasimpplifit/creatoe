# Lessons Learned

## Session Log
Track patterns, mistakes, and corrections here. Review at start of each session.

---

### Template
```
**Date:** YYYY-MM-DD
**Mistake:** What went wrong
**Root Cause:** Why it happened
**Fix:** What was done
**Rule:** Prevent this in the future by...
```

---

**Date:** 2026-04-01
**Mistake:** Used `yt.search().execute(q=..., ...)` instead of `yt.search().list(q=..., ...).execute()`
**Root Cause:** Google API client chain pattern — params go in `.list()`, `.execute()` takes no args
**Fix:** Changed all YouTube API calls to `.list(...).execute()` pattern
**Rule:** Always use `.list(params).execute()` for Google API client. Never pass params to `.execute()`.

---

**Date:** 2026-04-01
**Mistake:** YouTube timedtext caption endpoint returned 429 rate limit
**Root Cause:** Hit the endpoint too fast (0.2s delay, 1000 videos) without proper backoff
**Fix:** Deferred captions to later batch with 1-2s delays
**Rule:** Always use 1-2 second delays for non-API YouTube endpoints. Implement exponential backoff on 429.

---

**Date:** 2026-04-01
**Mistake:** PowerShell doesn't support `&&` for command chaining
**Root Cause:** PowerShell uses `;` not `&&`
**Fix:** Use `;` for sequential commands in PowerShell
**Rule:** In PowerShell: use `;` for sequential commands. Never use `&&`.

---

**Date:** 2026-04-01
**Mistake:** get_playlist_videos crashed on 404 for some channels
**Root Cause:** Some channel_ids don't have valid upload playlists (UU prefix)
**Fix:** Added try/except around the API call
**Rule:** Always wrap external API calls in try/except. Not all channels have uploads playlists.

---

## HARD RULES (Non-Negotiable)

### Rule 1: YouTube API Quota — STRICT

**Daily limit: 10,000 units per project. Resets at midnight Pacific Time.**

Before EVERY YouTube API call:
1. Check current usage count from `data/youtube_api_usage.json`
2. Log the cost of the call BEFORE making it
3. Refuse the call if remaining quota < 500 units (safety buffer)
4. After the call, increment the counter

Unit costs to track:
- `search.list` = 100 units (EXPENSIVE — minimize these)
- `channels.list` = 1 unit
- `videos.list` = 1 unit
- `playlistItems.list` = 1 unit
- `captions.list` = 50 units
- `captions.download` = 200 units

**Strategy to stay under quota:**
- Batch `channels.list` and `videos.list` calls (up to 50 IDs per call = 1 unit for 50 results)
- Use `playlistItems.list` to get a channel's uploads (cheaper than searching)
- Limit `search.list` calls to ~50/day max (5,000 units) — save the rest for data pulls
- Cache everything — never re-fetch data we already have
- Log usage to `data/youtube_api_usage.json` with daily totals and per-endpoint breakdown
- Print quota summary after every batch operation

**If quota is exhausted:** STOP. Do not retry. Wait for reset. Work on non-API tasks instead.
