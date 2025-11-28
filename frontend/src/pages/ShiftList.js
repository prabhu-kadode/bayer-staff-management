import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { shiftAPI } from "../services/api";

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const navigate = useNavigate();

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await shiftAPI.listShifts(filterDate);
      setShifts(response.data.shifts || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleAssignClick = (shiftId) => {
    navigate(`/assign-staff/${shiftId}`);
  };

  const handleAttendanceClick = (shiftId) => {
    navigate(`/attendance/${shiftId}`);
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

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shifts</h1>
          <button
            onClick={() => navigate("/create-shift")}
            className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            + Create Shift
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading shifts...</p>
          </div>
        )}

        {/* Shifts Table */}
        {!loading && shifts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">
                    Available
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const available = shift.capacity - (shift.assignedCount || 0);
                  return (
                    <tr
                      key={shift.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-800">
                        {formatDate(shift.date)}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {shift.capacity}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {shift.assignedCount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            available > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {Math.max(0, available)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAssignClick(shift.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 transition text-sm"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handleAttendanceClick(shift.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                        >
                          Attendance
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && shifts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No shifts found</p>
            <button
              onClick={() => navigate("/create-shift")}
              className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Create First Shift
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftList;
