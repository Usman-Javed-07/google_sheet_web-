const express = require("express");
const { validate } = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const C = require("../controllers/admin.controller");

const router = express.Router();

// Auth
router.post("/auth/login", validate(C.loginSchema), C.login);
router.post("/auth/logout", C.logout);

// Dashboard
router.get("/dashboard/stats", requireAdmin, C.dashboardStats);

// Users
router.get(
  "/users",
  requireAdmin,
  validate(C.listUsersSchema, "query"),
  C.listUsers,
);
router.post("/users", requireAdmin, validate(C.createUserSchema), C.createUser);
router.patch(
  "/users/:id",
  requireAdmin,
  validate(C.updateUserSchema),
  C.updateUser,
);
router.delete("/users/:id", requireAdmin, C.deleteUser);

// History & Media
router.get(
  "/users/:id/history",
  requireAdmin,
  validate(C.historyQuery, "query"),
  C.userHistory,
);
router.get(
  "/users/:id/screenshots",
  requireAdmin,
  validate(C.limitQuery, "query"),
  C.userScreenshots,
);
router.get(
  "/users/:id/recordings",
  requireAdmin,
  validate(C.limitQuery, "query"),
  C.userRecordings,
);

// Alerts (optional polling)
router.get("/events/unnotified/inactive", requireAdmin, C.unnotifiedInactive);
router.post("/events/:id/mark-notified", requireAdmin, C.markEventNotified);

// Per-user overtime
router.get(
  "/users/:id/overtime",
  requireAdmin,
  validate(C.overtimeQuery, "query"),
  C.userOvertime,
);

// Set status + record event (to test notifications)
router.post(
  "/users/:id/status",
  requireAdmin,
  validate(C.setStatusSchema),
  C.setUserStatus,
);
// Per-user metrics
router.get(
  "/users/:id/metrics",
  requireAdmin,
  validate(C.metricsQuery, "query"),
  C.userMetrics,
);
module.exports = router;
