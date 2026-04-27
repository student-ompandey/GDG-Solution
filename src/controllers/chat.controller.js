const aiService = require('../services/ai.service');

const handleChat = async (req, res) => {
  try {
    const { history, message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const aiResponse = await aiService.chatWithAI(history || [], message, context);

    if (!aiResponse) {
      return res.status(500).json({ success: false, message: 'AI service is temporarily unavailable.' });
    }

    return res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during chat.' });
  }
};

module.exports = {
  handleChat
};
