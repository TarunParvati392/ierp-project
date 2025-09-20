const mongoose = require('mongoose');
const Batch = require('../../models/Batch');

const Degree = mongoose.connection.collection('degrees');
const Department = mongoose.connection.collection('departments');
const School = mongoose.connection.collection('schools');

exports.createBatch = async (req, res) => {
  try {
    const { degree_id, specialization_id, batchName, prefix } = req.body;

    // Validate request
    if (!degree_id || !batchName || !prefix) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 Check if batch already exists in this degree (either same batchName OR same prefix)
    const existingBatch = await Batch.findOne({
      degree_id: new mongoose.Types.ObjectId(degree_id),
      $or: [{ batchName }, { prefix }]
    });

    if (existingBatch) {
      return res.status(400).json({ 
        message: "Batch with this name or prefix already exists in this degree"
      });
    }

    // 🔹 Find Degree Details
    const degree = await Degree.findOne({ _id: new mongoose.Types.ObjectId(degree_id) });
    if (!degree) return res.status(404).json({ error: "Degree not found" });

    // 🔹 Find Department Linked with Specialization or Degree
    let department = null;
    if (specialization_id) {
      department = await Department.findOne({ specialization_id: new mongoose.Types.ObjectId(specialization_id) });
    }
    if (!department) {
      department = await Department.findOne({ degree_id: new mongoose.Types.ObjectId(degree_id) });
    }
    if (!department) return res.status(404).json({ error: "Department not found for this degree/specialization" });

    // 🔹 Find School Linked with Degree
    const school = await School.findOne({ _id: degree.school_id });
    if (!school) return res.status(404).json({ error: "School not found for this degree" });

    // 🔹 Create New Batch
    const newBatch = new Batch({
      batchName,
      prefix,
      degree_id,
      specialization_id: specialization_id || null,
      school_id: school._id,
      schoolName: school.school_name,
      department_id: department._id,
      departmentName: department.department_name
    });

    await newBatch.save();

    res.status(201).json({ message: "Batch created successfully", batch: newBatch });

  } catch (err) {
    console.error("Error creating batch:", err);
    res.status(500).json({ message: "Failed to create batch" });
  }
};
