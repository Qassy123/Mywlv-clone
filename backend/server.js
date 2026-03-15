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

// This function creates a MySQL connection and reconnects if the connection drops.
let db;
function handleDisconnect() {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) setTimeout(handleDisconnect, 2000);
    else console.log("MySQL connected");
  });

  db.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") handleDisconnect();
    else {
      console.error("MySQL error:", err);
      handleDisconnect();
    }
  });
}
handleDisconnect();

// This function seeds demo timetable, grades, and calendar data from user_id 1 into a new user.
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

// This function ensures an existing user has demo data if their core tables are empty.
function ensureUserHasDemoData(userId, done) {
  db.query(
    `SELECT
      (SELECT COUNT(*) FROM timetable WHERE user_id = ?) AS timetableCount,
      (SELECT COUNT(*) FROM grades WHERE user_id = ?) AS gradesCount,
      (SELECT COUNT(*) FROM calendar WHERE user_id = ?) AS calendarCount`,
    [userId, userId, userId],
    (err, rows) => {
      if (err) return done(err);

      const r = rows && rows[0] ? rows[0] : {};
      const total =
        Number(r.timetableCount || 0) +
        Number(r.gradesCount || 0) +
        Number(r.calendarCount || 0);

      if (total > 0) return done(null);
      seedDemoDataForUser(userId, done);
    }
  );
}

// User registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length) return res.status(400).json({ error: "User exists" });

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: "Database error" });

        const newUserId = result.insertId;
        seedDemoDataForUser(newUserId, (seedErr) => {
          if (seedErr) return res.status(500).json({ error: "Seed failed" });
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
      if (err) return res.status(500).json({ error: "Database error" });
      if (!results.length) return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];

      ensureUserHasDemoData(user.id, (seedErr) => {
        if (seedErr) console.error("Seed-on-login failed:", seedErr);

        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({ token });
      });
    }
  );
});

// This middleware verifies the JWT token and attaches the decoded user to the request.
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(403).json({ error: "No token" });

  jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// This function formats a JavaScript date into a YYYY-MM-DD string.
function formatDateOnly(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// This function gets the next integer id for tables that may not auto-increment in Railway UI.
function getNextTableId(tableName, done) {
  db.query(`SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM ${tableName}`, (err, rows) => {
    if (err) return done(err);
    done(null, rows[0].nextId);
  });
}

// This endpoint validates a lecture code and records attendance for the logged-in user.
app.post("/checkin", verifyToken, (req, res) => {
  const { code } = req.body;
  const trimmedCode = String(code || "").trim();

  if (!trimmedCode) {
    return res.status(400).json({ error: "Lecture code is required" });
  }

  db.query(
    "SELECT id, module, code, date FROM lecture_codes WHERE code = ? ORDER BY date DESC LIMIT 1",
    [trimmedCode],
    (codeErr, codeRows) => {
      if (codeErr) return res.status(500).json({ error: "Database error" });
      if (!codeRows.length) return res.status(400).json({ error: "Invalid lecture code" });

      const lecture = codeRows[0];
      const attendanceDate = formatDateOnly(lecture.date);

      db.query(
        "SELECT id FROM attendance WHERE user_id = ? AND module = ? AND date = ? LIMIT 1",
        [req.user.id, lecture.module, attendanceDate],
        (existingErr, existingRows) => {
          if (existingErr) return res.status(500).json({ error: "Database error" });
          if (existingRows.length) {
            return res.status(400).json({ error: "You have already checked in for this session" });
          }

          getNextTableId("attendance", (idErr, nextId) => {
            if (idErr) return res.status(500).json({ error: "Database error" });

            db.query(
              "INSERT INTO attendance (id, user_id, module, date, status) VALUES (?, ?, ?, ?, ?)",
              [nextId, req.user.id, lecture.module, attendanceDate, "Present"],
              (insertErr) => {
                if (insertErr) return res.status(500).json({ error: "Database error" });

                return res.json({
                  message: "Check-in successful",
                  attendance: {
                    id: nextId,
                    user_id: req.user.id,
                    module: lecture.module,
                    date: attendanceDate,
                    status: "Present",
                  },
                });
              }
            );
          });
        }
      );
    }
  );
});

// This endpoint returns all attendance records for the logged-in user.
app.get("/attendance", verifyToken, (req, res) => {
  db.query(
    "SELECT id, user_id, module, date, status FROM attendance WHERE user_id = ? ORDER BY date DESC, id DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ attendance: results });
    }
  );
});

// This endpoint creates a new absence request for the logged-in user.
app.post("/absences", verifyToken, (req, res) => {
  const { module, date, reason } = req.body;
  const trimmedModule = String(module || "").trim();
  const trimmedReason = String(reason || "").trim();
  const trimmedDate = String(date || "").trim();

  if (!trimmedModule || !trimmedDate || !trimmedReason) {
    return res.status(400).json({ error: "Module, date, and reason are required" });
  }

  getNextTableId("absences", (idErr, nextId) => {
    if (idErr) return res.status(500).json({ error: "Database error" });

    db.query(
      "INSERT INTO absences (id, user_id, module, date, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
      [nextId, req.user.id, trimmedModule, trimmedDate, trimmedReason, "Pending"],
      (insertErr) => {
        if (insertErr) return res.status(500).json({ error: "Database error" });

        res.json({
          message: "Absence submitted successfully",
          absence: {
            id: nextId,
            user_id: req.user.id,
            module: trimmedModule,
            date: trimmedDate,
            reason: trimmedReason,
            status: "Pending",
          },
        });
      }
    );
  });
});

// This endpoint returns all absence requests for the logged-in user.
app.get("/absences", verifyToken, (req, res) => {
  db.query(
    "SELECT id, user_id, module, date, reason, status FROM absences WHERE user_id = ? ORDER BY date DESC, id DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ absences: results });
    }
  );
});

// Grades endpoint
app.get("/grades", verifyToken, (req, res) => {
  db.query(
    "SELECT module, grade FROM grades WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ grades: results });
    }
  );
});

// Timetable endpoint
app.get("/timetable", verifyToken, (req, res) => {
  db.query(
    "SELECT day, module, time, room, status FROM timetable WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ timetable: results });
    }
  );
});

// Calendar endpoint
app.get("/calendar", verifyToken, (req, res) => {
  db.query(
    "SELECT id, title, description, date, status, priority FROM calendar WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ calendar: results });
    }
  );
});

// Staff directory endpoint
app.get("/staff", (req, res) => {
  db.query("SELECT * FROM staff", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Health check
app.get("/health", (_, res) => res.json({ status: "UP" }));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});