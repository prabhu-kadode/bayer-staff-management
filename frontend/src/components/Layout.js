import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b-2 border-blue-600">
        <div className="w-full px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">
              Healthcare Staff Management
            </h1>
            <p className="text-gray-600 text-xs">Welcome, {user?.firstName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold px-2 py-1 rounded-md hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-10 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-1">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition whitespace-nowrap text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/staff")}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition whitespace-nowrap text-sm"
            >
              Staff
            </button>
            <button
              onClick={() => navigate("/shifts")}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition whitespace-nowrap text-sm"
            >
              Shifts
            </button>
            <button
              onClick={() => navigate("/create-shift")}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition whitespace-nowrap text-sm"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="w-full px-6 py-2">{children}</div>
    </div>
  );
};

export default Layout;
