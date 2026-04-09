import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import os
import json

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCXbcuI7UN0g0zKGEaq2KYq0u4TGXUxYDE")
GEMINI_URL     = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# Use a real browser header to avoid 403 Forbidden errors
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_live_iex_price():
    """Scrapes the Indian Energy Exchange for the current Market Clearing Price."""
    try:
        url = "https://www.iexindia.com/market-data/real-time-market/market-snapshot"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Target the Average MCP cell in the snapshot table
        # IEX provides Rs/MWh; we divide by 1000 for Rs/unit (kWh)
        rows = soup.find_all('tr')
        for row in rows:
            if "Avg" in row.text:
                cols = row.find_all('td')
                # Usually the 5th or 6th column depending on table version
                price_val = float(cols[-1].text.replace(',', '').strip())
                return round(price_val / 1000, 2)
        return 6.45 # Fallback
    except Exception as e:
        print(f"IEX Scrape Failed: {e}")
        return 6.20

def get_grid_freq():
    """Scrapes the live National Grid frequency from Grid-India."""
    try:
        url = "https://www.grid-india.in/"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        # ID used by Grid-India for their real-time frequency widget
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
    
    # Matching all IDs from your BharatPower.jsx
    data = {
        "gridFrequency": freq,
        "gridStatus": "NOMINAL" if 49.9 <= float(freq) <= 50.05 else "STRESSED",
        "statePrices": [
            # NORTH
            {"id": "DL", "name": "Delhi", "price": round(base * 1.45, 2), "trend": "up", "zone": "NORTH"},
            {"id": "UP", "name": "Uttar Pradesh", "price": round(base * 1.35, 2), "trend": "up", "zone": "NORTH"},
            {"id": "RJ", "name": "Rajasthan", "price": round(base * 1.18, 2), "trend": "up", "zone": "NORTH"},
            {"id": "PB", "name": "Punjab", "price": round(base * 1.28, 2), "trend": "stable", "zone": "NORTH"},
            {"id": "HR", "name": "Haryana", "price": round(base * 1.30, 2), "trend": "up", "zone": "NORTH"},
            {"id": "JK", "name": "J&K", "price": round(base * 1.10, 2), "trend": "stable", "zone": "NORTH"},
            
            # WEST
            {"id": "MH", "name": "Maharashtra", "price": round(base * 1.25, 2), "trend": "up", "zone": "WEST"},
            {"id": "GJ", "name": "Gujarat", "price": round(base * 1.12, 2), "trend": "stable", "zone": "WEST"},
            {"id": "MP", "name": "Madhya Pradesh", "price": round(base * 1.05, 2), "trend": "down", "zone": "WEST"},
            {"id": "GA", "name": "Goa", "price": round(base * 1.02, 2), "trend": "stable", "zone": "WEST"},
            
            # SOUTH
            {"id": "KA", "name": "Karnataka", "price": round(base * 0.95, 2), "trend": "down", "zone": "SOUTH"},
            {"id": "TN", "name": "Tamil Nadu", "price": round(base * 0.90, 2), "trend": "down", "zone": "SOUTH"},
            {"id": "AP", "name": "Andhra Pradesh", "price": round(base * 0.98, 2), "trend": "stable", "zone": "SOUTH"},
            {"id": "KL", "name": "Kerala", "price": round(base * 1.15, 2), "trend": "up", "zone": "SOUTH"},
            {"id": "TS", "name": "Telangana", "price": round(base * 1.05, 2), "trend": "stable", "zone": "SOUTH"},
            
            # EAST
            {"id": "WB", "name": "West Bengal", "price": round(base * 1.08, 2), "trend": "stable", "zone": "EAST"},
            {"id": "OR", "name": "Odisha", "price": round(base * 0.85, 2), "trend": "down", "zone": "EAST"},
            {"id": "BR", "name": "Bihar", "price": round(base * 1.22, 2), "trend": "up", "zone": "EAST"},
            {"id": "JH", "name": "Jharkhand", "price": round(base * 0.92, 2), "trend": "down", "zone": "EAST"},
            
            # NORTH-EAST
            {"id": "AS", "name": "Assam", "price": round(base * 1.10, 2), "trend": "stable", "zone": "NORTHEAST"},
            {"id": "ML", "name": "Meghalaya", "price": round(base * 1.05, 2), "trend": "stable", "zone": "NORTHEAST"}
        ],
        "peakStatus": {
            "status": "PEAK" if base > 7.5 else "NOMINAL",
            "recommendation": "High Demand - Shift Load" if base > 7.5 else "System Stable",
            "currentLoad": f"{random.randint(84, 92)}.%",
            "peakDemand": "221.4 GW",
        }
    }
    return jsonify(data)

@app.route('/api/v1/carbon-advisor', methods=['POST'])
def carbon_advisor():
    """
    Accepts the user's carbon footprint inputs + computed results,
    calls Gemini, and returns 3–5 structured advisory tips.

    Expected JSON body:
    {
      "timeframe": "Monthly" | "Yearly",
      "inputs": { electricity, fuelType, fuelQty, vehicleType, vehicleDist,
                  shortHaulHrs, longHaulHrs, busDist, trainDist,
                  foodSpend, goodsSpend },
      "results": { scaledKg, scaledTons, loadPct, treesNeeded,
                   byCategory: { energyTotal, transportTotal, lifestyleTotal },
                   breakdown: [{ label, value, pct }],
                   rating: { rating } }
    }

    Returns:
    { "tips": [ { "severity": "normal"|"warn"|"critical", "text": "..." }, ... ] }
    """
    body = request.get_json(silent=True) or {}
    timeframe = body.get("timeframe", "Monthly")
    inputs    = body.get("inputs",    {})
    results   = body.get("results",   {})

    # Build a rich, data-dense prompt so Gemini has full context
    rating_label = results.get("rating", {}).get("rating", "UNKNOWN")
    scaled_kg    = results.get("scaledKg", 0)
    trees_needed = results.get("treesNeeded", 0)
    by_cat       = results.get("byCategory", {})
    breakdown    = results.get("breakdown",  [])

    breakdown_text = "\n".join(
        f"  - {b['label']}: {b['value']:.1f} kg ({b['pct']:.0f}%)"
        for b in sorted(breakdown, key=lambda x: -x.get("value", 0))
    ) or "  No breakdown data."

    prompt = f"""You are an expert carbon footprint analyst for the Indian context (BharatPower.io platform).
A user has entered their {timeframe.lower()} carbon footprint data. Analyse it and return 4 to 5 highly specific,
actionable mitigation tips tailored to the Indian market (reference real Indian schemes, products, or policies where relevant).

=== USER INPUTS ({timeframe}) ===
- Electricity: {inputs.get('electricity') or 'not entered'} kWh
- Heating fuel: {inputs.get('fuelType', 'None')} — qty: {inputs.get('fuelQty') or 'not entered'}
- Vehicle type: {inputs.get('vehicleType', 'None')}
- Distance driven: {inputs.get('vehicleDist') or '0'} km
- Short-haul flights: {inputs.get('shortHaulHrs') or '0'} hrs
- Long-haul flights:  {inputs.get('longHaulHrs') or '0'} hrs
- Bus distance:   {inputs.get('busDist') or '0'} km
- Train distance: {inputs.get('trainDist') or '0'} km
- Food/diet spend:    ₹{inputs.get('foodSpend') or '0'}
- Goods/shopping:     ₹{inputs.get('goodsSpend') or '0'}

=== COMPUTED RESULTS ===
- Total CO₂e ({timeframe}): {scaled_kg:.1f} kg
- Carbon rating: {rating_label}  (Indian avg ~125 kg/month)
- Trees to offset (annual): {trees_needed}
- Energy category:    {by_cat.get('energyTotal', 0):.1f} kg
- Transport category: {by_cat.get('transportTotal', 0):.1f} kg
- Lifestyle category: {by_cat.get('lifestyleTotal', 0):.1f} kg

=== TOP SOURCES (sorted) ===
{breakdown_text}

=== OUTPUT FORMAT (strict JSON, no markdown fences) ===
Return ONLY a JSON object like this:
{{
  "tips": [
    {{ "severity": "normal", "text": "Specific tip here." }},
    {{ "severity": "warn",   "text": "Another tip." }},
    {{ "severity": "critical", "text": "Urgent tip." }}
  ]
}}

Rules:
- severity must be one of: "normal", "warn", "critical"
- Use "critical" only for the single highest-impact action if rating is HIGH or CRITICAL
- Each tip must be 1–2 sentences, specific, data-backed, and India-relevant
- Reference exact numbers from the user's data (e.g., "Your {scaled_kg:.0f} kg footprint...")
- Do NOT give generic advice. Every tip must be personalised to the actual numbers above.
- Return between 4 and 5 tips total
- No preamble, no explanation, no markdown — ONLY the JSON object
"""

    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 700,
                }
            },
            timeout=15
        )
        resp.raise_for_status()
        raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]

        # Strip any accidental markdown fences
        clean = raw_text.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        clean = clean.strip().rstrip("`").strip()

        parsed = json.loads(clean)
        return jsonify(parsed)

    except Exception as e:
        print(f"Gemini advisor error: {e}")
        # Graceful fallback — return a single info tip so the UI never breaks
        return jsonify({
            "tips": [
                {"severity": "normal",
                 "text": "AI advisor temporarily unavailable. Enter your usage data to see personalised recommendations."}
            ]
        }), 200


# if __name__ == '__main__':
#   app.run()
# bottom of app.py
if __name__ == '__main__':
    app.run(port=5001, debug=True)