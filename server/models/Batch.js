// models/Batch.js
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true }, // e.g. A, B, C
  fromUid: { type: String, required: true },     // starting UID
  toUid: { type: String, required: true },       // ending UID
  strength: { type: Number, default: 0 }         // total students in this section
});

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true }, // e.g. MCA 2023-2025
  prefix: { type: String, required: true },    // e.g. MCA23
  degree_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree', required: true },
  specialization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization', default: null },

  totalStudents: { type: Number, default: 0 }, // auto-updated when new students added

  sections: [sectionSchema], // nested sections
  schoolName: { type: String, required: true },
  departmentName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
