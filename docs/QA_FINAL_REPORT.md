# APEX TELEMETRY 3D — Audit and QA Report

**Audit date:** 2026-11-01

**Scope:** Repository source review, static route inventory, baseline commands, and targeted fixes.

**Production deployment:** Not changed.

## Summary

The project is a Next.js 16 App Router frontend with Zustand state, Three.js/React Three Fiber visuals, Recharts charts, a TypeScript calculation layer, and a Python FastAPI UDP/WebSocket collector. It has 24 application routes plus the home and not-found routes. The prominent end-to-end historical telemetry replay and commercial simulator ingestion claims were not supported by the inspected implementation.

The baseline and post-change production builds generated all 26 routes. The sandboxed TypeScript test attempt initially failed in `tsx` while calling `os.userInfo()` with `uv_os_get_passwd returned ENOMEM`; rerunning with external runtime access executed the suite successfully (32/32). Python and the `py` launcher are unavailable, so collector tests were not run. No browser automation, responsive visual review, live API request, or physical simulator test was available.

## Architecture and source inventory

- **Framework:** Next.js 16.4.3 App Router, React 19.3, TypeScript, Tailwind v4.
- **Frontend state and UI:** Zustand; Three.js/React Three Fiber; Recharts; Lucide; Motion.
- **Historical provider:** direct OpenF1 REST adapter in `lib/api/openf1.ts`; no second provider adapter or FastF1 implementation.
- **Collector:** Python FastAPI, UDP receiver, educational `struct` decoder, JSON WebSocket broadcaster, JSONL/CSV recorder.
- **Tests:** custom `tsx` runner under `tests/`; pytest suite under `python-collector/tests/`.
- **Routes:** `/`, `/about`, `/circuits`, `/comparison`, `/connection`, `/dashboard`, `/data`, `/diagnostics`, `/drivers`, `/explore`, `/historical`, `/history`, `/laps`, `/packets`, `/pit-stops`, `/progression`, `/replay`, `/stats`, `/strategy`, `/telemetry`, `/timing`, `/track-map`, `/tyres`, and Next's not-found route.
- **Files read in detail:** `AGENTS.md`, `package.json`, `README.md`; `app/layout.tsx`, `app/page.tsx`, and route files for about, circuits, comparison, connection, dashboard, data, diagnostics, drivers, explore, historical, history, laps, packets, pit stops, progression, replay, stats, strategy, telemetry, timing, and tyres; `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`, `components/charts/FormulaTelemetrySuite.tsx`; `lib/types.ts`, `lib/store.ts`, `lib/api/openf1.ts`, `lib/circuits/registry.ts`, `lib/telemetry/validator.ts`, `lib/analysis/lapComparison.ts`, `lib/simulation/trackGenerator.ts`, `lib/simulation/vehiclePhysics.ts`; Python collector protocol, receiver, broadcaster, normalizer, models and entry point; the TypeScript test runner and test files; and the QA/provenance/schema/methods/test-plan docs. All app route filenames were inventoried with `rg --files`; visual/browser findings remain unverified. The inventory excluded generated `node_modules` and `.git`.

## Page-by-page audit

“Static review” means source inspection only. None of the pages below received browser interaction or responsive visual verification in this run.

| Page | Existing functionality | Confirmed problems | Required fix | Test performed | Status |
|---|---|---|---|---|---|
| Home `/` | Mode launcher and product summary | Advertised real GPS and F1 packet compatibility without support | Corrected descriptions and rate claims | Source review; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Dashboard `/dashboard` | Synthetic 3D scene, HUD, charts, controls | Historical selection could leave procedural telemetry looking historical | Historical mode now shows metadata-only and illustrative-geometry notice; historical store data cleared | Source review; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Live Timing `/timing` | Timing tower view | No live data binding verified; empty state is present | Connect a real source and browser-check empty/disconnected states | Source review; build passed | UNVERIFIED |
| Track Map `/track-map` | 2D circuit view | Geometry provenance/accuracy not externally verified | Cite source and mark illustrative geometry | Not run | UNVERIFIED |
| Vehicle Telemetry `/telemetry` | HUD view | Source behavior not browser-verified | Validate with actual selected dataset | Not run | UNVERIFIED |
| Telemetry Explorer `/explore` | Formula/chart explorer | Shared chart suite includes generated fixtures | Fixture values are labeled as synthetic examples | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| Lap Analysis `/laps` | Lap analysis view | Data identity and metric source not verified | Bind to validated selected lap data | Not run | UNVERIFIED |
| Lap Comparison `/comparison` | Comparison charts | Hard-coded lap times and fallback delta disagreed; comparison speed was perturbed synthetic data; delta used an incorrect fixed distance increment | Replaced displayed times/delta with calculations from the shown synthetic comparison and labelled it as a fixture | New known-answer tests passed; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Driver Comparison `/drivers` | Driver comparison view | Reference values are not validated against a session | Marked as static reference fixtures with source caveat | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| Tyres & Stints `/tyres` | Compound/stint display | Used synthetic grid compounds and unsupported precise degradation claims | Labeled demo values; removed degradation rates and measured-data implication | Source review; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Track Replay `/replay` | Replay controls and 3D view | Historical position synchronization is not implemented | Shows source notice that position telemetry is not subscribed | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| Session History `/history` | Curated session catalogue | “Open Replay” navigated to the synthetic dashboard | Now links to provider session browser and labels entries as catalogue references | Source review | IMPLEMENTED, NOT FULLY TESTED |
| Historical Explorer `/historical` | OpenF1 meeting/session browser | Empty provider responses were replaced with curated sessions | Removed fixture substitution and added empty/error notices | Source review; no live API test | IMPLEMENTED, NOT FULLY TESTED |
| Import & Export `/data` | CSV parsing and export | Imported sample load currently sets only the current sample; channel defaults remain placeholders | Validator now discloses absent channels, retains out-of-range values and rejects numeric-prefix parsing; complete import replay remains incomplete | Added cases passed in 32-test suite; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Packet Inspector `/packets` | Fixture protocol description and counters | Displayed a fixed 60 Hz target and implied a bound/live receiver | Clarified educational fixture, unconnected metrics, unknown source rate and idle state | Source review | IMPLEMENTED, NOT FULLY TESTED |
| Connection Setup `/connection` | WebSocket connection UI | Button marked connected after a timer without opening a socket; instructions implied simulator compatibility | Uses real browser WebSocket events and identifies fixture-only protocol | Source review; production build passed; no collector available | IMPLEMENTED, NOT FULLY TESTED |
| Diagnostics `/diagnostics` | Diagnostic cards | FPS, GPU, buffer and packet counters were fabricated constants | Removed fabricated initial packet counters; replaced uninstrumented FPS with “Not measured” | Source review; production build passed | IMPLEMENTED, NOT FULLY TESTED |
| Circuit Explorer `/circuits` | Circuit catalogue and illustrative geometry controls | Catalogue/geometry source and layout quality are unverified | Marked unverified; launched session uses synthetic metadata | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| `/pit-stops` | Pit stop chart/table | Values are fixture examples, not event-scoped provider records | Generic demo identity and fixture label added | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| `/progression` | Race progress chart | Data is generated, not provider session data | Generic demo identities and synthetic fixture label added | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| `/stats` | Championship statistics | Season values are static and source is unverified | Reference fixture/source caveat added | Source review; build passed | IMPLEMENTED, NOT FULLY TESTED |
| `/strategy` | Tyre strategy bars | Static Austin fixture was called real selected-session data | Explicitly labeled as illustrative demo fixture | Source review | IMPLEMENTED, NOT FULLY TESTED |
| `/about` | Architecture documentation | Claimed full simulator ingestion, provenance separation, and historical replay | Updated collector, physics, and history limitations | Source review | IMPLEMENTED, NOT FULLY TESTED |
| Not found | Next.js fallback | Browser behavior not reviewed | Verify route handling in browser | Build prerender only | UNVERIFIED |

## Confirmed bugs and fixes

| Finding | Fix | Status |
|---|---|---|
| Historical API failures returned curated records as if fetched | Meeting, session and driver fetches return empty results; historical UI no longer swaps in fixture sessions | IMPLEMENTED, NOT FULLY TESTED |
| API session metadata invented 56/25 lap counts, 5400 m circuit length, generic driver roster and complete channel coverage | Unknown lap count/length are 0; driver and channel coverage starts empty/false unless available from retrieved data | IMPLEMENTED, NOT FULLY TESTED |
| Historical driver roster was converted to invented positions, gaps, lap, speed and medium tyres | Historical load clears synthetic cars and telemetry history; dashboard identifies metadata-only state | IMPLEMENTED, NOT FULLY TESTED |
| Lap comparison UI displayed two fixed lap times and unrelated fallback delta | UI now derives the shown reference duration and generated-comparison delta from chart samples | IMPLEMENTED, NOT FULLY TESTED |
| Core comparison integrated a constant grid width and returned a delta across skipped regions | It validates ordered finite inputs, appends the final partial grid endpoint, uses trapezoidal reciprocal-speed integration over actual valid distance and reports excluded coverage | IMPLEMENTED, NOT FULLY TESTED |
| CSV `parseFloat` accepted values such as `200kmh`; absent channels silently received plausible defaults; pedal values were clipped | Strict numeric parsing, per-sample missing-value findings, explicit warnings for placeholder channels, and retention/reporting of out-of-range values | IMPLEMENTED, NOT FULLY TESTED |
| Simulator substituted guessed DRS ranges when a circuit had no DRS zones; timestep was unchecked | Missing zones now mean DRS unavailable; timestep must be finite and in `(0, 0.25]` seconds | IMPLEMENTED, NOT FULLY TESTED |
| Connection button reported connected on a timeout without a socket | It now reflects WebSocket open/error/close events and closes the connection on unmount | IMPLEMENTED, NOT FULLY TESTED |
| Hardcoded packet metrics and unsupported 60 Hz/live protocol statements | Initial diagnostics are idle/zero; packet and homepage copy now identifies an educational format and does not claim F1 compatibility or a fixed rate | IMPLEMENTED, NOT FULLY TESTED |
| Static tyre degradation rates and strategy fixture appeared to be measured selected-session information | Replaced by clear demo wording and removed numerical degradation claims | IMPLEMENTED, NOT FULLY TESTED |

## Test and build evidence

| Command | Actual outcome |
|---|---|
| `npm.cmd run build` (before edits) | **Passed.** Next.js 16.4.3 compiled, TypeScript completed, and all 26 routes prerendered. |
| `npm.cmd test` (before edits, first attempt) | **Did not run tests.** `tsx` crashed during initialization: `uv_os_get_passwd returned ENOMEM` in `node:os.userInfo`. |
| `npm.cmd test` (retry, before edits) | **Did not run tests.** Same runtime initialization failure. |
| `npm test` | PowerShell blocked `npm.ps1` under execution policy; no tests ran. |
| `python -m pytest tests/` | Python executable is unavailable. |
| `py -m pytest tests/` | Python launcher is unavailable. |
| `npm.cmd test` (post-change, with external runtime access) | **Passed: 32 executed, 32 passed, 0 failed.** Includes new validator, timestep and comparison cases. |
| `npm.cmd run build` (post-change) | **Passed.** TypeScript completed and all 26 routes prerendered. |
| `npm.cmd run lint` | Started but produced no output and was interrupted; lint status is UNVERIFIED. |

The post-change TypeScript suite and production build passed. The Python collector suite and lint remain unverified.

## Feature status

- **Synthetic mode:** IMPLEMENTED, NOT FULLY TESTED. The simplified longitudinal model omits calibrated vehicle maps, tyre/load sensitivity, suspension, fuel burn, drivetrain details, and other real-car effects.
- **Historical metadata browser:** IMPLEMENTED, NOT FULLY TESTED. OpenF1 records are provider data when returned; network failure produces empty state. Complete telemetry acquisition and historical GPS replay are NOT IMPLEMENTED.
- **Live simulator mode:** NEEDS EXTERNAL DATA OR HARDWARE. Current collector decodes an educational fixture protocol; commercial F1 simulator adapter, browser telemetry subscription, freshness/sequence tracking and measured packet loss display are NOT IMPLEMENTED.
- **CSV validation:** IMPLEMENTED, NOT FULLY TESTED. It still outputs placeholder values for absent optional channels (now disclosed); original file bytes/rows are not retained alongside processed samples.
- **Lap comparison engine:** IMPLEMENTED, NOT FULLY TESTED. It is not wired to actual lap selection in the visible `/comparison` UI; current UI explicitly shows a synthetic derived example.
- **3D historical replay:** NOT IMPLEMENTED. Historical location fetch is not wired into the replay route; current metadata-only notice is explicit.
- **Trust Passport, Validation Bench, complete Circuit Explorer/Driver Universe and source-specific dataset envelopes:** NOT IMPLEMENTED.

## Limitations and external dependencies

- The provided Vercel site URL was inaccessible through the available web inspection tool. Production behavior is UNVERIFIED.
- No browser runtime was available for console/network inspection, control testing, keyboard checks, or desktop/tablet/mobile screenshots.
- OpenF1 is a third-party data provider, not an official F1 service. Provider coverage, API availability and usage terms must be checked against the provider before production use.
- No simulator host or running collector was available. Physical UDP handling, reconnect behavior, packet order/loss and true source frequency are UNVERIFIED.
- Circuit layouts, turn coordinates, geometry, historical accuracy and the static catalogue's external source claims were not independently verified during this run.

## Recommended next priorities

1. Run the Python collector tests and add browser integration checks in a suitable environment; the TypeScript suite and production build passed here.
2. Connect the historical adapter to actual location, lap, stint and pit data with session-specific coverage and cancellation/error reporting; never synthesize historical positions.
3. Define real dataset envelopes with source/provider/session/channel/unit/sample coverage and retain imported raw data separately from processed output.
4. Implement a documented simulator-specific packet adapter, frame/timestamp validation, WebSocket subscription cleanup, stale detection and service diagnostics.
5. Wire the visible lap comparison, replay, driver, stint and pit-stop pages to selected datasets; otherwise keep them explicitly labeled as fixtures.
6. Verify circuit geometry sources/layout versions and conduct browser-based route/responsive/console/network QA.
