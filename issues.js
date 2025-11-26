import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { imageHash } from 'image-hash';
import { compareTwoStrings } from 'string-similarity';
import db from '../db.js';
import { verifyToken } from './auth.js';
import { calculateSeverity } from '../utils/severity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${nanoid()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images allowed'));
  }
});

// Haversine distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Hamming distance
function hammingDistance(hash1, hash2) {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

// Check duplicates - prioritize image matching
async function checkDuplicates(issue, imagePath) {
  const settings = db.get('settings').value();
  const allIssues = db.get('issues').value();
  
  return new Promise((resolve) => {
    imageHash(imagePath, 16, true, (error, hash) => {
      if (error) {
        console.error('Image hash error:', error);
        resolve(null);
        return;
      }

      console.log('New image hash:', hash);

      for (const existingIssue of allIssues) {
        // Skip resolved and duplicate issues
        if (existingIssue.status === 'resolved' || existingIssue.status === 'duplicate') continue;

        const imageDistance = hammingDistance(hash, existingIssue.imageHash || '');
        console.log(`Comparing with issue ${existingIssue.id}: hash distance = ${imageDistance}`);

        // If exact same image (distance 0-2), mark as duplicate immediately
        if (imageDistance <= 2) {
          console.log('EXACT IMAGE MATCH FOUND!');
          resolve(existingIssue.id);
          return;
        }

        // Check location proximity
        const distance = haversineDistance(
          issue.latitude,
          issue.longitude,
          existingIssue.latitude,
          existingIssue.longitude
        );

        // If within 200m and similar image (distance < 10)
        if (distance < settings.geoRadiusMeters && imageDistance < 10) {
          const textSimilarity = compareTwoStrings(
            issue.description.toLowerCase(),
            existingIssue.description.toLowerCase()
          );

          // If similar location + similar image + similar text
          if (textSimilarity > settings.duplicateThreshold) {
            console.log('DUPLICATE FOUND: Similar location + image + text');
            resolve(existingIssue.id);
            return;
          }
        }
      }

      console.log('No duplicate found');
      resolve(null);
    });
  });
}

// Calculate spam score
function calculateSpamScore(userId) {
  const settings = db.get('settings').value();
  const user = db.get('users').find({ id: userId }).value();
  const userIssues = db.get('issues').filter({ userId }).value();
  
  let spamScore = 0;

  const now = new Date();
  const timeWindow = settings.spamTimeWindowMinutes * 60 * 1000;
  const recentReports = userIssues.filter(
    (issue) => now - new Date(issue.createdAt) < timeWindow
  );

  if (recentReports.length > settings.spamReportLimit) {
    spamScore += 2;
  }

  const duplicateCount = userIssues.filter((issue) => issue.duplicateOf).length;
  const duplicateRatio = userIssues.length > 0 ? duplicateCount / userIssues.length : 0;

  if (duplicateRatio > settings.spamDuplicateRatio) {
    spamScore += 2;
  }

  return spamScore;
}

// Create issue
router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    console.log('Received issue creation request');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      aiPredictions,
      ocrText,
      clientImageHash
    } = req.body;

    if (!title || !description || !category || !latitude || !longitude || !req.file) {
      return res.status(400).json({ error: 'All fields and photo required' });
    }

    const userId = req.user.id;
    const imagePath = path.join(__dirname, '../uploads', req.file.filename);

    const newIssue = {
      id: nanoid(),
      userId,
      title,
      description,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photoUrl: `/uploads/${req.file.filename}`,
      aiPredictions: aiPredictions ? JSON.parse(aiPredictions) : null,
      ocrText: ocrText || null,
      clientImageHash: clientImageHash || null,
      status: 'pending',
      upvotes: [],
      upvoteCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const duplicateId = await checkDuplicates(newIssue, imagePath);
    
    if (duplicateId) {
      const originalIssue = db.get('issues').find({ id: duplicateId }).value();
      return res.status(400).json({
        error: 'Duplicate Report Detected',
        isDuplicate: true,
        duplicateDetails: {
          message: 'This issue has already been reported. Please check existing reports before submitting.',
          originalIssueId: duplicateId,
          originalIssueTitle: originalIssue?.title || 'Unknown',
          originalIssueDate: originalIssue?.createdAt || 'Unknown'
        }
      });
    }

    const spamScore = calculateSpamScore(userId);
    if (spamScore >= 3) {
      newIssue.flaggedAsSpam = true;
      db.get('users').find({ id: userId }).assign({ spamScore }).write();
    }

    newIssue.severity = calculateSeverity(newIssue);

    imageHash(imagePath, 16, true, (error, hash) => {
      if (!error) {
        newIssue.imageHash = hash;
      }

      db.get('issues').push(newIssue).write();

      const user = db.get('users').find({ id: userId }).value();
      const settings = db.get('settings').value();
      
      db.get('users')
        .find({ id: userId })
        .assign({
          reportCount: (user.reportCount || 0) + 1,
          points: (user.points || 0) + (newIssue.duplicateOf ? 0 : settings.pointsPerReport)
        })
        .write();

      res.status(201).json({
        message: 'Issue reported successfully!',
        issue: newIssue,
        isDuplicate: false,
        isSpam: newIssue.flaggedAsSpam || false
      });
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue', details: error.message });
  }
});

// Get all issues
router.get('/', verifyToken, (req, res) => {
  try {
    const { status, category, userId } = req.query;
    let issues = db.get('issues').value();

    if (req.user.role === 'user') {
      issues = issues.filter((issue) => issue.userId === req.user.id);
    } else if (req.user.role === 'authority') {
      issues = issues.filter((issue) => issue.status !== 'duplicate');
    }

    if (status) {
      issues = issues.filter((issue) => issue.status === status);
    }
    if (category) {
      issues = issues.filter((issue) => issue.category === category);
    }
    if (userId) {
      issues = issues.filter((issue) => issue.userId === userId);
    }

    issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ issues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issues', details: error.message });
  }
});

// Get single issue
router.get('/:id', verifyToken, (req, res) => {
  try {
    const issue = db.get('issues').find({ id: req.params.id }).value();
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ issue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue', details: error.message });
  }
});

// Update issue status
router.patch('/:id/status', verifyToken, upload.single('resolutionPhoto'), (req, res) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status } = req.body;
    const issue = db.get('issues').find({ id: req.params.id }).value();

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updates = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (req.file) {
      updates.resolutionPhotoUrl = `/uploads/${req.file.filename}`;
    }

    if (status === 'rejected') {
      updates.rejectedAt = new Date().toISOString();
      updates.rejectedBy = req.user.id;
      updates.rejectionReason = req.body.rejectionReason || 'Issue rejected by authority';
    }

    if (status === 'verified') {
      updates.verifiedAt = new Date().toISOString();
      updates.verifiedBy = req.user.id;
    }

    if (status === 'inProgress') {
      updates.inProgressAt = new Date().toISOString();
      updates.inProgressBy = req.user.id;
    }

    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolvedBy = req.user.id;
      
      // Calculate resolution time
      const createdTime = new Date(issue.createdAt);
      const resolvedTime = new Date();
      updates.resolutionTimeHours = Math.round((resolvedTime - createdTime) / (1000 * 60 * 60))
      
      const settings = db.get('settings').value();
      const user = db.get('users').find({ id: issue.userId }).value();
      db.get('users')
        .find({ id: issue.userId })
        .assign({ points: (user.points || 0) + settings.pointsPerResolved })
        .write();
    }

    db.get('issues').find({ id: req.params.id }).assign(updates).write();

    const updatedIssue = db.get('issues').find({ id: req.params.id }).value();

    res.json({
      message: 'Issue updated successfully',
      issue: updatedIssue
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update issue', details: error.message });
  }
});

// Get leaderboard
router.get('/stats/leaderboard', verifyToken, (req, res) => {
  try {
    const users = db
      .get('users')
      .filter({ role: 'user' })
      .orderBy(['points'], ['desc'])
      .take(10)
      .value();

    const leaderboard = users.map((user) => ({
      id: user.id,
      name: user.name,
      points: user.points || 0,
      reportCount: user.reportCount || 0
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
  }
});

// Delete issue (User can delete their own, Authority/Admin can delete any)
router.delete('/:id', verifyToken, (req, res) => {
  try {
    const issue = db.get('issues').find({ id: req.params.id }).value();

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && issue.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own issues' });
    }

    // Calculate points to deduct
    const settings = db.get('settings').value();
    const user = db.get('users').find({ id: issue.userId }).value();
    let pointsToDeduct = 0;

    // Deduct points based on issue status
    if (issue.status === 'pending') {
      pointsToDeduct = settings.pointsPerReport; // -10
    } else if (issue.status === 'verified') {
      pointsToDeduct = settings.pointsPerReport + settings.pointsPerVerified; // -15
    } else if (issue.status === 'resolved') {
      pointsToDeduct = settings.pointsPerReport + settings.pointsPerVerified + settings.pointsPerResolved; // -35
    }

    // Update user points and report count
    db.get('users')
      .find({ id: issue.userId })
      .assign({
        points: Math.max(0, (user.points || 0) - pointsToDeduct),
        reportCount: Math.max(0, (user.reportCount || 0) - 1)
      })
      .write();

    // Delete the issue
    db.get('issues').remove({ id: req.params.id }).write();

    res.json({ 
      message: 'Issue deleted successfully',
      pointsDeducted: pointsToDeduct
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete issue', details: error.message });
  }
});

// Get analytics
router.get('/stats/analytics', verifyToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const issues = db.get('issues').value();
    const users = db.get('users').value();

    const analytics = {
      totalIssues: issues.length,
      pendingIssues: issues.filter((i) => i.status === 'pending').length,
      verifiedIssues: issues.filter((i) => i.status === 'verified').length,
      resolvedIssues: issues.filter((i) => i.status === 'resolved').length,
      duplicateIssues: issues.filter((i) => i.status === 'duplicate').length,
      spamIssues: issues.filter((i) => i.flaggedAsSpam).length,
      totalUsers: users.filter((u) => u.role === 'user').length,
      categoryBreakdown: issues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {}),
      severityBreakdown: issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

export default router;
