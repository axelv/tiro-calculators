# EuroSCORE II

European System for Cardiac Operative Risk Evaluation, second iteration. Predicts in-hospital mortality after major cardiac surgery in adults.

## 1. Purpose

EuroSCORE II is a logistic-regression risk model used by cardiac surgeons, cardiologists, and anaesthesiologists to estimate a patient's risk of in-hospital death after major cardiac surgery. It is run during preoperative work-up to (a) inform shared decision-making with the patient and Heart Team, (b) compare expected vs observed mortality for institutional benchmarking and quality control, and (c) stratify patients between conventional surgery and alternative therapies (e.g. TAVI vs SAVR). It was derived and published by Nashef et al. in 2012 from a contemporary cohort of 22,381 adult cardiac surgical patients across 154 hospitals in 43 countries, replacing the original additive and logistic EuroSCORE which over-predicted mortality in modern practice.

## 2. Inputs

All 18 variables are required. Categorical fields use the baseline (lowest-risk) category as the reference; only non-baseline categories carry a coefficient.

### 2.1 Patient-related factors

| # | Field | Type | Allowed values | Clinical definition |
|---|---|---|---|---|
| 1 | `age` | integer (years) | 18–110 | Age at the time of surgery, in completed years. |
| 2 | `sex` | enum | `male` (ref), `female` | Biological sex. |
| 3 | `renal_function` | enum | `normal_cc_gt_85` (ref), `moderate_cc_50_85`, `severe_cc_lt_50`, `dialysis` | Renal status. Creatinine clearance computed by Cockcroft-Gault, in mL/min. `dialysis` overrides CC and is selected for any patient on chronic dialysis regardless of serum creatinine or CC. |
| 4 | `extracardiac_arteriopathy` | boolean | `true`/`false` | One or more of: claudication, carotid occlusion or > 50 % stenosis, amputation for arterial disease, previous or planned intervention on the abdominal aorta, limb arteries, or carotids. |
| 5 | `poor_mobility` | boolean | `true`/`false` | Severe impairment of mobility secondary to musculoskeletal or neurological dysfunction. |
| 6 | `previous_cardiac_surgery` | boolean | `true`/`false` | Previous surgery requiring opening of the pericardium. |
| 7 | `chronic_lung_disease` | boolean | `true`/`false` | Long-term use of bronchodilators or steroids for lung disease. |
| 8 | `active_endocarditis` | boolean | `true`/`false` | Patient still on antibiotic treatment for endocarditis at the time of surgery. |
| 9 | `critical_preoperative_state` | boolean | `true`/`false` | Any one of: ventricular tachycardia/fibrillation or aborted sudden death, preoperative cardiac massage, preoperative ventilation before arriving in the anaesthetic room, preoperative inotropes or IABP/VAD, or preoperative acute renal failure (anuria or oliguria < 10 mL/h). |
| 10 | `diabetes_on_insulin` | boolean | `true`/`false` | Diabetes whose primary treatment is insulin (regardless of underlying type). |

### 2.2 Cardiac-related factors

| # | Field | Type | Allowed values | Clinical definition |
|---|---|---|---|---|
| 11 | `nyha_class` | enum | `I` (ref), `II`, `III`, `IV` | New York Heart Association functional class. |
| 12 | `ccs_class_4` | boolean | `true`/`false` | Canadian Cardiovascular Society class 4 angina (inability to perform any activity without angina, or angina at rest). |
| 13 | `lv_function` | enum | `good_ge_51` (ref), `moderate_31_50`, `poor_21_30`, `very_poor_le_20` | Left ventricular ejection fraction band (%): good ≥ 51, moderate 31–50, poor 21–30, very poor ≤ 20. |
| 14 | `recent_mi` | boolean | `true`/`false` | Myocardial infarction within 90 days before surgery. |
| 15 | `pa_systolic_pressure` | enum | `lt_31` (ref), `moderate_31_55`, `severe_ge_55` | Pulmonary artery systolic pressure (mmHg). |

### 2.3 Operation-related factors

| # | Field | Type | Allowed values | Clinical definition |
|---|---|---|---|---|
| 16 | `urgency` | enum | `elective` (ref), `urgent`, `emergency`, `salvage` | `elective` = routine, admitted for operation. `urgent` = not electively scheduled but cannot be sent home without surgery (same admission). `emergency` = surgery before the start of the next working day after decision. `salvage` = patient requiring CPR (external chest massage) en route to or in the operating theatre prior to anaesthesia induction. |
| 17 | `weight_of_procedure` | enum | `isolated_cabg` (ref), `single_non_cabg`, `two_procedures`, `three_or_more` | Complexity of cardiac surgery. `single_non_cabg` = one major non-CABG procedure (e.g. single valve). `two_procedures` = e.g. CABG + valve, or double valve. `three_or_more` = e.g. CABG + AVR + MVR. |
| 18 | `thoracic_aorta_surgery` | boolean | `true`/`false` | Surgery on the ascending aorta, aortic arch, or descending thoracic aorta. |

## 3. Calculation

EuroSCORE II is a single-step logistic regression. Compute the linear predictor `y` and pass it through the logistic function.

```
predicted_mortality = exp(y) / (1 + exp(y))
y = β0 + Σ (β_i · x_i)
```

### 3.1 Intercept

| Term | Value |
|---|---|
| β0 (constant) | **−5.324537** |

### 3.2 Age coding

Age is coded with a single coefficient applied to a piecewise linear transform `x_age`:

```
x_age = 1                       if age ≤ 60
x_age = 1 + (age − 60)          if age > 60
```

i.e. `x_age = max(1, age − 59)`. This contributes `0.0285181 · x_age` to `y`. Every year above 60 adds one unit of risk; everything ≤ 60 contributes the same baseline unit.

### 3.3 Coefficients (β)

Reference category for each enum has β = 0 by definition and is omitted. Booleans contribute the listed coefficient when `true`, 0 when `false`. Source: Nashef et al. 2012, Table 4.

| Variable | Category | β |
|---|---|---|
| Age (per coded unit, see §3.2) | — | 0.0285181 |
| Sex | female | 0.2196434 |
| NYHA class | II | 0.1070545 |
| NYHA class | III | 0.2958358 |
| NYHA class | IV | 0.5597929 |
| CCS class 4 angina | true | 0.2226147 |
| Insulin-dependent diabetes | true | 0.3542749 |
| Extracardiac arteriopathy | true | 0.5360268 |
| Chronic lung disease | true | 0.1886564 |
| Poor mobility (neurological/musculoskeletal) | true | 0.2407181 |
| Previous cardiac surgery | true | 1.118599 |
| Renal function | CC 50–85 (moderate) | 0.303553 |
| Renal function | CC < 50 (severe, not on dialysis) | 0.8592256 |
| Renal function | on dialysis (any CC) | 0.6421508 |
| Active endocarditis | true | 0.6194522 |
| Critical preoperative state | true | 1.086517 |
| LV function | moderate (31–50 %) | 0.3150652 |
| LV function | poor (21–30 %) | 0.8084096 |
| LV function | very poor (≤ 20 %) | 0.9346919 |
| Recent MI (≤ 90 days) | true | 0.1528943 |
| PA systolic pressure | 31–55 mmHg | 0.1788899 |
| PA systolic pressure | ≥ 55 mmHg | 0.3491475 |
| Urgency | urgent | 0.3174673 |
| Urgency | emergency | 0.7039121 |
| Urgency | salvage | 1.362947 |
| Weight of procedure | single non-CABG | 0.0062118 |
| Weight of procedure | 2 procedures | 0.5521478 |
| Weight of procedure | 3 or more procedures | 0.9724533 |
| Thoracic aorta surgery | true | 0.6527205 |

### 3.4 Worked example (sanity check)

A 70-year-old man, NYHA II, LVEF 45 %, CC 70 mL/min, undergoing elective isolated CABG, no other risk factors:

```
x_age = 1 + (70 − 60) = 11
y = −5.324537
  + 0.0285181 · 11           (age)            = +0.3136991
  + 0.1070545                (NYHA II)        = +0.1070545
  + 0.3150652                (LV moderate)    = +0.3150652
  + 0.303553                 (CC 50–85)       = +0.303553
  = −4.285165

predicted_mortality = e^(−4.285165) / (1 + e^(−4.285165)) ≈ 0.01359 ≈ 1.36 %
```

Implementations should reproduce this value to within rounding (~ 1.3–1.4 %).

## 4. Output

### 4.1 Primary output

- **Predicted in-hospital mortality**, expressed as a probability in `[0, 1]` and typically displayed as a percentage to one or two decimals.

### 4.2 Risk strata

The original publication does not mandate fixed risk bands; risk is reported as a continuous probability. The following pragmatic strata are commonly used in clinical practice and in the TAVI vs SAVR literature (e.g. PARTNER, STS/ACC TVT registry framing) and are suitable as a UI hint, not a hard rule:

| Stratum | Predicted mortality | Typical interpretation |
|---|---|---|
| Low risk | < 4 % | Conventional surgery generally appropriate. |
| Intermediate risk | 4 – 8 % | Heart Team discussion; consider alternatives in selected patients. |
| High risk | > 8 % | Strong indication for Heart Team review; TAVI or alternative strategies frequently preferred. |

These thresholds should be configurable.

### 4.3 Clinical interpretation

- The output is the **probability of death before discharge from the operating hospital** (or within 30 days, if discharged earlier), not long-term mortality and not morbidity.
- EuroSCORE II is calibrated for adults undergoing **major cardiac surgery**. It is not validated for isolated TAVI, congenital surgery in children, or isolated thoracic-aorta procedures performed without cardiopulmonary bypass.
- The model is known to under-predict mortality at the very high-risk end and in some subgroups (e.g. isolated mitral, octogenarians, redo aortic). Treat extreme outputs as estimates and combine with clinical judgement and complementary scores (e.g. STS-PROM, TRI-SCORE for isolated tricuspid).
- The score should be presented alongside its inputs so the clinician can audit the assumptions; never display only the percentage.

## 5. References

**Primary publication (source of all coefficients used above)**
Nashef SAM, Roques F, Sharples LD, Nilsson J, Smith C, Goldstone AR, Lockowandt U. *EuroSCORE II.* European Journal of Cardio-Thoracic Surgery 2012;41(4):734–745. doi:10.1093/ejcts/ezs043. PMID: 22378855.

**URLs consulted while preparing this spec**
- MDCalc — EuroSCORE II calculator: https://www.mdcalc.com/calc/3955/euroscore-ii
- EuroSCORE project — official calculator and documentation: https://www.euroscore.org/calc.html and https://www.euroscore.org/index.php?id=17
- Nashef et al. 2012 — Oxford Academic (EJCTS): https://academic.oup.com/ejcts/article/41/4/734/376455
- PubMed entry for the primary publication: https://pubmed.ncbi.nlm.nih.gov/22378855/
