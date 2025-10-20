import React from "react";
import InactivityTable from "./InactivityTable";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI strip can go here later */}
      <InactivityTable />
    </div>
  );
}