const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

