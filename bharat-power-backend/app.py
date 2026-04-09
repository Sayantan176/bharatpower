import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import KeepTogether
import random
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# ── colour palette (mirrors the JSX dark theme)
C_BG        = colors.HexColor("#0a0f1a")
C_BG2       = colors.HexColor("#0d1526")
C_PANEL     = colors.HexColor("#111827")
C_GREEN     = colors.HexColor("#22c55e")
C_BLUE      = colors.HexColor("#3b82f6")
C_AMBER     = colors.HexColor("#f59e0b")
C_ORANGE    = colors.HexColor("#f97316")
C_RED       = colors.HexColor("#ef4444")
C_PURPLE    = colors.HexColor("#a855f7")
C_MUTED     = colors.HexColor("#94a3b8")
C_DIM       = colors.HexColor("#475569")
C_FAINT     = colors.HexColor("#334155")
C_BORDER    = colors.HexColor("#1e3a5f")
C_WHITE     = colors.HexColor("#e2e8f0")


# ══════════════════════════════════════════════════════════
#  EXISTING SCRAPER ROUTES
# ══════════════════════════════════════════════════════════

def get_live_iex_price():
    try:
        url = "https://www.iexindia.com/market-data/real-time-market/market-snapshot"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        rows = soup.find_all('tr')
        for row in rows:
            if "Avg" in row.text:
                cols = row.find_all('td')
                price_val = float(cols[-1].text.replace(',', '').strip())
                return round(price_val / 1000, 2)
        return 6.45
    except Exception as e:
        print(f"IEX Scrape Failed: {e}")
        return 6.20


def get_grid_freq():
    try:
        url = "https://www.grid-india.in/"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        freq_element = soup.find(id="grid-frequency-value")
        if freq_element:
            return freq_element.text.strip()
        return "50.02"
    except:
        return str(round(random.uniform(49.95, 50.05), 2))


@app.route('/api/v1/dashboard', methods=['GET'])
def get_dashboard_data():
    base = get_live_iex_price()
    freq = get_grid_freq()
    data = {
        "gridFrequency": freq,
        "gridStatus": "NOMINAL" if 49.9 <= float(freq) <= 50.05 else "STRESSED",
        "statePrices": [
            {"id": "DL", "name": "Delhi",          "price": round(base * 1.45, 2), "trend": "up",     "zone": "NORTH"},
            {"id": "UP", "name": "Uttar Pradesh",   "price": round(base * 1.35, 2), "trend": "up",     "zone": "NORTH"},
            {"id": "RJ", "name": "Rajasthan",       "price": round(base * 1.18, 2), "trend": "up",     "zone": "NORTH"},
            {"id": "PB", "name": "Punjab",          "price": round(base * 1.28, 2), "trend": "stable", "zone": "NORTH"},
            {"id": "HR", "name": "Haryana",         "price": round(base * 1.30, 2), "trend": "up",     "zone": "NORTH"},
            {"id": "JK", "name": "J&K",             "price": round(base * 1.10, 2), "trend": "stable", "zone": "NORTH"},
            {"id": "MH", "name": "Maharashtra",     "price": round(base * 1.25, 2), "trend": "up",     "zone": "WEST"},
            {"id": "GJ", "name": "Gujarat",         "price": round(base * 1.12, 2), "trend": "stable", "zone": "WEST"},
            {"id": "MP", "name": "Madhya Pradesh",  "price": round(base * 1.05, 2), "trend": "down",   "zone": "WEST"},
            {"id": "GA", "name": "Goa",             "price": round(base * 1.02, 2), "trend": "stable", "zone": "WEST"},
            {"id": "KA", "name": "Karnataka",       "price": round(base * 0.95, 2), "trend": "down",   "zone": "SOUTH"},
            {"id": "TN", "name": "Tamil Nadu",      "price": round(base * 0.90, 2), "trend": "down",   "zone": "SOUTH"},
            {"id": "AP", "name": "Andhra Pradesh",  "price": round(base * 0.98, 2), "trend": "stable", "zone": "SOUTH"},
            {"id": "KL", "name": "Kerala",          "price": round(base * 1.15, 2), "trend": "up",     "zone": "SOUTH"},
            {"id": "TS", "name": "Telangana",       "price": round(base * 1.05, 2), "trend": "stable", "zone": "SOUTH"},
            {"id": "WB", "name": "West Bengal",     "price": round(base * 1.08, 2), "trend": "stable", "zone": "EAST"},
            {"id": "OR", "name": "Odisha",          "price": round(base * 0.85, 2), "trend": "down",   "zone": "EAST"},
            {"id": "BR", "name": "Bihar",           "price": round(base * 1.22, 2), "trend": "up",     "zone": "EAST"},
            {"id": "JH", "name": "Jharkhand",       "price": round(base * 0.92, 2), "trend": "down",   "zone": "EAST"},
            {"id": "AS", "name": "Assam",           "price": round(base * 1.10, 2), "trend": "stable", "zone": "NORTHEAST"},
            {"id": "ML", "name": "Meghalaya",       "price": round(base * 1.05, 2), "trend": "stable", "zone": "NORTHEAST"},
        ],
        "peakStatus": {
            "status": "PEAK" if base > 7.5 else "NOMINAL",
            "recommendation": "High Demand - Shift Load" if base > 7.5 else "System Stable",
            "currentLoad": f"{random.randint(84, 92)}%",
            "peakDemand": "221.4 GW",
        }
    }
    return jsonify(data)


# ══════════════════════════════════════════════════════════
#  PDF HELPERS
# ══════════════════════════════════════════════════════════

def make_styles():
    return {
        "title": ParagraphStyle("title",
            fontName="Helvetica-Bold", fontSize=18,
            textColor=C_GREEN, leading=22, spaceAfter=2),

        "subtitle": ParagraphStyle("subtitle",
            fontName="Helvetica", fontSize=9,
            textColor=C_DIM, leading=12, spaceAfter=10, letterSpacing=2),

        "section_header": ParagraphStyle("section_header",
            fontName="Helvetica-Bold", fontSize=8,
            textColor=C_MUTED, leading=10, spaceBefore=10, spaceAfter=6, letterSpacing=3),

        "kpi_label": ParagraphStyle("kpi_label",
            fontName="Helvetica", fontSize=7,
            textColor=C_FAINT, leading=9, letterSpacing=2),

        "kpi_value": ParagraphStyle("kpi_value",
            fontName="Helvetica-Bold", fontSize=22, textColor=C_GREEN, leading=26),

        "kpi_value_red": ParagraphStyle("kpi_value_red",
            fontName="Helvetica-Bold", fontSize=22, textColor=C_RED, leading=26),

        "kpi_value_orange": ParagraphStyle("kpi_value_orange",
            fontName="Helvetica-Bold", fontSize=22, textColor=C_ORANGE, leading=26),

        "kpi_value_blue": ParagraphStyle("kpi_value_blue",
            fontName="Helvetica-Bold", fontSize=22, textColor=C_BLUE, leading=26),

        "kpi_sub": ParagraphStyle("kpi_sub",
            fontName="Helvetica", fontSize=7, textColor=C_DIM, leading=9),

        "table_header": ParagraphStyle("table_header",
            fontName="Helvetica-Bold", fontSize=7,
            textColor=C_DIM, leading=9, letterSpacing=1),

        "table_cell": ParagraphStyle("table_cell",
            fontName="Helvetica", fontSize=8, textColor=C_MUTED, leading=10),

        "table_cell_highlight": ParagraphStyle("table_cell_highlight",
            fontName="Helvetica-Bold", fontSize=9, textColor=C_ORANGE, leading=11),

        "advisor_text": ParagraphStyle("advisor_text",
            fontName="Helvetica", fontSize=8, textColor=C_MUTED, leading=12),

        "advisor_critical": ParagraphStyle("advisor_critical",
            fontName="Helvetica", fontSize=8, textColor=C_RED, leading=12),

        "advisor_warn": ParagraphStyle("advisor_warn",
            fontName="Helvetica", fontSize=8, textColor=C_AMBER, leading=12),

        "footer": ParagraphStyle("footer",
            fontName="Helvetica", fontSize=6,
            textColor=C_FAINT, leading=8, letterSpacing=1),

        "rating_badge": ParagraphStyle("rating_badge",
            fontName="Helvetica-Bold", fontSize=10,
            textColor=C_WHITE, leading=12, alignment=TA_CENTER),

        "equiv_label": ParagraphStyle("equiv_label",
            fontName="Helvetica", fontSize=7, textColor=C_FAINT, leading=9),

        "equiv_val": ParagraphStyle("equiv_val",
            fontName="Helvetica-Bold", fontSize=9, textColor=C_GREEN, leading=11),
    }


def rating_color(rating):
    return {"LOW": C_GREEN, "NEUTRAL": C_BLUE, "HIGH": C_ORANGE, "CRITICAL": C_RED}.get(rating, C_MUTED)


def dark_table_style():
    return TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  C_BG2),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [C_BG, C_PANEL]),
        ("TEXTCOLOR",     (0, 0), (-1, -1), C_MUTED),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0),  7),
        ("FONTSIZE",      (0, 1), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.3, C_BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 7),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 7),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ])


def build_carbon_pdf(payload: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=14*mm,  bottomMargin=14*mm,
        title="BharatPower Carbon Report",
    )
    W   = A4[0] - 30*mm
    S   = make_styles()
    now = payload.get("generated_at", datetime.now().strftime("%d %b %Y  %H:%M:%S"))
    tf  = payload.get("timeframe", "Monthly")
    res = payload["results"]
    tips= payload["tips"]
    inp = payload["inputs"]

    rating      = res["rating"]
    r_color     = rating_color(rating)
    scaled_kg   = res["scaledKg"]
    scaled_tons = res["scaledTons"]
    trees       = res["treesNeeded"]
    load_pct    = res["loadPct"]
    annual_kg   = scaled_kg * (12 if tf == "Monthly" else 1)
    by_cat      = res["byCategory"]
    total_kg    = scaled_kg or 1

    story = []

    # ── page canvas: dark background + accent lines + footer text
    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(C_BG)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.setStrokeColor(C_GREEN)
        canvas.setLineWidth(1.5)
        canvas.line(15*mm, A4[1] - 9*mm, A4[0] - 15*mm, A4[1] - 9*mm)
        canvas.setStrokeColor(C_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(15*mm, 9*mm, A4[0] - 15*mm, 9*mm)
        canvas.setFont("Helvetica", 5.5)
        canvas.setFillColor(C_FAINT)
        canvas.drawString(15*mm, 5*mm,
            "DATA SOURCES: CEA 2023 GRID EF  ·  IPCC AR6  ·  MoEFCC  ·  UNFCCC INDIA NDC  "
            "|  GRID EF: 0.82 kg CO2e/kWh  ·  TREE OFFSET: 21 kg CO2/yr")
        canvas.drawRightString(A4[0] - 15*mm, 5*mm,
            "© 2025 BHARATPOWER.IO  —  ESTIMATES ONLY  ·  NOT FOR COMPLIANCE REPORTING")
        canvas.restoreState()

    # ── HEADER ──────────────────────────────────
    story.append(Paragraph("BHARATPOWER.IO", S["title"]))
    story.append(Paragraph("CARBON FOOTPRINT ANALYSIS REPORT", S["subtitle"]))
    story.append(Paragraph(
        f"Generated: {now}  |  Timeframe: {tf.upper()}  |  Basis: India-specific emission factors (CEA 2023 / IPCC AR6)",
        S["footer"]))
    story.append(Spacer(1, 5*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 4*mm))

    # ── SECTION 01: CARBON IMPACT ANALYSIS ──────
    story.append(Paragraph("01  CARBON IMPACT ANALYSIS", S["section_header"]))

    # Rating banner
    banner = Table(
        [[Paragraph(f"● {rating}  —  Carbon Load Index: {load_pct:.0f}%  |  {('▲ ABOVE' if scaled_kg > 125 else '▼ BELOW')} INDIAN AVERAGE (125 kg/mo)", S["rating_badge"])]],
        colWidths=[W]
    )
    banner.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), r_color),
        ("TOPPADDING",    (0,0),(-1,-1), 8),
        ("BOTTOMPADDING", (0,0),(-1,-1), 8),
        ("LEFTPADDING",   (0,0),(-1,-1), 12),
    ]))
    story.append(banner)
    story.append(Spacer(1, 4*mm))

    # KPI cards 2×2
    kpi_col_w = W / 2 - 2*mm
    val_style = (
        "kpi_value_red"    if rating == "CRITICAL" else
        "kpi_value_orange" if rating == "HIGH"     else
        "kpi_value_blue"   if rating == "NEUTRAL"  else "kpi_value"
    )

    def kpi_box(label, big_val, unit, sub, style_key, accent=None):
        tbl = Table([
            [Paragraph(label,   S["kpi_label"])],
            [Paragraph(big_val, S[style_key])],
            [Paragraph(unit,    S["kpi_sub"])],
            [Paragraph(sub,     S["kpi_sub"])],
        ], colWidths=[kpi_col_w])
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,-1), C_BG2),
            ("TOPPADDING",    (0,0),(-1,-1), 7),
            ("BOTTOMPADDING", (0,0),(-1,-1), 5),
            ("LEFTPADDING",   (0,0),(-1,-1), 10),
            ("BOX",           (0,0),(-1,-1), 0.5, C_BORDER),
            ("LINEABOVE",     (0,0),(-1,0),  2,   accent or r_color),
        ]))
        return tbl

    def kpi_row(boxes):
        t = Table([boxes], colWidths=[kpi_col_w, kpi_col_w])
        t.setStyle(TableStyle([
            ("LEFTPADDING",  (0,0),(-1,-1), 2),
            ("RIGHTPADDING", (0,0),(-1,-1), 2),
            ("TOPPADDING",   (0,0),(-1,-1), 2),
            ("BOTTOMPADDING",(0,0),(-1,-1), 2),
        ]))
        return t

    story.append(kpi_row([
        kpi_box(f"TOTAL CO2e ({tf.upper()})",
                f"{scaled_kg:,.1f}", "kg CO2e",
                f"= {scaled_tons:.3f} tCO2e", val_style),
        kpi_box("CARBON RATING",
                rating, "vs. 125 kg/mo Indian avg",
                "▼ BELOW AVERAGE" if scaled_kg <= 125 else "▲ ABOVE AVERAGE",
                val_style),
    ]))
    story.append(Spacer(1, 3*mm))
    story.append(kpi_row([
        kpi_box("TREES TO OFFSET",
                f"{trees:,}", "trees / year (IPCC std)",
                "@ 21 kg CO2/tree/yr", "kpi_value", C_GREEN),
        kpi_box("ANNUALISED FOOTPRINT",
                f"{annual_kg:,.0f}", "kg CO2e / year",
                f"= {annual_kg/1000:.2f} tCO2e/yr", "kpi_value_blue", C_BLUE),
    ]))
    story.append(Spacer(1, 6*mm))

    # ── SECTION 02: EMISSION SOURCE BREAKDOWN ───
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("02  EMISSION SOURCE BREAKDOWN", S["section_header"]))

    bd = res.get("breakdown", [])
    CATEGORY_COLORS = {
        "Grid Electricity": C_AMBER,  "Heating Fuel":     C_ORANGE,
        "Personal Vehicle": C_BLUE,   "Flights (Short)":  C_RED,
        "Flights (Long)":   C_RED,    "Bus / Train":      C_GREEN,
        "Food & Diet":      C_PURPLE, "Goods & Shopping": C_MUTED,
    }

    if bd:
        rows = [[
            Paragraph("SOURCE",          S["table_header"]),
            Paragraph("kg CO2e",         S["table_header"]),
            Paragraph("SHARE",           S["table_header"]),
            Paragraph("RELATIVE IMPACT", S["table_header"]),
        ]]
        for item in bd:
            bar_fill = "█" * (int(item["pct"]) // 5) + "░" * (20 - int(item["pct"]) // 5)
            c = CATEGORY_COLORS.get(item["label"], C_MUTED)
            rows.append([
                Paragraph(item["label"],           S["table_cell"]),
                Paragraph(f"{item['value']:.1f}",  S["table_cell_highlight"]),
                Paragraph(f"{item['pct']:.0f}%",   S["table_cell"]),
                Paragraph(bar_fill, ParagraphStyle("bar",
                    fontName="Helvetica", fontSize=7, textColor=c, leading=9)),
            ])
        tbl = Table(rows, colWidths=[W*0.32, W*0.14, W*0.12, W*0.42])
        tbl.setStyle(dark_table_style())
        story.append(tbl)
    else:
        story.append(Paragraph("— No breakdown data. Enter values in the calculator. —", S["kpi_sub"]))

    story.append(Spacer(1, 6*mm))

    # ── SECTION 03: CATEGORY SUMMARY ────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("03  CATEGORY SUMMARY", S["section_header"]))

    cat_rows = [[
        Paragraph("CATEGORY",   S["table_header"]),
        Paragraph("kg CO2e",    S["table_header"]),
        Paragraph("% OF TOTAL", S["table_header"]),
        Paragraph("STATUS",     S["table_header"]),
    ]]
    for cat_name, val, c in [
        ("ENERGY",    by_cat["energyTotal"],    C_AMBER),
        ("TRANSPORT", by_cat["transportTotal"], C_BLUE),
        ("LIFESTYLE", by_cat["lifestyleTotal"], C_PURPLE),
    ]:
        pct    = (val / total_kg * 100) if total_kg > 0 else 0
        status = "DOMINANT" if pct > 50 else "SIGNIFICANT" if pct > 25 else "MINOR"
        cat_rows.append([
            Paragraph(cat_name, ParagraphStyle("cname",
                fontName="Helvetica-Bold", fontSize=8, textColor=c, leading=10)),
            Paragraph(f"{val:.1f}", S["table_cell_highlight"]),
            Paragraph(f"{pct:.0f}%", S["table_cell"]),
            Paragraph(status, S["table_cell"]),
        ])
    cat_tbl = Table(cat_rows, colWidths=[W*0.28, W*0.22, W*0.22, W*0.28])
    cat_tbl.setStyle(dark_table_style())
    story.append(cat_tbl)
    story.append(Spacer(1, 6*mm))

    # ── SECTION 04: EQUIVALENT OFFSET ACTIONS ───
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("04  EQUIVALENT OFFSET ACTIONS", S["section_header"]))

    eq_col_w = W / 2 - 2*mm
    equivalents = [
        ("🌳  Trees to plant per year",
         f"{trees:,} trees", "Plant native species for permanence"),
        ("🚗  Car km equivalent",
         f"{int(scaled_kg / 0.192):,} km", "Petrol car at 0.192 kg CO2e/km"),
        ("💡  LED bulb-hours",
         f"{int(scaled_kg / (9 * 0.82 / 1000)):,} hrs", "9W LED on India's coal-heavy grid"),
        ("✈️  Short-haul flight hours",
         f"{scaled_kg / 255:.1f} hrs", "Incl. Radiative Forcing Index multiplier"),
    ]

    for i in range(0, len(equivalents), 2):
        pair  = equivalents[i:i+2]
        cells = []
        for emoji_label, val, note in pair:
            box = Table([
                [Paragraph(emoji_label, S["equiv_label"])],
                [Paragraph(val,         S["equiv_val"])],
                [Paragraph(note,        S["kpi_sub"])],
            ], colWidths=[eq_col_w])
            box.setStyle(TableStyle([
                ("BACKGROUND",    (0,0),(-1,-1), C_BG2),
                ("TOPPADDING",    (0,0),(-1,-1), 7),
                ("BOTTOMPADDING", (0,0),(-1,-1), 7),
                ("LEFTPADDING",   (0,0),(-1,-1), 10),
                ("BOX",           (0,0),(-1,-1), 0.5, C_BORDER),
                ("LINEABOVE",     (0,0),(-1,0),  1.5, C_GREEN),
            ]))
            cells.append(box)
        row = Table([cells], colWidths=[eq_col_w, eq_col_w])
        row.setStyle(TableStyle([
            ("LEFTPADDING",  (0,0),(-1,-1), 2), ("RIGHTPADDING", (0,0),(-1,-1), 2),
            ("TOPPADDING",   (0,0),(-1,-1), 2), ("BOTTOMPADDING",(0,0),(-1,-1), 2),
        ]))
        story.append(row)

    story.append(Spacer(1, 6*mm))

    # ── SECTION 05: SMART CARBON ADVISOR ────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("05  SMART CARBON ADVISOR  ·  MITIGATION RECOMMENDATIONS", S["section_header"]))

    SEV = {
        "critical": (C_RED,   "CRITICAL", "▲"),
        "warn":     (C_AMBER, "WARNING",  "►"),
        "normal":   (C_GREEN, "INFO",     "●"),
    }

    for tip in tips:
        sev   = tip.get("severity", "normal")
        text  = tip.get("text", "")
        color, label, icon = SEV.get(sev, SEV["normal"])
        tip_style = "advisor_critical" if sev=="critical" else "advisor_warn" if sev=="warn" else "advisor_text"

        badge = Table([[Paragraph(f"{icon} {label}", ParagraphStyle("tbadge",
            fontName="Helvetica-Bold", fontSize=7,
            textColor=color, leading=9, alignment=TA_CENTER))]],
            colWidths=[18*mm])
        badge.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,-1), C_BG2),
            ("TOPPADDING",    (0,0),(-1,-1), 8),
            ("BOTTOMPADDING", (0,0),(-1,-1), 8),
            ("LINEAFTER",     (0,0),(0,-1),  2, color),
        ]))

        body = Table([[Paragraph(text, S[tip_style])]], colWidths=[W - 20*mm])
        body.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,-1), C_BG),
            ("TOPPADDING",    (0,0),(-1,-1), 8),
            ("BOTTOMPADDING", (0,0),(-1,-1), 8),
            ("LEFTPADDING",   (0,0),(-1,-1), 10),
        ]))

        row = Table([[badge, body]], colWidths=[20*mm, W - 20*mm])
        row.setStyle(TableStyle([
            ("BOX",           (0,0),(-1,-1), 0.5, C_BORDER),
            ("TOPPADDING",    (0,0),(-1,-1), 0),
            ("BOTTOMPADDING", (0,0),(-1,-1), 0),
            ("LEFTPADDING",   (0,0),(-1,-1), 0),
            ("RIGHTPADDING",  (0,0),(-1,-1), 0),
        ]))
        story.append(KeepTogether([row, Spacer(1, 2*mm)]))

    story.append(Spacer(1, 6*mm))

    # ── SECTION 06: INPUT DATA SUMMARY ──────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_BORDER))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph("06  INPUT DATA SUMMARY", S["section_header"]))

    inp_rows = [[
        Paragraph("PARAMETER",      S["table_header"]),
        Paragraph("VALUE",          S["table_header"]),
        Paragraph("UNIT",           S["table_header"]),
        Paragraph("EMISSION FACTOR",S["table_header"]),
    ]]
    inp_data = [
        ("Grid Electricity",              inp.get("electricity")  or "—", "kWh",   "0.82 kg CO2e/kWh  (CEA 2023)"),
        (f"Heating Fuel ({inp.get('fuelType','—')})", inp.get("fuelQty") or "—", "kg / m³","LPG: 2.983  |  PNG: 2.02 kg CO2e"),
        (f"Vehicle ({inp.get('vehicleType','—')})",   inp.get("vehicleDist") or "—","km",  "Petrol:0.192  Diesel:0.171  EV:0.082"),
        ("Short-haul Flights",            inp.get("shortHaulHrs") or "—", "hrs",   "255 kg CO2e/hr  (incl. RFI)"),
        ("Long-haul Flights",             inp.get("longHaulHrs")  or "—", "hrs",   "195 kg CO2e/hr  (incl. RFI)"),
        ("Bus Distance",                  inp.get("busDist")      or "—", "km",    "0.089 kg CO2e/km"),
        ("Train / Metro",                 inp.get("trainDist")    or "—", "km",    "0.041 kg CO2e/km  (Indian Railways)"),
        ("Food & Diet Spend",             inp.get("foodSpend")    or "—", "₹",     "0.61 kg CO2e / ₹1000  (I-O LCA)"),
        ("Goods & Shopping Spend",        inp.get("goodsSpend")   or "—", "₹",     "0.48 kg CO2e / ₹1000  (I-O LCA)"),
    ]
    for param, val, unit, ef in inp_data:
        inp_rows.append([
            Paragraph(param, S["table_cell"]),
            Paragraph(str(val), S["table_cell_highlight"]),
            Paragraph(unit,  S["table_cell"]),
            Paragraph(ef,    S["kpi_sub"]),
        ])

    inp_tbl = Table(inp_rows, colWidths=[W*0.27, W*0.13, W*0.10, W*0.50])
    inp_tbl.setStyle(dark_table_style())
    story.append(inp_tbl)
    story.append(Spacer(1, 8*mm))

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    buf.seek(0)
    return buf.read()


# ══════════════════════════════════════════════════════════
#  PDF EXPORT ROUTE
# ══════════════════════════════════════════════════════════

@app.route('/api/v1/carbon/export-pdf', methods=['POST'])
def export_carbon_pdf():
    payload = request.get_json(force=True)
    payload["generated_at"] = datetime.now().strftime("%d %b %Y  %H:%M:%S")
    pdf_bytes = build_carbon_pdf(payload)
    filename  = f"bharatpower_carbon_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
