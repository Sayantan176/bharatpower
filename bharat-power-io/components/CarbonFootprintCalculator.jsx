"use client";

import { useState, useEffect } from "react";
import {
  Leaf, Car, Plane, Bus, Zap, Flame, ShoppingCart,
  Terminal, Activity, AlertTriangle, Wind, Globe,
  ChevronRight, TrendingUp, TrendingDown, Info, RefreshCw,
  TreePine, BarChart2, Radio,
} from "lucide-react";

// ─────────────────────────────────────────────
// EMISSION FACTORS (India-specific, kg CO₂e per unit)
// ─────────────────────────────────────────────
const EF = {
  // Energy
  electricityGrid:   0.82,   // kg CO₂e / kWh  (CEA 2023 grid emission factor)
  lpg:               2.983,  // kg CO₂e / kg LPG
  png:               2.02,   // kg CO₂e / m³ PNG / natural gas

  // Transport — per km
  petrolCar:         0.192,  // kg CO₂e / km
  dieselCar:         0.171,  // kg CO₂e / km
  ev:                0.082,  // kg CO₂e / km (grid-charged)
  bus:               0.089,  // kg CO₂e / km
  train:             0.041,  // kg CO₂e / km

  // Flights — per hour
  shortHaul:         255,    // kg CO₂e / hour (incl. RFI multiplier)
  longHaul:          195,    // kg CO₂e / hour (longer = more efficient per hr)

  // Spend-proxy (food & goods) — per ₹1000 spent
  foodSpend:         0.61,   // kg CO₂e / ₹1000
  goodsSpend:        0.48,   // kg CO₂e / ₹1000
};

// Trees offset ~21 kg CO₂/year each (standard IPCC value)
const KG_PER_TREE_PER_YEAR = 21;

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    background: #0a0f1a;
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }

  .mono { font-family: 'JetBrains Mono', monospace !important; }

  @keyframes pulse-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }

  @keyframes scan-line {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @keyframes carbon-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }

  @keyframes bar-grow {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }

  .panel {
    background: #0d1526;
    border: 1px solid rgba(100,116,139,0.25);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4);
    position: relative;
  }

  .panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(34,197,94,0.4), transparent);
  }

  .panel-header {
    background: rgba(15,23,42,0.8);
    border-bottom: 1px solid rgba(100,116,139,0.2);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .panel-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: #475569;
    font-weight: 500;
  }

  .led-green  { color: #22c55e; text-shadow: 0 0 8px rgba(34,197,94,0.6); }
  .led-blue   { color: #3b82f6; text-shadow: 0 0 8px rgba(59,130,246,0.6); }
  .led-orange { color: #f97316; text-shadow: 0 0 8px rgba(249,115,22,0.6); }
  .led-amber  { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.6); }
  .led-red    { color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.6); }

  .readout {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
  }

  .bevel-inset {
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.04);
  }

  .grid-line {
    background-image:
      linear-gradient(rgba(100,116,139,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(100,116,139,0.04) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .score-bar {
    height: 6px;
    background: rgba(15,23,42,0.8);
    border: 1px solid rgba(100,116,139,0.2);
    overflow: hidden;
  }

  .input-field {
    background: rgba(9,14,28,0.8);
    border: 1px solid rgba(100,116,139,0.25);
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 6px 10px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .input-field:focus {
    border-color: rgba(34,197,94,0.5);
    box-shadow: 0 0 0 2px rgba(34,197,94,0.08);
    color: #e2e8f0;
  }

  .input-field::placeholder { color: #1e293b; }

  select.input-field {
    appearance: none;
    cursor: pointer;
  }

  .toggle-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    padding: 5px 14px;
    border: 1px solid rgba(100,116,139,0.3);
    background: transparent;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn.active {
    background: rgba(34,197,94,0.12);
    border-color: rgba(34,197,94,0.5);
    color: #22c55e;
    text-shadow: 0 0 8px rgba(34,197,94,0.5);
  }

  .toggle-btn:hover:not(.active) {
    border-color: rgba(100,116,139,0.5);
    color: #64748b;
  }

  .result-card {
    background: rgba(9,14,28,0.6);
    border: 1px solid rgba(100,116,139,0.18);
    padding: 12px 14px;
    position: relative;
    overflow: hidden;
  }

  .result-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(34,197,94,0.2), transparent);
  }

  .scan-overlay {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(to bottom, rgba(34,197,94,0.03), transparent);
    animation: scan-line 4s linear infinite;
    pointer-events: none;
  }

  .advisor-tip {
    border-left: 2px solid rgba(34,197,94,0.4);
    padding: 8px 12px;
    background: rgba(34,197,94,0.04);
    margin-bottom: 6px;
  }

  .advisor-tip-warn {
    border-left: 2px solid rgba(245,158,11,0.4);
    background: rgba(245,158,11,0.04);
  }

  .advisor-tip-critical {
    border-left: 2px solid rgba(239,68,68,0.4);
    background: rgba(239,68,68,0.04);
  }

  .section-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(100,116,139,0.08);
  }

  .section-row:last-child { border-bottom: none; }

  .emission-bar-segment {
    height: 100%;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmt = (n, dec = 1) =>
  Number(n).toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const fmtInt = (n) =>
  Math.round(n).toLocaleString("en-IN");

const getRatingConfig = (kgCO2) => {
  // Monthly thresholds (India average ~125 kg/month)
  if (kgCO2 <= 80)   return { rating: "LOW",      color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.4)",   glow: "rgba(34,197,94,0.6)"  };
  if (kgCO2 <= 150)  return { rating: "NEUTRAL",  color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.4)",  glow: "rgba(59,130,246,0.6)" };
  if (kgCO2 <= 300)  return { rating: "HIGH",     color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.4)",  glow: "rgba(249,115,22,0.6)" };
  return                    { rating: "CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.4)",   glow: "rgba(239,68,68,0.6)"  };
};

const getLoadColor = (pct) => {
  if (pct <= 30)  return "#22c55e";
  if (pct <= 55)  return "#3b82f6";
  if (pct <= 75)  return "#f97316";
  return "#ef4444";
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// Reusable labeled input row (mirrors ApplianceRow pattern)
const InputRow = ({ label, children, unit }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
    <span style={{ color: "#475569", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
      {label}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ flex: 1 }}>{children}</div>
      {unit && (
        <span style={{ color: "#334155", fontSize: "10px", fontFamily: "monospace", minWidth: "32px" }}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

// Section panel with icon header
const ModulePanel = ({ icon: Icon, iconColor, title, badge, children }) => (
  <div className="panel" style={{ marginBottom: "12px" }}>
    <div className="panel-header">
      <Icon size={11} color={iconColor} />
      <span className="panel-label">{title}</span>
      {badge && (
        <div style={{
          marginLeft: "auto", padding: "1px 8px",
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
          fontSize: "9px", fontFamily: "monospace", color: "#3b82f6", letterSpacing: "0.08em",
        }}>
          {badge}
        </div>
      )}
    </div>
    <div style={{ padding: "12px 14px" }}>{children}</div>
  </div>
);

// Result metric card
const MetricCard = ({ label, value, unit, color, sublabel }) => (
  <div className="result-card">
    <div style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em", marginBottom: "6px" }}>
      {label}
    </div>
    <div className="readout" style={{
      fontSize: "22px", fontWeight: "700", color,
      textShadow: `0 0 12px ${color}66`,
      lineHeight: 1,
    }}>
      {value}
    </div>
    <div style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", marginTop: "4px" }}>
      {unit}
    </div>
    {sublabel && (
      <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", marginTop: "4px" }}>
        {sublabel}
      </div>
    )}
  </div>
);

// Emission source bar (horizontal stacked)
const EmissionBreakdownBar = ({ sources }) => {
  const total = sources.reduce((s, x) => s + x.value, 0) || 1;
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7"];

  return (
    <div>
      <div style={{ display: "flex", height: "20px", overflow: "hidden", border: "1px solid rgba(100,116,139,0.2)", marginBottom: "8px" }}>
        {sources.map((s, i) => (
          <div
            key={s.label}
            className="emission-bar-segment"
            title={`${s.label}: ${fmt(s.value)} kg`}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: COLORS[i % COLORS.length],
              opacity: 0.85,
              boxShadow: `inset 0 0 6px rgba(0,0,0,0.4)`,
              borderRight: i < sources.length - 1 ? "1px solid rgba(0,0,0,0.4)" : "none",
              transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {sources.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{
              width: "8px", height: "8px",
              background: COLORS[i % COLORS.length],
              boxShadow: `0 0 4px ${COLORS[i % COLORS.length]}88`,
            }} />
            <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace" }}>
              {s.label}
            </span>
            <span className="readout" style={{ color: COLORS[i % COLORS.length], fontSize: "9px" }}>
              {((s.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Smart advisor tip row
const AdvisorTip = ({ icon: Icon, text, severity = "normal" }) => {
  const cls = severity === "critical" ? "advisor-tip-critical"
            : severity === "warn"     ? "advisor-tip-warn"
            :                           "";
  const color = severity === "critical" ? "#ef4444"
              : severity === "warn"     ? "#f59e0b"
              :                           "#22c55e";
  return (
    <div className={`advisor-tip ${cls}`} style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <Icon size={11} color={color} style={{ marginTop: "1px", flexShrink: 0 }} />
        <span style={{ color: "#64748b", fontSize: "10px", fontFamily: "monospace", lineHeight: "1.5" }}>
          {text}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CALCULATION ENGINE
// ─────────────────────────────────────────────
const calculate = (inputs, timeframe) => {
  const m = timeframe === "Monthly" ? 1 : 12; // multiplier for yearly

  // ── Energy
  const electricKg = (parseFloat(inputs.electricity) || 0) * EF.electricityGrid;

  const fuelType = inputs.fuelType;
  let fuelKg = 0;
  if (fuelType === "LPG")  fuelKg = (parseFloat(inputs.fuelQty) || 0) * EF.lpg;
  if (fuelType === "PNG")  fuelKg = (parseFloat(inputs.fuelQty) || 0) * EF.png;

  const energyTotal = electricKg + fuelKg;

  // ── Transport
  const vehicleEF = { Petrol: EF.petrolCar, Diesel: EF.dieselCar, EV: EF.ev }[inputs.vehicleType] || 0;
  const vehicleKg = (parseFloat(inputs.vehicleDist) || 0) * vehicleEF;

  const shortHaulKg = (parseFloat(inputs.shortHaulHrs) || 0) * EF.shortHaul;
  const longHaulKg  = (parseFloat(inputs.longHaulHrs)  || 0) * EF.longHaul;

  const busKg   = (parseFloat(inputs.busDist)   || 0) * EF.bus;
  const trainKg = (parseFloat(inputs.trainDist) || 0) * EF.train;

  const transportTotal = vehicleKg + shortHaulKg + longHaulKg + busKg + trainKg;

  // ── Lifestyle
  const foodKg  = ((parseFloat(inputs.foodSpend)  || 0) / 1000) * EF.foodSpend  * 1000;
  const goodsKg = ((parseFloat(inputs.goodsSpend) || 0) / 1000) * EF.goodsSpend * 1000;
  const lifestyleTotal = foodKg + goodsKg;

  // ── Totals
  const totalKg   = energyTotal + transportTotal + lifestyleTotal;
  const totalTons = totalKg / 1000;

  // Scale to timeframe
  const scaledKg   = totalKg   * (timeframe === "Monthly" ? 1 : 12);
  const scaledTons = scaledKg  / 1000;

  // Trees needed (yearly equivalent)
  const annualKg   = timeframe === "Monthly" ? totalKg * 12 : totalKg;
  const treesNeeded = Math.ceil(annualKg / KG_PER_TREE_PER_YEAR);

  // Load index (0–100, where 100 = 600 kg/month)
  const maxRef   = timeframe === "Monthly" ? 600 : 7200;
  const loadPct  = Math.min((scaledKg / maxRef) * 100, 100);

  const rating   = getRatingConfig(totalKg); // always monthly-scale rating

  // Sources for breakdown bar
  const sources = [
    { label: "ENERGY",     value: energyTotal    },
    { label: "TRANSPORT",  value: transportTotal },
    { label: "LIFESTYLE",  value: lifestyleTotal },
  ].filter(s => s.value > 0);

  // Detailed breakdown
  const breakdown = [
    { label: "Grid Electricity", value: electricKg,     pct: totalKg > 0 ? electricKg    / totalKg * 100 : 0 },
    { label: "Heating Fuel",     value: fuelKg,         pct: totalKg > 0 ? fuelKg         / totalKg * 100 : 0 },
    { label: "Personal Vehicle", value: vehicleKg,      pct: totalKg > 0 ? vehicleKg      / totalKg * 100 : 0 },
    { label: "Flights (Short)",  value: shortHaulKg,    pct: totalKg > 0 ? shortHaulKg    / totalKg * 100 : 0 },
    { label: "Flights (Long)",   value: longHaulKg,     pct: totalKg > 0 ? longHaulKg     / totalKg * 100 : 0 },
    { label: "Bus / Train",      value: busKg + trainKg,pct: totalKg > 0 ? (busKg+trainKg)/ totalKg * 100 : 0 },
    { label: "Food & Diet",      value: foodKg,         pct: totalKg > 0 ? foodKg         / totalKg * 100 : 0 },
    { label: "Goods & Shopping", value: goodsKg,        pct: totalKg > 0 ? goodsKg        / totalKg * 100 : 0 },
  ].filter(b => b.value > 0).sort((a, b) => b.value - a.value);

  return {
    scaledKg, scaledTons, loadPct, rating, treesNeeded,
    sources, breakdown,
    byCategory: { energyTotal, transportTotal, lifestyleTotal },
  };
};

// ─────────────────────────────────────────────
// ADVISOR TIPS ENGINE
// ─────────────────────────────────────────────
const getAdvisorTips = (inputs, results) => {
  const tips = [];
  const { energyTotal, transportTotal, lifestyleTotal } = results.byCategory;
  const total = results.scaledKg;

  if (energyTotal > transportTotal && energyTotal > lifestyleTotal) {
    tips.push({ icon: Zap, text: "Your energy footprint dominates. Switch to a green tariff or install rooftop solar — Indian solar IRRs exceed 18% in most states.", severity: "warn" });
  }

  if ((parseFloat(inputs.electricity) || 0) > 250) {
    tips.push({ icon: Activity, text: "Electricity consumption >250 kWh/month. Consider BEE 5-star rated ACs and inverter compressors — up to 40% savings possible.", severity: "warn" });
  }

  if (inputs.fuelType !== "None" && (parseFloat(inputs.fuelQty) || 0) > 15) {
    tips.push({ icon: Flame, text: "High fuel usage detected. Consider switching to induction cooking — 3× more efficient than LPG with zero indoor air pollution.", severity: "warn" });
  }

  if (inputs.vehicleType === "Petrol" && (parseFloat(inputs.vehicleDist) || 0) > 500) {
    tips.push({ icon: Car, text: "High petrol distance. An EV like the Tata Nexon EV would cut your transport emissions by ~57% at current grid intensity.", severity: "warn" });
  }

  if (inputs.vehicleType === "EV") {
    tips.push({ icon: Wind, text: "Good: EV running on Indian grid emits ~0.082 kg CO₂/km. Charging during off-peak (23:00–06:00) can reduce real-world intensity further.", severity: "normal" });
  }

  if ((parseFloat(inputs.shortHaulHrs) || 0) > 0 || (parseFloat(inputs.longHaulHrs) || 0) > 0) {
    tips.push({ icon: Plane, text: "Aviation is carbon-intensive. One long-haul hour ≈ 195 kg CO₂e. Consider train alternatives for routes <600 km.", severity: "critical" });
  }

  if (transportTotal > total * 0.5) {
    tips.push({ icon: Bus, text: "Transport is >50% of your footprint. Switching to metro/train for daily commute can reduce this by 4–8× vs petrol car.", severity: "warn" });
  }

  if ((parseFloat(inputs.trainDist) || 0) > 50) {
    tips.push({ icon: TrendingDown, text: "Excellent: Indian Railways is one of the lowest-emission transport networks globally at ~0.041 kg CO₂/km.", severity: "normal" });
  }

  if (results.scaledKg < 80) {
    tips.push({ icon: Leaf, text: "Low carbon footprint! You are well below the Indian average of ~125 kg CO₂e/month. Consider a carbon offset scheme to go carbon-neutral.", severity: "normal" });
  }

  if (results.scaledKg > 300) {
    tips.push({ icon: AlertTriangle, text: "Critical load — footprint is 2× the Indian average. Immediate high-impact actions: reduce flights, switch to EV/public transport, shift to green energy.", severity: "critical" });
  }

  if (tips.length === 0) {
    tips.push({ icon: Info, text: "Enter your usage data above to receive personalised mitigation recommendations from the Smart Advisor engine.", severity: "normal" });
  }

  return tips.slice(0, 5);
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function CarbonFootprintCalculator() {
  const [timeframe, setTimeframe] = useState("Monthly");
  const [time, setTime]           = useState(new Date());

  const [inputs, setInputs] = useState({
    // Energy
    electricity: "",
    fuelType:    "LPG",
    fuelQty:     "",
    // Transport
    vehicleType: "Petrol",
    vehicleDist: "",
    shortHaulHrs:"",
    longHaulHrs: "",
    busDist:     "",
    trainDist:   "",
    // Lifestyle
    foodSpend:   "",
    goodsSpend:  "",
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const set = (key) => (e) => setInputs((p) => ({ ...p, [key]: e.target.value }));

  const results = calculate(inputs, timeframe);
  const tips    = getAdvisorTips(inputs, results);
  const rc      = results.rating;
  const loadColor = getLoadColor(results.loadPct);

  const hasData = results.scaledKg > 0;

  return (
    <>
      <style>{STYLES}</style>

      <div className="grid-line" style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        fontFamily: "'JetBrains Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Scan line */}
        <div className="scan-overlay" />

        {/* ── HEADER ── */}
        <header style={{
          borderBottom: "1px solid rgba(100,116,139,0.2)",
          padding: "10px 20px",
          background: "rgba(9,14,28,0.9)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(8px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "8px", height: "8px",
              background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.8)",
              animation: "pulse-ring 2s infinite",
            }} />
            <span className="led-green" style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: "600" }}>
              BHARATPOWER.IO
            </span>
            <div style={{ width: "1px", height: "14px", background: "rgba(100,116,139,0.3)" }} />
            <Leaf size={11} color="#22c55e" />
            <span style={{ color: "#334155", fontSize: "10px", letterSpacing: "0.15em" }}>
              CARBON FOOTPRINT CALCULATOR
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Timeframe toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              {["Monthly", "Yearly"].map((t) => (
                <button
                  key={t}
                  className={`toggle-btn ${timeframe === t ? "active" : ""}`}
                  onClick={() => setTimeframe(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Radio size={10} color="#334155" />
              <span className="readout" style={{ color: "#334155", fontSize: "10px" }}>
                {time.toLocaleTimeString("en-IN", { hour12: false })}
              </span>
            </div>
          </div>
        </header>

        {/* ── MAIN GRID ── */}
        <main style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          padding: "16px 20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>

          {/* ═══════════════════════════════════
              LEFT COLUMN — INPUT PANELS
          ═══════════════════════════════════ */}
          <div>

            {/* ── ENERGY MODULE ── */}
            <ModulePanel icon={Zap} iconColor="#f59e0b" title="ENERGY MODULE" badge="GRID + FUEL">
              <InputRow label="ELECTRICITY CONSUMPTION" unit="kWh">
                <input
                  className="input-field"
                  type="number" min="0"
                  placeholder={timeframe === "Monthly" ? "e.g. 200" : "e.g. 2400"}
                  value={inputs.electricity}
                  onChange={set("electricity")}
                />
              </InputRow>

              <InputRow label="HEATING FUEL TYPE" unit="">
                <select className="input-field" value={inputs.fuelType} onChange={set("fuelType")}>
                  <option value="None">None / Electric</option>
                  <option value="LPG">LPG (cylinder)</option>
                  <option value="PNG">PNG / Natural Gas</option>
                </select>
              </InputRow>

              {inputs.fuelType !== "None" && (
                <InputRow
                  label={inputs.fuelType === "LPG" ? "LPG CONSUMED" : "GAS CONSUMED"}
                  unit={inputs.fuelType === "LPG" ? "kg" : "m³"}
                >
                  <input
                    className="input-field"
                    type="number" min="0"
                    placeholder={inputs.fuelType === "LPG" ? "e.g. 14.2" : "e.g. 20"}
                    value={inputs.fuelQty}
                    onChange={set("fuelQty")}
                  />
                </InputRow>
              )}

              {/* Mini energy summary */}
              <div style={{
                marginTop: "10px", padding: "8px 10px",
                background: "rgba(9,14,28,0.5)", border: "1px solid rgba(100,116,139,0.15)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>ENERGY CO₂e</span>
                <span className="readout led-amber" style={{ fontSize: "11px" }}>
                  {fmt(results.byCategory.energyTotal)} <span style={{ fontSize: "9px", color: "#475569" }}>kg/mo</span>
                </span>
              </div>
            </ModulePanel>

            {/* ── TRANSPORT MODULE ── */}
            <ModulePanel icon={Car} iconColor="#3b82f6" title="TRANSPORT MODULE" badge="ROAD + AIR + RAIL">
              <InputRow label="VEHICLE TYPE" unit="">
                <select className="input-field" value={inputs.vehicleType} onChange={set("vehicleType")}>
                  <option value="Petrol">Petrol Car</option>
                  <option value="Diesel">Diesel Car</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="None">No Personal Vehicle</option>
                </select>
              </InputRow>

              {inputs.vehicleType !== "None" && (
                <InputRow label="DISTANCE DRIVEN" unit="km">
                  <input
                    className="input-field"
                    type="number" min="0"
                    placeholder={timeframe === "Monthly" ? "e.g. 800" : "e.g. 9600"}
                    value={inputs.vehicleDist}
                    onChange={set("vehicleDist")}
                  />
                </InputRow>
              )}

              {/* Flights */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 0 4px",
                borderTop: "1px solid rgba(100,116,139,0.1)",
                marginTop: "6px", marginBottom: "4px",
              }}>
                <Plane size={10} color="#f97316" />
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  FLIGHT TRACKER
                </span>
              </div>

              <InputRow label="SHORT-HAUL FLIGHT HRS" unit="hr">
                <input
                  className="input-field"
                  type="number" min="0" step="0.5"
                  placeholder="e.g. 2"
                  value={inputs.shortHaulHrs}
                  onChange={set("shortHaulHrs")}
                />
              </InputRow>

              <InputRow label="LONG-HAUL FLIGHT HRS" unit="hr">
                <input
                  className="input-field"
                  type="number" min="0" step="0.5"
                  placeholder="e.g. 8"
                  value={inputs.longHaulHrs}
                  onChange={set("longHaulHrs")}
                />
              </InputRow>

              {/* Public transport */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 0 4px",
                borderTop: "1px solid rgba(100,116,139,0.1)",
                marginTop: "6px", marginBottom: "4px",
              }}>
                <Bus size={10} color="#22c55e" />
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  PUBLIC TRANSPORT
                </span>
              </div>

              <InputRow label="BUS DISTANCE" unit="km">
                <input
                  className="input-field"
                  type="number" min="0"
                  placeholder="e.g. 60"
                  value={inputs.busDist}
                  onChange={set("busDist")}
                />
              </InputRow>

              <InputRow label="TRAIN / METRO DISTANCE" unit="km">
                <input
                  className="input-field"
                  type="number" min="0"
                  placeholder="e.g. 120"
                  value={inputs.trainDist}
                  onChange={set("trainDist")}
                />
              </InputRow>

              <div style={{
                marginTop: "10px", padding: "8px 10px",
                background: "rgba(9,14,28,0.5)", border: "1px solid rgba(100,116,139,0.15)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>TRANSPORT CO₂e</span>
                <span className="readout led-blue" style={{ fontSize: "11px" }}>
                  {fmt(results.byCategory.transportTotal)} <span style={{ fontSize: "9px", color: "#475569" }}>kg/mo</span>
                </span>
              </div>
            </ModulePanel>

            {/* ── LIFESTYLE MODULE ── */}
            <ModulePanel icon={ShoppingCart} iconColor="#a855f7" title="LIFESTYLE MODULE" badge="SPEND PROXY">
              <div style={{
                padding: "6px 0 10px",
                color: "#334155", fontSize: "9px", fontFamily: "monospace", lineHeight: "1.5",
              }}>
                Spend-based proxy: emission factors derived from Indian input-output LCA tables.
                Enter your average {timeframe.toLowerCase()} spend in ₹.
              </div>

              <InputRow label="FOOD & DIET SPEND" unit="₹">
                <input
                  className="input-field"
                  type="number" min="0"
                  placeholder={timeframe === "Monthly" ? "e.g. 6000" : "e.g. 72000"}
                  value={inputs.foodSpend}
                  onChange={set("foodSpend")}
                />
              </InputRow>

              <InputRow label="GOODS & SHOPPING SPEND" unit="₹">
                <input
                  className="input-field"
                  type="number" min="0"
                  placeholder={timeframe === "Monthly" ? "e.g. 3000" : "e.g. 36000"}
                  value={inputs.goodsSpend}
                  onChange={set("goodsSpend")}
                />
              </InputRow>

              <div style={{
                marginTop: "10px", padding: "8px 10px",
                background: "rgba(9,14,28,0.5)", border: "1px solid rgba(100,116,139,0.15)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>LIFESTYLE CO₂e</span>
                <span className="readout" style={{ fontSize: "11px", color: "#a855f7", textShadow: "0 0 8px rgba(168,85,247,0.6)" }}>
                  {fmt(results.byCategory.lifestyleTotal)} <span style={{ fontSize: "9px", color: "#475569" }}>kg/mo</span>
                </span>
              </div>
            </ModulePanel>

          </div>

          {/* ═══════════════════════════════════
              RIGHT COLUMN — ANALYSIS PANELS
          ═══════════════════════════════════ */}
          <div>

            {/* ── RESULT CARDS ── */}
            <div className="panel" style={{ marginBottom: "12px" }}>
              <div className="panel-header">
                <Activity size={11} color="#22c55e" />
                <span className="panel-label">CARBON IMPACT ANALYSIS</span>
                <div style={{
                  marginLeft: "auto",
                  padding: "1px 8px",
                  background: rc.bg,
                  border: `1px solid ${rc.border}`,
                  fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em",
                  color: rc.color,
                  textShadow: `0 0 8px ${rc.glow}`,
                  animation: rc.rating === "CRITICAL" ? "carbon-pulse 1.5s infinite" : "none",
                }}>
                  ● {rc.rating}
                </div>
              </div>

              <div style={{ padding: "12px 14px" }}>
                {/* Result card grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  <MetricCard
                    label={`TOTAL CO₂e (${timeframe.toUpperCase()})`}
                    value={fmt(results.scaledKg, 1)}
                    unit="kg CO₂e"
                    color={rc.color}
                    sublabel={`= ${fmt(results.scaledTons, 3)} tCO₂e`}
                  />
                  <MetricCard
                    label="CARBON RATING"
                    value={rc.rating}
                    unit={`vs. 125 kg/mo Indian avg`}
                    color={rc.color}
                    sublabel={hasData ? (results.scaledKg <= 125 ? "▼ BELOW AVERAGE" : "▲ ABOVE AVERAGE") : "—"}
                  />
                  <MetricCard
                    label="TREES TO OFFSET"
                    value={hasData ? fmtInt(results.treesNeeded) : "—"}
                    unit="trees/year (IPCC std)"
                    color="#22c55e"
                    sublabel="@ 21 kg CO₂/tree/yr"
                  />
                  <MetricCard
                    label="ANNUALISED FOOTPRINT"
                    value={hasData ? fmt(results.scaledKg * (timeframe === "Monthly" ? 12 : 1), 0) : "—"}
                    unit="kg CO₂e / year"
                    color="#3b82f6"
                    sublabel={hasData ? `${fmt(results.scaledKg * (timeframe === "Monthly" ? 12 : 1) / 1000, 2)} tCO₂e/yr` : "—"}
                  />
                </div>

                {/* ── CARBON LOAD INDEX ── */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
                      CARBON LOAD INDEX
                    </span>
                    <span className="readout" style={{ color: loadColor, fontSize: "10px", textShadow: `0 0 6px ${loadColor}88` }}>
                      {hasData ? `${results.loadPct.toFixed(0)}%` : "—"}
                    </span>
                  </div>
                  <div style={{
                    height: "12px",
                    background: "rgba(9,14,28,0.8)",
                    border: "1px solid rgba(100,116,139,0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }} className="bevel-inset">
                    <div style={{
                      height: "100%",
                      width: `${results.loadPct}%`,
                      background: `linear-gradient(to right, #22c55e, ${loadColor})`,
                      boxShadow: `0 0 10px ${loadColor}66`,
                      transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                    }}>
                      {/* Scanline shimmer */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 9px)",
                      }} />
                    </div>
                    {/* Threshold markers */}
                    {[30, 55, 75].map((m) => (
                      <div key={m} style={{
                        position: "absolute", left: `${m}%`, top: 0, bottom: 0,
                        width: "1px", background: "rgba(100,116,139,0.3)",
                      }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                    {["LOW", "NEUTRAL", "HIGH", "CRITICAL"].map((l, i) => {
                      const cl = ["#22c55e", "#3b82f6", "#f97316", "#ef4444"][i];
                      return (
                        <span key={l} style={{ color: cl, fontSize: "8px", fontFamily: "monospace", opacity: 0.7 }}>
                          {l}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* ── EMISSION BREAKDOWN BAR ── */}
                <div>
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
                      PEAK EMISSION SOURCES
                    </span>
                  </div>
                  {hasData
                    ? <EmissionBreakdownBar sources={results.sources} />
                    : <div style={{ color: "#1e293b", fontSize: "10px", fontFamily: "monospace", padding: "8px 0" }}>
                        — NO DATA — ENTER VALUES IN LEFT PANELS —
                      </div>
                  }
                </div>
              </div>
            </div>

            {/* ── DETAILED BREAKDOWN TABLE ── */}
            {hasData && (
              <div className="panel" style={{ marginBottom: "12px" }}>
                <div className="panel-header">
                  <BarChart2 size={11} color="#3b82f6" />
                  <span className="panel-label">EMISSION SOURCE BREAKDOWN</span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {results.breakdown.map((item, i) => (
                    <div key={item.label} className="section-row" style={{ padding: "7px 14px" }}>
                      <span style={{ color: "#475569", fontSize: "10px", fontFamily: "monospace", flex: 1 }}>
                        {item.label}
                      </span>
                      <div className="score-bar" style={{ width: "100px", marginRight: "10px" }}>
                        <div style={{
                          height: "100%",
                          width: `${item.pct}%`,
                          background: i === 0 ? "#ef4444" : i === 1 ? "#f97316" : i === 2 ? "#f59e0b" : "#3b82f6",
                          boxShadow: `0 0 4px ${i === 0 ? "#ef444488" : "#3b82f688"}`,
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <span className="readout" style={{
                        color: "#64748b", fontSize: "10px", minWidth: "80px", textAlign: "right",
                      }}>
                        {fmt(item.value, 1)} kg
                      </span>
                      <span className="readout" style={{
                        color: i === 0 ? "#ef4444" : "#475569",
                        fontSize: "10px", minWidth: "38px", textAlign: "right",
                        textShadow: i === 0 ? "0 0 6px rgba(239,68,68,0.5)" : "none",
                      }}>
                        {item.pct.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SMART ADVISOR ── */}
            <div className="panel">
              <div className="panel-header">
                <TreePine size={11} color="#22c55e" />
                <span className="panel-label">SMART CARBON ADVISOR</span>
                <div style={{
                  marginLeft: "auto", padding: "1px 8px",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                  fontSize: "9px", fontFamily: "monospace", color: "#22c55e",
                }}>
                  AI MITIGATION ENGINE
                </div>
              </div>
              <div style={{ padding: "12px 14px" }}>
                {tips.map((tip, i) => (
                  <AdvisorTip key={i} icon={tip.icon} text={tip.text} severity={tip.severity} />
                ))}

                {/* Equivalent offset visualiser */}
                {hasData && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: "rgba(34,197,94,0.05)",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <Globe size={10} color="#22c55e" />
                      <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                        EQUIVALENT OFFSET ACTIONS
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[
                        { icon: "🌳", label: "Trees to plant", val: fmtInt(results.treesNeeded) + " /yr" },
                        { icon: "🚗", label: "Car km equivalent", val: fmtInt(results.scaledKg / 0.192) + " km" },
                        { icon: "💡", label: "LED bulb-hours", val: fmtInt(results.scaledKg / (9 * EF.electricityGrid / 1000)) + " hr" },
                        { icon: "✈️", label: "Short-haul flight hrs", val: fmt(results.scaledKg / EF.shortHaul, 1) + " hr" },
                      ].map((eq) => (
                        <div key={eq.label} className="bevel-inset" style={{
                          padding: "7px 10px",
                          background: "rgba(9,14,28,0.6)",
                          border: "1px solid rgba(100,116,139,0.15)",
                        }}>
                          <div style={{ fontSize: "14px", marginBottom: "3px" }}>{eq.icon}</div>
                          <div style={{ color: "#334155", fontSize: "8px", fontFamily: "monospace" }}>{eq.label}</div>
                          <div className="readout led-green" style={{ fontSize: "11px", fontWeight: "600" }}>{eq.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid rgba(100,116,139,0.15)",
          padding: "10px 20px",
          background: "rgba(9,14,28,0.8)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Terminal size={11} color="#334155" />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              DATA SOURCES: CEA 2023 GRID EF · IPCC AR6 · MoEFCC · UNFCCC INDIA NDC
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              GRID EF: 0.82 kg CO₂e/kWh · TREE OFFSET: 21 kg CO₂/yr
            </span>
            <div style={{ width: "1px", height: "12px", background: "rgba(100,116,139,0.2)" }} />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              © 2025 BHARATPOWER.IO — ESTIMATES ONLY · NOT FOR COMPLIANCE REPORTING
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
