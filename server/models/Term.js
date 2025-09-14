const mongoose = require("mongoose");
const facultyAssignmentSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sections: [{ type: String, required: true }]
});

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  facultyAssignments: [facultyAssignmentSchema]
});

const termSchema = new mongoose.Schema(
  {
    termName: {
      type: String,
      enum: ["Term 1", "Term 2", "Term 3", "Term 4"],
      required: true,
    },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    program_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    subjects: [subjectSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Term", termSchema);
