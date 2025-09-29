import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { TIMETABLE_EVENTS, TIMETABLE_MODULES } from "../data/timetable.js";

// ✅ banner images
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ✅ Highlight helper
function applyHighlight(text, query) {
  if (!query || query.length < 4) return text; // only highlight if 4+ chars
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
  const navigate = useNavigate();

  const handleCheckIn = () => {
    if (checkInCode === "1234") {
      setCheckInSuccess(true);
    } else {
      setCheckInSuccess(false);
    }
    setIsCheckInOpen(false);
    setCheckInCode("");
  };

  // --- timetable tile logic ---
  const now = new Date();
  const todayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const toMins = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const enriched = TIMETABLE_EVENTS.map((e) => {
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

  return (
    <div className="p-4 space-y-6">
      {/* ✅ Swiper with aspect ratio for consistent banners */}
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        spaceBetween={20}
        slidesPerView={1}
        className="rounded-2xl shadow-md w-full"
      >
        <SwiperSlide>
          <div className="aspect-[16/9] w-full">
            <img src={banner1} alt="Banner 1" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="aspect-[16/9] w-full">
            <img src={banner2} alt="Banner 2" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="aspect-[16/9] w-full">
            <img src={banner3} alt="Banner 3" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="aspect-[16/9] w-full">
            <img src={banner4} alt="Banner 4" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </SwiperSlide>
      </Swiper>

      {/* --- tiles --- */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/timetable")}
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Timetable</h2>
          <p className="text-gray-600 mt-2">{tileText}</p>
        </div>

        <div
          onClick={() => {
            setIsMailOpen(true);
            setMailRead(true);
          }}
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Mail</h2>
          {!mailRead ? (
            <p className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
              Urgent • Unread
            </p>
          ) : (
            <p className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded">
              All up to date
            </p>
          )}
        </div>

        <div
          onClick={() => setIsCoursesOpen(true)}
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Courses</h2>
          <p className="text-3xl font-semibold mt-2">{TIMETABLE_MODULES.length}</p>
        </div>

        <div
          onClick={() => setIsCheckInOpen(true)}
          className="bg-purple-100 rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Student Check-In</h2>
          <p className="text-gray-600 mt-2">Tap to enter your lecture code</p>
          {checkInSuccess && (
            <p className="mt-2 text-green-600 font-semibold">✅ Checked in</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-bold text-purple-700">Newsroom</h2>
        <p className="text-gray-700 mt-1">
          {applyHighlight(
            "WLV Student Newsletter: Welcome to semester 1 2025/26. Stay updated with the latest news and events from the University.",
            highlight
          )}
        </p>
      </div>

      {/* --- modals --- */}
      {isCheckInOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80">
            <h3 className="text-lg font-bold text-purple-700 mb-3">Enter Lecture Code</h3>
            <input
              type="text"
              placeholder="Enter code..."
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCheckInOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckIn}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isCoursesOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80 relative">
            <button
              onClick={() => setIsCoursesOpen(false)}
              className="absolute top-2 right-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-purple-700 mb-4">My Courses</h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {TIMETABLE_MODULES.map((course, index) => (
                <li key={index} className="p-2 border-b border-gray-200 text-gray-700">
                  {applyHighlight(course, highlight)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isMailOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96 relative">
            <button
              onClick={() => setIsMailOpen(false)}
              className="absolute top-2 right-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-purple-700 mb-4">Latest Mail</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-semibold text-gray-800">
                {applyHighlight("Subject: Assignment Reminder", highlight)}
              </p>
              <p className="text-gray-600 mt-2">
                {applyHighlight(
                  "Your Human-Computer Interaction coursework is due next Friday. Please submit via Canvas before 5pm.",
                  highlight
                )}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {applyHighlight("From: lecturer@wlv.ac.uk", highlight)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
