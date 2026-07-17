import { useState, useMemo, useEffect } from "react";
import {
  Wallet, Plus, Trash2, Pencil, X, Check, TrendingDown,
  Users, Wrench, Zap, UtensilsCrossed, MoreHorizontal, ChevronDown,
} from "lucide-react";
import { expensesAPI, settingsAPI } from "../services/api";

const CATEGORIES = [
  { label: "Staff Salaries",  icon: Users,          color: "#4f46e5", bg: "#eef2ff" },
  { label: "Maintenance",     icon: Wrench,         color: "#d97706", bg: "#fffbeb" },
  { label: "Utilities",       icon: Zap,            color: "#0891b2", bg: "#ecfeff" },
  { label: "Catering Prep",   icon: UtensilsCrossed,color: "#059669", bg: "#ecfdf5" },
  { label: "Miscellaneous",   icon: MoreHorizontal, color: "#9ca3af", bg: "#f3f4f6" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const DEFAULT_COLORS = [
  { color: "#4f46e5", bg: "#eef2ff" },
  { color: "#d97706", bg: "#fffbeb" },
  { color: "#0891b2", bg: "#ecfeff" },
  { color: "#059669", bg: "#ecfdf5" },
  { color: "#e11d48", bg: "#fff1f2" },
  { color: "#7c3aed", bg: "#f5f3ff" },
  { color: "#c026d3", bg: "#fdf4ff" },
];

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

const EMPTY_FORM = (firstCat) => ({
  category: firstCat || "",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  recurring: false,
});

export default function Expenses() {
  const now = new Date();
  const [expenses, setExpenses]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterCat, setFilterCat]     = useState("All");
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear]   = useState(now.getFullYear());
  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM(""));
  const [deleteId, setDeleteId]       = useState(null);
  const [categories, setCategories]   = useState([]);

  const dynamicCategories = useMemo(() => {
    return categories.map((c, i) => {
      const existing = CATEGORIES.find(x => x.label === c);
      if (existing) return existing;
      const theme = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      return { label: c, icon: MoreHorizontal, color: theme.color, bg: theme.bg };
    });
  }, [categories]);

  const catMeta = (label) => dynamicCategories.find(c => c.label === label) || { label, icon: MoreHorizontal, color: "#9ca3af", bg: "#f3f4f6" };

  /* ── Filtered list ── */
  const monthStr = `${filterYear}-${String(filterMonth + 1).padStart(2, "0")}`;
  const filtered = useMemo(() =>
    expenses.filter(e => {
      const catOk  = filterCat === "All" || e.category === filterCat;
      const monOk  = e.date.startsWith(monthStr);
      return catOk && monOk;
    }),
    [expenses, filterCat, monthStr]
  );

  /* ── Summary cards ── */
  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const byCat = dynamicCategories.map(c => ({
    ...c,
    total: filtered.filter(e => e.category === c.label).reduce((s, e) => s + Number(e.amount), 0),
  }));

  // Load settings once on mount
  useEffect(() => {
    settingsAPI.get().then(res => {
      if (res.data.expenseCategories && res.data.expenseCategories.length > 0) {
        setCategories(res.data.expenseCategories);
        setForm(EMPTY_FORM(res.data.expenseCategories[0]));
      }
    }).catch(console.error);
  }, []);

  // Reload expenses when month/year changes
  useEffect(() => {
    fetchExpenses();
  }, [filterMonth, filterYear]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await expensesAPI.getAll({ month: monthStr });
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Handlers ── */
  const openAdd  = () => { setForm(EMPTY_FORM(categories[0] || "")); setEditId(null); setShowModal(true); };
  const openEdit = (exp) => { setForm({ ...exp }); setEditId(exp.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || !form.date) return;
    try {
      if (editId) {
        await expensesAPI.update(editId, form);
      } else {
        await expensesAPI.create(form);
      }
      fetchExpenses();
      closeModal();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expensesAPI.remove(id);
      fetchExpenses();
      setDeleteId(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ── Month navigation ── */
  const prevMonth = () => { if (filterMonth === 0) { setFilterMonth(11); setFilterYear(y => y - 1); } else setFilterMonth(m => m - 1); };
  const nextMonth = () => { if (filterMonth === 11) { setFilterMonth(0); setFilterYear(y => y + 1); } else setFilterMonth(m => m + 1); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1100 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
            Expense Management
          </h2>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Track all auditorium operating expenses</p>
        </div>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
          background: "linear-gradient(135deg,#1B4332,#2D6A4F)", color: "#fff",
          border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 14px rgba(27,67,50,0.35)",
        }}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* ── Month navigator ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14, color: "#111827", minWidth: 140, textAlign: "center" }}>
          {MONTHS[filterMonth]} {filterYear}
        </span>
        <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>›</button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {/* Total */}
        <div style={{ background: "linear-gradient(135deg,#0D2418,#1B4332)", borderRadius: 14, padding: "16px 18px", color: "#fff", gridColumn: "1 / span 2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <TrendingDown size={16} style={{ color: "#D4A017" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 1, textTransform: "uppercase" }}>Total Expenses</span>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#D4A017" }}>{formatINR(totalFiltered)}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{filtered.length} entries · {MONTHS[filterMonth]} {filterYear}</p>
        </div>

        {byCat.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} style={{ color: c.color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</span>
              </div>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0 }}>{formatINR(c.total)}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["All", ...dynamicCategories.map(c => c.label)].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: filterCat === cat ? "none" : "1px solid #e5e7eb",
            background: filterCat === cat ? "#1B4332" : "#fff",
            color: filterCat === cat ? "#fff" : "#6b7280",
            cursor: "pointer", transition: "all 0.15s",
          }}>{cat}</button>
        ))}
      </div>

      {/* ── Expense Table ── */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Table header */}
        <div className="hm-expenses-grid hm-desktop-only" style={{ padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
          {["Category", "Description", "Amount", "Date", "Actions"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#1B4332", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading expenses...</p>
            <style>{"@keyframes spin { to { transform: rotate(360deg) } }"}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>💰</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No expenses recorded for this period</p>
            <button onClick={openAdd} style={{ marginTop: 12, padding: "7px 16px", borderRadius: 8, background: "#1B4332", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
              + Add First Expense
            </button>
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hm-desktop-only">
              {filtered.map((exp, idx) => {
                const meta = catMeta(exp.category);
                const Icon = meta.icon;
                return (
                  <div key={exp.id} className="hm-expenses-grid" style={{
                    padding: "11px 16px", borderBottom: idx < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                    alignItems: "center", transition: "background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    {/* Category badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={12} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{exp.category}</span>
                        {exp.recurring && <span style={{ display: "block", fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>🔁 recurring</span>}
                      </div>
                    </div>

                    {/* Description */}
                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.description}</span>

                    {/* Amount */}
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{formatINR(exp.amount)}</span>

                    {/* Date */}
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => openEdit(exp)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 11 }}>
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setDeleteId(exp.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #fee2e2", background: "#fff8f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 11 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile card view */}
            <div className="hm-mobile-only">
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
              {filtered.map(exp => {
                const meta = catMeta(exp.category);
                const Icon = meta.icon;
                return (
                  <div key={exp.id} style={{ background: "#f9fafb", borderRadius: 10, padding: 10, border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} style={{ color: meta.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, margin: 0 }}>{exp.category}</p>
                        <p style={{ fontSize: 11, color: "#374151", fontWeight: 500, margin: "2px 0 0" }}>{exp.description}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#1B4332", background: "#F0F4EF", padding: "2px 8px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}>{formatINR(exp.amount)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#9ca3af", marginBottom: 8 }}>
                      <span>{new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</span>
                      {exp.recurring && <span>🔁 recurring</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(exp)} style={{ flex: 1, height: 28, borderRadius: 6, border: "1px solid #dbeafe", background: "#eff6ff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => setDeleteId(exp.id)} style={{ flex: 1, height: 28, borderRadius: 6, border: "1px solid #fee2e2", background: "#fecaca", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </>
        )}

        {/* Total row */}
        {filtered.length > 0 && (
          <div className="hm-expenses-grid hm-desktop-only" style={{ padding: "12px 20px", background: "#f9fafb", borderTop: "2px solid #e5e7eb" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", gridColumn: "1 / span 2" }}>TOTAL ({filtered.length} entries)</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#D4A017" }}>{formatINR(totalFiltered)}</span>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={closeModal}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>
                {editId ? "Edit Expense" : "Add New Expense"}
              </h3>
              <button onClick={closeModal} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                <X size={14} />
              </button>
            </div>

            {/* Category */}
            <label style={labelStyle}>Category</label>
            <div style={{ position: "relative" }}>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {dynamicCategories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            </div>

            {/* Description */}
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              placeholder="e.g. AC Service – Main Hall"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={inputStyle}
            />

            {/* Amount */}
            <label style={labelStyle}>Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              style={inputStyle}
            />

            {/* Date */}
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={inputStyle}
            />

            {/* Recurring */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontSize: 13, color: "#374151" }}>
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
                style={{ width: 15, height: 15, accentColor: "#1B4332" }}
              />
              Recurring monthly expense
            </label>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1B4332,#2D6A4F)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Check size={14} /> {editId ? "Update" : "Save Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDeleteId(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</p>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", textAlign: "center", marginBottom: 6 }}>Delete this expense?</p>
            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared micro styles ── */
const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#374151",
  textTransform: "uppercase", letterSpacing: 0.5, marginTop: 14, marginBottom: 5,
};
const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 9,
  border: "1px solid #e5e7eb", fontSize: 13, color: "#111827",
  outline: "none", background: "#fafafa", boxSizing: "border-box",
  appearance: "none", WebkitAppearance: "none",
};
