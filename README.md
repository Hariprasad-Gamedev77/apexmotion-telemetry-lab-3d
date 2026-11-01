# APEX TELEMETRY 3D

> _See the race. Understand the data._

**APEX TELEMETRY 3D** is a motorsport data workbench with a synthetic circuit demonstration, an OpenF1 session metadata browser, telemetry CSV validation, and an educational Python UDP collector. Several historic replay and live simulator workflows remain incomplete; see [Known Issues](docs/KNOWN_ISSUES.md).

---

## 🏁 Three Independent Operating Modes

1. **Mode A — Synthetic 3D Simulation**:
   - Zero-dependency instant demonstration mode.
   - Procedurally generated closed-loop circuit (*Apex International Raceway*) using 3D Catmull-Rom splines with dynamic curvature estimation.
   - Deterministic semi-implicit Euler vehicle dynamics model:
     $$a = \frac{F_{\text{drive}} - F_{\text{brake}} - F_{\text{drag}} - F_{\text{rr}}}{m}$$
   - Curvature-based corner velocity envelope ($v_{\text{max}} = \sqrt{a_{\text{lat}} / \kappa}$) and autonomous AI driver.
   - Distinct, persistent `SYNTHETIC DEMO` visual indicator.

2. **Mode B — Historical Session Browser**:
   - Reads supported session metadata from the public **OpenF1** API.
   - API failures no longer substitute a curated fixture as if it were fetched data.
   - Historical GPS replay and complete session telemetry loading are not implemented.

3. **Mode C — Educational UDP Fixture Collector**:
   - Python UDP receiver and WebSocket broadcaster.
   - Decoder uses the project's educational `<BBIf` header and `<Hff` payload; these are not EA SPORTS F1 UDP packets.
   - Browser connection setup can verify a WebSocket handshake, but it does not subscribe to or render collector telemetry.
   - No fixed 60 Hz source or broadcast rate is promised.

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph Data Sources
        Sim["Racing Simulator (EA F1 / Assetto Corsa)\nUDP Port 20777"]
        OpenF1["OpenF1 Historical API\n(HTTP REST)"]
        SyntheticEngine["Apex Synthetic Physics Engine\n(Longitudinal & Curvature Model)"]
    end

    subgraph Python Collector Service
        UdpRecv["UdpReceiver\n(Dedicated Thread + Queue)"]
        Decoder["EducationalPacketDecoder\n(struct.unpack_from)"]
        Normalizer["TelemetryNormalizer\n(Versioned JSON Event)"]
        FastAPIWs["FastAPI WebSocket Broadcaster\n(ws://127.0.0.1:8000/ws/telemetry)"]
        Recorder["TelemetryDiskRecorder\n(JSONL / CSV)"]
    end

    subgraph Frontend Workstation (Next.js 16 + React 19)
        Store["Zustand Unified Store\n(Deterministic Replay Clock)"]
        ThreeScene["Three.js / React Three Fiber\n- Procedural Circuit Ribbon\n- Low-Poly Formula Car\n- 6 Camera Modes"]
        RechartsComp["Synchronized Recharts Plots\n- Speed, Throttle, Brake\n- Distance & Time Alignment"]
        HUD["Cockpit HUD & Gauges\n- RPM Shift LEDs\n- Velocity, Gear, DRS, G-Forces"]
        LapComp["Lap Comparison Engine\n- Delta Time Trace (Δt)"]
    end

    Sim -->|Binary UDP Datagrams| UdpRecv
    UdpRecv --> Decoder
    Decoder --> Normalizer
    Normalizer --> FastAPIWs
    Normalizer --> Recorder

    FastAPIWs -->|WebSocket Stream| Store
    OpenF1 -->|JSON REST| Store
    SyntheticEngine -->|Internal Tick Step| Store

    Store --> ThreeScene
    Store --> RechartsComp
    Store --> HUD
    Store --> LapComp
```

---

## 🛠️ Technology Stack

- **Frontend Framework**: Next.js 16 (App Router), React 19, TypeScript (Strict).
- **Styling & Design System**: Tailwind CSS v4, Lucide Icons.
- **3D Graphics Engine**: Three.js, React Three Fiber (R3F), `@react-three/drei`.
- **State Management**: Zustand (single logical clock coordinating 3D scenes and plots).
- **Data Visualization**: Recharts (interactive distance/time synchronized traces).
- **Runtime Validation**: Zod.
- **Backend Collector**: Python 3.11+, FastAPI, Uvicorn, standard-library `socket` and `struct`.
- **Automated Testing**: TypeScript test suite (`tsx tests/run_tests.ts`), Pytest (`pytest python-collector/tests`).

---

## 🚀 Quick Start Guide

### 1. Frontend Setup & Immediate Synthetic Demo

No database, API keys, or racing games are required to test the flagship experience:

```bash
# Navigate to the project root
cd apex-telemetry-3d

# Install dependencies
npm install

# Run automated mathematical verification tests
npm test

# Build production bundle
npm run build

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click **"Launch 3D Synthetic Demo"** to enter the live 3D racing environment immediately!

### 2. Python UDP Collector & Live Simulator Setup

To run the educational fixture collector (not compatible with commercial simulator packets):

```bash
cd python-collector

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run packet decoder unit tests
pytest tests/

# Launch FastAPI collector & WebSocket bridge
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Simulator Configuration:
1. Run the collector locally.
2. Send packets matching the fixture schema documented in `python-collector/app/protocols/f1_educational.py`.
3. Do not configure a commercial simulator to use this decoder.

---

## ⌨️ Replay Controls & Keyboard Shortcuts

- <kbd>Space</kbd>: Play / Pause replay.
- <kbd>Left Arrow</kbd>: Seek backward 2.5 seconds.
- <kbd>Right Arrow</kbd>: Seek forward 2.5 seconds.
- <kbd>Home</kbd>: Restart lap replay.
- <kbd>C</kbd>: Cycle camera mode (Chase &rarr; Cockpit &rarr; Helicopter &rarr; Trackside &rarr; Map Overview &rarr; Free Orbit).

---

## 📦 Deployment Architecture

- **Frontend**: Deployed to **Vercel** as a static / serverless Next.js App Router application.
- **Collector**: Deployed to persistent infrastructure (Docker container on local host or VM) because browsers cannot bind raw UDP sockets. A sample production `Dockerfile` is provided in `python-collector/Dockerfile`.

---

## 📜 Educational Disclaimer & License

APEX TELEMETRY 3D is an independent portfolio engineering project created for educational and simulation systems demonstration purposes. It has no official affiliation with Formula 1, the FIA, or Formula One Licensing B.V. All 3D vehicle geometries, procedural tracks, liveries, and user interfaces are original assets.
