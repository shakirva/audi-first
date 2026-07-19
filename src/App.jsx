import { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Calendar from "./pages/Calendar";
import Customers from "./pages/Customers";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Expenses from "./pages/Expenses";
import PublicBooking from "./pages/PublicBooking";
import Login from "./pages/Login";
import SuperAdminTenants from "./pages/SuperAdminTenants";
import { BookingsProvider } from "./context/BookingsContext";
import { RoleProvider, useRole } from "./context/RoleContext";
import { usePWA } from "./hooks/usePWA";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import OfflineBanner from "./components/OfflineBanner";

const pageTitles = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/calendar": "Calendar",
  "/customers": "Customers",
  "/payments": "Payments",
  "/reports": "Reports",
  "/expenses": "Expenses",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

// Guard: redirects to dashboard if current role lacks permission
function ProtectedRoute({ permission, children }) {
  const { can } = useRole();
  return can(permission) ? children : <Navigate to="/" replace />;
}

function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = pageTitles[location.pathname] || "Venueza";

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "#F0F4EF", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="hm-main-content" style={{ flex: 1, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/payments"  element={<ProtectedRoute permission="canViewPayments"><Payments /></ProtectedRoute>} />
            <Route path="/reports"   element={<ProtectedRoute permission="canViewReports"><Reports /></ProtectedRoute>} />
            <Route path="/expenses"  element={<ProtectedRoute permission="canViewReports"><Expenses /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute permission="canViewSettings"><Settings /></ProtectedRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/superadmin/tenants" element={<ProtectedRoute permission="canManageTenants"><SuperAdminTenants /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

// Gate: shows Login if not authenticated, otherwise shows the admin shell
function AppGate() {
  const { isLoggedIn } = useRole();
  if (!isLoggedIn) return <Login />;
  return (
    <Routes>
      <Route path="/book/:slug" element={<PublicBooking />} />
      <Route path="/*" element={<AdminLayout />} />
    </Routes>
  );
}



export default function App() {
  const { isOnline, isInstallable, hasUpdate, installApp, applyUpdate, dismissUpdate } = usePWA();

  return (
    <>
      {!isOnline && <OfflineBanner />}
      {isInstallable && <PWAInstallPrompt onInstall={installApp} onDismiss={() => {}} />}
      {hasUpdate && <PWAUpdatePrompt onUpdate={applyUpdate} onDismiss={dismissUpdate} />}
      
      <RoleProvider>
        <BookingsProvider>
          <Routes>
            <Route path="/book/:slug" element={<PublicBooking />} />
            {/* Main app */}
            <Route path="/*" element={<AppGate />} />
          </Routes>
        </BookingsProvider>
      </RoleProvider>
    </>
  );
}
