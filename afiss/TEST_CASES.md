# AFISS (SAFE Score) — Fictional Test Cases

Five fictional ICU-day test cases for the **AFISS / SAFE score** (24-h new-onset atrial fibrillation prediction in critically ill septic patients). All cases assume the patient is at-risk (no prior AF, still in ICU, within the 7-day prediction window).

> **Important caveat from SPEC.md.** AFISS is a 10-variable logistic-regression model; the **exact β coefficients and the simplified points table are flagged `TBD — see source` in the spec** (Klein Klouwenberg 2017 supplement / authors' Shiny calculator). A precise probability cannot be computed from SPEC.md alone. The expected outcomes below are therefore expressed as the **suggested operational tier** from §4.2 of the spec (Low < 5 %, Moderate 5–15 %, High ≥ 15 %), with a qualitative justification anchored on the directionality of each predictor as published in Klein Klouwenberg 2017 (older age, higher BMI, immunocompromise, septic shock, vasopressors, higher CRP/WBC, renal failure, deranged K⁺, higher FiO₂ all push probability up).
>
> Implementations that have ingested the exact coefficients should replace the qualitative tier with the numeric probability returned by the model.

---

## Test case 1 — Low risk (young, mild sepsis, room air)

**Vignette.** Mr. Liam O'Sullivan-Park, a 32-year-old previously healthy software engineer, is admitted to ICU with community-acquired *E. coli* pyelonephritis and bacteraemia. He is on IV antibiotics and IV fluids, requires no vasopressors, and is breathing room air on ICU day 1.

**Inputs**

| # | Variable | Value |
|---|----------|-------|
| 1 | Age | 32 years |
| 2 | BMI | 23 kg/m² |
| 3 | Immunocompromised | No |
| 4 | Septic shock | No |
| 5 | Vasopressor / inotrope use | No |
| 6 | CRP | 95 mg/L |
| 7 | WBC | 12.0 × 10⁹/L |
| 8 | Renal failure (KDIGO / SOFA renal) | No |
| 9 | Potassium | 4.1 mmol/L |
| 10 | FiO₂ | 0.21 |

**Reasoning.** Every binary risk factor is absent; continuous predictors are normal or only mildly elevated. All variable contributions favour a low predicted probability.

**Expected output**

- Predicted 24-h NOAF probability: **< 5 %** (qualitative — "**Low**" operational tier).
- Suggested clinical posture: routine telemetry; no specific AF prophylaxis. Rescore tomorrow.

---

## Test case 2 — Moderate risk (middle-aged, septic shock, single vasopressor)

**Vignette.** Mrs. Aiko Tanaka-Bergeron, a 58-year-old with type 2 diabetes, is admitted with cholangitis-related septic shock following ERCP. On ICU day 2 she is on low-dose norepinephrine and BiPAP, with a moderately elevated inflammatory marker profile.

**Inputs**

| # | Variable | Value |
|---|----------|-------|
| 1 | Age | 58 years |
| 2 | BMI | 28 kg/m² |
| 3 | Immunocompromised | No |
| 4 | Septic shock | Yes |
| 5 | Vasopressor / inotrope use | Yes (norepinephrine) |
| 6 | CRP | 220 mg/L |
| 7 | WBC | 18 × 10⁹/L |
| 8 | Renal failure | No |
| 9 | Potassium | 4.6 mmol/L |
| 10 | FiO₂ | 0.40 |

**Reasoning.** Several adverse binary features (shock, vasopressor) plus moderately elevated CRP/WBC and supplemental O₂. Renal function is preserved and the patient is not immunocompromised, so probability rises into the middle band rather than the top band.

**Expected output**

- Predicted 24-h NOAF probability: **5 – 15 %** (qualitative — "**Moderate**" operational tier).
- Suggested clinical posture: continued telemetry, electrolyte optimisation (K⁺, Mg²⁺), reassess daily.

---

## Test case 3 — High risk (elderly, immunocompromised, multi-organ failure)

**Vignette.** Mr. Reginald Ashcroft-Müller, a 78-year-old with stage IV diffuse large B-cell lymphoma on R-CHOP, is admitted to ICU on chemotherapy day 9 with neutropenic septic shock from pseudomonal pneumonia. On day 3 he is intubated, on noradrenaline + vasopressin, and on CRRT.

**Inputs**

| # | Variable | Value |
|---|----------|-------|
| 1 | Age | 78 years |
| 2 | BMI | 31 kg/m² |
| 3 | Immunocompromised | Yes (chemotherapy) |
| 4 | Septic shock | Yes |
| 5 | Vasopressor / inotrope use | Yes (norepinephrine + vasopressin) |
| 6 | CRP | 380 mg/L |
| 7 | WBC | 0.5 × 10⁹/L (neutropenic — extreme low; deviation from "normal") |
| 8 | Renal failure | Yes (on CRRT) |
| 9 | Potassium | 5.4 mmol/L |
| 10 | FiO₂ | 0.80 |

**Reasoning.** Almost every adverse predictor is present: advanced age, high BMI, immunocompromise, septic shock, two vasopressors, very high CRP, renal failure on RRT, hyperkalaemia, and high FiO₂. (WBC is extremely low rather than high; the model uses WBC as a continuous predictor in either direction relative to the cohort mean — overall the constellation is dominated by the strongly adverse other features.)

**Expected output**

- Predicted 24-h NOAF probability: **≥ 15 %** (qualitative — "**High**" operational tier).
- Suggested clinical posture: heightened monitoring; consider trial enrolment / proactive triggers for early rate-control if AF develops.

---

## Test case 4 — Mid-range / borderline case

**Vignette.** Ms. Priya Devarakonda-Schmidt, a 67-year-old with well-controlled hypertension, is on ICU day 4 after surgery for a perforated diverticulitis with secondary peritonitis. She is currently weaning from low-dose noradrenaline; CRP is falling, WBC trending down. She is on a small amount of supplemental O₂ via face mask.

**Inputs**

| # | Variable | Value |
|---|----------|-------|
| 1 | Age | 67 years |
| 2 | BMI | 26 kg/m² |
| 3 | Immunocompromised | No |
| 4 | Septic shock | No (resolved) |
| 5 | Vasopressor / inotrope use | Yes (low-dose, weaning) |
| 6 | CRP | 110 mg/L |
| 7 | WBC | 13 × 10⁹/L |
| 8 | Renal failure | No |
| 9 | Potassium | 3.8 mmol/L |
| 10 | FiO₂ | 0.35 |

**Reasoning.** Mixed picture — older age and ongoing low-dose vasopressor push probability up; resolved shock, normal K⁺ and renal function, and improving inflammation pull it down. Sits squarely in the middle of the suggested-tier band.

**Expected output**

- Predicted 24-h NOAF probability: **5 – 15 %** (qualitative — "**Moderate**" operational tier).
- Suggested clinical posture: continued telemetry, electrolyte optimisation, reassess tomorrow; rescore daily as recommended by the spec.

---

## Test case 5 — Edge case (very low risk, near floor of the predictor space)

**Vignette.** Mrs. Sofie Andersen, a 24-year-old previously healthy student-nurse, is admitted briefly to a medical ICU for monitoring after a *Listeria*-positive blood culture detected on routine work-up; she is haemodynamically stable, asymptomatic by ICU day 1, and on oral antibiotics. She represents the practical floor of the AFISS predictor space.

**Inputs**

| # | Variable | Value |
|---|----------|-------|
| 1 | Age | 24 years |
| 2 | BMI | 21 kg/m² |
| 3 | Immunocompromised | No |
| 4 | Septic shock | No |
| 5 | Vasopressor / inotrope use | No |
| 6 | CRP | 30 mg/L |
| 7 | WBC | 8 × 10⁹/L |
| 8 | Renal failure | No |
| 9 | Potassium | 4.2 mmol/L |
| 10 | FiO₂ | 0.21 |

**Reasoning.** All binary risk factors are absent; continuous variables are within or near the population reference range. This case sits at the favourable extreme of the AFISS feature space and should produce the lowest probabilities the model returns.

**Expected output**

- Predicted 24-h NOAF probability: **< 5 %** (qualitative — "**Low**" operational tier; expected to be near the model floor).
- Suggested clinical posture: routine telemetry; no AF-specific intervention. Rescore daily until the patient leaves ICU or 7-day prediction window expires.
