const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("JWT verification error:", err);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
          });
        }
        
        if (err.name === 'NotBeforeError') {
          return res.status(401).json({
            success: false,
            message: 'Token not active yet',
            code: 'TOKEN_NOT_ACTIVE'
          });
        }
        
        return res.status(401).json({
          success: false,
          message: 'Token verification failed',
          code: 'TOKEN_ERROR'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing authentication'
    });
  }
};

module.exports = { authenticateToken };