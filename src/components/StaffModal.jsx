import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../config";

const StaffModal = ({ isOpen, onClose }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/staff`)
        .then((res) => res.json())
        .then((data) => {
          setStaff(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching staff:", err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Group staff by module
  const groupedByModule = staff.reduce((acc, person) => {
    if (!acc[person.module]) acc[person.module] = [];
    acc[person.module].push(person);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto w-[90%] md:w-[600px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Staff Directory
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 dark:text-gray-300">
                Loading...
              </p>
            ) : (
              Object.keys(groupedByModule).map((module) => (
                <div key={module} className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    {module}
                  </h3>
                  <div className="space-y-3">
                    {groupedByModule[module].map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-full font-bold text-white"
                          style={{ backgroundColor: person.avatar_color }}
                        >
                          {person.initials}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-200">
                            {person.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {person.role}
                          </p>
                        </div>
                        <a
                          href={`mailto:${person.email}`}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          Email
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaffModal;
