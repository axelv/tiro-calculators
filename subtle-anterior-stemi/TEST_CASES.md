# Subtle Anterior STEMI (4-Variable) — Test Cases

Five fictional clinical test cases for the Driver/Smith 4-variable formula
(`Value = 0.052·QTc − 0.151·QRSV2 − 0.268·RV4 + 1.062·STE60V3`).
Threshold: `Value ≥ 18.2` → Smith-positive (likely LAD occlusion).

All inputs assume the ECG meets the pre-conditions (≥1 mm STE in ≥1 of V2–V4
and no exclusion criteria such as STE > 5 mm, convex morphology, reciprocal
depression, terminal QRS distortion, pathologic Q waves, or T-wave inversion).

---

## Test case 1 — Classic benign early repolarization (low-risk)

**Vignette.** Marcus Delacroix, a 24-year-old male amateur triathlete, presents
to the ED with two hours of pleuritic chest pain after an intense training
session. He has no cardiac risk factors. The 12-lead ECG shows 1.5 mm concave
ST elevation in V2–V4 with prominent J-waves and tall R-waves; no exclusion
criteria are present.

**Inputs:**

| Field | Value |
|---|---|
| `QTc` | 380 ms |
| `QRSV2` | 22 mm |
| `RV4` | 18 mm |
| `STE60V3` | 1.5 mm |

**Calculation:**

```
Value = 0.052 × 380  − 0.151 × 22  − 0.268 × 18  + 1.062 × 1.5
      = 19.760       − 3.322       − 4.824       + 1.593
      = 13.207
```

**Expected output:**
- Score ≈ **13.21**
- `smith_positive = false` (13.21 < 18.2)
- Interpretation: **Smith-negative — favors benign early repolarization.**
  Does not rule out LAD occlusion; if clinical suspicion remains, obtain serial
  ECGs and troponin.

---

## Test case 2 — Borderline / mid-range

**Vignette.** Sandra Voss, a 51-year-old female smoker with hypertension,
presents with 90 minutes of substernal chest pressure radiating to the jaw.
The ECG shows 2 mm concave STE in V2–V4 with modest R-wave amplitudes; no
exclusion criteria are present.

**Inputs:**

| Field | Value |
|---|---|
| `QTc` | 410 ms |
| `QRSV2` | 12 mm |
| `RV4` | 10 mm |
| `STE60V3` | 2 mm |

**Calculation:**

```
Value = 0.052 × 410  − 0.151 × 12  − 0.268 × 10  + 1.062 × 2
      = 21.320       − 1.812       − 2.680       + 2.124
      = 18.952
```

**Expected output:**
- Score ≈ **18.95**
- `smith_positive = true` (18.95 ≥ 18.2, but only just)
- Interpretation: **Smith-positive — likely subtle anterior STEMI / LAD
  occlusion.** Borderline result in the 17–19 grey zone; activate cath lab in
  the appropriate clinical context, obtain serial ECGs, troponin, and consider
  POCUS for wall-motion abnormality.

---

## Test case 3 — High-risk subtle LAD occlusion

**Vignette.** Henrik Larsson, a 63-year-old male with type 2 diabetes and a
prior LAD stent, presents with one hour of crushing retrosternal chest pain
and diaphoresis. The ECG shows 3 mm concave STE in V2–V4, modest R-waves in
V4, and a slightly prolonged QTc; no exclusion criteria.

**Inputs:**

| Field | Value |
|---|---|
| `QTc` | 445 ms |
| `QRSV2` | 9 mm |
| `RV4` | 6 mm |
| `STE60V3` | 3 mm |

**Calculation:**

```
Value = 0.052 × 445  − 0.151 × 9   − 0.268 × 6   + 1.062 × 3
      = 23.140       − 1.359       − 1.608       + 3.186
      = 23.359
```

**Expected output:**
- Score ≈ **23.36**
- `smith_positive = true` (23.36 ≥ 18.2)
- Interpretation: **Smith-positive — likely subtle anterior STEMI / LAD
  occlusion.** Strongly suggests acute LAD occlusion. Activate cath lab; begin
  guideline-directed ACS therapy.

---

## Test case 4 — Edge case: minimum-side score (very negative)

**Vignette.** Tomás Rivera, a 19-year-old male collegiate basketball player,
is referred from the student health centre with atypical chest discomfort
after a game. The ECG shows minimal STE (1 mm) in V2 and V3, very tall
R-waves in V4, and large QRS amplitudes in V2; no exclusion criteria.

**Inputs:**

| Field | Value |
|---|---|
| `QTc` | 360 ms |
| `QRSV2` | 30 mm |
| `RV4` | 25 mm |
| `STE60V3` | 1 mm |

**Calculation:**

```
Value = 0.052 × 360  − 0.151 × 30  − 0.268 × 25  + 1.062 × 1
      = 18.720       − 4.530       − 6.700       + 1.062
      = 8.552
```

**Expected output:**
- Score ≈ **8.55**
- `smith_positive = false` (8.55 < 18.2)
- Interpretation: **Smith-negative — strongly favors benign early
  repolarization.** Classic athletic-heart pattern with large QRS in V2 and
  prominent R in V4 driving the score well below threshold. Continue routine
  evaluation; the formula does not rule out ACS if clinical suspicion is high.

---

## Test case 5 — Edge case: maximum-side score (very positive)

**Vignette.** Eleanor Ashworth, a 72-year-old woman with hyperlipidaemia,
arrives by ambulance with 45 minutes of severe chest pain and nausea. The
ECG shows 4.5 mm concave STE in V2–V4 with a long QTc and small QRS / R-wave
amplitudes; she has no exclusion criteria (no STE > 5 mm, concave morphology,
no reciprocal depression, no terminal QRS distortion, no Q-waves, no
T-inversion).

**Inputs:**

| Field | Value |
|---|---|
| `QTc` | 480 ms |
| `QRSV2` | 6 mm |
| `RV4` | 3 mm |
| `STE60V3` | 4.5 mm |

**Calculation:**

```
Value = 0.052 × 480  − 0.151 × 6   − 0.268 × 3   + 1.062 × 4.5
      = 24.960       − 0.906       − 0.804       + 4.779
      = 28.029
```

**Expected output:**
- Score ≈ **28.03**
- `smith_positive = true` (28.03 ≥ 18.2)
- Interpretation: **Smith-positive — high-probability LAD occlusion.** Score
  far above threshold; emergent cath lab activation indicated. This represents
  the upper end of typical "subtle LAD occlusion" presentations within the
  formula's validated range (the formula is not validated for STE60V3 > 5 mm).
