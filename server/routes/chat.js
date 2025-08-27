const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead
} = require('../controllers/messageController');

// Message routes
router.get('/:chatId/messages', authenticateToken, getMessages);
router.post('/:chatId/messages', authenticateToken, sendMessage);
router.delete('/:chatId/messages/:messageId', authenticateToken, deleteMessage);
router.put('/:chatId/read', authenticateToken, markAsRead);

module.exports = router;