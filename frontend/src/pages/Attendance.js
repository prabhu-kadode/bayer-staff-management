import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shiftAPI, assignmentAPI, attendanceAPI } from "../services/api";

const Attendance = () => {
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const [shift, setShift] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftRes, assignRes, attRes] = await Promise.all([
        shiftAPI.getShiftById(shiftId),
        assignmentAPI.listAssignments(shiftId),
        attendanceAPI
          .getAttendanceByShift(shiftId)
          .catch(() => ({ data: { attendance: [] } })),
      ]);

      setShift(shiftRes.data);
      setAssignments(assignRes.data.assignments || []);

      // Initialize attendance state
      const attendanceMap = {};
      (attRes.data.attendance || []).forEach((att) => {
        attendanceMap[att.staffId] = att.status;
      });
      setAttendance(attendanceMap);

      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAttendanceChange = (staffId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Submit attendance for all assigned staff
      const promises = assignments.map((assignment) => {
        const status = attendance[assignment.staffId] || "absent";
        return attendanceAPI.markAttendance({
          shiftId: parseInt(shiftId),
          staffId: assignment.staffId,
          status: status,
        });
      });

      await Promise.all(promises);

      setSuccessMessage("Attendance marked successfully!");
      setTimeout(() => {
        navigate("/shifts");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
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

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present"
  ).length;
  const absentCount = assignments.length - presentCount;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-8">
      <button
        onClick={() => navigate("/shifts")}
        className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
      >
        ← Back to Shifts
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Mark Attendance
        </h1>

        {shift && (
          <p className="text-gray-600 mb-6">
            {formatDate(shift.date)} - {shift.type} Shift
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Stats */}
        {assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-green-700 font-semibold">Present</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {presentCount}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
              <p className="text-sm text-red-700 font-semibold">Absent</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {absentCount}
              </p>
            </div>
          </div>
        )}

        {assignments.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {assignment.staffName || `Staff ${assignment.staffId}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignment.staffEmail || ""}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleAttendanceChange(assignment.staffId, "present")
                    }
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      attendance[assignment.staffId] === "present"
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAttendanceChange(assignment.staffId, "absent")
                    }
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      attendance[assignment.staffId] === "absent"
                        ? "bg-red-500 text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Attendance"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/shifts")}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No staff assigned to this shift
            </p>
            <button
              onClick={() => navigate(`/assign-staff/${shiftId}`)}
              className="bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Assign Staff First
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
