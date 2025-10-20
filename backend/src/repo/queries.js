// Users
const ADMIN_BY_LOGIN = `
  SELECT * FROM users
  WHERE username = ? OR email = ?
  LIMIT 1
`;

const INSERT_USER = `
  INSERT INTO users
    (username, name, department, email, password_hash, role,
     shift_start_time, shift_end_time, shift_duration_seconds)
  VALUES (?,?,?,?,?,?,?,?,?)
`;

const DELETE_USER = `DELETE FROM users WHERE id = ?`;

const GET_USER_BY_ID = `SELECT * FROM users WHERE id = ? LIMIT 1`;

const LIST_USERS_BASE = `
  SELECT id, username, name, department, email, status, role,
         shift_start_time, shift_end_time, shift_duration_seconds, image_url
  FROM users
`;

// Events / Alerts
const UNNOTIFIED_INACTIVE = `
  SELECT ae.id, ae.user_id, u.username, u.email, u.name, u.department,
         ae.event_type, ae.occurred_at, ae.active_duration_seconds
  FROM activity_events ae
  JOIN users u ON u.id = ae.user_id
  WHERE ae.event_type IN ('inactive','absent') AND ae.notified=0
  ORDER BY ae.occurred_at DESC
`;

const MARK_EVENT_NOTIFIED = `UPDATE activity_events SET notified=1 WHERE id = ?`;

// History (include new event types)
const USER_HISTORY = `
  SELECT ae.id, u.username, u.email, ae.event_type, ae.occurred_at, ae.notified,
         ae.active_duration_seconds
  FROM activity_events ae
  JOIN users u ON u.id = ae.user_id
  WHERE ae.user_id = ?
    AND ae.event_type IN ('inactive','active','break_start','break_end','absent')
    /**DATE_FILTER**/
  ORDER BY ae.occurred_at DESC
  LIMIT ?
`;

// Media
const USER_SCREENSHOTS = `
  SELECT id, user_id, event_id, taken_at, mime, url
  FROM screenshots
  WHERE user_id = ?
  ORDER BY taken_at DESC
  LIMIT ?
`;

const USER_RECORDINGS = `
  SELECT id, user_id, event_id, recorded_at, duration_seconds, mime, url
  FROM screen_recordings
  WHERE user_id = ?
  ORDER BY recorded_at DESC
  LIMIT ?
`;

// Status updates / event insert
const UPDATE_USER_STATUS = `
  UPDATE users SET status = ?, last_status_change = NOW() WHERE id = ?
`;

const INSERT_EVENT = `
  INSERT INTO activity_events (user_id, event_type, active_duration_seconds)
  VALUES (?,?,?)
`;

// Dashboard
const DASHBOARD_COUNTS = `
  SELECT
    (SELECT COUNT(*) FROM users WHERE role<>'admin' AND status='active')   AS active_users,
    (SELECT COUNT(*) FROM users WHERE role<>'admin' AND status='inactive') AS inactive_users
`;

const OVERTIME_TODAY = `
  SELECT COALESCE(SUM(overtime_seconds),0) AS total
  FROM user_overtimes
  WHERE ot_date = CURDATE()
`;

// Per-user overtime
const OVERTIME_BY_USER_RANGE = `
  SELECT COALESCE(SUM(overtime_seconds),0) AS total
  FROM user_overtimes
  WHERE user_id = ? AND ot_date BETWEEN ? AND ?
`;

const OVERTIME_BY_USER_ALL = `
  SELECT COALESCE(SUM(overtime_seconds),0) AS total
  FROM user_overtimes
  WHERE user_id = ?
`;

// Email helpers
const LIST_ADMIN_EMAILS = `
  SELECT email FROM users
  WHERE role='admin' AND email IS NOT NULL AND email <> ''
`;

// Absence checker
const LIST_NONADMIN_USERS = `
  SELECT id, username, shift_start_time, status
  FROM users
  WHERE role <> 'admin'
`;

const ANY_EVENTS_TODAY = `
  SELECT 1 FROM activity_events
  WHERE user_id = ? AND DATE(occurred_at) = CURDATE()
  LIMIT 1
`;

const ABSENT_TODAY = `
  SELECT 1 FROM activity_events
  WHERE user_id = ? AND event_type='absent' AND DATE(occurred_at) = CURDATE()
  LIMIT 1
`;
// Per-user metrics (sums within a date-time range)
const GET_USER_STATUS_MIN = `
  SELECT id, status, last_status_change, shift_duration_seconds
  FROM users WHERE id = ? LIMIT 1
`;

const SUM_ACTIVE_IN_RANGE = `
  SELECT COALESCE(SUM(active_duration_seconds),0) AS total
  FROM activity_events
  WHERE user_id = ?
    AND event_type IN ('inactive','break_start')
    AND occurred_at BETWEEN ? AND ?
`;

const SUM_INACTIVE_IN_RANGE = `
  SELECT COALESCE(SUM(active_duration_seconds),0) AS total
  FROM activity_events
  WHERE user_id = ?
    AND event_type = 'active'
    AND occurred_at BETWEEN ? AND ?
`;

const SUM_BREAK_IN_RANGE = `
  SELECT COALESCE(SUM(active_duration_seconds),0) AS total
  FROM activity_events
  WHERE user_id = ?
    AND event_type = 'break_end'
    AND occurred_at BETWEEN ? AND ?
`;

// Dependent deletes for user removal
const DELETE_USER_EVENTS = `
  DELETE FROM activity_events WHERE user_id = ?
`;
const DELETE_USER_SCREENSHOTS = `
  DELETE FROM screenshots WHERE user_id = ?
`;
const DELETE_USER_RECORDINGS = `
  DELETE FROM screen_recordings WHERE user_id = ?
`;
const DELETE_USER_OVERTIME = `
  DELETE FROM user_overtimes WHERE user_id = ?
`;

module.exports = {
  ADMIN_BY_LOGIN,
  INSERT_USER,
  DELETE_USER,
  GET_USER_BY_ID,
  LIST_USERS_BASE,
  UNNOTIFIED_INACTIVE,
  MARK_EVENT_NOTIFIED,
  USER_HISTORY,
  USER_SCREENSHOTS,
  USER_RECORDINGS,
  UPDATE_USER_STATUS,
  INSERT_EVENT,
  DASHBOARD_COUNTS,
  OVERTIME_TODAY,
  OVERTIME_BY_USER_RANGE,
  OVERTIME_BY_USER_ALL,
  LIST_ADMIN_EMAILS,
  LIST_NONADMIN_USERS,
  ANY_EVENTS_TODAY,
  ABSENT_TODAY,
};

module.exports = {
  // keep existing exports…
  ...module.exports,
  GET_USER_STATUS_MIN,
  SUM_ACTIVE_IN_RANGE,
  SUM_INACTIVE_IN_RANGE,
  SUM_BREAK_IN_RANGE,

  // delete dependencies
  DELETE_USER_EVENTS,
  DELETE_USER_SCREENSHOTS,
  DELETE_USER_RECORDINGS,
  DELETE_USER_OVERTIME,
};
