import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ReportForm from '../components/ReportForm';
import UpvoteButton from '../components/UpvoteButton';
import CommentsSection from '../components/CommentsSection';
import IssueMap from '../components/IssueMap';
import ResolutionTimePrediction from '../components/ResolutionTimePrediction';
import { issues } from '../utils/api';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('report');
  const [issuesList, setIssuesList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchIssues();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else if (activeTab === 'analytics' && user.role === 'admin') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Refresh leaderboard when switching tabs
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const interval = setInterval(fetchLeaderboard, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await issues.getAll();
      setIssuesList(response.data.issues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await issues.getLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await issues.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus, resolutionPhoto, rejectionReason) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (resolutionPhoto) {
        formData.append('resolutionPhoto', resolutionPhoto);
      }
      if (rejectionReason) {
        formData.append('rejectionReason', rejectionReason);
      }

      await issues.updateStatus(issueId, formData);
      fetchIssues();
      setSelectedIssue(null);
      alert('Issue status updated successfully!');
    } catch (error) {
      alert('Failed to update issue status');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Are you sure you want to delete this issue? Points earned from this issue will be deducted.')) return;
    
    try {
      const response = await issues.delete(issueId);
      
      // Update user points in local storage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && response.data.pointsDeducted) {
        userData.points = Math.max(0, (userData.points || 0) - response.data.pointsDeducted);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      alert(`Issue deleted successfully! ${response.data.pointsDeducted} points deducted.`);
      
      // Refresh data
      fetchIssues();
      if (activeTab === 'leaderboard') {
        fetchLeaderboard();
      }
      
      // Reload page to update points display
      window.location.reload();
    } catch (error) {
      alert('Failed to delete issue');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      duplicate: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'report' && 'Report New Issue'}
              {activeTab === 'issues' && 'All Issues'}
              {activeTab === 'map' && 'Issue Map'}
              {activeTab === 'leaderboard' && 'Leaderboard'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.name}! {user.role === 'user' && `Points: ${user.points || 0}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReportForm onSuccess={() => setActiveTab('issues')} />
              </motion.div>
            )}

            {activeTab === 'issues' && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {issuesList.map((issue) => (
                      <div key={issue.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{issue.title}</h3>
                            <p className="text-gray-600 mb-3">{issue.description}</p>
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {issue.category}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(issue.severity)}`}>
                                {issue.severity}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(issue.status)}`}>
                                {issue.status}
                              </span>
                              {issue.flaggedAsSpam && (
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                  ⚠️ Spam
                                </span>
                              )}
                              <UpvoteButton 
                                issueId={issue.id} 
                                initialCount={issue.upvoteCount || 0} 
                                initialUpvoted={issue.hasUpvoted || false} 
                              />
                            </div>
                          </div>
                          {issue.photoUrl && (
                            <img
                              src={`http://localhost:5000${issue.photoUrl}`}
                              alt={issue.title}
                              className="w-32 h-32 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>

                        {issue.ocrText && (
                          <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-800">
                              <strong>OCR Text:</strong> {issue.ocrText}
                            </p>
                          </div>
                        )}

                        {issue.aiPredictions && issue.aiPredictions.length > 0 && (
                          <div className="mb-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800 font-semibold mb-1">AI Predictions:</p>
                            {issue.aiPredictions.slice(0, 3).map((pred, idx) => (
                              <p key={idx} className="text-sm text-green-700">
                                {pred.className}: {(pred.probability * 100).toFixed(1)}%
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-gray-500 mb-3">
                          Reported: {new Date(issue.createdAt).toLocaleString()}
                        </div>

                        <ResolutionTimePrediction category={issue.category} />

                        {user.role === 'user' && issue.userId === user.id && issue.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleDeleteIssue(issue.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        {(user.role === 'authority' || user.role === 'admin') && issue.status !== 'duplicate' && issue.status !== 'rejected' && (
                          <div className="flex gap-2 mt-4">
                            {issue.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(issue.id, 'verified')}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) handleStatusUpdate(issue.id, 'rejected', null, reason);
                                  }}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {issue.status === 'verified' && (
                              <button
                                onClick={() => setSelectedIssue(issue)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        )}

                        <CommentsSection issueId={issue.id} />
                      </div>
                    ))}

                    {issuesList.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No issues found. Report your first issue!
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <IssueMap />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaderboard.map((entry, index) => (
                        <tr key={entry.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.points}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.reportCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && user.role === 'admin' && analytics && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Issues</h3>
                    <p className="text-3xl font-bold text-gray-800">{analytics.totalIssues}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Resolved</h3>
                    <p className="text-3xl font-bold text-green-600">{analytics.resolvedIssues}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">{analytics.pendingIssues}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                    {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">{category}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Severity Breakdown</h3>
                    {Object.entries(analytics.severityBreakdown).map(([severity, count]) => (
                      <div key={severity} className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 capitalize">{severity}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Mark as Resolved</h3>
            <p className="text-gray-600 mb-4">Upload a resolution photo (optional)</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleStatusUpdate(selectedIssue.id, 'resolved', e.target.files[0]);
                }
              }}
              className="mb-4 w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(selectedIssue.id, 'resolved', null)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Resolve Without Photo
              </button>
              <button
                onClick={() => setSelectedIssue(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
