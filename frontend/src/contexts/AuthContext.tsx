import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  canManageProducts: boolean;
  canManageCustomers: boolean;
  canManageOrders: boolean;
  canCreateOrders: boolean;
  canViewDashboard: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (u: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    setUser(u);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => (user ? roles.includes(user.role) : false);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!localStorage.getItem("access_token"),
    login,
    logout,
    hasRole,
    canManageProducts: hasRole("admin", "manager"),
    canManageCustomers: hasRole("admin", "manager"),
    canManageOrders: hasRole("admin", "manager"),
    canCreateOrders: hasRole("admin", "manager", "staff"),
    canViewDashboard: hasRole("admin", "manager"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
