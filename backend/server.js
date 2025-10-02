require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ------------------- REGISTER ROUTE -------------------
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length > 0) return res.status(400).json({ error: "User already exists" });

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "✅ User registered successfully", id: result.insertId });
      }
    );
  });
});

// ------------------- LOGIN ROUTE -------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "✅ Login successful", token });
  });
});

// ------------------- VERIFY TOKEN MIDDLEWARE -------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ error: "❌ No token provided" });
  }

  // Expect "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "❌ Token malformed" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "❌ Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

// ------------------- PROTECTED ROUTES -------------------

// ✅ GRADES (now from MySQL)
app.get("/grades", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT module, grade FROM grades WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({
        message: `✅ Grades loaded for ${req.user.email}`,
        grades: results,
      });
    }
  );
});

// ✅ TIMETABLE (now from MySQL)
app.get("/timetable", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT day, module, time, room, status FROM timetable WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({
        message: `✅ Timetable loaded for ${req.user.email}`,
        timetable: results,
      });
    }
  );
});

// ✅ CALENDAR (new, from MySQL)
app.get("/calendar", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT title, description, date, status, priority FROM calendar WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({
        message: `✅ Calendar loaded for ${req.user.email}`,
        calendar: results,
      });
    }
  );
});

// ------------------- START SERVER -------------------
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
