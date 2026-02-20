# Railway Deployment Guide

## Quick Deploy to Railway

### Step 1: Deploy Backend

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will ask for the root directory - **Enter: `backend`**
6. Click "Deploy"

Railway will automatically:
- Detect Python
- Install dependencies from `requirements.txt`
- Run `gunicorn app:app` (from Procfile)
- Assign a public URL

### Step 2: Get Your Backend URL

1. In Railway dashboard, click your service
2. Click "Settings" tab
3. Find "Domains" section
4. Copy your public URL (e.g., `https://solar-backend-production-xxxx.up.railway.app`)

### Step 3: Test Your Backend

Open your browser or use curl:

```bash
# Test root endpoint
curl https://your-railway-url.railway.app/

# Test health check
curl https://your-railway-url.railway.app/health

# Test prediction
curl -X POST https://your-railway-url.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{"lat": 7.0731, "lng": 125.6128}'
```

Expected response:
```json
{
  "solarPotential": 5.34,
  "rooftopArea": 152.03,
  ...
}
```

### Step 4: Connect Frontend

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.railway.app` (your Railway URL - **NO trailing slash**)
3. Save and redeploy

---

## Troubleshooting

### Issue: "Unexpected end of JSON output"

**Causes:**
1. Backend not running on Railway
2. Wrong URL in `VITE_API_URL`
3. CORS issues

**Debug Steps:**

1. **Check Railway logs:**
   - In Railway dashboard → Your service → "Deployments" tab
   - Click latest deployment → View logs
   - Look for errors

2. **Test backend directly:**
   ```bash
   curl https://your-railway-url.railway.app/health
   ```
   
   Should return:
   ```json
   {"status": "healthy", "model_loaded": true}
   ```

3. **Check frontend is using correct URL:**
   - Open browser console (F12)
   - Make a prediction
   - Check Network tab
   - Verify it's calling the correct Railway URL

### Issue: Model not loading

**Check Railway logs for:**
```
✗ Error initializing predictor: [error message]
```

**Possible fixes:**
- Model files might be too large (Railway free tier has limits)
- Missing dependencies

### Issue: CORS errors

Backend already has CORS enabled. If still getting CORS errors:
1. Verify Railway URL has HTTPS (not HTTP)
2. Check browser console for specific CORS error
3. Ensure no trailing slash in `VITE_API_URL`

---

## Environment Variables

### In Railway (Backend):
None required - PORT is automatically set by Railway

### In Vercel (Frontend):
- `VITE_API_URL` = Your Railway backend URL (e.g., `https://solar-backend.railway.app`)

---

## Cost

Both services have generous free tiers:

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Railway** | $5 free credit/month | ~500 hours uptime, good for projects |
| **Vercel** | Unlimited | Unlimited bandwidth for hobby projects |

---

## Monitoring

### Check if backend is running:
```bash
curl https://your-railway-url.railway.app/health
```

### View Railway logs:
Railway Dashboard → Your Service → Deployments → View Logs

### Check Vercel build:
Vercel Dashboard → Your Project → Deployments

---

## Next Steps After Deployment

1. ✅ Backend deployed to Railway
2. ✅ Frontend deployed to Vercel
3. ✅ `VITE_API_URL` set in Vercel
4. ✅ Test the app at your Vercel URL

Your solar energy forecasting app is now live! 🚀
