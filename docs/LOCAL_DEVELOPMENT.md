# APEX TELEMETRY 3D — LOCAL DEVELOPMENT & WORKSTATION SETUP GUIDE

**Project:** ApexMotion Telemetry Lab 3D  
**Document Revision:** 1.0.0  
**Target Environment:** Windows, macOS, Linux  

---

## 1. System Requirements & Prerequisites

Ensure the following runtimes are installed on your workstation:

* **Node.js**: `v20.x` or `v22.x` LTS (supports `npm >= 10.x`)
* **Python**: `3.10`, `3.11`, `3.12`, `3.13`, or `3.14`
* **Package Managers**: `npm` and `pip`
* **Hardware Requirements**: WebGL 2.0 compatible GPU (integrated graphics supported; discrete GPU recommended for high frame rates in 3D circuit mode).

---

## 2. Quickstart Instructions

### 2.1 Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Hariprasad-Gamedev77/apexmotion-telemetry-lab-3d.git
cd apexmotion-telemetry-lab-3d

# Install frontend dependencies
npm install
```

### 2.2 Launch Frontend Development Server

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000). The dashboard immediately loads in **Synthetic 3D Mode** with the Singapore Marina Bay circuit and physics engine running.

---

## 3. Running Automated Test Suites

### 3.1 Frontend & Scientific Validation Suite

Runs 21 automated tests covering splines, kinematics, CSV validation, comparison tests A–E, and longitudinal dynamics:

```bash
npm test
```

### 3.2 Next.js Production Build Verification

Compiles Turbopack bundles, runs TypeScript type checks, and statically prerenders all 21 routes:

```bash
npm run build
```

---

## 4. Setting Up Python Live Telemetry Collector

The Python collector receives high-frequency binary UDP datagrams from racing simulators and broadcasts normalized telemetry over WebSockets.

### 4.1 Install Python Collector Dependencies

```bash
cd python-collector

# Install requirements
pip install -r requirements.txt
# Alternatively: pip install fastapi uvicorn websockets pytest
```

### 4.2 Run Python UDP Decoder Tests

```bash
# Windows PowerShell
$env:PYTHONPATH="."
pytest -v

# Linux / macOS
PYTHONPATH=. pytest -v
```

### 4.3 Start Live UDP Listener & WebSocket Server

```bash
python main.py
```

* **UDP Socket Port:** `20777` (standard F1 sim telemetry port)
* **WebSocket Server:** `ws://localhost:8000/ws/telemetry`
* **REST API & Health Check:** `http://localhost:8000/health`

---

## 5. Simulating Telemetry Without Hardware

If you do not have EA Sports F1 23/24 installed or are developing on a headless machine:

### Option A: Browser Synthetic Engine (Zero Setup)
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard). The browser synthetic engine executes point-mass aerodynamics ($798\text{kg}$ vehicle mass, quadratic aero drag, DRS activation) in real-time.

### Option B: Python Mock Packet Sender
Broadcasts realistic Little-Endian binary UDP packets to `localhost:20777` at 60 Hz:

```bash
cd python-collector
python mock_sender.py
```

---

## 6. Connecting a Physical Racing Simulator

To stream telemetry from **EA Sports F1 23** or **F1 24** (PC, PlayStation 5, or Xbox Series X):

1. Launch **F1 23 / 24**.
2. Navigate to: **Game Options** $\rightarrow$ **Settings** $\rightarrow$ **Telemetry Settings**.
3. Configure the following parameters:
   * **UDP Telemetry:** `On`
   * **UDP Broadcast:** `Off` (for point-to-point) or `On` (for local LAN)
   * **UDP IP Address:** Your computer's local IP (e.g. `192.168.1.100` or `127.0.0.1` if playing on the same PC)
   * **UDP Port:** `20777`
   * **UDP Send Rate:** `60Hz` (recommended) or `20Hz`
   * **UDP Format:** `2023` or `2024`
4. Start the Python collector (`python main.py`).
5. Open Apex Telemetry 3D and switch to **Live Sim Mode** on the top navigation bar. Telemetry packets will stream live into the 3D HUD and split charts.
