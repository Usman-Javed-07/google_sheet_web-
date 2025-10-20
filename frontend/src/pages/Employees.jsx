import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import EmployeeCard from "@/components/Employees/EmployeeCard";
import { getUsers } from "@/api/admin";

export default function Employees() {
  const nav = useNavigate();

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const { data = [] } = await getUsers({ search, status });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(
        `Failed to load employees: ${e?.message || "request_failed"}`,
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  // Initial load + react to filters (debounced)
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  // Lightweight polling for live status (every 3s)
  React.useEffect(() => {
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [load]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") load();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name, username, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          className="sm:w-72"
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v === "any" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status: Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="off">off</SelectItem>
            <SelectItem value="shift_start">shift_start</SelectItem>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="inactive">inactive</SelectItem>
            <SelectItem value="break_start">break_start</SelectItem>
            <SelectItem value="break_end">break_end</SelectItem>
            <SelectItem value="absent">absent</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
          <Button onClick={load}>Search</Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No employees found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => (
            <EmployeeCard
              key={u.id}
              user={u}
              onView={(id) => nav(`/employees/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
