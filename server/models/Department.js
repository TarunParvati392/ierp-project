// models/Department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  degree_id: { type: mongoose.Schema.Types.ObjectId, ref: "Degree" },
  department_name: { type: String, required: true }
}, { collection: "departments" });

module.exports = mongoose.model("Department", departmentSchema);
