# 🚀 Quick Start Guide

## TL;DR - Get Started in 3 Steps

### Step 1: Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
✓ Backend running on http://localhost:5000

### Step 2: Start Frontend (New Terminal)
```bash
npm install
npm run dev
```
✓ Frontend running on http://localhost:5173

### Step 3: Use the App
Open http://localhost:5173 in your browser and start predicting! 🌞

---

## Detailed Setup

### For Backend (Terminal 1)

```powershell
# Navigate to backend folder
cd backend

# Optional: Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

**Expected Output:**
```
✓ Predictor initialized successfully
Solar Energy Forecasting API Server
Starting server on http://localhost:5000
```

### For Frontend (Terminal 2)

```powershell
# From project root
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173
```

---

## Troubleshooting

### ❌ "Model not found"
**Solution:** Make sure these files exist:
- `backend/models/fi_adaboost.pkl` ✓
- `backend/models/baseline_adaboost.pkl` ✓

### ❌ "Port 5000 already in use"
**Solution:** Kill the process or change port in `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```
Then update frontend API URL in `src/components/ForecastingTool.tsx`

### ❌ "Failed to get prediction" in browser
**Solution:** 
1. Check backend is running (terminal 1 should be active)
2. Check console for errors
3. Try: http://localhost:5000/health in browser (should return `{"status": "healthy"}`)

### ❌ Python "Module not found" errors
**Solution:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Testing the API

### Quick API Test:
Open http://localhost:5000/health in your browser.

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Test Prediction with cURL:
```bash
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d "{\"lat\": 7.0731, \"lng\": 125.6128}"
```

---

## What Each Part Does

### Backend (`backend/`)
- **Flask API Server** - Handles prediction requests
- **FI-AdaBoost Model** - Trained machine learning model
- **Feature Engineering** - Computes weather, temporal, and rooftop features

### Frontend (`src/`)
- **React UI** - Interactive map and forms
- **Leaflet Map** - Location picker
- **Results Display** - Shows predictions and visualizations

---

## File Structure

```
Solar_Energy_Potential_Forecasting_Prototype/
├── backend/                    ← Python API Server
│   ├── models/
│   │   ├── fi_adaboost.pkl    ← Trained model
│   │   └── baseline_adaboost.pkl
│   ├── src/
│   │   └── model_training.py   ← FIAdaBoost class
│   ├── app.py                  ← Flask server
│   ├── predictor.py            ← Prediction logic
│   ├── requirements.txt        ← Python deps
│   └── README.md               ← Backend docs
│
├── src/                        ← Frontend React App
│   ├── components/
│   │   ├── ForecastingTool.tsx ← Main prediction UI
│   │   └── ...
│   └── App.tsx
│
├── package.json                ← Node.js config
└── README.md                   ← Main docs
```

---

## Common Commands

### Backend Commands
```bash
# Start backend
cd backend
python app.py

# Test backend (Python)
python predictor.py

# Check dependencies
pip list
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Next Steps

1. ✅ Start both servers
2. ✅ Open http://localhost:5173
3. ✅ Click on map to select location
4. ✅ Click "Predict Solar Potential"
5. ✅ View results!

**Need help?** Check the full README.md or backend/README.md for detailed documentation.
