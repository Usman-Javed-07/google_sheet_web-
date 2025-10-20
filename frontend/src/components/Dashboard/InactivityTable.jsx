import React from "react";
import { toast } from "sonner";
import { getUnnotifiedEvents } from "@/api/admin";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";

function minsSince(ts) {
  const diffMs = Date.now() - new Date(ts).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

export default function InactivityTable() {
  const [rows, setRows] = React.useState([]);
  const errorToastAt = React.useRef(0); // throttle error toasts

  React.useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const { data = [] } = await getUnnotifiedEvents();
        const items = (data || []).filter((e) => e.event_type === "inactive");
        if (!mounted) return;
        setRows((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          for (const ev of items) if (!map.has(ev.id)) map.set(ev.id, ev);
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
          );
        });
      } catch (e) {
        // Handle fetch errors and silence ESLint
        console.error("Inactive events poll failed:", e);
        const now = Date.now();
        if (now - errorToastAt.current > 15000) {
          toast.error("Failed to load inactive events. Retrying…");
          errorToastAt.current = now;
        }
      }
    };
    tick();
    const i = setInterval(tick, 2000);
    return () => {
      mounted = false;
      clearInterval(i);
    };
  }, []);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Recent Inactive Employees</h2>
        <p className="text-sm text-muted-foreground">
          New rows appear as employees go inactive.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inactive (min)</TableHead>
              <TableHead>At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No inactive events yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name} (@{r.username})</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell className="capitalize">{r.event_type}</TableCell>
                  <TableCell>{minsSince(r.occurred_at)}</TableCell>
                  <TableCell>{new Date(r.occurred_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}