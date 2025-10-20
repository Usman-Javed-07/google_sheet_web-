// src/pages/EmployeeDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  isToday,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import MetricsStrip from "@/components/Employees/MetricsStrip";
import HistoryTable from "@/components/Employees/HistoryTable";
import { getUser, getUsers, getUserMetrics, getUserHistory } from "@/api/admin";

const statusMap = {
  active: { label: "Active", cls: "bg-green-500/10 text-green-600" },
  inactive: { label: "Inactive", cls: "bg-red-500/10 text-red-600" },
  off: { label: "Off", cls: "bg-slate-200 text-slate-700" },
  break_start: { label: "On break", cls: "bg-amber-500/10 text-amber-600" },
  break_end: { label: "Break ended", cls: "bg-amber-500/10 text-amber-700" },
  absent: {
    label: "Absent",
    cls: "bg-red-500/10 text-red-700 border border-red-200",
  },
};

function initials(name = "", username = "") {
  const n = name?.trim() || username?.trim() || "U";
  const p = n.split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : n.slice(0, 2).toUpperCase();
}
const toYmd = (d) => format(d, "yyyy-MM-dd");

export default function EmployeeDetails() {
  const { id } = useParams();
  const uid = Number(id);
  const nav = useNavigate();

  const [user, setUser] = React.useState(null);
  const [metrics, setMetrics] = React.useState(null);
  const [hist, setHist] = React.useState([]);
  const [period, setPeriod] = React.useState("today");
  const [start, setStart] = React.useState(toYmd(startOfToday()));
  const [end, setEnd] = React.useState(toYmd(new Date()));
  const [deleting, setDeleting] = React.useState(false);

  // Update start/end when period changes
  React.useEffect(() => {
    const now = new Date();
    if (period === "today") {
      setStart(toYmd(startOfToday()));
      setEnd(toYmd(now));
    } else if (period === "week") {
      setStart(toYmd(startOfWeek(now, { weekStartsOn: 1 })));
      setEnd(toYmd(endOfWeek(now, { weekStartsOn: 1 })));
    } else if (period === "month") {
      setStart(toYmd(startOfMonth(now)));
      setEnd(toYmd(endOfMonth(now)));
    }
  }, [period]);

  const loadUser = React.useCallback(async () => {
    try {
      const res = await getUser(uid);
      setUser(res?.data || null);
    } catch {
      try {
        const { data = [] } = await getUsers();
        const found = data.find((u) => Number(u.id) === uid) || null;
        setUser(found);
      } catch {
        setUser(null);
      }
    }
  }, [uid]);

  const fetchMetrics = React.useCallback(async () => {
    try {
      const include = isToday(new Date(start)) || isToday(new Date(end));
      const { data } = await getUserMetrics(uid, {
        start,
        end,
        includeRunning: include,
      });
      setMetrics(data || null);
    } catch {
      setMetrics(null);
    }
  }, [uid, start, end]);

  const fetchHistory = React.useCallback(async () => {
    try {
      const { data = [] } = await getUserHistory(uid, {
        start,
        end,
        limit: 1000,
      });
      setHist(
        data.filter((r) => (r.event_type || "").toLowerCase() === "inactive"),
      );
    } catch {
      setHist([]);
    }
  }, [uid, start, end]);

  React.useEffect(() => {
    Promise.all([loadUser(), fetchMetrics(), fetchHistory()]).catch(() => {});
  }, [loadUser, fetchMetrics, fetchHistory]);

  React.useEffect(() => {
    const now = new Date();
    const isTodayRange =
      isToday(new Date(start)) ||
      isToday(new Date(end)) ||
      toYmd(now) === start ||
      toYmd(now) === end;
    if (!isTodayRange) return;
    const i1 = setInterval(fetchMetrics, 2500);
    const i2 = setInterval(loadUser, 2500);
    const i3 = setInterval(fetchHistory, 10000);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
    };
  }, [start, end, loadUser, fetchMetrics, fetchHistory]);

  const st = String(user?.status || "off").toLowerCase();
  const badge = statusMap[st] || statusMap.off;

  // Delete handler (fetch + confirm)
  const onDelete = async () => {
    const ok = window.confirm("Delete this employee permanently?");
    if (!ok) return;

    const API =
      (import.meta.env && import.meta.env.VITE_API_URL) ||
      "http://localhost:3000/api/admin";
    try {
      setDeleting(true);
      const res = await fetch(`${API}/users/${uid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          res.statusText ||
          "request_failed";
        throw new Error(msg);
      }
      // Inform list and navigate back
      window.dispatchEvent(
        new CustomEvent("employee:deleted", { detail: { id: uid } }),
      );
      nav("/employees");
    } catch (e) {
      // You can swap this alert for your toast if you prefer
      alert(`Delete failed: ${e.message || "request_failed"}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header card */}
      <Card className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-violet-50 to-cyan-50 shadow-lg rounded-3xl border border-gray-200">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image_url || ""} alt={user?.name || ""} />
          <AvatarFallback>
            {initials(user?.name, user?.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-xl font-bold text-gray-800">
              {user?.name || "—"}
            </h2>
            <Badge className={`h-6 px-3 rounded-full ${badge.cls} font-medium`}>
              {badge.label}
            </Badge>
          </div>
          <div className="truncate text-sm text-gray-500 mt-1">
            @{user?.username} • {user?.department || "—"} • {user?.email || "—"}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Shift: {user?.shift_start_time || "—"} —{" "}
            {user?.shift_end_time || "—"}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="py-2 rounded-lg border border-gray-300 shadow-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <Input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="py-2 rounded-lg border border-gray-300 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Metrics */}
      <MetricsStrip
        metrics={metrics}
        className="bg-gradient-to-r from-violet-50 to-cyan-50 rounded-2xl p-4 shadow-inner"
      />

      {/* Inactivity history */}
      <Card className="p-4 bg-white/80 shadow-lg rounded-2xl border border-gray-200">
        <HistoryTable rows={hist} className="rounded-xl overflow-hidden" />
      </Card>

      {/* Floating Delete button (bottom-right, wide) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onDelete}
          disabled={deleting}
          className="
            w-44 md:w-48 px-6 py-3 rounded-lg
            bg-red-600 text-white font-medium shadow-lg
            hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="Delete this employee"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
