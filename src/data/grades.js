// src/data/grades.js
import { TIMETABLE_MODULES } from "../pages/Timetable";

export const GRADES = [
  {
    module: "Web Development",
    assignment: "Portfolio Project",
    grade: 72,
    breakdown: [
      {
        part: "Web Development Lecture",
        grade: 75,
        reason: "Strong project submission",
        markscheme: [
          { criteria: "Code Quality", score: "30/40" },
          { criteria: "Documentation", score: "20/25" },
          { criteria: "Presentation", score: "25/35" },
        ],
      },
      {
        part: "Web Dev Lab",
        grade: 68,
        reason: "Good attendance, minor mistakes in exercises",
        markscheme: [
          { criteria: "Lab Exercises", score: "15/20" },
          { criteria: "Participation", score: "10/15" },
          { criteria: "Final Lab Test", score: "43/65" },
        ],
      },
    ],
  },
  {
    module: "Database Systems",
    assignment: "SQL Coursework",
    grade: 65,
    breakdown: [
      {
        part: "Lectures",
        grade: 70,
        reason: "Solid understanding of theory",
        markscheme: [
          { criteria: "ER Modelling", score: "25/40" },
          { criteria: "Normalization", score: "20/30" },
          { criteria: "SQL Queries", score: "25/30" },
        ],
      },
      {
        part: "Lab",
        grade: 60,
        reason: "Some errors in queries",
        markscheme: [
          { criteria: "Practical Work", score: "30/50" },
          { criteria: "Lab Test", score: "30/50" },
        ],
      },
    ],
  },
  {
    module: "Networks",
    assignment: "Lab Report",
    grade: 58,
    breakdown: [
      {
        part: "Networks Lecture",
        grade: 60,
        reason: "Average exam result",
        markscheme: [
          { criteria: "Theory Exam", score: "40/70" },
          { criteria: "Assignments", score: "18/30" },
        ],
      },
      {
        part: "Networks Lab",
        grade: 55,
        reason: "Missed one submission",
        markscheme: [
          { criteria: "Lab Work", score: "20/40" },
          { criteria: "Practical Test", score: "35/60" },
        ],
      },
    ],
  },
  {
    module: "AI & Machine Learning",
    assignment: "Final Exam",
    grade: 81,
    breakdown: [
      {
        part: "AI Lecture",
        grade: 85,
        reason: "Excellent exam answers",
        markscheme: [
          { criteria: "Exam Part A", score: "45/50" },
          { criteria: "Exam Part B", score: "40/50" },
        ],
      },
      {
        part: "AI Seminar",
        grade: 78,
        reason: "Good discussions, minor mistakes",
        markscheme: [
          { criteria: "Participation", score: "18/25" },
          { criteria: "Seminar Report", score: "60/75" },
        ],
      },
    ],
  },
  {
    module: "Project Lab",
    assignment: "Group Project",
    grade: 49,
    breakdown: [
      {
        part: "Lab Work",
        grade: 50,
        reason: "Incomplete final submission",
        markscheme: [
          { criteria: "Team Contribution", score: "20/40" },
          { criteria: "Project Delivery", score: "29/60" },
        ],
      },
    ],
  },
];
