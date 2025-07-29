const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Get user data
router.get('/data', authenticateToken, userController.getUserData);

module.exports = router;