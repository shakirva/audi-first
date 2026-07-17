import { WifiOff } from "lucide-react";

/**
 * OfflineBanner — Persistent banner when user loses internet
 */
export default function OfflineBanner() {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9998,
      background: "linear-gradient(90deg, #991b1b, #b91c1c)",
      padding: "10px 20px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontFamily: "'DM Sans', sans-serif",
      animation: "fadeUp 0.3s ease",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
    }}>
      <WifiOff size={15} color="#fecaca" />
      <span style={{ fontSize: 12, fontWeight: 600, color: "#fecaca" }}>
        You're offline — Some features may be unavailable
      </span>
      <button onClick={() => window.location.reload()} style={{
        padding: "4px 14px", borderRadius: 6, border: "1px solid rgba(254,202,202,0.3)",
        background: "rgba(255,255,255,0.1)", color: "#fecaca",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        marginLeft: 8,
      }}>
        Retry
      </button>
    </div>
  );
}
