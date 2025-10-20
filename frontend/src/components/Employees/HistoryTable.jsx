import React from "react";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";

function hhmmss(s = 0) {
  const n = Math.max(0, Number(s) || 0);
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const sec = n % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export default function HistoryTable({ rows }) {
  const data = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 pb-0">
        <h3 className="text-base font-semibold">Inactivity</h3>
        <p className="text-sm text-muted-foreground">Only ‘inactive’ events for the selected period.</p>
      </div>
      <div className="overflow-x-auto p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Occurred at</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No inactivity recorded.
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id} className="bg-red-50/40">
                  <TableCell className="capitalize">{r.event_type}</TableCell>
                  <TableCell>{new Date(r.occurred_at).toLocaleString()}</TableCell>
                  <TableCell>{hhmmss(r.active_duration_seconds)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}