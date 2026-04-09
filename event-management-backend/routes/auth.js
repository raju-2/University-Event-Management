const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { runQuery } = require("../config/db");
const { protect } = require("../middleware/auth");

// ─── Helper: generate JWT ───────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
// Body: { name, email, password, phone, role?, adminSecret? }
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, adminSecret } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check if admin registration is allowed
    let userRole = "student";
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret key." });
      }
      userRole = "admin";
    }

    // Check if email already exists
    const existing = await runQuery(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered. Please login." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create User node in Neo4j
    const records = await runQuery(
      `CREATE (u:User {
        id: $id,
        name: $name,
        email: $email,
        password: $password,
        phone: $phone,
        role: $role,
        createdAt: datetime()
      }) RETURN u`,
      {
        id: userId,
        name,
        email,
        password: hashedPassword,
        phone: phone || "",
        role: userRole,
      }
    );

    const user = records[0].get("u").properties;
    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user
    const records = await runQuery(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (records.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = records[0].get("u").properties;

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
// Returns current logged-in user profile
router.get("/me", protect, async (req, res) => {
  try {
    const records = await runQuery(
      `MATCH (u:User {id: $id})
       OPTIONAL MATCH (u)-[:REGISTERED_FOR]->(e:Event)
       RETURN u, collect(e) as events`,
      { id: req.user.id }
    );

    if (records.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = records[0].get("u").properties;
    const events = records[0].get("events").map((e) => e.properties);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        registeredEvents: events,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

