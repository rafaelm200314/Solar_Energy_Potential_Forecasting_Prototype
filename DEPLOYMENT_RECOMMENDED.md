# Recommended Deployment Strategy for ML Apps

## Problem with Vercel Python Functions
Vercel's serverless Python functions have limitations for ML models:
- ❌ Cold starts (slow first request)
- ❌ 50MB function size limit
- ❌ Complex dependency management
- ❌ Path issues with model files

## ✅ Recommended: Split Deployment

### Frontend → Vercel (Free, Fast)
### Backend → Railway/Render (Better for Python ML)

---

## Step 1: Deploy Backend to Railway

**Railway** is perfect for Python ML apps with persistent processes.

### A. Create `railway.json` (Already done!)

Just push your code and Railway auto-detects Python.

### B. Deploy to Railway

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

Or use Railway Dashboard:
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory: `/backend`
5. Railway auto-detects Python and runs `python app.py`

### C. Get Your Backend URL

Railway will give you a URL like: `https://your-app.railway.app`

---

## Step 2: Deploy Frontend to Vercel

### A. Set Environment Variable in Vercel

1. Go to your Vercel project settings
2. Click "Environment Variables"
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app.railway.app` (your Railway URL)
   - **Environments**: Production, Preview

### B. Deploy Frontend

```powershell
# Simple - just push! Vercel auto-deploys
git add .
git commit -m "Configure for split deployment"
git push origin main
```

Vercel will:
- Build your React app
- Use your Railway backend URL from `VITE_API_URL`
- Deploy static files (fast!)

---

## Alternative: Deploy Backend to Render

Render is another great option (also free tier available).

### Deploy to Render:

1. Go to https://render.com
2. "New" → "Web Service"
3. Connect your GitHub repo  
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
5. Deploy!

Get your Render URL and set it as `VITE_API_URL` in Vercel.

---

## How It Works

```
┌─────────────────────────────────────┐
│   Vercel (Frontend)                 │
│   https://your-app.vercel.app       │
│                                     │
│   React + Vite                      │
│   Static Site (Fast!)               │
└──────────────┬──────────────────────┘
               │ fetch(VITE_API_URL)
               │
               ▼
┌─────────────────────────────────────┐
│   Railway/Render (Backend)          │
│   https://your-app.railway.app      │
│                                     │
│   Flask + ML Model                  │
│   Always Running (No Cold Starts!)  │
└─────────────────────────────────────┘
```

---

## Local Development

Still works the same!

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
# Runs on http://localhost:5173
# Auto-uses localhost:5000 in dev mode
```

---

## Summary

| What | Where | Why |
|------|-------|-----|
| **Frontend** | Vercel | Free, fast CDN, auto-deploy |
| **Backend** | Railway/Render | Better Python ML support, persistent process |
| **Models** | With backend | No size limits, faster loading |

This is the **industry standard** for deploying ML web apps! 🚀

---

## Quick Commands

```powershell
# 1. Deploy backend to Railway
cd backend
railway up

# 2. Get Railway URL and add to Vercel as VITE_API_URL

# 3. Push to GitHub (Vercel auto-deploys frontend)
git push origin main
```

Done! Your app is live. ✅
