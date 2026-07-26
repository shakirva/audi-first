import { useState } from "react";
import { User, Lock, Save, X } from "lucide-react";
import { authAPI } from "../services/api";
import { useToast } from "./Toast";
import { useRole } from "../context/RoleContext";

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useRole();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return addToast("Name is required", "error");

    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      addToast("Profile updated successfully! ✅", "success");
      onClose();
    } catch (err) {
      addToast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const iStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111827",
    background: "#fff", outline: "none", fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", marginBottom: 16
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", width: 400, borderRadius: 20, overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
            Profile Settings
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <User size={13} /> Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={iStyle}
              onFocus={e => e.target.style.borderColor = "#1B4332"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Lock size={13} /> New Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank to keep current"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={iStyle}
              onFocus={e => e.target.style.borderColor = "#1B4332"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, background: "#f3f4f6", color: "#374151", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "#1B4332", color: "#fff", border: "none", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, boxShadow: "0 4px 12px rgba(27,67,50,0.2)" }}>
              {loading ? "Saving..." : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
