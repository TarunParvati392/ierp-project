// models/Timetable.js
const mongoose = require('mongoose');

const timetableCellSchema = new mongoose.Schema({
  day: { type: String, enum: ["Mon","Tue","Wed","Thu","Fri"], required: true },
  period: { type: Number, required: true }, // 1–8
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },

  subject_id: { type: mongoose.Schema.Types.ObjectId }, // reference to Term.subjects._id
  subjectName: { type: String },
  subjectCode: { type: String },

  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  facultyName: { type: String },

  kind: { type: String, enum: ["theory", "lab", "free"], default: "theory" },
  room: { type: String, default: null } // optional, if you want later
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear", required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // degree OR specialization
  term_id: { type: mongoose.Schema.Types.ObjectId, ref: "Term", required: true },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },

  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  published: { type: Boolean, default: false },
  version: { type: Number, default: 1 },

  entries: [timetableCellSchema] // all slots
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);
