import { useState, useMemo, useEffect } from "react";
import { CheckCircle, MessageCircle, TrendingUp, IndianRupee, AlertCircle, Bell } from "lucide-react";
import { useToast } from "../components/Toast";
import { useBookings } from "../context/BookingsContext";
import { settingsAPI } from "../services/api";

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
  const [paid, setPaid]                   = useState({});
  const [historyFilter, setHistoryFilter] = useState("All");
  const [reminderDays, setReminderDays]   = useState([3, 7]);
  const [sentReminders, setSentReminders] = useState({});

  useEffect(() => {
    settingsAPI.get()
      .then(res => { if (res.data.reminderDays && res.data.reminderDays.length > 0) setReminderDays(res.data.reminderDays); })
      .catch(console.error);
  }, []);

  const pending   = useMemo(() => bookings.filter(b => b.status === "Pending Payment"), [bookings]);
  const confirmed = useMemo(() => bookings.filter(b => b.status === "Confirmed" || b.status === "Completed"), [bookings]);

  const totalRevenue  = useMemo(() => confirmed.reduce((s, b) => s + Number(b.totalAmount || 0), 0), [confirmed]);
  const totalAdvance  = useMemo(() => confirmed.reduce((s, b) => s + Number(b.advance || 0), 0), [confirmed]);
  const totalBalance  = useMemo(() => pending.reduce((s, b) => s + (Number(b.totalAmount || 0) - Number(b.advance || 0)), 0), [pending]);

  // Bookings that fall within ANY of the configured reminder windows
  const urgentReminders = useMemo(() => {
    const maxDays = reminderDays.length > 0 ? Math.max(...reminderDays) : 7;
    return pending.filter(b => !paid[b.id] && daysDue(b.date) >= 0 && daysDue(b.date) <= maxDays);
  }, [pending, paid, reminderDays]);

  // History filter
  const EVENT_TYPES = useMemo(() => ["All", ...new Set(confirmed.map(b => b.eventType).filter(Boolean))], [confirmed]);
  const historyList = useMemo(() =>
    historyFilter === "All" ? confirmed : confirmed.filter(b => b.eventType === historyFilter),
    [confirmed, historyFilter]
  );

  const handleMarkPaid = (id) => {
    setPaid(p => ({ ...p, [id]: true }));
    updateStatus(id, "Confirmed");
    addToast("Payment marked as received ✅", "success");
  };

  const handleSendReminder = (b, isAuto = false) => {
    const balance  = Number(b.totalAmount || 0) - Number(b.advance || 0);
    const days     = daysDue(b.date);
    const eventDate = new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const reminderLine = days <= 0
      ? "Please make the payment at the earliest."
      : `Kindly make the balance payment ${days === 1 ? "tomorrow" : `within ${days} days`} (by ${eventDate}).`;
    const msg = encodeURIComponent(
      `Dear ${b.customerName},\n\nThis is a gentle reminder that a balance payment of \u20b9${balance.toLocaleString()} is pending for your upcoming ${b.eventType} on ${eventDate} at ${b.hall}.\n\n${reminderLine}\n\nThank you! 🙏\n— Sreelakshmi Convention Centre`
    );
    const phone = b.phone.replace(/[^0-9]/g, "");
    const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
    setSentReminders(prev => ({ ...prev, [b.id]: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }));
    addToast(`${isAuto ? "Auto-reminder" : "Reminder"} sent to ${b.customerName} 📱`, "success");
  };

  const fmtL  = (n) => `₹${(n / 100000).toFixed(1)}L`;
  const fmtK  = (n) => `₹${(n / 1000).toFixed(0)}k`;
  const card  = { background: "#fff", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", padding: 16 };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── STAT CARDS (2 only) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          {
            label: "Total Revenue",
            value: fmtL(totalRevenue),
            sub: `from ${confirmed.length} confirmed`,
            icon: IndianRupee,
            bg: "linear-gradient(135deg, #f0faf4, #dcfce7)",
            border: "#86efac",
            color: "#1B4332",
          },
          {
            label: "Advance Collected",
            value: fmtL(totalAdvance),
            sub: `${totalRevenue > 0 ? Math.round((totalAdvance / totalRevenue) * 100) : 0}% of total`,
            icon: TrendingUp,
            bg: "linear-gradient(135deg, #fffbeb, #fef9c3)",
            border: "#fde047",
            color: "#D4A017",
          },
          {
            label: "Balance Due",
            value: `₹${totalBalance.toLocaleString()}`,
            sub: `from ${pending.length} pending bookings`,
            icon: AlertCircle,
            bg: "linear-gradient(135deg, #fff1f2, #fee2e2)",
            border: "#fca5a5",
            color: "#b91c1c",
          },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: "2px 0 0", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "#6b7280", margin: "3px 0 0" }}>{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── URGENT REMINDER BANNER ── */}
      {urgentReminders.length > 0 && (
        <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#15803d", margin: 0 }}>
                {urgentReminders.length} balance payment{urgentReminders.length > 1 ? "s" : ""} due within your reminder window ({reminderDays.sort((a,b)=>a-b).map(d=>`${d}d`).join(", ")} before event)
              </p>
              <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0" }}>Reminder days configured in Settings → WhatsApp Reminder Schedule</p>
            </div>
            <button
              onClick={() => urgentReminders.forEach(b => handleSendReminder(b, true))}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
              <Bell size={12} /> Send All Reminders
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {urgentReminders.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #bbf7d0", justifyContent: "space-between" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                  <p style={{ fontSize: 10, color: "#15803d", margin: "1px 0 0" }}>
                    {b.eventType} · {b.hall} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · Balance: ₹{(Number(b.totalAmount||0)-Number(b.advance||0)).toLocaleString()}
                  </p>
                  {sentReminders[b.id] && <p style={{ fontSize: 9, color: "#9ca3af", margin: "1px 0 0" }}>Last sent at {sentReminders[b.id]}</p>}
                </div>
                <button onClick={() => handleSendReminder(b)}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                  <MessageCircle size={12} /> {sentReminders[b.id] ? "Resend" : "Remind"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PENDING DUES TABLE ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
            Pending Payments
          </h3>
          <span style={{ fontSize: 11, fontWeight: 700, background: pending.filter(b => !paid[b.id]).length > 0 ? "#fee2e2" : "#dcfce7", color: pending.filter(b => !paid[b.id]).length > 0 ? "#b91c1c" : "#15803d", padding: "3px 12px", borderRadius: 20 }}>
            {pending.filter(b => !paid[b.id]).length} pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🎉</p>
            <p style={{ fontSize: 13, fontWeight: 600 }}>All payments cleared!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hm-desktop-only" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Customer", "Event & Hall", "Date", "Total Amount", "Advance Paid", "Balance Due", "Due In", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map(b => {
                    const isPaid = paid[b.id];
                    const days   = daysDue(b.date);
                    const urg    = urgencyStyle(days);
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f9fafb", background: isPaid ? "#f0faf4" : "#fff" }}
                        onMouseEnter={e => { if (!isPaid) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isPaid ? "#f0faf4" : "#fff"; }}>
                        <td style={{ padding: "12px 14px" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                          <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>{b.phone}</p>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#374151" }}>{b.eventType} · {b.hall}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
                          {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 800, color: "#111827", whiteSpace: "nowrap" }}>
                          ₹{Number(b.totalAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#15803d", whiteSpace: "nowrap" }}>
                          ₹{Number(b.advance || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 800, color: "#b91c1c", whiteSpace: "nowrap" }}>
                          ₹{(Number(b.totalAmount || 0) - Number(b.advance || 0)).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: urg.bg, color: urg.color, padding: "3px 10px", borderRadius: 10 }}>{urg.label}</span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {isPaid ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                              <CheckCircle size={14} /> Paid
                            </span>
                          ) : (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button onClick={() => handleMarkPaid(b.id)}
                                style={{ padding: "5px 14px", borderRadius: 8, background: "#1B4332", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                                onMouseEnter={e => e.currentTarget.style.background = "#163829"}
                                onMouseLeave={e => e.currentTarget.style.background = "#1B4332"}>
                                Mark Paid
                              </button>
                              <button onClick={() => handleSendReminder(b)}
                                style={{ padding: "5px 10px", borderRadius: 8, background: sentReminders[b.id] ? "#e5e7eb" : "#25D366", color: sentReminders[b.id] ? "#374151" : "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                                <MessageCircle size={11} /> {sentReminders[b.id] ? `Resent ${sentReminders[b.id]}` : "Remind"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="hm-mobile-only">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map(b => {
                  const isPaid = paid[b.id];
                  const days   = daysDue(b.date);
                  const urg    = urgencyStyle(days);
                  return (
                    <div key={b.id} style={{ background: isPaid ? "#f0faf4" : "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                          <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>{b.phone} · {b.eventType} · {b.hall}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, background: urg.bg, color: urg.color, padding: "2px 8px", borderRadius: 10, flexShrink: 0 }}>{urg.label}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                        <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #e5e7eb" }}>
                          <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Total</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: "2px 0 0" }}>₹{Number(b.totalAmount || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid #e5e7eb" }}>
                          <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Advance</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#15803d", margin: "2px 0 0" }}>₹{Number(b.advance || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1.5px solid #fca5a5" }}>
                          <p style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>Balance</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#b91c1c", margin: "2px 0 0" }}>₹{(Number(b.totalAmount || 0) - Number(b.advance || 0)).toLocaleString()}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {isPaid ? (
                          <div style={{ flex: 1, background: "#dcfce7", borderRadius: 8, padding: 8, textAlign: "center" }}>
                            <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>✓ Paid</span>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleMarkPaid(b.id)}
                              style={{ flex: 1, padding: 8, borderRadius: 8, background: "#1B4332", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                              Mark Paid
                            </button>
                            {days <= 7 && (
                              <button onClick={() => handleSendReminder(b)}
                                style={{ flex: 1, padding: 8, borderRadius: 8, background: "#25D366", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <MessageCircle size={13} /> Remind
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
          </>
        )}
      </div>

      {/* ── PAYMENT HISTORY & GST SUMMARY ── */}
      <div className="hm-history-grid">

        {/* Payment History */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
              Payment History
            </h3>
            <div className="hm-desktop-only">
              <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                {EVENT_TYPES.map(t => (
                  <button key={t} onClick={() => setHistoryFilter(t)} style={{
                    padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${historyFilter === t ? "#1B4332" : "#e5e7eb"}`,
                    background: historyFilter === t ? "#1B4332" : "#fff",
                    color: historyFilter === t ? "#fff" : "#6b7280",
                    fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="hm-mobile-only">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                style={{
                  padding: "4px 24px 4px 10px", borderRadius: 10, border: "1.5px solid #1B4332",
                  background: "#1B4332", color: "#fff", fontSize: 10, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none",
                  appearance: "none", WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                }}
              >
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {historyList.length === 0 ? (
            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "24px 0" }}>No records yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {historyList.slice(0, 12).map((b, idx) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: idx < historyList.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: b.status === "Completed" ? "#f3f4f6" : "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle size={15} color={b.status === "Completed" ? "#9ca3af" : "#15803d"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{b.customerName}</p>
                    <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0" }}>
                      {b.eventType} · {b.hall} · {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1B4332", margin: 0 }}>₹{Number(b.totalAmount || 0).toLocaleString()}</p>
                    <p style={{ fontSize: 9, color: "#9ca3af", margin: "2px 0 0", textTransform: "uppercase" }}>{b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GST Summary */}
        <div style={card}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14, margin: 0 }}>
            GST Summary
          </h3>
          <div style={{ marginTop: 14 }}>
            {[
              { label: "Gross Revenue",  value: `₹${totalRevenue.toLocaleString()}`,                                   color: "#111827" },
              { label: "CGST (9%)",      value: `₹${Math.round(totalRevenue * 0.09).toLocaleString()}`,                color: "#D4A017" },
              { label: "SGST (9%)",      value: `₹${Math.round(totalRevenue * 0.09).toLocaleString()}`,                color: "#D4A017" },
              { label: "Total GST",      value: `₹${Math.round(totalRevenue * 0.18).toLocaleString()}`,                color: "#C0392B" },
              { label: "Net Revenue",    value: `₹${Math.round(totalRevenue * 0.82).toLocaleString()}`,                color: "#1B4332" },
            ].map((row, i) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "12px 16px", background: "#F0F4EF", borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>
              {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })} — Net Taxable
            </p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#1B4332", marginTop: 4, margin: "4px 0 0" }}>
              ₹{Math.round(totalRevenue * 0.82).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
