# Quick Start: Vercel Deployment

## ✅ What Was Changed

1. **Created `/api` directory** with serverless functions:
   - `predict.py` - Main prediction endpoint  
   - `health.py` - Health check
   - `info.py` - Model information
   - `requirements.txt` - Python dependencies

2. **Added `vercel.json`** - Configuration for Vercel deployment

3. **Updated Frontend** - [ForecastingTool.tsx](src/components/ForecastingTool.tsx) now uses:
   - `http://localhost:5000/predict` in development
   - `/api/predict` in production (automatically)

4. **Created deployment tools**:
   - `check-deployment.ps1` - Verify setup before deploying
   - `VERCEL_DEPLOYMENT.md` - Complete deployment guide
   - `.vercelignore` - Exclude unnecessary files

## 🚀 Deploy Now

### Option 1: Vercel CLI (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"

That's it! Vercel auto-detects everything from `vercel.json`.

## 🧪 Test Locally First

### Terminal 1 - Backend:
```powershell
cd backend
python app.py
```

### Terminal 2 - Frontend:
```powershell
npm run dev
```

Visit http://localhost:5173 and test predictions.

## 📋 After Deployment

Your app will be at: `https://your-app.vercel.app`

Test endpoints:
- Frontend: `https://your-app.vercel.app/`
- Health: `https://your-app.vercel.app/api/health`
- Predict: `https://your-app.vercel.app/api/predict` (POST)

## ⚡ How It Works

### Development (Local)
```
Browser → http://localhost:5173 → http://localhost:5000/predict
         (Vite Dev Server)        (Flask Backend)
```

### Production (Vercel)
```
Browser → https://your-app.vercel.app → /api/predict
         (Static Site)                  (Serverless Function)
```

The frontend automatically detects the environment and uses the correct API endpoint!

## 🔧 Common Issues

### Issue: "CORS error"
✅ Already fixed - API functions include CORS headers

### Issue: "Model not loaded"  
✅ Models are included in deployment (0.37 MB - well under limits)

### Issue: Cold starts (slow first request)
⏱️ Normal for serverless - subsequent requests are fast

## 📚 Full Documentation

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete guide.

---

**Ready to deploy?** Run: `vercel`
