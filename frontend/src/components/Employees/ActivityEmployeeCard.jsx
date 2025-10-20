import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const statusMap = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600" },
  inactive: { label: "Inactive", className: "bg-red-500/10 text-red-600" },
  off: { label: "Off", className: "bg-slate-200 text-slate-700" },
  break_start: { label: "On break", className: "bg-amber-500/10 text-amber-600" },
  break_end: { label: "Break ended", className: "bg-amber-500/10 text-amber-700" },
  absent: { label: "Absent", className: "bg-red-500/10 text-red-700 border border-red-200" },
};

function initials(name = "", username = "") {
  const n = name?.trim() || username?.trim() || "U";
  const p = n.split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
}

export default function ActivityEmployeeCard({ user, onViewActivity }) {
  const s = (user.status || "off").toLowerCase();
  const m = statusMap[s] || statusMap.off;

  return (
    <Card className="p-4 flex items-center gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.image_url || ""} alt={user.name} />
        <AvatarFallback>{initials(user.name, user.username)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{user.name}</div>
          <Badge className={`h-5 px-2 text-xs ${m.className}`}>{m.label}</Badge>
        </div>
        <div className="truncate text-sm text-muted-foreground">
          @{user.username} • {user.department}
        </div>
        <div className="text-xs text-muted-foreground">
          Shift: {user.shift_start_time} — {user.shift_end_time}
        </div>
      </div>
      <Button variant="outline" onClick={() => onViewActivity?.(user.id)}>View activity</Button>
    </Card>
  );
}