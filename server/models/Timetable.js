const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  day: { type: String, required: true }, // "Mon".."Fri"
  period: { type: Number, required: true }, // 1..8
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyName: { type: String },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  kind: { type: String, enum: ['theory','lab','free'], default: 'theory' } // 'free' if intentionally free
});

const facultyScheduleSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyName: String,
  entries: [entrySchema]
});

const sectionScheduleSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  sectionName: String,
  entries: [entrySchema]
});

const timetableSchema = new mongoose.Schema({
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // schedule manager who generated/published
  facultySchedules: [facultyScheduleSchema],
  sectionSchedules: [sectionScheduleSchema],
  meta: { type: mongoose.Mixed } // any additional info
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
