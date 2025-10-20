// src/api/client.js
const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8080/api/admin").replace(/\/+$/, "");
export const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE || "http://localhost:8080/media").replace(/\/+$/, "");

const isFormData = (v) => typeof FormData !== "undefined" && v instanceof FormData;

export async function api(path, opts = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const { method = "GET", body, headers = {}, ...rest } = opts;

  const init = { method, credentials: "include", headers: { ...headers }, ...rest };

  if (body !== undefined) {
    if (isFormData(body)) {
      init.body = body; // browser sets Content-Type
    } else if (typeof body === "object" && !(body instanceof Blob)) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    } else {
      init.body = body;
    }
  } else {
    init.headers["Content-Type"] ??= "application/json";
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("network_error");
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json?.error || res.statusText || "request_failed");
  return json;
}

export const get = (p, o) => api(p, { ...o, method: "GET" });
export const post = (p, b, o) => api(p, { ...o, method: "POST", body: b });
export const patch = (p, b, o) => api(p, { ...o, method: "PATCH", body: b });
export const del = (p, o) => api(p, { ...o, method: "DELETE" });