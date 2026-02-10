import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";
import { API_BASE } from "../config";
import StaffModal from "../components/StaffModal";
import SupportLinksModal from "../components/SupportLinksModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function applyHighlight(text, query) {
  if (!query || query.length < 4) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const Home = ({ highlight }) => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [mailRead, setMailRead] = useState(false);
  const [modules, setModules] = useState([]);
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("Student");
  const [greeting, setGreeting] = useState("Welcome back");
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        const nameFromEmail = (payload?.email || "").split("@")[0] || "Student";
        setUserName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
      } catch {}
    }
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/timetable`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.timetable) {
          setEvents(data.timetable);
          setModules([...new Set(data.timetable.map((e) => e.module))]);
        }
      })
      .catch((err) => console.error("Error fetching timetable:", err));
  }, []);

  const handleCheckIn = () => {
    if (checkInCode === "1234") {
      setCheckInSuccess(true);
    } else {
      setCheckInSuccess(false);
    }
    setIsCheckInOpen(false);
    setCheckInCode("");
  };

  const now = new Date();
  const todayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const toMins = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const enriched = events.map((e) => {
    const [start, end] = e.time.split(" - ");
    return { ...e, startMins: toMins(start), endMins: toMins(end), dayIdx: DAYS.indexOf(e.day) };
  });

  const todayClasses = enriched.filter((e) => e.day === todayName);
  const inProgress = todayClasses.find((e) => nowMins >= e.startMins && nowMins <= e.endMins);

  let tileText = "No upcoming classes";
  if (inProgress) {
    tileText = `Now: ${inProgress.module} (${inProgress.time})`;
  } else {
    const upcomingToday = todayClasses.find((e) => e.startMins > nowMins);
    if (upcomingToday) {
      tileText = `Next: ${upcomingToday.module} (${upcomingToday.time})`;
    } else {
      const later = enriched.find((e) => e.dayIdx > DAYS.indexOf(todayName));
      if (later) tileText = `Next: ${later.module} (${later.time})`;
    }
  }

  let nextEvent = null;
  if (inProgress) {
    nextEvent = inProgress;
  } else {
    const upcomingToday = todayClasses.find((e) => e.startMins > nowMins);
    if (upcomingToday) nextEvent = upcomingToday;
    else nextEvent = enriched.find((e) => e.dayIdx > DAYS.indexOf(todayName));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm opacity-90">{greeting}</div>
            <div className="text-xl sm:text-2xl font-semibold">Welcome back, {userName} 👋</div>
          </div>
          <div className="hidden sm:block text-3xl">🎓</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 5000, disableOnInteraction: false }} pagination={{ clickable: true }} loop={true} spaceBetween={20} slidesPerView={1} className="rounded-2xl shadow-md w-full">
          {[banner1, banner2, banner3, banner4].map((b, i) => (
            <SwiperSlide key={i}>
              <motion.div whileHover={{ scale: 1.01 }} className="aspect-[16/9] w-full">
                <img src={b} alt={`Banner ${i + 1}`} className="w-full h-full object-cover rounded-2xl" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
        {[
          { color: "bg-blue-100", title: "Timetable", text: tileText, onClick: () => navigate("/timetable") },
          { color: "bg-yellow-100", title: "Courses", text: `${modules.length}`, onClick: () => setIsCoursesOpen(true) },
          { color: "bg-purple-100", title: "Student Check-In", text: checkInSuccess ? "✅ Checked in" : "Tap to enter your lecture code", onClick: () => setIsCheckInOpen(true) },
          { color: "bg-red-100", title: "Staff", text: "View lecturers", onClick: () => setIsStaffOpen(true) },
          { color: "bg-orange-100", title: "Support & Links", text: "Helpful resources", onClick: () => setIsSupportOpen(true) },
        ].map((tile, i) => (
          <motion.div key={i} onClick={tile.onClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`${tile.color} rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition`}>
            <h2 className="text-lg font-bold text-purple-700">{tile.title}</h2>
            <p className="text-gray-600 mt-2">{tile.text}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-bold text-purple-700">Next Event</h2>
        {nextEvent ? (
          <div className="mt-2">
            <p className="font-semibold text-gray-800">{nextEvent.module}</p>
            <p className="text-sm text-gray-600">{nextEvent.day} • {nextEvent.time}</p>
          </div>
        ) : (
          <p className="text-gray-600 mt-2">No upcoming events 🎉</p>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-bold text-purple-700">Newsroom</h2>
        <p className="text-gray-700 mt-1">
          {applyHighlight("WLV Student Newsletter: Welcome to semester 1 2025/26. Stay updated with the latest news and events from the University.", highlight)}
        </p>
      </motion.div>

      <AnimatePresence>
        {isCheckInOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-6 shadow-lg w-80">
              <h3 className="text-lg font-bold text-purple-700 mb-3">Enter Lecture Code</h3>
              <input type="text" placeholder="Enter code..." value={checkInCode} onChange={(e) => setCheckInCode(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setIsCheckInOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={handleCheckIn} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCoursesOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-6 shadow-lg w-80 relative">
              <button onClick={() => setIsCoursesOpen(false)} className="absolute top-2 right-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">✕</button>
              <h3 className="text-lg font-bold text-purple-700 mb-4">My Courses</h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {modules.map((course, index) => (
                  <li key={index} className="p-2 border-b border-gray-200 text-gray-700">{applyHighlight(course, highlight)}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}

        {isMailOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-xl p-6 shadow-lg w-96 relative">
              <button onClick={() => setIsMailOpen(false)} className="absolute top-2 right-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400">✕</button>
              <h3 className="text-lg font-bold text-purple-700 mb-4">Latest Mail</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-gray-800">{applyHighlight("Subject: Assignment Reminder", highlight)}</p>
                <p className="text-gray-600 mt-2">{applyHighlight("Your Human-Computer Interaction coursework is due next Friday. Please submit via Canvas before 5pm.", highlight)}</p>
                <p className="text-sm text-gray-500 mt-2">{applyHighlight("From: lecturer@wlv.ac.uk", highlight)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isStaffOpen && (
          <StaffModal isOpen={isStaffOpen} onClose={() => setIsStaffOpen(false)} />
        )}

        {isSupportOpen && (
          <SupportLinksModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
