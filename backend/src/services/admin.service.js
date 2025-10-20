const bcrypt = require("bcrypt");
const logger = require("../../logger");
const { query, execute } = require("../repo/db");
const Q = require("../repo/queries");
const {
  toDateTs,
  toEndTs,
  shiftDurationSeconds,
  overlapSeconds,
  capLimit,
} = require("../utils/time");

const ALLOWED_STATUS = new Set([
  "shift_start",
  "active",
  "inactive",
  "break_start",
  "break_end",
  "absent",
]);

async function loginAdmin(loginText, password) {
  const rows = await query(Q.ADMIN_BY_LOGIN, [loginText, loginText]);
  const user = rows[0];
  if (!user || user.role !== "admin") {
    logger.warn({ loginText }, "auth.admin_login_no_user");
    return null;
  }
  const hash = Buffer.isBuffer(user.password_hash)
    ? user.password_hash.toString("utf8")
    : String(user.password_hash || "");
  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    logger.warn({ userId: user.id }, "auth.admin_login_bad_password");
    return null;
  }
  logger.info(
    { userId: user.id, username: user.username },
    "auth.admin_login_ok",
  );
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function dashboardStats() {
  const [counts] = await query(Q.DASHBOARD_COUNTS);
  const [ot] = await query(Q.OVERTIME_TODAY);
  return {
    active_users: Number(counts?.active_users || 0),
    inactive_users: Number(counts?.inactive_users || 0),
    overtime_today_seconds: Number(ot?.total || 0),
  };
}

async function listUsers({ search, status }) {
  const where = ["role <> 'admin'"];
  const vals = [];
  if (search) {
    where.push(
      "(username LIKE ? OR name LIKE ? OR department LIKE ? OR email LIKE ?)",
    );
    const like = `%${search}%`;
    vals.push(like, like, like, like);
  }
  if (
    status &&
    [
      "off",
      "shift_start",
      "active",
      "inactive",
      "break_start",
      "break_end",
      "absent",
    ].includes(status)
  ) {
    where.push("status = ?");
    vals.push(status);
  }
  const sql = `${Q.LIST_USERS_BASE} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY name`;
  return query(sql, vals);
}

async function createUser({
  username,
  name,
  department,
  email,
  password,
  shift_start_time = "09:00:00",
  shift_end_time = "18:00:00",
}) {
  const dup = await query(
    "SELECT id FROM users WHERE username=? OR email=? LIMIT 1",
    [username, email],
  );
  if (dup.length) {
    const err = new Error("username_or_email_exists");
    err.status = 400;
    throw err;
  }
  const hash = await bcrypt.hash(password, 12);
  const duration = shiftDurationSeconds(shift_start_time, shift_end_time);
  const res = await execute(Q.INSERT_USER, [
    username,
    name,
    department,
    email,
    hash,
    "user",
    shift_start_time,
    shift_end_time,
    duration,
  ]);
  logger.info({ userId: res.insertId, username, email }, "user.created");
  return { id: res.insertId };
}

async function updateUser(id, fields) {
  const set = [];
  const vals = [];
  const allowed = [
    "name",
    "department",
    "email",
    "status",
    "shift_start_time",
    "shift_end_time",
    "image_url",
    "password",
  ];
  for (const k of allowed) {
    if (fields[k] === undefined || fields[k] === null || fields[k] === "")
      continue;
    if (k === "password") {
      const hash = await bcrypt.hash(String(fields[k]), 12);
      set.push("password_hash = ?");
      vals.push(hash);
    } else {
      set.push(`${k} = ?`);
      vals.push(fields[k]);
    }
  }
  if (!set.length) return { updated: 0 };

  const hasStart = fields.shift_start_time;
  const hasEnd = fields.shift_end_time;
  if (hasStart || hasEnd) {
    const user = await query(Q.GET_USER_BY_ID, [id]);
    const cur = user[0] || {};
    const s = fields.shift_start_time || cur.shift_start_time || "09:00:00";
    const e = fields.shift_end_time || cur.shift_end_time || "18:00:00";
    set.push("shift_duration_seconds = ?");
    vals.push(shiftDurationSeconds(s, e));
  }
  const sql = `UPDATE users SET ${set.join(", ")} WHERE id = ?`;
  vals.push(id);
  const res = await execute(sql, vals);
  logger.info({ userId: id, updated: res.affectedRows }, "user.updated");
  return { updated: res.affectedRows };
}

async function deleteUser(id) {
  await execute(Q.DELETE_USER_EVENTS, [id]);
  await execute(Q.DELETE_USER_SCREENSHOTS, [id]);
  await execute(Q.DELETE_USER_RECORDINGS, [id]);
  await execute(Q.DELETE_USER_OVERTIME, [id]);
  const res = await execute(Q.DELETE_USER, [id]);
  logger.info({ userId: id, deleted: res.affectedRows }, "user.deleted");
  return { deleted: res.affectedRows };
}

async function getUserById(id) {
  const rows = await query(Q.GET_USER_BY_ID, [id]);
  return rows[0] || null;
}

async function userHistory(userId, { start, end, limit = 500 }) {
  let sql = Q.USER_HISTORY.replace("/**DATE_FILTER**/", "");
  const vals = [userId];
  if (start && end) {
    sql = Q.USER_HISTORY.replace(
      "/**DATE_FILTER**/",
      "AND DATE(ae.occurred_at) BETWEEN ? AND ?",
    );
    vals.push(start, end);
  }
  vals.push(capLimit(limit, 500, 500));
  return query(sql, vals);
}

async function userScreenshots(userId, { limit = 50 }) {
  return query(Q.USER_SCREENSHOTS, [userId, capLimit(limit, 50, 200)]);
}
async function userRecordings(userId, { limit = 20 }) {
  return query(Q.USER_RECORDINGS, [userId, capLimit(limit, 20, 100)]);
}

async function unnotifiedInactive() {
  return query(Q.UNNOTIFIED_INACTIVE);
}
async function markEventNotified(id) {
  const res = await execute(Q.MARK_EVENT_NOTIFIED, [id]);
  logger.info(
    { eventId: id, updated: res.affectedRows },
    "event.mark_notified",
  );
  return { updated: res.affectedRows };
}

async function userOvertimeSum(userId, { start, end }) {
  if (start && end) {
    const [row] = await query(Q.OVERTIME_BY_USER_RANGE, [userId, start, end]);
    return Number(row?.total || 0);
  }
  const [row] = await query(Q.OVERTIME_BY_USER_ALL, [userId]);
  return Number(row?.total || 0);
}

async function markAbsentees(graceMinutes = 20) {
  const users = await query(Q.LIST_NONADMIN_USERS);
  const now = new Date();
  let marked = 0;

  for (const u of users) {
    try {
      const [hh, mm, ss] = String(u.shift_start_time || "09:00:00")
        .split(":")
        .map((x) => parseInt(x, 10) || 0);
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hh,
        mm,
        ss,
      );
      const graceMs =
        Number(process.env.ABSENCE_GRACE_MINUTES || graceMinutes) * 60 * 1000;
      if (now.getTime() < start.getTime() + graceMs) continue;

      const anyEv = await query(Q.ANY_EVENTS_TODAY, [u.id]);
      if (anyEv.length) continue;

      const hasAbs = await query(Q.ABSENT_TODAY, [u.id]);
      if (hasAbs.length) continue;

      await execute(Q.UPDATE_USER_STATUS, ["absent", u.id]);
      await execute(Q.INSERT_EVENT, [u.id, "absent", null]);
      marked += 1;
    } catch {}
  }
  if (marked) logger.info({ marked }, "absence.marked");
  return marked;
}

async function setUserStatusAndRecord(
  userId,
  status,
  activeDurationSeconds = null,
) {
  if (!ALLOWED_STATUS.has(status)) {
    const err = new Error("invalid_status");
    err.status = 400;
    throw err;
  }
  const res = await execute(Q.UPDATE_USER_STATUS, [status, userId]);
  const ev = await execute(Q.INSERT_EVENT, [
    userId,
    status,
    activeDurationSeconds,
  ]);
  if (status === "break_end")
    await execute(Q.UPDATE_USER_STATUS, ["active", userId]);
  logger.info({ userId, status, eventId: ev.insertId }, "user.status_set");
  return { updated: res.affectedRows, event_id: ev.insertId };
}

async function listAdminEmails() {
  const rows = await query(Q.LIST_ADMIN_EMAILS);
  return rows.map((r) => r.email).filter(Boolean);
}

async function userMetrics(userId, { start, end, includeRunning = false }) {
  if (!start || !end) {
    const err = new Error("start_end_required");
    err.status = 400;
    throw err;
  }
  const startTs = toDateTs(start);
  const endTs = toEndTs(end);

  const [aRow] = await query(Q.SUM_ACTIVE_IN_RANGE, [userId, startTs, endTs]);
  const [iRow] = await query(Q.SUM_INACTIVE_IN_RANGE, [userId, startTs, endTs]);
  const [bRow] = await query(Q.SUM_BREAK_IN_RANGE, [userId, startTs, endTs]);

  let active = Number(aRow?.total || 0);
  let inactive = Number(iRow?.total || 0);
  let brk = Number(bRow?.total || 0);

  const [u] = await query(Q.GET_USER_STATUS_MIN, [userId]);
  const asOf = new Date();
  if (includeRunning && u && u.last_status_change) {
    const runSec = overlapSeconds(u.last_status_change, asOf, startTs, endTs);
    if (runSec > 0) {
      const st = String(u.status || "").toLowerCase();
      if (st === "active") active += runSec;
      else if (st === "inactive") inactive += runSec;
      else if (st === "break_start") brk += runSec;
    }
  }

  const worked = active;
  const ot = await userOvertimeSum(userId, { start, end });

  return {
    active_seconds: active,
    inactive_seconds: inactive,
    break_seconds: brk,
    worked_seconds: worked,
    overtime_seconds: Number(ot || 0),
    status: u?.status || null,
    last_status_change: u?.last_status_change || null,
    as_of: asOf.toISOString(),
  };
}

module.exports = {
  loginAdmin,
  dashboardStats,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  userHistory,
  userScreenshots,
  userRecordings,
  unnotifiedInactive,
  markEventNotified,
  userOvertimeSum,
  markAbsentees,
  setUserStatusAndRecord,
  listAdminEmails,
  userMetrics,
};
