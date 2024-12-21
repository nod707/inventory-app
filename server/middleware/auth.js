const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth middleware - no token provided');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - token decoded:', decoded);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Auth middleware - error:', err);
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

module.exports = auth;
