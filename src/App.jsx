import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home.jsx";
import Timetable from "./pages/Timetable.jsx";
import Calendar from "./pages/Calendar.jsx";
import Grades from "./pages/Grades.jsx";
import Login from "./pages/Login.jsx";
import Mail from "./pages/Mail.jsx";
import { TIMETABLE_MODULES } from "./data/timetable.js";
import uowLogo from "./assets/uow-logo.jpg";
import About from "./pages/About.jsx";
import Privacy from "./pages/Privacy.jsx";

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchQuery(value);
    setSearchError("");
    if (!value) return;
    if (value.length < 4) {
      setSearchError("Type at least 4 characters to search 🔍");
      return;
    }
    if (
      value.startsWith("gra") || value.startsWith("gr") ||
      value.startsWith("mar") || value.includes("result") ||
      value.includes("exam") || value.includes("assign") ||
      value.includes("performance") || value.includes("mark")
    ) {
      navigate("/grades");
    }
    else if (
      value.startsWith("tim") || value.startsWith("ti") ||
      value.startsWith("mod") || value.includes("schedule") ||
      value.includes("class") || value.includes("lecture") ||
      value.includes("study plan")
    ) {
      navigate("/timetable");
    }
    else if (
      value.startsWith("cal") || value.startsWith("ca") ||
      value.startsWith("sch") || value.includes("event") ||
      value.includes("deadline") || value.includes("planner") ||
      value.includes("upcoming")
    ) {
      navigate("/calendar");
    }
    else if (
      value.startsWith("abo") || value.includes("about") || value.includes("university") || value.includes("info") || value.includes("wlv")
    ) {
      navigate("/about");
    }
    else if (
      value.includes("privacy") || value.includes("policy") || value.includes("data") || value.includes("gdpr")
    ) {
      navigate("/privacy");
    }
    else if (
      value.startsWith("ho") || value.startsWith("hom") ||
      value.startsWith("dash") || value.includes("main") ||
      value.includes("welcome") || value.includes("start")
    ) {
      navigate("/");
    }
    else if (
      value.includes("mail") || value.includes("inbox") ||
      value.includes("message") || value.includes("email")
    ) {
      navigate("/mail");
    }
    else if (
      value.includes("news") || value.includes("newsletter") ||
      value.includes("semester") || value.includes("wlv news")
    ) {
      navigate("/");
    }
    else if (TIMETABLE_MODULES.some((m) => m.toLowerCase().includes(value))) {
      navigate("/timetable");
    }
    else {
      setSearchError("No results match your search ❌");
    }
  };

  return (
    <motion.div key={darkMode ? "dark" : "light"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <header className="bg-purple-800 text-white relative dark:bg-gray-900">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img src={uowLogo} alt="University of Wolverhampton Logo" className="h-16 w-auto object-contain" />
            <h1 className="text-xl font-semibold hidden sm:block">
              myWLV (Redesign) – University of Wolverhampton
            </h1>
          </div>
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="px-3 py-2 rounded-lg text-black w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchError && (
                  <p className="text-red-500 text-sm mt-1">{searchError}</p>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center font-bold text-purple-700"
                >
                  QS
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg p-4 z-50 dark:bg-gray-800 dark:text-white">
                    <p className="font-bold text-purple-800 dark:text-purple-300">Qasim Shah</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Student ID: 2364710</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">dummy@wlv.ac.uk</p>
                    <hr className="my-2" />
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded mb-2"
                    >
                      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {isAuthenticated && (
        <nav className="bg-gray-100 border-b dark:bg-gray-800">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row gap-2 md:gap-4 p-4">
            <div className="hidden md:flex gap-2">
              <NavLink to="/" end className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Home</NavLink>
              <NavLink to="/timetable" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Timetable</NavLink>
              <NavLink to="/calendar" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Calendar</NavLink>
              <NavLink to="/grades" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Grades</NavLink>
              <NavLink to="/mail" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Mail</NavLink>
              <NavLink to="/about" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>About WLV</NavLink>
              <NavLink to="/privacy" className={({ isActive }) =>
                `px-3 py-2 rounded text-center ${isActive ? "bg-purple-900 text-white" : "bg-purple-700 text-white hover:bg-purple-800"}`}>Privacy</NavLink>
              {isAuthenticated && (
                <button onClick={handleSignOut}
                  className="px-3 py-2 rounded text-center bg-red-600 text-white hover:bg-red-700">Sign Out</button>
              )}
            </div>

            {menuOpen && (
              <div className="flex flex-col gap-2 md:hidden">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="px-3 py-2 rounded-lg text-black mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchError && (
                  <p className="text-red-500 text-sm">{searchError}</p>
                )}
                <div className="relative mb-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center font-bold text-purple-700"
                  >
                    QS
                  </button>
                  {profileOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white text-black shadow-lg rounded-lg p-4 z-50 dark:bg-gray-800 dark:text-white">
                      <p className="font-bold text-purple-800 dark:text-purple-300">Qasim Shah</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Student ID: 2364710</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">dummy@wlv.ac.uk</p>
                      <hr className="my-2" />
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded mb-2"
                      >
                        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-500 mt-2">DASHBOARDS</p>
                <NavLink to="/" end onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-purple-700 text-white hover:bg-purple-800">Home</NavLink>
                <NavLink to="/timetable" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-purple-700 text-white hover:bg-purple-800">Timetable</NavLink>
                <NavLink to="/calendar" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-purple-700 text-white hover:bg-purple-800">Calendar</NavLink>
                <NavLink to="/grades" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-purple-700 text-white hover:bg-purple-800">Grades</NavLink>
                <p className="text-xs font-bold text-gray-500 mt-2">APPS</p>
                <NavLink to="/mail" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Mail</NavLink>
                <NavLink to="/" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Newsroom</NavLink>
                <NavLink to="/about" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">About WLV</NavLink>
                <NavLink to="/privacy" onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Privacy Policy</NavLink>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded text-left text-red-600 hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl p-6 mb-16 bg-white dark:bg-gray-900 dark:text-white min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              {!isAuthenticated ? (
                <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              ) : (
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/mail" element={<Mail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                </>
              )}
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t flex justify-around items-center py-2 shadow-md z-50">
          <NavLink to="/" end className={({ isActive }) =>
            `flex flex-col items-center ${isActive ? "text-purple-700" : "text-gray-500 dark:text-gray-300"}`}>
            <span className="material-icons">home</span>
            <span className="text-xs">Home</span>
          </NavLink>
          <NavLink to="/mail" className={({ isActive }) =>
            `flex flex-col items-center ${isActive ? "text-purple-700" : "text-gray-500 dark:text-gray-300"}`}>
            <span className="material-icons">mail</span>
            <span className="text-xs">Mail</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) =>
            `flex flex-col items-center ${isActive ? "text-purple-700" : "text-gray-500 dark:text-gray-300"}`}>
            <span className="material-icons">event</span>
            <span className="text-xs">Calendar</span>
          </NavLink>
        </nav>
      )}
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
