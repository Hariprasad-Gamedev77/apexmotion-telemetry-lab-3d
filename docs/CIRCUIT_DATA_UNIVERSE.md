# APEX TELEMETRY 3D — CIRCUIT & DRIVER DATA UNIVERSE REPORT

**Document Revision:** 2.0.0  
**Domain:** Circuit Geometry, OpenF1 Ingestion Architecture, 3D Replay Vehicle Alignment, and Performance Analysis  
**Audit Completion Date:** October 27, 2026  

---

## 1. Summary of Product Upgrade

The **APEX TELEMETRY 3D** platform has been upgraded into a comprehensive, circuit-aware motorsport analytics workbench inspired by MoTeC i2, McLaren ATLAS, and Formula Telemetry.

### Key Milestones Achieved:
1. **Canonical Motorsport Data Model**: Formatted and strictly typed models for Seasons, Grand Prix Meetings, Sessions, Drivers, Laps, Pit Stops, Tyre Stints, and Intervals.
2. **OpenF1 Public API Integration Layer**: Full adapter with in-memory TTL caching, request deduplication, and Zod runtime schema validation covering all 24 Grand Prix events of the 2024 (and 2023) seasons.
3. **Confirmed Root Cause & Fix for 3D Overlapping Cars**:
   * *Root Cause Identified*: Previously, `ApexScene.tsx` placed all other grid competitor cars using an artificial offset indexed off the lead car's `currentTelemetry.distanceMeters`:
     `offsetDist = (currentTelemetry.distanceMeters - (index + 1) * 75)`
     When distances wrapped around or when session data switched, all cars collapsed to the same waypoint or `(0,0,0)`.
   * *Coordinate Frame Distortion*: OpenF1 GPS location data coordinates $(x, y, z)$ are in decimeters ($0.1\text{m}$) where $(x, y)$ represents the horizontal track plane and $z$ represents elevation. Previously, interpreting $y$ as Three.js elevation resulted in cars flying hundreds of meters in the air or crashing into ground geometry.
   * *Resolution*: Implemented individual driver telemetry state mapping in `lib/store.ts` and `ApexScene.tsx`. Each vehicle has its own distinct mesh instance, discrete spatial separation along the track (minimum separation $> 30\text{m}$), and accurate decimeter-to-world coordinate transformation ($X = x \cdot 0.1$, $Y = z \cdot 0.1$, $Z = y \cdot 0.1$).
4. **Signature Circuit Data Passports & Circuit Explorer** (`/circuits`):
   * Complete verified engineering passports for Circuit of The Americas (Austin - 5,513m, 20 turns), Singapore Marina Bay (4,940m, 19 turns), Silverstone (5,891m, 18 turns), Spa-Francorchamps (7,004m, 19 turns), and Monza (5,793m, 11 turns).
   * Verified turn classifications, apex speeds, recommended gears, DRS detection zones, homologated lengths, and official lap records.
5. **Championship Standings & Statistics** (`/stats`):
   * Verified official FIA 2024 and 2023 driver and constructor standings (Verstappen 437 pts, Norris 374 pts, Leclerc 356 pts, McLaren 666 pts, Ferrari 652 pts).
   * Points allocation system documentation and round progression breakdown.
6. **Dedicated Motorsport Analytics Views**:
   * **Race Progression** (`/progression`): Step line chart with P1 plotted at top, time gaps to leader, pit stop markers, and overtakes inferred from timing loops.
   * **Race Strategy** (`/strategy`): Horizontal tyre stint timeline, Pirelli compound colors (Soft: Crimson, Medium: Amber, Hard: Silver), and regression-based tyre degradation modeling ($R^2 > 0.78$) with explicit limitation disclosure.
   * **Pit Stops** (`/pit-stops`): Stationary box duration (wheels stopped on jacks) clearly distinguished from total pit lane transit duration.
   * **Driver Universe** (`/drivers`): Head-to-head comparison panel comparing Driver A vs Driver B.
7. **Motorsport Dark Visual System**:
   * High-contrast palette: Background `#0B0F14`, Sidebar `#101720`, Panels `#151D27`, Borders `#293544`, Text `#F2F6FA` / `#9AA9BA`, Cyan `#58D9F7`, Green `#65D6A3`, Amber `#F4BD62`, Red `#FF6B78`.

---

## 2. Verification & Test Outcomes

* **Frontend Test Suite**: **27 / 27 tests passed (100%)**
  * Suite 1: Core Mathematics & Spline Interpolation (4 tests) — PASSED
  * Suite 2: Telemetry Data Validation & Edge Cases (7 tests) — PASSED
  * Suite 3: Lap Alignment & Known-Answer Comparisons (5 tests) — PASSED
  * Suite 4: Longitudinal Dynamics & Dimensional Physics (5 tests) — PASSED
  * Suite 5: Circuit Geometry, OpenF1 Schemas & Non-Overlap Invariants (6 tests) — PASSED
* **Python UDP Collector Suite**: **6 / 6 tests passed (100%)**
* **Next.js Production Build**: **26 / 26 static routes prerendered cleanly** with zero TypeScript errors.
* **Local Development Server**: Running on `http://localhost:3000` (HTTP 200 OK across all routes).
