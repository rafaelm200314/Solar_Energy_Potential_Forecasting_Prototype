"""
Flask API Server for Solar Energy Forecasting
Serves predictions from the trained FI-AdaBoost model
Also serves the React frontend build as static files
"""
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import sys

# Pickle compatibility: Import FIAdaBoostRegressor before loading model
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from model_training import FIAdaBoostRegressor
sys.modules['__main__'].FIAdaBoostRegressor = FIAdaBoostRegressor

from predictor import SolarEnergyPredictor

# Get absolute paths
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
DIST_DIR = os.path.join(PROJECT_ROOT, 'dist')

print(f"Backend directory: {BACKEND_DIR}")
print(f"Project root: {PROJECT_ROOT}")
print(f"Dist directory: {DIST_DIR}")
print(f"Dist exists: {os.path.exists(DIST_DIR)}")

app = Flask(__name__, 
    static_folder=DIST_DIR,
    static_url_path='/')
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all origins

# Initialize predictor
try:
    predictor = SolarEnergyPredictor()
    print("✓ Predictor initialized successfully")
except Exception as e:
    print(f"✗ Error initializing predictor: {e}")
    predictor = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor is not None
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict solar energy potential for a location
    
    Request body:
        {
            "lat": 7.0731,
            "lng": 125.6128,
            "month": 1  // optional, defaults to current month
        }
    
    Response:
        {
            "solarPotential": 5.34,
            "rooftopArea": 152.03,
            "solarExposureIndex": -106.37,
            "orientation": "Southeast",
            "azimuth": 165.5,
            "temperature": 28.5,
            "humidity": 75.2,
            "clearSkyRatio": 0.52,
            ...
        }
    """
    if predictor is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 500
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'lat' not in data or 'lng' not in data:
            return jsonify({
                'error': 'Missing required fields: lat and lng'
            }), 400
        
        lat = float(data['lat'])
        lng = float(data['lng'])
        month = data.get('month', None)
        
        if month is not None:
            month = int(month)
            if month < 1 or month > 12:
                return jsonify({
                    'error': 'Month must be between 1 and 12'
                }), 400
        
        # Validate coordinates (rough bounds for Philippines)
        if not (4 <= lat <= 21 and 116 <= lng <= 127):
            return jsonify({
                'error': 'Coordinates outside Philippines region'
            }), 400
        
        # Make prediction
        result = predictor.predict(lat, lng, month)
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({
            'error': f'Invalid input: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500


@app.route('/info', methods=['GET'])
def model_info():
    """Get information about the model"""
    return jsonify({
        'model': 'FI-AdaBoost Regressor',
        'description': 'Feature Importance-weighted AdaBoost for Solar Energy Forecasting',
        'target': 'ALLSKY_SFC_SW_DWN (kWh/m²/day)',
        'features': [
            'T2M (Temperature at 2m)',
            'RH2M (Relative Humidity at 2m)',
            'ALLSKY_KT (Clear Sky Index)',
            'month_sin (Seasonal sine)',
            'month_cos (Seasonal cosine)',
            'season (Dry/Rainy)',
            'rooftop_area_sq_m',
            'orientation_score',
            'shading_factor',
            'tilt_factor',
            'solar_exposure_index'
        ],
        'version': '1.0.0'
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React frontend for all non-API routes"""
    # Skip static files and API endpoints
    if path.startswith('api') or path.startswith('predict') or path.startswith('health') or path.startswith('info'):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    # Check if it's a static file in dist
    file_path = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    
    # Serve index.html for React routing
    index_file = os.path.join(DIST_DIR, 'index.html')
    if os.path.exists(index_file):
        return send_from_directory(DIST_DIR, 'index.html')
    
    return jsonify({
        'error': 'Frontend not available',
        'dist_exists': os.path.exists(DIST_DIR),
        'dist_path': DIST_DIR
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "="*50)
    print("Solar Energy Forecasting API Server")
    print("="*50)
    print("\nEndpoints:")
    print("  GET  /health  - Health check")
    print("  POST /predict - Make prediction")
    print("  GET  /info    - Model information")
    print(f"\nStarting server on port {port}")
    print("="*50 + "\n")
    
    app.run(debug=False, host='0.0.0.0', port=port)
