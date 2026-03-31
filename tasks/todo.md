# Creator Intelligence Graph — Sprint Tasks

## Setup — DONE
- [x] Install Git 2.53.0
- [x] Verify Python 3.11, Node.js 24, npm 11 working
- [x] Create project directory structure
- [x] Initialize git repo
- [x] Get YouTube Data API key
- [x] Install Python dependencies
- [x] Create .env with API key

## Week 1: Creator Database — DONE (Night 1)
- [x] Build YouTube search pipeline (40 queries across categories + languages)
- [x] Pull 1,417 Indian smartphone creator channels
- [x] Pull 14,786 videos for top 500 creators
- [x] Rule-based content analysis on ALL 14,786 videos
- [x] 9,528 phone-related videos identified
- [x] Creator stats updated (language, tier, engagement, phone_video_count)
- [x] All creators scored (Audience Fit + Content Proof)
- [x] SQLite database with full data
- [ ] YouTube captions — rate limited, retry with delays

## Week 2: Backend — DONE (Night 1)
- [x] Build product archetype classifier (rule-based)
- [x] Build Audience Fit scoring (0-100)
- [x] Build Content Proof scoring (0-100)
- [x] Build FastAPI with 5 endpoints (stats, analyze, creators, detail, compare)
- [x] All endpoints tested and working
- [ ] Flipkart/Amazon product scraper (browser automation) — PENDING

## Week 3: Frontend — DONE (Night 1)
- [x] Next.js 16 + Tailwind CSS 4 + Framer Motion
- [x] SearchHero — spectacular paste-a-link landing
- [x] LoadingSequence — 6-step engine visualization
- [x] OverviewBar — tier/language filters with counts
- [x] CreatorGrid — cards with score rings, compare checkboxes
- [x] CreatorPanel — slide-over with content fingerprint + video gallery
- [x] CompareView — side-by-side creator comparison
- [x] Dark mode, skeleton loading, animations
- [x] Connected to FastAPI backend

## v2 Rebuild — COMPLETED
- [x] Product scraper (URL-based, extracts brand/model/price/features)
- [x] Fix data quality (language detection, strict phone filter, format mix)
- [x] 3-dimension scoring engine (Brand+Price 30%, Feature 40%, Quality 30%)
- [x] Dynamic per-product matching (Realme vs iPhone = different results)
- [x] Demand Intelligence (competitive share of voice, language gaps, activation scenarios)
- [x] Flipkart vs Amazon comparison (859 vs 2665 associated videos)
- [x] Campaign Builder (INR budget, CPV, reach, language mix, CSV export)
- [x] CSV upload for creator audit endpoint
- [x] Outreach email draft endpoint
- [x] Frontend rebuilt (ProductCard, DemandIntelCard, CreatorGrid, CreatorPanel, CampaignBar, CampaignModal)
- [x] Integrations Hub page (12 integrations across 4 categories)
- [x] Insight Nudges (integration upsells in CampaignModal + CreatorPanel)
- [x] Instagram teaser (Phyllo integration nudge)

## Remaining
- [ ] Deploy to Vercel + Render for shareable URL
- [ ] Caption download with proper rate limiting (v3)
- [ ] More creators (expand search queries for Tamil/Telugu/Marathi)
- [ ] Mobile responsive polish
