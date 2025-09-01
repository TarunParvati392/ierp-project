// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Store Both UserID and Role
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

//Role Based Check
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied"});
    }
    next();
  }
}

module.exports = { verifyToken, authorizeRoles };
