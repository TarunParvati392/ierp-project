const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Find by userId or email
    const user = await User.findOne({
      $or: [{ userId: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'User is blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Create a JWT token (for future use)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Success: Send token & role
    return res.status(200).json({
      message: `${user.role} Login Successful`,
      role: user.role,
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};
