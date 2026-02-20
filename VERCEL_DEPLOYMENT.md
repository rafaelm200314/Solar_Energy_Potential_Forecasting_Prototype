# Deploying to Vercel - Complete Guide

This guide explains how to deploy your Solar Energy Forecasting app to Vercel with both the React frontend and Python backend.

## 🏗️ Architecture

- **Frontend**: React + Vite (builds to `/dist`)
- **Backend**: Python Serverless Functions in `/api` directory
- **Models**: Pickle files in `/backend/models`

## 📁 Project Structure for Vercel

```
Solar_Energy_Potential_Forecasting_Prototype/
├── api/                    # Vercel Python Serverless Functions
│   ├── predict.py         # Main prediction endpoint
│   ├── health.py          # Health check
│   ├── info.py            # Model info
│   └── requirements.txt   # Python dependencies for serverless functions
├── backend/               # Shared backend code
│   ├── models/           # ML model files (.pkl)
│   ├── predictor.py      # Prediction logic
│   └── src/
│       └── model_training.py  # Model classes
├── src/                   # React frontend source
├── dist/                  # Built frontend (auto-generated)
└── vercel.json           # Vercel configuration
```

## 🚀 Deployment Steps

### 1. **Prepare Your Repository**

Make sure all files are committed to Git:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. **Deploy to Vercel**

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: (your account)
# - Link to existing project: N
# - Project name: solar-energy-forecasting
# - In which directory is your code: ./
# - Want to override settings: N
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the settings from `vercel.json`
5. Click "Deploy"

### 3. **Monitor Deployment**

Vercel will:
1. Install Node dependencies (`package.json`)
2. Build the frontend (`npm run build`)
3. Set up Python serverless functions in `/api`
4. Install Python dependencies (`api/requirements.txt`)
5. Deploy everything

### 4. **Verify Deployment**

Once deployed, test these endpoints:

```
https://your-app.vercel.app/          # Frontend
https://your-app.vercel.app/api/health  # Health check
https://your-app.vercel.app/api/info    # Model info
https://your-app.vercel.app/api/predict # Prediction (POST)
```

## ⚙️ Configuration Details

### Frontend API Calls

The frontend automatically switches between environments:

- **Development** (`npm run dev`): `http://localhost:5000/predict`
- **Production** (Vercel): `/api/predict`

This is handled in [ForecastingTool.tsx](src/components/ForecastingTool.tsx#L112):

```typescript
const apiUrl = import.meta.env.DEV 
  ? 'http://localhost:5000/predict'
  : '/api/predict';
```

### Python Dependencies

The `/api/requirements.txt` file specifies:
```
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
joblib==1.3.2
```

### Model Files

The ML model files (`fi_adaboost.pkl`, `baseline_adaboost.pkl`) are deployed with your app. 

⚠️ **Important**: Vercel has deployment size limits:
- Free plan: 100 MB max per deployment
- Pro plan: 200 MB max per deployment

Check your model sizes:
```bash
ls -lh backend/models/*.pkl
```

If models are too large, consider:
1. Using a separate storage service (S3, GCS)
2. Loading models from URLs
3. Quantizing/compressing models

## 🛠️ Local Development

Run both frontend and backend locally:

### Terminal 1 - Backend:
```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

### Terminal 2 - Frontend:
```bash
npm run dev
# Vite dev server runs on http://localhost:5173
```

The frontend will automatically call the local backend in development mode.

## 🐛 Troubleshooting

### Issue: "Model not found" error on Vercel

**Solution**: Ensure model files are not in `.gitignore` or `.vercelignore`. They must be committed to the repository.

```bash
git add -f backend/models/*.pkl
git commit -m "Add model files"
git push
```

### Issue: "Module import error" on Vercel

**Solution**: Check that all imports work with relative paths. Vercel's Python runtime is isolated per function.

### Issue: Slow cold starts

**Cause**: Serverless functions have cold start time when loading large ML models.

**Solutions**:
- Keep models < 50MB
- Consider Vercel Pro for better cold start performance
- Use model caching strategies

### Issue: CORS errors

**Solution**: The API functions include CORS headers. If issues persist, check browser console and verify the API endpoint URL.

## 📊 Monitoring

### View Logs

```bash
vercel logs
```

Or view in Vercel Dashboard:
1. Go to your project
2. Click "Functions" tab
3. Click on a function to see logs

### Check Function Performance

In Vercel Dashboard:
1. Go to "Analytics" tab
2. View function execution times
3. Monitor error rates

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

```bash
git add .
git commit -m "Update model or code"
git push
```

Your app will automatically redeploy within minutes.

## 🌟 Best Practices

1. **Environment Variables**: Store API keys in Vercel Environment Variables (Dashboard → Settings → Environment Variables)

2. **Branch Deployments**: Push to different branches for preview deployments
   - `main` → Production
   - `dev` → Preview deployment

3. **Model Versioning**: Include version numbers in model filenames for easier rollbacks

4. **Error Handling**: Monitor Vercel logs regularly for API errors

## 📚 Resources

- [Vercel Python Runtime](https://vercel.com/docs/serverless-functions/runtimes/python)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)

---

Need help? Check the [Vercel Community](https://github.com/vercel/vercel/discussions) or open an issue in this repository.
