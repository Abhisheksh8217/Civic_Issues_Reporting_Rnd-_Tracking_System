import express from 'express';
import db from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Upvote an issue
router.post('/:id/upvote', verifyToken, (req, res) => {
  try {
    const issue = db.get('issues').find({ id: req.params.id }).value();
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const upvotes = issue.upvotes || [];
    const hasUpvoted = upvotes.includes(req.user.id);

    if (hasUpvoted) {
      // Remove upvote
      const newUpvotes = upvotes.filter(id => id !== req.user.id);
      db.get('issues')
        .find({ id: req.params.id })
        .assign({ 
          upvotes: newUpvotes,
          upvoteCount: newUpvotes.length 
        })
        .write();
      
      return res.json({ message: 'Upvote removed', upvoteCount: newUpvotes.length, hasUpvoted: false });
    } else {
      // Add upvote
      upvotes.push(req.user.id);
      db.get('issues')
        .find({ id: req.params.id })
        .assign({ 
          upvotes,
          upvoteCount: upvotes.length 
        })
        .write();
      
      return res.json({ message: 'Issue upvoted', upvoteCount: upvotes.length, hasUpvoted: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote', details: error.message });
  }
});

// Add comment
router.post('/:id/comments', verifyToken, (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const issue = db.get('issues').find({ id: req.params.id }).value();
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const user = db.get('users').find({ id: req.user.id }).value();
    const comments = issue.comments || [];
    
    const newComment = {
      id: Date.now().toString(),
      userId: req.user.id,
      userName: user.name,
      userRole: user.role,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    
    db.get('issues')
      .find({ id: req.params.id })
      .assign({ comments })
      .write();

    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// Get comments
router.get('/:id/comments', verifyToken, (req, res) => {
  try {
    const issue = db.get('issues').find({ id: req.params.id }).value();
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ comments: issue.comments || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments', details: error.message });
  }
});

export default router;
