# Data Provenance and Coverage

**Audit status (2026-11-01):** The UI's selected operating mode is not a complete dataset provenance record. Full dataset envelopes, persistent raw imports, file hashes, application-version stamps and per-metric trust status are not implemented. See [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md) for route findings and verification status.

## Sources currently present

| Source | What the code actually provides | Limits |
|---|---|---|
| Synthetic | Procedurally generated track/vehicle samples held in the Zustand store | Deterministic seed/reproducibility metadata is not consistently retained; the simplified model is not calibrated to a real car. Label as `SYNTHETIC DEMO`. |
| OpenF1 | Meeting, session, driver, lap, pit and stint API adapters in `lib/api/openf1.ts` | Coverage depends on provider/session. Historical location is not connected to the replay view. Provider failure returns empty records, never the curated reference list. |
| CSV upload | Parsed and validated CSV values | Raw file and import identity are not kept with processed samples. Missing channels may be populated with playback placeholders, now accompanied by warnings. |
| UDP collector | Educational fixture packets decoded by the Python service | The format is not a commercial F1 simulator protocol. Browser subscription, freshness, source receive timestamps and end-to-end channel mapping are incomplete. |
| Curated history list | Static reference entries for selected 2024 events | Catalogue references only; no telemetry is bundled. Do not treat the entry as proof of channel coverage or a replay dataset. |

## Historical API behavior

OpenF1 is a third-party provider, not an official Formula 1 service. The adapter validates response schemas and caches successful fetches in memory. Network/schema failure returns an empty collection. Empty data must remain an empty state; do not fill it with fixture drivers, lap counts, positions, tyre compounds or telemetry.

Provider session identity should use the returned session and meeting keys. Current adapter limitations include incomplete pagination/cancellation/throttling controls, incomplete channel coverage reporting, and no historical GPS-to-3D replay pipeline. Do not infer a generic driver roster or exact lap count from session type.

## Required dataset envelope (not yet implemented)

Future imported/collected datasets should carry source type, provider, session/meeting/circuit/driver IDs, channel names, units, source and receive timestamps, sample count, coverage, data quality, import time, app version and processing configuration. Store raw samples separately from normalized/processed samples. Retain provider-specific IDs instead of globally mapping driver numbers.
