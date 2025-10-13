require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mywlv-clone.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

let db;
function handleDisconnect() {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect(err => {
    if (err) {
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("✅ MySQL connected:", process.env.DB_HOST);
    }
  });

  db.on("error", err => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (results.length > 0) return res.status(400).json({ error: "User already exists" });

    db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], (err, result) => {
      res.json({ message: "User registered", id: result.insertId });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

app.get("/grades", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query("SELECT module, grade FROM grades WHERE user_id = ?", [userId], (err, results) => {
    res.json({ grades: results });
  });
});

app.get("/timetable", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query("SELECT day, module, time, room, status FROM timetable WHERE user_id = ?", [userId], (err, results) => {
    res.json({ timetable: results });
  });
});

app.get("/calendar", verifyToken, (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id, title, description, date, status, priority FROM calendar WHERE user_id = ?", [userId], (err, results) => {
    res.json({ calendar: results });
  });
});

app.get("/health", (req, res) => res.json({ status: "UP" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
