# Feature Audit Index

**Current audit:** [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md) (2026-11-01). That report supersedes earlier feature status claims.

## Current implementation snapshot

- Synthetic circuit/vehicle demonstration: present; simplified, not calibrated.
- OpenF1 session browser: present; availability varies; failure returns empty state; historical GPS replay is not implemented.
- CSV import/export: parser and export are present; raw provenance envelope and full imported replay are incomplete.
- Lap comparison: numerical engine and deterministic tests are present; visible route currently shows an explicitly labeled synthetic comparison fixture.
- Circuit/driver/stint/pit/race views: several are static catalogues or fixtures; see the route audit before treating their values as records.
- Python collector: receives the project's educational packet fixture; commercial F1 packet support and frontend telemetry consumption are not implemented.
- Test evidence: TypeScript suite 32/32 and production build passed during this audit; Python suite, lint and browser QA were not verified.
