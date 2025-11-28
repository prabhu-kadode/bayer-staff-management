import React, { useState, useEffect } from "react";
import { shiftAPI, staffAPI, assignmentAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const ShiftCalendar = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Time slots for 24-hour coverage with colors
  // Use three main shifts: Morning, Afternoon, Night
  // `id` is used for matching with shift.timeSlot/type; `timeLabel` is shown in the left column
  const timeSlots = [
    {
      id: "Morning",
      timeLabel: "08:00 - 12:00",
      label: "Morning",
      color: "bg-amber-500",
    },
    {
      id: "Afternoon",
      timeLabel: "12:00 - 20:00",
      label: "Afternoon",
      color: "bg-blue-600",
    },
    {
      id: "Night",
      timeLabel: "20:00 - 08:00",
      label: "Night",
      color: "bg-slate-700",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const staffRes = await staffAPI.listStaff();
        setStaff(staffRes.data.staff || []);

        // Fetch shifts and assignments for 7 days
        const allShifts = [];
        const allAssignments = {};

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(new Date(startDate).getDate() + i);
          const dateStr = currentDate.toISOString().split("T")[0];

          const shiftsRes = await shiftAPI.listShifts(dateStr);
          const normalized = (shiftsRes.data.shifts || []).map((s) => ({
            ...s,
            timeSlot: normalizeShiftSlot(s),
            type: normalizeShiftSlot(s),
          }));
          allShifts.push(...normalized);

          // Fetch assignments for all shifts on this date
          for (const shift of shiftsRes.data.shifts || []) {
            const assignRes = await assignmentAPI.listAssignments(shift.id);
            allAssignments[shift.id] = assignRes.data.assignments || [];
          }
        }

        setShifts(allShifts);
        setAssignments(allAssignments);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate]);

  // Normalize shift slot/type so it matches the three main slots used by the calendar
  const normalizeShiftSlot = (shift) => {
    if (!shift) return shift;
    const t = (shift.type || "").toString().toLowerCase();
    if (t.includes("mor")) return "Morning";
    if (t.includes("aft")) return "Afternoon";
    if (t.includes("night") || t.includes("nt")) return "Night";
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

  // (removed unused getStaffHours to reduce lint warnings)

  // Get 7-day date range
  const getDateRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(new Date(startDate).getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Format date header
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  // Get shift for specific date and time slot
  const getShiftForDateAndTime = (dateStr, timeSlot) => {
    return shifts.find((s) => s.date === dateStr && s.timeSlot === timeSlot);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 text-sm">Loading calendar...</p>
      </div>
    );
  }

  const dateRange = getDateRange();

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Team Schedule</h2>
          <p className="text-xs text-gray-600 mt-0.5">7-day shift calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(startDate);
              newDate.setDate(newDate.getDate() - 7);
              setStartDate(newDate.toISOString().split("T")[0]);
            }}
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-semibold text-xs"
          >
            ← Prev
          </button>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          />
          <button
            onClick={() => {
              const newDate = new Date(startDate);
              newDate.setDate(newDate.getDate() + 7);
              setStartDate(newDate.toISOString().split("T")[0]);
            }}
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-semibold text-xs"
          >
            Next →
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded p-3 border-l-4 border-blue-600">
          <p className="text-xs text-blue-700 font-semibold">Total Shifts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {shifts.length}
          </p>
          <p className="text-xxs text-blue-600 mt-1">7 days × 3 shifts</p>
        </div>

        <div className="bg-green-50 rounded p-3 border-l-4 border-green-600">
          <p className="text-xs text-green-700 font-semibold">
            Available Staff
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {staff.length}
          </p>
          <p className="text-xxs text-green-600 mt-1">Active staff members</p>
        </div>

        <div className="bg-purple-50 rounded p-3 border-l-4 border-purple-600">
          <p className="text-xs text-purple-700 font-semibold">Assigned</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {Object.values(assignments).reduce(
              (sum, arr) => sum + arr.length,
              0
            )}
          </p>
          <p className="text-xxs text-purple-600 mt-1">Total assignments</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto border border-gray-200 rounded bg-white">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Time labels column */}
            <div className="w-36 flex-shrink-0 bg-gray-50 border-r border-gray-200">
              {/* Header cell */}
              <div className="h-12 flex items-center px-3 font-semibold text-gray-700 border-b border-gray-200 bg-gray-100">
                <span className="text-sm">Shift</span>
              </div>
              {/* Time slot rows */}
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="h-20 px-3 border-b border-gray-200 bg-gray-50 border-r flex flex-col justify-center"
                >
                  <p className="font-semibold text-gray-800 text-sm">
                    {slot.timeLabel}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{slot.label}</p>
                </div>
              ))}
            </div>

            {/* Days (Columns) */}
            {dateRange.map((dateStr) => (
              <div
                key={dateStr}
                className="flex-1 min-w-max border-r border-gray-200"
              >
                {/* Date header */}
                <div className="h-12 px-3 flex flex-col justify-center border-b border-gray-200 bg-blue-600">
                  <p className="font-bold text-white text-center text-sm">
                    {formatDateHeader(dateStr)}
                  </p>
                  <p className="text-xs text-white opacity-90 text-center">
                    {new Date(dateStr).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Time slot cells */}
                {timeSlots.map((slot) => {
                  const shift = getShiftForDateAndTime(dateStr, slot.id);
                  const shiftAssignments = shift
                    ? assignments[shift.id] || []
                    : [];
                  const isFilled = shiftAssignments.length > 0;

                  return (
                    <div
                      key={`${dateStr}-${slot.id}`}
                      onClick={() =>
                        shift && navigate(`/assign-staff/${shift.id}`)
                      }
                      className={`h-20 p-2 border-b border-gray-200 cursor-pointer transition overflow-hidden ${
                        isFilled
                          ? `${slot.color} shadow-sm`
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="h-full flex flex-col justify-between">
                        {isFilled ? (
                          <div className="space-y-1 flex-1 overflow-y-auto">
                            {shiftAssignments.slice(0, 2).map((assignment) => {
                              const staffMember = staff.find(
                                (s) => s.id === assignment.staffId
                              );
                              return (
                                <div
                                  key={assignment.id}
                                  className="bg-white bg-opacity-95 rounded px-2 py-0.5 text-xs font-semibold text-gray-800 truncate shadow-sm hover:bg-opacity-100"
                                  title={
                                    staffMember
                                      ? `${staffMember.firstName} ${staffMember.lastName}`
                                      : `Staff ${assignment.staffId}`
                                  }
                                >
                                  {staffMember
                                    ? `${staffMember.firstName}`
                                    : `Staff ${assignment.staffId}`}
                                </div>
                              );
                            })}
                            {shiftAssignments.length > 2 && (
                              <div className="text-xs text-white font-semibold bg-black bg-opacity-40 rounded px-2 py-0.5 text-center">
                                +{shiftAssignments.length - 2}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <button
                              onClick={() =>
                                shift && navigate(`/assign-staff/${shift.id}`)
                              }
                              className="text-gray-400 text-xs font-semibold hover:text-gray-600 transition"
                            >
                              + Assign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendar;
