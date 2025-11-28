type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE";

interface Attendance {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  comment?: string;
  recordedAt: string;
  recordedByUserId: string;
}