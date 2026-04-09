"use client";

import { useState, useEffect } from "react";
import {
  Zap, Activity, Plus, Trash2, AlertTriangle, Info,
  TrendingUp, TrendingDown, Terminal, Radio, Clock,
  BarChart2, CheckCircle, ChevronRight, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STATE_TARIFFS = {
  MH: { name: "Maharashtra", price: 8.45 },
  KA: { name: "Karnataka",   price: 6.20 },
  DL: { name: "Delhi",       price: 9.10 },
  GJ: { name: "Gujarat",     price: 7.30 },
  TN: { name: "Tamil Nadu",  price: 5.85 },
  UP: { name: "Uttar Pradesh", price: 8.90 },
  RJ: { name: "Rajasthan",   price: 7.65 },
  WB: { name: "West Bengal", price: 7.10 },
  MP: { name: "Madhya Pradesh", price: 6.80 },
  AP: { name: "Andhra Pradesh", price: 6.15 },
  TS: { name: "Telangana",   price: 6.40 },
  OR: { name: "Odisha",      price: 5.50 },
};

const PRESET_APPLIANCES = [
  { label: "Air Conditioner (1.5T)",  watts: 1500 },
  { label: "Refrigerator (300L)",     watts: 150  },
  { label: "Ceiling Fan",             watts: 75   },
  { label: "Washing Machine",         watts: 500  },
  { label: "Microwave Oven",          watts: 1000 },
  { label: "LED TV (55\")",           watts: 120  },
  { label: "Water Heater (Geyser)",   watts: 2000 },
  { label: "Laptop",                  watts: 65   },
  { label: "Electric Iron",           watts: 1000 },
  { label: "Mixer / Grinder",         watts: 750  },
  { label: "LED Bulb (9W)",           watts: 9    },
  { label: "Custom Appliance",        watts: 0    },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const calcEnergy = ({ watts, hoursPerDay, daysPerMonth, costPerKwh }) => {
  const w    = parseFloat(watts)        || 0;
  const h    = parseFloat(hoursPerDay)  || 0;
  const d    = parseFloat(daysPerMonth) || 0;
  const rate = parseFloat(costPerKwh)   || 0;

  const dailyKwh   = (w * h) / 1000;
  const monthlyKwh = dailyKwh * d;
  const yearlykwh  = monthlyKwh * 12;
  const monthlyCost = monthlyKwh * rate;
  const yearlyCost  = yearlykwh  * rate;

  return { dailyKwh, monthlyKwh, yearlykwh, monthlyCost, yearlyCost };
};

const getCostColor = (monthlyCost) => {
  if (monthlyCost <= 200)  return "#22c55e";
  if (monthlyCost <= 600)  return "#f59e0b";
  if (monthlyCost <= 1200) return "#f97316";
  return "#ef4444";
};

const getUsageLevel = (monthlyKwh) => {
  if (monthlyKwh <= 30)  return { level: "EFFICIENT",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.35)"  };
  if (monthlyKwh <= 100) return { level: "MODERATE",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.35)" };
  if (monthlyKwh <= 250) return { level: "HIGH",       color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.35)" };
  return                        { level: "CRITICAL",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.35)"  };
};

const fmt = (n, dec = 2) => n.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });

let _uid = 1;
const uid = () => _uid++;

const makeAppliance = () => ({
  id:           uid(),
  presetIdx:    0,
  name:         PRESET_APPLIANCES[0].label,
  watts:        String(PRESET_APPLIANCES[0].watts),
  hoursPerDay:  "8",
  daysPerMonth: "30",
});

// ─────────────────────────────────────────────
// STYLES STRING
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
    background: linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent);
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
    background-image: repeating-linear-gradient(
      0deg,
      transparent, transparent 39px,
      rgba(59,130,246,0.04) 39px, rgba(59,130,246,0.04) 40px
    );
  }

  .scan-overlay {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.08), transparent);
    pointer-events: none;
    animation: scan-line 8s linear infinite;
    z-index: 100;
  }

  .inp {
    background: rgba(30,41,59,0.8);
    border: 1px solid rgba(100,116,139,0.4);
    border-bottom: 2px solid rgba(59,130,246,0.5);
    color: #e2e8f0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    padding: 7px 10px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }
  .inp:focus { border-color: rgba(59,130,246,0.8); border-bottom-color: #3b82f6; }

  .btn-primary {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.5);
    color: #22c55e;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    padding: 8px 14px;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .btn-primary:hover { background: rgba(34,197,94,0.2); box-shadow: 0 0 10px rgba(34,197,94,0.15); }

  .btn-danger {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    padding: 6px 10px;
    display: flex; align-items: center; gap: 4px;
    transition: background 0.15s;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.15); }

  .btn-blue {
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.4);
    color: #3b82f6;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 8px 14px;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s;
  }
  .btn-blue:hover { background: rgba(59,130,246,0.2); }

  .score-bar {
    height: 4px;
    background: rgba(30,41,59,0.8);
    position: relative;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0f1a; }
  ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); }
  ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }

  select.inp option { background: #1e293b; }
`;

// ─────────────────────────────────────────────
// SUB-COMPONENT: Appliance Row
// ─────────────────────────────────────────────
function ApplianceRow({ appliance, onChange, onRemove, canRemove }) {
  const handlePreset = (e) => {
    const idx = parseInt(e.target.value, 10);
    const p   = PRESET_APPLIANCES[idx];
    onChange({ ...appliance, presetIdx: idx, name: p.label, watts: String(p.watts) });
  };

  return (
    <div style={{
      background: "rgba(9,14,28,0.6)",
      border: "1px solid rgba(100,116,139,0.2)",
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}>
      {/* Row header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", background: "#3b82f6", boxShadow: "0 0 5px rgba(59,130,246,0.7)" }} />
          <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
            APPLIANCE UNIT #{appliance.id}
          </span>
        </div>
        {canRemove && (
          <button className="btn-danger" onClick={onRemove} style={{ padding: "3px 8px" }}>
            <Trash2 size={11} /> REMOVE
          </button>
        )}
      </div>

      {/* Preset selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
            APPLIANCE TYPE
          </label>
          <select className="inp" value={appliance.presetIdx} onChange={handlePreset}>
            {PRESET_APPLIANCES.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
            CUSTOM NAME
          </label>
          <input
            className="inp"
            type="text"
            value={appliance.name}
            onChange={(e) => onChange({ ...appliance, name: e.target.value })}
            placeholder="Appliance label..."
          />
        </div>
      </div>

      {/* Numeric inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        <div>
          <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
            POWER (WATTS)
          </label>
          <input
            className="inp"
            type="number"
            min="0"
            value={appliance.watts}
            onChange={(e) => onChange({ ...appliance, watts: e.target.value })}
          />
        </div>
        <div>
          <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
            HRS / DAY
          </label>
          <input
            className="inp"
            type="number"
            min="0" max="24" step="0.5"
            value={appliance.hoursPerDay}
            onChange={(e) => onChange({ ...appliance, hoursPerDay: e.target.value })}
          />
        </div>
        <div>
          <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
            DAYS / MONTH
          </label>
          <input
            className="inp"
            type="number"
            min="1" max="31"
            value={appliance.daysPerMonth}
            onChange={(e) => onChange({ ...appliance, daysPerMonth: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENT: Result Card
// ─────────────────────────────────────────────
function ResultCard({ label, value, color, glow, sub }) {
  return (
    <div style={{ background: "rgba(15,23,42,0.9)", padding: "10px 14px" }}>
      <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.09em", marginBottom: "3px" }}>
        {label}
      </div>
      <div
        className="readout"
        style={{
          color: color || "#e2e8f0",
          fontSize: "15px",
          fontWeight: "700",
          textShadow: glow ? `0 0 12px ${color}99` : "none",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace", marginTop: "2px" }}>{sub}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENT: Insight Panel
// ─────────────────────────────────────────────
function InsightPanel({ monthlyKwh, monthlyCost, yearlyCost, applianceName }) {
  const usage = getUsageLevel(monthlyKwh);

  const insights = [];

  if (monthlyKwh > 250) {
    insights.push({ icon: <AlertTriangle size={12} />, color: "#ef4444", text: "Critical consumption detected. Consider replacing with energy-efficient model." });
    insights.push({ icon: <Clock size={12} />, color: "#ef4444", text: "Schedule usage during OFF-PEAK hours (23:00–06:00) to reduce grid stress." });
  } else if (monthlyKwh > 100) {
    insights.push({ icon: <AlertTriangle size={12} />, color: "#f97316", text: "High consumption appliance detected. Monitor daily usage closely." });
    insights.push({ icon: <Clock size={12} />, color: "#f59e0b", text: "Consider shifting non-critical use to off-peak hours for lower effective tariff." });
  } else if (monthlyKwh > 30) {
    insights.push({ icon: <Info size={12} />, color: "#f59e0b", text: "Moderate consumption. Small adjustments in usage hours can yield measurable savings." });
  } else {
    insights.push({ icon: <CheckCircle size={12} />, color: "#22c55e", text: "Efficient usage profile. This appliance is operating within ideal consumption range." });
  }

  if (monthlyCost > 1000) {
    insights.push({ icon: <TrendingUp size={12} />, color: "#ef4444", text: `Annual outflow of ₹${fmt(yearlyCost, 0)} — explore inverter-grade or 5-star rated alternative.` });
  }

  if (monthlyKwh > 50) {
    insights.push({ icon: <ChevronRight size={12} />, color: "#3b82f6", text: "Installing a smart plug / timer can automate off-peak scheduling automatically." });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Status badge */}
      <div
        className="bevel-inset"
        style={{
          background: usage.bg,
          border: `1px solid ${usage.border}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
            EFFICIENCY RATING
          </div>
          <div
            className="readout"
            style={{
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "0.15em",
              color: usage.color,
              textShadow: `0 0 16px ${usage.color}88`,
              marginTop: "2px",
            }}
          >
            ◼ {usage.level}
          </div>
          <div style={{ color: "#475569", fontSize: "10px", fontFamily: "monospace", marginTop: "4px" }}>
            {fmt(monthlyKwh)} kWh / month
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
        }}>
          {[0, 1, 2, 3].map((i) => {
            const filled = monthlyKwh > [0, 30, 100, 250][i];
            const barColor = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"][i];
            return (
              <div
                key={i}
                style={{
                  width: "32px",
                  height: "6px",
                  background: filled ? barColor : "rgba(30,41,59,0.8)",
                  boxShadow: filled ? `0 0 5px ${barColor}88` : "none",
                  transition: "all 0.3s",
                }}
              />
            );
          })}
          <div style={{ color: "#334155", fontSize: "8px", fontFamily: "monospace", marginTop: "3px" }}>
            LOAD INDEX
          </div>
        </div>
      </div>

      {/* Insight bullets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((ins, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${ins.color}44`,
              background: `${ins.color}0a`,
              padding: "9px 12px",
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
            }}
          >
            <span style={{ color: ins.color, marginTop: "1px", flexShrink: 0 }}>{ins.icon}</span>
            <span style={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace", lineHeight: "1.55" }}>
              {ins.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ApplianceEnergyCalculator() {
  const [time, setTime]           = useState(new Date());
  const [blinkOn, setBlinkOn]     = useState(true);
  const [appliances, setAppliances] = useState([makeAppliance()]);
  const [selectedState, setSelectedState] = useState("WB");
  const [customRate, setCustomRate]       = useState("");
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [results, setResults]     = useState(null);
  const [calculated, setCalculated] = useState(false);
  const [liveTariffs, setLiveTariffs] = useState(null);
  const [tariffsLoading, setTariffsLoading] = useState(true);
  const [tariffsError, setTariffsError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => setBlinkOn((p) => !p), 800);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  useEffect(() => {
  const fetchLiveTariffs = async () => {
    try {
      setTariffsLoading(true);
      const res = await fetch("https://bharatpower.onrender.com/api/v1/dashboard");
      const data = await res.json();

      // Transform the statePrices array into the same shape as STATE_TARIFFS
      const transformed = {};
      data.statePrices.forEach(({ id, name, price }) => {
        transformed[id] = { name, price };
      });

      setLiveTariffs(transformed);
      setTariffsError(false);
    } catch (e) {
      console.error("Failed to fetch live tariffs:", e);
      setTariffsError(true);
    } finally {
      setTariffsLoading(false);
    }
  };

  fetchLiveTariffs();
  const interval = setInterval(fetchLiveTariffs, 60000); // refresh every 60s
  return () => clearInterval(interval);
}, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const activeTariffs = liveTariffs || STATE_TARIFFS;
  const effectiveRate = useCustomRate
    ? parseFloat(customRate) || 0
    : (activeTariffs[selectedState]?.price ?? 0);

  const addAppliance = () => setAppliances((prev) => [...prev, makeAppliance()]);

  const removeAppliance = (id) =>
    setAppliances((prev) => prev.filter((a) => a.id !== id));

  const updateAppliance = (id, updated) =>
    setAppliances((prev) => prev.map((a) => (a.id === id ? updated : a)));

  const handleCalculate = () => {
    const perAppliance = appliances.map((a) => {
      const r = calcEnergy({ ...a, costPerKwh: effectiveRate });
      return { ...a, ...r };
    });

    const totalDailyKwh    = perAppliance.reduce((s, a) => s + a.dailyKwh, 0);
    const totalMonthlyKwh  = perAppliance.reduce((s, a) => s + a.monthlyKwh, 0);
    const totalYearlyKwh   = perAppliance.reduce((s, a) => s + a.yearlykwh, 0);
    const totalMonthlyCost = perAppliance.reduce((s, a) => s + a.monthlyCost, 0);
    const totalYearlyCost  = perAppliance.reduce((s, a) => s + a.yearlyCost, 0);

    setResults({
      perAppliance,
      totalDailyKwh,
      totalMonthlyKwh,
      totalYearlyKwh,
      totalMonthlyCost,
      totalYearlyCost,
      rate: effectiveRate,
      state: selectedState,
    });
    setCalculated(true);
  };

  const isPeak = time.getHours() >= 6 && time.getHours() < 23;

  return (
    <>
      <style>{STYLES}</style>
      <div className="scan-overlay" />

      <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#e2e8f0" }}>

        {/* ── MAIN GRID ── */}
        <main
          className="grid-line"
          style={{
            padding: "16px",
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "start",
          }}
        >

          {/* ── LEFT COLUMN: INPUT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Tariff Config */}
            <div className="panel">
              <div className="panel-header">
                <BarChart2 size={11} color="#3b82f6" />
                <span className="panel-label">TARIFF CONFIGURATION</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: tariffsError ? "#ef4444" : tariffsLoading ? "#f59e0b" : "#22c55e",
                    animation: tariffsLoading ? "none" : "pulse-ring 2s infinite",
                    boxShadow: `0 0 6px ${tariffsError ? "rgba(239,68,68,0.7)" : "rgba(34,197,94,0.7)"}`,
                  }} />
                  <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>
                    {tariffsError ? "FALLBACK DATA" : tariffsLoading ? "FETCHING..." : "LIVE RATES"}
                  </span>
                </div>
              </div>
              <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* State selector */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                      SELECT STATE
                    </label>
                    <select
                      className="inp"
                      value={selectedState}
                      onChange={(e) => { setSelectedState(e.target.value); setUseCustomRate(false); }}
                    >
                      {Object.entries(activeTariffs).map(([k, v]) => (
                      <option key={k} value={k}>{k} — {v.name} (₹{v.price.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>
                      CUSTOM RATE (₹/kWh)
                    </label>
                    <input
                      className="inp"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Override tariff..."
                      value={customRate}
                      onChange={(e) => { setCustomRate(e.target.value); setUseCustomRate(!!e.target.value); }}
                    />
                  </div>
                </div>

                {/* Active rate display */}
                <div className="bevel-inset" style={{
                  background: "rgba(9,14,28,0.8)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                      EFFECTIVE TARIFF
                    </div>
                    <div className="readout led-blue" style={{ fontSize: "24px", fontWeight: "700", marginTop: "2px" }}>
                      ₹{effectiveRate.toFixed(2)}<span style={{ fontSize: "12px", fontWeight: "400", color: "#3b82f6" }}>/kWh</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>SOURCE</div>
                    <div style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace", marginTop: "2px" }}>
                      {useCustomRate ? "MANUAL OVERRIDE" : liveTariffs ? "IEX LIVE FEED" : `${activeTariffs[selectedState]?.name} SERC`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appliance list */}
            <div className="panel">
              <div className="panel-header">
                <Zap size={11} color="#f59e0b" />
                <span className="panel-label">APPLIANCE REGISTER</span>
                <span style={{ marginLeft: "auto", color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>
                  {appliances.length} UNIT{appliances.length !== 1 ? "S" : ""} LOADED
                </span>
              </div>
              <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {appliances.map((a) => (
                  <ApplianceRow
                    key={a.id}
                    appliance={a}
                    onChange={(updated) => updateAppliance(a.id, updated)}
                    onRemove={() => removeAppliance(a.id)}
                    canRemove={appliances.length > 1}
                  />
                ))}

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button className="btn-blue" onClick={addAppliance} style={{ flex: 1 }}>
                    <Plus size={13} /> ADD APPLIANCE
                  </button>
                  <button className="btn-primary" onClick={handleCalculate} style={{ flex: 1, justifyContent: "center" }}>
                    <RefreshCw size={13} /> CALCULATE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: RESULTS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {!calculated && (
              <div className="panel">
                <div className="panel-header">
                  <Activity size={11} color="#334155" />
                  <span className="panel-label">ENERGY ANALYSIS — AWAITING INPUT</span>
                </div>
                <div style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                }}>
                  <div style={{
                    width: "48px", height: "48px",
                    border: "2px solid rgba(59,130,246,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(59,130,246,0.06)",
                  }}>
                    <BarChart2 size={22} color="#334155" />
                  </div>
                  <div style={{ color: "#334155", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    CONFIGURE APPLIANCES AND PRESS CALCULATE
                  </div>
                  <div style={{ color: "#1e293b", fontSize: "10px", fontFamily: "monospace" }}>
                    RESULTS WILL APPEAR HERE
                  </div>
                </div>
              </div>
            )}

            {calculated && results && (
              <>
                {/* ── TOTAL SUMMARY ── */}
                <div className="panel">
                  <div className="panel-header">
                    <TrendingUp size={11} color="#22c55e" />
                    <span className="panel-label">TOTAL CONSUMPTION SUMMARY</span>
                    <div style={{
                      marginLeft: "auto",
                      padding: "1px 8px",
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.35)",
                      color: "#22c55e",
                      fontSize: "9px",
                      fontFamily: "monospace",
                      letterSpacing: "0.08em",
                    }}>
                      {results.perAppliance.length} APPLIANCE{results.perAppliance.length !== 1 ? "S" : ""}
                    </div>
                  </div>

                  {/* Big numbers grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1px",
                    background: "rgba(100,116,139,0.2)",
                    border: `1px solid ${getCostColor(results.totalMonthlyCost)}44`,
                  }}>
                    <ResultCard
                      label="DAILY CONSUMPTION"
                      value={`${fmt(results.totalDailyKwh)} kWh`}
                      color="#3b82f6"
                      sub="per day"
                    />
                    <ResultCard
                      label="MONTHLY CONSUMPTION"
                      value={`${fmt(results.totalMonthlyKwh)} kWh`}
                      color="#f59e0b"
                      sub="per month"
                    />
                    <ResultCard
                      label="YEARLY CONSUMPTION"
                      value={`${fmt(results.totalYearlyKwh)} kWh`}
                      color="#94a3b8"
                      sub="per year"
                    />
                    <ResultCard
                      label="MONTHLY COST"
                      value={`₹${fmt(results.totalMonthlyCost, 0)}`}
                      color={getCostColor(results.totalMonthlyCost)}
                      glow
                      sub={`@ ₹${results.rate.toFixed(2)}/kWh`}
                    />
                    <ResultCard
                      label="YEARLY COST"
                      value={`₹${fmt(results.totalYearlyCost, 0)}`}
                      color={getCostColor(results.totalMonthlyCost)}
                      glow
                      sub="projected annual"
                    />
                    <ResultCard
                      label="AVG DAILY COST"
                      value={`₹${fmt(results.totalMonthlyCost / 30, 1)}`}
                      color="#64748b"
                      sub="per day estimate"
                    />
                  </div>
                </div>

                {/* ── PER-APPLIANCE BREAKDOWN ── */}
                {results.perAppliance.length > 1 && (
                  <div className="panel">
                    <div className="panel-header">
                      <BarChart2 size={11} color="#3b82f6" />
                      <span className="panel-label">PER-APPLIANCE BREAKDOWN</span>
                      <span style={{ marginLeft: "auto", color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>₹/MONTH</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "rgba(15,23,42,0.8)", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
                            {["APPLIANCE", "WATTS", "HRS/DAY", "kWh/MO", "COST/MO", "COST/YR", "SHARE"].map((h) => (
                              <th key={h} style={{
                                padding: "7px 10px", textAlign: "left",
                                color: "#334155", fontSize: "9px", fontFamily: "monospace",
                                letterSpacing: "0.1em", fontWeight: "600",
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.perAppliance.map((a, i) => {
                            const share = results.totalMonthlyCost > 0
                              ? (a.monthlyCost / results.totalMonthlyCost) * 100 : 0;
                            const c = getCostColor(a.monthlyCost);
                            return (
                              <tr
                                key={a.id}
                                style={{
                                  borderBottom: "1px solid rgba(100,116,139,0.08)",
                                  background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.12)",
                                  transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.12)"}
                              >
                                <td style={{ padding: "8px 10px", color: "#94a3b8", fontSize: "11px", fontFamily: "monospace", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {a.name}
                                </td>
                                <td style={{ padding: "8px 10px", color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{a.watts}W</td>
                                <td style={{ padding: "8px 10px", color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{a.hoursPerDay}h</td>
                                <td style={{ padding: "8px 10px" }}>
                                  <span className="readout" style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "600" }}>
                                    {fmt(a.monthlyKwh)}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <span className="readout" style={{ color: c, fontSize: "12px", fontWeight: "700", textShadow: `0 0 8px ${c}66` }}>
                                    ₹{fmt(a.monthlyCost, 0)}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 10px" }}>
                                  <span className="readout" style={{ color: "#94a3b8", fontSize: "11px" }}>
                                    ₹{fmt(a.yearlyCost, 0)}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 10px", minWidth: "80px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div className="score-bar" style={{ flex: 1 }}>
                                      <div style={{
                                        height: "100%",
                                        width: `${Math.min(share, 100)}%`,
                                        background: c,
                                        boxShadow: `0 0 5px ${c}88`,
                                        transition: "width 0.4s ease",
                                      }} />
                                    </div>
                                    <span className="readout" style={{ color: c, fontSize: "10px", minWidth: "32px" }}>
                                      {share.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── SMART INSIGHTS PANEL ── */}
                <div className="panel">
                  <div className="panel-header">
                    <AlertTriangle size={11} color="#f97316" />
                    <span className="panel-label">SMART LOAD ADVISOR</span>
                    <div style={{
                      marginLeft: "auto",
                      padding: "1px 8px",
                      background: isPeak ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                      border: `1px solid ${isPeak ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
                      fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em",
                      color: isPeak ? "#ef4444" : "#22c55e",
                    }}>
                      {isPeak ? "● PEAK WINDOW" : "● OFF-PEAK WINDOW"}
                    </div>
                  </div>
                  <div style={{ padding: "14px" }}>
                    <InsightPanel
                      monthlyKwh={results.totalMonthlyKwh}
                      monthlyCost={results.totalMonthlyCost}
                      yearlyCost={results.totalYearlyCost}
                      applianceName={results.perAppliance[0]?.name}
                    />

                    {/* Time of day bar */}
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>00:00</span>
                        <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>12:00</span>
                        <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>23:59</span>
                      </div>
                      <div style={{ height: "18px", background: "rgba(15,23,42,0.8)", position: "relative", border: "1px solid rgba(100,116,139,0.2)" }}>
                        <div style={{ position: "absolute", left: "0%", width: "25%", height: "100%", background: "rgba(34,197,94,0.15)", borderRight: "1px solid rgba(34,197,94,0.3)" }} />
                        <div style={{ position: "absolute", left: "25%", width: "70.8%", height: "100%", background: "rgba(239,68,68,0.09)", borderRight: "1px solid rgba(239,68,68,0.25)" }} />
                        <div style={{ position: "absolute", left: "95.8%", width: "4.2%", height: "100%", background: "rgba(34,197,94,0.15)" }} />
                        <div style={{
                          position: "absolute",
                          left: `${(time.getHours() * 60 + time.getMinutes()) / 1440 * 100}%`,
                          height: "100%", width: "2px",
                          background: "#f59e0b",
                          boxShadow: "0 0 6px rgba(245,158,11,0.8)",
                        }} />
                      </div>
                      <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                        {[
                          { color: "rgba(239,68,68,0.5)", border: "rgba(239,68,68,0.5)", label: "PEAK (06:00–23:00)" },
                          { color: "rgba(34,197,94,0.3)", border: "rgba(34,197,94,0.5)", label: "OFF-PEAK" },
                          { color: "#f59e0b", border: "#f59e0b", label: "NOW", glow: true },
                        ].map(({ color, border, label, glow }) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{
                              width: "8px", height: "8px",
                              background: color, border: `1px solid ${border}`,
                              boxShadow: glow ? `0 0 5px ${color}` : "none",
                            }} />
                            <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
              DATA SOURCES: STATE SERC FILINGS · IEX · BEE STAR RATINGS
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              FORMULA: kWh = (W × H × D) / 1000
            </span>
            <div style={{ width: "1px", height: "12px", background: "rgba(100,116,139,0.2)" }} />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              © 2025 BHARATPOWER.IO — ESTIMATES ONLY · NOT FOR BILLING PURPOSES
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
