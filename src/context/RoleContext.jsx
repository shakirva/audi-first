import { createContext, useContext, useState } from "react";
import { PERMISSIONS, CREDENTIALS } from "./rolePermissions";

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("hm_role") || "Owner");
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("hm_logged_in") === "true");

  // Owner-controlled toggle: can Manager see revenue/payments/reports?
  const [managerRevenueEnabled, setManagerRevenueEnabledState] = useState(
    () => localStorage.getItem("hm_mgr_revenue") !== "false"
  );

  // Owner-controlled toggle: show/hide test bookings in reports & counts
  const [hideTestBookings, setHideTestBookingsState] = useState(
    () => localStorage.getItem("hm_hide_test_bookings") === "true"
  );

  const login = (selectedRole, password) => {
    if (CREDENTIALS[selectedRole] && CREDENTIALS[selectedRole] === password) {
      localStorage.setItem("hm_role", selectedRole);
      localStorage.setItem("hm_logged_in", "true");
      setRole(selectedRole);
      setIsLoggedIn(true);
      return { ok: true };
    }
    return { ok: false, error: "Incorrect password. Please try again." };
  };

  const logout = () => {
    localStorage.removeItem("hm_logged_in");
    localStorage.removeItem("hm_role");
    setIsLoggedIn(false);
    setRole("Owner");
  };

  const setManagerRevenueEnabled = (val) => {
    localStorage.setItem("hm_mgr_revenue", val ? "true" : "false");
    setManagerRevenueEnabledState(val);
  };

  const setHideTestBookings = (val) => {
    localStorage.setItem("hm_hide_test_bookings", val ? "true" : "false");
    setHideTestBookingsState(val);
  };

  const can = (permission) => {
    // Owner can override Manager's revenue-related access
    if (role === "Manager" && !managerRevenueEnabled) {
      if (["canViewRevenue", "canViewPayments", "canViewReports"].includes(permission)) {
        return false;
      }
    }
    return PERMISSIONS[role]?.[permission] ?? false;
  };

  return (
    <RoleContext.Provider value={{ role, isLoggedIn, login, logout, can, managerRevenueEnabled, setManagerRevenueEnabled, hideTestBookings, setHideTestBookings }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
