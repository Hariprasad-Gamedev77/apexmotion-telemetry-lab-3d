# Known Issues and Limitations

Status date: 2026-11-01. The detailed route matrix and fix/test evidence are in [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md).

## High priority

- Historical session loading retrieves metadata, driver/lap/pit/stint records where available, but does not load real location telemetry into the 3D replay. The dashboard now shows a metadata-only notice and clears generated cars/history.
- The visible lap comparison page uses a synthetic speed perturbation. It is labeled as a fixture; actual selectable lap datasets are not connected to the comparison engine.
- The Python packet decoder uses an educational fixture format (`<BBIf` plus `<Hff` or `<ff`). It is not an EA SPORTS F1 protocol adapter. The frontend does not consume and render WebSocket telemetry, and no stale-data/freshness pipeline is connected.
- CSV import provides placeholder values for unavailable optional channels. It reports these fields, but raw input and normalized output are not retained as separate dataset objects. The import action currently selects the first sample rather than loading an imported lap replay.
- Tyre/strategy pages still contain illustrative fixed example bars; they are now labeled as demo values. No tyre degradation estimate is calculated.
- Circuit/driver records and geometry have not been independently verified against their claimed primary sources, layouts or seasons.

## Other incomplete work

- Dataset-level provenance, source/receive timestamps, file hash, channel mapping and reproducibility envelope.
- Historical API pagination, cancellation, rate control, comprehensive coverage reporting and licensing/usage review.
- Browser integration tests, visual responsive review, console/network checks, accessibility checks and performance profiling.
- Collector reconnect/stale/sequence handling, service diagnostics polling and Python test execution in this environment.
- Trust Passport, Validation Bench, complete source-aware Circuit Explorer and Driver Universe.

## Fixed in the 2026-11-01 audit (verification status)

- Historical API failures no longer substitute curated records; unknown API session coverage is no longer populated with generic guesses. **IMPLEMENTED, NOT FULLY TESTED** (no live provider request).
- CSV numeric-prefix parsing and silent clipping were removed; unavailable channels/out-of-range data are disclosed. **FIXED AND TESTED** by the TypeScript suite.
- Lap comparison engine now validates input ordering, integrates actual valid distance intervals with trapezoidal reciprocal speed and rejects a delta with no valid coverage. **FIXED AND TESTED** by known-answer tests.
- The visible comparison labels generated data and derives displayed durations/delta from its plotted synthetic samples. **IMPLEMENTED, NOT FULLY TESTED** (no browser interaction).
- Simulator rejects invalid timesteps and no longer invents DRS zones for unknown circuits. **FIXED AND TESTED** for timestep; DRS fallback has source review but no dedicated test.
- WebSocket connection status now follows browser socket events instead of a timer. **IMPLEMENTED, NOT FULLY TESTED** (collector unavailable).
- Hardcoded packet counters and performance figures were removed from initial diagnostics; UI states which values are not measured. **IMPLEMENTED, NOT FULLY TESTED**.
