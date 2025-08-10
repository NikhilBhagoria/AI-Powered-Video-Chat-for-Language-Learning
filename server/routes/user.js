const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Get user data
router.get('/data', authenticateToken, userController.getUserData);
router.get('/search', authenticateToken, userController.searchUsers);


module.exports = router;