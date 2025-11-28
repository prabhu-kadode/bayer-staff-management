type StaffRole = "NURSE" | "DOCTOR" | "TECHNICIAN" | "ADMIN" | "OTHER";
type ShiftTimeSlot = "M" | "A" | "N";

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