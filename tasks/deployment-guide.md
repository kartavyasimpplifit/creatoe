# Deployment Guide for Creatoe

## What Needs to Deploy

### Backend (Python FastAPI)
- Location: `c:\Graph Ai\backend\`
- Entry: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
- Database: SQLite file at `data/creator_intel.db` (ships with the app)
- Dependencies: `backend/requirements.txt`
- Platform: **Render** (free tier, web service)

### Frontend (Next.js)
- Location: `c:\Graph Ai\frontend\`
- Build: `npm run build`
- Platform: **Vercel** (free tier)
- Env var needed: `NEXT_PUBLIC_API_URL=<render-backend-url>`

## Tools Already Installed
- **Vercel CLI:** v50.19.1 at `C:\Users\GRAM\AppData\Roaming\npm\vercel` (needs `vercel login` — token expired)
- **GitHub CLI:** v2.89.0 (needs `gh auth login` — not authenticated)
- **Git:** v2.53.0 configured with user `Kartavya Atri <kartavya@creatorlens.ai>`
- **Node:** v24.13.1
- **npm:** v11.8.0

## Step-by-Step Deployment

### 1. Authenticate (one-time, needs browser click from user)
```bash
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
gh auth login    # Opens browser for GitHub auth
vercel login     # Opens browser for Vercel auth
```

### 2. Push to GitHub
```bash
cd "c:\Graph Ai"
gh repo create creatoe --private --source=. --push
```

### 2. Deploy Backend to Render
Option A: Via Render dashboard (render.com)
- New Web Service → Connect GitHub repo
- Root directory: `.` 
- Build command: `pip install -r backend/requirements.txt`
- Start command: `cd /opt/render/project/src && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- Copy the URL (e.g., `https://creatoe-api.onrender.com`)

Option B: Via render.yaml (Infrastructure as Code)
- File already created below

### 3. Deploy Frontend to Vercel
```bash
cd frontend
npx vercel --prod
# Set env var: NEXT_PUBLIC_API_URL=https://creatoe-api.onrender.com
```

### 4. The SQLite Problem
Render's free tier has ephemeral filesystem — the SQLite DB resets on every deploy.
Solutions:
- **For demo (simplest):** Include the DB file in the git repo. It's ~50MB. Add to git LFS or just commit it directly.
- **For production:** Migrate to Supabase PostgreSQL (free tier).

For the demo, committing the DB file is fine. The Sr. Director won't hit the DB hard enough to matter.

## render.yaml (Backend)
```yaml
services:
  - type: web
    name: creatoe-api
    runtime: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.9
```

## Vercel Config (Frontend)
The `frontend/` directory is a standard Next.js app. Vercel auto-detects it.
Just set the env var `NEXT_PUBLIC_API_URL` in Vercel project settings.

## Important Notes
- Backend cold-starts on Render free tier (~30 seconds). Warm it up before the demo.
- Frontend on Vercel is instant (edge CDN).
- The SQLite DB must be in the repo for Render to have data. Commit `data/creator_intel.db`.
- CORS is already set to `*` in the backend — works with any frontend origin.
