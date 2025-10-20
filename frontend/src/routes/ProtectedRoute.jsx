import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function ProtectedRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;}