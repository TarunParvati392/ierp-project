// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // UID with prefix
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },

  profileImage: { type: String, default: '/uploads/default.png' },

  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String, default: null },
  blockedAt: { type: Date, default: null },


  // Theme preference
  theme: {
    type: String,
    enum: ['dark', 'light', 'colorful'],
    default: 'dark',
  },

  // 🔗 Student Reference to Batch & Section
  degree_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree', default: null },
  specialization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization', default: null },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  section_id: { type: String, default: null }, // section name (A, B, C…)

  // 🔗 Faculty/Dean/HOD Mappings
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
