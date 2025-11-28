import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

// In-memory users store for demo purposes
const users: Array<any> = [];

// Seed an admin user from environment variables if provided
const seedAdminFromEnv = () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toString().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || !adminPassword) return;

  const existing = users.find((u) => u.email === adminEmail);
  if (existing) return;

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(adminPassword, 8);
  const user = {
    id,
    email: adminEmail,
    passwordHash,
    firstName: process.env.ADMIN_FIRSTNAME || "Admin",
    lastName: process.env.ADMIN_LASTNAME || "User",
    role: "admin",
  };
  users.push(user);
  console.log("Seeded admin user from env:", adminEmail);
};

seedAdminFromEnv();

// Helper to strip sensitive fields
const publicUser = (u: any) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role });

router.post("/auth/register", (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = users.find((u) => u.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = { id, email: email.toLowerCase(), passwordHash, firstName: firstName || "", lastName: lastName || "", role: "user" };
  users.push(user);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });

  return res.json({ token, user: publicUser(user) });
});

router.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
  return res.json({ token, user: publicUser(user) });
});

// Protected route example - returns user from token
router.get("/auth/me", (req: Request, res: Response) => {
  const authHeader = (req.headers.authorization || "").toString();
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
