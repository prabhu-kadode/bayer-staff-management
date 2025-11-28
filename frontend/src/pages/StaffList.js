import React, { useState, useEffect } from "react";
import { staffAPI } from "../services/api";

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "firstName",
    direction: "asc",
  });
  const [filterRole, setFilterRole] = useState("all");
  const [filterPreference, setFilterPreference] = useState("all");

  // Mock role assignment based on staff ID
  const getRoleById = (id) => {
    const roles = [
      "Doctor",
      "Nurse",
      "Technician",
      "Administrator",
      "Receptionist",
    ];
    const roleIndex = parseInt(id) % roles.length;
    return roles[roleIndex];
  };

  // Mock shift preference
  const getShiftPreference = (id) => {
    const preferences = ["Morning", "Afternoon", "Night", "Flexible"];
    const prefIndex = parseInt(id) % preferences.length;
    return preferences[prefIndex];
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.listStaff();
      const staffData = (response.data.staff || []).map((member) => ({
        ...member,
        role: getRoleById(member.id),
        shiftPreference: getShiftPreference(member.id),
      }));
      setStaff(staffData);
      setFilteredStaff(staffData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  // Handle search and filter
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterAndSort(staff, term, filterRole, filterPreference, sortConfig);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    filterAndSort(staff, searchTerm, role, filterPreference, sortConfig);
  };

  const handlePreferenceFilter = (preference) => {
    setFilterPreference(preference);
    filterAndSort(staff, searchTerm, filterRole, preference, sortConfig);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    filterAndSort(
      staff,
      searchTerm,
      filterRole,
      filterPreference,
      newSortConfig
    );
  };

  const filterAndSort = (data, search, role, preference, sort) => {
    let filtered = data;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (member) =>
          `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase()) ||
          member.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply role filter
    if (role !== "all") {
      filtered = filtered.filter((member) => member.role === role);
    }

    // Apply preference filter
    if (preference !== "all") {
      filtered = filtered.filter(
        (member) => member.shiftPreference === preference
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      if (typeof aValue === "string") {
        return sort.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredStaff(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const getRoleColor = (role) => {
    const colors = {
      Doctor: "bg-blue-100 text-blue-800",
      Nurse: "bg-green-100 text-green-800",
      Technician: "bg-purple-100 text-purple-800",
      Administrator: "bg-gray-100 text-gray-800",
      Receptionist: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getPreferenceColor = (preference) => {
    const colors = {
      Morning: "bg-yellow-100 text-yellow-800",
      Afternoon: "bg-orange-100 text-orange-800",
      Night: "bg-indigo-100 text-indigo-800",
      Flexible: "bg-green-100 text-green-800",
    };
    return colors[preference] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading staff list...</p>
      </div>
    );
  }

  const uniqueRoles = [...new Set(staff.map((m) => m.role))];
  const uniquePreferences = [...new Set(staff.map((m) => m.shiftPreference))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white shadow border-b-2 border-blue-600 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600 text-xs">
            Manage staff members, roles & shift preferences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {error && (
          <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Stats & Filters Combined - Compact */}
        <div className="bg-white rounded shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
            <div className="text-center border-l-2 border-blue-600 pl-2">
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <p className="text-xl font-bold text-blue-600">{staff.length}</p>
            </div>
            <div className="text-center border-l-2 border-green-600 pl-2">
              <p className="text-xs text-gray-600 font-semibold">Shown</p>
              <p className="text-xl font-bold text-green-600">
                {filteredStaff.length}
              </p>
            </div>
            <div className="text-center border-l-2 border-purple-600 pl-2">
              <p className="text-xs text-gray-600 font-semibold">Roles</p>
              <p className="text-xl font-bold text-purple-600">
                {uniqueRoles.length}
              </p>
            </div>
            <div className="text-center border-l-2 border-orange-600 pl-2">
              <p className="text-xs text-gray-600 font-semibold">Prefs</p>
              <p className="text-xl font-bold text-orange-600">
                {uniquePreferences.length}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <input
                type="text"
                placeholder="Search name, email, ID..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterPreference("all");
                setSortConfig({ key: "firstName", direction: "asc" });
                setFilteredStaff(staff);
              }}
              className="px-2 py-2 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 transition font-semibold col-span-2 sm:col-span-1"
            >
              Reset
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={filterPreference}
              onChange={(e) => handlePreferenceFilter(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Preferences</option>
              {uniquePreferences.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded shadow-sm overflow-hidden">
          {filteredStaff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-blue-700 font-semibold text-xs"
                      onClick={() => handleSort("firstName")}
                    >
                      Name {getSortIcon("firstName")}
                    </th>
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-blue-700 font-semibold text-xs"
                      onClick={() => handleSort("id")}
                    >
                      ID {getSortIcon("id")}
                    </th>
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-blue-700 font-semibold text-xs"
                      onClick={() => handleSort("email")}
                    >
                      Email {getSortIcon("email")}
                    </th>
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-blue-700 font-semibold text-xs"
                      onClick={() => handleSort("role")}
                    >
                      Role {getSortIcon("role")}
                    </th>
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-blue-700 font-semibold text-xs"
                      onClick={() => handleSort("shiftPreference")}
                    >
                      Shift {getSortIcon("shiftPreference")}
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-xs">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member, idx) => (
                    <tr
                      key={member.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                    >
                      <td className="px-4 py-2 text-gray-900 font-medium text-xs">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="px-4 py-2 text-gray-700 text-xs">
                        {member.id}
                      </td>
                      <td className="px-4 py-2 text-gray-700 text-xs">
                        {member.email}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span
                          className={`inline-block px-2 py-1 rounded text-white font-semibold text-xs ${getRoleColor(
                            getRoleById(member.id)
                          )}`}
                        >
                          {getRoleById(member.id)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span
                          className={`inline-block px-2 py-1 rounded text-white font-semibold text-xs ${getPreferenceColor(
                            getShiftPreference(member.id)
                          )}`}
                        >
                          {getShiftPreference(member.id)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700 text-xs">
                        {member.department}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-xs">
              No staff members found
            </div>
          )}
        </div>

        <p className="text-gray-600 text-xs mt-3">
          Showing {filteredStaff.length} of {staff.length} staff members
        </p>
      </div>
    </div>
  );
};

export default StaffList;
