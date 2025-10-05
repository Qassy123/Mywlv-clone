import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// ✅ banner images
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const About = () => {
  const navigate = useNavigate();

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

      {/* --- About WLV --- */}
      <h2 className="text-2xl font-bold text-purple-700 mt-6">About University of Wolverhampton</h2>
      <p className="text-gray-700 leading-relaxed">
        The University of Wolverhampton is committed to empowering students with the skills,
        knowledge, and opportunities needed to thrive in a global community. With a proud history
        of innovation, inclusivity, and academic excellence, we provide a supportive environment
        for every student to succeed.
      </p>

      {/* --- Mission Section --- */}
      <div className="bg-purple-50 dark:bg-gray-800 p-4 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-purple-700 mb-2">🎯 Our Mission</h3>
        <p className="text-gray-700 dark:text-gray-300">
          To transform lives through education by delivering high-quality teaching, pioneering
          research, and strong partnerships with industry and the wider community.
        </p>
      </div>

      {/* --- Student Services Section --- */}
      <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">📚 Student Services</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li>Academic support and study skills workshops</li>
          <li>Careers and employability services</li>
          <li>Wellbeing and counselling support</li>
          <li>Disability and inclusion support</li>
        </ul>
      </div>

      {/* --- Campus Life Section --- */}
      <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-green-700 mb-2">🏫 Campus Life</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Our campuses offer modern facilities, inspiring learning spaces, and a vibrant student
          community. Whether it’s engaging in societies, using cutting-edge labs, or studying in
          our libraries, there’s something for everyone.
        </p>
      </div>

      {/* --- Contact Section --- */}
      <div className="bg-yellow-50 dark:bg-gray-800 p-4 rounded-2xl shadow-md">
        <h3 className="text-xl font-semibold text-yellow-700 mb-2">📞 Contact Us</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Have questions or need support? Reach out:
        </p>
        <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
          <li>Email: <a href="mailto:studentservices@wlv.ac.uk" className="text-purple-600 dark:text-purple-400 underline">studentservices@wlv.ac.uk</a></li>
          <li>Phone: +44 (0)1902 321000</li>
          <li>Website: <a href="https://www.wlv.ac.uk" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">www.wlv.ac.uk</a></li>
        </ul>
      </div>
    </div>
  );
};

export default About;
