const mongoose = require("mongoose");
const Batch = require("../../models/Batch");
const User = require("../../models/User");

exports.createSection = async (req, res) => {
    try{
  const { batch_id, sectionName, fromUid, toUid } = req.body;

  if(!batch_id) return res.status(400).json({ message : "Batch is required" });
  if(!sectionName) return res.status(400).json({ message : "Section Name is Required" });
  if(!fromUid) return res.status(400).json({ message : "From User ID is Required" });
  if(!toUid) return res.status(400).json({ message : "To User ID is Required" });
  
  const batch = await Batch.findById(batch_id);
  if (!batch) return res.status(404).json({ message: "Batch not found" });

  // Get all students in this batch (for validation)
  const allBatchStudents = await User.find({ batch_id: batch_id, role: "Student" }, "userId").sort({ userId: 1 });
  const allUids = allBatchStudents.map(s => s.userId);
  const totalBatchStudents = allBatchStudents.length;
  const lastUid = allUids.length > 0 ? allUids[allUids.length - 1] : null;

  // 🔹 Check duplicate section name
  if (batch.sections.some(sec => sec.sectionName === sectionName)) {
    return res.status(400).json({ message: "Section name already exists in this batch" });
  }

  // Validate UID range does not exceed last UID (string comparison for alphanumeric UIDs)
  if (lastUid && (fromUid > lastUid || toUid > lastUid)) {
    return res.status(400).json({ message: `UID range cannot exceed last UID (${lastUid}) of this batch` });
  }

  // 🔹 Get students in range
  const students = await User.find({
    role: "Student",
    userId: { $gte: fromUid, $lte: toUid },
    section_id: null, // only unassigned students
    batch_id: batch_id
  });

  if (students.length === 0) {
    return res.status(400).json({ message: "No students found in this UID range" });
  }

  // Validate section's total students < batch total
  // (sum of all section strengths + this section < totalBatchStudents)
  const currentSectionStrength = students.length;
  const existingStrength = batch.sections.reduce((sum, sec) => sum + (sec.strength || 0), 0);
  if ((existingStrength + currentSectionStrength) > totalBatchStudents) {
    return res.status(400).json({ message: "Section students exceed total students in batch" });
  }

  // 🔹 Create section object
  const newSection = {
    sectionName,
    fromUid,
    toUid,
    strength: students.length,
  };

  // Add to batch
  batch.sections.push(newSection);
  await batch.save();

  // 🔹 Update students with section_id
  const createdSection = batch.sections[batch.sections.length - 1];
  await User.updateMany(
    { _id: { $in: students.map(s => s._id) } },
    { $set: { section_id: createdSection._id } }
  );

  res.status(201).json({
    message: "Section created successfully",
    section: createdSection,
    assignedStudents: students.length,
  });
  } catch (err) {
    console.error("Error creating section:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get Sections by Batch
exports.getSections = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    res.json(batch.sections);
  } catch (err) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get batch details (student count + UIDs)
exports.getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Get all student UIDs of this batch
    const students = await User.find({ batch_id: batchId }, "userId").sort({ userId: 1 });

    res.json({
      batchName: batch.batchName,
      totalStudents: students.length,
      allUids: students.map(s => s.userId), // sorted list of UIDs
      sections: batch.sections || []
    });
  } catch (err) {
    console.error("Error fetching batch details:", err);
    res.status(500).json({ message: "Server error" });
  }
};
