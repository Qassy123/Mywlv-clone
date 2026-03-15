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

export default function Absence() {
  const [moduleName, setModuleName] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [reason, setReason] = useState("");
  const [absenceRecords, setAbsenceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  // This function fetches previously submitted absence requests for the logged-in user.
  const fetchAbsences = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view absences.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/absences`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load absence records.");
        setLoading(false);
        return;
      }

      setAbsenceRecords(Array.isArray(data.absences) ? data.absences : []);
      setLoading(false);
    } catch (err) {
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  // This function submits a new absence request to the backend.
  const handleSubmitAbsence = async (event) => {
    event.preventDefault();
    setSubmitMessage("");
    setError("");

    if (!moduleName.trim() || !absenceDate.trim() || !reason.trim()) {
      setError("Module, date, and reason are required.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/absences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module: moduleName.trim(),
          date: absenceDate,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit absence.");
        setSubmitting(false);
        return;
      }

      setModuleName("");
      setAbsenceDate("");
      setReason("");
      setSubmitMessage(data.message || "Absence submitted successfully.");
      await fetchAbsences();
      setSubmitting(false);
    } catch (err) {
      setError("Server error. Please try again later.");
      setSubmitting(false);
    }
  };

  // This function returns absence records sorted by newest first for display consistency.
  const sortedAbsenceRecords = useMemo(() => {
    return [...absenceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [absenceRecords]);

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">
        Absence
      </h2>

      <form
        onSubmit={handleSubmitAbsence}
        className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-6 shadow mb-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Module</label>
          <input
            type="text"
            value={moduleName}
            onChange={(event) => setModuleName(event.target.value)}
            placeholder="Enter module name"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={absenceDate}
            onChange={(event) => setAbsenceDate(event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Enter your absence reason"
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 px-3 py-2 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {submitMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 px-3 py-2 text-green-700 dark:text-green-300">
            {submitMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Absence"}
        </button>
      </form>

      {loading ? (
        <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-4 shadow">
          Loading absence records...
        </div>
      ) : sortedAbsenceRecords.length === 0 ? (
        <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-4 shadow">
          No absence requests submitted yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Module</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAbsenceRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                >
                  <td className="p-3">{formatDisplayDate(record.date)}</td>
                  <td className="p-3">{record.module}</td>
                  <td className="p-3">{record.reason}</td>
                  <td className="p-3">
                    <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}