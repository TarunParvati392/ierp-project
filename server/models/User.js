const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: String,
  profileImage: { type: String, default: '/uploads/default.png' },

  // FaceLock Fields
  facelock: {
    type: String, // base64 of face embedding or image
  },
  facelockSignature: {
    type: String, // optional - signature gesture (as video base64 or gesture data)
  },

  isBlocked: { type: Boolean, default: false },

  // Theme
  theme: {
    type: String,
    enum: ['dark', 'light', 'colorful'],
    default: 'dark',
  }
});

module.exports = mongoose.model('User', userSchema);
