/**
 * DemoContext — Study / Client Presentation Mode
 *
 * Concept:
 *   "Full View"  → shows real booking data (Owner internal use)
 *   "Demo View"  → scales revenue & counts by a configurable ratio
 *                  so you can present reduced numbers to clients/auditors
 *                  without touching real data
 *
 * This is a DEMO/STUDY feature only — data is never saved or exported differently.
 * The real bookings object is always unchanged in memory.
 */

import { createContext, useContext, useState } from "react";

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  // isDemoMode: when true, apply demoRatio to all revenue/count displays
  const [isDemoMode, setIsDemoMode] = useState(
    () => localStorage.getItem("hm_demo_mode") === "true"
  );

  // demoRatio: 0.1 to 1.0 — 0.6 means show 60% of real numbers
  const [demoRatio, setDemoRatioState] = useState(
    () => parseFloat(localStorage.getItem("hm_demo_ratio") || "0.6")
  );

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    localStorage.setItem("hm_demo_mode", next);
    setIsDemoMode(next);
  };

  const setDemoRatio = (val) => {
    const clamped = Math.min(1, Math.max(0.1, val));
    localStorage.setItem("hm_demo_ratio", clamped);
    setDemoRatioState(clamped);
  };

  /**
   * applyDemo(value, type)
   * - type "amount"  → multiply by ratio, round to nearest 100
   * - type "count"   → multiply by ratio, round down (floor)
   * - type "raw"     → multiply by ratio (no rounding)
   */
  const applyDemo = (value, type = "amount") => {
    if (!isDemoMode) return value;
    if (type === "count")  return Math.max(1, Math.floor(value * demoRatio));
    if (type === "amount") return Math.round((value * demoRatio) / 100) * 100;
    return value * demoRatio;
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode, demoRatio, setDemoRatio, applyDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
