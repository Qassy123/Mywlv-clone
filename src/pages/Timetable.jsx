import { useMemo, useState, useEffect } from "react";
import { API_BASE } from "../config";
import { motion } from "framer-motion";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const toMins = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

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
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
};

const moduleColors = {
  "Human Computer Interaction": "#8b5cf6",
  "Cyber Security": "#22c55e",
  "Software Engineering": "#f59e0b",
};

const colorPalette = [
  "#f87171",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#f472b6",
];

export default function Timetable() {
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState("All Week");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const now = new Date();
  const todayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const nowMins = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/timetable`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load timetable");
        const data = await res.json();
        setEvents(data.timetable || []);
      } catch (err) {
        setError("⚠️ Could not load timetable");
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const enriched = useMemo(() => {
    const colorMap = { ...moduleColors };
    let colorIndex = 0;
    return events.map((item) => {
      const [start, end] = item.time.split(" - ");
      if (!colorMap[item.module]) {
        colorMap[item.module] = colorPalette[colorIndex % colorPalette.length];
        colorIndex++;
      }
      return {
        ...item,
        startMins: toMins(start),
        endMins: toMins(end),
        dayIdx: DAYS.indexOf(item.day),
        color: colorMap[item.module],
      };
    });
  }, [events]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => (a.dayIdx - b.dayIdx) || (a.startMins - b.startMins));
    return copy;
  }, [enriched]);

  const nextClass = useMemo(() => {
    const todayFuture = sorted.filter(c => c.day === todayName && c.startMins > nowMins);
    if (todayFuture.length) return todayFuture[0];
    const later = sorted.filter(c => c.dayIdx > DAYS.indexOf(todayName));
    return later[0] || null;
  }, [sorted, todayName, nowMins]);

  let view = sorted;
  if (showTodayOnly) view = view.filter(v => v.day === todayName);
  if (selectedDay !== "All Week") view = view.filter(v => v.day === selectedDay);

  const empty = view.length === 0;
  const isInProgress = (cls) =>
    cls.day === todayName && nowMins >= cls.startMins && nowMins <= cls.endMins;

  const groups = useMemo(() => {
    const map = new Map();
    for (const cls of view) {
      if (!map.has(cls.day)) map.set(cls.day, []);
      map.get(cls.day).push({ ...cls });
    }
    const ordered = DAYS
      .filter(day => map.has(day))
      .map(day => {
        const classes = map.get(day).sort((a,b) => a.startMins - b.startMins);
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

  const exportICS = () => {
    if (empty) return;
    const weekStart = startOfWeekMonday(now);
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

  function escapeICS(text) {
    return String(text).replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  }
  function cryptoRandom() {
    return "uid-" + Math.random().toString(36).slice(2) + Date.now();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6">
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl font-bold mb-3">
        Weekly Timetable
      </motion.h2>

      {nextClass && !showTodayOnly && selectedDay === "All Week" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5 rounded-md bg-blue-600 text-white px-4 py-3 font-semibold">
          📌 Next Class: {nextClass.module} — {nextClass.day} {nextClass.time} in {nextClass.room}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <button onClick={() => setShowTodayOnly(!showTodayOnly)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {showTodayOnly ? "Show Full Week" : "Show Today’s Classes"}
        </button>

        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="px-3 py-2 border rounded">
          <option>All Week</option>
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={exportICS} className="px-3 py-2 bg-purple-700 text-white rounded hover:bg-purple-800">
            Export .ics
          </button>
          <button onClick={() => window.print()} className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            Print / PDF
          </button>
        </div>
      </div>

      {!empty && (
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} className="grid gap-3 md:hidden">
          {view.map((cls, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border shadow-sm overflow-hidden ${isInProgress(cls) ? "ring-2 ring-green-500 animate-pulse" : ""}`}>
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
            </motion.div>
          ))}
        </motion.div>
      )}

      {!empty && (
        <motion.table initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="hidden md:table w-full border-collapse mt-2">
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
                  <motion.tr key={`${day}-${idx}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className={`${inProg ? "ring-2 ring-green-500 animate-pulse" : ""}`} style={{ backgroundColor: cls.color }}>
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
                  </motion.tr>
                );
              });
            })}
          </tbody>
        </motion.table>
      )}
    </motion.div>
  );
}
