import { RefreshCw, X } from "lucide-react";

/**
 * PWAUpdatePrompt — Notification when a new version is available
 */
export default function PWAUpdatePrompt({ onUpdate, onDismiss }) {
  return (
    <div style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, maxWidth: 420, width: "calc(100% - 32px)",
      background: "linear-gradient(135deg, #1B4332, #2D6A4F)",
      borderRadius: 14, padding: "16px 20px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,160,23,0.15)",
      fontFamily: "'DM Sans', sans-serif",
      animation: "fadeUp 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <RefreshCw size={18} color="#D4A017" />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>
            New version available
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "2px 0 0 0" }}>
            A new version of Venueza is ready to install.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onDismiss} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent", color: "rgba(255,255,255,0.6)",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Later
          </button>
          <button onClick={onUpdate} style={{
            padding: "7px 14px", borderRadius: 8, border: "none",
            background: "#D4A017", color: "#0D2418",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 2px 8px rgba(212,160,23,0.3)",
          }}>
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
