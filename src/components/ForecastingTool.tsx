import { useEffect, useState } from 'react';
import { MapPin, Locate, Sun, Home, Compass, Cloud, Droplets, Thermometer, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { LeafletMouseEvent } from "leaflet";

const defaultIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


interface PredictionResult {
  solarPotential: number;
  rooftopArea: number;
  solarExposureIndex: number;
  orientation: string;
  azimuth: number;
  sunshineHours: number;
  cloudCover: number;
  temperature: number;
  humidity: number;
  clearSkyRatio: number;
}
function ClickToSetLocation({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng, zoom = 16 }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.setView([lat, lng], map.getZoom() || zoom, { animate: true });
  }, [lat, lng, zoom, map]);

  return null;
}



export function ForecastingTool() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleLocateMe = () => {
    setIsLoading(true);
    // Simulate geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({ 
            lat: position.coords.latitude.toFixed(6), 
            lng: position.coords.longitude.toFixed(6) 
          });
          setAddress(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setIsLoading(false);
        },
        () => {
          // Fallback to Davao City if geolocation fails
          setCoordinates({ lat: '7.0731', lng: '125.6128' });
          setAddress('Davao City, Philippines');
          setIsLoading(false);
        }
      );
    } else {
      setCoordinates({ lat: '7.0731', lng: '125.6128' });
      setAddress('Davao City, Philippines');
      setIsLoading(false);
    }
  };



  const handlePredict = () => {
    setIsLoading(true);
    // Simulate prediction with mock data
    setTimeout(() => {
      setPrediction({
        solarPotential: 5.2 + Math.random() * 0.8,
        rooftopArea: 85 + Math.random() * 30,
        solarExposureIndex: 0.75 + Math.random() * 0.15,
        orientation: 'South-Southeast',
        azimuth: 155 + Math.random() * 20,
        sunshineHours: 7.5 + Math.random() * 1.5,
        cloudCover: 30 + Math.random() * 20,
        temperature: 28 + Math.random() * 4,
        humidity: 65 + Math.random() * 15,
        clearSkyRatio: 0.68 + Math.random() * 0.15,
      });
      setIsLoading(false);
    }, 1500);
  };

  const getSolarRating = (potential: number): { label: string; color: string; description: string; bgGradient: string } => {
    if (potential >= 5.5) return { 
      label: 'Excellent', 
      color: 'bg-emerald-500',
      bgGradient: 'from-emerald-500 to-green-600',
      description: 'Outstanding solar energy potential. Ideal for solar panel installation with high ROI expected.'
    };
    if (potential >= 4.5) return { 
      label: 'Very Good', 
      color: 'bg-blue-500',
      bgGradient: 'from-blue-500 to-cyan-600',
      description: 'Strong solar energy potential. Great conditions for solar panel system installation.'
    };
    if (potential >= 3.5) return { 
      label: 'Good', 
      color: 'bg-amber-500',
      bgGradient: 'from-amber-500 to-yellow-600',
      description: 'Moderate solar energy potential. Solar installation is viable with reasonable returns.'
    };
    return { 
      label: 'Fair', 
      color: 'bg-orange-500',
      bgGradient: 'from-orange-500 to-red-600',
      description: 'Lower solar energy potential. Consider optimizing panel placement and angle.'
    };
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Your Location
          </CardTitle>
          <CardDescription>
            Enter your exact address or click on the map to pin your location
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Address Input */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm">Exact Address or Coordinates</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="e.g., 123 Main St, Davao City or click on map"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleLocateMe}
                disabled={isLoading}
                title="Use my current location"
                className="shrink-0"
              >
                <Locate className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Coordinates Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm">Latitude</Label>
              <Input
                id="latitude"
                placeholder="e.g., 7.0731"
                value={coordinates.lat}
                onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm">Longitude</Label>
              <Input
                id="longitude"
                placeholder="e.g., 125.6128"
                value={coordinates.lng}
                onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
              />
            </div>
          </div>

<div className="space-y-2">
  <Label className="text-sm">Pin Your Exact Location on Map</Label>

 {/* Map Picker */}
<div className="rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg" style={{ height: 500 }}>
  <MapContainer
    center={[7.0731, 125.6128] as [number, number]}
    zoom={12}
    style={{ height: "100%", width: "100%", background: "#e5e7eb" }}
    scrollWheelZoom
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <ClickToSetLocation
      onPick={(lat, lng) => {
        const newLat = lat.toFixed(6);
        const newLng = lng.toFixed(6);
        setCoordinates({ lat: newLat, lng: newLng });
        setAddress(`${newLat}, ${newLng}`);
      }}
    />

    {coordinates.lat && coordinates.lng && (
      <>
        <RecenterMap lat={Number(coordinates.lat)} lng={Number(coordinates.lng)} />
        <Marker
          position={[Number(coordinates.lat), Number(coordinates.lng)]}
          icon={defaultIcon}
        />
      </>
    )}
  </MapContainer>
</div>


  <p className="text-xs text-gray-500 flex items-center gap-1">
    <Navigation className="w-3 h-3" />
    Click anywhere on the map to set your exact rooftop location
  </p>
</div>


          {coordinates.lat && coordinates.lng && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm">
                <span className="text-gray-600">Selected coordinates:</span>{' '}
                <span className="font-mono">{coordinates.lat}, {coordinates.lng}</span>
              </p>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
            onClick={handlePredict}
            disabled={isLoading || (!coordinates.lat || !coordinates.lng)}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Location...
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-2" />
                Predict Solar Potential
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {prediction && (
        <div className="space-y-6">
          {/* Solar Potential Card */}
          <Card className={`border-2 shadow-2xl bg-gradient-to-br ${getSolarRating(prediction.solarPotential).color === 'bg-emerald-500' ? 'from-emerald-50 via-green-50 to-teal-50 border-emerald-300' : getSolarRating(prediction.solarPotential).color === 'bg-blue-500' ? 'from-blue-50 via-cyan-50 to-sky-50 border-blue-300' : getSolarRating(prediction.solarPotential).color === 'bg-amber-500' ? 'from-amber-50 via-yellow-50 to-orange-50 border-amber-300' : 'from-orange-50 via-red-50 to-rose-50 border-orange-300'}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Predicted Solar Energy Potential</CardTitle>
                  <CardDescription className="text-sm">
                    Powered by FI-AdaBoost Regression Model
                  </CardDescription>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${getSolarRating(prediction.solarPotential).bgGradient} rounded-full flex items-center justify-center shadow-lg`}>
                  <Sun className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-6xl sm:text-7xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {prediction.solarPotential.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-600">kWh/m²/day</span>
                  </div>
                  <Badge className={`${getSolarRating(prediction.solarPotential).color} text-white shadow-md px-4 py-2 text-sm`}>
                    {getSolarRating(prediction.solarPotential).label} Rating
                  </Badge>
                </div>

                {/* Visual Indicator */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">Energy Potential Level</span>
                    <span className="text-lg">{Math.round((prediction.solarPotential / 7) * 100)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${getSolarRating(prediction.solarPotential).bgGradient} transition-all duration-1000 shadow-lg`}
                      style={{ width: `${Math.min((prediction.solarPotential / 7) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur rounded-xl p-4 shadow-md border border-white/50">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <strong className="text-gray-900">What this means:</strong> {getSolarRating(prediction.solarPotential).description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooftop Information */}
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                Key Rooftop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem
                  label="Rooftop Area"
                  value={`${prediction.rooftopArea.toFixed(1)} m²`}
                  description="Available installation space"
                  gradient="from-purple-500 to-pink-500"
                />
                <InfoItem
                  label="Solar Exposure Index (SEI)"
                  value={prediction.solarExposureIndex.toFixed(3)}
                  description="Solar radiation exposure level"
                  gradient="from-orange-500 to-red-500"
                />
                <InfoItem
                  label="Orientation"
                  value={prediction.orientation}
                  icon={<Compass className="w-5 h-5 text-blue-500" />}
                  description="Primary roof facing direction"
                  gradient="from-blue-500 to-cyan-500"
                />
                <InfoItem
                  label="Azimuth Angle"
                  value={`${prediction.azimuth.toFixed(1)}°`}
                  description="Optimal panel angle"
                  gradient="from-green-500 to-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Weather Summary */}
          <Card className="border-2 border-cyan-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-600" />
                Weather Conditions Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem
                  label="Sunshine Hours"
                  value={`${prediction.sunshineHours.toFixed(1)} hrs/day`}
                  icon={<Sun className="w-5 h-5 text-yellow-500" />}
                  description="Average daily sunshine"
                  gradient="from-yellow-500 to-orange-500"
                />
                <InfoItem
                  label="Cloud Cover"
                  value={`${prediction.cloudCover.toFixed(1)}%`}
                  icon={<Cloud className="w-5 h-5 text-gray-500" />}
                  description="Average cloud coverage"
                  gradient="from-gray-500 to-slate-500"
                />
                <InfoItem
                  label="Temperature"
                  value={`${prediction.temperature.toFixed(1)}°C`}
                  icon={<Thermometer className="w-5 h-5 text-red-500" />}
                  description="Average temperature"
                  gradient="from-red-500 to-orange-500"
                />
                <InfoItem
                  label="Humidity"
                  value={`${prediction.humidity.toFixed(1)}%`}
                  icon={<Droplets className="w-5 h-5 text-blue-500" />}
                  description="Relative humidity"
                  gradient="from-blue-500 to-indigo-500"
                />
              </div>

              {/* Clear Sky Ratio */}
              <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border-2 border-sky-200 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm">Clear Sky Ratio</span>
                  <span className="text-xl">{(prediction.clearSkyRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-sky-200/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-1000 shadow-lg"
                    style={{ width: `${prediction.clearSkyRatio * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  <strong>Key Feature:</strong> Ratio of actual to theoretical clear-sky solar radiation. 
                  This is the most important predictor in the FI-AdaBoost model.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  description?: string;
  gradient: string;
}

function InfoItem({ label, value, icon, description, gradient }: InfoItemProps) {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-white shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className={`text-3xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      {description && <p className="text-xs text-gray-500 leading-relaxed">{description}</p>}
    </div>
  );
}