import { useState, useRef } from "react";
import { X, Printer, IndianRupee, CheckCircle, CreditCard, Banknote } from "lucide-react";

export default function CollectPaymentModal({ booking, onClose, onCollect }) {
  const balance = Number(booking.totalAmount || 0) - Number(booking.advance || 0);
  const [amount, setAmount] = useState(balance);
  const [mode, setMode] = useState("UPI");
  const [step, setStep] = useState(1); // 1 = form, 2 = receipt
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const printRef = useRef();

  const handleCollect = async () => {
    const collectAmount = Number(amount);
    if (!collectAmount || collectAmount <= 0 || collectAmount > balance) return;
    setLoading(true);
    
    try {
      const newAdvance = Number(booking.advance || 0) + collectAmount;
      const newStatus = newAdvance >= Number(booking.totalAmount || 0) ? "Completed" : booking.status;
      
      await onCollect(booking.id, { advance: newAdvance, status: newStatus });
      
      setReceiptData({
        date: new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        receiptNo: `REC-${Date.now().toString().slice(-6)}`,
        amountCollected: amount,
        newAdvance,
        mode,
      });
      
      setStep(2);
    } catch (error) {
      console.error("Payment collection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open('', '', 'width=900,height=650');
    win.document.write('<html><head><title>Receipt - ' + receiptData.receiptNo + '</title>');
    win.document.write('<style>');
    win.document.write('body { font-family: "DM Sans", sans-serif; padding: 40px; color: #111827; }');
    win.document.write('.receipt-box { border: 2px solid #e5e7eb; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; }');
    win.document.write('.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }');
    win.document.write('.row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }');
    win.document.write('.total-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e5e7eb; font-size: 18px; font-weight: 800; color: #1B4332; }');
    win.document.write('@media print { body { padding: 0; } .receipt-box { border: none; } }');
    win.document.write('</style>');
    win.document.write('</head><body>');
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      {/* Modal Box */}
      <div style={{ background: "#fff", width: "100%", maxWidth: 480, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeUp 0.3s ease" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f3f4f6", background: "#F0F4EF" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1B4332", fontFamily: "'Playfair Display', serif" }}>
            {step === 1 ? "Collect Payment" : "Payment Receipt"}
          </h2>
          <button onClick={onClose} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Summary */}
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#111827" }}>{booking.customerName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>{booking.eventType} · {booking.hall} · {new Date(booking.date).toLocaleDateString()}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px dashed #d1d5db" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Total</p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 800, color: "#111827" }}>₹{Number(booking.totalAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Paid</p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 800, color: "#15803d" }}>₹{Number(booking.advance).toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#b91c1c", textTransform: "uppercase", fontWeight: 700 }}>Balance</p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 800, color: "#b91c1c" }}>₹{balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Input Amount */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Amount to Collect</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}><IndianRupee size={16} /></div>
                  <input 
                    type="number" 
                    value={amount || ""} 
                    onChange={e => {
                      const val = e.target.value;
                      setAmount(val === "" ? "" : Number(val));
                    }}
                    max={balance}
                    style={{ width: "100%", padding: "12px 14px 12px 36px", borderRadius: 10, border: "1.5px solid #d1d5db", fontSize: 16, fontWeight: 700, color: "#111827", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                {Number(amount) > balance && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#b91c1c" }}>Amount cannot exceed balance due (₹{balance.toLocaleString()})</p>}
              </div>

              {/* Payment Mode */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Payment Mode</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { id: "UPI", icon: Banknote },
                    { id: "Cash", icon: Banknote },
                    { id: "Bank", icon: CreditCard }
                  ].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)} style={{ padding: "10px", borderRadius: 10, border: `1.5px solid ${mode === m.id ? "#1B4332" : "#e5e7eb"}`, background: mode === m.id ? "#f0fdf4" : "#fff", color: mode === m.id ? "#1B4332" : "#6b7280", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                      <m.icon size={18} /> {m.id}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCollect} 
                disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > balance}
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading || !amount || Number(amount) <= 0 || Number(amount) > balance ? "#e5e7eb" : "#D4A017", color: loading || !amount || Number(amount) <= 0 || Number(amount) > balance ? "#9ca3af" : "#0D2418", fontSize: 15, fontWeight: 800, cursor: loading || !amount || Number(amount) <= 0 || Number(amount) > balance ? "not-allowed" : "pointer", marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "background 0.2s" }}
              >
                {loading ? "Processing..." : `Collect ₹${Number(amount || 0).toLocaleString()}`}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Success Message */}
              <div style={{ textAlign: "center", color: "#15803d" }}>
                <CheckCircle size={48} style={{ margin: "0 auto 12px" }} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Payment Successful!</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>Collected ₹{receiptData.amountCollected.toLocaleString()} via {receiptData.mode}</p>
              </div>

              {/* Hidden Print Wrapper */}
              <div style={{ display: "none" }}>
                <div ref={printRef}>
                  <div className="receipt-box">
                    <div className="header">
                      <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1B4332" }}>Venueza</h1>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>Sreelakshmi Convention Centre</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>RECEIPT</h2>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>#{receiptData.receiptNo}</p>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 24 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280" }}>Received From</p>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{booking.customerName}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>{booking.phone}</p>
                    </div>

                    <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8, marginBottom: 24 }}>
                      <div className="row"><span style={{ color: "#6b7280" }}>Event</span><span style={{ fontWeight: 600 }}>{booking.eventType}</span></div>
                      <div className="row"><span style={{ color: "#6b7280" }}>Date</span><span style={{ fontWeight: 600 }}>{new Date(booking.date).toLocaleDateString()}</span></div>
                      <div className="row"><span style={{ color: "#6b7280" }}>Hall</span><span style={{ fontWeight: 600 }}>{booking.hall}</span></div>
                    </div>

                    <div>
                      <div className="row"><span style={{ color: "#6b7280" }}>Total Amount</span><span style={{ fontWeight: 600 }}>₹{Number(booking.totalAmount).toLocaleString()}</span></div>
                      <div className="row"><span style={{ color: "#6b7280" }}>Previous Paid</span><span style={{ fontWeight: 600 }}>₹{Number(booking.advance).toLocaleString()}</span></div>
                      <div className="row"><span style={{ color: "#6b7280" }}>Amount Paid Now ({receiptData.mode})</span><span style={{ fontWeight: 600, color: "#15803d" }}>₹{receiptData.amountCollected.toLocaleString()}</span></div>
                      
                      <div className="total-row">
                        <span>Balance Due</span>
                        <span>₹{(Number(booking.totalAmount) - receiptData.newAdvance).toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
                      <p style={{ margin: 0 }}>This is a computer generated receipt.</p>
                      <p style={{ margin: "4px 0 0" }}>Date: {receiptData.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handlePrint} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#F0F4EF", color: "#1B4332", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#e5f0ea"} onMouseLeave={e => e.currentTarget.style.background = "#F0F4EF"}>
                  <Printer size={18} /> Print Receipt
                </button>
                <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: "#1B4332", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#163829"} onMouseLeave={e => e.currentTarget.style.background = "#1B4332"}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
