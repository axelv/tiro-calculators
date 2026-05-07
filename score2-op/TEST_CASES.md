# SCORE2-OP — Test Cases

Five fictional clinical test cases for SCORE2-OP (10-year fatal + non-fatal CVD risk in apparently healthy adults aged ≥ 70, no prior ASCVD, no familial hypercholesterolaemia, no severe CKD).

> **Note on expected risks.** The exact β-coefficients, sex-specific baseline survivals `S0_s(10)`, and the eight (4 regions × 2 sexes) recalibration constants are **not reproduced** in the SPEC (marked `TBD — see SCORE2-OP Working Group 2021 supplementary, ehab312_supplementary_data.zip`). Expected `risk_10y_pct` values below are clinically plausible point estimates consistent with the published worked examples in *Eur Heart J* 2021;42(25):2455–2467 and the ESC 2021 risk-band thresholds. The `risk_band` classifications are the primary verifiable outputs and must be cross-validated against the official SCORE2-OP coefficient tables before clinical use.

ESC 2021 risk-band thresholds (SCORE2-OP, age ≥ 70):

| Risk band | 10-year CVD risk |
|---|---|
| Low to moderate | < 7.5 % |
| High | 7.5 – < 15 % |
| Very high | ≥ 15 % |

Centring constants (per SPEC §3.1):

| Variable | Centred at | Per-unit scaling |
|---|---|---|
| age | 73 y | per 1 y |
| sbp | 150 mmHg | per 20 mmHg |
| total_cholesterol | 6.0 mmol/L | per 1 mmol/L |
| hdl_cholesterol | 1.4 mmol/L | per 1 mmol/L |

---

## Test case 1 — Low-to-moderate risk

**Vignette.** Margriet Hendriks, a 72-year-old retired Dutch teacher (Netherlands, low-risk region), is in excellent health, takes no medication, has never smoked, walks daily, and has unremarkable office BP and an unremarkable lipid panel.

**Inputs.**

| Field | Value | Centred |
|---|---|---|
| `sex` | female | — |
| `age` | 72 y | 72 − 73 = −1 |
| `current_smoker` | false | 0 |
| `sbp_mmhg` | 132 mmHg | (132 − 150)/20 = −0.90 |
| `total_chol_mmol_l` | 5.0 mmol/L | 5.0 − 6.0 = −1.0 |
| `hdl_chol_mmol_l` | 1.7 mmol/L | 1.7 − 1.4 = +0.30 |
| `risk_region` | low | — |
| `diabetes` | false | — |

**Risk profile commentary.** Female sex, low-risk region, age just over 70, normotensive, low total cholesterol with high HDL, and never-smoker — all centred predictors except age sit on the favourable side. Expected risk well below the 7.5 % threshold.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 4.5 %** (clinically plausible range 3–6 %) |
| `risk_band` | **low_to_moderate** |
| `recommendation` | lifestyle_only |
| `region` | low |
| `age_band` | ge_70 |
| `model_version` | score2-op-2021-v1 |

---

## Test case 2 — High risk (7.5 – < 15 %)

**Vignette.** Wolfgang Bauer, a 75-year-old retired Austrian engineer (Austria, moderate-risk region), is a former smoker (counts as non-smoker per model), has stage 1 hypertension on amlodipine, and modestly elevated cholesterol. No prior CVD events.

**Inputs.**

| Field | Value | Centred |
|---|---|---|
| `sex` | male | — |
| `age` | 75 y | 75 − 73 = +2 |
| `current_smoker` | false | 0 |
| `sbp_mmhg` | 152 mmHg | (152 − 150)/20 = +0.10 |
| `total_chol_mmol_l` | 6.4 mmol/L | 6.4 − 6.0 = +0.40 |
| `hdl_chol_mmol_l` | 1.2 mmol/L | 1.2 − 1.4 = −0.20 |
| `risk_region` | moderate | — |
| `diabetes` | false | — |

**Risk profile commentary.** Male sex doubles much of the baseline hazard relative to a similar woman; modestly raised SBP and total cholesterol with low-normal HDL; moderate-risk region. Profile sits squarely in the high-risk band by ESC 2021.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 11 %** (clinically plausible range 9–13 %) |
| `risk_band` | **high** |
| `recommendation` | treatment_consider |
| `region` | moderate |
| `age_band` | ge_70 |
| `model_version` | score2-op-2021-v1 |

---

## Test case 3 — Very high risk (≥ 15 %)

**Vignette.** Levente Kovács, a 78-year-old Hungarian retired bus driver (Hungary, high-risk region), is a current smoker (15 cigarettes/day), with poorly controlled hypertension, low HDL, and modestly raised total cholesterol. No symptoms; no prior MI / stroke / TIA / PAD.

**Inputs.**

| Field | Value | Centred |
|---|---|---|
| `sex` | male | — |
| `age` | 78 y | 78 − 73 = +5 |
| `current_smoker` | true | 1 |
| `sbp_mmhg` | 168 mmHg | (168 − 150)/20 = +0.90 |
| `total_chol_mmol_l` | 6.6 mmol/L | 6.6 − 6.0 = +0.60 |
| `hdl_chol_mmol_l` | 1.0 mmol/L | 1.0 − 1.4 = −0.40 |
| `risk_region` | high | — |
| `diabetes` | false | — |

**Risk profile commentary.** Older male, current smoker, with raised SBP and adverse lipids in a high-risk region. All four modifiable predictors push hazard up; smoking-by-age and SBP-by-age interactions further amplify risk. Profile sits well above the 15 % very-high threshold.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 26 %** (clinically plausible range 22–30 %) |
| `risk_band` | **very_high** |
| `recommendation` | treatment_recommend (subject to frailty / life-expectancy review) |
| `region` | high |
| `age_band` | ge_70 |
| `model_version` | score2-op-2021-v1 |

---

## Test case 4 — Very high risk in a very-high-risk region

**Vignette.** Galina Petrova, an 82-year-old retired Russian librarian (Russia, very-high-risk region), is a current smoker, has hypertension and adverse lipids, and is otherwise apparently healthy. The combination of female sex with very-high regional baseline mortality and adverse modifiables yields a high absolute risk despite the female sex offset.

**Inputs.**

| Field | Value | Centred |
|---|---|---|
| `sex` | female | — |
| `age` | 82 y | 82 − 73 = +9 |
| `current_smoker` | true | 1 |
| `sbp_mmhg` | 170 mmHg | (170 − 150)/20 = +1.00 |
| `total_chol_mmol_l` | 7.0 mmol/L | 7.0 − 6.0 = +1.00 |
| `hdl_chol_mmol_l` | 1.1 mmol/L | 1.1 − 1.4 = −0.30 |
| `risk_region` | very_high | — |
| `diabetes` | false | — |

**Risk profile commentary.** All four modifiable predictors are unfavourable. Age 82 is well above the centring constant of 73, amplifying every age-interaction term. The very-high-risk region scaling adds further hazard. Expected to sit well above the 15 % very-high threshold.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 28 %** (clinically plausible range 24–34 %) |
| `risk_band` | **very_high** |
| `recommendation` | treatment_recommend (subject to frailty, polypharmacy and life-expectancy assessment) |
| `region` | very_high |
| `age_band` | ge_70 |
| `model_version` | score2-op-2021-v1 |

---

## Test case 5 — Edge case: minimum age, ideal profile, low-risk region

**Vignette.** Henri Lefèvre, a 70-year-old retired French postal worker (France, low-risk region), presents for a routine annual check-up. He has never smoked, is normotensive without medication, has low total cholesterol with high HDL, and reports daily cycling. This case sits at the **lower age limit** of the validated range with all modifiables as favourable as plausible.

**Inputs.**

| Field | Value | Centred |
|---|---|---|
| `sex` | male | — |
| `age` | 70 y | 70 − 73 = −3 |
| `current_smoker` | false | 0 |
| `sbp_mmhg` | 118 mmHg | (118 − 150)/20 = −1.60 |
| `total_chol_mmol_l` | 4.2 mmol/L | 4.2 − 6.0 = −1.80 |
| `hdl_chol_mmol_l` | 1.8 mmol/L | 1.8 − 1.4 = +0.40 |
| `risk_region` | low | — |
| `diabetes` | false | — |

**Risk profile commentary.** Male, but otherwise as favourable as the model permits — age just at the lower bound, low SBP, low total cholesterol, high HDL, never-smoker, low-risk region. The negative centred predictors offset the male-sex baseline. Expected risk well below the 7.5 % threshold and approaches the lower bound of plausible SCORE2-OP outputs.

**Expected output.**

| Field | Value |
|---|---|
| `risk_10y_pct` | **≈ 4.0 %** (clinically plausible range 2.5–5.5 %) |
| `risk_band` | **low_to_moderate** |
| `recommendation` | lifestyle_only |
| `region` | low |
| `age_band` | ge_70 |
| `model_version` | score2-op-2021-v1 |

---

> The expected `risk_10y_pct` figures are illustrative point estimates; the **`risk_band` is the primary verifiable output**. Implementations must be cross-validated against the SCORE2-OP 2021 supplementary coefficient tables (`ehab312_supplementary_data.zip`) before clinical deployment.
