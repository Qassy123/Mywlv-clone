import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_MAIL = [
  {
    id: 1,
    subject: "Assignment Reminder",
    from: "lecturer@wlv.ac.uk",
    date: "2026-02-07",
    body: "Your Human-Computer Interaction coursework is due next Friday. Please submit via Canvas before 5pm.",
    unread: true,
    tag: "Urgent",
  },
  {
    id: 2,
    subject: "Module Update: Cyber Security",
    from: "cyber@wlv.ac.uk",
    date: "2026-02-05",
    body: "Lecture slides have been uploaded. Please review the OWASP section before next class.",
    unread: false,
    tag: "Info",
  },
  {
    id: 3,
    subject: "Library Notice",
    from: "library@wlv.ac.uk",
    date: "2026-02-02",
    body: "Extended opening hours this week. Check the library website for full details.",
    unread: false,
    tag: "Info",
  },
];

export default function Mail() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DEMO_MAIL;
    return DEMO_MAIL.filter(m =>
      (m.subject || "").toLowerCase().includes(q) ||
      (m.from || "").toLowerCase().includes(q) ||
      (m.body || "").toLowerCase().includes(q)
    );
  }, [search]);

  const unreadCount = DEMO_MAIL.filter(m => m.unread).length;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">Mail</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mail..."
          className="w-full sm:w-80 border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No messages found.</p>
        ) : (
          filtered.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => setSelected(m)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`text-left rounded-xl p-4 shadow border dark:border-gray-700 ${
                m.unread ? "bg-purple-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">
                  {m.subject}{" "}
                  {m.tag && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded">
                      {m.tag}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{m.date}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">From: {m.from}</div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mt-2 line-clamp-2">
                {m.body}
              </div>
            </motion.button>
          ))
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="bg-white dark:bg-gray-900 dark:text-white rounded-xl shadow-lg w-full max-w-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    {selected.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    From: {selected.from} • {selected.date}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                {selected.body}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
