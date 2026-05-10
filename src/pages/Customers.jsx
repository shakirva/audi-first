import { useState, useMemo } from "react";
import { Search, Phone, MessageCircle, ChevronDown, ChevronUp, User } from "lucide-react";
import { useBookings } from "../context/BookingsContext";

// Build unique customers from bookings
const buildCustomers = (bookings) => {
  const map = {};
  bookings.forEach(b => {
    if (!map[b.phone]) {
      map[b.phone] = { name: b.customerName, phone: b.phone, bookings: [] };
    }
    map[b.phone].bookings.push(b);
  });
  return Object.values(map).sort((a, b) => b.bookings.length - a.bookings.length);
};

const STATUS_DOT = {
  Confirmed: "#22c55e", "Pending Payment": "#eab308",
  Enquiry: "#3b82f6", Completed: "#9ca3af", Cancelled: "#ef4444",
};

export default function Customers() {
  const { bookings } = useBookings();
  const customers = useMemo(() => buildCustomers(bookings), [bookings]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const toggle = (phone) => setExpanded(e => e === phone ? null : phone);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 140 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search customers…"
            style={{ width: "100%", height: 36, paddingLeft: 32, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, color: "#374151", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          />
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, whiteSpace: "nowrap" }}>{filtered.length}</div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Total Customers", value: customers.length, icon: "👥", color: "#1B4332", bg: "#f0faf4" },
          { label: "Total Bookings",  value: bookings.length, icon: "📅", color: "#D4A017", bg: "#fffbeb" },
          { label: "Total Revenue",   value: "₹" + (bookings.filter(b=>b.status==="Confirmed"||b.status==="Completed").reduce((s,b)=>s+b.totalAmount,0) / 100000).toFixed(1) + "L", icon: "💰", color: "#1d4ed8", bg: "#eff6ff" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: s.color, marginTop: 1, margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(c => {
          const isOpen = expanded === c.phone;
          const totalSpent = c.bookings.filter(b => b.status === "Confirmed" || b.status === "Completed").reduce((s, b) => s + b.totalAmount, 0);
          const lastEvent  = [...c.bookings].sort((a, b) => b.date.localeCompare(a.date))[0];
          const initials   = c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <div key={c.phone} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #f3f4f6" }}>
              {/* Card header - Desktop view */}
              <div style={{ display: "none", "@media (minWidth: 768px)": { display: "flex" }, alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", backgroundColor: "#fafafa" }}
                onClick={() => toggle(c.phone)}
              >
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #1B4332, #2D6A4F)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2, margin: 0 }}>{c.phone}</p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#1B4332", margin: 0 }}>{c.bookings.length}</p>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, margin: 0 }}>BOOKINGS</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#D4A017", margin: 0 }}>₹{(totalSpent / 100000).toFixed(1)}L</p>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, margin: 0 }}>SPENT</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", margin: 0 }}>{lastEvent ? new Date(lastEvent.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}</p>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, margin: 0 }}>LAST</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: "#25D366", color: "#fff", textDecoration: "none", flexShrink: 0 }}
                  title="WhatsApp"
                >
                  <MessageCircle size={14} />
                </a>

                {/* Expand chevron */}
                <div style={{ color: "#9ca3af", marginLeft: 4 }}>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Card header - Mobile view */}
              <div style={{ display: "flex", "@media (minWidth: 768px)": { display: "none" }, alignItems: "center", gap: 10, padding: "12px 12px", cursor: "pointer", backgroundColor: "#fafafa" }}
                onClick={() => toggle(c.phone)}
              >
                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1B4332, #2D6A4F)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 12, color: "#111827", margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: "#6b7280", marginTop: 1, margin: 0 }}>{c.phone}</p>
                </div>

                {/* Quick stat */}
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#1B4332", margin: 0 }}>{c.bookings.length}</p>
                  <p style={{ fontSize: 8, color: "#9ca3af", margin: 0 }}>bookings</p>
                </div>

                {/* Expand chevron */}
                <div style={{ color: "#9ca3af", marginLeft: 2 }}>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Expanded booking history */}
              {isOpen && (
                <div style={{ padding: "0 12px 12px", borderTop: "1px solid #f9fafb" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 0 8px", margin: 0 }}>Booking History</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {c.bookings.sort((a, b) => b.date.localeCompare(a.date)).map(b => (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "#f9fafb" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[b.status] || "#9ca3af", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{b.eventType}</span>
                          <span style={{ fontSize: 9, color: "#9ca3af", marginLeft: 6 }}>{b.hall}</span>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: "#6b7280" }}>{new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332", marginLeft: 6 }}>₹{(b.totalAmount / 100000).toFixed(1)}L</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
