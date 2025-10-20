import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getUsers } from "@/api/admin";
import ActivityEmployeeCard from "@/components/Employees/ActivityEmployeeCard";

export default function ActivityIndex() {
  const nav = useNavigate();
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const { data = [] } = await getUsers({ search, status });
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(`Failed to load employees: ${err?.message || "request_failed"}`);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  React.useEffect(() => {
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name, username, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
        <Select value={status} onValueChange={(v) => setStatus(v === "any" ? "" : v)}>
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
          <Button variant="outline" onClick={() => { setSearch(""); setStatus(""); }}>Clear</Button>
          <Button onClick={load}>Search</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No employees found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => (
            <ActivityEmployeeCard
              key={u.id}
              user={u}
              onViewActivity={(id) => nav(`/activity/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}