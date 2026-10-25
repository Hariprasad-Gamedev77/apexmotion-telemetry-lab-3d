# APEX TELEMETRY 3D — TELEMETRY SCHEMA & PACKET SPECIFICATION

**Project:** ApexMotion Telemetry Lab 3D  
**Document Revision:** 1.0.0  
**Specification Standard:** FIA Telemetry Data Interoperability & F1 UDP Protocol Standard  

---

## 1. Universal Telemetry Channel Definitions

Every ingested telemetry stream—whether originating from CSV file ingestion, the Python UDP collector, or the synthetic physics generator—is mapped into a normalized schema conforming to the following channel definitions.

### 1.1 Canonical Engineering Channels

| Channel Identifier | Data Type | Engineering Unit | Physical Minimum | Physical Maximum | Physical Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `timestamp` | `float64` | Seconds ($s$) | $0.000$ | $86,400.000$ | Monotonically increasing session clock. |
| `speedKph` | `float32` | Kilometers/hour ($km/h$) | $0.0$ | $385.0$ | True longitudinal vehicle velocity. |
| `throttlePercent` | `float32` | Percentage ($\%$) | $0.0$ | $100.0$ | Normalized driver throttle application. |
| `brakePercent` | `float32` | Percentage ($\%$) | $0.0$ | $100.0$ | Normalized driver brake line pressure. |
| `gear` | `int8` | Dimensionless | $-1$ | $8$ | Selected gear ($-1 = \text{Reverse}$, $0 = \text{Neutral}$, $1\dots8 = \text{Forward}$). |
| `rpm` | `uint16` | Revolutions/minute | $0$ | $15,500$ | Internal combustion engine crankshaft rotational speed. |
| `steeringAngle` | `float32` | Degrees ($^\circ$) | $-450.0$ | $+450.0$ | Steering wheel rotational angle (negative = left, positive = right). |
| `distanceMeters` | `float32` | Meters ($m$) | $0.0$ | $10,000.0$ | Lap distance traveled from start/finish line. |
| `drs` | `uint8` | Boolean (0 or 1) | $0$ | $1$ | Drag Reduction System rear wing flap state. |
| `gLat` | `float32` | Acceleration ($g$) | $-6.5$ | $+6.5$ | Lateral cornering acceleration ($1g \approx 9.80665\text{ m/s}^2$). |
| `gLong` | `float32` | Acceleration ($g$) | $-6.5$ | $+3.5$ | Longitudinal braking and tractive acceleration. |
| `tyreCompound` | `string` | Categorical | `SOFT`, `MEDIUM`, `HARD`, `INTER`, `WET` | Fitted Pirelli tyre compound specification. |

---

## 2. CSV File Ingestion Schema

The telemetry parser (`lib/telemetry/validator.ts`) accepts Comma-Separated Values (`.csv`) and Semicolon-Separated Values (`.csv`) with automatic header normalization.

### 2.1 Supported Header Aliases

The validator recognizes variable column namings produced by MoTeC, ATLAS, Assetto Corsa, and F1 sim tools:

```typescript
export const CHANNEL_ALIASES: Record<string, string[]> = {
  timestamp: ['timestamp', 'time', 't', 'sessiontime', 'time_s'],
  speedKph: ['speedkph', 'speed', 'velocity', 'v_car', 'speed_kmh', 'vel_kph'],
  throttlePercent: ['throttlepercent', 'throttle', 'thr', 'throttle_pct', 'gas'],
  brakePercent: ['brakepercent', 'brake', 'brk', 'brake_pct'],
  gear: ['gear', 'n_gear', 'current_gear', 'gearno'],
  rpm: ['rpm', 'engine_rpm', 'nmot', 'enginespeed'],
  steeringAngle: ['steeringangle', 'steer', 'steering', 'steer_angle'],
  distanceMeters: ['distancemeters', 'distance', 'dist', 'lapdistance', 's_lap'],
};
```

### 2.2 Rejection and Warning Triggers

* **Fatal Error (`CRITICAL`)**:
  - File contains 0 rows or is unparseable.
  - Missing mandatory channels (`timestamp`, `speedKph`).
  - Non-monotonic timestamps ($t_{k+1} < t_k$).
  - IEEE 754 non-finite values (`NaN`, `Infinity`, `-Infinity`).
* **Warning (`NON_FATAL`)**:
  - Physical boundary violations (e.g. Speed $> 385\text{ km/h}$, Throttle $> 100\%$). Out-of-bound values are clamped to limits with diagnostic logging.
  - Sampling gap exceeding $1.0\text{ s}$ between successive packets.

---

## 3. Python UDP Collector Binary Packet Specification

The Python telemetry bridge (`python-collector/app/protocols/f1_decoder.py`) decodes standard Little-Endian (`<`) binary datagrams broadcast by racing simulators over UDP port `20777`.

### 3.1 Packet Header (24 Bytes)

```
Format: <HBBBBQfIB
Offset  Size  Type    Field Name           Description
---------------------------------------------------------------------------------
0x00    2     uint16  packet_format        Game release year (e.g. 2023, 2024)
0x02    1     uint8   game_major_version   Game major version
0x03    1     uint8   game_minor_version   Game minor version
0x04    1     uint8   packet_version       Version of this packet type
0x05    1     uint8   packet_id            Packet identifier (0-11)
0x06    8     uint64  session_uid          Unique identifier for the session
0x0E    4     float   session_time         Session timestamp in seconds
0x12    4     uint32  frame_identifier     Sequential frame index
0x16    1     uint8   player_car_index     Index of player's car in car arrays
0x17    1     uint8   secondary_car_index  Index of secondary car (splitscreen)
```

### 3.2 Car Telemetry Packet (`PacketId = 6`)

Payload for the player's car unpacks high-frequency vehicle telemetry:

```
Format: <HfffBBbB4H4B...
Offset  Size  Type    Field Name           Description
---------------------------------------------------------------------------------
0x00    2     uint16  speed                Vehicle speed in km/h
0x02    4     float   throttle             Throttle application (0.0 to 1.0)
0x06    4     float   steer                Steering angle (-1.0 to +1.0)
0x0A    4     float   brake                Brake pressure (0.0 to 1.0)
0x0E    1     uint8   clutch               Clutch application (0 to 100)
0x0F    1     int8    gear                 Gear selected (-1=R, 0=N, 1-8=Forward)
0x10    2     uint16  engine_rpm           Engine RPM
0x12    1     uint8   drs                  DRS status (0 = Off, 1 = Active)
0x13    1     uint8   rev_lights_percent   Rev lights indicator percentage
```

### 3.3 Lap Data Packet (`PacketId = 2`)

```
Format: <ffff...
Offset  Size  Type    Field Name           Description
---------------------------------------------------------------------------------
0x00    4     float   last_lap_time        Last lap time in seconds
0x04    4     float   current_lap_time     Current lap time in seconds
0x08    4     float   lap_distance         Distance traveled on current lap (meters)
0x0C    4     float   total_distance       Total distance traveled in session
0x10    1     uint8   current_lap_num      Current lap number
0x11    1     uint8   car_position         Current race position (1-20)
```

---

## 4. WebSocket Normalizer Envelope (JSON Broadcast)

The Python collector normalizes raw datagrams into an interoperable JSON schema transmitted to the frontend over WebSocket (`ws://localhost:8000/ws/telemetry`):

```json
{
  "type": "TELEMETRY_SAMPLE",
  "timestamp": 1284.521,
  "car_index": 0,
  "data": {
    "speed_kph": 312.4,
    "throttle": 100.0,
    "brake": 0.0,
    "gear": 7,
    "rpm": 12450,
    "steer_angle": -1.2,
    "lap_distance_m": 1420.5,
    "lap_number": 14,
    "lap_time_s": 84.215,
    "drs_active": true,
    "g_lat": 0.12,
    "g_long": 0.85
  },
  "provenance": {
    "source": "SIMULATOR_UDP",
    "protocol_version": 2024,
    "packet_id": 6,
    "verified": true
  }
}
```
