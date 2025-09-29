import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { TIMETABLE_MODULES } from "./Timetable";

const Home = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
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

  return (
    <div className="p-4 space-y-6">
      <Swiper spaceBetween={20} slidesPerView={1} className="rounded-2xl shadow-md">
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/800x200?text=Welcome+Back+Students"
            alt="Banner 1"
            className="w-full rounded-2xl"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/800x200?text=Upcoming+Events"
            alt="Banner 2"
            className="w-full rounded-2xl"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="https://via.placeholder.com/800x200?text=Check+Your+Grades"
            alt="Banner 3"
            className="w-full rounded-2xl"
          />
        </SwiperSlide>
      </Swiper>

      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/timetable")}
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Timetable</h2>
          <p className="text-gray-600 mt-2">Next: Cyber Threat Intelligence (12:00)</p>
        </div>

        <div
          onClick={() => setIsMailOpen(true)}
          className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold text-purple-700">Mail</h2>
          <p className="text-gray-600 mt-2">No new messages</p>
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
          WLV Student Newsletter: Welcome to semester 1 2025/26. Stay updated with
          the latest news and events from the University.
        </p>
      </div>

      {isCheckInOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80">
            <h3 className="text-lg font-bold text-purple-700 mb-3">
              Enter Lecture Code
            </h3>
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
                  {course}
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
              <p className="font-semibold text-gray-800">Subject: Assignment Reminder</p>
              <p className="text-gray-600 mt-2">
                Your Human-Computer Interaction coursework is due next Friday. Please submit
                via Canvas before 5pm.
              </p>
              <p className="text-sm text-gray-500 mt-2">From: lecturer@wlv.ac.uk</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
