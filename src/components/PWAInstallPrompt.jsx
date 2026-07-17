import { useState } from "react";
import { Download, X, Smartphone, Monitor, Check } from "lucide-react";
import Logo from "./Logo";

/**
 * PWAInstallPrompt — Beautiful branded install dialog
 * Shows when the app is installable (beforeinstallprompt fired)
 */
export default function PWAInstallPrompt({ onInstall, onDismiss }) {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await onInstall();
    if (accepted) {
      setInstalled(true);
      setTimeout(onDismiss, 2000);
    } else {
      setInstalling(false);
    }
  };

  if (installed) {
    return (
      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, background: "#1B4332", color: "#fff", padding: "14px 28px",
        borderRadius: 14, display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)", fontFamily: "'DM Sans', sans-serif",
        animation: "fadeUp 0.3s ease",
      }}>
        <Check size={18} color="#22c55e" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Venueza installed successfully! 🎉</span>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 16, right: 16, zIndex: 9999,
      maxWidth: 440, margin: "0 auto",
      background: "linear-gradient(135deg, #0D2418, #1B4332)",
      borderRadius: 20, padding: "22px 24px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,160,23,0.15)",
      fontFamily: "'DM Sans', sans-serif",
      animation: "fadeUp 0.4s ease",
    }}>
      {/* Close */}
      <button onClick={onDismiss} style={{
        position: "absolute", top: 12, right: 12, width: 28, height: 28,
        borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "rgba(255,255,255,0.5)",
      }}>
        <X size={14} />
      </button>

      {/* Content */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "transparent", 
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Logo size={52} />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0",
          }}>
            Install <span style={{ color: "#D4A017" }}>Venueza</span>
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
            Get instant access from your home screen. Works offline, launches faster.
          </p>

          {/* Platform badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20,
            }}>
              <Smartphone size={10} /> Mobile
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20,
            }}>
              <Monitor size={10} /> Desktop
            </span>
          </div>

          {/* Install button */}
          <button onClick={handleInstall} disabled={installing} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "#D4A017", color: "#0D2418",
            fontSize: 13, fontWeight: 700, cursor: installing ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            opacity: installing ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(212,160,23,0.3)",
            transition: "all 0.2s",
          }}>
            <Download size={15} />
            {installing ? "Installing..." : "Install App"}
          </button>
        </div>
      </div>
    </div>
  );
}
