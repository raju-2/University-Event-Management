require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { verifyConnection, initDatabase } = require("./config/db");

const app = express();

// ─── OTP SETUP ───────────────────────────────────────────────────────────────

// Temporary OTP store (for demo; use DB in production)
let otpStore = {};

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://event-management-seven-teal.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/admin", require("./routes/admin"));

// ─── OTP ROUTES ──────────────────────────────────────────────────────────────

// Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store OTP
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification - UniEvents",
      text: `Your OTP is: ${otp}`,
    });

    console.log(`OTP for ${email}: ${otp}`); // debug

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  if (otpStore[email] == otp) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "University Event Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await verifyConnection();
  await initDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

    console.log(`\n📋 Available endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/auth/me`);
    console.log(`   GET    /api/events          (public)`);
    console.log(`   GET    /api/events/:id      (public)`);
    console.log(`   POST   /api/events          (admin)`);
    console.log(`   PUT    /api/events/:id      (admin)`);
    console.log(`   DELETE /api/events/:id      (admin)`);
    console.log(`   PATCH  /api/events/:id/complete  (admin)`);
    console.log(`   POST   /api/events/:id/register  (student)`);
    console.log(`   DELETE /api/events/:id/register  (student)`);
    console.log(`   GET    /api/admin/stats     (admin)`);
    console.log(`   GET    /api/admin/users     (admin)`);
    console.log(
      `   GET    /api/admin/events/:id/attendees  (admin)`
    );

    console.log(`\n🔐 OTP endpoints:`);
    console.log(`   POST   /api/send-otp`);
    console.log(`   POST   /api/verify-otp\n`);
  });
};

startServer();