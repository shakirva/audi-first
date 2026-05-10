import { useState } from "react";
import { CheckCircle, MessageCircle } from "lucide-react";
import { useToast } from "../components/Toast";
import { useBookings } from "../context/BookingsContext";

const today = new Date();

function daysDue(dateStr) {
  const d = new Date(dateStr);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

function urgencyStyle(days) {
  if (days < 0)   return { bg: "#fee2e2", color: "#b91c1c", label: "Overdue" };
  if (days <= 7)  return { bg: "#fee2e2", color: "#b91c1c", label: `${days}d left` };
  if (days <= 15) return { bg: "#fef9c3", color: "#a16207", label: `${days}d left` };
  return              { bg: "#dcfce7", color: "#15803d", label: `${days}d left` };
}

export default function Payments() {
  const { addToast } = useToast();
  const { bookings, updateStatus } = useBookings();
  const [paid, setPaid] = useState({});

  const pending = bookings.filter(b => b.status === "Pending Payment");
  const confirmed = bookings.filter(b => b.status === "Confirmed" || b.status === "Completed");

  const totalRevenue  = confirmed.reduce((s, b) => s + b.totalAmount, 0);
  const totalAdvance  = confirmed.reduce((s, b) => s + b.advance, 0);
  const totalBalance  = confirmed.reduce((s, b) => s + (b.totalAmount - b.advance), 0);
  const pendingAmount = pending.reduce((s, b) => s + (b.totalAmount - b.advance), 0);

  const handleMarkPaid = (id) => {
    setPaid(p => ({ ...p, [id]: true }));
    updateStatus(id, "Confirmed");
    addToast("Payment marked as received ✅", "success");
  };

  const handleSendReminder = (b) => {
    const balance = b.totalAmount - Number(b.advance ?? b.advancePaid ?? 0);
    const days = daysDue(b.date);
    const eventDate = new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const msg = encodeURIComponent(
      `Dear ${b.customerName},\n\nThis is a gentle reminder that a balance payment of ₹${balance.toLocaleString()} is due for your upcoming ${b.eventType} on ${eventDate} at ${b.hall}.\n\nKindly make the payment ${days <= 0 ? "at the earliest" : `within ${days} day${days > 1 ? "s" : ""}`}.\n\nThank you! 🙏\n— Sreelakshmi Convention Centre`
    );
    window.open(`https://wa.me/91${b.phone}?text=${msg}`, "_blank");
    addToast(`Reminder sent to ${b.customerName} 📱`, "success");
  };

  // Bookings with event ≤7 days away and still pending
  const urgentReminders = pending.filter(b => !paid[b.id] && daysDue(b.date) <= 7);

  const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", padding: 14 };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 14 }}>
        {[
          { label: "Total Revenue",    value: `₹${(totalRevenue/100000).toFixed(1)}L`,    icon: "💰", bg: "#f0faf4", color: "#1B4332" },
          { label: "Advance Collected",value: `₹${(totalAdvance/100000).toFixed(1)}L`,    icon: "✅", bg: "#fffbeb", color: "#D4A017" },
          { label: "Balance Due",      value: `₹${(totalBalance/1000).toFixed(0)}k`,      icon: "🕐", bg: "#eff6ff", color: "#2563eb" },
          { label: "Pending Dues",     value: `₹${(pendingAmount/1000).toFixed(0)}k`,     icon: "⚠️", bg: "#fff5f5", color: "#C0392B" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: s.color, marginTop: 1, margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADVANCE REMINDER BANNER ── */}
      {urgentReminders.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", margin: 0 }}>
                {urgentReminders.length} urgent payment{urgentReminders.length > 1 ? "s" : ""}
              </p>
              <p style={{ fontSize: 10, color: "#9a3412", margin: "2px 0 0 0" }}>Send reminders within 7 days</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {urgentReminders.map(b => {
              const days = daysDue(b.date);
              const balance = b.totalAmount - Number(b.advance ?? b.advancePaid ?? 0);
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #fed7aa", justifyContent: "space-between" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                    <p style={{ fontSize: 9, color: "#9a3412", margin: "1px 0 0 0" }}>
                      ₹{(balance / 1000).toFixed(0)}k · {days <= 0 ? "Overdue!" : `${days}d`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendReminder(b)}
                    style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 10px", borderRadius: 6, border: "none", background: "#25D366", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    <MessageCircle size={10} /> Remind
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PENDING DUES TABLE ── */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>
            Pending Payments
          </h3>
          <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 10px", borderRadius: 20 }}>
            {pending.filter(b => !paid[b.id]).length} pending
          </span>
        </div>

        {/* Desktop Table View */}
        <div style={{ display: "none", "@media (minWidth: 768px)": { display: "block" }, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Customer", "Event", "Date", "Total", "Advance", "Balance", "Due In", "Action"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map(b => {
                const isPaid  = paid[b.id];
                const balance = b.totalAmount - b.advance;
                const days    = daysDue(b.date);
                const urg     = urgencyStyle(days);
                return (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f9fafb", background: isPaid ? "#f0faf4" : "#fff" }}
                    onMouseEnter={e => { if (!isPaid) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isPaid ? "#f0faf4" : "#fff"; }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{b.customerName}</p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: "1px 0 0 0" }}>{b.phone}</p>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#374151", whiteSpace: "nowrap" }}>{b.eventType} · {b.hall}</td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#374151", whiteSpace: "nowrap" }}>
                      {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>₹{(b.totalAmount / 1000).toFixed(0)}k</td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: "#15803d", whiteSpace: "nowrap" }}>₹{(b.advance / 1000).toFixed(0)}k</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#b91c1c", whiteSpace: "nowrap" }}>₹{(balance / 1000).toFixed(0)}k</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: urg.bg, color: urg.color, padding: "2px 8px", borderRadius: 10 }}>{urg.label}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {isPaid ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#15803d", fontWeight: 600 }}>
                          <CheckCircle size={13} /> Paid
                        </span>
                      ) : (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <button onClick={() => handleMarkPaid(b.id)}
                            style={{ padding: "4px 10px", borderRadius: 6, background: "#1B4332", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#163829"}
                            onMouseLeave={e => e.currentTarget.style.background = "#1B4332"}
                          >
                            Paid
                          </button>
                          {days <= 7 && (
                            <button onClick={() => handleSendReminder(b)}
                              style={{ padding: "4px 8px", borderRadius: 6, background: "#25D366", color: "#fff", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}
                              title="Send WhatsApp reminder"
                            >
                              <MessageCircle size={10} /> Remind
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div style={{ display: "flex", "@media (minWidth: 768px)": { display: "none" }, flexDirection: "column", gap: 8 }}>
          {pending.map(b => {
            const isPaid  = paid[b.id];
            const balance = b.totalAmount - b.advance;
            const days    = daysDue(b.date);
            const urg     = urgencyStyle(days);
            return (
              <div key={b.id} style={{ background: isPaid ? "#f0faf4" : "#fff", border: "1px solid #f3f4f6", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: "1px 0 0 0" }}>{b.phone} • {b.eventType}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, background: urg.bg, color: urg.color, padding: "2px 8px", borderRadius: 10, flexShrink: 0, whiteSpace: "nowrap" }}>{urg.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: "#f9fafb", borderRadius: 6, padding: 8 }}>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, margin: 0 }}>Total</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "2px 0 0 0" }}>₹{(b.totalAmount / 1000).toFixed(0)}k</p>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: 6, padding: 8 }}>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, margin: 0 }}>Balance</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#b91c1c", margin: "2px 0 0 0" }}>₹{(balance / 1000).toFixed(0)}k</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isPaid ? (
                    <div style={{ flex: 1, background: "#f0faf4", borderRadius: 6, padding: 8, textAlign: "center" }}>
                      <span style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>✓ Paid</span>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleMarkPaid(b.id)}
                        style={{ flex: 1, padding: 8, borderRadius: 6, background: "#1B4332", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                      >
                        Mark Paid
                      </button>
                      {days <= 7 && (
                        <button onClick={() => handleSendReminder(b)}
                          style={{ flex: 1, padding: 8, borderRadius: 6, background: "#25D366", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
                        >
                          <MessageCircle size={11} /> Remind
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PAYMENT HISTORY & GST SUMMARY ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", "@media (minWidth: 768px)": { gridTemplateColumns: "1fr 250px" }, gap: 12 }}>
        {/* Payment History */}
        <div style={card}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12, margin: 0 }}>
            Payment History
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {confirmed.slice(0, 10).map((b, idx) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: idx < 9 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={14} style={{ color: "#15803d" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{b.customerName}</p>
                  <p style={{ fontSize: 10, color: "#6b7280", margin: "1px 0 0 0" }}>{b.eventType} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1B4332", margin: 0 }}>₹{(b.totalAmount / 1000).toFixed(0)}k</p>
                  <p style={{ fontSize: 9, color: "#9ca3af", margin: "1px 0 0 0" }}>Full</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Summary */}
        <div style={card}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12, margin: 0 }}>
            GST Summary
          </h3>
          {[
            { label: "Gross Revenue",  value: `₹${(totalRevenue / 100000).toFixed(1)}L`,                          color: "#111827" },
            { label: "CGST (9%)",      value: `₹${Math.round(totalRevenue * 0.09 / 1000).toFixed(0)}k`,        color: "#D4A017" },
            { label: "SGST (9%)",      value: `₹${Math.round(totalRevenue * 0.09 / 1000).toFixed(0)}k`,        color: "#D4A017" },
            { label: "Total GST",      value: `₹${Math.round(totalRevenue * 0.18 / 1000).toFixed(0)}k`,        color: "#C0392B" },
            { label: "Net Revenue",    value: `₹${Math.round(totalRevenue * 0.82 / 100000).toFixed(1)}L`,        color: "#1B4332" },
          ].map((row, i) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 10, background: "#F0F4EF", borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>Q2 FY 2025-26</p>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#1B4332", marginTop: 3, margin: 0 }}>
              ₹{Math.round(totalRevenue * 0.82 / 100000).toFixed(1)}L
            </p>
            <p style={{ fontSize: 9, color: "#6b7280", margin: "2px 0 0 0" }}>Net Taxable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
