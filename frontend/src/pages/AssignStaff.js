import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shiftAPI, assignmentAPI, staffAPI } from "../services/api";

const AssignStaff = () => {
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const [shift, setShift] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftRes, staffRes, assignRes] = await Promise.all([
        shiftAPI.getShiftById(shiftId),
        staffAPI.listStaff(),
        assignmentAPI.listAssignments(shiftId),
      ]);

      setShift(shiftRes.data);
      setStaffMembers(staffRes.data.staff || []);
      setAssignedStaff(assignRes.data.assignments || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignStaff = async (e) => {
    e.preventDefault();

    if (!selectedStaffId) {
      setError("Please select a staff member");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccessMessage("");

    try {
      await assignmentAPI.assignStaff({
        shiftId: parseInt(shiftId),
        staffId: parseInt(selectedStaffId),
      });

      setSuccessMessage("Staff assigned successfully!");
      setSelectedStaffId("");

      // Refresh assigned staff list
      const res = await assignmentAPI.listAssignments(shiftId);
      setAssignedStaff(res.data.assignments || []);

      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign staff");
    } finally {
      setAssigning(false);
    }
  };

  const availableStaff = staffMembers.filter(
    (staff) => !assignedStaff.some((assigned) => assigned.staffId === staff.id)
  );

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
          Assign Staff to Shift
        </h1>

        {shift && (
          <p className="text-gray-600 mb-6">
            {formatDate(shift.date)} - {shift.type} Shift (Capacity:{" "}
            {shift.capacity})
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignment Form */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Staff Member
            </h2>

            {availableStaff.length > 0 ? (
              <form onSubmit={handleAssignStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Staff Member
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={assigning}
                  >
                    <option value="">Choose a staff member...</option>
                    {availableStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} ({staff.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigning || !selectedStaffId}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Staff"}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No available staff members to assign
                </p>
              </div>
            )}
          </div>

          {/* Assigned Staff List */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Assigned Staff ({assignedStaff.length}/{shift?.capacity})
            </h2>

            {assignedStaff.length > 0 ? (
              <div className="space-y-2">
                {assignedStaff.map((assignment) => {
                  const staff = staffMembers.find(
                    (s) => s.id === assignment.staffId
                  );
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:shadow transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {staff?.firstName} {staff?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{staff?.email}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Assigned
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No staff assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStaff;
