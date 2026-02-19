# Solar Energy Forecasting Backend

Python Flask API server that serves predictions from the trained **FI-AdaBoost** model.

## 🏗️ Architecture

```
backend/
├── models/
│   ├── fi_adaboost.pkl          # Trained FI-AdaBoost model
│   └── baseline_adaboost.pkl    # Baseline AdaBoost model
├── src/
│   └── model_training.py        # FIAdaBoostRegressor class
├── app.py                       # Flask API server
├── predictor.py                 # Feature engineering & prediction
└── requirements.txt             # Python dependencies
```

## 📋 Prerequisites

- **Python 3.8+** (recommended: Python 3.9 or 3.10)
- **pip** (Python package manager)

Check your installation:
```bash
python --version
pip --version
```

## 🚀 Setup Instructions

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Verify Model Files

Ensure the following files exist:
- `models/fi_adaboost.pkl` ✓
- `models/baseline_adaboost.pkl` ✓

### 5. Start the Server

```bash
python app.py
```

The server will start on: **http://localhost:5000**

You should see:
```
==================================================
Solar Energy Forecasting API Server
==================================================

Endpoints:
  GET  /health  - Health check
  POST /predict - Make prediction
  GET  /info    - Model information

Starting server on http://localhost:5000
==================================================
```

## 🔌 API Endpoints

### 1. Health Check
```http
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### 2. Make Prediction
```http
POST http://localhost:5000/predict
Content-Type: application/json

{
  "lat": 7.0731,
  "lng": 125.6128,
  "month": 1  // optional, defaults to current month
}
```

**Response:**
```json
{
  "solarPotential": 5.34,
  "rooftopArea": 152.03,
  "solarExposureIndex": -106.37,
  "orientation": "Southeast",
  "azimuth": 165.5,
  "temperature": 28.5,
  "humidity": 75.2,
  "clearSkyRatio": 0.52,
  "orientationScore": -0.25,
  "shadingFactor": 0.15,
  "tiltFactor": 0.99,
  "sunshineHours": 8.01,
  "cloudCover": 48.0
}
```

### 3. Model Information
```http
GET http://localhost:5000/info
```

**Response:**
```json
{
  "model": "FI-AdaBoost Regressor",
  "description": "Feature Importance-weighted AdaBoost for Solar Energy Forecasting",
  "target": "ALLSKY_SFC_SW_DWN (kWh/m²/day)",
  "features": [
    "T2M (Temperature at 2m)",
    "RH2M (Relative Humidity at 2m)",
    "ALLSKY_KT (Clear Sky Index)",
    "month_sin (Seasonal sine)",
    "month_cos (Seasonal cosine)",
    "season (Dry/Rainy)",
    "rooftop_area_sq_m",
    "orientation_score",
    "shading_factor",
    "tilt_factor",
    "solar_exposure_index"
  ],
  "version": "1.0.0"
}
```

## 🧪 Testing the API

### Using cURL:

```bash
# Health check
curl http://localhost:5000/health

# Make prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d "{\"lat\": 7.0731, \"lng\": 125.6128}"
```

### Using Python:

```python
import requests

# Make prediction
response = requests.post('http://localhost:5000/predict', json={
    'lat': 7.0731,
    'lng': 125.6128
})

print(response.json())
```

### Using the Predictor Directly:

```bash
python predictor.py
```

## 📊 Model Features

The FI-AdaBoost model uses these input features:

1. **Weather Features:**
   - `T2M`: Temperature at 2 meters (°C)
   - `RH2M`: Relative Humidity at 2 meters (%)
   - `ALLSKY_KT`: Clear Sky Index (0-1)

2. **Temporal Features:**
   - `month_sin`, `month_cos`: Seasonal cyclical encoding
   - `season`: Dry (1) or Rainy (0) season

3. **Topographical Features:**
   - `rooftop_area_sq_m`: Rooftop area in square meters
   - `orientation_score`: Orientation quality (-1 to 1)
   - `shading_factor`: Shading from nearby structures (0-1)
   - `tilt_factor`: Roof tilt optimality (0-1)
   - `solar_exposure_index`: Combined metric

## 🛠️ Troubleshooting

### Port Already in Use
If port 5000 is already in use:

**Option 1:** Change port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Use port 5001
```

**Option 2:** Kill process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Model File Not Found
Ensure the model files are in the correct location:
```
backend/
└── models/
    ├── fi_adaboost.pkl          ✓
    └── baseline_adaboost.pkl    ✓
```

### Import Errors
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### CORS Issues
If the frontend can't connect, ensure `flask-cors` is installed and CORS is enabled in `app.py`.

## 📝 Development

### Running in Development Mode
The server runs in debug mode by default, which enables:
- Auto-reload on code changes
- Detailed error messages
- Debug console

### Production Deployment
For production, use a WSGI server like **Gunicorn**:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📄 License

Part of the Solar Energy Potential Forecasting system.
