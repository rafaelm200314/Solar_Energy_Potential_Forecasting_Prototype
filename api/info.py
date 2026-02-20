"""
Vercel Serverless Function for Model Info
"""
import json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Get information about the model"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
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
        }).encode())
