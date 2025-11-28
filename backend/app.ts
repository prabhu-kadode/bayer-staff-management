import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

/**
 * Enums & Types
 */

type UserRole = "ADMIN" | "MANAGER" | "STAFF";
type StaffRole = "NURSE" | "DOCTOR" | "TECHNICIAN" | "ADMIN" | "OTHER";
type ShiftTimeSlot = "M" | "A" | "N";
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE";

interface User {
  id: string;
  userName: string;
  role: UserRole;
  staffId?: string | null;
  passwordHash: string;
}

interface Staff {
  id: string;
  staffCode: string;
  staffName: string;
  role: StaffRole;
  contactNo?: string;
  email?: string;
  department?: string;
  preferredShift?: ShiftTimeSlot;
  isActive: boolean;
}

interface Shift {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  timeSlot: ShiftTimeSlot;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  ward?: string;
  createdAt: string;
  updatedAt: string;
}

interface Attendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  comment?: string;
  recordedAt: string;
  recordedByUserId: string;
}

/**
 * Pagination helper types
 */
interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * In-memory mock data stores
 * (Replace with DB in real app)
 */

const users: User[] = [
  {
    id: uuidv4(),
    userName: "admin",
    passwordHash: "admin",
    role: "ADMIN",
    staffId: null,
  },
];

const staffStore: Staff[] = [];
const shiftsStore: Shift[] = [];
const attendanceStore: Attendance[] = [];

/**
 * Utility functions
 */

function nowISO(): string {
  return new Date().toISOString();
}

function paginate<T>(
  items: T[],
  { page = 1, pageSize = 20 }: PaginationQuery
): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedItems = items.slice(start, end);
  return {
    items: pagedItems,
    page,
    pageSize,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / pageSize) || 1,
  };
}

/**
 * Express app setup
 */

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * 1. Auth Routes
 */

// POST /auth/login
app.post("/auth/login", (req: Request, res: Response) => {
  const { userName, password } = req.body as {
    userName?: string;
    password?: string;
  };

  if (!userName || !password) {
    return res.status(400).json({ message: "userName and password required" });
  }

  const user = users.find(
    (u) => u.userName === userName && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = `dummy-token-${user.id}`;

  return res.json({
    accessToken,
    expiresIn: 3600,
    user: {
      id: user.id,
      userName: user.userName,
      role: user.role,
      staffId: user.staffId ?? null,
    },
  });
});

/**
 * 2. Staff Routes
 */

// GET /staff
app.get("/staff", (req: Request, res: Response) => {
  const {
    name,
    role,
    department,
    sortBy,
    sortOrder = "ASC",
    page = "1",
    pageSize = "20",
  } = req.query as {
    name?: string;
    role?: StaffRole;
    department?: string;
    sortBy?: keyof Staff;
    sortOrder?: "ASC" | "DESC";
    page?: string;
    pageSize?: string;
  };

  let result = [...staffStore];

  if (name) {
    const lower = name.toLowerCase();
    result = result.filter((s) => s.staffName.toLowerCase().includes(lower));
  }

  if (role) {
    result = result.filter((s) => s.role === role);
  }

  if (department) {
    const lower = department.toLowerCase();
    result = result.filter(
      (s) => s.department && s.department.toLowerCase() === lower
    );
  }

  if (sortBy) {
    result.sort((a: any, b: any) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av === bv) return 0;
      if (sortOrder === "ASC") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }

  const paginated = paginate(result, {
    page: Number(page),
    pageSize: Number(pageSize),
  });

  return res.json(paginated);
});

// GET /staff/:id
app.get("/staff/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const staff = staffStore.find((s) => s.id === id);
  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }
  return res.json(staff);
});

// POST /staff
app.post("/staff", (req: Request, res: Response) => {
  const {
    staffCode,
    staffName,
    role,
    contactNo,
    email,
    department,
    preferredShift,
    isActive = true,
  } = req.body as Partial<Staff>;

  if (!staffCode || !staffName || !role) {
    return res
      .status(400)
      .json({ message: "staffCode, staffName, role are required" });
  }

  const now = nowISO();
  const newStaff: Staff = {
    id: uuidv4(),
    staffCode,
    staffName,
    role,
    contactNo,
    email,
    department,
    preferredShift,
    isActive,
    createdAt: now,
    updatedAt: now,
  };

  staffStore.push(newStaff);
  return res.status(201).json(newStaff);
});

// PATCH /staff/:id
app.patch("/staff/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const staffIndex = staffStore.findIndex((s) => s.id === id);
  if (staffIndex === -1) {
    return res.status(404).json({ message: "Staff not found" });
  }

  const existing = staffStore[staffIndex];
  const updates = req.body as Partial<Staff>;

  const updated: Staff = {
    ...existing,
    ...updates,
    id: existing.id, // never change ID
    updatedAt: nowISO(),
  };

  staffStore[staffIndex] = updated;
  return res.json(updated);
});

/**
 * 3. Attendance Routes
 */

// GET /attendance
app.get("/attendance", (req: Request, res: Response) => {
  const {
    staffId,
    dateFrom,
    dateTo,
    status,
    page = "1",
    pageSize = "20",
  } = req.query as {
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: AttendanceStatus;
    page?: string;
    pageSize?: string;
  };

  let result = [...attendanceStore];

  if (staffId) {
    result = result.filter((a) => a.staffId === staffId);
  }

  if (dateFrom) {
    result = result.filter((a) => a.date >= dateFrom);
  }

  if (dateTo) {
    result = result.filter((a) => a.date <= dateTo);
  }

  if (status) {
    result = result.filter((a) => a.status === status);
  }

  const paginated = paginate(result, {
    page: Number(page),
    pageSize: Number(pageSize),
  });

  return res.json(paginated);
});

// GET /attendance/:staffId
app.get("/attendance/:staffId", (req: Request, res: Response) => {
  const { staffId } = req.params;
  const { dateFrom, dateTo, page = "1", pageSize = "31" } = req.query as {
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    pageSize?: string;
  };

  let result = attendanceStore.filter((a) => a.staffId === staffId);

  if (dateFrom) {
    result = result.filter((a) => a.date >= dateFrom);
  }
  if (dateTo) {
    result = result.filter((a) => a.date <= dateTo);
  }

  const paginated = paginate(result, {
    page: Number(page),
    pageSize: Number(pageSize),
  });

  return res.json(paginated);
});

// POST /attendance
app.post("/attendance", (req: Request, res: Response) => {
  const { records } = req.body as {
    records: Array<{
      staffId: string;
      date: string;
      status: AttendanceStatus;
      comment?: string;
    }>;
  };

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: "records array is required" });
  }

  // In a real app, get this from auth middleware (req.user.id)
  const recordedByUserId = users[0].id;

  const createdRecords: Attendance[] = records.map((r) => {
    if (!r.staffId || !r.date || !r.status) {
      throw new Error("staffId, date, status are required for each record");
    }
    return {
      id: uuidv4(),
      staffId: r.staffId,
      date: r.date,
      status: r.status,
      comment: r.comment,
      recordedAt: nowISO(),
      recordedByUserId,
    };
  });

  attendanceStore.push(...createdRecords);

  return res.status(201).json({ records: createdRecords });
});

/**
 * 4. Shift Routes
 */

// GET /shifts
app.get("/shifts", (req: Request, res: Response) => {
  const {
    staffId,
    dateFrom,
    dateTo,
    ward,
    timeSlot,
    page = "1",
    pageSize = "50",
  } = req.query as {
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    ward?: string;
    timeSlot?: ShiftTimeSlot;
    page?: string;
    pageSize?: string;
  };

  let result = [...shiftsStore];

  if (staffId) {
    result = result.filter((s) => s.staffId === staffId);
  }
  if (dateFrom) {
    result = result.filter((s) => s.date >= dateFrom);
  }
  if (dateTo) {
    result = result.filter((s) => s.date <= dateTo);
  }
  if (ward) {
    const lower = ward.toLowerCase();
    result = result.filter(
      (s) => s.ward && s.ward.toLowerCase() === lower
    );
  }
  if (timeSlot) {
    result = result.filter((s) => s.timeSlot === timeSlot);
  }

  const paginated = paginate(result, {
    page: Number(page),
    pageSize: Number(pageSize),
  });

  return res.json(paginated);
});

// GET /shifts/:id
app.get("/shifts/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const shift = shiftsStore.find((s) => s.id === id);
  if (!shift) {
    return res.status(404).json({ message: "Shift not found" });
  }
  return res.json(shift);
});

// POST /shifts
app.post("/shifts", (req: Request, res: Response) => {
  const { shifts } = req.body as {
    shifts: Array<{
      staffId: string;
      date: string;
      timeSlot: ShiftTimeSlot;
      startTime: string;
      endTime: string;
      ward?: string;
    }>;
  };

  if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
    return res.status(400).json({ message: "shifts array is required" });
  }

  const createdShifts: Shift[] = shifts.map((s) => {
    if (!s.staffId || !s.date || !s.timeSlot || !s.startTime || !s.endTime) {
      throw new Error(
        "staffId, date, timeSlot, startTime, endTime are required for each shift"
      );
    }
    const now = nowISO();
    return {
      id: uuidv4(),
      staffId: s.staffId,
      date: s.date,
      timeSlot: s.timeSlot,
      startTime: s.startTime,
      endTime: s.endTime,
      ward: s.ward,
      createdAt: now,
      updatedAt: now,
    };
  });

  shiftsStore.push(...createdShifts);

  return res.status(201).json({ shifts: createdShifts });
});

// PATCH /shifts/:id
app.patch("/shifts/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const shiftIndex = shiftsStore.findIndex((s) => s.id === id);
  if (shiftIndex === -1) {
    return res.status(404).json({ message: "Shift not found" });
  }

  const existing = shiftsStore[shiftIndex];
  const updates = req.body as Partial<Shift>;

  const updated: Shift = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: nowISO(),
  };

  shiftsStore[shiftIndex] = updated;
  return res.json(updated);
});

/**
 * Start server
 */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Healthcare Shift Scheduler API running on port ${PORT}`);
});
