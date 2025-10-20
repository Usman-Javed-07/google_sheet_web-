import React from "react";
import { useParams } from "react-router-dom";
import { format, addDays, isBefore, startOfToday, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import ActivityChart from "@/components/Activity/ActivityChart";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  getUser, getUsers, getUserHistory, getUserScreenshots, getUserRecordings,
} from "@/api/admin";
import { MEDIA_BASE } from "@/api/client";

const toYmd = (d) => format(d, "yyyy-MM-dd");
function initials(name = "", username = "") {
  const n = name?.trim() || username?.trim() || "U";
  const p = n.split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
}

export default function ActivityDetails() {
  const { id } = useParams();
  const uid = Number(id);

  const [user, setUser] = React.useState(null);
  const [period, setPeriod] = React.useState("week"); // default to week for a nicer chart
  const [start, setStart] = React.useState(toYmd(startOfWeek(new Date(), { weekStartsOn: 1 })));
  const [end, setEnd] = React.useState(toYmd(endOfWeek(new Date(), { weekStartsOn: 1 })));

  const [historyRows, setHistoryRows] = React.useState([]);
  const [screens, setScreens] = React.useState([]);
  const [recs, setRecs] = React.useState([]);

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
        setUser(data.find((u) => Number(u.id) === uid) || null);
      } catch {
        setUser(null);
      }
    }
  }, [uid]);

  const loadHistory = React.useCallback(async () => {
    try {
      const { data = [] } = await getUserHistory(uid, { start, end, limit: 2000 });
      setHistoryRows(data);
    } catch {
      setHistoryRows([]);
    }
  }, [uid, start, end]);

  const loadMedia = React.useCallback(async () => {
    try {
      const s = await getUserScreenshots(uid, { limit: 100 });
      const r = await getUserRecordings(uid, { limit: 50 });
      setScreens(s?.data || []);
      setRecs(r?.data || []);
    } catch {
      setScreens([]); setRecs([]);
    }
  }, [uid]);

  React.useEffect(() => {
    Promise.all([loadUser(), loadHistory(), loadMedia()]).then(() => {});
  }, [loadUser, loadHistory, loadMedia]);

  // Build chart data (per day buckets): active = sum of 'inactive' + 'break_start'; inactive = sum of 'active'
  const chartData = React.useMemo(() => {
    // init buckets
    const map = new Map();
    let d = new Date(start);
    const endD = new Date(end);
    while (!isBefore(endD, d)) {
      const key = toYmd(d);
      map.set(key, { key, label: format(d, "MMM d"), activeMin: 0, inactiveMin: 0 });
      d = addDays(d, 1);
    }
    for (const row of historyRows) {
      const type = String(row.event_type || "").toLowerCase();
      const secs = Number(row.active_duration_seconds || 0);
      const k = toYmd(new Date(row.occurred_at));
      if (!map.has(k)) continue;
      if (type === "inactive" || type === "break_start") {
        map.get(k).activeMin += Math.round(secs / 60);
      } else if (type === "active") {
        map.get(k).inactiveMin += Math.round(secs / 60);
      }
    }
    return Array.from(map.values());
  }, [historyRows, start, end]);

  const st = String(user?.status || "off").toLowerCase();
  const badgeCls =
    st === "active" ? "bg-green-500/10 text-green-600" :
    st === "inactive" ? "bg-red-500/10 text-red-600" :
    st === "break_start" ? "bg-amber-500/10 text-amber-600" :
    st === "absent" ? "bg-red-500/10 text-red-700 border border-red-200" :
    "bg-slate-200 text-slate-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.image_url || ""} alt={user?.name || ""} />
            <AvatarFallback>{initials(user?.name, user?.username)}</AvatarFallback>
          </Avatar>
        <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-lg font-semibold">{user?.name || "—"}</div>
              <Badge className={`h-6 px-2 ${badgeCls}`}>{st}</Badge>
            </div>
            <div className="truncate text-sm text-muted-foreground">
              @{user?.username} • {user?.department} • {user?.email}
            </div>
            <div className="text-xs text-muted-foreground">
              Shift: {user?.shift_start_time || "—"} — {user?.shift_end_time || "—"}
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
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
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        )}
      </div>

      {/* Chart */}
      <ActivityChart data={chartData} />

      {/* Screenshots */}
      <Card className="p-4">
        <div className="mb-2 text-base font-semibold">Screenshots</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>taken_at</TableHead>
                <TableHead>url</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {screens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No screenshots
                  </TableCell>
                </TableRow>
              ) : (
                screens.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{new Date(s.taken_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <a className="text-blue-600 underline" href={s.url?.startsWith("http") ? s.url : `${MEDIA_BASE}/${s.url}`} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Recordings */}
      <Card className="p-4">
        <div className="mb-2 text-base font-semibold">Recordings</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>recorded_at</TableHead>
                <TableHead>url</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No recordings
                  </TableCell>
                </TableRow>
              ) : (
                recs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.recorded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <a className="text-blue-600 underline" href={r.url?.startsWith("http") ? r.url : `${MEDIA_BASE}/${r.url}`} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}