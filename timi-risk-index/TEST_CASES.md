# TIMI Risk Index — Test Cases

Five fictional clinical test cases for the TIMI Risk Index (TRI).

Formula: `TRI = (HR × (Age / 10)²) / SBP`

Quintiles (STEMI derivation, 30-day mortality):
- Q1 < 12.5 (0.8 %)
- Q2 12.5 – 17.5 (1.9 %)
- Q3 17.5 – 22.5 (2.9 %)
- Q4 22.5 – 30.0 (5.5 %)
- Q5 ≥ 30.0 (16.1 %)

---

## Test case 1 — Low risk (Q1)

**Vignette.** Lukas Brenner, a 42-year-old male warehouse manager, presents
with chest pain and inferior STEMI. He is haemodynamically well: HR 72 bpm,
SBP 138 mmHg.

**Inputs:**

| Field | Value |
|---|---|
| `heart_rate` | 72 bpm |
| `age` | 42 years |
| `systolic_bp` | 138 mmHg |

**Calculation:**

```
TRI = 72 × (42/10)² / 138
    = 72 × 17.64    / 138
    = 1270.08       / 138
    ≈ 9.20
```

**Expected output:**
- TRI ≈ **9.20**
- Quintile **Q1** (TRI < 12.5)
- 30-day mortality estimate: **0.8 %** (24-h ≈ 0.4 %)
- Risk band: **Low** — standard monitoring; ward-level care often appropriate.

---

## Test case 2 — Low / borderline (Q2)

**Vignette.** Diane Mercier, a 58-year-old woman with newly diagnosed
NSTEMI, vitals on admission: HR 78 bpm, SBP 142 mmHg.

**Inputs:**

| Field | Value |
|---|---|
| `heart_rate` | 78 bpm |
| `age` | 58 years |
| `systolic_bp` | 142 mmHg |

**Calculation:**

```
TRI = 78 × (58/10)² / 142
    = 78 × 33.64    / 142
    = 2623.92       / 142
    ≈ 18.48
```

**Expected output:**
- TRI ≈ **18.48**
- Quintile **Q3** (17.5–22.5)
- 30-day mortality estimate: **2.9 %** (24-h ≈ 1.6 %)
- Risk band: **Intermediate** — telemetry / step-down; early reperfusion
  strategy.

*(Despite the relatively benign individual vitals, the squared age term lifts
this patient into Q3.)*

---

## Test case 3 — Intermediate-high (Q4)

**Vignette.** Roberto Salgado, a 68-year-old man with anterior STEMI; on
arrival he is tachycardic and mildly hypotensive: HR 102 bpm, SBP 108 mmHg.

**Inputs:**

| Field | Value |
|---|---|
| `heart_rate` | 102 bpm |
| `age` | 68 years |
| `systolic_bp` | 108 mmHg |

**Calculation:**

```
TRI = 102 × (68/10)² / 108
    = 102 × 46.24    / 108
    = 4716.48        / 108
    ≈ 43.67
```

**Expected output:**
- TRI ≈ **43.67**
- Quintile **Q5** (≥ 30.0)
- 30-day mortality estimate: **16.1 %** (24-h ≈ 6.9 %)
- Risk band: **Very high** — CCU/ICU; consider early invasive strategy and
  adjunctive therapy.

---

## Test case 4 — Very high risk (Q5)

**Vignette.** Beatrice Holloway, an 84-year-old woman with extensive
anterior STEMI and clinical evidence of cardiogenic shock: HR 118 bpm, SBP
82 mmHg.

**Inputs:**

| Field | Value |
|---|---|
| `heart_rate` | 118 bpm |
| `age` | 84 years |
| `systolic_bp` | 82 mmHg |

**Calculation:**

```
TRI = 118 × (84/10)² / 82
    = 118 × 70.56    / 82
    = 8326.08        / 82
    ≈ 101.54
```

**Expected output:**
- TRI ≈ **101.54**
- Quintile **Q5** (≥ 30.0)
- 30-day mortality estimate: **16.1 %** (24-h ≈ 6.9 %) per the original
  derivation table; absolute mortality in this profile is likely substantially
  higher (NRMI-3 reports ~36 % in the highest stratum).
- Risk band: **Very high** — CCU/ICU level of care, urgent reperfusion,
  consider mechanical circulatory support.

---

## Test case 5 — Edge case: minimum plausible TRI (very low)

**Vignette.** Eli Tanaka, a 19-year-old man with cocaine-induced chest pain
and an ECG meeting STEMI criteria. Vitals: HR 55 bpm (resting athletic),
SBP 130 mmHg.

**Inputs:**

| Field | Value |
|---|---|
| `heart_rate` | 55 bpm |
| `age` | 19 years |
| `systolic_bp` | 130 mmHg |

**Calculation:**

```
TRI = 55 × (19/10)² / 130
    = 55 × 3.61     / 130
    = 198.55        / 130
    ≈ 1.53
```

**Expected output:**
- TRI ≈ **1.53**
- Quintile **Q1** (TRI < 12.5)
- 30-day mortality estimate: **0.8 %** (24-h ≈ 0.4 %)
- Risk band: **Low** — standard monitoring; ward-level care often appropriate.
- Caveat (edge case): TRI is a triage aid, not a substitute for clinical
  judgement. A young patient with confirmed STEMI still requires urgent
  reperfusion regardless of an extremely low triage score.
