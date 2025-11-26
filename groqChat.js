import express from 'express';
import Groq from 'groq-sdk';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../db.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Get user's recent reports for context
    const userIssues = db.get('issues')
      .filter({ userId })
      .takeRight(3)
      .map(issue => `${issue.category}: ${issue.status}`)
      .value();

    const systemPrompt = `You are CivicAssist, a helpful AI assistant for a civic issue reporting system. 
Be concise and helpful. Provide information about:
- How to report issues (potholes, streetlights, garbage, water, other)
- Issue status and resolution times
- Points system (+10 report, +5 verified, +20 resolved)
User's recent reports: ${userIssues.join(', ') || 'None'}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 400,
      temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.2
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Save chat log if enabled
    if (process.env.CHAT_LOG_ENABLED === 'true') {
      db.get('chats').push({
        userId,
        message,
        response,
        timestamp: new Date().toISOString()
      }).write();
    }

    res.json({ response });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

export default router;
