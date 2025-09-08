// models/School.js
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  school_name: { type: String, required: true }
}, { collection: "schools" }); // 👈 important: match existing collection name

module.exports = mongoose.model("School", schoolSchema);
