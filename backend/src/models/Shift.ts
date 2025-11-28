type ShiftTimeSlot = "M" | "A" | "N";

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