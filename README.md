# KrishiSaathi AI
### Your Smart Farming Companion

> **"KrishiSaathi AI — Your Smart Farming Companion"**  
> *"NASA Data Meets AI — Smarter Farming, Smarter Communication."*

KrishiSaathi AI is an agricultural technology platform designed to bridge the gap between Earth observation datasets and smallholder farmers. It combines agrometeorological risk modeling and a Gemini-powered farming assistant with a browser call simulator and an optional, operator-initiated Exotel voice integration.

---

## 🚀 Key Modules & Capabilities

1. **NASA Earth Observation Engine**
   - **NASA POWER**: 2m ambient temperatures ($T_{max}, T_{min}, T_{mean}$), solar insolation, relative humidity, and vapor pressure deficit (VPD).
   - **NASA SMAP (Soil Moisture Active Passive)**: Calibrated surface (L3) and modeled root-zone (L4 GWETROOT) soil moisture.
   - **NASA GPM (Global Precipitation Measurement)**: 24-hour and 7-day cumulative rainfall estimates from IMERG.
   - **NASA MODIS (Terra/Aqua)**: Normalized Difference Vegetation Index (NDVI) from the MOD13A2 16-day product.
   - **Data Transparency**: Explicitly discloses satellite grid resolution (~9km to ~50km), validation flags, observation timestamps, and latency notes without fabricating data.

2. **Agrometeorological Climate Risk Analysis Engine**
   - Scientific, rule-based crop physiological vulnerability scoring (0-100) across 5 risk dimensions:
     - **Heat Stress**: Evaluated against critical flowering/grain-filling thresholds (e.g. >31°C in wheat, >35°C in rice).
     - **Drought & Root-Zone Moisture Deficit**: Assessed via SMAP root-zone saturation (<22% critical wilting point).
     - **Excess Rainfall & Waterlogging**: Tailored to soil hydraulic conductivity (clay/black cotton vulnerability).
     - **Topsoil Moisture Crusting Deficit**: Surface radiometer observations.
     - **Pest & Fungal Pathogen Pressure**: Microclimate disease triangle model linking sustained relative humidity >78% and temperatures 21-29°C.
   - Audit trail detailing every rule triggered and dataset utilized.

3. **Voice Calling**
   - The browser-based voice simulator is explicitly labeled as a demo and does not place phone calls.
   - Optional Exotel outbound calling is individual and operator-initiated. It requires a matching registered Indian mobile number, timestamped opt-in on the farmer profile, and explicit confirmation for each call.
   - Exotel AgentStream audio is bridged server-to-server to Gemini Live. Call outcomes are updated from Exotel status callbacks; an accepted request is not an answered or completed call.
   - Real calls and two-way audio have **not** been verified with an Exotel account. Configure and test your own account before contacting farmers.

4. **KrishiSaathi AI Farming Assistant**
   - Conversational assistant powered by Gemini 3.8 Flash (`@google/genai`).
   - Deeply grounded in the active farm's crop stage, soil type, and live NASA satellite observations.
   - Full support for Hindi, English, and Hinglish.
   - Voice input and Text-to-Speech audio readout for accessibility.

5. **What-If Climate Scenario Simulator**
   - Interactive stress-test sliders for temperature anomalies (-4°C to +8°C), rainfall anomalies (-70% to +80%), and soil moisture levels.
   - Computes expected yield shock (%) using FAO-56 crop response coefficients.
   - Generates actionable adaptation protocols (heat-tolerant cultivars, micro-sprinklers, laser leveling, mulching).

6. **Interactive Geospatial Satellite Map**
   - Interactive Leaflet map with custom farm markers.
   - Switchable NASA data layers: SMAP Soil Moisture, GPM Precipitation Footprint, and MODIS Surface Thermal Anomaly.
   - Click-to-inspect coordinate telemetry anywhere across India.

---

## 🛠️ Technical Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Recharts, Leaflet, Lucide Icons.
- **Node.js Server**: Express full-stack server running Vite middlewares in development and serving static assets in production, integrating `@google/genai` (Gemini 3.8 Flash) and NASA POWER API proxies.
- **Python Backend**: FastAPI application with SQLAlchemy ORM, Alembic migrations, Pydantic v2 schemas, and PostgreSQL persistence.

---

## 💻 Local Development Setup

### Option A: Full-Stack React + Express Server
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (defaults to `http://localhost:3000`; set `PORT=3001` to use port 3001):
   ```bash
   npm run dev
   ```
   In PowerShell, use `$env:PORT=3001; npm run dev`.
3. Build for production:
   ```bash
   npm run build
   ```

### KrishiSaathi AI Guide

The floating robot opens a searchable guide and a step-by-step tour of the pages and main controls that are actually present: dashboard and weather, observation/risk cards, climate simulator, satellite map, AI advisor, farmer directory, language/farm selectors, and the calling center. The registry labels each feature as available, mixed, simulated, demo, or optional. Crop Doctor and Mandi Prices are not implemented in this app and are not presented as available features.

Guide answers use the existing server-side Gemini integration when configured, with explanations from the local feature registry as a fallback. The guide does not submit forms or start calls. Its optional voice controls use browser SpeechSynthesis and SpeechRecognition; if a browser does not support either API, the guide remains usable by text.

Validation commands:

```bash
npm run lint
npm run build
```

### Exotel outbound-call setup (optional)

Real calling is disabled until all required server settings are present. If you do not already have a `.env`, copy `.env.example` to create one; otherwise edit your existing `.env` and keep any existing values. Set Exotel values privately on the Node server. Do not commit `.env`, expose these values to React, or paste credentials into support requests.

Required settings:

| Variable | Value |
|---|---|
| `EXOTEL_API_KEY`, `EXOTEL_API_TOKEN` | API credentials from your Exotel account. The server sends them as HTTP Basic authentication. |
| `EXOTEL_ACCOUNT_SID` | Account SID from Exotel. |
| `EXOTEL_CALLER_ID` | An ExoPhone/caller ID enabled for outbound calling on this account. |
| `EXOTEL_REGION` | `mumbai` (`api.in.exotel.com`) or `singapore` (`api.exotel.com`), matching the account's region. |
| `PUBLIC_BASE_URL` | Public HTTPS origin for this app, with no path, query, or fragment. Exotel must be able to reach it. |
| `EXOTEL_STREAM_TOKEN` | Random secret of at least 32 characters used to authenticate the AgentStream WSS endpoint. |
| `EXOTEL_STATUS_WEBHOOK_TOKEN` | A different random secret of at least 32 characters for the status callback. |
| `CALL_OPERATOR_TOKEN` | Random secret of at least 32 characters, shared only with authorized operators. |
| `GEMINI_API_KEY` | Server-side key for Gemini Live audio sessions. Confirm that the selected Gemini Live model is enabled for your project. |

Before attempting a call:

1. Enable outbound calling and AgentStream/Voicebot access for the Exotel account, verify the caller ID and destination permissions, and confirm any required account-level approvals/credits with Exotel.
2. Deploy the Node server behind a valid public TLS endpoint. The same origin must accept HTTPS requests and WSS upgrades at `/api/exotel/agentstream`; expose `/api/calls/exotel-status` for Exotel's status callbacks. A local `localhost` URL is not reachable by Exotel.
3. Configure the Exotel account for the AgentStream bidirectional voicebot integration, use the account's correct regional API host, and permit Exotel to reach the HTTPS callback and WSS stream URLs.
4. Restart the server after setting environment variables. Visit the Calling Center, select **Exotel**, enter the operator token, and confirm the farmer has consented to this particular call. Only one selected, registered number can be dialed per request.
5. Test first with a number you control and explicit consent. Verify the provider call ID, live audio both ways, transcript, and terminal status in the UI and Exotel dashboard. Do not treat HTTP acceptance or `QUEUED` as call success.

The app's farmer and call stores are currently in memory; call history and consent records are lost on server restart. Add durable storage and suitable access control/retention policies before production use. Follow applicable Indian calling, privacy, and consent requirements.

Official references:
- [Exotel Programmable Voice](https://developer.exotel.com/docs/voice)
- [Exotel Connect Voice AI](https://developer.exotel.com/docs/agentstream/connect-voice-ai)
- [Exotel AgentStream WebSocket protocol](https://developer.exotel.com/docs/agentstream/websocket-protocol)
- [Exotel status callback](https://developer.exotel.com/docs/voice-v1/api-reference/status-callback)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)

### Option B: Python FastAPI Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the database and run migrations:
   ```bash
   alembic upgrade head
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Platform health, version, and active NASA connections |
| `/api/farmers` | GET / POST | List registered farmers / Onboard new farm profile |
| `/api/farmers/:id` | PUT | Update farmer profile or consent settings |
| `/api/nasa/observations` | GET | Retrieve NASA POWER, SMAP, and GPM data for `lat`, `lon` |
| `/api/calls/config` | GET | Report whether required Exotel/Gemini server settings are present (no secret values) |
| `/api/calls/dispatch` | POST | Operator-token protected, consent-confirmed single Exotel call request |
| `/api/calls/exotel-status` | POST | Token-protected Exotel call status callback |
| `/api/exotel/agentstream` | WSS | Token-protected bidirectional Exotel/Gemini Live audio stream |
| `/api/calls/simulate-turn` | POST | Generate a response for the browser-only call demo |
| `/api/calls/history` | GET | Operator-token protected in-memory call records and transcripts |
| `/api/advisor/chat` | POST | Gemini AI agronomist chat with farm telemetry grounding |
| `/api/simulator/evaluate` | POST | Calculate crop yield impacts for hypothetical climate shocks |

---

## 🛰️ NASA Data Resources
- **NASA POWER**: [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/)
- **NASA GPM**: [https://gpm.nasa.gov/](https://gpm.nasa.gov/)
- **NASA SMAP**: [https://smap.jpl.nasa.gov/](https://smap.jpl.nasa.gov/)
- **NASA Earthdata**: [https://www.earthdata.nasa.gov/](https://www.earthdata.nasa.gov/)
- **NASA MODIS**: [https://modis.gsfc.nasa.gov/](https://modis.gsfc.nasa.gov/)
