<div align="center">

```
██████╗ ██╗  ██╗ █████╗ ██████╗  █████╗ ████████╗
██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝
██████╔╝███████║███████║██████╔╝███████║   ██║
██╔══██╗██╔══██║██╔══██║██╔══██╗██╔══██║   ██║
██████╔╝██║  ██║██║  ██║██║  ██║██║  ██║   ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
         P O W E R . I O
```

**Real-time India Electricity Market Intelligence Dashboard**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-Flask-3776ab?style=flat-square&logo=python)](https://flask.palletsprojects.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

*Live IEX pricing · Grid frequency · Zone arbitrage · Carbon impact · 15-second polling*

</div>

---

## Overview

BharatPower.io is a Bloomberg-terminal-style dashboard that brings real-time visibility to India's electricity market. It scrapes live data from [IEX (Indian Energy Exchange)](https://www.iexindia.com) and [Grid-India](https://www.grid-india.in), then surfaces actionable intelligence — price arbitrage opportunities, grid health, zone-level demand signals, and carbon sustainability metrics — refreshed every 15 seconds.

Built entirely without external charting libraries. All visualizations (gauges, sparklines, bar charts) are hand-crafted with SVG and Tailwind utility classes.

---

## Features

### Market Dashboard (`/`)
- **Live MCP (Market Clearing Price)** — scraped from IEX in ₹/kWh, with fallback handling
- **Grid Frequency Gauge** — real-time Hz reading from Grid-India; color-coded NOMINAL / STRESSED status
- **Zone-Level Price Aggregation** — North, South, East, West, NE regional averages derived from 21 state-level prices
- **Arbitrage Detection** — automatically identifies the cheapest and most expensive zones; highlights spread opportunities
- **State Price Table** — all 21 states with trend indicators (↑ / → / ↓)
- **Peak Window Countdown** — live timer to the next peak / off-peak window (06:00–09:00 and 18:00–22:00 IST)
- **Price Sparklines** — rolling mini-charts per state built with inline SVGs

### Sustainability & Carbon Impact (`/sustainability`)
- **Grid Carbon Intensity** — per-zone gCO₂/kWh estimates based on CEA 2023-24 generation mix (East: coal-heavy at 890 g/kWh → NE: hydro-dominant at 310 g/kWh)
- **Peak vs Off-Peak Carbon Split** — +28% peaker-plant multiplier during peak hours; −13% base-load factor off-peak
- **Impact Metrics Row** — CO₂ Emitted, CO₂ Saved, Trees Equivalent, Eco-Score (0–100 gauge)
- **Consumption Profile Toggle** — compare "My Profile" (20% peak / 80% off-peak) vs "Average Consumer" (45/55)
- **Emissions Breakdown Bar** — stacked visual of peak vs off-peak daily kg CO₂
- **Live Recommendations Engine** — contextual dispatch advice driven by current peak status and zone carbon data

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (PostCSS plugin, no config file) |
| Backend | Python 3, Flask 3, Flask-CORS |
| Scraping | `requests` + `BeautifulSoup4` |
| Fonts | Geist Sans + Geist Mono (via `next/font`) |
| Charts | Zero external libs — raw SVG + Tailwind `div` bars |
| Data refresh | Client-side polling every 15 seconds |

---

## Project Structure

```
bharatpower/
├── bharat-power-backend/          # Python / Flask API
│   ├── app.py                     # Main Flask app — scrapers + /api/v1/dashboard
│   └── requirements.txt
│
└── bharat-power-io/               # Next.js frontend
    ├── app/
    │   ├── layout.tsx              # Root layout with NavBar
    │   ├── page.tsx                # Main dashboard page (/)
    │   ├── globals.css             # Tailwind v4 base styles
    │   ├── sustainability/
    │   │   └── page.tsx            # Carbon impact page (/sustainability)
    │   └── components/
    │       ├── NavBar.tsx          # Shared sticky navigation
    │       ├── CarbonImpactPanel.tsx  # Main sustainability module
    │       └── EcoRecommendations.tsx # Live dispatch recommendation cards
    ├── types/
    │   └── sustainability.ts       # TypeScript interfaces + consumption profiles
    ├── lib/
    │   └── carbonCalc.ts           # Carbon metric calculation utilities
    ├── next.config.ts
    ├── tsconfig.json
    ├── postcss.config.mjs          # Tailwind v4 via @tailwindcss/postcss
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.9.0
- Python ≥ 3.10
- npm or pnpm

### 1. Clone the repo

```bash
git clone https://github.com/Sayantan176/bharatpower.git
cd bharatpower
```

### 2. Start the backend

```bash
cd bharat-power-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The Flask server starts at `http://localhost:5000`.

> **Note:** The scraper targets live IEX and Grid-India pages. If either site is unreachable, sensible fallback values are returned automatically — the dashboard will still render.

### 3. Start the frontend

```bash
cd bharat-power-io
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Environment variable (optional):** If your Flask server runs on a different host/port, create `.env.local` in `bharat-power-io/`:
> ```
> NEXT_PUBLIC_API_URL=http://localhost:5000
> ```

---

## API Reference

### `GET /api/v1/dashboard`

Single endpoint powering both pages. Returns the full dashboard payload including the sustainability sub-object.

```jsonc
{
  "gridFrequency": "50.02",
  "gridStatus": "NOMINAL",           // "NOMINAL" | "STRESSED"
  "statePrices": [
    {
      "id": "DL",
      "name": "Delhi",
      "price": 9.35,                 // ₹/kWh
      "trend": "up",                 // "up" | "down" | "stable"
      "zone": "NORTH"
    }
    // ... 20 more states
  ],
  "peakStatus": {
    "status": "NOMINAL",             // "PEAK" | "NOMINAL"
    "recommendation": "System Stable",
    "currentLoad": "88%",
    "peakDemand": "221.4 GW"
  },
  "sustainability": {
    "zones": [
      {
        "zone": "East",
        "base_carbon_intensity_g_kwh": 890,
        "effective_carbon_intensity_g_kwh": 774,  // adjusted for off-peak factor
        "renewables_share_pct": 9.0,
        "mcp_rs_kwh": 6.12
      }
      // ... North, South, West, NE
    ],
    "national_avg_carbon_intensity_g_kwh": 714,
    "peak_carbon_multiplier": 1.28,
    "offpeak_carbon_factor": 0.87,
    "is_peak_hour": false,
    "peak_hour_ranges": ["06:00–09:00 IST", "18:00–22:00 IST"],
    "data_note": "Simulated values based on CEA 2023-24 generation mix reports"
  }
}
```

---

## Carbon Intensity Data

Zone intensities are derived from India's Central Electricity Authority (CEA) Annual Report 2023-24 regional generation mix.

| Zone | Base (gCO₂/kWh) | RE Share | Primary generation |
|------|----------------:|--------:|--------------------|
| NE | 310 | 71% | Assam / Meghalaya run-of-river hydro |
| South | 540 | 41% | TN wind, AP/KA/TS utility solar, Kerala hydro |
| West | 680 | 32% | Gujarat / Rajasthan solar vs Maharashtra / CG coal |
| North | 820 | 18% | NTPC Dadri, Singrauli; minor Himalayan hydro |
| East | 890 | 9% | Jharkhand / WB / Odisha pithead coal stations |

Peak hours trigger a **×1.28 multiplier** (gas/liquid-fuel peaker plants displace cleaner base-load). Off-peak hours apply a **×0.87 factor** (nuclear and daytime solar dominate the merit order).

---

## Design Philosophy

The UI is deliberately styled as a **Bloomberg terminal for India's power sector** — dense, monospace, dark, and data-forward. Key constraints upheld throughout:

- **Zero external chart libraries** — every visual element is a `<div>`, Tailwind class, or inline `<svg>` path
- **No gradients or drop shadows** — flat, high-contrast surfaces only
- **Monospace throughout** — Geist Mono for all data values; creates the terminal scan-read pattern
- **Semantic color coding** — `emerald` for clean/off-peak, `rose` for carbon-heavy/peak, `amber` for warnings, `cyan` for neutral metrics
- **15-second client-side polling** — mirrors how power traders consume live exchange data

---

## Roadmap

- [ ] Historical MCP sparklines with 24-hour window
- [ ] CESC / DISCOM zone granularity
- [ ] WebSocket push from backend (replace polling)
- [ ] Real carbon intensity via CO2signal API integration
- [ ] Export to CSV / Excel for bulk consumers
- [ ] PWA support for mobile field use
- [ ] Dark / light theme toggle

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss the approach.

```bash
# Lint
cd bharat-power-io && npm run lint

# Type-check
npx tsc --noEmit
```

---

## License

[MIT](LICENSE) © 2025 [Sayantan176](https://github.com/Sayantan176)

---

<div align="center">
<sub>Data sourced from IEX India and Grid-India · Carbon estimates from CEA 2023-24 · For informational purposes only</sub>
</div>
