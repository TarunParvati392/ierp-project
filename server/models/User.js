// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // with Prefix
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },

  profileImage: { type: String, default: '/uploads/default.png' },

  isBlocked: { type: Boolean, default: false },

  // Theme preference
  theme: {
    type: String,
    enum: ['dark', 'light', 'colorful'],
    default: 'dark',
  },

  // 🔗 References
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null } // optional
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
