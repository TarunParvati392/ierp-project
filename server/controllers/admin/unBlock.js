const mongoose = require("mongoose");
const User = require("../../models/User");
const Degree = mongoose.connection.collection("degrees");
const Specialization = mongoose.connection.collection("specializations");
const Batch = mongoose.connection.collection("batches");
const sendEmail = require("../../utils/sendEmail"); // utility for sending mail

// 🔹 Get all Blocked Users (except Admin)
exports.getBlockedUsers = async (req, res) => {
  try {
    // Find blocked users except Admin
    const users = await User.find({ isBlocked: true, role: { $ne: "Admin" } });

    // Populate Degree, Specialization, Batch from manual collections
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        let degree = null;
        let specialization = null;
        let batch = null;

        if (user.batch_id) {
          batch = await Batch.findOne({ _id: new mongoose.Types.ObjectId(user.batch_id) });
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
            degree = await Degree.findOne({ _id: new mongoose.Types.ObjectId(degreeId) });
          }
          if (specializationId) {
            specialization = await Specialization.findOne({ _id: new mongoose.Types.ObjectId(specializationId) });
          }
        }

        return {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          role: user.role,
          email: user.email,
          degree: user.role === "Student" ? (degree ? degree.degree_name : null) : null,
          specialization: user.role === "Student" ? (specialization ? specialization.specialization_name : null) : null,
          batch: batch ? batch.batchName : null,
          reason: user.blockedReason,
        };
      })
    );

    res.json(enrichedUsers);
  } catch (err) {
    console.error("Error fetching unblocked users:", err);
    res.status(500).json({ message: "Error fetching unblocked users" });
  }
};

// 🔹 Unblock a User
exports.Unblock = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isBlocked) {
      return res.status(400).json({ message: "User is not blocked" });
    }

  user.isBlocked = false;
  user.blockedReason = null;
  user.blockedAt = undefined;
    await user.save();

    // 🔹 Send mail to user (HTML)
    await sendEmail(
      user.email,
      "iERP: Account Unblocked",
      undefined, // no text
      `<p>Dear ${user.name},</p>
      <p>Your account (UID: ${user.userId}) has been <b>unblocked</b> by Admin.</p>
      <p>You can now access your account again.</p>
      <p>If you have any questions, please contact the administration.</p>`
    );

    res.json({ message: "User unblocked successfully and email sent" });
  } catch (err) {
    console.error("Error unblocking user:", err);
    res.status(500).json({ message: "Error unblocking user" });
  }
};
