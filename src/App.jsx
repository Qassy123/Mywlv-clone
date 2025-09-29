import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Timetable from './pages/Timetable.jsx'
import Calendar from './pages/Calendar.jsx'
import Grades from './pages/Grades.jsx'

export default function App() {
  return (
    <Router>
      {/* University Header */}
      <header className="bg-purple-800 text-white">
        <div className="mx-auto max-w-6xl flex items-center gap-4 p-4">
          <img
            src="/uow-logo.PNG"   // keep uppercase .PNG to match your file
            alt="University of Wolverhampton Logo"
            className="h-16 w-auto object-contain"
          />
          <h1 className="text-xl font-semibold">
            myWLV (Redesign) – University of Wolverhampton
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-100 border-b">
        {/* ✅ Changed flex to flex-col on mobile, flex-row on desktop */}
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row gap-2 md:gap-4 p-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded text-center ${isActive ? 'bg-purple-900 text-white' : 'bg-purple-700 text-white hover:bg-purple-800'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/timetable"
            className={({ isActive }) =>
              `px-3 py-2 rounded text-center ${isActive ? 'bg-purple-900 text-white' : 'bg-purple-700 text-white hover:bg-purple-800'}`
            }
          >
            Timetable
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `px-3 py-2 rounded text-center ${isActive ? 'bg-purple-900 text-white' : 'bg-purple-700 text-white hover:bg-purple-800'}`
            }
          >
            Calendar
          </NavLink>
          <NavLink
            to="/grades"
            className={({ isActive }) =>
              `px-3 py-2 rounded text-center ${isActive ? 'bg-purple-900 text-white' : 'bg-purple-700 text-white hover:bg-purple-800'}`
            }
          >
            Grades
          </NavLink>
        </div>
      </nav>

      {/* Page Content */}
      <main className="mx-auto max-w-6xl p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/grades" element={<Grades />} />
        </Routes>

        {/* Tailwind Test Card */}
        <div className="mt-8 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-purple-700">
            Tailwind Test Card
          </h2>
          <p className="font-normal text-gray-700">
            If you see a white card with a purple title and hover shadow, Tailwind is working perfectly ✅
          </p>
        </div>
      </main>
    </Router>
  )
}
