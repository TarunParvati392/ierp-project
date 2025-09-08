// controllers/adminUserController.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');
const Batch = require('../../models/Batch');

const { nextSeq, buildUid, generatePassword } = require('../../utils/idAndPassword');
const rolePrefixes = require('../../utils/prefixes');
const sendEmail = require('../../utils/sendEmail'); // you already have this

// manually managed collections (no mongoose models)
const DegreeCol = mongoose.connection.collection('degrees');
const SpecCol   = mongoose.connection.collection('specializations');
const SchoolCol = mongoose.connection.collection('schools');
const DeptCol   = mongoose.connection.collection('departments');


// POST /users
exports.createUser = async (req, res) => {
  try {
    const {
      role, name, email,
      degree_id, specialization_id, batch_id
    } = req.body;

    // Basic validation
    if (!role || !name || !email) {
      return res.status(400).json({ message: 'role, name, email are required' });
    }

    // Unique email check
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    let userIdPrefix = '';
    let counterKey = '';
    let batchDoc = null;

    // If Student → prefix from batch
    if (role === 'Student') {
      if (!batch_id || !degree_id) {
        return res.status(400).json({ message: 'degree_id and batch_id are required for Student' });
      }

      // validate batch exists
      batchDoc = await Batch.findById(batch_id);
      if (!batchDoc) {
        return res.status(404).json({ message: 'Batch not found' });
      }

      // Optional: validate degree & specialization relationships (light checks)
      const degreeObjId = new mongoose.Types.ObjectId(degree_id);
      const degree = await DegreeCol.findOne({ _id: degreeObjId });
      if (!degree) return res.status(404).json({ message: 'Degree not found' });

      if (specialization_id) {
        const specObjId = new mongoose.Types.ObjectId(specialization_id);
        const spec = await SpecCol.findOne({ _id: specObjId, degree_id: degreeObjId });
        if (!spec) return res.status(400).json({ message: 'Specialization mismatch for given degree' });
      }

      userIdPrefix = batchDoc.prefix;                         // e.g. MCA23
      counterKey = `batch:${batchDoc.prefix}`;                // isolated counter per batch
    } else {
      // Non-student roles → role-based prefix
      userIdPrefix = rolePrefixes[role];
      if (!userIdPrefix) {
        return res.status(400).json({ message: 'Unknown role or missing prefix mapping' });
      }
      counterKey = `role:${userIdPrefix}`;                    // isolated counter per role
    }

    // Get next sequence atomically and build UID
    const seq = await nextSeq(counterKey);
    const uid = buildUid(userIdPrefix, seq, 3, '');

    // Generate & hash password
    const plainPassword = generatePassword();
    const hashed = await bcrypt.hash(plainPassword, 10);

    // Build user doc
    const userDoc = new User({
      userId: uid,
      name,
      email,
      password: hashed,
      role,
      profileImage: '/uploads/default.png',
      isBlocked: false,
      theme: 'dark',
      batch_id: role === 'Student' ? batch_id : null,
      degree_id: role === 'Student' ? degree_id : null,
      specialization_id: role === 'Student' ? (specialization_id || null) : null,
      section_id: null, // will be assigned when sections are created
    });

    // Save user
    await userDoc.save();

    // Update batch.totalStudents if role = Student
    if (role === 'Student') {
      await Batch.findByIdAndUpdate(batch_id, { $inc: { totalStudents: 1 } });
    }

    // Send credentials email
    try {
      await sendEmail(
        email,
        'Welcome to Aurora Deemed University | iERP Credentials',
        `Dear ${name},\n\nWelcome to Aurora Deemed University!\n\nYour iERP account has been successfully created. Please find your login credentials below:\n\n-----------------------------------------------------\nRole: ${role}\nUser ID: ${uid}\nTemporary Password: ${plainPassword}\n-----------------------------------------------------\n\nLogin Portal: ${process.env.BASE_URL}\n\nFor your security, please change your password after your first login.\n\nIf you have any questions or need assistance, feel free to reply to this email.\n\nBest regards,\nAurora Deemed University IT Team\n`
      );
    } catch (mailErr) {
      // We don’t fail the whole request if email sending fails—just inform client
      console.error('Email send failed:', mailErr);
    }

    // Respond (never send hashed password)
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: userDoc._id,
        userId: userDoc.userId,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        batch_id: userDoc.batch_id,
        section_id: userDoc.section_id,
        profileImage: userDoc.profileImage,
        createdAt: userDoc.createdAt,
      },
      // If you want to show on UI once (not stored): return plainPassword
      tempPassword: plainPassword,
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ message: 'Failed to create user' });
  }
};
