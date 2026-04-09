"use client";

import { useState, useEffect, useRef } from "react";
import {
  Zap, MapPin, Activity, Cpu, Radio, Terminal,
  X, ChevronRight, Layers, AlertTriangle, Info,
  TrendingUp, BarChart2, Building2, Shield
} from "lucide-react";

// ============================================================
// POWER GRID DATA — 14 major stations across India
// ============================================================
const POWER_GRIDS = [
  {
    id: "vindhyachal",
    name: "Vindhyachal STPS",
    state: "Madhya Pradesh",
    stateId: "MP",
    capacity: 4760,
    type: "Thermal",
    fuel: "Coal",
    operator: "NTPC",
    commissioned: 1987,
    lat: 24.1155,
    lng: 82.6630,
    status: "OPERATIONAL",
    units: 7,
    loadFactor: 88.4,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "mundra",
    name: "Mundra Ultra Mega PP",
    state: "Gujarat",
    stateId: "GJ",
    capacity: 4620,
    type: "Thermal",
    fuel: "Imported Coal",
    operator: "Adani Power",
    commissioned: 2012,
    lat: 22.8390,
    lng: 69.7260,
    status: "OPERATIONAL",
    units: 5,
    loadFactor: 71.2,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "talcher-kaniha",
    name: "Talcher Kaniha STPS",
    state: "Odisha",
    stateId: "OR",
    capacity: 3000,
    type: "Thermal",
    fuel: "Coal",
    operator: "NTPC",
    commissioned: 1995,
    lat: 20.9606,
    lng: 85.0783,
    status: "OPERATIONAL",
    units: 6,
    loadFactor: 82.1,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "simhadri",
    name: "Simhadri STPS",
    state: "Andhra Pradesh",
    stateId: "AP",
    capacity: 2000,
    type: "Thermal",
    fuel: "Coal",
    operator: "NTPC",
    commissioned: 2002,
    lat: 17.7231,
    lng: 83.1618,
    status: "OPERATIONAL",
    units: 4,
    loadFactor: 79.6,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "tehri",
    name: "Tehri Dam HPP",
    state: "Uttarakhand",
    stateId: "UK",
    capacity: 1000,
    type: "Hydro",
    fuel: "Water",
    operator: "THDC India",
    commissioned: 2006,
    lat: 30.3750,
    lng: 78.4804,
    status: "OPERATIONAL",
    units: 4,
    loadFactor: 42.0,
    co2Rating: "ZERO",
    color: "#3b82f6",
  },
  {
    id: "kudankulam",
    name: "Kudankulam NPP",
    state: "Tamil Nadu",
    stateId: "TN",
    capacity: 2000,
    type: "Nuclear",
    fuel: "Uranium",
    operator: "NPCIL",
    commissioned: 2013,
    lat: 8.1703,
    lng: 77.7152,
    status: "OPERATIONAL",
    units: 2,
    loadFactor: 90.1,
    co2Rating: "ZERO",
    color: "#22c55e",
  },
  {
    id: "rihand",
    name: "Rihand STPS",
    state: "Uttar Pradesh",
    stateId: "UP",
    capacity: 3000,
    type: "Thermal",
    fuel: "Coal",
    operator: "NTPC",
    commissioned: 1988,
    lat: 24.2021,
    lng: 83.0126,
    status: "OPERATIONAL",
    units: 5,
    loadFactor: 85.3,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "bhadla",
    name: "Bhadla Solar Park",
    state: "Rajasthan",
    stateId: "RJ",
    capacity: 2245,
    type: "Solar",
    fuel: "Photovoltaic",
    operator: "SECI / Various",
    commissioned: 2020,
    lat: 27.5318,
    lng: 71.9085,
    status: "OPERATIONAL",
    units: null,
    loadFactor: 28.5,
    co2Rating: "ZERO",
    color: "#f59e0b",
  },
  {
    id: "koyna",
    name: "Koyna HPP",
    state: "Maharashtra",
    stateId: "MH",
    capacity: 1960,
    type: "Hydro",
    fuel: "Water",
    operator: "Maharashtra Genco",
    commissioned: 1962,
    lat: 17.3985,
    lng: 73.7491,
    status: "OPERATIONAL",
    units: 4,
    loadFactor: 38.2,
    co2Rating: "ZERO",
    color: "#3b82f6",
  },
  {
    id: "korba-west",
    name: "Korba West STPS",
    state: "Chhattisgarh",
    stateId: "CG",
    capacity: 2100,
    type: "Thermal",
    fuel: "Coal",
    operator: "CSPDCL / NTPC",
    commissioned: 1982,
    lat: 22.3595,
    lng: 82.6887,
    status: "OPERATIONAL",
    units: 4,
    loadFactor: 77.9,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "raichur",
    name: "Raichur TPS",
    state: "Karnataka",
    stateId: "KA",
    capacity: 1470,
    type: "Thermal",
    fuel: "Coal",
    operator: "KPCL",
    commissioned: 1985,
    lat: 16.2120,
    lng: 77.3566,
    status: "OPERATIONAL",
    units: 7,
    loadFactor: 69.4,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "bakreswar",
    name: "Bakreswar TPS",
    state: "West Bengal",
    stateId: "WB",
    capacity: 1050,
    type: "Thermal",
    fuel: "Coal",
    operator: "WBPDCL",
    commissioned: 1996,
    lat: 23.8716,
    lng: 87.3800,
    status: "OPERATIONAL",
    units: 5,
    loadFactor: 73.6,
    co2Rating: "HIGH",
    color: "#f97316",
  },
  {
    id: "palatana",
    name: "Palatana Gas PP",
    state: "Tripura",
    stateId: "TR",
    capacity: 726,
    type: "Gas",
    fuel: "Natural Gas",
    operator: "OIL / ONGC",
    commissioned: 2013,
    lat: 23.6600,
    lng: 91.2600,
    status: "OPERATIONAL",
    units: 4,
    loadFactor: 55.8,
    co2Rating: "MEDIUM",
    color: "#a855f7",
  },
  {
    id: "pawanputra",
    name: "Pawanputra Wind Farm",
    state: "Gujarat",
    stateId: "GJ",
    capacity: 1100,
    type: "Wind",
    fuel: "Wind",
    operator: "Suzlon / Private",
    commissioned: 2009,
    lat: 21.6000,
    lng: 70.4500,
    status: "OPERATIONAL",
    units: null,
    loadFactor: 32.1,
    co2Rating: "ZERO",
    color: "#06b6d4",
  },
];

// ============================================================
// UTILITY HELPERS
// ============================================================
const TYPE_COLORS = {
  Thermal: "#f97316",
  Hydro:   "#3b82f6",
  Nuclear: "#22c55e",
  Solar:   "#f59e0b",
  Wind:    "#06b6d4",
  Gas:     "#a855f7",
};

const TYPE_ICONS = {
  Thermal: "🔥",
  Hydro:   "💧",
  Nuclear: "⚛",
  Solar:   "☀",
  Wind:    "💨",
  Gas:     "🔵",
};

const CO2_COLOR = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  ZERO:   "#22c55e",
};

const getCapacityBand = (mw) => {
  if (mw >= 4000) return { label: "ULTRA MEGA", color: "#ef4444" };
  if (mw >= 2000) return { label: "SUPER LARGE", color: "#f97316" };
  if (mw >= 1000) return { label: "LARGE", color: "#f59e0b" };
  return { label: "MEDIUM", color: "#3b82f6" };
};

// ============================================================
// STYLES (matching BharatPower.IO design system)
// ============================================================
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root {
    background: #0a0f1a;
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }

  .gm-panel {
    background: #0d1526;
    border: 1px solid rgba(100,116,139,0.25);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4);
    position: relative;
    overflow: hidden;
  }

  .gm-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(59,130,246,0.4), transparent);
    pointer-events: none;
  }

  .gm-panel-header {
    background: rgba(15,23,42,0.85);
    border-bottom: 1px solid rgba(100,116,139,0.2);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .gm-panel-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: #475569;
    font-weight: 500;
  }

  .gm-readout {
    font-family: 'JetBrains Mono', monospace;
    font-variant-numeric: tabular-nums;
  }

  .led-green  { color: #22c55e; text-shadow: 0 0 8px rgba(34,197,94,0.6); }
  .led-blue   { color: #3b82f6; text-shadow: 0 0 8px rgba(59,130,246,0.6); }
  .led-orange { color: #f97316; text-shadow: 0 0 8px rgba(249,115,22,0.6); }
  .led-amber  { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.6); }
  .led-cyan   { color: #06b6d4; text-shadow: 0 0 8px rgba(6,182,212,0.6); }
  .led-red    { color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.6); }

  .scan-overlay {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.08), transparent);
    pointer-events: none;
    animation: scan-line 8s linear infinite;
    z-index: 9999;
  }

  @keyframes scan-line {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes pulse-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }

  @keyframes fade-in-right {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes blink-cursor {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .side-panel-enter {
    animation: fade-in-right 0.2s ease forwards;
  }

  .gm-stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    border-bottom: 1px solid rgba(100,116,139,0.08);
  }

  .gm-stat-row:last-child { border-bottom: none; }
  .gm-stat-row:hover { background: rgba(59,130,246,0.04); }

  .load-bar-track {
    height: 4px;
    background: rgba(30,41,59,0.8);
    border-radius: 0;
    overflow: hidden;
    flex: 1;
  }

  /* Leaflet overrides */
  .leaflet-container {
    background: #0a0f1a !important;
    font-family: 'JetBrains Mono', monospace !important;
  }

  .leaflet-tile-pane { filter: brightness(0.85) saturate(0.9); }

  .leaflet-control-zoom {
    border: 1px solid rgba(100,116,139,0.4) !important;
    background: #0d1526 !important;
    box-shadow: none !important;
  }

  .leaflet-control-zoom a {
    background: #0d1526 !important;
    color: #64748b !important;
    border-color: rgba(100,116,139,0.3) !important;
    font-family: monospace !important;
  }

  .leaflet-control-zoom a:hover {
    background: rgba(59,130,246,0.15) !important;
    color: #3b82f6 !important;
  }

  .leaflet-control-attribution {
    background: rgba(9,14,28,0.9) !important;
    color: #1e293b !important;
    font-size: 9px !important;
    font-family: monospace !important;
  }

  .leaflet-control-attribution a { color: #334155 !important; }

  .leaflet-popup-content-wrapper {
    background: #0d1526 !important;
    border: 1px solid rgba(100,116,139,0.3) !important;
    border-radius: 0 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
    padding: 0 !important;
    color: #e2e8f0 !important;
  }

  .leaflet-popup-tip { background: #0d1526 !important; }
  .leaflet-popup-content { margin: 0 !important; }

  .power-marker-pulse {
    animation: pulse-ring 2s ease infinite;
    border-radius: 50%;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0f1a; }
  ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); }
  ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
`;

// ============================================================
// CUSTOM LEAFLET ICON BUILDER (no external images)
// ============================================================
function buildMarkerIcon(grid, isSelected) {
  const color = TYPE_COLORS[grid.type] || "#64748b";
  const size = isSelected ? 22 : 16;
  const band = getCapacityBand(grid.capacity);
  const pulseColor = color.replace("#", "");

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size + 12}" height="${size + 12}" viewBox="0 0 ${size + 12} ${size + 12}">
      <circle cx="${(size + 12) / 2}" cy="${(size + 12) / 2}" r="${(size + 12) / 2 - 1}"
        fill="${color}22" stroke="${color}" stroke-width="${isSelected ? 2 : 1.5}" />
      <circle cx="${(size + 12) / 2}" cy="${(size + 12) / 2}" r="${size / 4}"
        fill="${color}" />
    </svg>
  `;

  // We'll return config for a DivIcon
  return {
    html: `
      <div style="
        width:${size + 12}px; height:${size + 12}px;
        position:relative; cursor:pointer;
        filter: drop-shadow(0 0 ${isSelected ? 10 : 5}px ${color});
      ">
        ${svgIcon}
        ${isSelected ? `<div style="
          position:absolute; top:-3px; left:-3px; right:-3px; bottom:-3px;
          border-radius:50%; border:1px solid ${color};
          opacity:0.4; animation:pulse-ring 1.5s ease infinite;
        "></div>` : ""}
      </div>
    `,
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -(size + 12) / 2 - 4],
    className: "",
  };
}

// ============================================================
// DETAIL SIDE PANEL
// ============================================================
function DetailPanel({ grid, onClose }) {
  const color = TYPE_COLORS[grid.type] || "#64748b";
  const band = getCapacityBand(grid.capacity);
  const co2Color = CO2_COLOR[grid.co2Rating];

  return (
    <div
      className="gm-panel side-panel-enter"
      style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "320px",
        zIndex: 1000,
        boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 20px ${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {/* Panel top accent */}
      <div style={{ height: "2px", background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />

      {/* Header */}
      <div className="gm-panel-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "24px", height: "24px",
            border: `1px solid ${color}66`,
            background: `${color}11`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px",
          }}>
            {TYPE_ICONS[grid.type]}
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: "9px", letterSpacing: "0.15em" }}>
              STATION PROFILE
            </div>
            <div style={{ color: color, fontSize: "9px", letterSpacing: "0.1em", fontFamily: "monospace" }}>
              {grid.type.toUpperCase()} · {grid.stateId}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid rgba(100,116,139,0.3)",
            color: "#475569",
            cursor: "pointer",
            padding: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(100,116,139,0.3)"; e.currentTarget.style.color = "#475569"; }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Station name */}
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid rgba(100,116,139,0.1)" }}>
        <div className="gm-readout" style={{
          fontSize: "16px", fontWeight: "700",
          color: "#e2e8f0",
          letterSpacing: "0.05em",
          lineHeight: 1.2,
        }}>
          {grid.name}
        </div>
        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", fontFamily: "monospace" }}>
          {grid.state}
        </div>
      </div>

      {/* Capacity hero */}
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid rgba(100,116,139,0.1)",
        background: `${color}08`,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.12em" }}>INSTALLED CAPACITY</div>
          <div className="gm-readout" style={{
            fontSize: "32px", fontWeight: "700",
            color: color,
            textShadow: `0 0 20px ${color}66`,
            lineHeight: 1.1,
          }}>
            {grid.capacity.toLocaleString("en-IN")}
            <span style={{ fontSize: "14px", fontWeight: "400", color: "#64748b", marginLeft: "4px" }}>MW</span>
          </div>
        </div>
        <div style={{
          padding: "3px 8px",
          background: `${band.color}18`,
          border: `1px solid ${band.color}44`,
          color: band.color,
          fontSize: "10px",
          letterSpacing: "0.1em",
          fontFamily: "monospace",
        }}>
          {band.label}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "4px 0" }}>
        {[
          { label: "OPERATOR", value: grid.operator, color: "#e2e8f0" },
          { label: "FUEL TYPE", value: `${grid.fuel}`, color: color },
          { label: "COMMISSIONED", value: grid.commissioned, color: "#94a3b8" },
          { label: "PLANT UNITS", value: grid.units ? `${grid.units} UNITS` : "DISTRIBUTED", color: "#94a3b8" },
          { label: "CO₂ RATING", value: grid.co2Rating, color: co2Color },
          { label: "CO-ORDINATES", value: `${grid.lat.toFixed(4)}°N, ${grid.lng.toFixed(4)}°E`, color: "#475569" },
        ].map(({ label, value, color: valColor }) => (
          <div className="gm-stat-row" key={label}>
            <span style={{ color: "#475569", fontSize: "10px", letterSpacing: "0.1em" }}>{label}</span>
            <span className="gm-readout" style={{ color: valColor, fontSize: "11px", fontWeight: "600" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Load Factor bar */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(100,116,139,0.1)",
        background: "rgba(15,23,42,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ color: "#475569", fontSize: "9px", letterSpacing: "0.1em" }}>PLANT LOAD FACTOR</span>
          <span className="gm-readout" style={{
            color: grid.loadFactor > 75 ? "#22c55e" : grid.loadFactor > 50 ? "#f59e0b" : "#64748b",
            fontSize: "11px", fontWeight: "700",
          }}>
            {grid.loadFactor}%
          </span>
        </div>
        <div className="load-bar-track">
          <div style={{
            height: "100%",
            width: `${grid.loadFactor}%`,
            background: grid.loadFactor > 75
              ? "linear-gradient(to right, #16a34a, #22c55e)"
              : grid.loadFactor > 50
                ? "linear-gradient(to right, #d97706, #f59e0b)"
                : "linear-gradient(to right, #334155, #475569)",
            boxShadow: `0 0 6px ${grid.loadFactor > 75 ? "rgba(34,197,94,0.5)" : "rgba(245,158,11,0.4)"}`,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        padding: "8px 14px",
        background: "rgba(9,14,28,0.6)",
        borderTop: "1px solid rgba(100,116,139,0.1)",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <div style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#22c55e",
          animation: "pulse-ring 2s ease infinite",
          boxShadow: "0 0 0 0 rgba(34,197,94,0.5)",
        }} />
        <span className="gm-readout" style={{ color: "#22c55e", fontSize: "10px", letterSpacing: "0.1em" }}>
          {grid.status}
        </span>
        <span style={{ color: "#1e293b", marginLeft: "auto", fontSize: "9px", fontFamily: "monospace" }}>
          SRC: CEA/NTPC DB
        </span>
      </div>
    </div>
  );
}

// ============================================================
// LEGEND PANEL
// ============================================================
function LegendPanel() {
  return (
    <div
      className="gm-panel"
      style={{
        position: "absolute",
        bottom: "40px",
        left: "12px",
        zIndex: 1000,
        minWidth: "170px",
      }}
    >
      <div className="gm-panel-header">
        <Layers size={10} color="#3b82f6" />
        <span className="gm-panel-label">LEGEND</span>
      </div>
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%",
              background: color,
              boxShadow: `0 0 5px ${color}`,
              flexShrink: 0,
            }} />
            <span style={{ color: "#64748b", fontSize: "10px", fontFamily: "monospace" }}>
              {TYPE_ICONS[type]} {type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STATS BAR (top-right corner of map)
// ============================================================
function StatsBar({ grids }) {
  const totalMW = grids.reduce((a, g) => a + g.capacity, 0);
  const byType = grids.reduce((acc, g) => {
    acc[g.type] = (acc[g.type] || 0) + g.capacity;
    return acc;
  }, {});

  return (
    <div
      className="gm-panel"
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "0",
        minWidth: "200px",
      }}
    >
      <div className="gm-panel-header">
        <BarChart2 size={10} color="#3b82f6" />
        <span className="gm-panel-label">TOTAL TRACKED CAPACITY</span>
      </div>
      <div style={{ padding: "10px 14px" }}>
        <div className="gm-readout led-blue" style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "0.05em" }}>
          {(totalMW / 1000).toFixed(1)}
          <span style={{ fontSize: "12px", fontWeight: "400", color: "#475569", marginLeft: "4px" }}>GW</span>
        </div>
        <div style={{ color: "#334155", fontSize: "9px", marginTop: "2px", fontFamily: "monospace" }}>
          {grids.length} STATIONS MAPPED
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(100,116,139,0.1)", padding: "6px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {Object.entries(byType).map(([type, mw]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: TYPE_COLORS[type],
              boxShadow: `0 0 4px ${TYPE_COLORS[type]}`,
              flexShrink: 0,
            }} />
            <span style={{ color: "#475569", fontSize: "9px", fontFamily: "monospace", flex: 1 }}>{type.toUpperCase()}</span>
            <span className="gm-readout" style={{ color: TYPE_COLORS[type], fontSize: "10px" }}>
              {mw.toLocaleString("en-IN")} MW
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function GridMap() {
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [time, setTime] = useState(new Date());
  const [blinkOn, setBlinkOn] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const leafletRef = useRef(null);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const b = setInterval(() => setBlinkOn(p => !p), 800);
    return () => { clearInterval(t); clearInterval(b); };
  }, []);

  // ── Dynamically load Leaflet (SSR-safe) ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (window.L) {
      leafletRef.current = window.L;
      setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      leafletRef.current = window.L;
      setMapReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // ── Initialise map ──
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

    const L = leafletRef.current;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    // Dark tile layer — CartoDB Dark Matter
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    // Add markers for all grids
    POWER_GRIDS.forEach((grid) => {
      const iconConfig = buildMarkerIcon(grid, false);
      const icon = L.divIcon(iconConfig);

      const marker = L.marker([grid.lat, grid.lng], { icon })
        .addTo(map)
        .on("click", () => {
          setSelectedGrid(grid);
          // Re-render all markers to show selection state
          Object.entries(markersRef.current).forEach(([id, m]) => {
            const g = POWER_GRIDS.find(g => g.id === id);
            if (!g) return;
            const cfg = buildMarkerIcon(g, id === grid.id);
            m.setIcon(L.divIcon(cfg));
          });
        });

      markersRef.current[grid.id] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, [mapReady]);

  // ── Update marker visuals when selection changes ──
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const L = leafletRef.current;
    POWER_GRIDS.forEach((grid) => {
      const marker = markersRef.current[grid.id];
      if (!marker) return;
      const cfg = buildMarkerIcon(grid, selectedGrid?.id === grid.id);
      marker.setIcon(L.divIcon(cfg));
    });
  }, [selectedGrid, mapReady]);

  // ── Filter: hide/show markers ──
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    POWER_GRIDS.forEach((grid) => {
      const marker = markersRef.current[grid.id];
      if (!marker) return;
      if (filterType === "ALL" || grid.type === filterType) {
        marker.addTo(mapInstanceRef.current);
      } else {
        marker.remove();
      }
    });
  }, [filterType, mapReady]);

  const filteredCount = filterType === "ALL"
    ? POWER_GRIDS.length
    : POWER_GRIDS.filter(g => g.type === filterType).length;

  const FILTER_TYPES = ["ALL", ...Object.keys(TYPE_COLORS)];

  return (
    <>
      <style>{STYLES}</style>
      <div className="scan-overlay" />

      <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      <header>
          {/* Filter bar */}
          <div style={{
            borderTop: "1px solid rgba(100,116,139,0.12)",
            padding: "6px 16px",
            background: "rgba(9,14,28,0.7)",
            display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
          }}>
            <span style={{ color: "#334155", fontSize: "9px", letterSpacing: "0.12em", marginRight: "4px" }}>
              FILTER BY TYPE:
            </span>
            {FILTER_TYPES.map((type) => {
              const active = filterType === type;
              const color = TYPE_COLORS[type] || "#3b82f6";
              return (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    if (selectedGrid && type !== "ALL" && selectedGrid.type !== type) {
                      setSelectedGrid(null);
                    }
                  }}
                  style={{
                    background: active ? `${color}18` : "transparent",
                    border: `1px solid ${active ? color + "66" : "rgba(100,116,139,0.25)"}`,
                    color: active ? color : "#475569",
                    fontFamily: "monospace",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    padding: "3px 10px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "5px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = `${color}44`;
                      e.currentTarget.style.color = color;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "rgba(100,116,139,0.25)";
                      e.currentTarget.style.color = "#475569";
                    }
                  }}
                >
                  {type !== "ALL" && (
                    <span style={{ fontSize: "10px" }}>{TYPE_ICONS[type]}</span>
                  )}
                  {type}
                </button>
              );
            })}
          </div>
        </header>

        {/* ── MAP CONTAINER ── */}
        <main style={{ flex: 1, position: "relative" }}>

          {/* Leaflet Map */}
          <div
            ref={mapRef}
            style={{ width: "100%", height: "calc(100vh - 140px)", minHeight: "500px", background: "#0a0f1a" }}
          />

          {/* Loading overlay */}
          {!mapReady && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 2000,
              background: "#0a0f1a",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "16px",
            }}>
              <div style={{
                width: "48px", height: "48px",
                border: "2px solid rgba(59,130,246,0.3)",
                borderTop: "2px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <div style={{ color: "#475569", fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.15em" }}>
                INITIALISING GRID MAP...
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Stats Panel (top-left) */}
          {mapReady && <StatsBar grids={POWER_GRIDS} />}

          {/* Detail Panel (top-right) */}
          {mapReady && selectedGrid && (
            <DetailPanel
              grid={selectedGrid}
              onClose={() => {
                setSelectedGrid(null);
                if (mapReady && leafletRef.current) {
                  const L = leafletRef.current;
                  POWER_GRIDS.forEach((grid) => {
                    const marker = markersRef.current[grid.id];
                    if (!marker) return;
                    marker.setIcon(L.divIcon(buildMarkerIcon(grid, false)));
                  });
                }
              }}
            />
          )}

          {/* Legend (bottom-left) */}
          {mapReady && <LegendPanel />}

          {/* Click-to-explore hint */}
          {mapReady && !selectedGrid && (
            <div style={{
              position: "absolute",
              bottom: "40px",
              right: "12px",
              zIndex: 1000,
            }}>
              <div className="gm-panel" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={10} color="#334155" />
                <span style={{ color: "#334155", fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
                  CLICK A MARKER TO INSPECT
                </span>
                <ChevronRight size={10} color="#334155" />
              </div>
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid rgba(100,116,139,0.15)",
          padding: "10px 16px",
          background: "rgba(9,14,28,0.8)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={11} color="#334155" />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              DATA SOURCES: CEA · NTPC ANNUAL REPORTS · POSOCO · MoP INDIA
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "monospace" }}>
              MAP TILES: © CARTO / OPENSTREETMAP
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
