import React from "react";
import { Card } from "@/components/ui/card";

function hhmmss(s = 0) {
  const n = Math.max(0, Number(s) || 0);
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const sec = n % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export default function MetricsStrip({ metrics }) {
  const items = [
    { label: "Worked", val: metrics?.worked_seconds, color: "text-green-600" },
    { label: "Inactive", val: metrics?.inactive_seconds, color: "text-red-600" },
    { label: "Break", val: metrics?.break_seconds, color: "text-amber-600" },
    { label: "Overtime", val: metrics?.overtime_seconds, color: "text-blue-600" },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((i) => (
        <Card key={i.label} className="p-4">
          <div className="text-sm text-muted-foreground">{i.label}</div>
          <div className={`mt-1 text-xl font-semibold ${i.color}`}>{hhmmss(i.val)}</div>
        </Card>
      ))}
    </div>
  );
}