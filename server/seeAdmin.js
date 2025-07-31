// server/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = new User({
    userId: 'admin001',
    name: 'Super Admin',
    email: 'admin@ierp.com',
    password: hashedPassword,
    role: 'Admin',
  });

  await admin.save();
  console.log('✅ Admin user created');
  process.exit();
};

seedAdmin().catch((err) => {
  console.error('❌ Error seeding admin:', err);
  process.exit(1);
});
