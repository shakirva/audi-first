import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { PERMISSIONS } from "./rolePermissions";

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hm_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [tenant, setTenant] = useState(() => {
    try {
      const stored = localStorage.getItem("hm_tenant");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [activeEnvironment, setActiveEnvironmentState] = useState(() => {
    return sessionStorage.getItem("hm_environment") || "production";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("hm_token"));

  const role = user?.role || "Owner";

  // Owner-controlled toggle: can Manager see revenue/payments/reports?
  const [managerRevenueEnabled, setManagerRevenueEnabledState] = useState(
    () => localStorage.getItem("hm_mgr_revenue") !== "false"
  );

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("hm_token");
    if (token && !user) {
      authAPI.getMe()
        .then(({ data }) => {
          setUser(data.user);
          setTenant(data.tenant);
          localStorage.setItem("hm_user", JSON.stringify(data.user));
          if (data.tenant) localStorage.setItem("hm_tenant", JSON.stringify(data.tenant));
        })
        .catch(() => {
          // Token invalid — clear and stay logged out
          localStorage.removeItem("hm_token");
          localStorage.removeItem("hm_user");
          localStorage.removeItem("hm_tenant");
          setIsLoggedIn(false);
        });
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem("hm_token", data.token);
      localStorage.setItem("hm_user", JSON.stringify(data.user));
      if (data.tenant) localStorage.setItem("hm_tenant", JSON.stringify(data.tenant));
      const defaultEnv = data.user.role === "Tester" ? "sandbox" : "production";
      sessionStorage.setItem("hm_environment", defaultEnv);
      setUser(data.user);
      setTenant(data.tenant);
      setActiveEnvironmentState(defaultEnv);
      setIsLoggedIn(true);
      return { ok: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    localStorage.removeItem("hm_tenant");
    sessionStorage.removeItem("hm_environment");
    localStorage.removeItem("hm_logged_in");
    localStorage.removeItem("hm_role");
    
    // Clear PWA Caches for security
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg.active) reg.active.postMessage("CLEAR_CACHES");
      }
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
    } catch (e) {
      console.error("Failed to clear PWA cache:", e);
    }
    
    setUser(null);
    setTenant(null);
    setActiveEnvironmentState("production");
    setIsLoggedIn(false);
  };

  const switchEnvironment = (env) => {
    sessionStorage.setItem("hm_environment", env);
    setActiveEnvironmentState(env);
    // Reload page to reset all queries and state safely
    window.location.reload();
  };

  const setManagerRevenueEnabled = (val) => {
    localStorage.setItem("hm_mgr_revenue", val ? "true" : "false");
    setManagerRevenueEnabledState(val);
  };

  const can = (permission) => {
    if (role === "Manager" && !managerRevenueEnabled) {
      if (["canViewRevenue", "canViewPayments", "canViewReports"].includes(permission)) {
        return false;
      }
    }
    return PERMISSIONS[role]?.[permission] ?? false;
  };

  return (
    <RoleContext.Provider value={{
      role,
      user,
      tenant,
      isLoggedIn,
      activeEnvironment,
      switchEnvironment,
      login,
      logout,
      can,
      managerRevenueEnabled,
      setManagerRevenueEnabled,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
