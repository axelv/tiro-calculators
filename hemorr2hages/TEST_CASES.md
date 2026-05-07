# HEMORR₂HAGES — Fictional Test Cases

Five fictional clinical vignettes exercising the HEMORR₂HAGES bleeding-risk score (range 0–12). All inputs follow the eleven boolean fields defined in `SPEC.md` (§2). Score → bleeding-rate mapping per §4 (Gage 2006, NRAF cohort).

Field key reminder:

- `hepatic_or_renal` (H, +1)
- `ethanol_abuse` (E, +1)
- `malignancy` (M, +1)
- `age_over_75` (O, +1, strictly > 75 y)
- `reduced_platelets` (R, +1) — antiplatelet use, thrombocytopenia, or dyscrasia
- `rebleeding_risk` (R₂, **+2**) — prior major bleed
- `uncontrolled_hypertension` (H, +1) — SBP > 160 mmHg despite therapy
- `anemia` (A, +1) — Hb < 13 g/dL men / < 12 g/dL women
- `genetic_cyp2c9` (G, +1) — CYP2C9*2 / *3 SNP
- `excessive_fall_risk` (E, +1)
- `stroke_history` (S, +1)

---

## Test case 1 — Low risk (score 0)

**Vignette.** Mr. Albert Janssens, a 68-year-old retired accountant with non-valvular atrial fibrillation newly diagnosed at routine ECG. Hypertension is well controlled on perindopril (clinic SBP 132 mmHg). No prior bleed, no falls, normal Hb 14.6 g/dL, creatinine 0.9 mg/dL, no malignancy, drinks one glass of wine on weekends, no antiplatelet, no CYP2C9 testing has revealed variants.

**Inputs**

| Key | Value |
|---|---|
| hepatic_or_renal | false |
| ethanol_abuse | false |
| malignancy | false |
| age_over_75 | false |
| reduced_platelets | false |
| rebleeding_risk | false |
| uncontrolled_hypertension | false |
| anemia | false |
| genetic_cyp2c9 | false |
| excessive_fall_risk | false |
| stroke_history | false |

**Arithmetic.** 0 + 0 + 0 + 0 + 0 + 2·0 + 0 + 0 + 0 + 0 + 0 = **0**.

**Expected output.**

- `score`: **0**
- `bleeds_per_100_patient_years`: **1.9** (95% CI 0.6 – 4.4)
- `risk_category`: **Low**
- `interpretation`: Bleeding risk is low. Anticoagulation generally favourable when stroke risk warrants it.

---

## Test case 2 — Low-intermediate (score 1)

**Vignette.** Mrs. Geraldine Owusu, a 72-year-old woman with paroxysmal AF on warfarin. She has iron-deficiency anaemia (Hb 11.4 g/dL) under workup. BP controlled, no falls, no liver/renal disease, no prior bleed, no antiplatelet, no malignancy, no alcohol abuse, no CYP2C9 variants, no prior stroke.

**Inputs**

| Key | Value |
|---|---|
| hepatic_or_renal | false |
| ethanol_abuse | false |
| malignancy | false |
| age_over_75 | false |
| reduced_platelets | false |
| rebleeding_risk | false |
| uncontrolled_hypertension | false |
| anemia | **true** |
| genetic_cyp2c9 | false |
| excessive_fall_risk | false |
| stroke_history | false |

**Arithmetic.** 0 + 0 + 0 + 0 + 0 + 2·0 + 0 + **1** + 0 + 0 + 0 = **1**.

**Expected output.**

- `score`: **1**
- `bleeds_per_100_patient_years`: **2.5** (95% CI 1.3 – 4.3)
- `risk_category`: **Low**
- `interpretation`: Bleeding risk remains low; standard monitoring.

---

## Test case 3 — Intermediate (score 3)

**Vignette.** Mr. Hiroshi Tanaka, a 78-year-old man with permanent AF on warfarin, also taking low-dose aspirin 81 mg for ischaemic heart disease. He has stage 3a CKD (creatinine 1.6 mg/dL — does not meet ≥2.26 mg/dL threshold) but uses a cane after a single fall last winter; gait clinic flags him as high fall risk. No anaemia, no prior bleed, no malignancy, no alcohol abuse, BP 138/80 on therapy, no stroke, no CYP2C9 variants known.

**Inputs**

| Key | Value |
|---|---|
| hepatic_or_renal | false |
| ethanol_abuse | false |
| malignancy | false |
| age_over_75 | **true** |
| reduced_platelets | **true** (aspirin) |
| rebleeding_risk | false |
| uncontrolled_hypertension | false |
| anemia | false |
| genetic_cyp2c9 | false |
| excessive_fall_risk | **true** |
| stroke_history | false |

**Arithmetic.** 0 + 0 + 0 + **1** (O) + **1** (R) + 2·0 + 0 + 0 + 0 + **1** (E) + 0 = **3**.

**Expected output.**

- `score`: **3**
- `bleeds_per_100_patient_years`: **8.4** (95% CI 4.9 – 13.6)
- `risk_category`: **Intermediate–high**
- `interpretation`: Substantial bleeding risk. Optimise modifiable factors; consider closer INR/anticoagulation monitoring.

---

## Test case 4 — High risk (score 4)

**Vignette.** Mrs. Patricia O'Connor, a 76-year-old woman with persistent AF on warfarin, prior TIA two years ago, and a history of a single hospitalisation for upper-GI bleed from a duodenal ulcer (resolved on PPI). Hb 13.5 g/dL today, BP 144/82 on amlodipine + losartan, no falls, no antiplatelet, no malignancy, no liver/renal disease, no alcohol abuse, no CYP2C9 variants known.

**Inputs**

| Key | Value |
|---|---|
| hepatic_or_renal | false |
| ethanol_abuse | false |
| malignancy | false |
| age_over_75 | **true** |
| reduced_platelets | false |
| rebleeding_risk | **true** (prior GI bleed) |
| uncontrolled_hypertension | false |
| anemia | false |
| genetic_cyp2c9 | false |
| excessive_fall_risk | false |
| stroke_history | **true** (TIA) |

**Arithmetic.** 0 + 0 + 0 + **1** (O) + 0 + **2·1 = 2** (R₂) + 0 + 0 + 0 + 0 + **1** (S) = **4**.

**Expected output.**

- `score`: **4**
- `bleeds_per_100_patient_years`: **10.4** (95% CI 5.1 – 18.9)
- `risk_category`: **High**
- `interpretation`: High bleeding risk. Re-evaluate net clinical benefit; intensify mitigation; consider alternatives (e.g., DOAC where appropriate, LAA occlusion in selected patients).

---

## Test case 5 — Edge case, maximum score (12)

**Vignette.** Mr. Léopold Vermeulen, an 84-year-old man with permanent AF, decompensated cirrhosis (Child–Pugh B, bilirubin 3.1 mg/dL), longstanding alcohol use disorder (≥14 drinks/week), metastatic prostate cancer on abiraterone, recurrent falls (three in the last six months) with frailty, prior haemorrhagic stroke, prior intracranial bleed, uncontrolled hypertension (clinic SBP 178 mmHg despite triple therapy), Hb 10.2 g/dL, platelets 64 ×10⁹/L (also on clopidogrel post-PCI), and known CYP2C9*3 heterozygous variant.

**Inputs** (all eleven components positive)

| Key | Value |
|---|---|
| hepatic_or_renal | true |
| ethanol_abuse | true |
| malignancy | true |
| age_over_75 | true |
| reduced_platelets | true |
| rebleeding_risk | true |
| uncontrolled_hypertension | true |
| anemia | true |
| genetic_cyp2c9 | true |
| excessive_fall_risk | true |
| stroke_history | true |

**Arithmetic.** 1 + 1 + 1 + 1 + 1 + 2·1 + 1 + 1 + 1 + 1 + 1 = **12** (the maximum).

**Expected output.**

- `score`: **12**
- `bleeds_per_100_patient_years`: **12.3** (95% CI 5.8 – 23.1) — pooled ≥5 band
- `risk_category`: **Very high**
- `interpretation`: Very high bleeding risk. Multidisciplinary review; weigh against stroke risk; mitigate every reversible factor.
