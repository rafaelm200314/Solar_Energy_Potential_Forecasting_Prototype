# Railway-Only Deployment Guide

## One-Click Deploy to Railway ✅

This app now deploys entirely on **Railway** - one simple platform for everything!

### What Gets Deployed:
- ✅ **Frontend**: React/Vite (built automatically)
- ✅ **Backend**: Flask API with ML model  
- ✅ **Everything on one domain**: No CORS issues!

---

## Step 1: Deploy to Railway

### Option A: GitHub Integration (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository: `Solar_Energy_Potential_Forecasting_Prototype`
5. Railway will auto-detect and deploy!

**That's it!** Railway will:
- ✅ Detect Node.js and Python
- ✅ Run: `npm install && npm run build`
- ✅ Run: `pip install -r backend/requirements.txt`
- ✅ Start: Flask backend (which serves the React frontend)

### Option B: Railway CLI

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd path/to/Solar_Energy_Potential_Forecasting_Prototype
railway init

# Follow prompts, then:
railway up
```

---

## Step 2: Get Your Live URL

1. Open Railway dashboard
2. Click your project
3. You'll see a live URL like: `https://solar-energy-forecasting-production-xxxx.up.railway.app`
4. **That's your app!** Visit it now.

---

## Step 3: Test Your App

1. Open your Railway URL
2. Click on a location on the map
3. Click "Predict Solar Potential"
4. ✅ Should show predictions!

---

## How It Works (Architecture)

```
┌──────────────────────────────────────────────────┐
│          Railway (Single Platform)               │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  React Frontend (served as static)       │   │
│  │  Routes: /                               │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Flask Backend API                       │   │
│  │  Routes: /predict, /health, /info        │   │
│  │  ML Model: FI-AdaBoost                   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Public URL: https://your-app.railway.app       │
└──────────────────────────────────────────────────┘
```

**Single domain = No CORS issues, no missing backend errors!**

---

## What If Deployment Fails?

### Check Railway Logs:
1. Railway dashboard → Your Project
2. Click "Deployments" tab
3. Click latest deployment
4. Click "View Logs"

**Look for:**
```
✓ Predictor initialized successfully
INFO:  * Running on (...)
```

### Common Issues:

**Issue: "Failed to get VITE_API_URL"**
- No problem! This message is from old config
- App should still work (uses relative URLs)
- Ignore it ✓

**Issue: "ModuleNotFoundError"**
- Check Railway logs
- Ensure requirements.txt has all dependencies
- Wait for rebuild and redeploy

**Issue: "Cannot find dist folder"**
- Frontend build might have failed
- Check logs for npm errors
- Ensure package.json exists at root

---

## Local Development

Works exactly as before:

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
# Calls backend at http://localhost:5000
```

---

## Environment Variables

If you need environment variables (for future use):

1. Railway dashboard → Your project
2. Click your service
3. Click "Variables" tab
4. Add key-value pairs
5. Re-deploy

---

## Database (Future)

Want to add a database? Railway makes it easy:

1. Railway dashboard → Your project
2. Click "+ New Service"
3. Select PostgreSQL, MySQL, MongoDB, etc.
4. Railway auto-connects and sets DATABASE_URL env var

---

## Costs

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Railway** | $5 free credit/month | Perfect for hobby projects |
| **Included** | Unlimited | Build hours, deployments, storage |

Your app will likely cost $0-2/month! 🎉

---

## Monitoring & Logs

**View logs in real-time:**
```bash
railway logs --tail
```

Or in Railway dashboard:
1. Your project → Deployments tab
2. Click "View Logs" on any deployment

---

## Redeploy

**Automatic:**
- Push to GitHub → Railway auto-deploys
```bash
git push origin main
```

**Manual (if needed):**
- Railway dashboard → Your service
- Click "Redeploy" button
- Or use CLI: `railway up`

---

## Custom Domain

Want a custom domain?

1. Railway dashboard → Your project → Settings
2. Find "Domains" section
3. Click "Add Custom Domain"
4. Point your domain DNS to Railway
5. Easy! ✅

---

## Done! 🎉

Your Solar Energy Forecasting app is now live on Railway!

**Share your URL:** `https://your-app.railway.app`

No more "backend not running" errors. No more CORS headaches. Just one simple deployment! 🚀
