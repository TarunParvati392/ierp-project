const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { userIdOrEmail, password } = req.body;
    console.log("Login Attempt:", userIdOrEmail);

    const user = await User.findOne({
      $or: [{ email: userIdOrEmail }, { userId: userIdOrEmail }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
