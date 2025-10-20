import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminLayout from "@/Layouts/AdminLayout";
import Dashboard from "@/components/Dashboard/Dashboard";
import Employees from "@/pages/Employees";
import EmployeeDetails from "@/pages/EmployeeDetails";
import ActivityIndex from "@/pages/ActivityIndex";
import ActivityDetails from "@/pages/ActivityDetails";
import Login from "@/pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" closeButton />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
              <Route path="/activity" element={<ActivityIndex />} />
              <Route path="/activity/:id" element={<ActivityDetails />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
