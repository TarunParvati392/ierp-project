const User = require('../models/User');
const bcrypt = require('bcryptjs');
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
    const userId = req.user.id; // from auth middleware
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Delete old image if not default
    if (user.profileImage && user.profileImage !== "/uploads/default.png") {
      const oldImagePath = path.join(__dirname, "..", user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // delete the file
      }
    }

    // Save new image path
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

//Update Password
exports.updatePassword = async (req,res) =>{
  try{
    const userId = req.user.id; // from auth middleware
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user){
      return res.status(404).json({ error: 'User not found' });
    }
    //Check if Current Password match
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current Password is Incorrect' });
    }

    //Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: 'Password Updated Successfully' });
  } catch (error){
    res.status(500).json({error: 'Server Error' });
  }
};
