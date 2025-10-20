import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function ActivityChart({ data = [] }) {
  // Normalize data
  const rows = React.useMemo(() => {
    return (Array.isArray(data) ? data : []).map((d) => ({
      label: d.label || "",
      activeMin: parseFloat(d.activeMin) || 0,
      inactiveMin: parseFloat(d.inactiveMin) || 0,
    }));
  }, [data]);

  console.log("Chart data:", rows); // 👈 check this in browser console

  // Calculate max value
  const maxValue = React.useMemo(() => {
    const max = Math.max(
      ...rows.map((r) => Math.max(r.activeMin, r.inactiveMin, 0)),
    );
    return max > 0 ? Math.ceil(max * 1.1) : 10; // padding or min 10
  }, [rows]);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 text-base font-semibold">Active vs Inactive</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" />
          <YAxis
            tickFormatter={(v) => `${v}m`}
            domain={[0, maxValue]}
            width={50}
          />
          <Tooltip formatter={(v, n) => [`${v} min`, n]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="activeMin"
            name="Active (min)"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="inactiveMin"
            name="Inactive (min)"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
