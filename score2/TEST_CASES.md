# SCORE2 — Fictional Test Cases

Five fictional clinical test cases for the **SCORE2** 10-year cardiovascular
risk prediction algorithm in apparently healthy adults aged 40–69 in Europe.
Cases cover the spread of risk bands across both age sub-bands (40–49 and
50–69) and across all four risk regions (Low / Moderate / High / Very high).

> **Note on numerics.** The SPEC.md publishes the predictor centring/scaling
> and the model structure, but lists the β-coefficients, baseline survivals,
> and region recalibration scaling factors as **TBD** (to be transcribed
> verbatim from the *Eur Heart J* 2021 supplement). The expected outputs in
> these test cases therefore show the **per-predictor centred values** and
> the **expected risk-band classification** based on the published
> SCORE2 chart values for the same input combinations (ESC/SCORE2 official
> chart, accessible via the ESC HeartScore tool). The numeric `risk_pct`
> value should be confirmed against the published β-coefficients once
> transcribed by the implementer.

---

## Test case 1 — Low region, young female non-smoker, Low risk (minimum-age edge case)

### Vignette
**Ingrid Thomsen**, a 42-year-old woman from Denmark (Low risk region),
never-smoker, optimal lipid profile, normal blood pressure, otherwise healthy.

### Inputs

| Field | Value |
|---|---|
| sex | female |
| age_years | 42 |
| smoking | other (never-smoker) |
| sbp_mmHg | 118 |
| total_chol_mmol_L | 4.2 |
| hdl_chol_mmol_L | 1.7 |
| region | low |

### Centred / scaled predictors

- `cage` = (42 − 60) / 5 = **−3.6**
- `smoking` = 0
- `csbp` = (118 − 120) / 20 = **−0.10**
- `ctchol` = 4.2 − 6 = **−1.80**
- `chdl` = (1.7 − 1.3) / 0.5 = **+0.80**

### Expected output

- age_band: **40_49**
- risk_pct: **~1%** (per ESC SCORE2 chart for Low region, female, age 40–44, non-smoker, SBP 100–119, non-HDL ~2.5 mmol/L)
- risk_category: **low_to_moderate** (< 2.5% threshold for age < 50)
- Interpretation: Lifestyle advice; no pharmacotherapy indicated unless modifiers present

---

## Test case 2 — Moderate region, middle-aged male non-smoker, Low-to-moderate risk

### Vignette
**Markus Steinbrenner**, a 55-year-old man from Germany (Moderate region),
ex-smoker (counts as "other"), mildly elevated SBP, average cholesterol.

### Inputs

| Field | Value |
|---|---|
| sex | male |
| age_years | 55 |
| smoking | other |
| sbp_mmHg | 138 |
| total_chol_mmol_L | 5.4 |
| hdl_chol_mmol_L | 1.2 |
| region | moderate |

### Centred / scaled predictors

- `cage` = (55 − 60) / 5 = **−1.0**
- `smoking` = 0
- `csbp` = (138 − 120) / 20 = **+0.90**
- `ctchol` = 5.4 − 6 = **−0.60**
- `chdl` = (1.2 − 1.3) / 0.5 = **−0.20**

### Expected output

- age_band: **50_69**
- risk_pct: **~3%** (per ESC SCORE2 chart for Moderate region, male, age 55, non-smoker, SBP 130–139, non-HDL ~4.2)
- risk_category: **low_to_moderate** (< 5% threshold for age 50–69)
- Interpretation: Lifestyle counselling; consider treatment if modifiers shift risk

---

## Test case 3 — High region, smoker, hypertensive, High risk

### Vignette
**Miroslav Novak**, a 62-year-old man from Czech Republic (High region),
current smoker with poorly controlled hypertension and elevated cholesterol.

### Inputs

| Field | Value |
|---|---|
| sex | male |
| age_years | 62 |
| smoking | current |
| sbp_mmHg | 158 |
| total_chol_mmol_L | 6.4 |
| hdl_chol_mmol_L | 1.0 |
| region | high |

### Centred / scaled predictors

- `cage` = (62 − 60) / 5 = **+0.40**
- `smoking` = 1
- `csbp` = (158 − 120) / 20 = **+1.90**
- `ctchol` = 6.4 − 6 = **+0.40**
- `chdl` = (1.0 − 1.3) / 0.5 = **−0.60**

### Expected output

- age_band: **50_69**
- risk_pct: **~17–19%** (per ESC SCORE2 chart for High region, male, age 60–64, smoker, SBP 150–159, non-HDL ~5.4)
- risk_category: **very_high** (≥ 10% threshold for age 50–69)
- Interpretation: Risk-factor treatment recommended (statin, BP control, smoking cessation); consider intensified LDL-C target (< 1.4 mmol/L) per 2021 ESC Guidelines

---

## Test case 4 — Very high region, female smoker at upper age bound, Very high risk

### Vignette
**Tatiana Volkov**, a 69-year-old woman from Russian Federation (Very high
region), current smoker, hypertensive on no treatment, with a high
cholesterol/low HDL profile. Age sits at the upper SCORE2 limit before
SCORE2-OP.

### Inputs

| Field | Value |
|---|---|
| sex | female |
| age_years | 69 |
| smoking | current |
| sbp_mmHg | 168 |
| total_chol_mmol_L | 7.0 |
| hdl_chol_mmol_L | 0.9 |
| region | very_high |

### Centred / scaled predictors

- `cage` = (69 − 60) / 5 = **+1.80**
- `smoking` = 1
- `csbp` = (168 − 120) / 20 = **+2.40**
- `ctchol` = 7.0 − 6 = **+1.00**
- `chdl` = (0.9 − 1.3) / 0.5 = **−0.80**

### Expected output

- age_band: **50_69**
- risk_pct: **~24–28%** (per ESC SCORE2 chart for Very high region, female, age 65–69, smoker, SBP 160–179, non-HDL ~6.1)
- risk_category: **very_high** (≥ 10% for age 50–69)
- Interpretation: Treatment strongly recommended; intensified LDL-C target. Edge case: at age 70, switch to **SCORE2-OP**

---

## Test case 5 — Low region, healthy 49-year-old male, Low-to-moderate (band-boundary edge case)

### Vignette
**Olivier Lefèvre**, a 49-year-old man from France (Low region), never-smoker,
borderline SBP and total cholesterol, average HDL. He is exactly at the upper
end of the **40–49 age band** with its stricter < 2.5% / ≥ 7.5% thresholds.

### Inputs

| Field | Value |
|---|---|
| sex | male |
| age_years | 49 |
| smoking | other |
| sbp_mmHg | 132 |
| total_chol_mmol_L | 5.6 |
| hdl_chol_mmol_L | 1.3 |
| region | low |

### Centred / scaled predictors

- `cage` = (49 − 60) / 5 = **−2.20**
- `smoking` = 0
- `csbp` = (132 − 120) / 20 = **+0.60**
- `ctchol` = 5.6 − 6 = **−0.40**
- `chdl` = (1.3 − 1.3) / 0.5 = **0.00**

### Expected output

- age_band: **40_49** (49 sits in the 40–49 band; threshold of < 2.5% / ≥ 7.5% applies)
- risk_pct: **~2%** (per ESC SCORE2 chart for Low region, male, age 45–49, non-smoker, SBP 130–139, non-HDL ~4.3)
- risk_category: **low_to_moderate** (< 2.5%)
- Interpretation: Lifestyle counselling; close follow-up because at age 50 the patient moves into the 50–69 age band with relaxed thresholds — risk classification may shift even with unchanged biology
