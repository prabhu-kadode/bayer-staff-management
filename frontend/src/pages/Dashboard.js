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
    <>
      <div className="w-full px-6 py-2">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {dashboardData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Total Staff */}
              <div className="bg-white rounded shadow-sm p-2 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Total Staff
                </p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {dashboardData.totalStaff || 0}
                </p>
              </div>

              {/* Assigned Today */}
              <div className="bg-white rounded shadow-sm p-2 border-l-4 border-green-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Assigned Today
                </p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {dashboardData.assignedToday || 0}
                </p>
              </div>

              {/* Attendance Rate */}
              <div className="bg-white rounded shadow-sm p-2 border-l-4 border-purple-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Attendance Rate
                </p>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {typeof dashboardData.attendanceRate === "number"
                    ? dashboardData.attendanceRate.toFixed(1)
                    : 0}
                  %
                </p>
              </div>

              {/* Today's Shifts */}
              <div className="bg-white rounded shadow-sm p-2 border-l-4 border-yellow-600">
                <p className="text-gray-600 text-sm font-semibold">
                  Today's Shifts
                </p>
                <p className="text-xl font-bold text-yellow-600 mt-1">
                  {todayShifts.length || 0}
                </p>
              </div>
            </div>

            {/* Shift Calendar View */}
            <div className="mb-3">
              <ShiftCalendar />
            </div>

            {/* Today's Shifts Details */}
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Today's Shifts
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {["Morning", "Afternoon", "Night"].map((slotType) => {
                  const shift = (todayShifts || []).find(
                    (s) => s.type === slotType
                  );
                  const assignedCount = shift ? shift.assignedCount || 0 : 0;
                  const capacity = shift ? shift.capacity || 2 : 2;
                  const available = Math.max(0, capacity - assignedCount);
                  const fillPercentage = shift
                    ? ((assignedCount / capacity) * 100).toFixed(0)
                    : 0;
                  const displayTitle =
                    slotType === "Night"
                      ? "Evening Shift"
                      : `${slotType} Shift`;
                  const badgeLabel =
                    slotType === "Night" ? "Evening" : slotType;

                  return (
                    <div
                      key={slotType}
                      className="bg-white rounded p-2 border border-gray-200 hover:shadow transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-gray-600">
                            {formatDate(new Date().toISOString())}
                          </p>
                          <p className="text-lg font-bold text-gray-800 mt-1">
                            {displayTitle}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            slotType === "Morning"
                              ? "bg-yellow-100 text-yellow-800"
                              : slotType === "Afternoon"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            Staff Assigned
                          </span>
                          <span className="text-sm font-bold text-gray-700">
                            {assignedCount} / {capacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-white rounded p-1 text-center">
                          <p className="text-[11px] text-gray-600">Assigned</p>
                          <p className="text-sm font-bold text-blue-600">
                            {assignedCount}
                          </p>
                        </div>
                        <div className="bg-white rounded p-1 text-center">
                          <p className="text-[11px] text-gray-600">Available</p>
                          <p className="text-sm font-bold text-green-600">
                            {available}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-2 flex gap-2">
                        {shift ? (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/assign-staff/${shift.id}`)
                              }
                              className="flex-1 bg-blue-500 text-white text-xs font-semibold px-1 py-1 rounded hover:bg-blue-600 transition"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/attendance/${shift.id}`)
                              }
                              className="flex-1 bg-green-500 text-white text-xs font-semibold px-1 py-1 rounded hover:bg-green-600 transition"
                            >
                              Attendance
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => navigate("/create-shift")}
                            className="w-full bg-blue-600 text-white font-semibold px-3 py-1 rounded-md hover:shadow transition text-sm"
                          >
                            Create Shift
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
