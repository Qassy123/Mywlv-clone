import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_BASE } from "../config";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "", done: false });
  const [monthView, setMonthView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const pad = (n) => String(n).padStart(2, "0");
  const formatDateLocal = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const normalizeDate = (val) => {
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val || "") : formatDateLocal(d);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/calendar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          const mapped = (data.calendar || []).map((ev, i) => ({
            ...ev,
            id: ev.id ?? i + 1,
            date: normalizeDate(ev.date),
            done: false,
          }));
          setEvents(mapped);
        } else {
          console.error("Failed to fetch events:", data.error || data);
        }
      } catch (err) {
        console.error("Server error:", err);
      }
    };
    fetchEvents();
  }, []);

  const isPriority = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  const filteredEvents = events
    .filter((ev) => {
      if (filter === "7days") {
        const today = new Date();
        const date = new Date(ev.date);
        const diff = (date - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }
      if (filter === "month") {
        const today = new Date();
        const date = new Date(ev.date);
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      }
      return true;
    })
    .filter(
      (ev) =>
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const addEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents([
      ...events,
      {
        id: Date.now(),
        ...newEvent,
        date: normalizeDate(newEvent.date),
      },
    ]);
    setNewEvent({ title: "", date: "", description: "", done: false });
    setShowForm(false);
  };

  const toggleDone = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, done: !ev.done } : ev));
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({ ...selectedEvent, done: !selectedEvent.done });
    }
  };

  const exportICS = () => {
    if (!events.length) return;
    let icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//myWLV Clone//EN\n`;
    events.forEach(ev => {
      const startDate = new Date(ev.date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      icsData += `BEGIN:VEVENT\nSUMMARY:${ev.title}\nDESCRIPTION:${ev.description}\nDTSTART:${startDate}\nDTEND:${startDate}\nEND:VEVENT\n`;
    });
    icsData += "END:VCALENDAR";
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    saveAs(blob, "mywlv-events.ics");
  };

  const exportCSV = () => {
    if (!events.length) return;
    const header = "Title,Date,Description,Done\n";
    const rows = events.map(ev => `${ev.title},${ev.date},${ev.description},${ev.done}`);
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "mywlv-events.csv");
  };

  const exportPDF = () => {
    if (!events.length) return;
    const doc = new jsPDF();
    doc.text("Calendar Events", 14, 15);
    autoTable(doc, {
      head: [["Title", "Date", "Description", "Done"]],
      body: events.map(ev => [
        ev.title,
        ev.date,
        ev.description,
        ev.done ? "Yes" : "No",
      ]),
    });
    doc.save("mywlv-events.pdf");
  };

  const todayStr = formatDateLocal(new Date());
  const todayEvents = events.filter(ev => ev.date === todayStr);
  const nextDeadlines = filteredEvents.filter(ev => !ev.done).slice(0, 3);

  const renderCalendar = () => {
    const year = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i));

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {months.map((monthDate, idx) => {
          const month = monthDate.getMonth();
          const monthName = monthDate.toLocaleString("default", { month: "long" });
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          return (
            <div key={idx} className="border rounded p-2">
              <h3 className="text-center font-bold mb-2">{monthName} {year}</h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: daysInMonth }, (_, d) => {
                  const dateStr = formatDateLocal(new Date(year, month, d + 1));
                  const dayEvents = events.filter(ev => ev.date === dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={dateStr} className={`border min-h-[80px] p-1 ${isToday ? "ring-2 ring-purple-500" : ""}`}>
                      <p className="text-gray-500">{d + 1}</p>
                      {dayEvents.map((ev, i) => (
                        <div
                          key={ev.id ?? `${ev.title}-${ev.date}-${i}`}
                          title={ev.title}
                          onClick={() => setSelectedEvent(ev)}
                          className={`cursor-pointer text-[9px] rounded px-1 mt-1 w-full truncate block ${
                            ev.done
                              ? "bg-gray-300 line-through"
                              : ["bg-purple-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-pink-200"][(Number(ev.id) || i) % 5]
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>

      <div className="bg-purple-100 p-3 rounded mb-4">
        <h3 className="font-bold">
          Today is {new Date().toLocaleDateString("en-UK", { weekday: "long", day: "numeric", month: "long" })}
        </h3>
        <p>{todayEvents.length} event(s) today</p>
      </div>

      {nextDeadlines.length > 0 && (
        <div className="bg-yellow-100 p-3 rounded mb-4">
          <h3 className="font-bold">Next Deadlines</h3>
          <ul className="list-disc ml-5">
            {nextDeadlines.map((ev, i) => (
              <li key={ev.id ?? `${ev.title}-${ev.date}-${i}`}>
                {ev.title} – {new Date(ev.date).toLocaleDateString()} {isPriority(ev.date) && "⚠️"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search events..."
          className="flex-1 border rounded p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="7days">Next 7 Days</option>
          <option value="month">This Month</option>
        </select>
        <button onClick={() => setShowForm(!showForm)} className="bg-purple-700 text-white px-3 rounded hover:bg-purple-800">+ Add Event</button>
        <button onClick={exportICS} className="bg-green-600 text-white px-3 rounded hover:bg-green-700">Export .ICS</button>
        <button onClick={exportCSV} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">Export CSV</button>
        <button onClick={exportPDF} className="bg-gray-700 text-white px-3 rounded hover:bg-gray-800">Export PDF</button>
        <button onClick={() => setMonthView(!monthView)} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">
          {monthView ? "Switch to List View" : "Switch to 12-Month View"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addEvent} className="mb-6 bg-gray-100 p-4 rounded">
          <input
            type="text"
            placeholder="Event title"
            className="block w-full mb-2 border rounded p-2"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <input
            type="date"
            className="block w-full mb-2 border rounded p-2"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <textarea
            placeholder="Description (optional)"
            className="block w-full mb-2 border rounded p-2"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save Event</button>
        </form>
      )}

      {monthView ? renderCalendar() : (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500">No events found.</p>
          ) : (
            filteredEvents.map((ev, i) => (
              <div
                key={ev.id ?? `${ev.title}-${ev.date}-${i}`}
                className={`p-4 rounded shadow flex justify-between items-start ${
                  ["bg-purple-100", "bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-pink-100"][i % 5]
                } ${ev.done ? "opacity-60 line-through" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {new Date(ev.date).toLocaleDateString("en-UK", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="text-lg font-bold">
                    {ev.title}{" "}
                    {isPriority(ev.date) && !ev.done && (
                      <span className="ml-2 text-red-600 font-semibold">PRIORITY ⚠️</span>
                    )}
                  </h3>
                  <p className="text-gray-700">{ev.description}</p>
                  {new Date(ev.date).toDateString() === new Date(Date.now() + 86400000).toDateString() && (
                    <p className="text-orange-600 font-semibold">Reminder: This is tomorrow!</p>
                  )}
                </div>
                <button onClick={() => toggleDone(ev.id)} className="bg-gray-600 text-white px-3 py-1 rounded ml-4">
                  {ev.done ? "Undo" : "✅ Done"}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded shadow-lg w-full max-w-lg ${
              ["bg-purple-100", "bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-pink-100"][(Number(selectedEvent?.id) || 0) % 5]
            }`}
          >
            <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-600 mb-2">
              {new Date(selectedEvent.date).toLocaleDateString("en-UK", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="mb-4">{selectedEvent.description}</p>
            {isPriority(selectedEvent.date) && !selectedEvent.done && (
              <p className="text-red-600 font-bold mb-4 text-lg">⚠️ PRIORITY</p>
            )}
            <button onClick={() => toggleDone(selectedEvent.id)} className="bg-gray-600 text-white px-4 py-2 rounded mr-2">
              {selectedEvent.done ? "Undo" : "✅ Done"}
            </button>
            <button onClick={() => setSelectedEvent(null)} className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
