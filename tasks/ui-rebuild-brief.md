# Creatoe UI Rebuild Brief

**Related chat:** "Frontend UI rebuild with TikTok design" — handles the full frontend rebuild.
**This brief** is the single source of truth for design direction, backend API, and deployment.

## Product
- **Name:** Creatoe (by Suggest)
- **What it does:** AI-powered creator intelligence for commerce. Paste a product link, get matched creators. Search creators/videos by natural language. Campaign builder.
- **Target user:** Flipkart Senior Director of Strategy (enterprise buyer)
- **Design reference:** TikTok Creative Center + TikTok desktop web app

## Logo Animation
- "Creato" types out, then "e" steps in with a spring bounce
- Tiny accent-colored dot (footprint) appears under the "e"
- Component exists at `frontend/src/components/creatoe-logo.tsx` — keep it

## Backend (WORKING — do not change)
- API at `http://localhost:8000`
- `POST /api/analyze` — paste product URL, get matched creators
- `POST /api/search` — natural language search for creators/videos
- `GET /api/creator/{id}` — creator detail with score breakdown
- `POST /api/campaign/build` — campaign builder with budget/CPV
- `POST /api/campaign/export` — CSV export
- `GET /api/stats` — database stats
- `GET /api/creator/{id}/outreach` — draft outreach email
- All types defined in `frontend/src/lib/api.ts`

## Database Stats
- 1,510 creators (432 phone-focused)
- 14,786 videos analyzed
- 6 languages: Hindi (108), Tamil (48), English (236), Bengali (20), Telugu (10), Kannada (10)
- Marketplace data: Amazon 2,113 videos, Flipkart 266 videos

## Design Direction: TikTok-Style

### TikTok Desktop Layout
- Left sidebar: vertical nav, icon-only by default, labels on hover
- Black/very dark background (#000 or #121212)
- Content fills remaining space
- TikTok brand colors: Black #010101, Cyan #25F4EE, Red #FE2C55

### For Creatoe — Adapt TikTok But Don't Clone
- Background: #000000 or #0a0a0a (true black like TikTok)
- Cards: #161616 (slightly lighter)
- Accent: Keep indigo #818cf8 (NOT TikTok cyan — differentiate)
- Red for engagement/view badges: #FE2C55 (TikTok red)
- Text: #fff primary, #aaa secondary, #555 muted
- Borders: #222 or #2a2a2a (very subtle)
- NO warm brown — that was a mistake. TikTok is cool black.

### Layout Structure
```
[Sidebar 56px]  [Main Content Area]
```
Sidebar: icon-only by default, expand on hover shows labels
Main: full width, scrollable, sections

### Key UX Patterns
1. THREE modes: Product Match / Search Creators / Search Videos
2. Product Match: paste URL → loading sequence → results with demand intel + creator grid
3. Search Creators: natural language → creator cards (8 free, rest locked/blurred)
4. Search Videos: natural language → video thumbnails (4 free, 8 locked/blurred like Oriane)
5. Creator deep dive: slide-over panel from right
6. Campaign builder: sticky bottom bar → modal with full plan
7. Credits display in sidebar

### What's Wrong Now (Fix These)
1. CSS variables used but not defined: --text-dim, --success, --danger, --warning, --font-mono
2. Animation classes mismatch: components use `animate-fade-in` but CSS defines `.fade-in`
3. Cards too dense — too much data per card
4. Integrations page uses different design language ("Creator Lens" not "Creatoe")
5. Dead top-bar.tsx component — delete it
6. Campaign bar doesn't offset for sidebar
7. Emojis in mode toggle look unprofessional
8. Sidebar "C" letter is placeholder-grade
9. Mono font loaded but not bound to CSS variable
10. `noise` class referenced but not defined

### Design Principles
- CONTENT FIRST, chrome last. 90% thumbnails/data, 10% UI elements
- CLEAN, not cluttered. One score number, not three bars per card
- LARGE thumbnails — not tiny. Like TikTok's video cards
- MINIMAL text overlay on thumbnails — just view count badge
- PROGRESSIVE disclosure — show less upfront, expand on click
- SMOOTH animations — fade-in with stagger, not abrupt pop
- CONSISTENT spacing — pick a scale and stick to it (4, 8, 12, 16, 24, 32)

### Pages Needed
1. `/` — Main app (search + results)
2. `/pricing` — Free/Pro/Enterprise comparison
3. `/integrations` — Integration catalog
All should share consistent design language with Creatoe branding

### Subscription Model
- Free: 3 matches/day, 5 searches/day, limited results
- Pro: ₹15,000/mo, unlimited, 100 deep dives/day
- Enterprise: custom
- Credits for premium add-ons
- Business email required for paid plans

### Files to Rewrite (Complete List)
- `frontend/src/app/globals.css` — COMPLETE rewrite with all tokens defined
- `frontend/src/app/layout.tsx` — minor cleanup
- `frontend/src/app/page.tsx` — restructure with proper sidebar + sections
- `frontend/src/app/pricing/page.tsx` — update to Creatoe branding
- `frontend/src/app/integrations/page.tsx` — update to Creatoe branding (currently says "Creator Lens")
- `frontend/src/components/sidebar.tsx` — better nav, better logo, credits
- `frontend/src/components/search-hero.tsx` — cleaner, no emojis
- `frontend/src/components/creator-grid.tsx` — simpler cards, less data
- `frontend/src/components/creator-panel.tsx` — cleaner deep dive
- `frontend/src/components/video-grid.tsx` — larger thumbnails
- `frontend/src/components/demand-intel-card.tsx` — bigger numbers, less micro-labels
- `frontend/src/components/product-card.tsx` — cleaner
- `frontend/src/components/campaign-bar.tsx` — account for sidebar offset
- `frontend/src/components/campaign-modal.tsx` — responsive table
- `frontend/src/components/loading-sequence.tsx` — use correct tokens
- `frontend/src/components/creatoe-logo.tsx` — keep as-is, works well
- DELETE: `frontend/src/components/top-bar.tsx` — dead component

### Deployment
After UI is done, deploy:
- Backend to Render (free tier)
- Frontend to Vercel (free tier)
- Needs GitHub repo first
- Set NEXT_PUBLIC_API_URL env var in Vercel to point to Render backend URL

### Testing Protocol
Use subagents:
1. UI Designer subagent validates visual design quality
2. UX Tester subagent tests all user flows
Both must approve before committing
