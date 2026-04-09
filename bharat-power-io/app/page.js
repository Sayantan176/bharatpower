"use client";
import { useState, useEffect, useRef } from "react";
import { Zap, Activity, Sun, Shield, Info, TrendingUp, TrendingDown, AlertTriangle, Clock, ChevronRight, Terminal, Radio, Building2 } from "lucide-react";
import ApplianceEnergyCalculator from '../components/ApplianceEnergyCalculator'
import DiscomDirectory from '../components/DiscomDirectory';
import GridMap from '../components/GridMap'
import CarbonFootprintCalculator from '../components/CarbonFootprintCalculator'

// ============================================================
// MOCK DATA — swap these endpoints for Flask API calls later
// ============================================================
const MOCK_DATA = {
  gridFrequency: "50.02",
  gridStatus: "NOMINAL",
  systemTime: null, // will be set live

  statePrices: [
    { id: "MH", name: "Maharashtra", price: 8.45, trend: "up", zone: "WEST" },
    { id: "KA", name: "Karnataka", price: 6.20, trend: "down", zone: "SOUTH" },
    { id: "DL", name: "Delhi", price: 9.10, trend: "up", zone: "NORTH" },
    { id: "GJ", name: "Gujarat", price: 7.30, trend: "stable", zone: "WEST" },
    { id: "TN", name: "Tamil Nadu", price: 5.85, trend: "down", zone: "SOUTH" },
    { id: "UP", name: "Uttar Pradesh", price: 8.90, trend: "up", zone: "NORTH" },
    { id: "RJ", name: "Rajasthan", price: 7.65, trend: "up", zone: "NORTH" },
    { id: "WB", name: "West Bengal", price: 7.10, trend: "stable", zone: "EAST" },
    { id: "MP", name: "Madhya Pradesh", price: 6.80, trend: "down", zone: "WEST" },
    { id: "AP", name: "Andhra Pradesh", price: 6.15, trend: "down", zone: "SOUTH" },
    { id: "TS", name: "Telangana", price: 6.40, trend: "stable", zone: "SOUTH" },
    { id: "OR", name: "Odisha", price: 5.50, trend: "down", zone: "EAST" },
  ],

  peakStatus: {
    status: "PEAK",
    recommendation: "AVOID heavy appliance use",
    offPeakStart: "23:00",
    offPeakEnd: "06:00",
    currentLoad: "87.4%",
    peakDemand: "214.3 GW",
  },

  solarTariffs: {
    MH: 8.45, KA: 6.20, DL: 9.10, GJ: 7.30, TN: 5.85,
    UP: 8.90, RJ: 7.65, WB: 7.10, MP: 6.80, AP: 6.15, TS: 6.40, OR: 5.50,
  },

  discoms: [
    { rank: 1, name: "BEST (Mumbai)", state: "Maharashtra", transparency: 94, priceStability: 88, grade: "A+" },
    { rank: 2, name: "BESCOM", state: "Karnataka", transparency: 91, priceStability: 85, grade: "A" },
    { rank: 3, name: "TPDDL", state: "Delhi", transparency: 89, priceStability: 79, grade: "A" },
    { rank: 4, name: "TORRENT", state: "Gujarat", transparency: 87, priceStability: 90, grade: "A" },
    { rank: 5, name: "TANGEDCO", state: "Tamil Nadu", transparency: 72, priceStability: 68, grade: "B+" },
    { rank: 6, name: "PVVNL", state: "Uttar Pradesh", transparency: 61, priceStability: 52, grade: "B" },
    { rank: 7, name: "JVVNL", state: "Rajasthan", transparency: 58, priceStability: 61, grade: "B" },
    { rank: 8, name: "CESC", state: "West Bengal", transparency: 76, priceStability: 74, grade: "B+" },
    { rank: 9, name: "MPEZ", state: "Madhya Pradesh", transparency: 54, priceStability: 58, grade: "C+" },
    { rank: 10, name: "APEPDCL", state: "Andhra Pradesh", transparency: 68, priceStability: 71, grade: "B" },
  ],

  exchangeData: [
    { market: "IEX DAM", clearingPrice: 7.82, volume: "1,284 MU", change: "+0.34" },
    { market: "IEX TAM", clearingPrice: 8.10, volume: "98 MU", change: "+0.61" },
    { market: "PXIL DAM", clearingPrice: 7.79, volume: "412 MU", change: "+0.29" },
  ],
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const getPriceColor = (price) => {
  if (price <= 6.0) return "#22c55e";   // LED green
  if (price <= 7.5) return "#f59e0b";   // amber
  if (price <= 8.5) return "#f97316";   // caution orange
  return "#ef4444";                      // red
};

const getPriceBg = (price) => {
  if (price <= 6.0) return "rgba(34,197,94,0.08)";
  if (price <= 7.5) return "rgba(245,158,11,0.08)";
  if (price <= 8.5) return "rgba(249,115,22,0.08)";
  return "rgba(239,68,68,0.08)";
};

const getGradeColor = (grade) => {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#3b82f6";
  return "#f97316";
};

// ============================================================
// INDIA MAP SVG (Simplified Political)
// ============================================================
const IndiaMap = ({ statePrices }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const priceMap = Object.fromEntries(statePrices.map(s => [s.id, s]));

  // Simplified state paths (representative shapes for the dashboard)
  const states = [
    { id: "JK", name: "J&K", d: "M 155 30 L 175 25 L 195 35 L 190 55 L 170 60 L 155 50 Z", price: 8.20 },
    { id: "HP", name: "Himachal", d: "M 175 55 L 195 50 L 205 65 L 190 75 L 175 70 Z", price: 6.90 },
    { id: "PB", name: "Punjab", d: "M 150 65 L 175 58 L 180 75 L 165 85 L 148 80 Z", price: 7.40 },
    { id: "UK", name: "Uttarakhand", d: "M 195 65 L 215 60 L 220 80 L 205 85 L 192 78 Z", price: 5.60 },
    { id: "HR", name: "Haryana", d: "M 163 82 L 182 76 L 188 92 L 170 98 L 160 92 Z", price: 7.80 },
    { id: "DL", name: "Delhi", d: "M 178 90 L 188 88 L 190 98 L 180 100 Z", price: 9.10 },
    { id: "RJ", name: "Rajasthan", d: "M 120 85 L 162 80 L 175 100 L 165 140 L 140 155 L 108 145 L 100 115 Z", price: 7.65 },
    { id: "UP", name: "Uttar Pradesh", d: "M 182 90 L 240 80 L 255 100 L 245 130 L 215 138 L 180 132 L 168 115 L 175 100 Z", price: 8.90 },
    { id: "BR", name: "Bihar", d: "M 248 95 L 275 88 L 285 108 L 270 125 L 248 122 L 243 108 Z", price: 7.20 },
    { id: "SK", name: "Sikkim", d: "M 280 82 L 290 79 L 293 90 L 282 92 Z", price: 5.80 },
    { id: "AR", name: "Arunachal", d: "M 295 72 L 330 68 L 335 88 L 310 92 L 295 85 Z", price: 6.10 },
    { id: "AS", name: "Assam", d: "M 278 95 L 308 90 L 320 105 L 300 115 L 278 110 Z", price: 6.50 },
    { id: "MN", name: "Manipur", d: "M 305 115 L 320 110 L 322 125 L 308 128 Z", price: 6.80 },
    { id: "ML", name: "Meghalaya", d: "M 278 110 L 300 108 L 302 120 L 280 122 Z", price: 6.30 },
    { id: "NL", name: "Nagaland", d: "M 310 95 L 325 92 L 328 108 L 312 110 Z", price: 7.00 },
    { id: "TR", name: "Tripura", d: "M 300 120 L 312 118 L 314 130 L 302 132 Z", price: 7.50 },
    { id: "MZ", name: "Mizoram", d: "M 306 128 L 318 126 L 320 140 L 308 142 Z", price: 7.80 },
    { id: "JH", name: "Jharkhand", d: "M 248 122 L 273 118 L 278 140 L 260 150 L 242 145 Z", price: 6.60 },
    { id: "WB", name: "West Bengal", d: "M 272 115 L 290 110 L 296 135 L 285 160 L 270 158 L 262 140 L 268 125 Z", price: 7.10 },
    { id: "OR", name: "Odisha", d: "M 242 148 L 268 142 L 275 165 L 265 185 L 242 182 L 230 168 Z", price: 5.50 },
    { id: "MP", name: "Madhya Pradesh", d: "M 148 140 L 215 132 L 235 148 L 230 175 L 200 182 L 165 178 L 140 162 Z", price: 6.80 },
    { id: "CG", name: "Chhattisgarh", d: "M 218 148 L 242 144 L 248 168 L 240 192 L 220 195 L 205 180 L 210 162 Z", price: 5.90 },
    { id: "GJ", name: "Gujarat", d: "M 90 140 L 128 135 L 145 155 L 148 178 L 128 195 L 100 192 L 78 175 L 72 155 Z", price: 7.30 },
    { id: "MH", name: "Maharashtra", d: "M 128 175 L 168 170 L 202 178 L 215 195 L 205 220 L 180 235 L 148 230 L 120 215 L 108 195 Z", price: 8.45 },
    { id: "TS", name: "Telangana", d: "M 202 195 L 238 192 L 248 210 L 238 230 L 215 232 L 205 218 Z", price: 6.40 },
    { id: "AP", name: "Andhra Pradesh", d: "M 205 228 L 245 225 L 262 245 L 255 270 L 230 278 L 205 268 L 195 248 Z", price: 6.15 },
    { id: "KA", name: "Karnataka", d: "M 148 228 L 205 222 L 218 248 L 205 268 L 178 275 L 150 265 L 135 248 Z", price: 6.20 },
    { id: "TN", name: "Tamil Nadu", d: "M 175 272 L 205 265 L 220 285 L 212 315 L 192 330 L 172 318 L 162 295 Z", price: 5.85 },
    { id: "KL", name: "Kerala", d: "M 155 268 L 178 272 L 172 315 L 158 325 L 148 305 L 148 285 Z", price: 6.00 },
    { id: "GA", name: "Goa", d: "M 130 245 L 148 242 L 150 255 L 135 258 Z", price: 5.70 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="60 20 290 325"
        className="w-full h-full max-h-[380px]"
        style={{ filter: "drop-shadow(0 0 20px rgba(59,130,246,0.15))" }}
      >
        {states.map((state) => {
          const stateData = priceMap[state.id];
          const price = stateData?.price || state.price;
          const color = getPriceColor(price);
          const isHovered = hoveredState === state.id;

          return (
            <g key={state.id}>
              <path
                d={state.d}
                fill={getPriceBg(price)}
                stroke={isHovered ? color : "rgba(100,116,139,0.5)"}
                strokeWidth={isHovered ? "1.5" : "0.8"}
                style={{
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                  filter: isHovered ? `drop-shadow(0 0 6px ${color})` : "none",
                }}
                onMouseEnter={() => setHoveredState(state.id)}
                onMouseLeave={() => setHoveredState(null)}
              />
              {/* Price dot */}
              <circle
                cx={state.d.split(" ")[1]}
                cy={state.d.split(" ")[2]}
                r="2.5"
                fill={color}
                opacity={isHovered ? 1 : 0.7}
                style={{ pointerEvents: "none" }}
              />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredState && (() => {
          const s = states.find(s => s.id === hoveredState);
          const sd = priceMap[hoveredState];
          const price = sd?.price || s?.price;
          const x = parseFloat(s.d.split(" ")[1]);
          const y = parseFloat(s.d.split(" ")[2]);
          const color = getPriceColor(price);
          return (
            <g transform={`translate(${x + 4}, ${y - 22})`} style={{ pointerEvents: "none" }}>
              <rect x="-2" y="-12" width="78" height="26" fill="#0f172a" stroke={color} strokeWidth="1" rx="1" />
              <text x="2" y="-2" fill="#94a3b8" fontSize="7" fontFamily="monospace">{s.name}</text>
              <text x="2" y="8" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">₹{price?.toFixed(2)}/kWh</text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1">
        {[
          { label: "≤ ₹6.00", color: "#22c55e" },
          { label: "≤ ₹7.50", color: "#f59e0b" },
          { label: "≤ ₹8.50", color: "#f97316" },
          { label: "> ₹8.50", color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ color: "#64748b", fontSize: "10px", fontFamily: "monospace" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// TICKER COMPONENT
// ============================================================
const LiveTicker = ({ statePrices }) => {
  const items = [...statePrices, ...statePrices];

  return (
    <div
      className="overflow-hidden border-b"
      style={{
        borderColor: "rgba(59,130,246,0.3)",
        background: "rgba(15,23,42,0.95)",
        borderTop: "1px solid rgba(59,130,246,0.3)",
      }}
    >
      <div className="flex items-center">
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-r shrink-0"
          style={{
            background: "rgba(59,130,246,0.15)",
            borderColor: "rgba(59,130,246,0.4)",
            minWidth: "120px",
          }}
        >
          <Radio size={11} style={{ color: "#3b82f6" }} className="animate-pulse" />
          <span style={{ color: "#3b82f6", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
            IEX LIVE FEED
          </span>
        </div>
        <div className="flex overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
          <div
            className="flex gap-6 py-1.5 px-4 whitespace-nowrap"
            style={{ animation: "ticker 40s linear infinite" }}
          >
            {items.map((s, i) => (
              <span key={i} className="flex items-center gap-2" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                <span style={{ color: "#475569" }}>{s.id}</span>
                <span style={{ color: "#94a3b8" }}>{s.name}</span>
                <span style={{ color: getPriceColor(s.price), fontWeight: "bold" }}>₹{s.price.toFixed(2)}</span>
                <span style={{ color: s.trend === "up" ? "#ef4444" : s.trend === "down" ? "#22c55e" : "#94a3b8", fontSize: "10px" }}>
                  {s.trend === "up" ? "▲" : s.trend === "down" ? "▼" : "─"}
                </span>
                <span style={{ color: "#1e293b" }}>│</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SOLAR ROI CALCULATOR
// ============================================================
const SolarCalculator = ({ tariffs }) => {
  const [area, setArea] = useState("500");
  const [selectedState, setSelectedState] = useState("MH");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const sqft = parseFloat(area) || 0;
    const tariff = tariffs[selectedState] || 7.0;
    const sqm = sqft * 0.0929;
    const capacityKW = sqm * 0.1; // ~100W per sqm efficiency
    const annualGenKWh = capacityKW * 1500; // avg 1500 peak hours/year in India
    const annualSavings = annualGenKWh * tariff;
    const installCost = capacityKW * 65000; // ~₹65,000/kW installed
    const payback = installCost / annualSavings;
    const co2Saved = annualGenKWh * 0.82; // kg CO2 per kWh (Indian grid average)

    setResult({
      capacity: capacityKW.toFixed(2),
      annualGen: Math.round(annualGenKWh).toLocaleString("en-IN"),
      annualSavings: Math.round(annualSavings).toLocaleString("en-IN"),
      installCost: Math.round(installCost).toLocaleString("en-IN"),
      payback: payback.toFixed(1),
      co2: Math.round(co2Saved).toLocaleString("en-IN"),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label style={{ color: "#64748b", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            ROOFTOP AREA (SQ FT)
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="px-3 py-2 focus:outline-none"
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(100,116,139,0.4)",
              borderBottom: "2px solid rgba(59,130,246,0.5)",
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label style={{ color: "#64748b", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            STATE TARIFF
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 focus:outline-none cursor-pointer"
            style={{
              background: "rgba(30,41,59,0.8)",
              border: "1px solid rgba(100,116,139,0.4)",
              borderBottom: "2px solid rgba(59,130,246,0.5)",
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: "13px",
            }}
          >
            {Object.entries(tariffs).map(([k, v]) => (
              <option key={k} value={k} style={{ background: "#1e293b" }}>
                {k} — ₹{v.toFixed(2)}/kWh
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-2 flex items-center justify-center gap-2 transition-all"
        style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.5)",
          color: "#22c55e",
          fontFamily: "monospace",
          fontSize: "12px",
          letterSpacing: "0.1em",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.target.style.background = "rgba(34,197,94,0.2)"; }}
        onMouseLeave={(e) => { e.target.style.background = "rgba(34,197,94,0.1)"; }}
      >
        <Sun size={14} />
        RUN SOLAR ANALYSIS
      </button>

      {result && (
        <div
          className="grid grid-cols-2 gap-px"
          style={{ background: "rgba(100,116,139,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          {[
            { label: "SYSTEM CAPACITY", value: `${result.capacity} kW` },
            { label: "ANNUAL GENERATION", value: `${result.annualGen} kWh` },
            { label: "ANNUAL SAVINGS", value: `₹${result.annualSavings}`, highlight: true },
            { label: "INSTALL COST (EST.)", value: `₹${result.installCost}` },
            { label: "PAYBACK PERIOD", value: `${result.payback} YRS`, color: parseFloat(result.payback) < 6 ? "#22c55e" : "#f97316" },
            { label: "CO₂ OFFSET/YR", value: `${result.co2} kg` },
          ].map(({ label, value, highlight, color }) => (
            <div key={label} className="px-3 py-2" style={{ background: "rgba(15,23,42,0.9)" }}>
              <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{
                color: color || (highlight ? "#22c55e" : "#e2e8f0"),
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: highlight ? "bold" : "normal",
                marginTop: "2px",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD
// ============================================================
// export default function BharatPowerDashboard() {
//   const [time, setTime] = useState(new Date());
//   const [blinkOn, setBlinkOn] = useState(true);
  export default function BharatPowerDashboard() {
  // New state to store live grid data
  const [liveData, setLiveData] = useState(null); 
  const [time, setTime] = useState(new Date());
  const [blinkOn, setBlinkOn] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => setBlinkOn(p => !p), 800);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  // Hook to fetch real-time energy data from Flask
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await fetch("https://bharatpower.onrender.com/api/v1/dashboard");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setLiveData(data);
      } catch (error) {
        console.error("Critical: Failed to sync with National Grid Feed", error);
      }
    };

    fetchRealTimeData(); // Initial load
    const interval = setInterval(fetchRealTimeData, 15000); // 15s refresh cycle
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  // const isPeak = time.getHours() >= 6 && time.getHours() < 23;
  // const peakData = MOCK_DATA.peakStatus;

  // const sortedPrices = [...MOCK_DATA.statePrices].sort((a, b) => a.price - b.price);
  // Primary data source selector
  const currentData = liveData || MOCK_DATA;

  const isPeak = time.getHours() >= 6 && time.getHours() < 23;
  const peakData = currentData.peakStatus;

  const sortedPrices = [...currentData.statePrices].sort((a, b) => a.price - b.price);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body, #root {
      background: #0a0f1a;
      min-height: 100vh;
      font-family: 'JetBrains Mono', monospace;
    }

    .mono { font-family: 'JetBrains Mono', monospace !important; }

    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes pulse-ring {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
      50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
    }

    @keyframes scan-line {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
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

    .led-green { color: #22c55e; text-shadow: 0 0 8px rgba(34,197,94,0.6); }
    .led-blue { color: #3b82f6; text-shadow: 0 0 8px rgba(59,130,246,0.6); }
    .led-orange { color: #f97316; text-shadow: 0 0 8px rgba(249,115,22,0.6); }
    .led-amber { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.6); }

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
        transparent,
        transparent 39px,
        rgba(59,130,246,0.04) 39px,
        rgba(59,130,246,0.04) 40px
      );
    }

    .score-bar {
      height: 4px;
      background: rgba(30,41,59,0.8);
      position: relative;
      overflow: hidden;
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

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a0f1a; }
    ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); }
    ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="scan-overlay" />

      <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#e2e8f0" }}>

        {/* ── HEADER ── */}
        <header style={{
          background: "rgba(9,14,28,0.98)",
          borderBottom: "1px solid rgba(59,130,246,0.3)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(59,130,246,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div style={{
                width: "36px", height: "36px",
                border: "2px solid rgba(59,130,246,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(59,130,246,0.1)",
                boxShadow: "0 0 12px rgba(59,130,246,0.3), inset 0 0 8px rgba(59,130,246,0.1)",
              }}>
                <Zap size={18} color="#3b82f6" />
              </div>
              <div>
                <div className="readout" style={{
                  fontSize: "20px", fontWeight: "700", letterSpacing: "0.2em",
                  color: "#e2e8f0",
                  textShadow: "0 0 20px rgba(59,130,246,0.4)",
                }}>
                  BHARAT<span style={{ color: "#3b82f6" }}>POWER</span>
                  <span style={{ color: "#475569", fontSize: "14px", letterSpacing: "0.1em" }}>.IO</span>
                </div>
                <div style={{ color: "#334155", fontSize: "9px", letterSpacing: "0.2em" }}>
                  NATIONAL GRID INTELLIGENCE PLATFORM v2.4.1
                </div>
              </div>
            </div>

        {/* ── PAGE NAV ── */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage("dashboard")}
                style={{
                  background: currentPage === "dashboard" ? "rgba(59,130,246,0.15)" : "transparent",
                  border: `1px solid ${currentPage === "dashboard" ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)"}`,
                  color: currentPage === "dashboard" ? "#3b82f6" : "#475569",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                DASHBOARD
              </button>
              <button
                onClick={() => setCurrentPage("appliance")}
                style={{
                  background: currentPage === "appliance" ? "rgba(59,130,246,0.15)" : "transparent",
                  border: `1px solid ${currentPage === "appliance" ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)"}`,
                  color: currentPage === "appliance" ? "#3b82f6" : "#475569",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                APPLIANCE CALC
              </button>
              <button
                onClick={() => setCurrentPage("discoms")}
                style={{
                  background: currentPage === "discoms" ? "rgba(59,130,246,0.15)" : "transparent",
                  border: `1px solid ${currentPage === "discoms" ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)"}`,
                  color: currentPage === "discoms" ? "#3b82f6" : "#475569",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                <Building2 size={11} style={{ display: "inline", marginRight: "5px" }} />
                DISCOM DIR
              </button>
              <button
                onClick={() => setCurrentPage("gridmap")}
                style={{
                  background: currentPage === "gridmap" ? "rgba(59,130,246,0.15)" : "transparent",
                  border: `1px solid ${currentPage === "gridmap" ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)"}`,
                  color: currentPage === "gridmap" ? "#3b82f6" : "#475569",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                <Building2 size={11} style={{ display: "inline", marginRight: "5px" }} />
                GRIDMAP
              </button>
              <button
                onClick={() => setCurrentPage("carbon")}
                style={{
                  background: currentPage === "carbon" ? "rgba(59,130,246,0.15)" : "transparent",
                  border: `1px solid ${currentPage === "carbon" ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)"}`,
                  color: currentPage === "carbon" ? "#3b82f6" : "#475569",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  cursor: "pointer",
                }}
              >
                <Building2 size={11} style={{ display: "inline", marginRight: "5px" }} />
                CARBON
              </button>
            </div>
            

            {/* Center metrics */}
            <div className="flex items-center gap-6">
              {/* Frequency */}
              <div className="flex flex-col items-center gap-0.5">
                <div style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.12em" }}>GRID FREQ</div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e",
                    animation: "pulse-ring 2s ease infinite",
                    boxShadow: "0 0 0 0 rgba(34,197,94,0.5)",
                  }} />
                  <span className="readout led-green" style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "0.05em" }}>
                    {currentData.gridFrequency} Hz
                  </span>
                </div>
              </div>

              <div style={{ width: "1px", height: "32px", background: "rgba(100,116,139,0.3)" }} />

              {/* Grid status */}
              <div className="flex flex-col items-center gap-0.5">
                <div style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.12em" }}>GRID STATUS</div>
                <div className="flex items-center gap-1.5">
                  <Activity size={14} color="#22c55e" />
                  <span className="readout led-green" style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.1em" }}>
                    {currentData.gridStatus}
                  </span>
                </div>
              </div>

              <div style={{ width: "1px", height: "32px", background: "rgba(100,116,139,0.3)" }} />

              {/* Peak demand */}
              <div className="flex flex-col items-center gap-0.5">
                <div style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.12em" }}>PEAK DEMAND</div>
                <span className="readout led-orange" style={{ fontSize: "16px", fontWeight: "600" }}>
                  {peakData.peakDemand}
                </span>
              </div>

              <div style={{ width: "1px", height: "32px", background: "rgba(100,116,139,0.3)" }} />

              {/* System load */}
              <div className="flex flex-col items-center gap-0.5">
                <div style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.12em" }}>SYS LOAD</div>
                <span className="readout" style={{
                  fontSize: "16px", fontWeight: "600",
                  color: parseFloat(peakData.currentLoad) > 85 ? "#ef4444" : "#f59e0b",
                  textShadow: parseFloat(peakData.currentLoad) > 85
                    ? "0 0 8px rgba(239,68,68,0.6)"
                    : "0 0 8px rgba(245,158,11,0.6)",
                }}>
                  {peakData.currentLoad}
                </span>
              </div>
            </div>

            {/* Clock */}
            <div className="flex flex-col items-end gap-0.5">
                {/* Add the warning suppression here */}
                <div 
                  className="readout" 
                  suppressHydrationWarning 
                  style={{ fontSize: "24px", fontWeight: "300", color: "#94a3b8", letterSpacing: "0.05em" }}
                >
                  {formatTime(time)}
                  <span style={{ color: blinkOn ? "#94a3b8" : "transparent" }}> ●</span>
                </div>
                
                {/* And add it here for the date as well */}
                <div 
                  suppressHydrationWarning 
                  style={{ color: "#334155", fontSize: "10px", letterSpacing: "0.1em" }}
                >
                  {formatDate(time)} IST
                </div>
              </div>
          </div>
        </header>

        {/* ── TICKER ── */}
        {liveData && <LiveTicker statePrices={liveData.statePrices} />}

        {/* ── EXCHANGE BAR ── */}
        <div style={{ background: "rgba(15,23,42,0.6)", borderBottom: "1px solid rgba(100,116,139,0.15)" }}>
          <div className="px-4 py-2 flex items-center gap-6 flex-wrap">
            <span style={{ color: "#334155", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.12em" }}>EXCHANGES:</span>
            {MOCK_DATA.exchangeData.map((ex) => (
              <div key={ex.market} className="flex items-center gap-2">
                <span style={{ color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{ex.market}</span>
                <span style={{ color: "#e2e8f0", fontSize: "12px", fontFamily: "monospace", fontWeight: "600" }}>
                  ₹{ex.clearingPrice.toFixed(2)}
                </span>
                <span style={{
                  color: "#22c55e", fontSize: "10px", fontFamily: "monospace",
                  background: "rgba(34,197,94,0.1)", padding: "0 4px",
                }}>
                  {ex.change}
                </span>
                <span style={{ color: "#334155", fontSize: "11px", fontFamily: "monospace" }}>{ex.volume}</span>
                <span style={{ color: "#1e293b" }}>│</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        {currentPage === "appliance" ? (
          <div style={{ padding: "16px" }}>
            <ApplianceEnergyCalculator />
          </div>
        ) : currentPage === "discoms" ? (
          <div style={{ padding: "16px" }}>
            <DiscomDirectory />
          </div>
        ) :  currentPage === "gridmap" ? (
          <div style={{ padding: "16px" }}>
            <GridMap />
          </div>
        ) : currentPage === "carbon" ? (
          <div style={{ padding: "16px" }}>
            <CarbonFootprintCalculator />
          </div>
        ) : (
        <main className="grid-line" style={{ padding: "16px", display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr 1fr" }}>

          {/* ROW 1: Map | Arbitrage + Calculator */}

          {/* MAP */}
          <div className="panel" style={{ gridRow: "span 2" }}>
            <div className="panel-header">
              <div style={{
                width: "6px", height: "6px",
                background: "#3b82f6",
                boxShadow: "0 0 6px rgba(59,130,246,0.8)",
              }} />
              <span className="panel-label">STATE-WISE TARIFF MAP</span>
              <span style={{ marginLeft: "auto", color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>IEX DAM REF</span>
            </div>
            <div className="p-3" style={{ height: "calc(100% - 37px)" }}>
            {/* Check if liveData exists. If yes, show the map. If no, show a loader. */}
            {liveData ? (
              <IndiaMap statePrices={liveData.statePrices} />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center border border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 animate-ping" />
                  <span className="text-[10px] font-mono text-blue-500 tracking-widest uppercase">
                    Initializing_Geospatial_Grid...
                  </span>
                </div>
                <span className="mt-2 text-[9px] font-mono text-slate-600">
                  SYNCING WITH NATIONAL LOAD DESPATCH CENTRE
                </span>
              </div>
            )}
          </div>
          </div>

          {/* ARBITRAGE */}
          <div className="panel">
            <div className="panel-header">
              <AlertTriangle size={11} color="#f97316" />
              <span className="panel-label">LOAD SHIFT ADVISOR</span>
              <div style={{
                marginLeft: "auto",
                padding: "1px 8px",
                background: isPeak ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                border: `1px solid ${isPeak ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
                fontSize: "9px",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                color: isPeak ? "#ef4444" : "#22c55e",
              }}>
                {isPeak ? "● PEAK" : "● OFF-PEAK"}
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">

              {/* Big status display */}
              <div className="bevel-inset p-4" style={{ background: "rgba(9,14,28,0.8)", border: "1px solid rgba(100,116,139,0.15)" }}>
                <div style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em" }}>
                  CURRENT STATUS
                </div>
                <div className="readout" style={{
                  fontSize: "32px", fontWeight: "700", letterSpacing: "0.15em",
                  color: isPeak ? "#ef4444" : "#22c55e",
                  textShadow: isPeak
                    ? "0 0 20px rgba(239,68,68,0.5), 0 0 40px rgba(239,68,68,0.2)"
                    : "0 0 20px rgba(34,197,94,0.5)",
                  marginTop: "4px",
                }}>
                  {isPeak ? "◼ PEAK" : "◼ OFF-PEAK"}
                </div>
              </div>

              {/* Advisory */}
              <div style={{ border: "1px solid rgba(249,115,22,0.3)", background: "rgba(249,115,22,0.06)", padding: "12px" }}>
                <div className="flex items-start gap-2">
                  <Info size={13} color="#f97316" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "#f97316", fontSize: "12px", fontFamily: "monospace", fontWeight: "600", letterSpacing: "0.05em" }}>
                      ADVISORY ACTIVE
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace", marginTop: "4px", lineHeight: "1.6" }}>
                      {peakData.recommendation}. Off-peak window begins at{" "}
                      <span style={{ color: "#22c55e", fontWeight: "600" }}>{peakData.offPeakStart}</span>
                      {" "}— {peakData.offPeakEnd}.
                    </div>
                  </div>
                </div>
              </div>

              {/* Time-of-day bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace" }}>00:00</span>
                  <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace" }}>12:00</span>
                  <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace" }}>23:59</span>
                </div>
                <div style={{ height: "20px", background: "rgba(15,23,42,0.8)", position: "relative", border: "1px solid rgba(100,116,139,0.2)" }}>
                  {/* Off-peak zone 00:00-06:00 */}
                  <div style={{ position: "absolute", left: "0%", width: "25%", height: "100%", background: "rgba(34,197,94,0.15)", borderRight: "1px solid rgba(34,197,94,0.3)" }} />
                  {/* Peak zone 06:00-23:00 */}
                  <div style={{ position: "absolute", left: "25%", width: "70.8%", height: "100%", background: "rgba(239,68,68,0.1)", borderRight: "1px solid rgba(239,68,68,0.3)" }} />
                  {/* Off-peak 23:00-24:00 */}
                  <div style={{ position: "absolute", left: "95.8%", width: "4.2%", height: "100%", background: "rgba(34,197,94,0.15)" }} />
                  {/* Current time marker */}
                  <div style={{
                    position: "absolute",
                    left: `${(time.getHours() * 60 + time.getMinutes()) / 1440 * 100}%`,
                    height: "100%", width: "2px",
                    background: "#f59e0b",
                    boxShadow: "0 0 6px rgba(245,158,11,0.8)",
                  }} />
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: "8px", height: "8px", background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.5)" }} />
                    <span style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace" }}>PEAK (06:00–23:00)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: "8px", height: "8px", background: "rgba(34,197,94,0.3)", border: "1px solid rgba(34,197,94,0.5)" }} />
                    <span style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace" }}>OFF-PEAK</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div style={{ width: "8px", height: "8px", background: "#f59e0b", boxShadow: "0 0 4px rgba(245,158,11,0.6)" }} />
                    <span style={{ color: "#64748b", fontSize: "9px", fontFamily: "monospace" }}>NOW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOLAR CALCULATOR */}
          <div className="panel">
            <div className="panel-header">
              <Sun size={11} color="#f59e0b" />
              <span className="panel-label">SOLAR ROI ESTIMATOR</span>
            </div>
            <div className="p-4">
              <SolarCalculator tariffs={MOCK_DATA.solarTariffs} />
            </div>
          </div>

          {/* ROW 2: Price Rankings | DISCOM Table */}

          {/* PRICE RANKINGS */}
          <div className="panel">
            <div className="panel-header">
              <TrendingDown size={11} color="#22c55e" />
              <span className="panel-label">STATE PRICE RANKINGS</span>
              <span style={{ marginLeft: "auto", color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>₹/kWh</span>
            </div>
            <div className="overflow-auto" style={{ maxHeight: "280px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(15,23,42,0.8)", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
                    {["#", "STATE", "ZONE", "PRICE", "TREND"].map((h) => (
                      <th key={h} style={{
                        padding: "6px 10px", textAlign: "left",
                        color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em",
                        fontWeight: "600",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPrices.map((s, i) => (
                    <tr key={s.id} style={{
                      borderBottom: "1px solid rgba(100,116,139,0.08)",
                      background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.15)",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.15)"}
                    >
                      <td style={{ padding: "6px 10px", color: "#334155", fontSize: "11px", fontFamily: "monospace" }}>{i + 1}</td>
                      <td style={{ padding: "6px 10px", fontSize: "11px", fontFamily: "monospace" }}>
                        <span style={{ color: "#64748b", fontSize: "10px" }}>{s.id}</span>
                        <span style={{ color: "#94a3b8", marginLeft: "6px" }}>{s.name}</span>
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <span style={{
                          color: "#334155", fontSize: "9px", fontFamily: "monospace",
                          background: "rgba(30,41,59,0.8)", padding: "1px 5px",
                          border: "1px solid rgba(100,116,139,0.2)",
                        }}>{s.zone}</span>
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        <span className="readout" style={{ color: getPriceColor(s.price), fontSize: "13px", fontWeight: "600" }}>
                          {s.price.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        {s.trend === "up" && <TrendingUp size={13} color="#ef4444" />}
                        {s.trend === "down" && <TrendingDown size={13} color="#22c55e" />}
                        {s.trend === "stable" && <span style={{ color: "#475569", fontSize: "11px" }}>──</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          

          {/* DISCOM TABLE */}
          <div className="panel" style={{ gridColumn: "span 2" }}>
            <div className="panel-header">
              <Shield size={11} color="#3b82f6" />
              <span className="panel-label">DISCOM TRANSPARENCY & STABILITY INDEX</span>
              <div className="flex items-center gap-2 ml-auto">
                <Info size={11} color="#334155" />
                <span style={{ color: "#334155", fontSize: "9px", fontFamily: "monospace" }}>
                  SCORES: PRAAPTI + NITI AAYOG + SERC FILINGS
                </span>
              </div>
            </div>
            <div className="overflow-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(15,23,42,0.8)", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
                    {["RNK", "DISCOM", "STATE", "TRANSPARENCY", "PRICE STABILITY", "GRADE"].map((h) => (
                      <th key={h} style={{
                        padding: "8px 12px", textAlign: "left",
                        color: "#334155", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.12em",
                        fontWeight: "600",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DATA.discoms.map((d, i) => (
                    <tr key={d.rank} style={{
                      borderBottom: "1px solid rgba(100,116,139,0.08)",
                      background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.12)",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.12)"}
                    >
                      <td style={{ padding: "9px 12px", color: "#334155", fontSize: "12px", fontFamily: "monospace" }}>
                        {d.rank < 4
                          ? <span style={{ color: d.rank === 1 ? "#f59e0b" : "#94a3b8" }}>#{d.rank}</span>
                          : <span>#{d.rank}</span>
                        }
                      </td>
                      <td style={{ padding: "9px 12px", color: "#e2e8f0", fontSize: "12px", fontFamily: "monospace" }}>{d.name}</td>
                      <td style={{ padding: "9px 12px", color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>{d.state}</td>
                      <td style={{ padding: "9px 12px", minWidth: "140px" }}>
                        <div className="flex items-center gap-2">
                          <div className="score-bar flex-1">
                            <div style={{
                              height: "100%", width: `${d.transparency}%`,
                              background: d.transparency > 80 ? "#22c55e" : d.transparency > 65 ? "#3b82f6" : "#f59e0b",
                              boxShadow: `0 0 6px ${d.transparency > 80 ? "rgba(34,197,94,0.4)" : d.transparency > 65 ? "rgba(59,130,246,0.4)" : "rgba(245,158,11,0.4)"}`,
                              transition: "width 0.5s ease",
                            }} />
                          </div>
                          <span className="readout" style={{
                            fontSize: "12px", minWidth: "30px",
                            color: d.transparency > 80 ? "#22c55e" : d.transparency > 65 ? "#3b82f6" : "#f59e0b",
                          }}>
                            {d.transparency}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "9px 12px", minWidth: "140px" }}>
                        <div className="flex items-center gap-2">
                          <div className="score-bar flex-1">
                            <div style={{
                              height: "100%", width: `${d.priceStability}%`,
                              background: d.priceStability > 80 ? "#22c55e" : d.priceStability > 65 ? "#3b82f6" : "#f59e0b",
                              boxShadow: `0 0 6px ${d.priceStability > 80 ? "rgba(34,197,94,0.4)" : d.priceStability > 65 ? "rgba(59,130,246,0.4)" : "rgba(245,158,11,0.4)"}`,
                            }} />
                          </div>
                          <span className="readout" style={{
                            fontSize: "12px", minWidth: "30px",
                            color: d.priceStability > 80 ? "#22c55e" : d.priceStability > 65 ? "#3b82f6" : "#f59e0b",
                          }}>
                            {d.priceStability}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <span className="readout" style={{
                          fontSize: "14px", fontWeight: "700",
                          color: getGradeColor(d.grade),
                          textShadow: `0 0 8px ${getGradeColor(d.grade)}66`,
                        }}>
                          {d.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
        )}

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid rgba(100,116,139,0.15)",
          padding: "10px 16px",
          background: "rgba(9,14,28,0.8)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", flexWrap: "wrap",
        }}>
          <div className="flex items-center gap-4">
            <Terminal size={11} color="#334155" />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              DATA SOURCES: IEX · POSOCO · PRAAPTI · CEA · STATE SERC FILINGS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              REFRESH INTERVAL: 15s · LATENCY: 42ms
            </span>
            <div style={{ width: "1px", height: "12px", background: "rgba(100,116,139,0.2)" }} />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              © 2025 BHARATPOWER.IO — NOT FOR COMMERCIAL TRADING DECISIONS
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
