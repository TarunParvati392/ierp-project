// models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. role:FAC or batch:MCA23
  seq: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
