const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json()); // Needed for parsing JSON body
app.use(cookieParser());

// ✅ CORS setup with dynamic origin handling
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://ierp-project.vercel.app"
    ];
    const vercelRegex = /^https:\/\/ierp-project-[\w-]+\.vercel\.app$/;

    if (!origin || allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.get('/', (req, res) => {
  res.send('🚀 iERP Backend is Live');
});

// ✅ Register auth routes (IMPORTANT: Keep this after express.json())
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ❌ Removed duplicate manual login route that was overriding proper one

// ✅ Optional: Debug registered routes
setTimeout(() => {
  try {
    if (app._router && app._router.stack) {
      app._router.stack.forEach((r) => {
        if (r.route && r.route.path) {
          console.log("✅ Registered route:", r.route.path);
        }
      });
    }
  } catch (err) {
    console.log("⚠️  Could not log routes:", err.message);
  }
}, 1000);

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
