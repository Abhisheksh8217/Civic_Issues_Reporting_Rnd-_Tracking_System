import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function IssueMap() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await api.get('/predictions/clusters');
      setClusters(response.data.clusters);
    } catch (error) {
      console.error('Failed to fetch clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      pothole: '#ef4444',
      streetlight: '#f59e0b',
      garbage: '#10b981',
      water: '#3b82f6',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return <div className="text-center py-8">Loading map...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Issue Clusters Map</h3>
      <div className="bg-gray-100 rounded-lg p-4 h-96 relative overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-white p-4 rounded-lg shadow-sm border-l-4"
              style={{ borderLeftColor: getCategoryColor(cluster.category) }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{cluster.title}</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{cluster.upvoteCount} ⬆</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>📍 {cluster.address || cluster.landmark || 'Location not specified'}</div>
                <div className="flex gap-2">
                  <span className="capitalize">{cluster.category}</span>
                  <span>•</span>
                  <span className="capitalize">{cluster.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {clusters.length === 0 && (
          <div className="text-center text-gray-500 py-8">No active issues to display</div>
        )}
      </div>
    </div>
  );
}
