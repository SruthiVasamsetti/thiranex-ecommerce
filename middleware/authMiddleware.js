const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: Authorization header is missing.' });
  }

  // Expect header format 'Bearer <token>'
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Access Denied: Token format must be Bearer <token>.' });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforecommerceapplication2026');
    req.user = decoded; // Contains id, username, role
    next();
  } catch (error) {
    console.error('[AUTH ERROR] Token processing issue:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token sessions. Please log in again.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access only.' });
  }
  next();
};

const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Forbidden: Valid credential session required.' });
  }
  next();
};

module.exports = {
  authenticateJWT,
  requireAdmin,
  requireUser
};
