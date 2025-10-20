import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createUser } from "@/api/admin";

function toHMS(v) {
  const s = (v || "").trim();
  if (!s) return "";
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return s;
  const hh = String(Math.min(23, parseInt(m[1], 10))).padStart(2, "0");
  const mm = String(Math.min(59, parseInt(m[2], 10))).padStart(2, "0");
  const ss = String(m[3] ? Math.min(59, parseInt(m[3], 10)) : 0).padStart(
    2,
    "0",
  );
  return `${hh}:${mm}:${ss}`;
}

export default function CreateEmployeeDialog({
  open,
  onOpenChange,
  onCreated,
}) {
  const [loading, setLoading] = React.useState(false);
  const [showBreaks, setShowBreaks] = React.useState(false);

  const [form, setForm] = React.useState({
    username: "",
    name: "",
    department: "",
    email: "",
    password: "",
    confirm: "",
    shift_start_time: "09:00:00",
    shift_end_time: "18:00:00",
    break_start_time: "",
    break_end_time: "",
    break_minutes: "",
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.username ||
      !form.name ||
      !form.department ||
      !form.email ||
      !form.password
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    const payload = {
      username: form.username.trim(),
      name: form.name.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      password: form.password,
      shift_start_time: toHMS(form.shift_start_time || "09:00:00"),
      shift_end_time: toHMS(form.shift_end_time || "18:00:00"),
    };

    if (showBreaks) {
      if (form.break_start_time)
        payload.break_start_time = toHMS(form.break_start_time);
      if (form.break_end_time)
        payload.break_end_time = toHMS(form.break_end_time);
      if (form.break_minutes)
        payload.break_minutes = Number(form.break_minutes) || 0;
    }

    setLoading(true);
    try {
      const res = await createUser(payload);
      toast.success("Employee created");
      onOpenChange?.(false);
      onCreated?.(res?.data || null);
      setForm({
        username: "",
        name: "",
        department: "",
        email: "",
        password: "",
        confirm: "",
        shift_start_time: "09:00:00",
        shift_end_time: "18:00:00",
        break_start_time: "",
        break_end_time: "",
        break_minutes: "",
      });
    } catch (err) {
      const msg = String(err?.message || "create_failed");
      toast.error(
        msg === "username_or_email_exists"
          ? "Username or email already exists"
          : "Failed to create user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0 w-screen h-screen max-w-none max-h-none
          rounded-none border-0
          bg-background text-foreground
          overflow-hidden
        "
      >
        {/* Sticky Header with larger horizontal padding */}
        <div className="flex items-center justify-between border-b px-8 py-4">
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl sm:text-2xl">
              Add Employee
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              form="create-employee-form"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>

        {/* Scrollable Content with gutters */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto px-6 sm:px-8 py-6">
          <form
            id="create-employee-form"
            onSubmit={submit}
            className="mx-auto w-full max-w-6xl space-y-8"
          >
            {/* Section: Identity */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Identity</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={update("username")}
                    placeholder="areeba09"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Areeba Ali"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={update("department")}
                    placeholder="HR / Backend"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Section: Account */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Account</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={update("confirm")}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Section: Shift */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Shift</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBreaks((v) => !v)}
                >
                  {showBreaks ? "Hide breaks" : "Add breaks"}
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="shift_start_time">
                    Shift Start (HH:MM[:SS])
                  </Label>
                  <Input
                    id="shift_start_time"
                    value={form.shift_start_time}
                    onChange={update("shift_start_time")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift_end_time">Shift End (HH:MM[:SS])</Label>
                  <Input
                    id="shift_end_time"
                    value={form.shift_end_time}
                    onChange={update("shift_end_time")}
                  />
                </div>

                {showBreaks && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="break_start_time">
                        Break Start (optional)
                      </Label>
                      <Input
                        id="break_start_time"
                        value={form.break_start_time}
                        onChange={update("break_start_time")}
                        placeholder="13:00 or 13:00:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="break_end_time">
                        Break End (optional)
                      </Label>
                      <Input
                        id="break_end_time"
                        value={form.break_end_time}
                        onChange={update("break_end_time")}
                        placeholder="13:30 or 13:30:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="break_minutes">
                        Break Minutes (fallback)
                      </Label>
                      <Input
                        id="break_minutes"
                        type="number"
                        min={0}
                        value={form.break_minutes}
                        onChange={update("break_minutes")}
                        placeholder="e.g., 60"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Footer with larger horizontal padding */}
        <DialogFooter className="border-t px-8 py-4">
          <div className="ml-auto flex items-center gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="create-employee-form"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
