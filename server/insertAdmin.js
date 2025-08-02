const mongoose = require('mongoose');
const User = require('./models/UserModel');
require('dotenv').config();

const insertAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const exists = await User.findOne({ userId: 'admin001' });
    if (exists) {
      console.log('Admin already exists.');
      return;
    }

    const admin = new User({
      userId: 'admin001',
      name: 'Admin User',
      email: 'admin@ierp.com',
      password: '$2b$10$zqXNlhqLaCDe3P.dLZUZae/S.zDXP.nWCKVx2/0UZGSWacYX.gZXi', // Hashed Admin@123
      role: 'Admin',
      profileImage: '/uploads/default.png',
      isBlocked: false
    });

    await admin.save();
    console.log('✅ Admin inserted');
    process.exit();
  } catch (err) {
    console.error('Error inserting admin:', err);
    process.exit(1);
  }
};

insertAdmin();
