const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead
} = require('../controllers/messageController');
const { initiateChat } = require('../../client/src/store/slices/chatSlice');

// Message routes
router.get('/initiate',authenticateToken,initiateChat)
router.get('/:chatId/messages', authenticateToken, getMessages);
router.post('/:chatId/messages', authenticateToken, sendMessage);
router.delete('/:chatId/messages/:messageId', authenticateToken, deleteMessage);
router.put('/:chatId/read', authenticateToken, markAsRead);

module.exports = router;