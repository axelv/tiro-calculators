# SCORE2 — Systematic Coronary Risk Evaluation 2

Implementation specification for **SCORE2**, the European 10-year cardiovascular risk prediction model for apparently healthy adults aged 40–69.

Authoritative source: [MDCalc — Systematic Coronary Risk Evaluation (SCORE2)](https://www.mdcalc.com/calc/10499/systematic-coronary-risk-evaluation-score2)

Primary publication: SCORE2 Working Group and ESC Cardiovascular Risk Collaboration. *SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe.* **European Heart Journal** 2021;42(25):2439–2454. DOI: [10.1093/eurheartj/ehab309](https://doi.org/10.1093/eurheartj/ehab309).

---

## 1. Purpose

Predict the **10-year risk of fatal and non-fatal cardiovascular disease (CVD) events** — defined as the composite of CVD death, non-fatal myocardial infarction, and non-fatal stroke — in **apparently healthy adults aged 40–69 years** living in Europe.

SCORE2 replaces the original SCORE (which estimated only fatal CVD) and was endorsed by the **2021 ESC Guidelines on cardiovascular disease prevention in clinical practice**.

### Intended population

- Adults aged **40–69 years**.
- Apparently healthy: **no prior CVD**, **no diabetes mellitus**, **no chronic kidney disease (CKD)**, **no familial hypercholesterolemia**, **not pregnant**.

### Do **not** use when any of the following are present

- Established atherosclerotic CVD (prior MI, stroke, TIA, PAD, coronary revascularisation).
- **Diabetes mellitus** — use **SCORE2-Diabetes** instead.
- **Age ≥ 70 years** — use **SCORE2-OP (Older Persons)** instead.
- **Age < 40 years** — model not validated; consider lifetime / relative risk tools.
- Moderate–severe **CKD** (eGFR < 60 mL/min/1.73 m²) — treat as high/very-high risk by guideline.
- Familial hypercholesterolemia or other monogenic dyslipidemia — treat per dedicated guidelines.
- Pregnancy.

---

## 2. Inputs

| # | Variable | Type | Units | Allowed range | Notes |
|---|----------|------|-------|---------------|-------|
| 1 | **Sex** | enum | — | `male` \| `female` | Two sex-specific models. SCORE2 does not currently provide a non-binary / intersex model. |
| 2 | **Age** | integer | years | **40 – 69** | Validated only inside this band. Below 40: not applicable. ≥ 70: switch to SCORE2-OP. |
| 3 | **Smoking status** | enum | — | `current` \| `other` | "Current" = currently smoking any tobacco. "Other" = never-smoker or ex-smoker (the published model is binary; ex-smokers are pooled with never-smokers). |
| 4 | **Systolic blood pressure (SBP)** | number | mmHg | typical clinical range **100 – 200** mmHg | Use a recent, properly-measured office SBP (mean of repeat readings preferred). |
| 5 | **Total cholesterol** | number | mmol/L | typical clinical range **3.0 – 8.0** mmol/L | Convert from mg/dL by dividing by 38.67. |
| 6 | **HDL cholesterol** | number | mmol/L | typical clinical range **0.5 – 3.0** mmol/L | Convert from mg/dL by dividing by 38.67. |
| 7 | **Risk region** | enum | — | `low` \| `moderate` \| `high` \| `very_high` | Country-specific recalibration region; see § 2.1. |

> **Unit convention.** SCORE2 is published in SI units (mmol/L). Implementations that accept mg/dL must convert to mmol/L before applying the model: `mmol/L = mg/dL ÷ 38.67`.

### 2.1 Risk region assignment

The four European risk regions are assigned by country of residence based on age- and sex-standardised CVD mortality rates (WHO 2016 data):

| Region | Country examples (non-exhaustive — see Eur Heart J 2021 Table 1) |
|--------|------------------------------------------------------------------|
| **Low** | Belgium, Denmark, France, Israel, Luxembourg, Netherlands, Norway, Spain, Switzerland, United Kingdom |
| **Moderate** | Austria, Cyprus, Finland, Germany, Greece, Iceland, Ireland, Italy, Malta, Portugal, San Marino, Slovenia, Sweden |
| **High** | Albania, Bosnia and Herzegovina, Croatia, Czech Republic, Estonia, Hungary, Kazakhstan, Poland, Slovakia, Türkiye |
| **Very high** | Algeria, Armenia, Azerbaijan, Belarus, Bulgaria, Egypt, Georgia, Kyrgyzstan, Latvia, Lebanon, Libya, Lithuania, Montenegro, Morocco, North Macedonia, Republic of Moldova, Romania, Russian Federation, Serbia, Syrian Arab Republic, Tunisia, Ukraine, Uzbekistan |

For the authoritative country-to-region mapping, see Table 1 of the SCORE2 Working Group 2021 paper.

### 2.2 Input data model (suggested)

```text
Score2Inputs {
  sex:                "male" | "female"
  age_years:          number   # 40 .. 69
  smoking:            "current" | "other"
  sbp_mmHg:           number   # SBP in mmHg
  total_chol_mmol_L:  number   # total cholesterol in mmol/L
  hdl_chol_mmol_L:    number   # HDL cholesterol in mmol/L
  region:             "low" | "moderate" | "high" | "very_high"
}
```

---

## 3. Calculation

SCORE2 is a **competing-risks Cox proportional-hazards model**, fitted **separately for men and women**, with **age-interaction terms** for every predictor and **region-specific recalibration** of the baseline 10-year CVD incidence.

The pipeline is:

1. **Centre and scale** the predictors.
2. Compute the **linear predictor** `x` from sex-specific β-coefficients (main effects + age interactions).
3. Compute the **uncalibrated 10-year risk** from the published baseline survival.
4. Apply **region-specific recalibration scaling factors** to obtain the calibrated 10-year CVD risk.

### 3.1 Predictor centring and scaling

The published model uses the following centred / scaled predictors (per the SCORE2 Working Group 2021 supplement):

| Symbol | Predictor | Transformation |
|--------|-----------|----------------|
| `cage` | Centred age | `(age − 60) / 5` |
| `smoking` | Smoking | `1` if current smoker, else `0` |
| `csbp`  | Centred SBP | `(SBP − 120) / 20` |
| `ctchol` | Centred total cholesterol | `(total_chol_mmol_L − 6)` |
| `chdl`  | Centred HDL cholesterol | `(HDL_mmol_L − 1.3) / 0.5` |

> The exact centring constants and scale factors above match those used in the SCORE2 derivation; implementations **must** verify against Supplementary Table S6 of the 2021 publication before clinical use.

### 3.2 Linear predictor

For each sex, the linear predictor `x` is:

```
x =   β_age      · cage
    + β_smoking  · smoking
    + β_sbp      · csbp
    + β_tchol    · ctchol
    + β_hdl      · chdl
    + β_age_smk  · cage · smoking
    + β_age_sbp  · cage · csbp
    + β_age_tchol· cage · ctchol
    + β_age_hdl  · cage · chdl
```

### 3.3 Sex-specific β-coefficients

The β-coefficients below are the published log-subdistribution-hazard ratios from the SCORE2 derivation, reproduced from the supplementary appendix of *Eur Heart J* 2021;42:2439–2454 and cross-checked against the open-source R port `dvicencio/RiskScorescvd` (`R/11_SCORE2_func.R`).

| Term | Symbol | Men (β) | Women (β) |
|------|--------|---------|-----------|
| Age (centred, per 5 yr) | β_age | 0.3742 | 0.4648 |
| Current smoker | β_smoking | 0.6012 | 0.7744 |
| SBP (centred, per 20 mmHg) | β_sbp | 0.2777 | 0.3131 |
| Total cholesterol (centred, per 1 mmol/L) | β_tchol | 0.1458 | 0.1002 |
| HDL cholesterol (centred, per 0.5 mmol/L) | β_hdl | −0.2698 | −0.2606 |
| Age × smoking | β_age_smk | −0.0755 | −0.1088 |
| Age × SBP | β_age_sbp | −0.0255 | −0.0277 |
| Age × total cholesterol | β_age_tchol | −0.0281 | −0.0226 |
| Age × HDL cholesterol | β_age_hdl | 0.0426 | 0.0613 |

> **Note on diabetes.** The SCORE2 derivation included a diabetes term (β_dm = 0.6457 men / 0.8096 women, plus age × dm interaction = −0.0983 men / −0.1272 women) because the population used for fitting and recalibration included people with diabetes. SCORE2 itself, however, is **not validated for use in patients with diabetes** — for those patients use **SCORE2-Diabetes**. In a SCORE2 implementation targeting non-diabetic adults, set the diabetes indicator to 0 so the term drops out (see Eur Heart J 2021 supplement, footnote on page 9).

**Source of truth:** SCORE2 Working Group, *Eur Heart J* 2021;42:2439–2454, **Supplementary material online** (β-coefficients table). Cross-validated against the R reference port: <https://github.com/dvicencio/RiskScorescvd/blob/main/R/11_SCORE2_func.R>. Implementers must unit-test against the worked examples in the supplement.

### 3.4 Uncalibrated 10-year risk

```
risk_uncal = 1 − S0(10)^exp(x)
```

where **`S0(10)`** is the published baseline 10-year survival (sex-specific) from the SCORE2 derivation cohort. The two published baseline survivals are:

| Sex | `S0(10)` | Source |
|-----|----------|--------|
| Men | 0.9605 | Eur Heart J 2021 suppl. |
| Women | 0.9776 | Eur Heart J 2021 suppl. |

### 3.5 Region-specific recalibration

The uncalibrated risk is recalibrated to each region using **two scaling factors per region per sex** (`scale1`, `scale2`) that map the linear predictor onto the region-specific population baseline:

```
risk_calibrated = 1 − exp( −exp( scale1 + scale2 · ln( −ln( 1 − risk_uncal ) ) ) )
```

| Region | Men: `scale1`, `scale2` | Women: `scale1`, `scale2` |
|--------|--------------------------|----------------------------|
| Low | −0.5699, 0.7476 | −0.7380, 0.7019 |
| Moderate | −0.1565, 0.8009 | −0.3143, 0.7701 |
| High | 0.3207, 0.9360 | 0.5710, 0.9369 |
| Very high | 0.5836, 0.8294 | 0.9412, 0.8329 |

**Source of truth:** SCORE2 Working Group, *Eur Heart J* 2021;42:2439–2454, **Supplementary material online** (region-specific recalibration scaling factors). Eight value pairs total (4 regions × 2 sexes). Cross-validated against `dvicencio/RiskScorescvd` `R/11_SCORE2_func.R` (lines 94–128).

### 3.6 Final output

```
score2_10yr_risk_pct = round( 100 · risk_calibrated , 1 )   # report to 1 decimal, then floor to integer % per ESC convention
```

The 2021 ESC Guidelines and MDCalc display the result as an **integer percentage**.

---

## 4. Output

### 4.1 Risk categories (age-dependent thresholds)

Per the 2021 ESC CVD prevention guidelines, **risk thresholds depend on age band**:

| Age band | Low–to–moderate risk (consider risk-factor treatment) | High risk (treatment generally recommended) | Very high risk (treatment recommended) |
|----------|-------------------------------------------------------|---------------------------------------------|-----------------------------------------|
| **< 50 years** | < 2.5 % | 2.5 % to < 7.5 % | ≥ 7.5 % |
| **50 – 69 years** | < 5 % | 5 % to < 10 % | ≥ 10 % |

> The age-band split is at **age 50** (i.e. 40–49 use the lower-threshold band; 50–69 use the higher-threshold band). For ≥ 70, use **SCORE2-OP**, which has its own thresholds.

### 4.2 Output data model (suggested)

```text
Score2Result {
  risk_pct:        number         # 10-year fatal+non-fatal CVD risk, %
  risk_category:   "low_to_moderate" | "high" | "very_high"
  age_band:        "40_49" | "50_69"
  inputs_echo:     Score2Inputs   # echo of sanitised inputs for audit
  model_version:   "SCORE2-2021"  # for traceability
}
```

### 4.3 Clinical interpretation (per 2021 ESC Guidelines)

- **Low-to-moderate risk:** lifestyle advice; consider risk-factor treatment if persistent or compounded by risk modifiers (family history, ethnicity, psychosocial stress, frailty, imaging findings such as CAC > 100, etc.).
- **High risk:** risk-factor treatment generally recommended (statin therapy, BP control, lifestyle).
- **Very high risk:** risk-factor treatment recommended; consider intensified targets (e.g. LDL-C < 1.4 mmol/L for primary prevention very-high risk).

### 4.4 Caveats

- SCORE2 estimates **population average** risk; risk modifiers (CAC score, family history, ethnicity, socioeconomic status, chronic inflammatory disease, severe mental illness) may shift an individual up or down within the bands.
- The model is **calibrated to European populations only**; do not apply outside the four published regions without dedicated recalibration.
- Use the **correct model** for the patient: SCORE2 (40–69, no DM/CVD/CKD), SCORE2-OP (≥ 70), SCORE2-Diabetes (T2DM).
- Model is **binary in smoking** and **binary in sex** — clinically nuanced cases (recent quitters, intersex / non-binary patients) require clinical judgement.
- Inputs outside typical clinical ranges (e.g. SBP < 100 or > 200 mmHg, total cholesterol > 8 mmol/L) should trigger a clinician review rather than blind extrapolation.

---

## 5. References

### Primary publication

1. **SCORE2 Working Group and ESC Cardiovascular Risk Collaboration.** SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe. *European Heart Journal.* 2021;42(25):2439–2454.
   DOI: [10.1093/eurheartj/ehab309](https://doi.org/10.1093/eurheartj/ehab309) — <https://academic.oup.com/eurheartj/article/42/25/2439/6297709>
   **Supplementary material** (β-coefficients, baseline survivals, recalibration scaling factors): <https://academic.oup.com/eurheartj/article/42/25/2439/6297709#supplementary-data>

### Endorsing guideline

2. **Visseren FLJ, Mach F, Smulders YM, et al.; ESC Scientific Document Group.** 2021 ESC Guidelines on cardiovascular disease prevention in clinical practice. *European Heart Journal.* 2021;42(34):3227–3337.
   DOI: [10.1093/eurheartj/ehab484](https://doi.org/10.1093/eurheartj/ehab484) — PMID: [34458905](https://pubmed.ncbi.nlm.nih.gov/34458905/)

### Companion models (out of scope of this SPEC)

3. **SCORE2-OP Working Group and ESC Cardiovascular Risk Collaboration.** SCORE2-OP risk prediction algorithms: estimating incident cardiovascular event risk in older persons in four geographical risk regions. *European Heart Journal.* 2021;42(25):2455–2467.
   DOI: [10.1093/eurheartj/ehab312](https://doi.org/10.1093/eurheartj/ehab312)

4. **SCORE2-Diabetes Working Group and ESC Cardiovascular Risk Collaboration.** SCORE2-Diabetes: 10-year cardiovascular risk estimation in type 2 diabetes in Europe. *European Heart Journal.* 2023;44(28):2544–2556.
   DOI: [10.1093/eurheartj/ehad260](https://doi.org/10.1093/eurheartj/ehad260)

### Calculator source

- MDCalc — Systematic Coronary Risk Evaluation (SCORE2): <https://www.mdcalc.com/calc/10499/systematic-coronary-risk-evaluation-score2>
- ESC HeartScore (official online calculator): <https://heartscore.escardio.org/>

---

## Implementation notes

- **Numerical precision.** Compute internally in `float64`; the linear-predictor exponentiation is sensitive to coefficient precision — transcribe β values to **at least 4 decimal places**.
- **Unit-test fixtures.** The 2021 paper supplement provides worked examples — use these as golden test cases. At minimum, test the four canonical extremes: (low-region young female non-smoker with optimal lipids/SBP) and (very-high-region 69-year-old male smoker with elevated SBP and cholesterol), for both sexes.
- **Reporting.** Per ESC convention, display risk as an integer percentage (e.g. "4 %"), but retain the float internally to support correct threshold comparisons (e.g. 2.49 % vs 2.50 %).
- **Versioning.** Record `model_version = "SCORE2-2021"` in the output payload to allow future migration to updated coefficients without silent behaviour change.
