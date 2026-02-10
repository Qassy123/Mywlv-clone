require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://mywlv-clone.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

// MySQL connection with auto-reconnect
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
    if (err) setTimeout(handleDisconnect, 2000);
    else console.log("✅ MySQL connected");
  });

  db.on("error", err => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") handleDisconnect();
    else throw err;
  });
}
handleDisconnect();

// Seed demo data from user_id = 1 into new user
function seedDemoDataForUser(newUserId, done) {
  const demoUserId = 1;

  db.query(
    `INSERT INTO timetable (user_id, day, module, time, room, status)
     SELECT ?, day, module, time, room, status FROM timetable WHERE user_id = ?`,
    [newUserId, demoUserId],
    (e1) => {
      if (e1) return done(e1);

      db.query(
        `INSERT INTO grades (user_id, module, grade)
         SELECT ?, module, grade FROM grades WHERE user_id = ?`,
        [newUserId, demoUserId],
        (e2) => {
          if (e2) return done(e2);

          db.query(
            `INSERT INTO calendar (user_id, title, description, date, status, priority)
             SELECT ?, title, description, date, status, priority FROM calendar WHERE user_id = ?`,
            [newUserId, demoUserId],
            done
          );
        }
      );
    }
  );
}

// User registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, rows) => {
    if (rows.length) return res.status(400).json({ error: "User exists" });

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password],
      (err, result) => {
        const newUserId = result.insertId;

        seedDemoDataForUser(newUserId, () => {
          res.json({ message: "User registered", id: newUserId });
        });
      }
    );
  });
});

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (!results.length) return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(403).json({ error: "No token" });

  jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// Grades endpoint
app.get("/grades", verifyToken, (req, res) => {
  db.query(
    "SELECT module, grade FROM grades WHERE user_id = ?",
    [req.user.id],
    (_, results) => res.json({ grades: results })
  );
});

// Timetable endpoint
app.get("/timetable", verifyToken, (req, res) => {
  db.query(
    "SELECT day, module, time, room, status FROM timetable WHERE user_id = ?",
    [req.user.id],
    (_, results) => res.json({ timetable: results })
  );
});

// Calendar endpoint
app.get("/calendar", verifyToken, (req, res) => {
  db.query(
    "SELECT id, title, description, date, status, priority FROM calendar WHERE user_id = ?",
    [req.user.id],
    (_, results) => res.json({ calendar: results })
  );
});

// Staff directory endpoint
app.get("/staff", (req, res) => {
  db.query("SELECT * FROM staff", (_, results) => res.json(results));
});

// Health check
app.get("/health", (_, res) => res.json({ status: "UP" }));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
