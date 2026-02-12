import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

const Login = ({ setIsAuthenticated }) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();

  // Login request + store JWT
  const handleLogin = async (e) => {
    e.preventDefault();
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">
          Student Login
        </h2>

        {error && (
          <p className="mb-4 text-red-600 dark:text-red-400 font-medium text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="University Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-sm text-gray-600 dark:text-gray-300"
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
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>
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
