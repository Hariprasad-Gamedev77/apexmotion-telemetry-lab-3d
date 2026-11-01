# Telemetry Schema and Units

**Audit status (2026-11-01):** `TelemetrySample` is the current frontend sample shape, not a complete provenance-aware dataset schema. Several fields are required by the TypeScript type even when the source does not provide them. Imported missing channels receive explicit validation warnings but placeholder values may still be used for display.

## Frontend sample

Defined in `lib/types.ts` as `TelemetrySample`:

| Field | Unit / meaning |
|---|---|
| `timestamp` | seconds; source/session-relative for imported samples |
| `distanceMeters` | metres along lap; may be reconstructed during CSV import |
| `speedKph` | km/h |
| `throttlePercent`, `brakePercent` | percent, nominally 0–100 |
| `gear` | gear index |
| `rpm` | revolutions/minute |
| `drs` | 0/1 state |
| `steeringAngleDeg` | degrees |
| `longitudinalG`, `lateralG` | multiples of standard gravity |
| `worldX`, `worldY`, `worldZ` | metres in the renderer's coordinate frame; source transform must be documented |
| `heading` | radians |

The schema currently has no per-field availability marker, source timestamp separate from receive timestamp, session/sample foreign key, quality status, or immutable raw row. Those are required before using this shape as a shared historical/live/imported dataset contract.

## CSV import

The current parser recognizes timestamp and speed as required columns. Other fields are optional. Missing values/channels are reported; absent-channel playback defaults must not be interpreted as measured data. Numeric strings are parsed strictly. Out-of-range values are retained and warned rather than silently clipped. CSV quoting/escaped delimiters, unit conversion declarations, configurable range rules, raw-file retention and exact source metadata are incomplete.

## Python educational packet fixture

`python-collector/app/protocols/f1_educational.py` defines a project-specific format. It is not an EA SPORTS F1 packet specification and has no game protocol version validation.

| Packet | Format | Minimum datagram length | Decoded values |
|---|---|---:|---|
| Header | `<BBIf` | 10 bytes | packet ID, one-byte game-year fixture value, uint32 frame ID, float32 session time (seconds) |
| ID 6 payload | `<Hff` | 10 additional bytes | uint16 speed (km/h), float32 throttle (0–1), float32 brake (0–1) |
| ID 2 payload | `<ff` | 8 additional bytes | two float32 world coordinates (metres by fixture convention) |

The decoder accepts payloads at least this long and ignores trailing bytes. It checks finite time and payload floats, but does not validate exact packet lengths, year/version, frame ordering, duplicate/out-of-order packets, or field ranges beyond clamping throttle/brake. The WebSocket envelope carries `schemaVersion`, `source`, `eventType`, `timestamp` and a partial `payload`; source receive time and packet freshness are absent.

## Dataset metadata

The existing `DataProvenance` type is not attached to every dataset. A complete envelope, channel unit registry, source adapter contract and quality status remain NOT IMPLEMENTED.
