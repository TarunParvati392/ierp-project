const User = require('../models/User');
const fs = require('fs');
const path = require('path');

//Theme Update Route
exports.theme = async (req, res) => {
    const { theme } = req.body;
    const userId = req.user.id;

    try {
        await User.findByIdAndUpdate(userId, { theme});
        res.json({ message: 'Theme updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update theme' });
    }
};

// Profile Image Update Route
exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const imagePath = `/uploads/${file.filename}`;

    await User.findByIdAndUpdate(userId, { profileImage: imagePath });
    

    res.status(200).json({ message: 'Profile image updated successfully', profileImage: imagePath });
  } catch (err) {
    console.error('Profile image update error:', err);
    res.status(500).json({ error: 'Failed to update profile image' });
  }
};
