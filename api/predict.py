"""
Vercel Serverless Function for Solar Energy Prediction
"""
import os
import sys
import json
from http.server import BaseHTTPRequestHandler

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend', 'src'))

try:
    # Import FIAdaBoostRegressor for pickle compatibility
    from model_training import FIAdaBoostRegressor
    sys.modules['__main__'].FIAdaBoostRegressor = FIAdaBoostRegressor
    from predictor import SolarEnergyPredictor
    IMPORT_SUCCESS = True
except Exception as e:
    print(f"Import error: {e}")
    IMPORT_SUCCESS = False

# Initialize predictor (cached across invocations)
predictor = None

def init_predictor():
    """Initialize predictor singleton"""
    global predictor
    if predictor is None:
        try:
            model_path = os.path.join(
                os.path.dirname(__file__), 
                '..', 
                'backend', 
                'models', 
                'fi_adaboost.pkl'
            )
            predictor = SolarEnergyPredictor(fi_model_path=model_path)
            print("✓ Predictor initialized successfully")
        except Exception as e:
            print(f"✗ Error initializing predictor: {e}")
            raise


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        # Check if imports succeeded
        if not IMPORT_SUCCESS:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Failed to import required modules'
            }).encode())
            return
        
        # Initialize predictor on first request
        if predictor is None:
            try:
                init_predictor()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': f'Model initialization failed: {str(e)}'
                }).encode())
                return
        
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            # Validate required fields
            if 'lat' not in data or 'lng' not in data:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Missing required fields: lat and lng'
                }).encode())
                return
            
            lat = float(data['lat'])
            lng = float(data['lng'])
            month = data.get('month', None)
            
            if month is not None:
                month = int(month)
                if month < 1 or month > 12:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'error': 'Month must be between 1 and 12'
                    }).encode())
                    return
            
            # Validate coordinates (rough bounds for Philippines)
            if not (4 <= lat <= 21 and 116 <= lng <= 127):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Coordinates outside Philippines region'
                }).encode())
                return
            
            # Make prediction
            result = predictor.predict(lat, lng, month)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        
        except ValueError as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': f'Invalid input: {str(e)}'
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': f'Prediction failed: {str(e)}'
            }).encode())
