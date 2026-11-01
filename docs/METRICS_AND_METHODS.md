# Metrics, Numerical Methods, and Model Limits

**Audit status (2026-11-01):** Methods in this document describe the implemented code, not a validated real-car model. The visible comparison page is a labeled synthetic example and is separate from the comparison engine tests.

## Lap comparison engine

`lib/analysis/lapComparison.ts` aligns samples by physical `distanceMeters`. It rejects non-finite or non-increasing distance sequences, bounds interpolation to the overlap, and prohibits interpolation when the bracketing sample span exceeds `maxInterpolationGapMeters` (default 150 m). A configurable spatial grid includes the final partial interval. It integrates reciprocal speed using trapezoids:

`delta_t = integral(3.6 / v_comp_kph - 3.6 / v_ref_kph) ds`

Positive delta means the comparison is slower. Non-positive speed samples and prohibited interpolation intervals are excluded; `commonCoverageMeters` reports the distance actually integrated, while `warnings` describe excluded regions. This is a partial-coverage delta when coverage is incomplete, not necessarily a full-lap time difference. The UI currently does not select real laps or invoke this engine.

Do not conflate point-specific delta, cumulative distance-integrated delta, and subtraction of full lap durations. If displayed lap times are available, the reported final lap delta must equal `comparisonLapTime - referenceLapTime`.

## Synthetic vehicle model

`lib/simulation/vehiclePhysics.ts` uses SI units internally for speed, force, mass and acceleration. Implemented terms include drive force (power divided by speed with a cap), a configurable braking force, quadratic aerodynamic drag, rolling resistance, and semi-implicit Euler integration:

`F_net = F_drive - F_brake - F_aero - F_roll`, `a = F_net / m`

`v_next = max(0, v + a dt)`, `s_next = s + v_next dt`

The model rejects non-finite, non-positive or greater-than-0.25 s timesteps. It is a simplified educational point-mass simulation. Fuel mass, calibrated engine/gear maps, drivetrain losses, tyre load sensitivity, suspension, aero balance, weather, detailed gradient force and validated setup parameters are omitted. DRS is enabled only inside configured circuit zones; missing zone data does not invent zones.

## Validation and units

CSV aliases and physical envelopes live in `lib/telemetry/validator.ts`. The parser records missing and malformed values and warns about absent channels and range violations. Warnings do not certify the data as physically correct. Units must be known before channel comparisons; automatic unit guessing is not a safe conversion contract.

## Replay and geometry

Procedural geometry and synthetic vehicle position are suitable for demonstration. Historical session metadata is not historical position telemetry. Circuit coordinates, layout variants, corner locations, and geometric accuracy have not been independently verified in this audit. Do not report a historical GPS replay unless the selected dataset actually includes position samples and its transform/coverage are shown.
