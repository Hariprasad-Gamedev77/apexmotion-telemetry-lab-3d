# APEX TELEMETRY 3D — METRICS, NUMERICAL METHODS & DYNAMICS FORMULATION

**Project:** ApexMotion Telemetry Lab 3D  
**Document Revision:** 1.0.0  
**Domain:** Vehicle Dynamics, Spatial Numerical Alignment & 3D Kinematics  

---

## 1. 3D Coordinate System & Frame Conventions

ApexMotion Telemetry Lab 3D uses a standard right-handed Cartesian coordinate system:

* $+X$: Lateral axis (Track right)
* $+Y$: Vertical elevation (Upwards against gravity)
* $+Z$: Longitudinal axis (Forward along vehicle heading)
* Yaw angle ($\psi$): Measured counter-clockwise in the horizontal $X\text{--}Z$ plane.

---

## 2. Spatial Track Generation & Catmull-Rom Splines

Circuits are generated from discrete survey control points $P_i = (X_i, Y_i, Z_i)$ for $i \in \{0, 1, \dots, N-1\}$.

### 2.1 Closed Catmull-Rom Formulation

For any normalized parameter $u \in [0, 1]$ between control points $P_i$ and $P_{i+1}$, the interpolated position $C(u)$ is evaluated using the centripetal Catmull-Rom formulation ($\alpha = 0.5$):

$$C(u) = \frac{1}{2} \begin{bmatrix} 1 & u & u^2 & u^3 \end{bmatrix} \begin{bmatrix} 0 & 2 & 0 & 0 \\ -1 & 0 & 1 & 0 \\ 2 & -5 & 4 & -1 \\ -1 & 3 & -3 & 1 \end{bmatrix} \begin{bmatrix} P_{i-1} \\ P_i \\ P_{i+1} \\ P_{i+2} \end{bmatrix}$$

For a closed loop circuit, periodic indexing ensures $C^1$ geometric continuity across the start/finish line:
$$P_{-1} = P_{N-1}, \quad P_N = P_0, \quad P_{N+1} = P_1$$

---

## 3. Distance-Based Telemetry Alignment (MoTeC / ATLAS Standard)

Because two cars do not reach the same physical track location at the same elapsed timestamp, comparing telemetry over time ($t$) produces false artifacts. Telemetry channels are therefore resampled onto a spatial distance grid $s \in [0, S_{\max}]$.

### 3.1 Uniform Spatial Grid Discretization

The track distance $s$ is partitioned into uniform intervals $\Delta s = 1.0\text{ m}$:
$$s_j = j \cdot \Delta s, \quad j \in \{0, 1, \dots, M\}$$

### 3.2 Spatial Velocity Interpolation

For any arbitrary spatial coordinate $s \in [s_k, s_{k+1}]$, the localized velocity $v(s)$ is evaluated by linear interpolation:
$$v(s) = v_k + \frac{s - s_k}{s_{k+1} - s_k}(v_{k+1} - v_k)$$

To prevent division-by-zero singularities when calculating transit time, velocity is strictly clamped to $v_{\min} = 1.0\text{ m/s} \approx 3.6\text{ km/h}$.

### 3.3 Elapsed Time Calculation & Cumulative Delta Time ($\Delta t$)

The incremental time $\Delta t_j$ required to traverse spatial segment $\Delta s = s_{j+1} - s_j$ is evaluated using the harmonic mean (exact for constant acceleration segments):
$$\Delta t_j = \frac{2 \Delta s}{v(s_j) + v(s_{j+1})}$$

The cumulative elapsed lap time at distance $s$ is:
$$t(s) = \sum_{j=0}^{k-1} \Delta t_j$$

The relative time delta between a Comparison lap and a Reference lap is:
$$\Delta t(s) = t_{\text{comp}}(s) - t_{\text{ref}}(s) = \int_0^s \left( \frac{1}{v_{\text{comp}}(\sigma)} - \frac{1}{v_{\text{ref}}(\sigma)} \right) d\sigma$$

### 3.4 Sign Convention & Visual Mapping

* **Negative Delta ($\Delta t < 0$):** Comparison car is **faster** (ahead in lap time). Displayed in **Emerald Green** with explicit minus sign (e.g. `-0.342s`).
* **Positive Delta ($\Delta t > 0$):** Comparison car is **slower** (behind in lap time). Displayed in **Crimson Red** with explicit plus sign (e.g. `+0.418s`).

### 3.5 Gap Protection Heuristics

To prevent interpolation across lost telemetry packets, if the spatial distance between successive raw samples exceeds $150\text{ m}$:
$$\Delta s_k = s_{k+1} - s_k > 150\text{ m}$$
the interpolator halts evaluation for that segment, marks the region as `DATA_GAP`, and suppresses delta computation to protect engineering validity.

---

## 4. Longitudinal Vehicle Dynamics Simulation

Synthetic 3D simulation utilizes a point-mass longitudinal dynamics model with aerodynamic downforce and drag coupling.

### 4.1 Equations of Motion

The net longitudinal force acting on the vehicle is:
$$F_{\text{net}} = F_{\text{traction}} - F_{\text{brake}} - F_{\text{aero}} - F_{\text{rr}}$$

Where:
1. **Traction Force:**
   $$F_{\text{traction}} = \mu_{\text{drive}} \cdot \tau_{\text{throttle}} \cdot \frac{P_{\max}}{v}$$
   Clamped by the tyre adhesion limit $F_{\text{traction}} \le \mu_{\text{peak}} \cdot F_z$.
2. **Brake Force:**
   $$F_{\text{brake}} = \beta_{\text{brake}} \cdot \mu_{\text{brake}} \cdot F_z$$
3. **Aerodynamic Drag Force:**
   $$F_{\text{aero}} = \frac{1}{2} \rho C_d A v^2$$
   * Air density: $\rho = 1.225\text{ kg/m}^3$
   * Frontal area: $A = 1.60\text{ m}^2$
   * Standard Drag Coefficient: $C_{d,\text{base}} = 0.95$
   * DRS Drag Coefficient: $C_{d,\text{DRS}} = 0.95 \cdot (1 - 0.26) = 0.703$ (26.0% drag reduction)
4. **Rolling Resistance:**
   $$F_{\text{rr}} = C_{\text{rr}} m g$$
   * Coefficient of rolling resistance: $C_{\text{rr}} = 0.015$
   * Gravitational acceleration: $g = 9.80665\text{ m/s}^2$
   * Total vehicle mass with driver: $m = 798.0\text{ kg}$

### 4.2 Semi-Implicit Euler Kinematic Integration

Kinematic integration updates velocity and spatial position at each simulation step $\Delta t$:
$$a_k = \frac{F_{\text{net}}(v_k)}{m}$$
$$v_{k+1} = \max\left(0, v_k + a_k \cdot \Delta t\right)$$
$$x_{k+1} = x_k + v_{k+1} \cdot \Delta t$$

The semi-implicit formulation uses $v_{k+1}$ to update position $x_{k+1}$, providing symplectic energy conservation and preventing artificial velocity divergence.

---

## 5. Numerical Tolerances & Assertion Thresholds

| Metric | Verification Method | Numerical Tolerance ($\epsilon$) |
| :--- | :--- | :--- |
| Self-Comparison Delta Time | Analytical Invariant | $|\Delta t| \le 1.0 \times 10^{-4}\text{ s}$ |
| Linear Offset Delta Time | Analytical Exact Solution | $|\Delta t_{\text{num}} - \Delta t_{\text{exact}}| \le 1.0 \times 10^{-3}\text{ s}$ |
| Spline Closed-Loop Boundary | Coordinate Distance | $\|C(1.0) - C(0.0)\| \le 1.0 \times 10^{-4}\text{ m}$ |
| Drag Quadratic Exponent | Analytical Velocity Ratio | $\left|\frac{F_{\text{drag}}(2v)}{F_{\text{drag}}(v)} - 4.0\right| \le 1.0 \times 10^{-3}$ |
| DRS Drag Delta | Percentage Reduction | $\left|\frac{\Delta F_{\text{drag}}}{F_{\text{drag}}} - 0.260\right| \le 1.0 \times 10^{-3}$ |
| Mass Invariance ($F=ma$) | Analytical Ratio | $\left|\frac{a(2m)}{a(m)} - 0.500\right| \le 1.0 \times 10^{-4}$ |
