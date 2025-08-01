const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Routes
const authRoutes = require("./routes/authRoutes"); // Adjust the path as needed
app.use("/api/auth", authRoutes);

// Root test
app.get("/", (req, res) => {
  res.send("🚀 iERP Backend is Running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
