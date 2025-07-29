const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateRegistration, validateLogin } = require('../utils/validation');

// Helper function for UTC datetime
const getUTCDateTime = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, nativeLanguage, learningLanguages } = req.body;

      // Validate input
      const { error } = validateRegistration(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Check if user already exists
      const userExists = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email or username'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password, // Will be hashed by pre-save middleware
        nativeLanguage,
        learningLanguages,
        lastLogin: getUTCDateTime(),
        createdAt: getUTCDateTime()
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return success response
      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            nativeLanguage: user.nativeLanguage,
            learningLanguages: user.learningLanguages,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error in user registration'
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      const { error } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = getUTCDateTime();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return success response
      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            nativeLanguage: user.nativeLanguage,
            learningLanguages: user.learningLanguages,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error in user login'
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            nativeLanguage: user.nativeLanguage,
            learningLanguages: user.learningLanguages,
            lastLogin: user.lastLogin
          }
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user data'
      });
    }
  },

  // Verify user token and return user data
  verifyToken: async (req, res) => {
    try {
      // Get token from header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.userId)
        .select('-password'); // Exclude password

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update last login time
      user.lastLogin = getUTCDateTime();
      await user.save();

      // Return user data
      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          nativeLanguage: user.nativeLanguage,
          learningLanguages: user.learningLanguages,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error verifying token'
      });
    }
  }
};

module.exports = authController;