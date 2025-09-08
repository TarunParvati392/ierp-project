// models/Degree.js
const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
  degree_name: { type: String, required: true },
  duration: { type: String, required: true },
  school_id: { type: mongoose.Schema.Types.ObjectId, ref: "School" }
}, { collection: "degrees" });

module.exports = mongoose.model("Degree", degreeSchema);
