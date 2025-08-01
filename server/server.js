const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup with dynamic origin handling
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

// Optional: Set headers globally
//app.use((req, res, next) => {
  //res.header('Access-Control-Allow-Credentials', 'true');
  //res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
  //res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  //res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //next();
//});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
    //No Need of Deprecated Options
    });
    console.log("🚀 MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Connect to MongoDB
connectDB();

// Routes
// Root test route
app.get('/', (req, res) => {
  res.send('🚀 iERP Backend is Live');
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log("Registered route:", r.route.path);
  }
});


// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});