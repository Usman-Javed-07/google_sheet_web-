// src/api/admin.js
import { get, post, patch, del } from "./client";

// Dashboard
export const getDashboardStats = () => get("/dashboard/stats");

// Alerts / events feed
export const getUnnotifiedEvents = () => get("/events/unnotified/inactive");
export const markEventNotified = (id) => post(`/events/${id}/mark-notified`);
// Users (list + CRUD)
export const getUsers = ({ search = "", status = "", page, limit } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (page != null) params.set("page", String(page));
  if (limit != null) params.set("limit", String(limit));
  const qs = params.toString();
  return get(`/users${qs ? `?${qs}` : ""}`);
};

export const getUser = (id) => get(`/users/${id}`);
export const createUser = (payload) => post("/users", payload);
export const updateUser = (id, payload) => patch(`/users/${id}`, payload);
export const deleteUser = (id) => del(`/users/${id}`);

// Status / activity actions
export const setUserStatus = (id, { status, active_duration_seconds } = {}) =>
  post(`/users/${id}/status`, { status, active_duration_seconds });

// Per-user metrics/history
export const getUserMetrics = (id, { start, end, includeRunning = true }) => {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  params.set("includeRunning", includeRunning ? "1" : "0");
  return get(`/users/${id}/metrics?${params.toString()}`);
};

export const getUserHistory = (id, { start, end, limit = 1000 } = {}) => {
  const params = new URLSearchParams();
  if (start && end) {
    params.set("start", start);
    params.set("end", end);
  }
  params.set("limit", String(limit));
  return get(`/users/${id}/history?${params.toString()}`);
};

export const getUserOvertime = (id, { start, end } = {}) => {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  return get(`/users/${id}/overtime?${params.toString()}`);
};

// Media
export const getUserScreenshots = (id, { limit = 50 } = {}) =>
  get(
    `/users/${id}/screenshots?${new URLSearchParams({ limit: String(limit) })}`,
  );

export const getUserRecordings = (id, { limit = 20 } = {}) =>
  get(
    `/users/${id}/recordings?${new URLSearchParams({ limit: String(limit) })}`,
  );
