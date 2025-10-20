import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Users, Activity } from "lucide-react";

const ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  { key: "employees", label: "Employees", to: "/employees", icon: Users },
  { key: "activity", label: "Activity", to: "/activity", icon: Activity },
];

export default function Sidebar() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const activeKey =
    ITEMS.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
      ?.key ||
    (pathname.startsWith("/employees")
      ? "employees"
      : pathname.startsWith("/dashboard")
        ? "dashboard"
        : "dashboard");

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-gradient-to-b from-violet-50 to-cyan-50 shadow-lg">
      <ScrollArea className="flex-1">
        <div className="p-4 text-lg font-bold text-gray-800 mb-4">
          Mars Idle Tracker
        </div>
        <nav className="space-y-1">
          {ITEMS.map((item) => {
            const isActive = item.key === activeKey;
            const Icon = item.icon;
            return (
              <Button
                key={item.key}
                variant="ghost"
                aria-current={isActive ? "page" : undefined}
                className={`
                  group flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/70"
                  }
                `}
                onClick={() => nav(item.to)}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`}
                  aria-hidden="true"
                />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="my-2" />
      <div className="p-3 text-xs text-gray-500 flex flex-col gap-0.5">
        <div>Idle Tracker • Admin</div>
        <div>v1.0.0</div>
      </div>
    </aside>
  );
}
