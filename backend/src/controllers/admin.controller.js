const { z } = require("zod");
const svc = require("../services/admin.service");
const {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../middleware/auth");

const DATE_YMD = /^\d{4}-\d{2}-\d{2}$/;
const STATUS = [
  "off",
  "shift_start",
  "active",
  "inactive",
  "break_start",
  "break_end",
  "absent",
];
const idFrom = (req) => Number(req.params.id);

// Auth
const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});
async function login(req, res) {
  const { login: loginText, password } = req.valid.body;
  const admin = await svc.loginAdmin(loginText, password);
  if (!admin) return res.status(401).json({ error: "invalid_credentials" });
  const token = signToken({
    id: admin.id,
    role: admin.role,
    email: admin.email,
  });
  setAuthCookie(res, token);
  res.json({ data: { admin } });
}
async function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ data: true });
}

// Dashboard
async function dashboardStats(_req, res) {
  const data = await svc.dashboardStats();
  res.json({ data });
}

// Users
const listUsersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(STATUS).optional(),
});
async function listUsers(req, res) {
  const { search, status } = req.valid.query;
  const data = await svc.listUsers({ search, status });
  res.json({ data });
}

const createUserSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  department: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  shift_start_time: z.string().optional(),
  shift_end_time: z.string().optional(),
});
async function createUser(req, res) {
  const { id } = await svc.createUser(req.valid.body);
  const user = await svc.getUserById(id);
  res.status(201).json({ data: user });
}

const updateUserSchema = z.object({
  name: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(STATUS).optional(),
  shift_start_time: z.string().optional(),
  shift_end_time: z.string().optional(),
  image_url: z.string().url().optional(),
  password: z.string().min(6).optional(),
});
async function updateUser(req, res) {
  const id = idFrom(req);
  const out = await svc.updateUser(id, req.valid.body);
  res.json({ data: out });
}

async function deleteUser(req, res) {
  const id = idFrom(req);
  const out = await svc.deleteUser(id);
  res.json({ data: out });
}

// History & Media
const historyQuery = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.coerce.number().optional(),
});
async function userHistory(req, res) {
  const id = idFrom(req);
  const data = await svc.userHistory(id, req.valid.query);
  res.json({ data });
}

const limitQuery = z.object({ limit: z.coerce.number().optional() });
async function userScreenshots(req, res) {
  const id = idFrom(req);
  const data = await svc.userScreenshots(id, req.valid.query);
  res.json({ data });
}
async function userRecordings(req, res) {
  const id = idFrom(req);
  const data = await svc.userRecordings(id, req.valid.query);
  res.json({ data });
}

// Alerts
async function unnotifiedInactive(_req, res) {
  const data = await svc.unnotifiedInactive();
  res.json({ data });
}
async function markEventNotified(req, res) {
  const id = idFrom(req);
  const data = await svc.markEventNotified(id);
  res.json({ data });
}

// Overtime
const overtimeQuery = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});
async function userOvertime(req, res) {
  const id = idFrom(req);
  const seconds = await svc.userOvertimeSum(id, req.valid.query);
  res.json({ data: { seconds } });
}

// Metrics
const metricsQuery = z.object({
  start: z.string().regex(DATE_YMD),
  end: z.string().regex(DATE_YMD),
  includeRunning: z.coerce.boolean().optional(),
});

async function userMetrics(req, res) {
  const id = idFrom(req);
  const { start, end, includeRunning } = req.valid.query;
  const data = await svc.userMetrics(id, { start, end, includeRunning });
  res.json({ data });
}

module.exports = {
  // schemas
  loginSchema,
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  historyQuery,
  limitQuery,
  overtimeQuery,
  setStatusSchema: z.object({
    status: z.enum(STATUS),
    active_duration_seconds: z.number().int().nonnegative().optional(),
  }),
  metricsQuery,
  // handlers
  login,
  logout,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  userHistory,
  userScreenshots,
  userRecordings,
  dashboardStats,
  unnotifiedInactive,
  markEventNotified,
  userOvertime,
  setUserStatus: async function setUserStatus(req, res) {
    const id = idFrom(req);
    const { status, active_duration_seconds } = req.valid.body;
    const data = await svc.setUserStatusAndRecord(
      id,
      status,
      active_duration_seconds ?? null,
    );
    res.status(201).json({ data });
  },
  userMetrics,
};
