const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  degree_id: { type: mongoose.Schema.Types.ObjectId, ref: "Degree", required: true },
  specialization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Specialization", default: null },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }]
});

const academicYearSchema = new mongoose.Schema(
  {
    academicYear: { type: String, required: true }, // e.g. "2025-26"
    
    // Multiple programs (degree + specialization + batches)
    programs: [programSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicYear", academicYearSchema);
