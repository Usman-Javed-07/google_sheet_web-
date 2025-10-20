import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Toaster, toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, AtSign, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = React.useState({ login: "", password: "" });
  const [showPwd, setShowPwd] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      toast.error("Please enter login and password");
      return;
    }
    setLoading(true);
    try {
      await signIn(form);
      toast.success("Welcome back!");
      nav("/dashboard", { replace: true });
    } catch (err) {
      toast.error(`Invalid credentials: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#B33F3F] to-[#FF6B35] overflow-hidden">
      <Toaster richColors position="top-right" closeButton />

      {/* Main Login Card */}
      <Card className="w-full max-w-3xl rounded-3xl bg-white/95 dark:bg-neutral-900/90 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-black/30 p-12 flex flex-col md:flex-row gap-10">
        {/* Left Hero / Branding */}
        <div className="hidden md:flex flex-col justify-center w-1/2 px-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#B33F3F] mb-4">
            Mars Capital
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Idle Tracker Admin Panel
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
              Live employee status and activity
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#B33F3F]" />
              Screenshots and recordings in one place
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#FF9966]" />
              Time tracking with metrics and overtime
            </li>
          </ul>
          <p className="mt-8 text-sm text-muted-foreground italic">
            “Lead with discipline. Excellence follows.”
          </p>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold text-center">
              Admin Login
            </CardTitle>
            <p className="text-center text-muted-foreground mt-1">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {/* Username / Email */}
              <div className="space-y-1">
                <Label htmlFor="login">Username or Email</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {form.login.includes("@") ? (
                      <AtSign className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <Input
                    id="login"
                    type="text"
                    placeholder="admin or admin@example.com"
                    className="pl-10 py-4 rounded-xl border border-gray-300 dark:border-gray-700 text-lg"
                    value={form.login}
                    onChange={(e) =>
                      setForm({ ...form, login: e.target.value })
                    }
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 py-4 rounded-xl border border-gray-300 dark:border-gray-700 text-lg"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showPwd ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={remember} onCheckedChange={setRemember} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Contact admin to reset password")}
                  className="hover:underline text-primary"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-4 rounded-xl text-white text-lg font-semibold bg-gradient-to-r from-[#B33F3F] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF9966] shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms and Privacy Policy.
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
