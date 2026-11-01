# Circuit Catalogue and Driver Data Status

**Status date:** 2026-11-01
**Canonical audit:** [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md)

The current `/circuits` view is a static catalogue backed by `lib/circuits/registry.ts`. It includes generated geometry and stored reference fields. During the audit, circuit layouts, turn/corner coordinates, DRS zones, exact lengths, lap records and official homologation were not independently verified against primary sources. The interface now labels the catalogue and its geometry/source limitations.

Launching a circuit selects a **synthetic simulation**. It does not create a historical Grand Prix session, driver roster, coordinate stream, lap count or high-frequency telemetry. Historical OpenF1 sessions are selected through `/historical`; the adapter currently loads metadata and separate timing/stint records where available. It does not load GPS samples into 3D replay.

The driver catalogue and championship statistics currently include static reference values. Source provenance and session-specific identity are incomplete; team/number metadata must not be treated as a universal mapping across seasons.

## Required next work

- Record a primary source, layout/configuration, direction, measured length, corner count, geometry quality and update date for every circuit fact.
- Store layouts separately and associate them with season/event/session identifiers.
- Fetch event/session/driver relationships from the relevant provider keys; never invent generic roster or location data.
- Show actual per-session telemetry coverage before enabling historical analysis or replay.
