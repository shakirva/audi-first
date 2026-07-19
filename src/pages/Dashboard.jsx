import { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Calendar, Users, IndianRupee, Clock, MessageCircle, Database } from "lucide-react";
import StatCard from "../components/StatCard";
import BookingModal from "../components/BookingModal";
import { useNavigate } from "react-router-dom";
import { useBookings } from "../context/BookingsContext";
import { useRole } from "../context/RoleContext";
import { bookingsAPI } from "../services/api";

const todayStr = new Date().toISOString().split("T")[0];
const PIE_COLORS = ["#1B4332", "#2D6A4F", "#D4A017", "#40916C", "#74C69D", "#95d5b2"];

function getDateRange(filter) {
  const now = new Date();
  const pad = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().split("T")[0]; };
  
  if (filter === "Today") return { from: pad(now), to: pad(now) };
  if (filter === "Week") {
    const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { from: pad(mon), to: pad(sun) };
  }
  if (filter === "Year") {
    return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  }
  // Month (default)
  const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` };
}

function getPrevDateRange(filter) {
  const now = new Date();
  const pad = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().split("T")[0]; };

  if (filter === "Today") {
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    return { from: pad(yest), to: pad(yest) };
  }
  if (filter === "Week") {
    const prevMon = new Date(now); prevMon.setDate(now.getDate() - now.getDay() + 1 - 7);
    const prevSun = new Date(prevMon); prevSun.setDate(prevMon.getDate() + 6);
    return { from: pad(prevMon), to: pad(prevSun) };
  }
  if (filter === "Year") {
    return { from: `${now.getFullYear()-1}-01-01`, to: `${now.getFullYear()-1}-12-31` };
  }
  // Month
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` };
}

const calcTrend = (curr, prev) => {
  if (prev === 0) return curr > 0 ? "+100%" : "0%";
  const pct = Math.round(((curr - prev) / prev) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
};

const S = {
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    padding: 24,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
  },
};

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState("Month");
  const [comparisonStats, setComparisonStats] = useState(null);
  const navigate = useNavigate();
  const { bookings } = useBookings();
  const { can, role } = useRole();

  useEffect(() => {
    if (role === "Owner" || role === "SuperAdmin") {
      bookingsAPI.getComparisonStats()
        .then(res => setComparisonStats(res.data))
        .catch(err => console.error(err));
    }
  }, [role]);

  const { from, to } = getDateRange(dateFilter);
  const { from: prevFrom, to: prevTo } = getPrevDateRange(dateFilter);

  const getDs = (d) => (d ? d.split("T")[0] : "");

  const filtered = bookings.filter((b) => getDs(b.date) >= from && getDs(b.date) <= to);
  const prevFiltered = bookings.filter((b) => getDs(b.date) >= prevFrom && getDs(b.date) <= prevTo);

  const pending = filtered.filter((b) => b.status === "Pending Payment").length;
  const totalRevenue = filtered
    .filter((b) => b.status === "Confirmed" || b.status === "Completed")
    .reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    
  const prevRevenue = prevFiltered
    .filter((b) => b.status === "Confirmed" || b.status === "Completed")
    .reduce((s, b) => s + Number(b.totalAmount || 0), 0);

  const customersCount = new Set(filtered.map((b) => b.phone)).size;
  const prevCustomersCount = new Set(prevFiltered.map((b) => b.phone)).size;

  const todayBookings = bookings.filter((b) => getDs(b.date) === todayStr);
  const upcoming = [...bookings]
    .filter((b) => getDs(b.date) >= todayStr && b.status !== "Cancelled")
    .sort((a, b) => getDs(a.date).localeCompare(getDs(b.date)))
    .slice(0, 6);

  const DATE_FILTERS = ["Today", "Week", "Month", "Year"];

  // Compute Event Types
  const eventTypeMap = {};
  filtered.forEach(b => {
    eventTypeMap[b.eventType] = (eventTypeMap[b.eventType] || 0) + 1;
  });
  const eventTypes = Object.keys(eventTypeMap).map(k => ({ name: k, value: eventTypeMap[k] }));

  // Compute Monthly Revenue (for the past 6 months based on bookings)
  const revenueMap = {};
  bookings.forEach(b => {
    if (b.status === "Confirmed" || b.status === "Completed") {
      const monthStr = new Date(getDs(b.date)).toLocaleString('default', { month: 'short' });
      revenueMap[monthStr] = (revenueMap[monthStr] || 0) + Number(b.totalAmount || 0);
    }
  });
  
  // Create an array of the last 6 months
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.toLocaleString('default', { month: 'short' });
    monthlyRevenue.push({ month: m, revenue: revenueMap[m] || 0 });
  }

  const quickActions = [
    { label: "New Booking", emoji: "📅", color: "#1B4332", onClick: () => setShowModal(true),       permission: "canAddBooking" },
    { label: "Calendar",    emoji: "📆", color: "#2D6A4F", onClick: () => navigate("/calendar"),     permission: null },
    { label: "Payments",    emoji: "💰", color: "#b45309", onClick: () => navigate("/payments"),     permission: "canViewPayments" },
    { label: "Reports",     emoji: "📊", color: "#1d4ed8", onClick: () => navigate("/reports"),      permission: "canViewReports" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1400, touchAction: "manipulation" }}>

      {/* ── DATE FILTER — Dropdown on mobile, buttons on desktop ── */}
      <div className="hm-desktop-only">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 4 }}>
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              style={{
                padding: "6px 16px", borderRadius: 20, border: "1.5px solid",
                borderColor: dateFilter === f ? "#1B4332" : "#e5e7eb",
                background: dateFilter === f ? "#1B4332" : "#fff",
                color: dateFilter === f ? "#fff" : "#6b7280",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >{f}</button>
          ))}
        </div>
      </div>
      <div className="hm-mobile-only">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: "7px 32px 7px 14px", borderRadius: 10, border: "1.5px solid #1B4332",
              background: "#1B4332", color: "#fff", fontSize: 12, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none",
              appearance: "none", WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
            }}
          >
            {DATE_FILTERS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="hm-stat-grid">
        <StatCard title="Total Bookings" value={filtered.length}  sub={dateFilter}          icon={Calendar}      color="green" trend={calcTrend(filtered.length, prevFiltered.length)} trendUp={filtered.length >= prevFiltered.length} />
        {can("canViewRevenue") && <StatCard title="Revenue"       value={`₹${(totalRevenue / 1000).toFixed(1)}k`} sub="Confirmed" icon={IndianRupee} color="gold" trend={calcTrend(totalRevenue, prevRevenue)} trendUp={totalRevenue >= prevRevenue} />}
        {can("canViewRevenue") && <StatCard title="Pending"       value={pending}         sub="Awaiting payment"   icon={Clock}         color="red"   trend={`${pending} due`} trendUp={false} />}
        <StatCard title="Customers"       value={customersCount} sub="Unique clients" icon={Users}  color="blue"  trend={`${customersCount - prevCustomersCount >= 0 ? "+" : ""}${customersCount - prevCustomersCount} new`} trendUp={customersCount >= prevCustomersCount} />
      </div>

      {/* ── DASHBOARD MAIN (FLEX WRAPPER FOR MOBILE ORDERING) ── */}
      <div className="hm-dashboard-main">
        {/* ── CHARTS ROW ── */}
        <div className="hm-charts-grid">

        {/* Bar Chart — Owner/Manager only */}
        {can("canViewRevenue") && (
        <div style={S.card}>
          <p style={S.sectionTitle}>Monthly Revenue (₹)</p>
          <ResponsiveContainer width="100%" height={280} className="hm-mobile-chart" style={{ minWidth: 0 }}>
            <BarChart data={monthlyRevenue} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: 12 }}
                cursor={{ fill: "rgba(27,67,50,0.05)" }}
              />
              <Bar dataKey="revenue" fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}

        {/* Pie Chart */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Event Types</p>
          <ResponsiveContainer width="100%" height={220} style={{ minWidth: 0 }}>
            <PieChart>
              <Pie data={eventTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={42} paddingAngle={3}>
                {eventTypes.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
            {eventTypes.map((e, i) => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>{e.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="hm-bottom-grid">

        {/* Today's Events + Upcoming */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Today's Events */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <p style={{ ...S.sectionTitle, marginBottom: 0 }}>Today's Events</p>
              <span style={{ fontSize: 11, fontWeight: 700, background: "#F0F4EF", color: "#1B4332", padding: "3px 12px", borderRadius: 20 }}>
                {todayBookings.length} booked
              </span>
            </div>
            {todayBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "#d1d5db" }}>
                <Calendar size={36} style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, color: "#9ca3af" }}>No events scheduled for today</p>
              </div>
            ) : (
              todayBookings.map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {b.eventType === "Wedding" ? "💍" : b.eventType === "Conference" ? "💼" : b.eventType === "Birthday" ? "🎂" : "🎉"}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <p style={{ fontWeight: 600, fontSize: 12, color: "#111827" }}>{b.customerName}</p>
                    <p style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{b.eventType} · {b.session} · {b.hall}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#1B4332" }}>{b.guests} guests</p>
                    {can("canViewRevenue") && <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>₹{b.totalAmount.toLocaleString()}</p>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming Bookings */}
          <div style={S.card}>
            <p style={S.sectionTitle}>Upcoming Bookings</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {upcoming.map((b, idx) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: idx < upcoming.length - 1 ? "1px solid #f3f4f6" : "none", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center", minWidth: 38, background: "#F0F4EF", borderRadius: 8, padding: "4px 6px", flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#1B4332", lineHeight: 1 }}>{new Date(b.date).getDate()}</p>
                    <p style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>
                      {new Date(b.date).toLocaleString("en", { month: "short" })}
                    </p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ fontWeight: 600, fontSize: 12, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.customerName}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{b.eventType} · {b.hall}</p>
                  </div>
                  {can("canViewRevenue") && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332", background: "#F0F4EF", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                    ₹{(b.totalAmount / 1000).toFixed(0)}k
                  </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={S.card}>
          <p style={S.sectionTitle}>Quick Actions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
            {quickActions.filter(a => !a.permission || can(a.permission)).map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                style={{
                  padding: "20px 10px",
                  borderRadius: 14,
                  border: "1.5px solid " + a.color + "22",
                  background: a.color + "0a",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: a.color,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = a.color + "18";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px " + a.color + "22";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = a.color + "0a";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 26 }}>{a.emoji}</span>
                {a.label}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {dateFilter === "Today" ? "Today" : dateFilter === "Week" ? "This Week" : dateFilter === "Year" ? "This Year" : "This Month"}
            </p>
            {[
              { label: "New bookings",   value: filtered.length, color: "#1B4332" },
              ...(can("canViewRevenue") ? [{ label: "Revenue", value: "₹" + filtered.filter(b => b.status === "Confirmed" || b.status === "Completed").reduce((s,b)=>s+b.totalAmount,0).toLocaleString(), color: "#D4A017" }] : []),
              { label: "Pending dues",   value: pending + " bookings", color: "#C0392B" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Sandbox vs Production Comparison (Owner/SuperAdmin only) */}
          {comparisonStats && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#1B4332", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Database size={14} /> Environment Overview
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Production */}
                <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#166534", margin: "0 0 6px 0", textTransform: "uppercase" }}>Production</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Revenue</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332" }}>₹{(comparisonStats.production.revenue / 1000).toFixed(1)}k</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Bookings</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1B4332" }}>{comparisonStats.production.bookings}</span>
                  </div>
                </div>

                {/* Sandbox */}
                <div style={{ background: "#fffbeb", padding: "12px", borderRadius: 10, border: "1px solid #fde68a" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#b45309", margin: "0 0 6px 0", textTransform: "uppercase" }}>Sandbox</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Revenue</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>₹{(comparisonStats.sandbox.revenue / 1000).toFixed(1)}k</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Bookings</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{comparisonStats.sandbox.bookings}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── WHATSAPP FOLLOW-UP REMINDERS ── */}
      {(() => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

        const followUps = bookings.filter(b =>
          (b.status === "Enquiry" || b.status === "Pending Payment") &&
          b.createdAt && b.createdAt.split("T")[0] <= threeDaysAgoStr
        );

        // Also include bookings without createdAt but with old dates
        const followUpsByDate = bookings.filter(b =>
          (b.status === "Enquiry" || b.status === "Pending Payment") &&
          !b.createdAt && getDs(b.date) <= threeDaysAgoStr
        );

        const allFollowUps = [...followUps, ...followUpsByDate];

        if (allFollowUps.length === 0) return null;

        const getWhatsAppUrl = (b) => {
          const msg = b.status === "Enquiry"
            ? `Hi ${b.customerName.split(" ")[0]}, this is from Sreelakshmi Convention Centre. You had enquired about our ${b.hall} for your ${b.eventType} on ${b.date}. Would you like to confirm the booking? We'd be happy to assist! 🏛️`
            : `Hi ${b.customerName.split(" ")[0]}, this is from Sreelakshmi Convention Centre. Your booking for ${b.eventType} on ${b.date} at ${b.hall} has a pending payment of ₹${(b.totalAmount - b.advance).toLocaleString()}. Kindly complete the payment at your earliest convenience. Thank you! 🙏`;
          const phone = b.phone.replace(/[^0-9]/g, "");
          const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
          return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
        };

        return (
          <div style={{ ...S.card, border: "1.5px solid #bbf7d0", background: "linear-gradient(135deg, #f0fdf4, #fefffe)", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} color="#15803d" />
              </div>
              <div>
                <p style={{ ...S.sectionTitle, marginBottom: 0, color: "#15803d" }}>WhatsApp Follow-Up</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{allFollowUps.length} booking{allFollowUps.length !== 1 ? "s" : ""} need follow-up (3+ days old)</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allFollowUps.slice(0, 5).map(b => {
                const statusColor = b.status === "Enquiry" ? { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" }
                  : { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" };
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{b.customerName}</p>
                        <span style={{ fontSize: 9, fontWeight: 700, background: statusColor.bg, color: statusColor.color, padding: "1px 6px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: statusColor.dot }} />
                          {b.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>{b.eventType} · {b.hall} · {b.date}</p>
                    </div>
                    <a
                      href={getWhatsAppUrl(b)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "7px 14px", borderRadius: 8, border: "none",
                        background: "#25D366", color: "#fff",
                        fontSize: 11, fontWeight: 700, textDecoration: "none",
                        cursor: "pointer", flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1da851"}
                      onMouseLeave={e => e.currentTarget.style.background = "#25D366"}
                    >
                      <MessageCircle size={13} /> Send
                    </a>
                  </div>
                );
              })}
            </div>

            {allFollowUps.length > 5 && (
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 10, textAlign: "center" }}>
                +{allFollowUps.length - 5} more bookings need follow-up
              </p>
            )}
          </div>
        );
      })()}

      </div>
      {/* ── END DASHBOARD MAIN ── */}

      {showModal && <BookingModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
