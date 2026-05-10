import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, X } from "lucide-react";
import BookingModal from "../components/BookingModal";
import BookingDetailModal from "../components/BookingDetailModal";
import InvoiceModal from "../components/InvoiceModal";
import { useToast } from "../components/Toast";
import { useBookings } from "../context/BookingsContext";
import { useRole } from "../context/RoleContext";

const TABS = ["All", "Confirmed", "Pending Payment", "Enquiry", "Completed"];

const STATUS_STYLE = {
  Confirmed:       { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  "Pending Payment":{ bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  Enquiry:         { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Completed:       { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  Cancelled:       { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
};

const EVENT_EMOJI = {
  Wedding:"💍", Reception:"🥂", Engagement:"💑",
  Birthday:"🎂", Corporate:"💼", Conference:"💼", Others:"🎉",
};

export default function Bookings() {
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("All");
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detail, setDetail]       = useState(null);
  const [invoice, setInvoice]     = useState(null);
  const { addToast }              = useToast();
  const { bookings, deleteBooking } = useBookings();
  const { can }                   = useRole();

  const filtered = bookings.filter(b => {
    const matchTab = tab === "All" || b.status === tab;
    const q = search.toLowerCase();
    const matchSearch = !q || b.customerName.toLowerCase().includes(q) || b.phone.includes(q) || b.id.toLowerCase().includes(q) || b.eventType.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleDelete = (id) => {
    deleteBooking(id);
    addToast("Booking deleted", "success");
  };

  const tabCount = (t) => t === "All" ? bookings.length : bookings.filter(b => b.status === t).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HEADER BAR ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings…"
            style={{
              width: "100%", height: 36, paddingLeft: 32, paddingRight: 10,
              borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff",
              fontSize: 12, color: "#374151", outline: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Add Button — only if allowed */}
        {can("canAddBooking") && (
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "0 14px", height: 36, borderRadius: 9,
            background: "#1B4332", color: "#fff", border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 10px rgba(27,67,50,0.35)",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#163829"}
          onMouseLeave={e => e.currentTarget.style.background = "#1B4332"}
        >
          <Plus size={14} /> <span style={{ display: "inline" }}>New</span>
        </button>
        )}
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, transition: "all 0.15s",
            background: tab === t ? "#1B4332" : "#fff",
            color:      tab === t ? "#fff"    : "#6b7280",
            boxShadow:  tab === t ? "0 2px 10px rgba(27,67,50,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {t}
            <span style={{
              fontSize: 9, fontWeight: 700, minWidth: 16, height: 16,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: tab === t ? "rgba(255,255,255,0.25)" : "#f3f4f6",
              color:      tab === t ? "#fff" : "#374151",
              padding: "0 4px",
            }}>{tabCount(t)}</span>
          </button>
        ))}
      </div>

      {/* ── TABLE / CARD VIEW ── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Desktop Table View */}
        <div style={{ display: "none", overflowX: "auto", "@media (minWidth: 768px)": { display: "block" } }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                {["Booking ID","Customer","Event","Hall","Date","Session", ...(can("canViewRevenue") ? ["Amount"] : []),"Status","Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontSize: 14 }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.Enquiry;
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f9fafb", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0faf4"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}
                    >
                      {/* ID */}
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332", background: "#F0F4EF", padding: "2px 8px", borderRadius: 6 }}>{b.id}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{b.customerName}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{b.phone}</p>
                      </td>
                      {/* Event */}
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, color: "#374151" }}>
                          {EVENT_EMOJI[b.eventType] || "🎉"} {b.eventType}
                        </span>
                      </td>
                      {/* Hall */}
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{b.hall}</td>
                      {/* Date */}
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: 13, color: "#374151" }}>
                          {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      {/* Session */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          background: b.session === "Full Day" ? "#fef3c7" : "#eff6ff",
                          color:      b.session === "Full Day" ? "#b45309"  : "#1d4ed8",
                        }}>{b.session}</span>
                      </td>
                      {/* Amount — Owner/Manager only */}
                      {can("canViewRevenue") && (
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>₹{b.totalAmount.toLocaleString()}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>Adv: ₹{b.advance.toLocaleString()}</p>
                      </td>
                      )}
                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                          {b.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setDetail(b)} title="View" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B4332" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F0F4EF"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                            <Eye size={14} />
                          </button>
                          {can("canEditBooking") && (
                          <button onClick={() => { setEditTarget(b); setShowAdd(true); }} title="Edit" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                            <Pencil size={14} />
                          </button>
                          )}
                          {can("canDeleteBooking") && (
                          <button onClick={() => handleDelete(b.id)} title="Delete" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                            <Trash2 size={14} />
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 13 }}>
              No bookings found
            </div>
          ) : (
            filtered.map(b => {
              const st = STATUS_STYLE[b.status] || STATUS_STYLE.Enquiry;
              return (
                <div key={b.id} style={{ background: "#f9fafb", borderRadius: 12, padding: 12, border: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {EVENT_EMOJI[b.eventType] || "🎉"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>{b.id}</p>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, fontWeight: 700, background: st.bg, color: st.color, padding: "2px 6px", borderRadius: 10, flexShrink: 0 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: st.dot }} />
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div>💍 {b.eventType}</div>
                    <div>📍 {b.hall}</div>
                    <div>📅 {b.date}</div>
                    <div>🕐 {b.session}</div>
                    <div>👥 {b.guests} guests</div>
                    {can("canViewRevenue") && <div>💵 ₹{b.totalAmount.toLocaleString()}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                    <button onClick={() => setDetail(b)} title="View" style={{ flex: 1, height: 28, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#1B4332", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Eye size={12} /> View
                    </button>
                    {can("canEditBooking") && (
                    <button onClick={() => { setEditTarget(b); setShowAdd(true); }} title="Edit" style={{ flex: 1, height: 28, borderRadius: 7, border: "1px solid #dbeafe", background: "#eff6ff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Pencil size={12} /> Edit
                    </button>
                    )}
                    {can("canDeleteBooking") && (
                    <button onClick={() => handleDelete(b.id)} title="Delete" style={{ flex: 1, height: 28, borderRadius: 7, border: "1px solid #fee2e2", background: "#fecaca", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 11, color: "#9ca3af" }}>
          <span>Showing {filtered.length} of {bookings.length}</span>
          {can("canViewRevenue") && <span>Total: ₹{(filtered.reduce((s, b) => s + b.totalAmount, 0) / 100000).toFixed(1)}L</span>}
        </div>
      </div>

      {showAdd && <BookingModal onClose={() => { setShowAdd(false); setEditTarget(null); }} editData={editTarget} />}
      {detail  && <BookingDetailModal booking={detail} onClose={() => setDetail(null)} onInvoice={() => { setInvoice(detail); setDetail(null); }} onEdit={(b) => { setEditTarget(b); setShowAdd(true); }} />}
      {invoice && <InvoiceModal booking={invoice} onClose={() => setInvoice(null)} />}
    </div>
  );
}
