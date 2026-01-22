import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Award, Lightbulb, Zap, Target } from 'lucide-react';

// Mock data for comparisons
const performanceMetrics = {
  baseline: {
    rmse: 0.854,
    mae: 0.652,
    r2: 0.823,
  },
  fiAdaBoost: {
    rmse: 0.696,
    mae: 0.512,
    r2: 0.891,
  },
};

const featureImportanceData = [
  { feature: 'Clear Sky Ratio', importance: 0.28, rank: 1 },
  { feature: 'Sunshine Hours', importance: 0.25, rank: 2 },
  { feature: 'Solar Exposure Index', importance: 0.21, rank: 3 },
  { feature: 'Cloud Cover', importance: 0.14, rank: 4 },
  { feature: 'Temperature', importance: 0.07, rank: 5 },
  { feature: 'Humidity', importance: 0.03, rank: 6 },
  { feature: 'Wind Speed', importance: 0.02, rank: 7 },
  { feature: 'Precipitation', importance: 0.01, rank: 8 },
];

const predictionComparisonData = [
  { sample: 'Sample 1', actual: 5.2, baseline: 4.8, fiAdaBoost: 5.1 },
  { sample: 'Sample 2', actual: 4.6, baseline: 5.1, fiAdaBoost: 4.7 },
  { sample: 'Sample 3', actual: 5.8, baseline: 5.2, fiAdaBoost: 5.7 },
  { sample: 'Sample 4', actual: 4.2, baseline: 4.7, fiAdaBoost: 4.3 },
  { sample: 'Sample 5', actual: 5.5, baseline: 5.9, fiAdaBoost: 5.6 },
  { sample: 'Sample 6', actual: 4.9, baseline: 4.5, fiAdaBoost: 4.8 },
  { sample: 'Sample 7', actual: 5.3, baseline: 4.9, fiAdaBoost: 5.2 },
  { sample: 'Sample 8', actual: 4.4, baseline: 4.9, fiAdaBoost: 4.5 },
];

export function ModelAnalytics() {
  const improvementPercentage = (
    ((performanceMetrics.baseline.rmse - performanceMetrics.fiAdaBoost.rmse) / 
    performanceMetrics.baseline.rmse) * 100
  ).toFixed(1);

  return (
    <div className="space-y-8">
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
          <MetricCard
            title="Root Mean Square Error"
            baseline={performanceMetrics.baseline.rmse}
            fiAdaBoost={performanceMetrics.fiAdaBoost.rmse}
            unit=""
            lowerIsBetter
            description=""
          />
          <MetricCard
            title="Mean Absolute Error"
            baseline={performanceMetrics.baseline.mae}
            fiAdaBoost={performanceMetrics.fiAdaBoost.mae}
            unit=""
            lowerIsBetter
            description=""
          />
          <MetricCard
            title="Coefficient of Determination (R²)"
            baseline={performanceMetrics.baseline.r2}
            fiAdaBoost={performanceMetrics.fiAdaBoost.r2}
            unit=""
            lowerIsBetter={false}
            description=""
          />
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
            FI-AdaBoost optimized feature weights for solar energy prediction
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={400} minWidth={300}>
              <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 0.3]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} stroke="#6b7280" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="importance" name="Feature Importance" fill="#f97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          
          <div className="mt-6 space-y-3">
            {featureImportanceData.slice(0, 3).map((feature, index) => (
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
                      <p className="text-sm">{feature.feature}</p>
                      <p className="text-xs text-gray-600">
                        {index === 0 ? 'Most important predictor' : 
                         index === 1 ? 'Second most important' : 
                         'Third most important'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">{(feature.importance * 100).toFixed(1)}%</p>
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
                <strong>Key Insight:</strong> FI-AdaBoost dynamically prioritizes features with the highest predictive power. 
                Clear Sky Ratio (28%), Sunshine Hours (25%), and Solar Exposure Index (21%) together account for 74% 
                of the model's prediction capability, optimizing accuracy for Davao City's climate patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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