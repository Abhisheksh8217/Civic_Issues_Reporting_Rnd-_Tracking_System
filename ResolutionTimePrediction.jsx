import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function ResolutionTimePrediction({ category }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      fetchPrediction();
    }
  }, [category]);

  const fetchPrediction = async () => {
    try {
      const response = await api.get(`/predictions/resolution-time/${category}`);
      setPrediction(response.data);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading prediction...</div>;
  if (!prediction) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-600 font-medium text-sm">⏱️ Estimated Resolution Time</span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          prediction.confidence === 'high' ? 'bg-green-100 text-green-700' :
          prediction.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {prediction.confidence} confidence
        </span>
      </div>
      <div className="text-2xl font-bold text-blue-700">{prediction.prediction} hours</div>
      {prediction.min && prediction.max && (
        <div className="text-xs text-gray-600 mt-1">
          Range: {prediction.min}-{prediction.max} hours (based on {prediction.sampleSize} resolved issues)
        </div>
      )}
      {prediction.message && (
        <div className="text-xs text-gray-500 mt-1">{prediction.message}</div>
      )}
    </div>
  );
}
