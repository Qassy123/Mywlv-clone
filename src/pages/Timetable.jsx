import { useMemo, useState } from "react";
import { TIMETABLE_EVENTS } from "../data/timetable.js";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const toMins = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// --- ICS helpers (for export) ---
const pad = (n) => String(n).padStart(2, "0");
const formatICSLocal = (date) => {
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${mo}${d}T${h}${mi}${s}`;
};
const startOfWeekMonday = (ref = new Date()) => {
  const d = new Date(ref);
  const day = d.getDay(); // 0=Sun,...,6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
};

export default function Timetable() {
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState("All Week");

  const now = new Date();
  const todayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Enrich: start/end minutes + day index
  const enriched = useMemo(() => {
    return TIMETABLE_EVENTS.map((item) => {
      const [start, end] = item.time.split(" - ");
      return {
        ...item,
        startMins: toMins(start),
        endMins: toMins(end),
        dayIdx: DAYS.indexOf(item.day),
      };
    });
  }, []);

  // Sort by day -> start time
  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => (a.dayIdx - b.dayIdx) || (a.startMins - b.startMins));
    return copy;
  }, [enriched]);

  // Next class = first future (today first, then later days)
  const nextClass = useMemo(() => {
    const todayFuture = sorted.filter(c => c.day === todayName && c.startMins > nowMins);
    if (todayFuture.length) return todayFuture[0];
    const later = sorted.filter(c => c.dayIdx > DAYS.indexOf(todayName));
    return later[0] || null;
  }, [sorted, todayName, nowMins]);

  // Apply filters
  let view = sorted;
  if (showTodayOnly) view = view.filter(v => v.day === todayName);
  if (selectedDay !== "All Week") view = view.filter(v => v.day === selectedDay);

  const empty = view.length === 0;
  const isInProgress = (cls) =>
    cls.day === todayName && nowMins >= cls.startMins && nowMins <= cls.endMins;

  // 👉 Group by day (for desktop table rowSpan) + detect conflicts
  const groups = useMemo(() => {
    const map = new Map();
    for (const cls of view) {
      if (!map.has(cls.day)) map.set(cls.day, []);
      map.get(cls.day).push({ ...cls }); // clone
    }
    const ordered = DAYS
      .filter(day => map.has(day))
      .map(day => {
        const classes = map.get(day).sort((a,b) => a.startMins - b.startMins);
        // conflict detection: mark any overlap within the same day
        for (let i = 0; i < classes.length; i++) {
          for (let j = i + 1; j < classes.length; j++) {
            const a = classes[i], b = classes[j];
            const overlap = a.startMins < b.endMins && b.startMins < a.endMins;
            if (overlap) {
              a.conflict = true;
              b.conflict = true;
            }
          }
        }
        return { day, classes };
      });
    return ordered;
  }, [view]);

  // --- Export current view to .ics (this week) ---
  const exportICS = () => {
    if (empty) return;
    const weekStart = startOfWeekMonday(now); // Monday of current week
    // flatten current view for export
    const items = groups.flatMap(g => g.classes.map(c => ({ ...c, day: g.day })));
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//myWLV Redesign//Timetable//EN",
    ];
    for (const c of items) {
      const dayIdx = DAYS.indexOf(c.day);
      const classDate = new Date(weekStart);
      classDate.setDate(weekStart.getDate() + dayIdx);
      // start / end times
      const [startStr, endStr] = c.time.split(" - ");
      const [sh, sm] = startStr.split(":").map(Number);
      const [eh, em] = endStr.split(":").map(Number);
      const start = new Date(classDate); start.setHours(sh, sm, 0, 0);
      const end = new Date(classDate);   end.setHours(eh, em, 0, 0);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${cryptoRandom()}`);
      lines.push(`DTSTAMP:${formatICSLocal(new Date())}`);
      lines.push(`DTSTART:${formatICSLocal(start)}`);
      lines.push(`DTEND:${formatICSLocal(end)}`);
      lines.push(`SUMMARY:${escapeICS(c.module)}`);
      lines.push(`LOCATION:${escapeICS(c.room)}`);
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  // helpers for ICS
  function escapeICS(text) {
    return String(text).replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  }
  function cryptoRandom() {
    // quick UID generator
    return "uid-" + Math.random().toString(36).slice(2) + Date.now();
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-3">Weekly Timetable</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button
          onClick={() => setShowTodayOnly(!showTodayOnly)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showTodayOnly ? "Show Full Week" : "Show Today’s Classes"}
        </button>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option>All Week</option>
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>

        {/* Export buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={exportICS}
            className="px-3 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
            title="Download current view as a calendar (.ics) file"
          >
            Export .ics
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            title="Print or Save as PDF from your browser"
          >
            Print / PDF
          </button>
        </div>
      </div>

      {/* Next class banner */}
      {nextClass && !showTodayOnly && selectedDay === "All Week" && (
        <div className="mb-5 rounded-md bg-blue-600 text-white px-4 py-3 font-semibold">
          📌 Next Class: {nextClass.module} — {nextClass.day} {nextClass.time} in {nextClass.room}
        </div>
      )}

      {/* Empty state */}
      {empty && (
        <div className="text-gray-600">No classes in this view 🎉</div>
      )}

      {/* Mobile: cards */}
      {!empty && (
        <div className="grid gap-3 md:hidden">
          {view.map((cls, i) => (
            <div
              key={i}
              className={`rounded-lg border shadow-sm overflow-hidden ${isInProgress(cls) ? "ring-2 ring-green-500" : ""}`}
            >
              <div className="p-3 font-medium flex justify-between items-center" style={{ backgroundColor: cls.color }}>
                <span>{cls.module}</span>
                <div className="flex items-center gap-2">
                  {cls.conflict && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">⚠️ Conflict</span>}
                  {isInProgress(cls) && <span className="text-sm font-semibold">⏳ In Progress</span>}
                </div>
              </div>
              <div className="p-3 text-sm text-gray-700">
                <div><span className="font-medium">Day:</span> {cls.day}</div>
                <div><span className="font-medium">Time:</span> {cls.time}</div>
                <div><span className="font-medium">Room:</span> {cls.room}</div>
                {cls.day === todayName && !isInProgress(cls) && (
                  <div className="mt-1 text-green-700">✅ Today</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop: grouped table */}
      {!empty && (
        <table className="hidden md:table w-full border-collapse mt-2">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2 w-40">Day</th>
              <th className="border p-2">Module</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Room</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(({ day, classes }) => {
              return classes.map((cls, idx) => {
                const inProg = isInProgress(cls);
                const isToday = cls.day === todayName;
                const cellsTopBorder = idx > 0 ? "border-t-2 border-gray-300" : "";

                return (
                  <tr
                    key={`${day}-${idx}`}
                    className={`${inProg ? "ring-2 ring-green-500" : ""}`}
                    style={{ backgroundColor: cls.color }}
                  >
                    {idx === 0 && (
                      <td className="border p-2 font-semibold align-top" rowSpan={classes.length}>
                        <div className="flex items-center gap-2">
                          <span>{day}</span>
                          <span className="inline-flex items-center rounded-full bg-purple-700 text-white text-xs px-2 py-0.5">
                            {classes.length} class{classes.length > 1 ? "es" : ""}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className={`border p-2 ${cellsTopBorder}`}>
                      <div className="flex items-center gap-2">
                        <span>{cls.module}</span>
                        {cls.conflict && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">⚠️ Conflict</span>
                        )}
                      </div>
                    </td>
                    <td className={`border p-2 ${cellsTopBorder}`}>{cls.time}</td>
                    <td className={`border p-2 ${cellsTopBorder}`}>{cls.room}</td>
                    <td className={`border p-2 ${cellsTopBorder}`}>
                      {inProg ? "⏳ In Progress" : isToday ? "✅ Today" : "—"}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Re-export so older imports (e.g. Grades) still work.
export { TIMETABLE_MODULES } from "../data/timetable.js";
