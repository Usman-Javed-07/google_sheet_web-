import React from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";
import { Outlet, useNavigate } from "react-router-dom";
import CreateEmployeeDialog from "@/components/Employees/CreateEmployeeDialog";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [active, setActive] = React.useState("dashboard");
  const [addOpen, setAddOpen] = React.useState(false);
  const nav = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="flex min-h-svh flex-col">
        <Header
          admin={user || { name: "Admin", email: "admin@example.com" }}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSearchChange={(q) => console.log("search:", q)}
          onSearchSubmit={(q) => console.log("submit:", q)}
          onAddUser={() => setAddOpen(true)}
          onUpdateProfile={() => toast.info("Open Profile")}
          onLogout={async () => {
            await signOut();
            window.location.href = "/login";
          }}
        />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <Sidebar active={active} onNavigate={setActive} />
          </div>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <CreateEmployeeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          // After creating a user, navigate to Employees and optionally refresh
          toast.success("Employee created");
          nav("/employees");
        }}
      />
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar
            active={active}
            onNavigate={(k) => {
              setActive(k);
              setSidebarOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
