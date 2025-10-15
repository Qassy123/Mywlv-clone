// src/pages/Grades.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_BASE } from "../config";

export default function Grades() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  const [sortOrder, setSortOrder] = useState(null);
  const [filter, setFilter] = useState("all");

  const [gradesData, setGradesData] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/grades`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.grades && Array.isArray(data.grades)) {
          const formatted = data.grades.map((g) => ({
            module: g.module,
            assignment: g.assignment || "Final Exam",
            grade: parseInt(g.grade, 10),
            breakdown: g.breakdown || [
              { part: "Overall", grade: parseInt(g.grade, 10), reason: "From database" },
            ],
          }));
          setGradesData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch grades:", err);
      }
    };

    fetchGrades();
  }, []);

  const average =
    gradesData.reduce((acc, g) => acc + g.grade, 0) /
    (gradesData.length || 1);

  let displayedGrades = [...gradesData];
  if (sortOrder === "asc") displayedGrades.sort((a, b) => a.grade - b.grade);
  if (sortOrder === "desc") displayedGrades.sort((a, b) => b.grade - a.grade);

  if (filter === "passed") displayedGrades = displayedGrades.filter((g) => g.grade >= 50);
  if (filter === "failed") displayedGrades = displayedGrades.filter((g) => g.grade < 50);

  const chartData = gradesData.map((g, idx) => ({
    name: g.module,
    grade: g.grade,
    index: idx + 1,
  }));
  const pieData = [
    { name: "Passed", value: gradesData.filter((g) => g.grade >= 50).length },
    { name: "Failed", value: gradesData.filter((g) => g.grade < 50).length },
  ];
  const COLORS = ["#22c55e", "#ef4444"];

  const highest = gradesData.reduce(
    (a, b) => (a.grade > b.grade ? a : b),
    { grade: 0, module: "N/A" }
  );
  const lowest = gradesData.reduce(
    (a, b) => (a.grade < b.grade ? a : b),
    { grade: 100, module: "N/A" }
  );

  const progress = Math.round((average / 100) * 100);

  let classification = "Unclassified";
  if (average >= 70) classification = "First Class";
  else if (average >= 60) classification = "Upper Second (2:1)";
  else if (average >= 50) classification = "Lower Second (2:2)";
  else if (average >= 40) classification = "Third Class";
  else classification = "Fail";

  const exportCSV = () => {
    const ws = utils.json_to_sheet(gradesData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Grades");
    writeFile(wb, "grades.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Grades Report", 14, 16);
    const tableData = gradesData.map((g) => [
      g.module,
      g.assignment,
      g.grade + "%",
    ]);
    autoTable(doc, {
      head: [["Module", "Assignment", "Grade"]],
      body: tableData,
      startY: 20,
    });
    doc.save("grades.pdf");
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">Grades</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={() => setSortOrder("asc")} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded">Sort Asc</button>
        <button onClick={() => setSortOrder("desc")} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded">Sort Desc</button>
        <button onClick={() => setSortOrder(null)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded">Reset</button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-1 border rounded dark:bg-gray-700 dark:text-white">
          <option value="all">All</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={exportCSV} className="px-3 py-1 bg-green-500 text-white rounded">Export CSV</button>
        <button onClick={exportPDF} className="px-3 py-1 bg-red-500 text-white rounded">Export PDF</button>
      </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full border-collapse shadow-md rounded-lg">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Assignment</th>
              <th className="p-3 text-left">Grade</th>
              <th className="p-3 text-left">Badge</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedGrades.map((g, idx) => (
              <tr key={idx} className="bg-white dark:bg-gray-800 border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3">{g.module}</td>
                <td className="p-3">{g.assignment}</td>
                <td className={`p-3 font-semibold ${g.grade >= 50 ? "text-green-600" : "text-red-600"}`}>
                  {g.grade}%
                </td>
                <td className="p-3">
                  {g.grade >= 80 ? "🏆 Excellent" : g.grade >= 50 ? "✅ On Track" : "⚠️ Needs Support"}
                </td>
                <td className="p-3">
                  <button
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-700"
                    onClick={() => {
                      setSelectedModule(g);
                      setSelectedComment(null);
                    }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {displayedGrades.map((g, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="font-bold">{g.module}</h3>
            <p>{g.assignment}</p>
            <p className={`font-semibold ${g.grade >= 50 ? "text-green-600" : "text-red-600"}`}>{g.grade}%</p>
            <p>
              {g.grade >= 80 ? "🏆 Excellent" : g.grade >= 50 ? "✅ On Track" : "⚠️ Needs Support"}
            </p>
            <button
              className="mt-2 px-3 py-1 bg-purple-500 text-white rounded"
              onClick={() => {
                setSelectedModule(g);
                setSelectedComment(null);
              }}
            >
              Details
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-lg shadow">
        <p className="font-bold">Average: <span className="font-normal">{average.toFixed(2)}%</span></p>
        <p className="mt-2"><strong>Best Module:</strong> {highest.module} ({highest.grade}%)</p>
        <p><strong>Needs Improvement:</strong> {lowest.module} ({lowest.grade}%)</p>
        <p className="mt-2"><strong>Classification:</strong> {classification}</p>

        <div className="mt-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded">
            <div className="h-4 bg-purple-600 rounded" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm mt-1">Tracking towards classification: {progress}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Grades per Module</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="grade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Pass vs Fail</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Trend Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [
                  `Grade: ${value}%`,
                  props.payload.name,
                ]}
              />
              <Line type="monotone" dataKey="grade" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedModule && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
              onClick={() => setSelectedModule(null)}
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">
              {selectedModule.module} – Breakdown
            </h3>

            {!selectedComment ? (
              <>
                <ul className="mb-4">
                  {selectedModule.breakdown.map((b, i) => (
                    <li key={i} className="mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{b.part}:</span>{" "}
                          <span className={`${b.grade >= 50 ? "text-green-600" : "text-red-600"} font-semibold`}>
                            {b.grade}%
                          </span>
                        </div>
                        <button
                          className="ml-3 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-700"
                          onClick={() => setSelectedComment(b)}
                        >
                          Comments
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="font-bold">
                  Final Grade:{" "}
                  <span className={`${selectedModule.grade >= 50 ? "text-green-600" : "text-red-600"}`}>
                    {selectedModule.grade}%
                  </span>
                </p>
              </>
            ) : (
              <div>
                <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">{selectedComment.part} – Comments</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedComment.reason}</p>

                {selectedComment.markscheme && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Mark Scheme:</h5>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm">
                      {selectedComment.markscheme.map((m, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{m.criteria}:</span> {m.score}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-700"
                  onClick={() => setSelectedComment(null)}
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
