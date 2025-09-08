// models/Specialization.js
const mongoose = require("mongoose");

const specializationSchema = new mongoose.Schema({
  degree_id: { type: mongoose.Schema.Types.ObjectId, ref: "Degree" },
  specialization_name: { type: String, required: true }
}, { collection: "specializations" });

module.exports = mongoose.model("Specialization", specializationSchema);
