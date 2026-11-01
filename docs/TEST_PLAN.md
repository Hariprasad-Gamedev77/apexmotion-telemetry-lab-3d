# Test Plan and Current Evidence

## Existing executable suites

| Command | Scope | 2026-11-01 result |
|---|---|---|
| `npm.cmd test` | Track/math helper checks, CSV validation, comparison engine, dynamics formulas, circuit/schema checks | **32 passed, 0 failed** after external runtime access. |
| `npm.cmd run build` | Next.js production compilation, TypeScript check, static route prerender | **Passed**, 26 routes. |
| `npm.cmd run lint` | ESLint | Started without output and was interrupted; **UNVERIFIED**. |
| `python -m pytest tests/` from `python-collector` | Python decoder/collector unit tests | Not run: Python unavailable. |

The initial sandboxed TypeScript test attempt failed before test loading when `tsx` called `node:os.userInfo()` (`uv_os_get_passwd returned ENOMEM`). The successful rerun required external runtime access. Do not infer Python or browser test status from the TypeScript suite.

## Coverage limits

The TypeScript tests are a custom console runner, not a browser test suite. Several dynamics checks verify equations in isolation rather than exercising all production simulation inputs. The historical adapter tests validate a Zod schema fixture, not a live OpenF1 request. No automated browser route, responsive layout, accessibility, console/network, WebSocket lifecycle, or production endpoint tests currently run here.

## Next tests to add

- Validator: each physical range, all missing/NaN/Inf cases, duplicate headers and timestamps, non-monotonic distance, malformed quoting/rows, missing units, insufficient samples, mismatched channel lengths, gap thresholds, and proof original source values remain separately available.
- Comparison: zero speed, zero/negative/invalid config, different sample spacing, excluded gap coverage, explicit full-duration agreement, and point delta vs cumulative delta labeling.
- Physics: force outputs from the simulator, acceleration response, braking direction, DRS absent/present zones, speed bounds, bad initial states and timestep sensitivity.
- Python collector: invalid payload ranges/lengths, duplicate/out-of-order frames, packet loss estimates, socket failure, reconnect/shutdown, client cleanup, stale packet state and exact event envelope.
- Historical adapter: empty/error/schema-invalid responses, cancellation, throttling/pagination, unknown circuit/driver, season/session identity and missing channels.
- Replay/UI: actual position availability, timestamp vs receive-time handling, seek/pause/resume, multicar synchronization, empty/stale/disconnected states, mobile rendering and keyboard/accessibility interactions.
