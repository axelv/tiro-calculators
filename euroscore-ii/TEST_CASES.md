# EuroSCORE II — Test Cases

Five fictional clinical test cases for EuroSCORE II (Nashef et al., *EJCTS* 2012;41(4):734–745). All coefficients per SPEC §3 (intercept β0 = −5.324537; age coefficient 0.0285181 with `x_age = max(1, age − 59)`).

```
y = β0 + 0.0285181·x_age + Σ β_i · x_i
predicted_mortality = exp(y) / (1 + exp(y))
```

Risk strata (UI hint, SPEC §4.2): Low < 4 %, Intermediate 4–8 %, High > 8 %.

---

## Test case 1 — Low risk (minimal risk profile)

**Vignette.** Mr. Henrik Sørensen, a 58-year-old engineer, undergoes elective isolated CABG for triple-vessel coronary disease. He has NYHA class I symptoms, normal LV function (EF 60 %), creatinine clearance 95 mL/min, and no other comorbidities.

**Inputs**

| Field | Value |
|---|---|
| `age` | 58 |
| `sex` | male |
| `renal_function` | normal_cc_gt_85 |
| `extracardiac_arteriopathy` | false |
| `poor_mobility` | false |
| `previous_cardiac_surgery` | false |
| `chronic_lung_disease` | false |
| `active_endocarditis` | false |
| `critical_preoperative_state` | false |
| `diabetes_on_insulin` | false |
| `nyha_class` | I |
| `ccs_class_4` | false |
| `lv_function` | good_ge_51 |
| `recent_mi` | false |
| `pa_systolic_pressure` | lt_31 |
| `urgency` | elective |
| `weight_of_procedure` | isolated_cabg |
| `thoracic_aorta_surgery` | false |

**Computation**

```
x_age = max(1, 58 − 59) = 1
y = −5.324537
  + 0.0285181 · 1            = +0.0285181
  (all other terms 0 — reference categories)
  = −5.296019

predicted_mortality = e^(−5.296019) / (1 + e^(−5.296019)) ≈ 0.004986 ≈ 0.50 %
```

**Expected outcome**

- Linear predictor `y`: **−5.2960**
- Predicted in-hospital mortality: **≈ 0.50 %**
- Risk stratum: **Low** (< 4 %)
- Interpretation: conventional surgery generally appropriate.

---

## Test case 2 — Low risk (typical CABG candidate)

**Vignette.** Mr. Pieter de Vries, a 70-year-old retired accountant, is scheduled for elective isolated CABG. He has NYHA class II symptoms, LVEF 45 % (moderate), and creatinine clearance 70 mL/min (CC 50–85).

**Inputs (non-reference values only)**

| Field | Value | β |
|---|---|---:|
| `age` | 70 → `x_age = 11` | 0.0285181 |
| `nyha_class` | II | 0.1070545 |
| `lv_function` | moderate_31_50 | 0.3150652 |
| `renal_function` | moderate_cc_50_85 | 0.303553 |

All other fields are at reference values.

**Computation** (matches the SPEC sanity-check)

```
x_age = max(1, 70 − 59) = 11
y = −5.324537
  + 0.0285181 · 11           = +0.3136991
  + 0.1070545                = +0.1070545
  + 0.3150652                = +0.3150652
  + 0.303553                 = +0.303553
  = −4.285165

predicted_mortality = e^(−4.285165) / (1 + e^(−4.285165)) ≈ 0.01359 ≈ 1.36 %
```

**Expected outcome**

- Linear predictor `y`: **−4.2852**
- Predicted in-hospital mortality: **≈ 1.36 %**
- Risk stratum: **Low** (< 4 %)
- Interpretation: conventional surgery appropriate. (This case reproduces the SPEC §3.4 worked example.)

---

## Test case 3 — Intermediate risk

**Vignette.** Mrs. Margaretha Hofmeister, a 78-year-old retired teacher, presents with severe symptomatic aortic stenosis and concomitant double-vessel coronary disease. She is scheduled for elective combined CABG + aortic valve replacement (two procedures). She has NYHA class III symptoms, LVEF 40 % (moderate), creatinine clearance 65 mL/min (CC 50–85), and insulin-dependent type 2 diabetes.

**Inputs (non-reference values only)**

| Field | Value | β |
|---|---|---:|
| `age` | 78 → `x_age = 19` | 0.0285181 |
| `sex` | female | 0.2196434 |
| `nyha_class` | III | 0.2958358 |
| `lv_function` | moderate_31_50 | 0.3150652 |
| `renal_function` | moderate_cc_50_85 | 0.303553 |
| `weight_of_procedure` | two_procedures | 0.5521478 |
| `diabetes_on_insulin` | true | 0.3542749 |

All other fields at reference.

**Computation**

```
x_age = max(1, 78 − 59) = 19
y = −5.324537
  + 0.0285181 · 19           = +0.5418439
  + 0.2196434                (female)
  + 0.2958358                (NYHA III)
  + 0.3150652                (LV moderate)
  + 0.303553                 (CC 50–85)
  + 0.5521478                (2 procedures)
  + 0.3542749                (insulin-dependent diabetes)
  = −2.742173

predicted_mortality = e^(−2.742173) / (1 + e^(−2.742173)) ≈ 0.0605 ≈ 6.05 %
```

**Expected outcome**

- Linear predictor `y`: **−2.7422**
- Predicted in-hospital mortality: **≈ 6.05 %**
- Risk stratum: **Intermediate** (4–8 %)
- Interpretation: Heart Team discussion; consider alternatives (e.g., TAVI ± PCI) in selected patients.

---

## Test case 4 — High risk

**Vignette.** Mr. Aurelio Conti, a 75-year-old former machinist, requires urgent re-do CABG with concomitant aortic valve replacement (two procedures) for severe restenotic three-vessel disease and degenerative aortic stenosis. He has NYHA class III symptoms, LVEF 25 % (poor), creatinine clearance 40 mL/min (severe, not yet on dialysis), and a history of carotid endarterectomy 5 years ago (extracardiac arteriopathy).

**Inputs (non-reference values only)**

| Field | Value | β |
|---|---|---:|
| `age` | 75 → `x_age = 16` | 0.0285181 |
| `nyha_class` | III | 0.2958358 |
| `lv_function` | poor_21_30 | 0.8084096 |
| `renal_function` | severe_cc_lt_50 | 0.8592256 |
| `previous_cardiac_surgery` | true | 1.118599 |
| `extracardiac_arteriopathy` | true | 0.5360268 |
| `urgency` | urgent | 0.3174673 |
| `weight_of_procedure` | two_procedures | 0.5521478 |

All other fields at reference.

**Computation**

```
x_age = max(1, 75 − 59) = 16
y = −5.324537
  + 0.0285181 · 16           = +0.4562896
  + 0.2958358                (NYHA III)
  + 0.8084096                (LV poor)
  + 0.8592256                (CC < 50)
  + 1.118599                 (previous cardiac surgery)
  + 0.5360268                (extracardiac arteriopathy)
  + 0.3174673                (urgent)
  + 0.5521478                (2 procedures)
  = −0.3805449

predicted_mortality = e^(−0.3805449) / (1 + e^(−0.3805449)) ≈ 0.4060 ≈ 40.6 %
```

**Expected outcome**

- Linear predictor `y`: **−0.3805**
- Predicted in-hospital mortality: **≈ 40.6 %**
- Risk stratum: **High** (> 8 %)
- Interpretation: strong indication for Heart Team review; TAVI or alternative strategies frequently preferred in this profile.

---

## Test case 5 — Edge case: maximum-risk salvage scenario

**Vignette.** Mr. Otto Brenner, a 76-year-old retired pilot, is brought to the operating theatre in extremis after acute Type A aortic dissection complicated by cardiogenic shock. He had a prior CABG 9 years ago, is on chronic dialysis, NYHA IV, with LVEF 18 % (very poor), insulin-dependent diabetes, suspected mycotic aortic root abscess on antibiotics (active endocarditis), recent MI 2 weeks ago, and required external chest compressions en route to theatre (salvage). The procedure is redo aortic root replacement + AVR + CABG (three or more procedures), with thoracic-aorta surgery, in a critical preoperative state.

**Inputs (non-reference values only)**

| Field | Value | β |
|---|---|---:|
| `age` | 76 → `x_age = 17` | 0.0285181 |
| `nyha_class` | IV | 0.5597929 |
| `lv_function` | very_poor_le_20 | 0.9346919 |
| `renal_function` | dialysis | 0.6421508 |
| `previous_cardiac_surgery` | true | 1.118599 |
| `active_endocarditis` | true | 0.6194522 |
| `critical_preoperative_state` | true | 1.086517 |
| `diabetes_on_insulin` | true | 0.3542749 |
| `recent_mi` | true | 0.1528943 |
| `urgency` | salvage | 1.362947 |
| `weight_of_procedure` | three_or_more | 0.9724533 |
| `thoracic_aorta_surgery` | true | 0.6527205 |

All other fields at reference.

**Computation**

```
x_age = max(1, 76 − 59) = 17
y = −5.324537
  + 0.0285181 · 17           = +0.4848077
  + 0.5597929                (NYHA IV)
  + 0.9346919                (LV very poor)
  + 0.6421508                (dialysis)
  + 1.118599                 (previous cardiac surgery)
  + 0.6194522                (active endocarditis)
  + 1.086517                 (critical preoperative state)
  + 0.3542749                (insulin-dependent diabetes)
  + 0.1528943                (recent MI)
  + 1.362947                 (salvage)
  + 0.9724533                (≥3 procedures)
  + 0.6527205                (thoracic aorta surgery)
  = +3.616764

predicted_mortality = e^(3.616764) / (1 + e^(3.616764)) ≈ 0.9738 ≈ 97.4 %
```

**Expected outcome**

- Linear predictor `y`: **+3.6168**
- Predicted in-hospital mortality: **≈ 97.4 %**
- Risk stratum: **High** (≫ 8 %; near the upper bound of the EuroSCORE II range)
- Interpretation: extreme model output — treat as estimate; combine with clinical judgment and consider that EuroSCORE II is known to under-predict mortality at the very high-risk end. Decision to proceed should be a Heart Team / family discussion of futility vs. salvage.
- Edge-case note: this case combines most positive coefficients in the model and demonstrates the asymptotic upper end of the logistic transform.
