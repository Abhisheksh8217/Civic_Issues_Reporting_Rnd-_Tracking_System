import express from 'express';
import db from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get resolution time prediction
router.get('/resolution-time/:category', verifyToken, (req, res) => {
  try {
    const { category } = req.params;
    
    const resolvedIssues = db.get('issues')
      .filter({ category, status: 'resolved' })
      .filter(issue => issue.resolutionTimeHours !== undefined)
      .value();

    if (resolvedIssues.length === 0) {
      return res.json({ 
        prediction: 48, // Default 48 hours
        confidence: 'low',
        message: 'No historical data available. Showing default estimate.'
      });
    }

    const times = resolvedIssues.map(i => i.resolutionTimeHours);
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    res.json({
      prediction: avgTime,
      min: minTime,
      max: maxTime,
      confidence: resolvedIssues.length > 10 ? 'high' : resolvedIssues.length > 5 ? 'medium' : 'low',
      sampleSize: resolvedIssues.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict resolution time', details: error.message });
  }
});

// Get issue clusters (for map)
router.get('/clusters', verifyToken, (req, res) => {
  try {
    const issues = db.get('issues')
      .filter(issue => issue.status !== 'resolved' && issue.status !== 'duplicate')
      .value();

    const clusters = issues.map(issue => ({
      id: issue.id,
      latitude: issue.latitude,
      longitude: issue.longitude,
      address: issue.address || `${issue.latitude}, ${issue.longitude}`,
      category: issue.category,
      status: issue.status,
      upvoteCount: issue.upvoteCount || 0,
      severity: issue.severity,
      title: issue.title
    }));

    res.json({ clusters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clusters', details: error.message });
  }
});

export default router;
