/**
 * GST Utility — SAC 997212 (Renting of Immovable Property)
 *
 * LOGIC EXPLAINED:
 * ─────────────────────────────────────────────────────────
 * booking.totalAmount  = BASE amount (GST-exclusive, what customer agreed to pay)
 * booking.advance      = Advance actually received (stored in data)
 *
 * IF gstApplicable === true:
 *   grandTotal = base + CGST(9%) + SGST(9%) = base × 1.18
 *   balance    = grandTotal - advance
 *
 * IF gstApplicable === false (religious, school events):
 *   grandTotal = base   (no tax added)
 *   balance    = base - advance
 *
 * "Fully Paid" condition: balance <= 0
 *   → This means advance must cover the GST-inclusive total.
 *   → If advance == base but GST applies, ₹(base×0.18) is still due.
 *   → This is CORRECT — customer owes the GST portion.
 * ─────────────────────────────────────────────────────────
 */

export function calcGST(baseAmount, gstApplicable = true) {
  const base = Number(baseAmount) || 0;
  if (!gstApplicable) {
    return { base, cgst: 0, sgst: 0, totalTax: 0, grandTotal: base };
  }
  const cgst = Math.round(base * 0.09);
  const sgst = Math.round(base * 0.09);
  return { base, cgst, sgst, totalTax: cgst + sgst, grandTotal: base + cgst + sgst };
}
