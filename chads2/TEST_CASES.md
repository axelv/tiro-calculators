# CHADS₂ — Fictional Test Cases

Five fictional test cases for the **CHADS₂ score** (Gage 2001) — annual ischaemic-stroke risk in non-valvular atrial fibrillation. Score range 0 – 6.

Point weights: CHF 1, Hypertension 1, Age ≥ 75 1, Diabetes 1, **Prior stroke / TIA / TE 2**.

Adjusted annual stroke rates (Gage 2001, Table 3):

| Score | % / year | 95 % CI | Band |
|---:|---:|:---:|:---|
| 0 | 1.9 | 1.2 – 3.0 | Low |
| 1 | 2.8 | 2.0 – 3.8 | Low–moderate |
| 2 | 4.0 | 3.1 – 5.1 | Moderate |
| 3 | 5.9 | 4.6 – 7.3 | High |
| 4 | 8.5 | 6.3 – 11.1 | High |
| 5 | 12.5 | 8.2 – 17.5 | Very high |
| 6 | 18.2 | 10.5 – 27.4 | Very high |

---

## Test case 1 — Score 0 (low risk, edge case at minimum)

**Vignette.** Mr. Cyril Beaumont-Hayashi, a 60-year-old male with newly diagnosed paroxysmal AF detected on routine ECG. No history of CHF, no hypertension, no diabetes, no prior stroke or TIA. He is the minimum-score exemplar.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| `chf` | false | 0 |
| `hypertension` | false | 0 |
| `age_ge_75` | false (60) | 0 |
| `diabetes` | false | 0 |
| `stroke_tia` | false | 0 |

**Calculation.** 0 + 0 + 0 + 0 + 0 = **0**.

**Expected output**

- `score`: 0 (minimum)
- Adjusted annual stroke risk: **1.9 %** (95 % CI 1.2 – 3.0)
- `risk_band`: low
- Recommendation: no antithrombotic therapy preferred. **Re-stratify with CHA₂DS₂-VASc** before withholding therapy; aspirin acceptable in selected patients. (Per SPEC: a CHADS₂ of 0 is not by itself sufficient evidence of low risk.)

---

## Test case 2 — Score 1 (low–moderate)

**Vignette.** Mrs. Hildegard Lindquist-Patel, a 64-year-old female with persistent AF and treated essential hypertension. No diabetes, no heart failure, no prior cerebrovascular event.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| `chf` | false | 0 |
| `hypertension` | true | 1 |
| `age_ge_75` | false (64) | 0 |
| `diabetes` | false | 0 |
| `stroke_tia` | false | 0 |

**Calculation.** 0 + 1 + 0 + 0 + 0 = **1**.

**Expected output**

- `score`: 1
- Adjusted annual stroke risk: **2.8 %** (95 % CI 2.0 – 3.8)
- `risk_band`: low–moderate
- Recommendation: oral anticoagulant **or** aspirin; OAC generally preferred. Re-stratify with CHA₂DS₂-VASc.

---

## Test case 3 — Score 2 (moderate, threshold for full OAC)

**Vignette.** Mr. Olumide Akande-Petrov, a 78-year-old male with permanent AF and treated hypertension. No diabetes, no heart failure, no prior stroke. Despite only two clinical features, the age criterion alone plus hypertension lands him at the cut-off.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| `chf` | false | 0 |
| `hypertension` | true | 1 |
| `age_ge_75` | true (78) | 1 |
| `diabetes` | false | 0 |
| `stroke_tia` | false | 0 |

**Calculation.** 0 + 1 + 1 + 0 + 0 = **2**.

**Expected output**

- `score`: 2
- Adjusted annual stroke risk: **4.0 %** (95 % CI 3.1 – 5.1)
- `risk_band`: moderate (high per the SPEC's antithrombotic table — ≥ 2 triggers full anticoagulation)
- Recommendation: **oral anticoagulation recommended** (DOAC preferred over warfarin in non-valvular AF, unless contraindicated). Pair with bleeding-risk assessment (HAS-BLED).

---

## Test case 4 — Score 4 (high risk, multiple comorbidities)

**Vignette.** Mrs. Béatrice Ostrowski-Fitzgerald, a 79-year-old female with permanent AF, HFpEF, longstanding hypertension, and type 2 diabetes on insulin. No prior stroke or TIA. Multiple clinical risk factors but no cerebrovascular history.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| `chf` | true (HFpEF) | 1 |
| `hypertension` | true | 1 |
| `age_ge_75` | true (79) | 1 |
| `diabetes` | true | 1 |
| `stroke_tia` | false | 0 |

**Calculation.** 1 + 1 + 1 + 1 + 0 = **4**.

**Expected output**

- `score`: 4
- Adjusted annual stroke risk: **8.5 %** (95 % CI 6.3 – 11.1)
- `risk_band`: high
- Recommendation: **oral anticoagulation recommended** (DOAC preferred). Concomitant HAS-BLED assessment to identify modifiable bleeding risk factors.

---

## Test case 5 — Edge case: maximum score 6 (very high risk)

**Vignette.** Mr. Eustace Pemberton-Sokolova, an 82-year-old male with permanent AF, HFrEF (LVEF 28 %), longstanding hypertension, type 2 diabetes, and a previous embolic stroke 14 months ago with mild residual hemiparesis. He is the CHADS₂ maximum-score exemplar.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| `chf` | true (HFrEF) | 1 |
| `hypertension` | true | 1 |
| `age_ge_75` | true (82) | 1 |
| `diabetes` | true | 1 |
| `stroke_tia` | true (prior embolic stroke) | 2 |

**Calculation.** 1 + 1 + 1 + 1 + 2 = **6** (maximum).

**Expected output**

- `score`: 6 (maximum)
- Adjusted annual stroke risk: **18.2 %** (95 % CI 10.5 – 27.4)
- `risk_band`: very high
- Recommendation: **oral anticoagulation recommended** (DOAC preferred unless contraindicated). Prior stroke alone (S₂ = 2) is an independent indication for indefinite anticoagulation; the additional comorbidities mark this patient as the highest-risk band on the CHADS₂ table. Pair with HAS-BLED to flag modifiable bleeding risks; a high HAS-BLED score is **not** a contraindication to OAC.
