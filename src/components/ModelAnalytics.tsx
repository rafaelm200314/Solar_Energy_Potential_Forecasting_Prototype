import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Award, Lightbulb, Zap, Target, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ModelAnalyticsProps {
  lat?: number;
  lng?: number;
}

interface ComparisonData {
  baseline: {
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
    confidenceLevel?: number;
  };
  fiAdaBoost: {
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
    confidenceLevel?: number;
  };
  improvement: {
    solarPotentialDiff: number;
    solarPotentialImprovementPct: number;
    confidenceLevel: number;
  };
  performanceMetricsComparison: {
    baseline: { rmse: number; mae: number; r2: number };
    fiAdaBoost: { rmse: number; mae: number; r2: number };
    rmseImprovementPct: number;
    maeImprovementPct: number;
    r2ImprovementPct: number;
  };
  featureImportanceRanking: Array<{
    feature: string;
    fiAdaBoostImportance: number;
    baselineImportance: number;
    importanceGain: number;
    rank: number;
  }>;
}

export function ModelAnalytics({ lat = 7.0731, lng = 125.6128 }: ModelAnalyticsProps) {
  const [liveComparison, setLiveComparison] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
      const host = window.location.hostname || 'localhost';
      const backendCandidates = [
        envUrl,
        `http://${host}:8501`,
        'http://localhost:8501',
        'http://127.0.0.1:8501',
      ].filter((url): url is string => Boolean(url));

      let response: Response | null = null;
      let lastError: string | null = null;

      for (const backendUrl of backendCandidates) {
        try {
          response = await fetch(`${backendUrl}/compare`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat, lng }),
          });

          if (response.ok) {
            break;
          }

          lastError = `Comparison failed with status ${response.status}`;
        } catch (networkError) {
          lastError = networkError instanceof Error ? networkError.message : 'Network error';
        }
      }

      if (!response || !response.ok) {
        throw new Error(lastError ?? 'Failed to compare models');
      }

      const data: ComparisonData = await response.json();
      setLiveComparison(data);
      console.log('🔬 Live model comparison:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare models');
      console.error('Comparison error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveComparison();
  }, [lat, lng]);

  // Human-readable feature names and descriptions for engineered features
  const getFeatureLabel = (technicalName: string): { label: string; description: string } => {
    const mapping: Record<string, { label: string; description: string }> = {
      'T2M': { label: 'Temperature', description: 'Average ambient temperature in °C' },
      'RH2M': { label: 'Relative Humidity', description: 'Atmospheric moisture level in %' },
      'ALLSKY_KT': { label: 'Clearness Index', description: 'Sky clarity factor affecting solar radiation' },
      'month_sin': { label: 'Seasonal Cycle (Sin)', description: 'Cyclical seasonal pattern component' },
      'month_cos': { label: 'Seasonal Cycle (Cos)', description: 'Complementary seasonal pattern component' },
      'season': { label: 'Season Type', description: 'Dry season (1) vs Rainy season (0)' },
      'orientation_score': { label: 'Roof Orientation', description: 'How well the roof faces the sun' },
      'shading_factor': { label: 'Shading Level', description: 'Obstruction from nearby buildings/trees' },
      'tilt_factor': { label: 'Roof Tilt', description: 'Angle optimization for solar capture' },
      'solar_exposure_index': { label: 'Solar Exposure Index', description: 'Combined measure of rooftop solar potential' },
      'rooftop_area_sq_m': { label: 'Rooftop Area', description: 'Available roof space for panels (m²)' },
      'azimuth': { label: 'Azimuth Angle', description: 'Roof compass direction (°)' },
      'nearby_count': { label: 'Building Density', description: 'Number of nearby structures' },
      // Legacy spatial features (in case old models are loaded)
      'Latitude': { label: 'Latitude', description: 'North-South position' },
      'Longitude': { label: 'Longitude', description: 'East-West position' },
      'LatxLon Interaction': { label: 'Location Interaction', description: 'Combined coordinate effect' },
      'Latitude Abs': { label: 'Distance from Equator', description: 'Absolute latitude value' },
      'Longitude Abs Fraction': { label: 'Longitude Precision', description: 'Fine-grained component' },
      'Latitude Squared': { label: 'Latitude Intensity', description: 'Non-linear latitude effect' },
      'Longitude Squared': { label: 'Longitude Intensity', description: 'Non-linear longitude effect' },
      'Sin Latitude': { label: 'Seasonal Pattern (Lat)', description: 'Cyclical latitude effect' },
      'Cos Latitude': { label: 'Sun Angle Factor (Lat)', description: 'Latitude cosine for irradiance' },
      'Sin Longitude': { label: 'Time Zone Effect (Lon)', description: 'Cyclical longitude component' },
      'Cos Longitude': { label: 'Solar Path Factor (Lon)', description: 'Longitude cosine for patterns' },
      'Distance to Davao Core': { label: 'Distance to City Center', description: 'Urban vs suburban location' },
    };

    const normalized = technicalName.trim();
    return mapping[normalized] || { label: normalized, description: 'Model input feature' };
  };

  const liveMetrics = liveComparison?.performanceMetricsComparison;
  const featureImportanceLive = liveComparison?.featureImportanceRanking ?? [];
  
  // Transform feature names to human-readable format
  const featureImportanceWithLabels = featureImportanceLive.map(item => ({
    ...item,
    displayName: getFeatureLabel(item.feature).label,
    description: getFeatureLabel(item.feature).description,
  }));

  const topThreeFeatures = featureImportanceWithLabels.slice(0, 3);
  const topThreeTotalWeight = topThreeFeatures.reduce(
    (total, feature) => total + feature.fiAdaBoostImportance,
    0,
  );

  const improvementPercentage = liveMetrics
    ? liveMetrics.rmseImprovementPct.toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      {/* Live Comparison Card */}
      {liveComparison && (
        <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Live Model Comparison</CardTitle>
                <CardDescription>
                  Real-time prediction comparison for coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveComparison}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border-2 border-orange-200 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Baseline AdaBoost</p>
                <p className="text-3xl font-bold text-orange-600">
                  {liveComparison.baseline.solarPotential.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500">kWh/m²/day</p>
              </div>
              <div className="p-4 bg-white rounded-xl border-2 border-emerald-200 shadow-md">
                <p className="text-sm text-gray-600 mb-1">FI-AdaBoost</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {liveComparison.fiAdaBoost.solarPotential.toFixed(3)}
                </p>
                <p className="text-xs text-gray-500">kWh/m²/day</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg text-white">
                <p className="text-sm opacity-90 mb-1">Difference</p>
                <p className="text-3xl font-bold">
                  {liveComparison.improvement.solarPotentialDiff >= 0 ? '+' : ''}
                  {liveComparison.improvement.solarPotentialDiff.toFixed(3)}
                </p>
                <p className="text-xs opacity-80">
                  {liveComparison.improvement.solarPotentialImprovementPct >= 0 ? '+' : ''}
                  {liveComparison.improvement.solarPotentialImprovementPct.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-indigo-200 shadow-md">
              <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
              <p className="text-3xl font-bold text-indigo-600">
                {liveComparison.improvement.confidenceLevel.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Based on nearest data support and model agreement</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Comparison */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl">Performance Metrics Comparison</h2>
            <p className="text-sm text-gray-600">Baseline AdaBoost → FI-AdaBoost</p>
            <p className="text-xs text-gray-500 mt-1">
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveMetrics ? (
            <>
              <MetricCard
                title="Root Mean Square Error"
                baseline={liveMetrics.baseline.rmse}
                fiAdaBoost={liveMetrics.fiAdaBoost.rmse}
                unit=""
                lowerIsBetter
                description=""
              />
              <MetricCard
                title="Mean Absolute Error"
                baseline={liveMetrics.baseline.mae}
                fiAdaBoost={liveMetrics.fiAdaBoost.mae}
                unit=""
                lowerIsBetter
                description=""
              />
              <MetricCard
                title="Coefficient of Determination (R²)"
                baseline={liveMetrics.baseline.r2}
                fiAdaBoost={liveMetrics.fiAdaBoost.r2}
                unit=""
                lowerIsBetter={false}
                description=""
              />
            </>
          ) : (
            <Card className="md:col-span-3 border-2 border-slate-200">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  {isLoading
                    ? 'Loading performance metrics from backend...'
                    : 'Live performance metrics are unavailable. Check backend connection and refresh.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

       
        <Card className="mt-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">FI-AdaBoost Optimization Achievement</p>
                <p className="text-5xl bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent mb-1">
                  {improvementPercentage}%
                </p>
                <p className="text-sm text-gray-600">Goal: addressing the optimization gap through feature importance tuning.</p>
              </div>
              <Zap className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Improvement Highlight */}
      <Card className="border-2 border-orange-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="text-xl">Feature Importance Ranking</CardTitle>
          <CardDescription>
            Which location factors matter most for solar energy prediction
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {featureImportanceLive.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={400} minWidth={300}>
                  <BarChart data={featureImportanceWithLabels} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 1]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="displayName" type="category" tick={{ fontSize: 11 }} stroke="#6b7280" width={150} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Importance']}
                      labelFormatter={(label: string) => {
                        const feature = featureImportanceWithLabels.find(f => f.displayName === label);
                        return feature ? `${label}: ${feature.description}` : label;
                      }}
                    />
                    <Bar dataKey="fiAdaBoostImportance" name="Feature Importance" fill="#f97316" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-3">
                {topThreeFeatures.map((feature, index) => (
                  <div key={feature.feature} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          'bg-gradient-to-br from-orange-300 to-amber-400'
                        } text-white shadow-md`}>
                          {feature.rank}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{feature.displayName}</p>
                          <p className="text-xs text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{(feature.fiAdaBoostImportance * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Weight</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-md">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Key Insight:</strong> The top 3 most influential features are <strong>{topThreeFeatures[0].displayName}</strong>, <strong>{topThreeFeatures[1]?.displayName}</strong>, and <strong>{topThreeFeatures[2]?.displayName}</strong>. 
                    Together they account for <strong>{(topThreeTotalWeight * 100).toFixed(1)}%</strong> of the model's predictive power.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Card className="border-2 border-slate-200">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  {isLoading
                    ? 'Loading feature importance ranking from backend...'
                    : 'Live feature importance ranking is unavailable. Check backend connection and refresh.'}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Selected Location Snapshot */}
      {liveComparison && (
        <Card className="border-2 border-sky-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50">
            <CardTitle className="text-xl">Selected Location Snapshot</CardTitle>
            <CardDescription>
              Live feature values for the currently selected coordinates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg mb-3">Key Rooftop Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Rooftop Area</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.rooftopArea.toFixed(1)} m²</p>
                  <p className="text-xs text-slate-500">Available installation space</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Solar Exposure Index (SEI)</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.solarExposureIndex.toFixed(3)}</p>
                  <p className="text-xs text-slate-500">Solar radiation exposure level</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Orientation</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.orientation}</p>
                  <p className="text-xs text-slate-500">Primary roof facing direction</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Azimuth Angle</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.azimuth.toFixed(1)}°</p>
                  <p className="text-xs text-slate-500">Optimal panel angle</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg mb-3">Weather Conditions Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Sunshine Hours</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.sunshineHours.toFixed(1)} hrs/day</p>
                  <p className="text-xs text-slate-500">Average daily sunshine</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Cloud Cover</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.cloudCover.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Average cloud coverage</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Temperature</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.temperature.toFixed(1)}°C</p>
                  <p className="text-xs text-slate-500">Average temperature</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm text-slate-600">Humidity</p>
                  <p className="text-2xl text-slate-900">{liveComparison.fiAdaBoost.humidity.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500">Relative humidity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Accuracy Comparison */}
      {/* <Card className="border-2 border-blue-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="text-xl">Prediction Accuracy Comparison</CardTitle>
          <CardDescription>
            Model predictions vs actual values across test samples
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={predictionComparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="sample" stroke="#6b7280" />
              <YAxis domain={[3.5, 6.5]} label={{ value: 'kWh/m²/day', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} name="Baseline AdaBoost" strokeDasharray="5 5" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="fiAdaBoost" stroke="#f97316" strokeWidth={2} name="FI-AdaBoost" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Baseline AdaBoost</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Shows larger deviations from actual values, especially in samples 2 and 5
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm">FI-AdaBoost</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tracks actual values more closely through optimized feature importance weighting
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Research Insights */}
      {/* <Card className="border-2 border-yellow-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Research Insights & Findings
          </CardTitle>
          <CardDescription>Key discoveries from FI-AdaBoost optimization</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <InsightItem
              title="Feature-Importance-Aware Optimization"
              description="FI-AdaBoost enhances traditional AdaBoost by dynamically adjusting feature importance during training. This optimization prioritizes features with higher predictive power, resulting in more accurate solar energy predictions for Davao City's unique climate patterns without simply beating baseline metrics."
              impact="positive"
            />
            <InsightItem
              title="Clear Sky Ratio as Primary Predictor"
              description="Analysis reveals Clear Sky Ratio (28% importance) has the strongest correlation with solar energy potential. The algorithm's feature importance optimization identifies and leverages this critical variable, significantly improving prediction accuracy in variable weather conditions."
              impact="positive"
            />
            <InsightItem
              title="Intelligent Feature Weight Distribution"
              description="The top three features (Clear Sky Ratio, Sunshine Hours, and Solar Exposure Index) account for 74% of the model's predictive capability. This concentrated importance distribution reflects the algorithm's success in identifying the most relevant solar predictors while reducing noise from less correlated variables."
              impact="positive"
            />
            <InsightItem
              title="Noise Reduction from Secondary Features"
              description="FI-AdaBoost successfully minimizes the influence of weakly correlated features (humidity 3%, wind speed 2%, precipitation 1%), preventing overfitting and improving model generalization on unseen rooftop data."
              impact="positive"
            />
            <InsightItem
              title="Applicability to Davao City Context"
              description="The model's feature importance optimization is specifically tuned for Davao City's tropical climate characteristics - high humidity, variable cloud cover, and consistent temperature. The adaptive feature weighting reflects local weather patterns, making predictions particularly reliable for this region."
              impact="positive"
            />
            <InsightItem
              title="Practical Implications for Solar Planning"
              description="The 18.5% RMSE reduction achieved through feature importance optimization enables more reliable solar panel installation planning, accurate ROI calculations for homeowners, and better solar farm site selection in Davao City. Improved predictions translate to more confident investment decisions."
              impact="positive"
            />
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  baseline: number;
  fiAdaBoost: number;
  unit: string;
  lowerIsBetter: boolean;
  description: string;
}

function MetricCard({ title, baseline, fiAdaBoost, unit, lowerIsBetter, description }: MetricCardProps) {
  const improvement = lowerIsBetter
    ? ((baseline - fiAdaBoost) / baseline) * 100
    : ((fiAdaBoost - baseline) / baseline) * 100;
  
  const isImprovement = improvement > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Baseline AdaBoost</p>
          <p className="text-lg text-gray-600">{baseline.toFixed(3)}{unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">FI-AdaBoost</p>
          <p className="text-2xl">{fiAdaBoost.toFixed(3)}{unit}</p>
        </div>
        <Badge className={isImprovement ? 'bg-green-500' : 'bg-red-500'}>
          {isImprovement ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
          {Math.abs(improvement).toFixed(1)}% {isImprovement ? 'better' : 'worse'}
        </Badge>
      </CardContent>
    </Card>
  );
}

interface InsightItemProps {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

function InsightItem({ title, description, impact }: InsightItemProps) {
  const colors = {
    positive: 'border-green-200 bg-green-50',
    negative: 'border-red-200 bg-red-50',
    neutral: 'border-yellow-200 bg-yellow-50',
  };

  const icons = {
    positive: <TrendingUp className="w-5 h-5 text-green-600" />,
    negative: <TrendingDown className="w-5 h-5 text-red-600" />,
    neutral: <Award className="w-5 h-5 text-yellow-600" />,
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[impact]}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{icons[impact]}</div>
        <div>
          <h4 className="text-sm mb-1">{title}</h4>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
}