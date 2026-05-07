# Subtle Anterior STEMI Calculator (4-Variable)

> Driver/Smith 4-variable formula to differentiate **benign early repolarization (BER)** from **subtle anterior STEMI** caused by LAD occlusion.

---

## 1. Purpose

Patients presenting with chest pain and ST-segment elevation in the precordial leads (V2–V4) frequently fall into a diagnostic grey zone between:

- **Benign Early Repolarization (BER)** — a normal variant, no intervention needed.
- **Subtle Anterior STEMI** — usually a left anterior descending (LAD) coronary artery occlusion that does *not* meet classic STEMI millimetre criteria but still benefits from emergent reperfusion.

The 4-variable formula by Driver et al. (2017) refines the earlier 3-variable formula by Smith et al. (2012) by adding QRS amplitude in V2. It produces a single continuous score; values **≥ 18.2** indicate a high probability of LAD occlusion ("Smith-positive"), warranting cath lab activation in the appropriate clinical context.

### Pre-conditions for use

The calculator is **only valid** when the ECG meets *all* the following:

- ≥ 1 mm ST elevation in ≥ 1 of leads V2–V4.
- ECG does **not** show any of the following exclusions (any one of which already indicates STEMI / occlusion and bypasses the formula):
  - ST elevation > 5 mm in any precordial lead
  - Non-concave (convex / straight / "tombstone") ST-segment morphology
  - Inferior reciprocal ST depression
  - Anterior ST depression
  - Terminal QRS distortion in V2 or V3 (absence of both an S-wave and a J-wave)
  - Pathologic Q waves in V2–V4
  - T-wave inversion in V2–V6

If any exclusion criterion is present, treat as STEMI directly — **do not compute the score**.

---

## 2. Inputs

All four inputs are obtained from a standard 12-lead ECG. Calibration must be standard (10 mm/mV, 25 mm/s) so that **1 mm = 0.1 mV** vertically.

| # | Variable | Symbol | Unit | Lead | Description / How to measure |
|---|----------|--------|------|------|------------------------------|
| 1 | Bazett-corrected QT interval | `QTc` | milliseconds (ms) | Any lead with clear T-wave end (commonly II or V5) | Measure QT from start of QRS to end of T-wave, then correct using **Bazett's formula**: `QTc = QT / sqrt(RR)`, where `RR` is in seconds. |
| 2 | QRS amplitude in lead V2 | `QRSV2` | millimetres (mm) | V2 | Vertical distance from the **most negative** point of the QRS (nadir of S-wave) to the **most positive** point of the QRS (peak of R-wave) in V2 — i.e. total peak-to-trough amplitude. |
| 3 | R-wave amplitude in lead V4 | `RV4` | millimetres (mm) | V4 | Height of the R-wave in V4, measured from the **isoelectric baseline** (PR segment) to the **peak of the R-wave**. |
| 4 | ST elevation 60 ms after the J-point in lead V3 | `STE60V3` | millimetres (mm) | V3 | Identify the **J-point** (junction of QRS and ST segment). Move 60 ms (1.5 small boxes at 25 mm/s) to the right. Measure vertical distance from the **PR-segment baseline** to the ST segment at that point. |

### Input validation (recommended ranges)

| Field | Reasonable clinical range |
|-------|--------------------------|
| `QTc` | 300–600 ms |
| `QRSV2` | 1–40 mm |
| `RV4` | 0–30 mm |
| `STE60V3` | 0–5 mm (formula not validated above 5 mm — exclusion criterion) |

---

## 3. Calculation

### Formula

```
Value = 0.052 × QTc
      − 0.151 × QRSV2
      − 0.268 × RV4
      + 1.062 × STE60V3
```

Units: `QTc` in ms; `QRSV2`, `RV4`, `STE60V3` in mm. The output `Value` is unitless.

> **Coefficient verification note:** The coefficients above (0.052, 0.151, 0.268, 1.062) and the cut-point of 18.2 reflect the values published by Driver BE, Khalil A, Henry T, Kazmi F, Adil A, Smith SW. *Am J Emerg Med* 2017 and reproduced on MDCalc (calc/10079). MDCalc confirmed the four input variables, units, and exclusion criteria during specification but did not expose the numeric coefficients in the public landing page (these are computed server-side). Implementers SHOULD cross-check the exact coefficient values against the primary publication before clinical deployment — `TBD — see Driver et al. 2017` if any value is contested.

### Coefficient table

| Term | Coefficient | Sign | Interpretation |
|------|-------------|------|----------------|
| Intercept | 0 (none) | — | No constant term in the published model. |
| `QTc` | +0.052 | positive | Longer QTc → higher score → more suspicious for LAD occlusion. |
| `QRSV2` | −0.151 | negative | Larger QRS amplitude in V2 → lower score → favors BER. |
| `RV4` | −0.268 | negative | Taller R in V4 → lower score → favors BER. |
| `STE60V3` | +1.062 | positive | More ST elevation at J+60 ms in V3 → higher score → more suspicious for LAD occlusion. |

### Worked example

Inputs: `QTc = 420 ms`, `QRSV2 = 10 mm`, `RV4 = 12 mm`, `STE60V3 = 2 mm`.

```
Value = 0.052(420) − 0.151(10) − 0.268(12) + 1.062(2)
      = 21.84 − 1.51 − 3.216 + 2.124
      = 19.238
```

`19.238 ≥ 18.2` → **Smith-positive** → likely LAD occlusion.

---

## 4. Output & Interpretation

### Threshold

| Score | Interpretation | Action |
|-------|----------------|--------|
| `Value ≥ 18.2` | **Smith-positive** — likely subtle anterior STEMI / LAD occlusion. | Activate cath lab in appropriate clinical context (chest pain consistent with ACS, no clear alternative cause). Continue standard ACS management. |
| `Value < 18.2` | **Smith-negative** — favors benign early repolarization. | Does **not** rule out LAD occlusion. If clinical suspicion remains, obtain serial ECGs every 15–30 minutes, troponin, and consider alternative diagnoses. The formula is a decision aid, not a rule-out. |

### Reported diagnostic performance (Driver et al. 2017 derivation cohort)

| Metric | Value at cut-point ≥ 18.2 | Note |
|--------|---------------------------|------|
| Sensitivity | ~ 83.3 % (TBD — see Driver et al. 2017) | For LAD occlusion vs BER. |
| Specificity | ~ 87.7 % (TBD — see Driver et al. 2017) | |
| Improvement over 3-variable formula | Higher accuracy, particularly for cases with large QRS amplitudes in V2. | |

### Output schema (implementation-ready)

```json
{
  "score": 19.24,
  "threshold": 18.2,
  "smith_positive": true,
  "interpretation": "Likely LAD occlusion (subtle anterior STEMI). Cath lab activation appropriate in correct clinical context.",
  "preconditions_met": true,
  "exclusions_present": []
}
```

### Reference values for typical patient populations (illustrative)

| Pattern | Typical score range | Notes |
|---------|---------------------|-------|
| Classic BER (young, athletic, J-waves, tall R in V4) | 14–17 | Negative. |
| Borderline | 17–19 | Repeat ECG, troponin, consider POCUS for wall motion. |
| Subtle LAD occlusion | ≥ 18.2, often 19–22 | Activate cath lab if clinically consistent. |

---

## 5. References

### Primary publication

- **Driver BE, Khalil A, Henry T, Kazmi F, Adil A, Smith SW.** A new 4-variable formula to differentiate normal variant ST segment elevation in V2–V4 (early repolarization) from subtle left anterior descending coronary occlusion — Adding QRS amplitude of V2 improves the model. *American Journal of Emergency Medicine* 2017; 35(4): 561–565.
  - DOI: `10.1016/j.ajem.2016.12.014` (TBD — verify)
  - PMID: TBD — see Driver et al. 2017

### Predecessor (3-variable formula)

- **Smith SW, Khalil A, Henry TD, et al.** Electrocardiographic differentiation of early repolarization from subtle anterior ST-segment elevation myocardial infarction. *Annals of Emergency Medicine* 2012; 60(1): 45–56.e2.

### Online references / calculators

- **MDCalc — Subtle Anterior STEMI Calculator (4-Variable):** https://www.mdcalc.com/calc/10079/subtle-anterior-stemi-calculator-4-variable
- **Dr. Smith's ECG Blog** (clinical commentary and case examples): https://hqmeded-ecg.blogspot.com/

### Clinical context

The 4-variable formula is intended as a **decision aid** in patients with non-diagnostic precordial ST elevation and a clinical picture consistent with ACS. It does not replace clinical judgement, serial ECG monitoring, troponin trends, or echocardiographic assessment of regional wall motion.
