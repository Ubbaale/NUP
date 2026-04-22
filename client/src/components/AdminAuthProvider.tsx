import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

export type AdminRole = "super_admin" | "editor" | "viewer";

export interface AdminUserInfo {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUserInfo | null;
  role: AdminRole | null;
  hasRole: (...allowed: AdminRole[]) => boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

async function fetchMe(): Promise<AdminUserInfo | null> {
  const res = await fetch("/api/admin/me", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const check = await fetch("/api/admin/check", { credentials: "include" }).then(r => r.json());
      if (check.authenticated) {
        const me = await fetchMe();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/admin/login", { username, password });
      if (res.ok) {
        const me = await fetchMe();
        setUser(me);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    setUser(null);
  };

  const hasRole = (...allowed: AdminRole[]) => {
    if (!user) return false;
    return allowed.includes(user.role);
  };

  return (
    <AdminAuthContext.Provider value={{
      isAuthenticated: !!user,
      isLoading,
      user,
      role: user?.role ?? null,
      hasRole,
      login,
      logout,
      refresh,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
