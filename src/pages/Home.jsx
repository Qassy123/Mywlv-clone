import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Home = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const navigate = useNavigate();

  // Example: pretend "1234" is today’s lecture code
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
    <div className="p-6 space-y-6">

      {/* 🔹 Image Carousel */}
      <Swiper spaceBetween={20} slidesPerView={1} className="rounded-2xl shadow-md">
        <SwiperSlide>
          <img src="https://via.placeholder.com/800x200?text=Welcome+Back+Students" alt="Banner 1" className="w-full rounded-2xl"/>
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://via.placeholder.com/800x200?text=Upcoming+Events" alt="Banner 2" className="w-full rounded-2xl"/>
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://via.placeholder.com/800x200?text=Check+Your+Grades" alt="Banner 3" className="w-full rounded-2xl"/>
        </SwiperSlide>
      </Swiper>

      {/* 🔹 Student Check-In */}
      <div className="bg-purple-100 rounded-2xl p-4 shadow-md">
        <h2 className="text-xl font-bold text-purple-700">Student Check-In</h2>
        <p className="text-gray-600 mt-1">
          Please complete your daily check-in to confirm your attendance.
        </p>
        <button
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          onClick={() => setIsCheckInOpen(true)}
        >
          Check In Now
        </button>

        {checkInSuccess && (
          <p className="mt-2 text-green-600 font-semibold">✅ Checked in successfully</p>
        )}
      </div>

      {/* Check-In Modal */}
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

      {/* 🔹 Timetable Preview */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-bold text-purple-700 mb-2">Upcoming Classes</h2>
        <ul className="space-y-2 text-gray-700">
          <li>Tue 30 – Cyber Threat Intelligence (12:00)</li>
          <li>Wed 01 – No events</li>
        </ul>
        <button
          onClick={() => navigate("/timetable")}
          className="mt-3 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          View Full Timetable
        </button>
      </div>

      {/* 🔹 Courses */}
      <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <h2 className="text-lg font-bold text-purple-700">Courses</h2>
        <span className="text-2xl font-semibold">25</span>
      </div>

      {/* 🔹 Newsroom */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <h2 className="text-lg font-bold text-purple-700">Newsroom</h2>
        <p className="text-gray-700 mt-1">
          WLV Student Newsletter: Welcome to semester 1 2025/26. Stay updated with the latest news and events from the University.
        </p>
      </div>
    </div>
  );
};

export default Home;
