# T-MACS — Troponin-only Manchester Acute Coronary Syndromes Decision Aid

Implementation specification for the T-MACS decision aid (Body et al., *Emerg Med J* 2017).

---

## 1. Purpose

T-MACS is a computer-based clinical decision aid that estimates the probability of acute coronary syndrome (ACS) within 30 days for patients presenting to the Emergency Department with suspected cardiac chest pain.

It uses a **single high-sensitivity cardiac troponin T (hs-cTnT) measurement on arrival** combined with six binary clinical features. The output probability stratifies patients into four risk bands enabling early "rule out" (very low risk) or "rule in" (high risk) decisions following a single blood test.

- **Outcome modelled**: ACS, defined as prevalent acute myocardial infarction (AMI) or incident death / AMI / coronary revascularisation within 30 days.
- **Setting**: Adult ED patients with suspected cardiac chest pain warranting investigation for possible ACS.
- **Assay**: Roche Diagnostics Elecsys hs-cTnT (5th generation; 99th percentile 14 ng/L). Performance with other troponin assays is not established.
- **Caveat**: T-MACS is assistive, not directive; it must be used alongside, not instead of, clinical judgement.

---

## 2. Inputs

| Symbol | Variable                                       | Type        | Encoding / Units                          | Notes                                                                                          |
|--------|------------------------------------------------|-------------|-------------------------------------------|------------------------------------------------------------------------------------------------|
| `T`    | hs-cTnT concentration on arrival               | Continuous  | ng/L (Roche Elecsys 5th-gen hs-cTnT)      | Single measurement at ED arrival. Fitted as continuous linear predictor.                       |
| `E`    | ECG ischaemia                                  | Dichotomous | 1 = yes, 0 = no                           | As interpreted by the treating clinician on the initial ED ECG.                                |
| `A`    | Worsening (crescendo) angina                   | Dichotomous | 1 = yes, 0 = no                           | Anginal pain with increasing frequency, occurring with less exertion, or becoming more prolonged. |
| `R`    | Pain radiating to the right arm or shoulder    | Dichotomous | 1 = yes, 0 = no                           | Per patient history.                                                                           |
| `V`    | Vomiting in association with the chest pain   | Dichotomous | 1 = yes, 0 = no                           | Reported by patient.                                                                           |
| `S`    | Sweating (diaphoresis) observed                | Dichotomous | 1 = yes, 0 = no                           | Observed by the treating clinician (not patient-reported).                                     |
| `H`    | Hypotension — systolic BP < 100 mmHg on arrival | Dichotomous | 1 = yes, 0 = no                           | First systolic BP recorded on ED arrival.                                                      |

Missing-data policy: in the original derivation/validation < 3% missing per variable; complete-case analysis was used. Implementations should require all seven inputs.

---

## 3. Calculation

### 3.1 Logistic regression model

The probability `p` of ACS is estimated by a binary logistic regression:

```
ln(p / (1 - p)) = β0 + β_E·E + β_A·A + β_R·R + β_V·V + β_S·S + β_H·H + β_T·T
```

Equivalently:

```
p = 1 / (1 + exp(-(β0 + β_E·E + β_A·A + β_R·R + β_V·V + β_S·S + β_H·H + β_T·T)))
```

### 3.2 Published coefficients (Body 2017 — re-derivation)

Source: Body R et al., *Emerg Med J* 2017;34:349–356, equation on p.351.

| Term                                  | Symbol | Coefficient |
|---------------------------------------|--------|-------------|
| Intercept                             | β0     | **-4.766**  |
| ECG ischaemia                         | β_E    | **+1.713**  |
| Worsening (crescendo) angina          | β_A    | **+0.847**  |
| Pain radiating to right arm/shoulder  | β_R    | **+0.607**  |
| Vomiting with pain                    | β_V    | **+1.417**  |
| Sweating observed                     | β_S    | **+2.058**  |
| Hypotension (SBP < 100 mmHg)          | β_H    | **+1.208**  |
| hs-cTnT (per ng/L)                    | β_T    | **+0.089**  |

Closed-form expression (rounded values, as published):

```
p = 1 / (1 + exp(-(1.713·E + 0.847·A + 0.607·R + 1.417·V + 2.058·S + 1.208·H + 0.089·T - 4.766)))
```

> **Assay note.** β_T = 0.089 is calibrated to the **Roche Elecsys 5th-generation hs-cTnT** assay (99th-percentile 14 ng/L). Recalibration is required for other troponin assays — see Future directions in Body 2017.

### 3.3 Reference implementation (Python)

```python
from math import exp

def t_macs_probability(
    hs_ctnt_ng_l: float,
    ecg_ischaemia: bool,
    worsening_angina: bool,
    pain_radiating_right_arm_shoulder: bool,
    vomiting_with_pain: bool,
    sweating_observed: bool,
    sbp_lt_100: bool,
) -> float:
    """Compute the T-MACS probability of ACS within 30 days.

    Coefficients from Body R et al., Emerg Med J 2017;34:349-356.
    Calibrated to the Roche Elecsys 5th-generation hs-cTnT assay.
    """
    linear = (
        -4.766
        + 1.713 * ecg_ischaemia
        + 0.847 * worsening_angina
        + 0.607 * pain_radiating_right_arm_shoulder
        + 1.417 * vomiting_with_pain
        + 2.058 * sweating_observed
        + 1.208 * sbp_lt_100
        + 0.089 * hs_ctnt_ng_l
    )
    return 1.0 / (1.0 + exp(-linear))
```

---

## 4. Output — Risk Stratification

The probability `p` is mapped to one of four risk bands (cut-points as published in Body 2017):

| Band         | Probability `p` range     | Interpretation                                                                                            | Suggested disposition                                                                                       |
|--------------|---------------------------|-----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Very low risk | `p < 0.02`               | ACS effectively "ruled out".                                                                              | Consider discharge from ED after a single blood test.                                                       |
| Low risk      | `0.02 ≤ p < 0.05`        | ACS unlikely but not excluded.                                                                            | Continue with serial cardiac troponin testing in a low-dependency environment (e.g. ED observation ward).   |
| Moderate risk | `0.05 ≤ p < 0.95`        | "Observational zone" — diagnostic uncertainty.                                                            | Ongoing investigation with serial troponin sampling on a general / acute medical ward.                      |
| High risk     | `p ≥ 0.95`               | ACS effectively "ruled in".                                                                               | Refer for cardiology assessment / treatment per local ACS pathway.                                          |

### 4.1 Reported diagnostic performance (validation set, n = 1459)

| Threshold use            | Metric                          | Value (95% CI)                |
|--------------------------|---------------------------------|-------------------------------|
| Rule out (very low risk) | Sensitivity for ACS             | 98.1% (95.2–99.5)             |
| Rule out (very low risk) | Negative predictive value (ACS) | 99.3% (98.3–99.8)             |
| Rule out (very low risk) | Specificity                     | 47.0% (44.2–49.8)             |
| Rule in (high risk)      | Positive predictive value (ACS) | 84.0% (73.7–91.5)             |
| Overall                  | AUC (validation)                | 0.90                          |
| Patients ruled out       | Proportion                      | 40.4% (n = 590 / 1459)        |
| Patients ruled in        | Proportion                      | 4.7%  (n = 69  / 1459)        |

### 4.2 Output schema (suggested)

```json
{
  "probability": 0.0123,
  "risk_band": "very_low",
  "risk_band_label": "Very low risk — ACS ruled out",
  "thresholds": { "very_low": 0.02, "low": 0.05, "high": 0.95 },
  "model": "T-MACS (Body 2017)",
  "assay": "Roche Elecsys hs-cTnT 5th generation"
}
```

---

## 5. References

### Primary publications

1. **Body R, Carlton E, Sperrin M, Lewis PS, Burrows G, Carley S, McDowell G, Buchan I, Greaves K, Mackway-Jones K.**
   Troponin-only Manchester Acute Coronary Syndromes (T-MACS) decision aid: single biomarker re-derivation and external validation in three cohorts.
   *Emergency Medicine Journal* 2017;34(6):349–356. doi:10.1136/emermed-2016-205983.
   <https://emj.bmj.com/content/34/6/349>
   *(Source of the published coefficients used in this spec.)*

2. **Body R, Carley S, McDowell G, Pemberton P, Burrows G, Cook G, Lewis PS, Smith A, Mackway-Jones K.**
   The Manchester Acute Coronary Syndromes (MACS) decision rule for suspected cardiac chest pain: derivation and external validation.
   *Heart* 2014;100(18):1462–1468. doi:10.1136/heartjnl-2014-305564.
   *(Original MACS model — predecessor including H-FABP.)*

3. **Body R, Burrows G, Carley S, Cullen L, Than M, Jaffe AS, Lewis PS.**
   The Manchester Acute Coronary Syndromes (MACS) decision rule: validation with a new automated assay for heart-type fatty acid binding protein.
   *Emergency Medicine Journal* 2015;32(10):769–774.

### Calculator references

- MDCalc — Troponin-only Manchester Acute Coronary Syndromes (T-MACS) Decision Aid:
  <https://www.mdcalc.com/calc/3942/troponin-manchester-acute-coronary-syndromes-t-macs-decision-aid>
- Open-access full text (Manchester Met. University e-space):
  <https://e-space.mmu.ac.uk/617664/>
