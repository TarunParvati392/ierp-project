const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hashedPassword = await bcrypt.hash("Academic@123", 10);

  const admin = new User({
    userId: "ACDM001",
    name: "Academic User",
    email: "academic@ierp.com",
    password: hashedPassword,
    role: "Academic Manager",
    isBlocked: false,
  });

  await admin.save();
  console.log("✅ Admin user inserted successfully.");
  mongoose.disconnect();
}).catch(err => {
  console.error("❌ Error inserting admin user:", err);
});
