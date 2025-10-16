import React from "react";
import { motion } from "framer-motion";

const links = [
  { label: "🏨 Accommodation Life", url: "https://www.wlv.ac.uk/university-life/accommodation/" },
  { label: "📚 Library Opening Hours", url: "https://www.wlv.ac.uk/lib/info/opening-hours/" },
  { label: "🎓 Graduation Ceremonies", url: "https://www.wlv.ac.uk/current-students/graduation-ceremonies/" },
  { label: "💰 Financial Support", url: "https://www.wlv.ac.uk/apply/funding-costs-fees-and-support/financial-support/" },
  { label: "🎉 Students’ Union", url: "https://www.wolvesunion.org" },
  { label: "📘 Course Guides", url: "https://www.wlv.ac.uk/current-students/course-guides/" },
  { label: "🏙 City Campus Map", url: "https://www.wlv.ac.uk/about-us/contacts-and-maps/all-maps-and-directions/map-and-directions-for-city-campus-wolverhampton/" },
  { label: "🏫 Walsall Campus Map", url: "https://www.wlv.ac.uk/about-us/contacts-and-maps/all-maps-and-directions/map-and-directions-for-walsall-campus/" },
  { label: "🚆 Telford Campus Map", url: "https://www.wlv.ac.uk/about-us/contacts-and-maps/all-maps-and-directions/map-and-directions-for-telford-campus/" },
];

const SupportLinksModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="bg-white dark:bg-gray-900 dark:text-white w-96 max-w-[92%] rounded-lg shadow-lg p-5 relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 bg-gray-300 dark:bg-gray-700 px-2 py-1 rounded">
          ✕
        </button>
        <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-4 text-center">Support & Quick Links</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto px-1">
          {links.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-700 transition text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupportLinksModal;
