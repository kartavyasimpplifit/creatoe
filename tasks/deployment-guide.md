# Deployment Guide for Creatoe

## CURRENTLY LIVE

**Frontend (Vercel):** https://frontend-eta-five-22.vercel.app
**Backend API (Cloudflare Tunnel):** https://winds-angle-strengthening-decide.trycloudflare.com

**GitHub Repo (unified):** https://github.com/kartavyasimpplifit/creatoe

## Architecture

```
[Vercel - Frontend]  ──→  [Backend API]  ──→  [SQLite DB]
  Next.js 16              FastAPI + uvicorn     creator_intel.db
  frontend/               backend/              data/
```

## Authentication (DONE)

- **GitHub CLI:** Authenticated as `kartavyasimpplifit`
- **Vercel CLI:** Authenticated, project `kartavya-atris-projects/frontend`
- **Git:** `C:\Program Files\Git\cmd\git.exe` (add to PATH: `$env:PATH = "C:\Program Files\GitHub CLI;" + "C:\Program Files\Git\cmd;" + $env:PATH`)

## Quick Deploy Commands

### Push code changes
```powershell
$env:PATH = "C:\Program Files\GitHub CLI;" + "C:\Program Files\Git\cmd;" + $env:PATH
cd "c:\Graph Ai"
git add -A
git commit -m "description"
git push origin master
```

### Redeploy frontend
```powershell
cd "c:\Graph Ai\frontend"
npx vercel --yes --prod
```

### Start backend tunnel (when Cloudflare tunnel expires)
```powershell
npx cloudflared tunnel --url http://localhost:8000
# Copy the new URL
# Update Vercel env: npx vercel env rm NEXT_PUBLIC_API_URL production --yes
# echo "NEW_URL" | npx vercel env add NEXT_PUBLIC_API_URL production
# Redeploy: npx vercel --yes --prod
```

### Update Vercel env var (when backend URL changes)
```powershell
cd "c:\Graph Ai\frontend"
npx vercel env rm NEXT_PUBLIC_API_URL production --yes
echo "https://NEW-BACKEND-URL" | npx vercel env add NEXT_PUBLIC_API_URL production
npx vercel --yes --prod
```

## Deploy Backend to Render (Permanent URL)

1. Go to https://dashboard.render.com
2. New Web Service → Connect GitHub → select `kartavyasimpplifit/creatoe`
3. Settings:
   - **Name:** creatoe-api
   - **Root Directory:** (leave empty)
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
4. Copy the Render URL (e.g., `https://creatoe-api.onrender.com`)
5. Update Vercel env var to the Render URL (see above)

## Database

- **File:** `data/creator_intel.db` (37.5MB, committed to git)
- **Stats:** 1,510 creators, 432 phone-focused, 14,786 videos, 6 languages
- **Note:** Render free tier has ephemeral filesystem. The DB is committed to git so it's available on each deploy.

## Important Notes

- Backend cold-starts on Render free tier (~30 seconds). Warm it up before demos.
- Cloudflare tunnel URLs change when tunnels restart. Update Vercel env var when this happens.
- The local backend must be running at `http://localhost:8000` for tunnel to work.
- CORS is set to `*` in the backend — works with any frontend origin.
- Frontend `.env.local` should match the current backend URL for local dev.

## Vercel Project Info

- **Project:** kartavya-atris-projects/frontend
- **Alias:** https://frontend-eta-five-22.vercel.app
- **Env Var:** `NEXT_PUBLIC_API_URL` = current backend URL
