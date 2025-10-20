import { post, get } from "./client";

export const loginAdmin = (login, password) =>
  post("/auth/login", { login, password }); // sets HttpOnly cookie

export const logoutAdmin = () => post("/auth/logout");

export const checkSession = () => get("/dashboard/stats"); // 200 if cookie valid