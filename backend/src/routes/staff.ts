import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
const staff = express.Router();

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

staff.get("/staff", (req: Request, res: Response) => {
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
staff.get("/staff/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const staff = staffStore.find((s) => s.id === id);
  if (!staff) {
    return res.status(404).json({ message: "Staff not found" });
  }
  return res.json(staff);
});

// POST /staff
staff.post("/staff", (req: Request, res: Response) => {
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
  };

  staffStore.push(newStaff);
  return res.status(201).json(newStaff);
});

// PATCH /staff/:id
staff.patch("/staff/:id", (req: Request, res: Response) => {
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
  };

  staffStore[staffIndex] = updated;
  return res.json(updated);
});