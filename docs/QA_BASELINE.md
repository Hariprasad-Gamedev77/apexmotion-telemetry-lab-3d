# APEXMOTION TELEMETRY LAB 3D — BASELINE QA AUDIT REPORT

> Historical report from 2026-10-25. Its implementation and verification claims are superseded by [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md), which records the 2026-11-01 source audit and actual commands run.

**Document Version:** 1.0.0  
**Audit Date:** 2026-10-25T22:58:00+05:30  
**Target Repository:** `https://github.com/Hariprasad-Gamedev77/apexmotion-telemetry-lab-3d`  
**Live Deployment:** `https://apexmotion-telemetry-lab-3d.vercel.app/`  
**Auditor Role:** Senior Software Engineer, QA Automation Engineer, Motorsport Telemetry Engineer  

---

## 1. Architecture Summary

### 1.1 High-Level Data Flow Topology
The application is structured into three independent operating modes with unified downstream replay and visualization:

```
[Mode A: Synthetic Simulation] 
      │
      ▼ (Procedural Track & Vehicle Dynamics)
   [Closed-loop Catmull-Rom Splines] ───► [Semi-Implicit Euler Integrator]
                                                      │
[Mode B: Live Simulator UDP]                           │
      │                                                │
      ▼ (Raw Datagrams: port 20777)                    │
  [Python Receiver: struct.unpack_from]                │
      │                                                │
      ▼ (JSON Envelopes over WebSocket: 8000)          │
   [Frontend WS Client Bridge] ────────────────────────┤
                                                       │
[Mode C: Historical F1 Analysis]                       │
      │                                                │
      ▼ (OpenF1 Public REST API)                       │
  [Curated Session Ingest & Mapping] ──────────────────┤
                                                       │
                                                       ▼
                                          [Zustand Central Store (lib/store.ts)]
                                                       │
                        ┌──────────────────────────────┼──────────────────────────────┐
                        ▼                              ▼                              ▼
             [Deterministic Replay Clock]    [Split Telemetry Charts]       [Three.js / R3F Canvas]
               (Time / Distance domain)       (Speed, Pedals, G-Force)        (Singapore 19-turn 3D)
                        │                              │                              │
                        └──────────────────────────────┴──────────────────────────────┘
                                                       │
                                                       ▼
                                            [Export Hub: CSV/JSON/JSONL]
```

### 1.2 Technology Stack
* **Frontend:** Next.js 16.4.3 (Turbopack, App Router, React 19.3.0, TypeScript 5.x)
* **3D Graphics:** Three.js 0.186.1, `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9
* **Charting:** Recharts 3.10.1 (SVG Area/Line Charts, dual-axis overlays)
* **State Management:** Zustand 5.0.16 (unified time-scrubbed store)
* **Backend UDP Service:** Python 3.14.3 (FastAPI, standard library `socket` and `struct`)
* **Styling:** Tailwind CSS 4.x, Lucide React icons

---

## 2. Environment and Runtime Requirements

| Layer | Runtime / Tool | Verified Version | Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | Node.js Runtime | `v20.x`+ | Operational |
| **Package Manager** | npm | `10.8.2` | Operational |
| **Frontend Compiler** | Next.js Turbopack | `16.4.3` | Operational |
| **Type Checker** | TypeScript Compiler (`tsc`) | `5.x` | Operational |
| **Linter** | ESLint with Flat Config | `9.x` | Functional, 14 errors & 46 warnings detected |
| **Python** | Python Core x64 | `3.14.3` | Operational |
| **Python Test Runner** | pytest | `9.1.1` | Operational |
| **OS Platform** | Windows 11 (PowerShell 7.x) | Windows_NT x64 | Execution policy bypass required |

---

## 3. Baseline Commands Executed & Raw Results

### Command 1: TypeScript Production Build
```powershell
npm run build
```
* **Exit Code:** `0`
* **Result:** Successfully compiled 21 static routes via Turbopack in ~1.45s.
* **Routes Verified:** `/`, `/dashboard`, `/replay`, `/explore`, `/telemetry`, `/laps`, `/comparison`, `/drivers`, `/timing`, `/tyres`, `/track-map`, `/historical`, `/history`, `/packets`, `/diagnostics`, `/connection`, `/data`, `/about`.

### Command 2: Mathematics & Replay Test Suite
```powershell
npm test
```
* **Runner:** `tsx tests/run_tests.ts`
* **Exit Code:** `0`
* **Results:**
  - `✓ PASS: Track Generator Spline Interpolation`
  - `✓ PASS: Bounding Box & Coordinate Transformation`
  - `✓ PASS: Time & Delta Formatting Sign Conventions`
  - `✓ PASS: Longitudinal Vehicle Dynamics & RPM Step`
* **Total Executed:** 4 tests, 4 passed, 0 failed.

### Command 3: Python UDP Packet Decoder Unit Tests
```powershell
cd python-collector; $env:PYTHONPATH="."; pytest -v
```
* **Exit Code:** `0`
* **Results:**
  - `test_valid_telemetry_packet_unpacking`: PASSED
  - `test_valid_lap_packet_unpacking`: PASSED
  - `test_short_truncated_packet_rejection`: PASSED
  - `test_nan_float_rejection`: PASSED
  - `test_unknown_packet_id`: PASSED
  - `test_telemetry_normalizer_envelope`: PASSED
* **Total Executed:** 6 tests, 6 passed, 0 failed.

### Command 4: Static Linter Inspection
```powershell
npx eslint . --max-warnings 50
```
* **Exit Code:** `1`
* **Summary:** 60 problems total (14 errors, 46 warnings).
* **Specific Issues Identified:**
  1. `app/about/page.tsx`: Unescaped single quote in JSX.
  2. `components/charts/SplitTelemetryWorkbench.tsx`: `any` event typing in click handler.
  3. `components/charts/SynchronizedTelemetryChart.tsx`: `any` event typing in click handler.
  4. `components/layout/TopBar.tsx`: `any` type casting.
  5. `components/three/CameraController.tsx`: `any` ref typing on OrbitControls.
  6. `lib/simulation/trackGenerator.ts`: `prefer-const` violations on speed limit variables.
  7. `lib/store.ts`: `any` type annotations in driver state mapping.
  8. `tests/physics_and_replay.test.ts`: `catch (e: any)` annotations.

---

## 4. Current Limitations & Blockers

1. **Physical UDP Simulator Link:**
   - Testing live game packet arrival from an active racing simulator (e.g. EA F1 24, Assetto Corsa) requires a physical local simulator running on the host machine.
   - **Status:** Marked `BLOCKED (Requires Physical Simulator Host)`. Offline synthetic binary packet tests passing in pytest.
2. **OpenF1 Live Rate Limiting & Latency:**
   - OpenF1 public historical endpoints are subject to external rate limiting and occasional service latency.
   - **Mitigation:** The application includes curated historical datasets and fallbacks with declared provenance.
3. **Automated End-to-End Browser Testing:**
   - Playwright is not yet installed in `devDependencies`. Browser interactions are currently verified via automated Next.js route builds and HTTP endpoint assertions.
