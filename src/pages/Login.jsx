import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import uowLogo from "../assets/uow-logo.jpg";

const Login = ({ setIsAuthenticated }) => {
  // This function stores the email input value for login.
  const [email, setEmail] = useState("");

  // This function stores the password input value for login.
  const [password, setPassword] = useState("");

  // This function stores any login error message shown to the user.
  const [error, setError] = useState("");

  // This function controls whether the password is visible or hidden.
  const [showPassword, setShowPassword] = useState(false);

  // This function controls whether the forgot password modal is open.
  const [forgotOpen, setForgotOpen] = useState(false);

  // This function stores the reset email entered in the forgot password modal.
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();

  // This function sends the login request and stores the returned JWT token on success.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated(true);
        navigate("/");
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Server error. Please try again later");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between bg-purple-800 text-white p-10">
          <div>
            <img
              src={uowLogo}
              alt="University of Wolverhampton Logo"
              className="h-16 w-auto object-contain mb-8 bg-white rounded-lg p-2"
            />
            <h1 className="text-3xl font-bold mb-4">
              myWLV Student Portal
            </h1>
            <p className="text-purple-100 leading-relaxed">
              This redesigned student portal demonstrates timetable access, lecture
              check-in, attendance tracking, absence requests, grades, and calendar
              integration through a full-stack React, Express, and MySQL system.
            </p>
          </div>

          <div className="mt-10 rounded-xl bg-white/10 border border-white/20 p-5">
            <h2 className="text-lg font-semibold mb-3">Demo Login Details</h2>
            <p className="text-sm text-purple-100">Use these credentials to access the system.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold">Email:</span> dummy@wlv.ac.uk
              </p>
              <p>
                <span className="font-semibold">Password:</span> password123
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center mb-6">
              <img
                src={uowLogo}
                alt="University of Wolverhampton Logo"
                className="h-14 w-auto object-contain mb-4"
              />
              <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 text-center">
                myWLV Student Portal
              </h1>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                Student Login
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sign in to access your dashboard, attendance, timetable, and absence records.
              </p>
            </div>

            <div className="lg:hidden mb-6 rounded-xl bg-purple-50 dark:bg-gray-800 border border-purple-100 dark:border-gray-700 p-4">
              <h3 className="text-base font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Demo Login Details
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Email: dummy@wlv.ac.uk
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Password: password123
              </p>
            </div>

            {error && (
              <p className="mb-4 text-red-600 dark:text-red-400 font-medium text-center rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="University Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-sm text-gray-600 dark:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p
                className="text-right text-purple-600 dark:text-purple-300 text-sm cursor-pointer hover:underline"
                onClick={() => setForgotOpen(true)}
              >
                Forgot Password?
              </p>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 relative">
            <button
              className="absolute top-2 right-2 px-2 py-1 bg-gray-300 dark:bg-gray-700 dark:text-white rounded"
              onClick={() => setForgotOpen(false)}
            >
              X
            </button>

            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">
              Reset Password
            </h3>

            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
              Send Reset Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;