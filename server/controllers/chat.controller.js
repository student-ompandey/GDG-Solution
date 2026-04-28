const aiService = require('../services/ai.service');
const logger = require('../utils/logger');

const handleChat = async (req, res) => {
  try {
    const { history, message, context } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required and must be a non-empty string.' });
    }

    const sanitizedHistory = Array.isArray(history) ? history : [];

    const aiResponse = await aiService.chatWithAI(sanitizedHistory, message.trim(), context || null);

    if (!aiResponse) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please check that the GEMINI_API_KEY is configured.'
      });
    }

    return res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    logger.error('Chat controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during chat. Please try again.'
    });
  }
};

module.exports = {
  handleChat
};
