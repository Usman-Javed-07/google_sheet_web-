import React from "react";
import { AuthCtx } from "./useAuth";
import { loginAdmin, logoutAdmin, checkSession } from "@/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("idle_admin") || "null"); }
    catch { return null; }
  });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    checkSession()
      .then(() => { if (mounted) setReady(true); })
      .catch(() => { if (mounted) { setUser(null); setReady(true); } });
    return () => { mounted = false; };
  }, []);

  const signIn = async ({ login, password }) => {
    const res = await loginAdmin(login, password);
    const admin = res?.data?.admin;
    setUser(admin);
    localStorage.setItem("idle_admin", JSON.stringify(admin));
    return admin;
  };

  const signOut = async () => {
    try { await logoutAdmin(); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem("idle_admin");
  };

  return (
    <AuthCtx.Provider value={{ user, ready, signIn, signOut, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}