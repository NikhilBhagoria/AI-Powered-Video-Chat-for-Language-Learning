const express = require('express');
const router = express.Router();
const { initiateChat } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.post('/initiate', authenticateToken, initiateChat);

module.exports = router;