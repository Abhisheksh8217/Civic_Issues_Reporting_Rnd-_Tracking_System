import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function CommentsSection({ issueId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/issues/${issueId}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await api.post(`/issues/${issueId}/comments`, { text: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      alert('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-3">Comments</h4>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="mt-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.userName}</span>
              <span className="text-xs text-gray-500 capitalize">({comment.userRole})</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
}
