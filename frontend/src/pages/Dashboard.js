import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI, shiftAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ShiftCalendar from "../components/ShiftCalendar";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [todayShifts, setTodayShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, shiftsRes] = await Promise.all([
        dashboardAPI.getDashboard(),
        shiftAPI.listShifts(new Date().toISOString().split("T")[0]),
      ]);

      setDashboardData(dashRes.data);
      // Normalize shift types to Morning/Afternoon/Night
      const normalizeShiftType = (shift) => {
        if (!shift) return shift;
        const t = (shift.type || "").toString().toLowerCase();
        if (t.includes("mor")) return "Morning";
        if (t.includes("aft")) return "Afternoon";
        if (t.includes("night") || t.includes("nt")) return "Night";
        // try parsing time range like "08:00-12:00"
        const timeSlot = shift.timeSlot || shift.time || "";
        const match = timeSlot.match(/(\d{1,2}):\d{2}/);
        if (match) {
          const hour = parseInt(match[1], 10);
          if (hour >= 6 && hour < 12) return "Morning";
          if (hour >= 12 && hour < 18) return "Afternoon";
          return "Night";
        }
        return shift.type || "Morning";
      };

      const todays = (shiftsRes.data.shifts || []).map((s) => ({
        ...s,
        type: normalizeShiftType(s),
      }));
      setTodayShifts(todays);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-base">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Healthcare Staff Management
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Welcome, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {dashboardData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Staff */}
              <div className="bg-white rounded shadow-sm p-4 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Total Staff
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {dashboardData.totalStaff || 0}
                </p>
              </div>

              {/* Assigned Today */}
              <div className="bg-white rounded shadow-sm p-4 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Assigned Today
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {dashboardData.assignedToday || 0}
                </p>
              </div>

              {/* Attendance Rate */}
              <div className="bg-white rounded shadow-sm p-4 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {typeof dashboardData.attendanceRate === "number"
                    ? dashboardData.attendanceRate.toFixed(1)
                    : 0}
                  %
                </p>
              </div>

              {/* Today's Shifts */}
              <div className="bg-white rounded shadow-sm p-4 border-l-4 border-yellow-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Today's Shifts
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {todayShifts.length || 0}
                </p>
              </div>
            </div>

            {/* Shift Calendar View */}
            <div className="mb-6">
              <ShiftCalendar />
            </div>

            {/* Today's Shifts Details */}
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Today's Shifts
              </h2>

              {todayShifts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayShifts.map((shift) => {
                    const available = Math.max(
                      0,
                      shift.capacity - (shift.assignedCount || 0)
                    );
                    const fillPercentage = (
                      ((shift.assignedCount || 0) / shift.capacity) *
                      100
                    ).toFixed(0);

                    return (
                      <div
                        key={shift.id}
                        className="bg-white rounded p-4 border border-gray-200 hover:shadow transition"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              {formatDate(shift.date)}
                            </p>
                            <p className="text-xl font-bold text-gray-800 mt-1">
                              {shift.type} Shift
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              shift.type === "Morning"
                                ? "bg-yellow-100 text-yellow-800"
                                : shift.type === "Afternoon"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {shift.type}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                              Staff Assigned
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                              {shift.assignedCount || 0} / {shift.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${fillPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Assigned</p>
                            <p className="text-base font-bold text-blue-600">
                              {shift.assignedCount || 0}
                            </p>
                          </div>
                          <div className="bg-white rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Available</p>
                            <p className="text-base font-bold text-green-600">
                              {available}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/assign-staff/${shift.id}`)
                            }
                            className="flex-1 bg-blue-500 text-white text-sm font-semibold px-2 py-1.5 rounded hover:bg-blue-600 transition"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => navigate(`/attendance/${shift.id}`)}
                            className="flex-1 bg-green-500 text-white text-sm font-semibold px-2 py-1.5 rounded hover:bg-green-600 transition"
                          >
                            Attendance
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 text-base mb-3">
                    No shifts scheduled for today
                  </p>
                  <button
                    onClick={() => navigate("/create-shift")}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:shadow transition text-sm"
                  >
                    Create a Shift
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
