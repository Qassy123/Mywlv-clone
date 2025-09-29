import { useState } from "react";   // ✅ Already added
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom"; // ✅ useNavigate added
import Home from "./pages/Home.jsx";
import Timetable from "./pages/Timetable.jsx";
import Calendar from "./pages/Calendar.jsx";
import Grades from "./pages/Grades.jsx";
import Login from "./pages/Login.jsx"; // ✅ New Login page
import { TIMETABLE_MODULES } from "./data/timetable.js"; // ✅ Import modules for course-based search

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Burger menu state
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Global search state
  const [searchError, setSearchError] = useState(""); // ✅ Error message state
  const navigate = useNavigate(); // ✅ Needed for search navigation

  // ✅ Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
    setMenuOpen(false);
  };

  // ✅ Search handler with prefixes + error message + 4-char minimum
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase().trim();
    setSearchQuery(value);
    setSearchError(""); // reset error each time

    if (!value) return; // do nothing if empty
    if (value.length < 4) {
      setSearchError("Type at least 4 characters to search 🔍");
      return;
    }

    // --- Grades page shortcuts ---
    if (
      value.startsWith("gra") || value.startsWith("gr") ||
      value.startsWith("mar") || value.includes("result") ||
      value.includes("exam") || value.includes("assign") ||
      value.includes("performance") || value.includes("mark")
    ) {
      navigate("/grades");
    }
    // --- Timetable page shortcuts ---
    else if (
      value.startsWith("tim") || value.startsWith("ti") ||
      value.startsWith("mod") || value.includes("schedule") ||
      value.includes("class") || value.includes("lecture") ||
      value.includes("study plan")
    ) {
      navigate("/timetable");
    }
    // --- Calendar page shortcuts ---
    else if (
      value.startsWith("cal") || value.startsWith("ca") ||
      value.startsWith("sch") || value.includes("event") ||
      value.includes("deadline") || value.includes("planner") ||
      value.includes("upcoming")
    ) {
      navigate("/calendar");
    }
    // --- Home page shortcuts ---
    else if (
      value.startsWith("ho") || value.startsWith("hom") ||
      value.startsWith("dash") || value.includes("main") ||
      value.includes("welcome") || value.includes("start")
    ) {
      navigate("/");
    }
    // --- Mail (goes to Home) ---
    else if (
      value.includes("mail") || value.includes("inbox") ||
      value.includes("message") || value.includes("email")
    ) {
      navigate("/");
    }
    // --- Newsroom keywords (go Home) ---
    else if (
      value.includes("news") || value.includes("newsletter") ||
      value.includes("semester") || value.includes("wlv news")
    ) {
      navigate("/");
    }
    // --- Module name match (Timetable) ---
    else if (TIMETABLE_MODULES.some((m) => m.toLowerCase().includes(value))) {
      navigate("/timetable");
    }
    // --- No match found ---
    else {
      setSearchError("No results match your search ❌");
    }
  };

  return (
    <>
      {/* University Header */}
      <header className="bg-purple-800 text-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <img
              src="/uow-logo.PNG" // ✅ keep uppercase to match actual filename
              alt="University of Wolverhampton Logo"
              className="h-16 w-auto object-contain"
            />
            <h1 className="text-xl font-semibold hidden sm:block">
              myWLV (Redesign) – University of Wolverhampton
            </h1>
          </div>

          {/* Search Bar (Desktop only) */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}   // ✅ navigation search
                className="px-3 py-2 rounded-lg text-black w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchError && (
                <p className="text-red-500 text-sm mt-1">{searchError}</p>
              )}
            </div>
          )}

          {/* Burger Menu Button (Mobile) */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {/* Simple hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-gray-100 border-b">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row gap-2 md:gap-4 p-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-center ${
                    isActive
                      ? "bg-purple-900 text-white"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/timetable"
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-center ${
                    isActive
                      ? "bg-purple-900 text-white"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`
                }
              >
                Timetable
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-center ${
                    isActive
                      ? "bg-purple-900 text-white"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`
                }
              >
                Calendar
              </NavLink>
              <NavLink
                to="/grades"
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-center ${
                    isActive
                      ? "bg-purple-900 text-white"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`
                }
              >
                Grades
              </NavLink>

              {/* ✅ Desktop Sign Out button */}
              {isAuthenticated && (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded text-center bg-red-600 text-white hover:bg-red-700"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* Mobile Burger Menu Dropdown */}
            {menuOpen && (
              <div className="flex flex-col gap-2 md:hidden">
                {/* ✅ Added search inside mobile menu */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}   // ✅ navigation search
                  className="px-3 py-2 rounded-lg text-black mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchError && (
                  <p className="text-red-500 text-sm">{searchError}</p>
                )}

                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-center ${
                      isActive
                        ? "bg-purple-900 text-white"
                        : "bg-purple-700 text-white hover:bg-purple-800"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/timetable"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-center ${
                      isActive
                        ? "bg-purple-900 text-white"
                        : "bg-purple-700 text-white hover:bg-purple-800"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Timetable
                </NavLink>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-center ${
                      isActive
                        ? "bg-purple-900 text-white"
                        : "bg-purple-700 text-white hover:bg-purple-800"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Calendar
                </NavLink>
                <NavLink
                  to="/grades"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-center ${
                      isActive
                        ? "bg-purple-900 text-white"
                        : "bg-purple-700 text-white hover:bg-purple-800"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Grades
                </NavLink>

                {/* ✅ Sign Out button in burger menu */}
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

      {/* Page Content */}
      <main className="mx-auto max-w-6xl p-6">
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/grades" element={<Grades />} />
            </>
          )}
        </Routes>

        {/* Tailwind Test Card */}
        {isAuthenticated && (
          <div className="mt-8 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-purple-700">
              Tailwind Test Card
            </h2>
            <p className="font-normal text-gray-700">
              If you see a white card with a purple title and hover shadow,
              Tailwind is working perfectly ✅
            </p>
          </div>
        )}
      </main>
    </>
  );
}

// ✅ Wrap AppContent with Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
