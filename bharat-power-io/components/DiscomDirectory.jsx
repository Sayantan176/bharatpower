"use client";

import { useState, useMemo } from "react";
import { Search, Globe, Terminal, Zap, Filter, Building2, MapPin, Tag, Calendar, ChevronRight, X, Database } from "lucide-react";

// ─────────────────────────────────────────────
// DISCOM DATA (source: india_power_discoms_full.csv)
// ─────────────────────────────────────────────
const DISCOMS = [
  { state: "Andhra Pradesh", org: "APSPDCL",              type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Tirupati",           ownership: "State Govt",    website: "https://www.apspdcl.in" },
  { state: "Andhra Pradesh", org: "APEPDCL",              type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Visakhapatnam",      ownership: "State Govt",    website: "https://www.apeasternpower.com" },
  { state: "Assam",          org: "APDCL",               type: "DISCOM",     function: "Distribution", year: "2009",  hq: "Guwahati",           ownership: "State Govt",    website: "https://apdcl.org" },
  { state: "Bihar",          org: "NBPDCL",              type: "DISCOM",     function: "Distribution", year: "2012",  hq: "Patna",              ownership: "State Govt",    website: "https://nbpdcl.co.in" },
  { state: "Bihar",          org: "SBPDCL",              type: "DISCOM",     function: "Distribution", year: "2012",  hq: "Patna",              ownership: "State Govt",    website: "https://sbpdcl.co.in" },
  { state: "Delhi",          org: "BSES Rajdhani",        type: "DISCOM",     function: "Distribution", year: "2002",  hq: "Delhi",              ownership: "Private+Govt",  website: "https://www.bsesdelhi.com" },
  { state: "Delhi",          org: "BSES Yamuna",          type: "DISCOM",     function: "Distribution", year: "2002",  hq: "Delhi",              ownership: "Private+Govt",  website: "https://www.bsesdelhi.com" },
  { state: "Delhi",          org: "Tata Power Delhi",     type: "DISCOM",     function: "Distribution", year: "2002",  hq: "Delhi",              ownership: "Private+Govt",  website: "https://www.tatapower-ddl.com" },
  { state: "Gujarat",        org: "DGVCL",               type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Surat",              ownership: "State Govt",    website: "https://www.dgvcl.com" },
  { state: "Gujarat",        org: "MGVCL",               type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Vadodara",           ownership: "State Govt",    website: "https://www.mgvcl.com" },
  { state: "Haryana",        org: "UHBVN",               type: "DISCOM",     function: "Distribution", year: "1999",  hq: "Panchkula",          ownership: "State Govt",    website: "https://uhbvn.org.in" },
  { state: "Haryana",        org: "DHBVN",               type: "DISCOM",     function: "Distribution", year: "1999",  hq: "Hisar",              ownership: "State Govt",    website: "https://dhbvn.org.in" },
  { state: "Karnataka",      org: "BESCOM",              type: "DISCOM",     function: "Distribution", year: "2002",  hq: "Bangalore",          ownership: "State Govt",    website: "https://bescom.karnataka.gov.in" },
  { state: "Karnataka",      org: "MESCOM",              type: "DISCOM",     function: "Distribution", year: "2002",  hq: "Mangalore",          ownership: "State Govt",    website: "https://mescom.karnataka.gov.in" },
  { state: "Kerala",         org: "KSEB",                type: "Integrated", function: "Gen+Dist",     year: "1957",  hq: "Thiruvananthapuram", ownership: "State Govt",    website: "https://kseb.in" },
  { state: "Maharashtra",    org: "MSEDCL",              type: "DISCOM",     function: "Distribution", year: "2005",  hq: "Mumbai",             ownership: "State Govt",    website: "https://www.mahadiscom.in" },
  { state: "Maharashtra",    org: "Adani Electricity Mumbai", type: "Private", function: "Distribution", year: "2018", hq: "Mumbai",            ownership: "Private",       website: "https://www.adanielectricity.com" },
  { state: "Rajasthan",      org: "JVVNL",               type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Jaipur",             ownership: "State Govt",    website: "https://energy.rajasthan.gov.in" },
  { state: "Tamil Nadu",     org: "TANGEDCO",            type: "Integrated", function: "Gen+Dist",     year: "2010",  hq: "Chennai",            ownership: "State Govt",    website: "https://www.tangedco.gov.in" },
  { state: "Telangana",      org: "TSSPDCL",             type: "DISCOM",     function: "Distribution", year: "2014",  hq: "Hyderabad",          ownership: "State Govt",    website: "https://tssouthernpower.com" },
  { state: "Uttar Pradesh",  org: "PVVNL",               type: "DISCOM",     function: "Distribution", year: "2000s", hq: "Meerut",             ownership: "State Govt",    website: "https://www.pvvnl.org" },
  { state: "West Bengal",    org: "WBSEDCL",             type: "DISCOM",     function: "Distribution", year: "2007",  hq: "Kolkata",            ownership: "State Govt",    website: "https://www.wbsedcl.in" },
  { state: "West Bengal",    org: "CESC",                type: "Private",    function: "Distribution", year: "1899",  hq: "Kolkata",            ownership: "Private",       website: "https://www.cesc.co.in" },
];

// ─────────────────────────────────────────────
// OWNERSHIP CONFIG
// ─────────────────────────────────────────────
const OWNERSHIP_CONFIG = {
  "State Govt":   { color: "#22c55e", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.30)",  label: "STATE" },
  "Private":      { color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.30)", label: "PRIVATE" },
  "Private+Govt": { color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)", label: "PPP" },
};

const TYPE_CONFIG = {
  "DISCOM":     { color: "#3b82f6", label: "DISCOM" },
  "Integrated": { color: "#f59e0b", label: "INTEGRATED" },
  "Private":    { color: "#3b82f6", label: "PRIVATE" },
};

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

  @keyframes scan-line {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes pulse-dot {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.3; }
  }

  @keyframes card-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .scan-overlay {
    pointer-events: none;
    position: fixed;
    inset: 0;
    z-index: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
  }

  .scan-line {
    pointer-events: none;
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 120px;
    background: linear-gradient(to bottom, transparent, rgba(59,130,246,0.03), transparent);
    animation: scan-line 8s linear infinite;
    z-index: 1;
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
  .led-amber  { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.6); }

  .search-input {
    width: 100%;
    background: rgba(9,14,28,0.9);
    border: 1px solid rgba(100,116,139,0.3);
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 10px 12px 10px 38px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    letter-spacing: 0.04em;
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5);
  }

  .search-input::placeholder { color: #334155; }

  .search-input:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5), 0 0 0 2px rgba(59,130,246,0.08);
    color: #cbd5e1;
  }

  .filter-btn {
    background: rgba(15,23,42,0.8);
    border: 1px solid rgba(100,116,139,0.2);
    color: #475569;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    padding: 5px 10px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .filter-btn:hover {
    border-color: rgba(59,130,246,0.35);
    color: #3b82f6;
    background: rgba(59,130,246,0.06);
  }

  .filter-btn.active {
    border-color: rgba(59,130,246,0.5);
    color: #3b82f6;
    background: rgba(59,130,246,0.10);
    text-shadow: 0 0 6px rgba(59,130,246,0.5);
  }

  .discom-card {
    background: #0d1526;
    border: 1px solid rgba(100,116,139,0.2);
    position: relative;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    animation: card-in 0.25s ease both;
    overflow: hidden;
  }

  .discom-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent);
  }

  .discom-card:hover {
    border-color: rgba(59,130,246,0.35);
    box-shadow: 0 0 20px rgba(59,130,246,0.06), inset 0 0 20px rgba(59,130,246,0.02);
    transform: translateY(-1px);
  }

  .btn-blue {
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.35);
    color: #3b82f6;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    padding: 5px 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-blue:hover {
    background: rgba(59,130,246,0.18);
    border-color: rgba(59,130,246,0.6);
    box-shadow: 0 0 10px rgba(59,130,246,0.2);
    color: #60a5fa;
  }

  .stat-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    border: 1px solid;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .ticker-wrap {
    overflow: hidden;
    background: rgba(9,14,28,0.9);
    border-bottom: 1px solid rgba(100,116,139,0.15);
    border-top: 1px solid rgba(100,116,139,0.15);
  }

  .ticker-track {
    display: flex;
    gap: 0;
    animation: ticker 60s linear infinite;
    white-space: nowrap;
    width: max-content;
  }

  .select-input {
    background: rgba(9,14,28,0.9);
    border: 1px solid rgba(100,116,139,0.3);
    color: #94a3b8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 8px 10px;
    outline: none;
    cursor: pointer;
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.5);
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 0.2s;
    min-width: 160px;
  }

  .select-input:focus {
    border-color: rgba(59,130,246,0.5);
  }

  @media (max-width: 640px) {
    .discom-grid { grid-template-columns: 1fr !important; }
    .controls-row { flex-direction: column !important; }
  }
`;

// ─────────────────────────────────────────────
// TICKER ITEM
// ─────────────────────────────────────────────
const TICKER_ITEMS = DISCOMS.map(d => `${d.org} · ${d.state}`).join("   ///   ");

// ─────────────────────────────────────────────
// DISCOM CARD
// ─────────────────────────────────────────────
function DiscomCard({ discom, index }) {
  const own = OWNERSHIP_CONFIG[discom.ownership] || OWNERSHIP_CONFIG["State Govt"];
  const typ = TYPE_CONFIG[discom.type] || TYPE_CONFIG["DISCOM"];

  return (
    <div
      className="discom-card"
      style={{ animationDelay: `${(index % 12) * 30}ms` }}
    >
      {/* Card header stripe */}
      <div style={{
        height: "2px",
        background: `linear-gradient(to right, ${own.color}33, ${own.color}88, ${own.color}33)`,
      }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Top row: org name + ownership badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "10px" }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "15px",
              fontWeight: "700",
              color: "#cbd5e1",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              marginBottom: "3px",
            }}>
              {discom.org}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={9} color="#475569" />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: "#475569",
                letterSpacing: "0.06em",
              }}>
                {discom.hq}
              </span>
            </div>
          </div>

          {/* Ownership badge */}
          <span className="stat-chip" style={{
            color: own.color,
            background: own.bg,
            borderColor: own.border,
            flexShrink: 0,
          }}>
            <span style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: own.color,
              boxShadow: `0 0 5px ${own.color}`,
              display: "inline-block",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
            {own.label}
          </span>
        </div>

        {/* Meta row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
          marginBottom: "12px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(100,116,139,0.12)",
        }}>
          {[
            { icon: <Tag size={9} />, label: "TYPE", value: discom.type, color: typ.color },
            { icon: <Zap size={9} />, label: "FUNCTION", value: discom.function, color: "#94a3b8" },
            { icon: <Calendar size={9} />, label: "EST.", value: discom.year, color: "#94a3b8" },
            { icon: <Building2 size={9} />, label: "STATE", value: discom.state, color: "#94a3b8" },
          ].map(({ icon, label, value, color }) => (
            <div key={label}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "8px",
                color: "#334155",
                letterSpacing: "0.12em",
                marginBottom: "2px",
                display: "flex", alignItems: "center", gap: "4px",
              }}>
                <span style={{ color: "#334155" }}>{icon}</span>
                {label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                color: color,
                fontWeight: "600",
                letterSpacing: "0.04em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: website button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            color: "#1e293b",
            letterSpacing: "0.06em",
          }}>
            ▸ DISTRIBUTION UTILITY
          </span>
          <a
            href={discom.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue"
          >
            <Globe size={9} />
            VISIT PORTAL
            <ChevronRight size={8} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function DiscomDirectory() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [ownershipFilter, setOwnershipFilter] = useState("ALL");

  // Unique states from data
  const states = useMemo(() => {
    const s = [...new Set(DISCOMS.map(d => d.state))].sort();
    return ["ALL", ...s];
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DISCOMS.filter(d => {
      const matchSearch = !q || d.org.toLowerCase().includes(q) || d.hq.toLowerCase().includes(q) || d.state.toLowerCase().includes(q);
      const matchState  = stateFilter === "ALL" || d.state === stateFilter;
      const matchOwn    = ownershipFilter === "ALL" || d.ownership === ownershipFilter;
      return matchSearch && matchState && matchOwn;
    });
  }, [search, stateFilter, ownershipFilter]);

  const totalStates = useMemo(() => new Set(DISCOMS.map(d => d.state)).size, []);
  const privateCount = DISCOMS.filter(d => d.ownership === "Private" || d.ownership === "Private+Govt").length;

  return (
    <>
      <style>{STYLES}</style>

      <div className="scan-overlay" />
      <div className="scan-line" />

      <div className="grid-bg" style={{ minHeight: "100vh", position: "relative", zIndex: 2 }}>

        {/* ── MAIN CONTENT ── */}
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

          {/* ── STAT ROW ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}>
            {[
              { label: "TOTAL DISCOMs", value: DISCOMS.length, color: "#3b82f6", icon: <Database size={12} /> },
              { label: "STATES COVERED", value: totalStates,   color: "#22c55e", icon: <MapPin size={12} /> },
              { label: "PRIVATE ENTITIES", value: privateCount, color: "#f59e0b", icon: <Building2 size={12} /> },
              { label: "FILTERED RESULTS", value: filtered.length, color: "#94a3b8", icon: <Filter size={12} /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="panel" style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ color: color }}>{icon}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#334155", letterSpacing: "0.12em" }}>
                    {label}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "26px", fontWeight: "700",
                  color: color,
                  textShadow: `0 0 20px ${color}55`,
                  lineHeight: 1,
                }}>
                  {String(value).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>

          {/* ── SEARCH + FILTER PANEL ── */}
          <div className="panel" style={{ marginBottom: "16px" }}>
            <div className="panel-header">
              <Filter size={11} color="#3b82f6" />
              <span className="panel-label">SEARCH & FILTER CONTROLS</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 5px rgba(34,197,94,0.8)",
                  animation: "pulse-dot 1.5s ease-in-out infinite",
                  display: "inline-block",
                }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#22c55e" }}>
                  {filtered.length} RECORDS
                </span>
              </div>
            </div>

            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <Search size={13} color="#334155" style={{
                  position: "absolute", left: "12px", top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
                <input
                  className="search-input"
                  type="text"
                  placeholder="SEARCH BY NAME, HEADQUARTERS, OR STATE..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  spellCheck={false}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      position: "absolute", right: "10px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: "2px",
                    }}
                  >
                    <X size={12} color="#475569" />
                  </button>
                )}
              </div>

              {/* Filter rows */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }} className="controls-row">
                {/* State filter */}
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#334155", letterSpacing: "0.15em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={9} /> STATE
                  </div>
                  <div style={{ position: "relative" }}>
                    <select
                      className="select-input"
                      value={stateFilter}
                      onChange={e => setStateFilter(e.target.value)}
                      style={{ width: "100%", paddingRight: "24px" }}
                    >
                      {states.map(s => (
                        <option key={s} value={s} style={{ background: "#0d1526" }}>{s}</option>
                      ))}
                    </select>
                    <ChevronRight size={11} color="#475569" style={{
                      position: "absolute", right: "8px", top: "50%",
                      transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none",
                    }} />
                  </div>
                </div>

                {/* Ownership filter */}
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#334155", letterSpacing: "0.15em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Tag size={9} /> OWNERSHIP
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {["ALL", "State Govt", "Private", "Private+Govt"].map(o => (
                      <button
                        key={o}
                        className={`filter-btn${ownershipFilter === o ? " active" : ""}`}
                        onClick={() => setOwnershipFilter(o)}
                      >
                        {o === "ALL" ? "ALL" : o === "State Govt" ? "STATE GOVT" : o === "Private" ? "PRIVATE" : "PPP"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── DISCOM GRID ── */}
          {filtered.length === 0 ? (
            <div className="panel" style={{ padding: "40px", textAlign: "center" }}>
              <Terminal size={24} color="#1e293b" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#334155", letterSpacing: "0.15em" }}>
                NO RECORDS FOUND — ADJUST SEARCH PARAMETERS
              </div>
            </div>
          ) : (
            <>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginBottom: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px", color: "#334155", letterSpacing: "0.12em",
              }}>
                <Terminal size={10} color="#334155" />
                DISPLAYING {filtered.length} OF {DISCOMS.length} ENTITIES
                <div style={{ flex: 1, height: "1px", background: "rgba(100,116,139,0.12)", marginLeft: "8px" }} />
              </div>

              <div
                className="discom-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                  gap: "10px",
                }}
              >
                {filtered.map((d, i) => (
                  <DiscomCard key={`${d.org}-${d.state}`} discom={d} index={i} />
                ))}
              </div>
            </>
          )}

        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid rgba(100,116,139,0.15)",
          padding: "10px 20px",
          background: "rgba(9,14,28,0.8)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
          marginTop: "30px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Terminal size={11} color="#334155" />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
              DATA SOURCES: CEA · STATE SERC FILINGS · MoP ANNUAL REPORTS
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace" }}>
              RECORDS: {DISCOMS.length} DISCOMs ACROSS {totalStates} STATES
            </span>
            <div style={{ width: "1px", height: "12px", background: "rgba(100,116,139,0.2)" }} />
            <span style={{ color: "#1e293b", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace" }}>
              © 2025 BHARATPOWER.IO — FOR INFORMATIONAL USE ONLY
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}
