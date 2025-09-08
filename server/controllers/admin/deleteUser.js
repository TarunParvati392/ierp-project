// controllers/adminController.js
const mongoose = require("mongoose");
const User = require("../../models/User");
const Batch = require("../../models/Batch");
const sendEmail = require("../../utils/sendEmail");
const Degree = mongoose.connection.collection("degrees");
const Specialization = mongoose.connection.collection("specializations");

// 🔹 Get all Blocked Users (except Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users except Admin
    const users = await User.find({ role: { $ne: "Admin" } });

    // Populate Degree, Specialization, Batch from manual collections
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        let degree = null;
        let specialization = null;
        let batch = null;

        if (user.batch_id) {
          batch = await Batch.findOne({ _id: user.batch_id });
        }

        // Only fetch degree/specialization for students
        if (user.role === "Student") {
          let degreeId = user.degree_id;
          let specializationId = user.specialization_id;

          // If not present on user, get from batch
          if ((!degreeId || !specializationId) && batch) {
            if (!degreeId && batch.degree_id) degreeId = batch.degree_id;
            if (!specializationId && batch.specialization_id) specializationId = batch.specialization_id;
          }

          if (degreeId) {
            degree = await Degree.findOne({ _id: degreeId });
          }
          if (specializationId) {
            specialization = await Specialization.findOne({ _id: specializationId });
          }
        }

        return {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          role: user.role,
          email: user.email,
          isBlocked: user.isBlocked,
          degree: user.role === "Student" ? (degree ? degree.degree_name : null) : null,
          specialization: user.role === "Student" ? (specialization ? specialization.specialization_name : null) : null,
          batch: batch ? batch.batchName : null,
        };
      })
    );

    res.json(enrichedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required for deletion" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "Admin") {
      return res.status(403).json({ message: "Admin cannot be deleted" });
    }

    // If user is Student → update Batch strength
    if (user.role === "Student" && user.batch_id) {
      await Batch.findByIdAndUpdate(user.batch_id, { $inc: { totalStudents: -1 } });

      if (user.section_id) {
        await Batch.updateOne(
          { _id: user.batch_id, "sections.sectionName": user.section_id },
          { $inc: { "sections.$.strength": -1 } }
        );
      }
    }

    // Send email before deletion
    await sendEmail(
      user.email,
      "iERP: Account Deleted",
      undefined,
      `<p>Dear ${user.name},</p>
      <p>Your account (UID: ${user.userId}) has been <b>deleted</b> by Admin.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>If this was a mistake, please contact the administration.</p>`
    );

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully and email sent" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};
