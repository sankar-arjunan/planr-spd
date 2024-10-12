const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const TokenBlacklist = require('../models/TokenBlacklist');

const authMiddleware = async (req, res, next) => {
  
  try {
      const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(403).json({ message: 'Token is blacklisted. Access denied.' });
    }

    const decoded = jwt.verify(token, 'fuwvegwifviubwvfuhj'); 

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Unauthorized. User is inactive.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: 'Failed to authenticate token.' });
  }
};

module.exports = authMiddleware;
