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
    type: [Number], // Numeric face embeddings
    default: []
  },
  facelockSignature: {
    type: String, 
    default: ''
  },
  gestureData: {
    type: String,
    default:''
  },
  facelockUpdatedAt: { type: Date, default: null },
  facelockFailedAttempts: { type: Number, default: 0 },

  isBlocked: { type: Boolean, default: false },

  // Theme
  theme: {
    type: String,
    enum: ['dark', 'light', 'colorful'],
    default: 'dark',
  }
});

module.exports = mongoose.model('User', userSchema);
