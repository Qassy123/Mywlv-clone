import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";

// This function formats a date string into a readable UK date.
function formatDisplayDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue || "");
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // This function fetches attendance records for the logged-in user.
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view attendance.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/attendance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load attendance.");
          setLoading(false);
          return;
        }

        setAttendanceRecords(Array.isArray(data.attendance) ? data.attendance : []);
        setLoading(false);
      } catch (err) {
        setError("Server error. Please try again later.");
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // This function calculates the overall attendance percentage from recorded statuses.
  const attendancePercentage = useMemo(() => {
    if (!attendanceRecords.length) return 0;
    const presentCount = attendanceRecords.filter(
      (record) => String(record.status || "").toLowerCase() === "present"
    ).length;
    return Math.round((presentCount / attendanceRecords.length) * 100);
  }, [attendanceRecords]);

  // This function counts present attendance entries for quick summary display.
  const presentCount = useMemo(() => {
    return attendanceRecords.filter(
      (record) => String(record.status || "").toLowerCase() === "present"
    ).length;
  }, [attendanceRecords]);

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">
        Attendance
      </h2>

      {loading && (
        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 shadow">
          Loading attendance...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300 shadow">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-purple-100 dark:bg-purple-900 p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">Attendance Percentage</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                {attendancePercentage}%
              </p>
            </div>

            <div className="rounded-2xl bg-green-100 dark:bg-green-900 p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">Present Sessions</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                {presentCount}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-100 dark:bg-blue-900 p-4 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Recorded Sessions</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {attendanceRecords.length}
              </p>
            </div>
          </div>

          {attendanceRecords.length === 0 ? (
            <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-4 shadow">
              No attendance records found yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Module</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      <td className="p-3">{formatDisplayDate(record.date)}</td>
                      <td className="p-3">{record.module}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                            String(record.status || "").toLowerCase() === "present"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}