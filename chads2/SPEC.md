# CHADS₂ Score for Atrial Fibrillation Stroke Risk

A clinical prediction rule for estimating the annual risk of ischaemic stroke in
patients with non-valvular atrial fibrillation (AF). Originally derived and
validated by Gage et al. (JAMA, 2001) using the National Registry of Atrial
Fibrillation cohort.

---

## 1. Purpose

CHADS₂ is used by clinicians to:

- **Risk-stratify** patients with non-valvular atrial fibrillation (paroxysmal,
  persistent, or permanent) for thromboembolic stroke.
- **Inform the decision** to start, withhold, or escalate antithrombotic
  (antiplatelet vs. oral anticoagulant) therapy.
- Provide a **quick bedside score** (5 binary inputs, integer total 0–6) that
  can be computed without lab values.

**Patient population** — adults with documented non-valvular atrial
fibrillation. Not validated for valvular AF (e.g. moderate-to-severe mitral
stenosis, mechanical prosthetic valves), in which oral anticoagulation is
indicated regardless of score.

**Caveats** — CHADS₂ has been largely superseded in current guidelines (ESC,
AHA/ACC/HRS) by **CHA₂DS₂-VASc**, which better discriminates truly low-risk
patients (score 0). CHADS₂ remains in use for legacy datasets, certain
registries, and as a teaching/screening tool. A CHADS₂ of 0 is **not** by
itself sufficient evidence of low risk — re-stratify with CHA₂DS₂-VASc.

---

## 2. Inputs

All inputs are independent binary (yes/no) clinical history items. None require
laboratory values.

| Field key | Display name | Type | Clinical definition |
|---|---|---|---|
| `chf` | Congestive heart failure history | boolean | History of heart failure (any ejection fraction), or current signs/symptoms of decompensated HF, or recent HF hospitalisation. |
| `hypertension` | Hypertension history | boolean | Prior diagnosis of hypertension, or resting BP > 140/90 mmHg on at least two occasions, or currently treated with antihypertensive medication. |
| `age_ge_75` | Age ≥ 75 years | boolean | Patient's age at the time of assessment is 75 years or older. |
| `diabetes` | Diabetes mellitus history | boolean | Prior diagnosis of type 1 or type 2 diabetes, fasting glucose > 125 mg/dL (7.0 mmol/L), or on glucose-lowering pharmacotherapy. |
| `stroke_tia` | Prior stroke or TIA (or thromboembolism) | boolean | Any history of ischaemic stroke, transient ischaemic attack, or systemic thromboembolism. |

Implementation note: each input must be strictly boolean. Missing values should
not be silently coerced to `false`; surface a validation error and require the
caller to confirm absence vs. unknown.

---

## 3. Calculation

The CHADS₂ acronym encodes the point weighting:
**C**HF (1) · **H**ypertension (1) · **A**ge ≥ 75 (1) · **D**iabetes (1) ·
**S**troke/TIA (**2**).

| Condition | Points if present |
|---|---|
| CHF history | **+1** |
| Hypertension history | **+1** |
| Age ≥ 75 years | **+1** |
| Diabetes mellitus | **+1** |
| Prior stroke / TIA / thromboembolism | **+2** |

```
CHADS2 = chf + hypertension + age_ge_75 + diabetes + 2 * stroke_tia
```

Total score is an integer in the closed range **[0, 6]**.

---

## 4. Output

### 4.1 Total score

Integer, 0 to 6 inclusive.

### 4.2 Adjusted annual stroke risk

Per Gage BF et al., *JAMA* 2001;285(22):2864–2870, Table 3 (adjusted stroke
rate per 100 patient-years, NRAF cohort, patients not on warfarin).

| CHADS₂ score | Adjusted annual stroke risk (% / year) | 95% CI | Risk band |
|:-:|:-:|:-:|:-:|
| 0 | 1.9 | 1.2 – 3.0 | Low |
| 1 | 2.8 | 2.0 – 3.8 | Low–moderate |
| 2 | 4.0 | 3.1 – 5.1 | Moderate |
| 3 | 5.9 | 4.6 – 7.3 | High |
| 4 | 8.5 | 6.3 – 11.1 | High |
| 5 | 12.5 | 8.2 – 17.5 | Very high |
| 6 | 18.2 | 10.5 – 27.4 | Very high |

### 4.3 Recommended antithrombotic strategy

The original CHADS₂ paper did not itself prescribe a treatment algorithm; the
recommendations below summarise the historical ACCP/AHA guidance that paired
with CHADS₂ before the adoption of CHA₂DS₂-VASc. For modern clinical decisions,
defer to current local guidelines (e.g. ESC 2024, AHA/ACC/HRS 2023).

| CHADS₂ score | Risk category | Suggested antithrombotic strategy |
|:-:|---|---|
| 0 | Low | No antithrombotic therapy preferred. **Re-stratify with CHA₂DS₂-VASc** before withholding therapy; aspirin acceptable in selected patients. |
| 1 | Intermediate | Oral anticoagulant **or** aspirin; oral anticoagulation generally preferred. Re-stratify with CHA₂DS₂-VASc. |
| ≥ 2 | High | **Oral anticoagulation** recommended (DOAC preferred over warfarin in non-valvular AF, unless contraindicated). |

In every case, weigh stroke risk against bleeding risk using a complementary
score (HAS-BLED, ATRIA, or HEMORR₂HAGES) and the patient's preferences.

### 4.4 Output schema (implementation reference)

```json
{
  "score": 3,
  "annual_stroke_risk_percent": 5.9,
  "annual_stroke_risk_ci": [4.6, 7.3],
  "risk_band": "high",
  "recommendation": "Oral anticoagulation recommended"
}
```

---

## 5. References

1. **Gage BF, Waterman AD, Shannon W, Boechler M, Rich MW, Radford MJ.**
   Validation of clinical classification schemes for predicting stroke: results
   from the National Registry of Atrial Fibrillation.
   *JAMA.* 2001;285(22):2864–2870.
   doi:10.1001/jama.285.22.2864.
   https://jamanetwork.com/journals/jama/fullarticle/193912

2. **MDCalc — CHADS₂ Score for Atrial Fibrillation Stroke Risk.**
   https://www.mdcalc.com/calc/40/chads2-score-atrial-fibrillation-stroke-risk

3. **Gage BF, van Walraven C, Pearce L, et al.** Selecting patients with atrial
   fibrillation for anticoagulation: stroke risk stratification in patients
   taking aspirin. *Circulation.* 2004;110(16):2287–2292.
   doi:10.1161/01.CIR.0000145172.55640.93.

4. **Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM.** Refining clinical
   risk stratification for predicting stroke and thromboembolism in atrial
   fibrillation using a novel risk factor-based approach: the Euro Heart Survey
   on Atrial Fibrillation. *Chest.* 2010;137(2):263–272.
   doi:10.1378/chest.09-1584.
   *(Source for the CHA₂DS₂-VASc refinement that has largely superseded
   CHADS₂.)*
