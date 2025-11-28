type UserRole = "ADMIN" | "MANAGER" | "STAFF";

interface User {
  id: string;
  userName: string;
  role: UserRole;
  staffId?: string | null;
  passwordHash: string;
}