# TIMI Risk Index (TRI)

Quick bedside mortality estimation in Acute Coronary Syndrome (ACS) using only
heart rate, systolic blood pressure, and age.

Authoritative reference: [MDCalc — TIMI Risk Index](https://www.mdcalc.com/calc/665/timi-risk-index)
Primary publication: Morrow DA, Antman EM, Giugliano RP, et al. A simple risk
index for rapid initial triage of patients with ST-elevation myocardial
infarction: an InTIME II substudy. *Lancet* 2001;358:1571-1575. (Subsequent
JAMA 2001;286:1356-1359 communication; see References.)

---

## 1. Purpose

The **TIMI Risk Index (TRI)** provides a rapid, bedside, parameter-light
estimate of short-term (24-hour and 30-day) mortality in patients presenting
with Acute Coronary Syndrome (ACS), including ST-Elevation Myocardial
Infarction (STEMI) and Unstable Angina / Non-ST-Elevation MI (UA/NSTEMI).

Key properties:

- Uses only routinely captured admission vitals plus age — **no labs, no ECG
  interpretation, no history required**.
- Designed for triage when more comprehensive scores (TIMI Risk Score for
  STEMI, GRACE) cannot be computed quickly.
- Mortality estimate informs decisions on **level of care** (ICU vs ward) and
  **intensity of treatment** (e.g. early invasive strategy, aggressive
  reperfusion).

> Limitation: TRI is a **triage aid**, not a substitute for a full risk score
> (e.g. TIMI Risk Score, GRACE) or clinical judgement. Discrimination
> (c-statistic ≈ 0.78 in derivation; ~0.74 on external validation) is good but
> not superior to multi-variable scores.

---

## 2. Inputs

| Field         | Type    | Unit  | Range (typical) | Notes                                          |
| ------------- | ------- | ----- | --------------- | ---------------------------------------------- |
| `heart_rate`  | integer | bpm   | 30 – 200        | Admission heart rate (resting, supine).        |
| `systolic_bp` | integer | mmHg  | 50 – 250        | Admission systolic blood pressure. Must be > 0.|
| `age`         | integer | years | 18 – 110        | Patient age at presentation.                   |

### Validation rules

- `systolic_bp > 0` — required (denominator); reject or flag SBP = 0.
- All three inputs are **required**; no imputation.
- Reject negative values; clamp obviously implausible values per local policy
  (e.g. HR < 20 or > 250) but compute as supplied otherwise.

---

## 3. Calculation

### Formula

```
TRI = ( HR × (Age / 10)² ) / SBP
```

Where:

- `HR` = heart rate in beats per minute
- `Age` = age in years
- `SBP` = systolic blood pressure in mmHg

### Reference implementation (Python)

```python
def timi_risk_index(heart_rate: int, age: int, systolic_bp: int) -> float:
    """Compute the TIMI Risk Index.

    Args:
        heart_rate: Admission heart rate in bpm. Must be > 0.
        age: Patient age in years. Must be > 0.
        systolic_bp: Admission systolic blood pressure in mmHg. Must be > 0.

    Returns:
        TRI value (unitless), rounded by the caller as appropriate.

    Raises:
        ValueError: if any input is non-positive.
    """
    if heart_rate <= 0 or age <= 0 or systolic_bp <= 0:
        raise ValueError("heart_rate, age and systolic_bp must all be > 0")
    return (heart_rate * (age / 10) ** 2) / systolic_bp
```

### Worked example

Patient: 72-year-old, HR 95 bpm, SBP 110 mmHg.

```
TRI = (95 × (72/10)²) / 110
    = (95 × 51.84) / 110
    = 4924.8 / 110
    ≈ 44.8
```

Per the strata in §4, this places the patient in the **highest-risk quintile**
(TRI > ~30), corresponding to ~17% 30-day mortality in the original STEMI
derivation cohort.

---

## 4. Output and Interpretation

### 4.1 Quintile stratification (STEMI — InTIME II derivation cohort)

The derivation paper (Morrow et al., *Lancet* 2001) divided the InTIME II
fibrinolytic-treated STEMI cohort into quintiles by TRI value. 30-day
mortality rose monotonically across quintiles.

| Quintile | TRI range (approx.) | 24-hour mortality | 30-day mortality |
| -------- | ------------------- | ----------------- | ---------------- |
| Q1 (lowest)  | < 12.5    | 0.4%   | 0.8%   |
| Q2           | 12.5 – 17.5 | 0.9% | 1.9%   |
| Q3           | 17.5 – 22.5 | 1.6% | 2.9%   |
| Q4           | 22.5 – 30.0 | 3.3% | 5.5%   |
| Q5 (highest) | ≥ 30.0    | 6.9%   | 16.1%  |

> Cut-points are reported approximately in the literature; the exact
> boundaries vary slightly between source publications. Any production
> implementation should expose the cut-points as configurable constants and
> cite the source used.

### 4.2 Validation in broader ACS populations

- **NRMI-3** (n = 84,029 STEMI) — TRI showed graded mortality from ~0.6% in the
  lowest quintile to ~35.9% in the highest; c-statistic ≈ 0.74 overall, 0.79
  in fibrinolytic-treated, 0.80 in primary PCI, 0.65 in non-reperfused.
- **TIMI 11B / ESSENCE** (UA/NSTEMI) — graded 30-day mortality across TRI
  quintiles confirms applicability beyond STEMI, although absolute mortality
  rates are lower than in STEMI.

### 4.3 Clinical interpretation (suggested rendering)

| Risk band | Quintile | Suggested clinical action                                    |
| --------- | -------- | ------------------------------------------------------------ |
| Low       | Q1 – Q2  | Standard monitoring; ward-level care often appropriate.      |
| Intermediate | Q3    | Telemetry / step-down; early reperfusion strategy.           |
| High      | Q4       | Coronary care unit (CCU); aggressive guideline-directed Rx.  |
| Very high | Q5       | CCU/ICU; consider early invasive strategy and adjunctive Rx. |

> Output payload should include: numeric `tri`, `quintile` (1–5), `risk_band`
> (low/intermediate/high/very_high), and a localised `interpretation` string.
> Always render the disclaimer that TRI complements but does not replace
> full clinical assessment and guideline-recommended risk scoring.

### 4.4 Suggested API output shape

```json
{
  "calculator": "timi-risk-index",
  "version": "1.0.0",
  "inputs": { "heart_rate": 95, "age": 72, "systolic_bp": 110 },
  "result": {
    "tri": 44.8,
    "quintile": 5,
    "risk_band": "very_high",
    "mortality_30d_estimate_pct": 16.1,
    "interpretation": "Very high-risk quintile (Q5). Consider CCU/ICU level of care and early invasive strategy."
  },
  "references": ["Morrow DA et al. Lancet 2001;358:1571-1575"]
}
```

---

## 5. References

### Primary

1. **Morrow DA, Antman EM, Giugliano RP, Cairns R, Charlesworth A, Murphy SA,
   de Lemos JA, Van de Werf F, Braunwald E.** *A simple risk index for rapid
   initial triage of patients with ST-elevation myocardial infarction: an
   InTIME II substudy.* **Lancet** 2001;358(9293):1571-1575.
   doi:10.1016/S0140-6736(01)06649-1

2. **Morrow DA, Antman EM, Parsons L, et al.** *Application of the TIMI risk
   score for ST-elevation MI in the National Registry of Myocardial Infarction
   3.* **JAMA** 2001;286(11):1356-1359. doi:10.1001/jama.286.11.1356

### Validation / extension

3. **Wiviott SD, Morrow DA, Frederick PD, et al.** *Performance of the
   thrombolysis in myocardial infarction risk index in the National Registry
   of Myocardial Infarction-3 and -4: a simple index that predicts mortality
   in ST-segment elevation myocardial infarction.* **J Am Coll Cardiol**
   2004;44(4):783-789. doi:10.1016/j.jacc.2004.05.045

4. **Wiviott SD, Morrow DA, Frederick PD, et al.** *Application of the
   thrombolysis in myocardial infarction risk index in non-ST-segment elevation
   myocardial infarction: evaluation of patients in the National Registry of
   Myocardial Infarction.* **J Am Coll Cardiol** 2006;47(8):1553-1558.
   doi:10.1016/j.jacc.2005.11.078

### Online calculators

- MDCalc — TIMI Risk Index: <https://www.mdcalc.com/calc/665/timi-risk-index>
