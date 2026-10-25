# APEX TELEMETRY 3D

> _See the race. Understand the data._

**APEX TELEMETRY 3D** is a browser-based motorsport engineering workbench connecting real-time racing simulator UDP telemetry, historical Formula 1 Grand Prix datasets, synchronized 3D multi-car replays, and longitudinal vehicle dynamics analysis.

---

## 🏁 Three Independent Operating Modes

1. **Mode A — Synthetic 3D Simulation**:
   - Zero-dependency instant demonstration mode.
   - Procedurally generated closed-loop circuit (*Apex International Raceway*) using 3D Catmull-Rom splines with dynamic curvature estimation.
   - Deterministic semi-implicit Euler vehicle dynamics model:
     $$a = \frac{F_{\text{drive}} - F_{\text{brake}} - F_{\text{drag}} - F_{\text{rr}}}{m}$$
   - Curvature-based corner velocity envelope ($v_{\text{max}} = \sqrt{a_{\text{lat}} / \kappa}$) and autonomous AI driver.
   - Distinct, persistent `SYNTHETIC DEMO` visual indicator.

2. **Mode B — Historical Race Analysis**:
   - Integrated with the **OpenF1** historical API for authenticated Grand Prix telemetry (Silverstone, Spa-Francorchamps, Monza, etc.).
   - Track-relative GPS coordinate normalization and multi-driver position progression.
   - Distance-aligned lap comparison with delta time accumulation ($\Delta t = t_{\text{comp}} - t_{\text{ref}}$).

3. **Mode C — Live Simulator Telemetry**:
   - Dedicated Python UDP receiver listening on loopback port `20777` with OS-level `SO_RCVBUF`.
   - Binary packet decoding via standard-library `struct` (`<BBIf` header, `<Hff` telemetry payload, `<ff` lap/position payload).
   - Real-time 60Hz WebSocket broadcast bridge to the browser frontend.
   - Interactive packet diagnostics interface displaying packet rates, decoded frames, and drop counters.

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

If you want to receive telemetry from a real racing simulator (e.g., EA Sports F1 24, F1 23):

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
1. Open your racing game's telemetry settings.
2. Enable UDP Telemetry.
3. Target IP: `127.0.0.1`
4. Target Port: `20777`
5. Send Rate: `60 Hz`

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
