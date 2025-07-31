const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: String,
  profileImage: { type: String, default: '/uploads/default.png' },
  facelock: String, // base64 or buffer
  isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
