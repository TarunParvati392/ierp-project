const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = new User({
    userId: "ADM001",
    name: "Admin User",
    email: "admin@ierp.com",
    password: hashedPassword,
    role: "Admin",
    isBlocked: false,
  });

  await admin.save();
  console.log("✅ Admin user inserted successfully.");
  mongoose.disconnect();
}).catch(err => {
  console.error("❌ Error inserting admin user:", err);
});
