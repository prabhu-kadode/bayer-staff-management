// Mock data store
const mockDatabase = {
  shifts: [],
  assignments: {},
  attendance: {},
};

// Initialize shifts for today and next 7 days with all 6 time slots
const initializeShifts = () => {
  const timeSlots = [
    { time: "08:00-12:00", type: "Morning" },
    { time: "12:00-16:00", type: "Afternoon" },
    { time: "16:00-20:00", type: "Night" },
  ];

  const startDate = new Date();
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    timeSlots.forEach((slot) => {
      mockDatabase.shifts.push({
        id: `shift_${dateStr}_${slot.time.replace(/[:-]/g, "")}`,
        date: dateStr,
        type: slot.type,
        timeSlot: slot.time,
        capacity: 2,
        assignedCount: 0,
      });
    });
  }
};

initializeShifts();

// Shift API - Mock data
export const shiftAPI = {
  createShift: async (data) => {
    const newShift = {
      id: String(Date.now()),
      ...data,
      assignedCount: 0,
    };
    mockDatabase.shifts.push(newShift);
    return { data: newShift };
  },
  listShifts: async (date) => {
    const shifts = date
      ? mockDatabase.shifts.filter((s) => s.date === date)
      : mockDatabase.shifts;
    return { data: { shifts } };
  },
  getShiftById: async (id) => {
    const shift = mockDatabase.shifts.find((s) => s.id === id);
    return { data: shift || {} };
  },
};

// Assignment API - Mock data
export const assignmentAPI = {
  assignStaff: async (data) => {
    const key = `shift_${data.shiftId}`;
    if (!mockDatabase.assignments[key]) {
      mockDatabase.assignments[key] = [];
    }

    // Check if already assigned
    const alreadyAssigned = mockDatabase.assignments[key].some(
      (a) => a.staffId === data.staffId
    );

    if (alreadyAssigned) {
      throw {
        response: { data: { error: "Staff already assigned to this shift" } },
      };
    }

    // Get the shift date
    const shift = mockDatabase.shifts.find((s) => s.id === data.shiftId);
    if (!shift) {
      throw {
        response: { data: { error: "Shift not found" } },
      };
    }

    // Check if staff already has a shift on this date
    const shiftsOnDate = mockDatabase.shifts.filter(
      (s) => s.date === shift.date
    );
    const staffAssignedOnDate = shiftsOnDate.some((s) => {
      const assignKey = `shift_${s.id}`;
      return (mockDatabase.assignments[assignKey] || []).some(
        (a) => a.staffId === data.staffId
      );
    });

    if (staffAssignedOnDate) {
      throw {
        response: {
          data: {
            error:
              "Staff can only work 1 shift per day. Staff already assigned to another shift on this date.",
          },
        },
      };
    }

    // Check if staff has less than 8 hours available (4 hours per shift)
    const staffHours = shiftsOnDate.reduce((hours, s) => {
      const assignKey = `shift_${s.id}`;
      const hasAssignment = (mockDatabase.assignments[assignKey] || []).some(
        (a) => a.staffId === data.staffId
      );
      return hours + (hasAssignment ? 4 : 0);
    }, 0);

    if (staffHours >= 8) {
      throw {
        response: {
          data: {
            error:
              "Staff already has 8 hours of work on this date. Cannot assign more shifts.",
          },
        },
      };
    }

    const assignment = {
      id: String(Date.now()),
      ...data,
      staffName: `Staff ${data.staffId}`,
    };

    mockDatabase.assignments[key].push(assignment);

    // Update shift assigned count
    if (shift) {
      shift.assignedCount = (shift.assignedCount || 0) + 1;
    }

    return { data: assignment };
  },
  listAssignments: async (shiftId) => {
    const key = `shift_${shiftId}`;
    const assignments = mockDatabase.assignments[key] || [];
    return { data: { assignments } };
  },
  getAssignment: async (id) => {
    return { data: {} };
  },
};

// Attendance API - Mock data
export const attendanceAPI = {
  markAttendance: async (data) => {
    const key = `shift_${data.shiftId}_staff_${data.staffId}`;
    mockDatabase.attendance[key] = data.status;
    return { data: { success: true } };
  },
  listAttendance: async (shiftId) => {
    const attendance = Object.entries(mockDatabase.attendance)
      .filter(([key]) => key.startsWith(`shift_${shiftId}`))
      .map(([, status]) => ({ status }));
    return { data: { attendance } };
  },
  getAttendanceByShift: async (shiftId) => {
    const key = `shift_${shiftId}`;
    const assignments = mockDatabase.assignments[key] || [];
    const attendance = assignments.map((a) => ({
      staffId: a.staffId,
      status:
        mockDatabase.attendance[`shift_${shiftId}_staff_${a.staffId}`] ||
        "absent",
    }));
    return { data: { attendance } };
  },
};

// Dashboard API - Mock data
export const dashboardAPI = {
  getDashboard: async () => {
    return {
      data: {
        totalStaff: 125,
        assignedToday: mockDatabase.shifts.reduce(
          (sum, s) => sum + (s.assignedCount || 0),
          0
        ),
        attendanceRate: 92.5,
        totalShifts: mockDatabase.shifts.length,
      },
    };
  },
};

// Staff API - Mock data
export const staffAPI = {
  listStaff: async () => {
    const staff = [
      {
        id: "101",
        firstName: "John",
        lastName: "Doe",
        email: "john@hospital.com",
        department: "Nursing",
      },
      {
        id: "102",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@hospital.com",
        department: "Administration",
      },
      {
        id: "103",
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@hospital.com",
        department: "Nursing",
      },
      {
        id: "104",
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah@hospital.com",
        department: "Medical Records",
      },
      {
        id: "105",
        firstName: "Robert",
        lastName: "Brown",
        email: "robert@hospital.com",
        department: "Nursing",
      },
    ];
    return { data: { staff } };
  },
};

export default null;
