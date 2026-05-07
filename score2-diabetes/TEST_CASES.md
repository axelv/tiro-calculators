# SCORE2-Diabetes — Test Cases

Five fictional clinical test cases for SCORE2-Diabetes (10-year fatal + non-fatal CVD risk in adults aged 40–69 with type 2 diabetes, no prior CVD).

> **Note on expected risks.** The full numerical β-coefficients and the eight (4 regions × 2 sexes) recalibration constants are **not reproduced** in the SPEC (marked `TBD — see SCORE2-Diabetes 2023 supplementary`). The expected `risk_10y_pct` figures below are clinically plausible values consistent with (a) the illustrative per-SD HRs printed in the spec — Age (per 5 y): HR 1.71 men / 1.94 women; HbA1c (per 9.34 mmol/mol): HR 1.10 men / 1.12 women; ln(eGFR) per SD 0.15: HR 0.94 — (b) the published worked examples from the *Eur Heart J* 2023 paper, and (c) the ESC 2023 risk-band thresholds. Each test case identifies the **risk_band** unambiguously; the precise percentage should be cross-validated against the official Stata/web implementation before clinical use.

ESC 2023 risk-band thresholds (age 40–69 with diabetes):

| Risk band | 10-year CVD risk |
|---|---|
| Low–to–moderate | < 5 % |
| High | 5 – < 10 % |
| Very high | 10 – < 20 % |
| Very high (highest) | ≥ 20 % |

Centring constants used in the linear predictor (per SPEC §3.1):

| Variable | Centred at | Per-unit scaling |
|---|---|---|
| age | 60 y | per 5 y |
| sbp | 120 mmHg | per 20 mmHg |
| total_cholesterol | 6.0 mmol/L | per 1 mmol/L |
| hdl_cholesterol | 1.3 mmol/L | per 0.5 mmol/L |
| age_at_diabetes_diagnosis | 50 y | per 5 y |
| hba1c | 31 mmol/mol | per SD = 9.34 mmol/mol |
| egfr | 90 mL/min/1.73 m² | ln(eGFR/60) and ln(eGFR/60)² |

---

## Test case 1 — Low-to-moderate risk

**Vignette.** Marie Dubois, a 47-year-old French pharmacist (Belgium-resident, low-risk region), was diagnosed with type 2 diabetes 18 months ago at age 46. She is a never-smoker, her BMI is 27, BP and lipids are well-controlled and she has normal renal function.

**Inputs.**

| Field | Value | Centred / scaled |
|---|---|---|
| `sex` | female | — |
| `age` | 47 y | (47 − 60)/5 = −2.6 |
| `smoker_current` | false | 0 |
| `sbp` | 122 mmHg | (122 − 120)/20 = +0.10 |
| `total_cholesterol` | 4.6 mmol/L | 4.6 − 6 = −1.40 |
| `hdl_cholesterol` | 1.5 mmol/L | (1.5 − 1.3)/0.5 = +0.40 |
| `age_at_diabetes_diagnosis` | 46 y | (46 − 50)/5 = −0.80 |
| `hba1c` | 48 mmol/mol (~ 6.5 %) | (48 − 31)/9.34 = +1.82 |
| `egfr` | 95 mL/min/1.73 m² | ln(95/60) = +0.460; squared = 0.212 |
| `risk_region` | low | — |

**Risk profile commentary.** A young, female, never-smoker with well-controlled BP, low total cholesterol, high HDL, and intact renal function in a low-risk region. All centred predictors push the linear predictor strongly negative, except the modestly elevated HbA1c. Age-strata typical 10-year CVD risk in this profile is well below the 5 % threshold.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 1.5 %** (clinically plausible range 1–3 %) |
| `risk_band` | **low_to_moderate** |
| Recommendation | Lifestyle advice; no specific lipid target beyond diabetes guidelines |
| `model_version` | SCORE2-Diabetes-2023 |

---

## Test case 2 — High risk

**Vignette.** Klaus Weber, a 58-year-old German civil servant (Germany, moderate-risk region), has had type 2 diabetes for 6 years (diagnosed at 52). He stopped smoking last year (counted as non-smoker), takes an ACE inhibitor and a statin, and has stage 2 CKD.

**Inputs.**

| Field | Value | Centred / scaled |
|---|---|---|
| `sex` | male | — |
| `age` | 58 y | (58 − 60)/5 = −0.40 |
| `smoker_current` | false | 0 |
| `sbp` | 138 mmHg | (138 − 120)/20 = +0.90 |
| `total_cholesterol` | 5.4 mmol/L | 5.4 − 6 = −0.60 |
| `hdl_cholesterol` | 1.1 mmol/L | (1.1 − 1.3)/0.5 = −0.40 |
| `age_at_diabetes_diagnosis` | 52 y | (52 − 50)/5 = +0.40 |
| `hba1c` | 58 mmol/mol (~ 7.5 %) | (58 − 31)/9.34 = +2.89 |
| `egfr` | 72 mL/min/1.73 m² | ln(72/60) = +0.182; squared = 0.0332 |
| `risk_region` | moderate | — |

**Risk profile commentary.** Middle-aged male in a moderate-risk region with mildly raised SBP, modestly low HDL, and HbA1c above target. Renal function is mildly impaired but well above the model's lower bound. The combined contribution of male sex, age near reference, and diabetes-specific predictors (HbA1c, age-at-diagnosis) places him in the 5 – 10 % band.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 7.5 %** (clinically plausible range 5.5–9.5 %) |
| `risk_band` | **high** |
| Recommended LDL-C target | < 2.6 mmol/L (100 mg/dL) |
| Recommendation | Consider statin; intensify risk-factor control |
| `model_version` | SCORE2-Diabetes-2023 |

---

## Test case 3 — Very high risk (10 – < 20 %)

**Vignette.** Stanislaw Nowak, a 64-year-old Polish coal miner (Poland, high-risk region), has had type 2 diabetes for 12 years (diagnosed at 52), still smokes a pack a day, has long-standing hypertension, and stage 3a CKD. His HbA1c is poorly controlled despite metformin and a sulfonylurea.

**Inputs.**

| Field | Value | Centred / scaled |
|---|---|---|
| `sex` | male | — |
| `age` | 64 y | (64 − 60)/5 = +0.80 |
| `smoker_current` | true | 1 |
| `sbp` | 162 mmHg | (162 − 120)/20 = +2.10 |
| `total_cholesterol` | 6.4 mmol/L | 6.4 − 6 = +0.40 |
| `hdl_cholesterol` | 1.0 mmol/L | (1.0 − 1.3)/0.5 = −0.60 |
| `age_at_diabetes_diagnosis` | 52 y | (52 − 50)/5 = +0.40 |
| `hba1c` | 75 mmol/mol (~ 9.0 %) | (75 − 31)/9.34 = +4.71 |
| `egfr` | 52 mL/min/1.73 m² | ln(52/60) = −0.143; squared = 0.0205 |
| `risk_region` | high | — |

**Risk profile commentary.** Older male, current smoker, with markedly raised SBP, low HDL, raised total cholesterol, severely uncontrolled HbA1c, reduced eGFR, and a high-risk region multiplier. Every centred predictor pushes the linear predictor positive. ESC's 2023 paper presents very similar profiles in this band.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 17 %** (clinically plausible range 14–19 %) |
| `risk_band` | **very_high** |
| Recommended LDL-C target | < 1.8 mmol/L (70 mg/dL) and ≥ 50 % reduction |
| Recommendation | Statin recommended; smoking cessation; aggressive BP and HbA1c management |
| `model_version` | SCORE2-Diabetes-2023 |

---

## Test case 4 — Very high risk (≥ 20 %)

**Vignette.** Tetiana Shevchenko, a 69-year-old retired textile worker from Ukraine (very-high-risk region), has had type 2 diabetes for 25 years (diagnosed at age 44 — early-onset). She is a current smoker with hypertension, low HDL, severe hyperlipidaemia, and stage 3b CKD. She is the closest to the model's upper-age limit.

**Inputs.**

| Field | Value | Centred / scaled |
|---|---|---|
| `sex` | female | — |
| `age` | 69 y | (69 − 60)/5 = +1.80 |
| `smoker_current` | true | 1 |
| `sbp` | 170 mmHg | (170 − 120)/20 = +2.50 |
| `total_cholesterol` | 7.2 mmol/L | 7.2 − 6 = +1.20 |
| `hdl_cholesterol` | 0.9 mmol/L | (0.9 − 1.3)/0.5 = −0.80 |
| `age_at_diabetes_diagnosis` | 44 y | (44 − 50)/5 = −1.20 |
| `hba1c` | 80 mmol/mol (~ 9.5 %) | (80 − 31)/9.34 = +5.25 |
| `egfr` | 38 mL/min/1.73 m² | ln(38/60) = −0.457; squared = 0.209 |
| `risk_region` | very_high | — |

**Risk profile commentary.** Almost every modifiable risk factor is unfavourable, and the very-high-risk region recalibration adds further hazard. The early-onset diabetes (diagnosed at 44, 16 years younger than the centring age of 50, with 25 years of disease at presentation) is a major contributor.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 32 %** (clinically plausible range 27–38 %) |
| `risk_band` | **very_high** (top tier ≥ 20 %) |
| Recommended LDL-C target | < 1.4 mmol/L (55 mg/dL) and ≥ 50 % reduction |
| Recommendation | Intensive lipid-lowering (statin + ezetimibe ± PCSK9i); smoking cessation; aggressive BP and HbA1c control; nephrology referral |
| `model_version` | SCORE2-Diabetes-2023 |

---

## Test case 5 — Edge case: minimum age, brand-new diabetes, ideal profile

**Vignette.** Sofía Martínez, a 40-year-old Spanish architect (Spain, low-risk region), is diagnosed with type 2 diabetes today on routine screening (HbA1c 49 mmol/mol; fasting glucose 7.4 mmol/L). She has never smoked, is normotensive, has normal lipids and excellent renal function. This sits at the **lower age limit** of the model and at near-minimum predictor values.

**Inputs.**

| Field | Value | Centred / scaled |
|---|---|---|
| `sex` | female | — |
| `age` | 40 y | (40 − 60)/5 = −4.00 |
| `smoker_current` | false | 0 |
| `sbp` | 110 mmHg | (110 − 120)/20 = −0.50 |
| `total_cholesterol` | 4.0 mmol/L | 4.0 − 6 = −2.00 |
| `hdl_cholesterol` | 1.8 mmol/L | (1.8 − 1.3)/0.5 = +1.00 |
| `age_at_diabetes_diagnosis` | 40 y | (40 − 50)/5 = −2.00 |
| `hba1c` | 49 mmol/mol (~ 6.6 %) | (49 − 31)/9.34 = +1.93 |
| `egfr` | 110 mL/min/1.73 m² | ln(110/60) = +0.606; squared = 0.367 |
| `risk_region` | low | — |

**Risk profile commentary.** Age sits at the lower bound of the model's validated range. Every other predictor is favourable except for the diabetes itself (modestly raised HbA1c, recently diagnosed). The cumulative effect of strongly negative age centring, low SBP, low total cholesterol, high HDL, low-risk region, and excellent eGFR yields a 10-year CVD risk well under the 5 % low-to-moderate threshold.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 0.6 %** (clinically plausible range 0.4–1.2 %) |
| `risk_band` | **low_to_moderate** (bottom of the range) |
| Recommendation | Lifestyle advice, glycaemic control; statin not indicated by SCORE2-D alone |
| `model_version` | SCORE2-Diabetes-2023 |

---

> All five expected `risk_10y_pct` figures are illustrative point estimates within clinically defensible bands; the **`risk_band` classifications are the primary verifiable outputs**. Implementations must be cross-validated against the SCORE2-Diabetes 2023 reference Stata code or supplementary worked examples before clinical deployment, as noted in §3.5 and §5 of the SPEC.
