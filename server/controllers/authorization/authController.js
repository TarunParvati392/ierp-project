const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');
const { calculateEuclideanDistance } = require('../../utils/faceUtils');


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
      token,
      user: {
        role: user.role,
        name: user.name,
        userId: user.userId,
        theme: user.theme,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Forgot Password Handler
exports.forgotPassword = async (req, res) => {
  const { identifier } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ userId: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'User is blocked' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    const emailText = `Dear ${user.name},\n\nClick the following link to reset your password:\n${resetLink}\n Link Expires in 10 Minutes\n\nRegards,\niERP Team`;

    await sendEmail(user.email, 'iERP - Reset Your Password', emailText);

    return res.status(200).json({ message: 'Reset link sent to your email' });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset Password Handler
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    console.error("Reset error:", err);
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }
};

// Verify Token Handler
exports.verifyToken = async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true });
  } catch (err) {
    res.status(400).json({ error: 'Expired or invalid token' });
  }
};

// Save Face Handler
exports.saveFace = async (req, res) => {
  const { userId, facelock } = req.body;
  if (!facelock) return res.status(400).json({ error: 'No face data provided' });

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.facelock = JSON.stringify(facelock);
    await user.save();

    res.status(200).json({ message: 'Face saved successfully' });
  } catch (err) {
    console.error('Save face error:', err);
    res.status(500).json({ error: 'Failed to save face data' });
  }
};

//FaceLogin
exports.faceLogin = async (req, res) => {
  const { embedding } = req.body;
  if (!embedding) return res.status(400).json({ error: 'No face embedding sent' });

  try {
    const users = await User.find({ facelock: { $ne: null } });

    for (const user of users) {
      const stored = JSON.parse(user.facelock);
      const distance = calculateEuclideanDistance(embedding, stored);

      if (distance < 0.5) {
        return res.status(200).json({ message: `${user.role} Login Successful`, role: user.role });
      }
    }

    res.status(401).json({ error: 'Face not recognized' });
  } catch (err) {
    console.error('Face login error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
};



