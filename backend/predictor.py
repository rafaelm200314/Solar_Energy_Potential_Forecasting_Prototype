"""
Solar Energy Predictor
Handles feature engineering and model inference
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

# Add src to path for FIAdaBoostRegressor import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from model_training import FIAdaBoostRegressor


class SolarEnergyPredictor:
    """
    Manages solar energy predictions using trained FI-AdaBoost model
    """
    
    def __init__(self, model_path=None):
        """Initialize predictor with model path"""
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(__file__), 
                'models', 
                'fi_adaboost.pkl'
            )
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"Loading model from {model_path}...")
        self.model = joblib.load(model_path)
        print("Model loaded successfully!")
        
    def compute_temporal_features(self, month=None):
        """
        Compute temporal features for prediction
        
        Args:
            month: Month (1-12), defaults to current month
            
        Returns:
            dict with month_sin, month_cos, season
        """
        if month is None:
            month = datetime.now().month
            
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        
        # Philippines seasons (PAGASA): Dry (Dec-May) = 1, Rainy (Jun-Nov) = 0
        season = 1 if month in [12, 1, 2, 3, 4, 5] else 0
        
        return {
            'month_sin': month_sin,
            'month_cos': month_cos,
            'season': season
        }
    
    def compute_rooftop_features(self, lat, lng):
        """
        Estimate rooftop and topographical features based on location
        
        In production, this would query a spatial database or API.
        For now, we use reasonable estimates based on location.
        
        Args:
            lat: Latitude
            lng: Longitude
            
        Returns:
            dict with rooftop_area_sq_m, orientation_score, shading_factor, 
            tilt_factor, solar_exposure_index
        """
        # Simulate rooftop area (80-150 sq m typical for residential)
        np.random.seed(int(abs(lat * 1000 + lng * 1000)) % 2**32)
        rooftop_area = 85 + np.random.rand() * 65
        
        # Orientation score: cos(azimuth - 180)
        # Davao City optimal: South-facing (180°)
        # Estimate azimuth based on location variation
        azimuth = 155 + (lat - 7.0) * 10 + (lng - 125.0) * 5
        orientation_score = np.cos(np.radians(azimuth - 180))
        
        # Shading factor: urban areas have more shading (0-0.3)
        # Assume urban center has higher shading
        urban_proximity = 1.0 / (1 + np.sqrt((lat - 7.07)**2 + (lng - 125.61)**2) * 100)
        shading_factor = 0.1 + urban_proximity * 0.2
        shading_factor = np.clip(shading_factor, 0, 0.3)
        
        # Tilt factor: cos(|roof_tilt - optimal_tilt|)
        # Davao City optimal tilt: ~7.2° (latitude)
        roof_tilt = 0.0  # Assume flat roof
        optimal_tilt = abs(lat)
        tilt_factor = np.cos(np.radians(abs(roof_tilt - optimal_tilt)))
        
        # Solar exposure index: combined metric
        solar_exposure_index = (
            orientation_score * 
            rooftop_area * 
            (1 - shading_factor) * 
            tilt_factor
        )
        
        return {
            'rooftop_area_sq_m': rooftop_area,
            'orientation_score': orientation_score,
            'shading_factor': shading_factor,
            'tilt_factor': tilt_factor,
            'solar_exposure_index': solar_exposure_index,
            'azimuth': azimuth
        }
    
    def estimate_weather_features(self, lat, lng, month=None):
        """
        Estimate typical weather conditions for the location and season
        
        In production, this would use real-time weather APIs.
        For now, we use climatological averages for Davao region.
        
        Args:
            lat: Latitude
            lng: Longitude
            month: Month (1-12), defaults to current
            
        Returns:
            dict with T2M, RH2M, ALLSKY_KT
        """
        if month is None:
            month = datetime.now().month
        
        # Davao City typical climate
        # Temperature: 25-30°C year-round
        # Humidity: 70-90%
        # Clearness index: 0.45-0.55
        
        # Dry season (Dec-May): higher temp, lower humidity, higher clearness
        # Rainy season (Jun-Nov): slightly lower temp, higher humidity, lower clearness
        is_dry_season = month in [12, 1, 2, 3, 4, 5]
        
        if is_dry_season:
            T2M = 28.0 + np.random.randn() * 1.5
            RH2M = 75.0 + np.random.randn() * 8.0
            ALLSKY_KT = 0.50 + np.random.randn() * 0.05
        else:
            T2M = 27.0 + np.random.randn() * 1.5
            RH2M = 82.0 + np.random.randn() * 8.0
            ALLSKY_KT = 0.47 + np.random.randn() * 0.05
        
        return {
            'T2M': np.clip(T2M, 23, 32),
            'RH2M': np.clip(RH2M, 60, 95),
            'ALLSKY_KT': np.clip(ALLSKY_KT, 0.35, 0.60)
        }
    
    def predict(self, lat, lng, month=None):
        """
        Make solar energy potential prediction
        
        Args:
            lat: Latitude
            lng: Longitude
            month: Month (1-12), optional
            
        Returns:
            dict with prediction and all computed features
        """
        # Compute all features
        temporal = self.compute_temporal_features(month)
        weather = self.estimate_weather_features(lat, lng, month)
        rooftop = self.compute_rooftop_features(lat, lng)
        
        # Prepare feature vector in correct order
        # Expected: T2M, RH2M, ALLSKY_KT, month_sin, month_cos, season,
        #           rooftop_area_sq_m, orientation_score, shading_factor,
        #           tilt_factor, solar_exposure_index
        features = pd.DataFrame([{
            'T2M': weather['T2M'],
            'RH2M': weather['RH2M'],
            'ALLSKY_KT': weather['ALLSKY_KT'],
            'month_sin': temporal['month_sin'],
            'month_cos': temporal['month_cos'],
            'season': temporal['season'],
            'rooftop_area_sq_m': rooftop['rooftop_area_sq_m'],
            'orientation_score': rooftop['orientation_score'],
            'shading_factor': rooftop['shading_factor'],
            'tilt_factor': rooftop['tilt_factor'],
            'solar_exposure_index': rooftop['solar_exposure_index']
        }])
        
        # Make prediction
        solar_potential = self.model.predict(features)[0]
        
        # Prepare result
        result = {
            'solarPotential': float(solar_potential),
            'rooftopArea': float(rooftop['rooftop_area_sq_m']),
            'solarExposureIndex': float(rooftop['solar_exposure_index']),
            'orientation': self._get_orientation_label(rooftop['azimuth']),
            'azimuth': float(rooftop['azimuth']),
            'temperature': float(weather['T2M']),
            'humidity': float(weather['RH2M']),
            'clearSkyRatio': float(weather['ALLSKY_KT']),
            'orientationScore': float(rooftop['orientation_score']),
            'shadingFactor': float(rooftop['shading_factor']),
            'tiltFactor': float(rooftop['tilt_factor']),
            # Derived metrics
            'sunshineHours': float(solar_potential * 1.5),  # Approximate
            'cloudCover': float((1 - weather['ALLSKY_KT']) * 100),
        }
        
        return result
    
    def _get_orientation_label(self, azimuth):
        """Convert azimuth to compass direction"""
        azimuth = azimuth % 360
        directions = [
            (0, 22.5, "North"),
            (22.5, 67.5, "Northeast"),
            (67.5, 112.5, "East"),
            (112.5, 157.5, "Southeast"),
            (157.5, 202.5, "South"),
            (202.5, 247.5, "Southwest"),
            (247.5, 292.5, "West"),
            (292.5, 337.5, "Northwest"),
            (337.5, 360, "North"),
        ]
        for low, high, label in directions:
            if low <= azimuth < high:
                return label
        return "North"


if __name__ == "__main__":
    # Test the predictor
    predictor = SolarEnergyPredictor()
    
    # Test with Davao City coordinates
    result = predictor.predict(lat=7.0731, lng=125.6128)
    
    print("\n=== Solar Energy Prediction ===")
    print(f"Location: {result['solarPotential']:.2f} kWh/m²/day")
    print(f"Rooftop Area: {result['rooftopArea']:.2f} m²")
    print(f"Orientation: {result['orientation']} ({result['azimuth']:.1f}°)")
    print(f"Temperature: {result['temperature']:.1f}°C")
    print(f"Humidity: {result['humidity']:.1f}%")
