import { useState } from 'react';
import api from '../utils/api';

export default function UpvoteButton({ issueId, initialCount = 0, initialUpvoted = false }) {
  const [upvoteCount, setUpvoteCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialUpvoted);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/issues/${issueId}/upvote`);
      setUpvoteCount(response.data.upvoteCount);
      setHasUpvoted(response.data.hasUpvoted);
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
        hasUpvoted
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <span>⬆</span>
      <span>{upvoteCount}</span>
    </button>
  );
}
