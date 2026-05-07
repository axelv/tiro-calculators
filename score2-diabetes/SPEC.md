# SCORE2-Diabetes

10-year cardiovascular disease (CVD) risk prediction in European adults with type 2 diabetes.

## 1. Purpose

SCORE2-Diabetes estimates the **10-year risk of fatal and non-fatal cardiovascular disease (CVD)** events (myocardial infarction, stroke, and CVD death) in adults aged **40–69 years** with **type 2 diabetes mellitus** and **without prior CVD**. It extends the SCORE2 algorithm by incorporating diabetes-specific predictors (age at diabetes diagnosis, HbA1c, eGFR) and is the model recommended by the **2023 ESC Guidelines** for CVD risk stratification in patients with diabetes.

### Indications / Eligibility

| Criterion | Value |
|-----------|-------|
| Age | 40–69 years |
| Population | European, type 2 diabetes |
| Prior CVD | None (no prior MI, stroke, or established atherosclerotic CVD) |
| Setting | Primary prevention |

### Contraindications / Not validated for

- Type 1 diabetes
- Age < 40 years (use SCORE2 caution / lifetime estimators) or ≥ 70 years (use **SCORE2-OP** instead)
- Patients with established CVD, severe CKD, familial hypercholesterolaemia, or pregnancy
- Non-European populations (use locally recalibrated equivalents where available)

---

## 2. Inputs

All inputs required to compute the linear predictor.

| # | Variable | Type | Unit | Valid range | Notes |
|---|----------|------|------|-------------|-------|
| 1 | `sex` | categorical | — | `male` \| `female` | Sex-specific β-coefficients and baseline survival |
| 2 | `age` | numeric | years | 40–69 | Centered at 60 (subtract 60, divide by 5 for "per 5 years" units) |
| 3 | `smoker_current` | boolean | — | `true` \| `false` | Current smoker = 1; former/never = 0 |
| 4 | `sbp` | numeric | mmHg | 100–200 | Systolic blood pressure; centered at 120, scaled per 20 mmHg |
| 5 | `total_cholesterol` | numeric | mmol/L | 3.0–8.0 | Centered at 6 mmol/L, per 1 mmol/L (multiply mg/dL by 0.02586) |
| 6 | `hdl_cholesterol` | numeric | mmol/L | 0.6–2.5 | Centered at 1.3 mmol/L, per 0.5 mmol/L (multiply mg/dL by 0.02586) |
| 7 | `age_at_diabetes_diagnosis` | numeric | years | 20–69 | Centered at 50 years, per 5 years; must be ≤ current age |
| 8 | `hba1c` | numeric | mmol/mol | 20–110 | Centered at 31 mmol/mol (≈ 5.0%), per SD 9.34 mmol/mol; conversion: `mmol/mol = (% × 10.929) − 23.5` (NGSP↔IFCC) |
| 9 | `egfr` | numeric | mL/min/1.73 m² | 15–150 | CKD-EPI 2009 (or 2021) creatinine-based; transformed to `ln(eGFR/60)` and `ln(eGFR/60)²`; centered at 90 mL/min/1.73 m² |
| 10 | `risk_region` | categorical | — | `low` \| `moderate` \| `high` \| `very_high` | Country-level European recalibration zone (per 2021 ESC SCORE2 region map) |

### HbA1c unit conversion

| % (NGSP / DCCT) | mmol/mol (IFCC) |
|-----------------|-----------------|
| 5.0 | 31 |
| 6.0 | 42 |
| 7.0 | 53 |
| 8.0 | 64 |
| 9.0 | 75 |

`HbA1c (mmol/mol) = 10.929 × (HbA1c% − 2.15)`

### Risk region (ESC 2021/2023 mapping, abbreviated)

| Region | Example countries |
|--------|------------------|
| Low | Belgium, Denmark, France, Israel, Luxembourg, Norway, Spain, Switzerland, Netherlands, UK |
| Moderate | Austria, Cyprus, Finland, Germany, Greece, Iceland, Ireland, Italy, Malta, Portugal, San Marino, Slovenia, Sweden |
| High | Albania, Bosnia & Herzegovina, Croatia, Czechia, Estonia, Hungary, Kazakhstan, Poland, Slovakia, Turkey |
| Very high | Algeria, Armenia, Azerbaijan, Belarus, Bulgaria, Egypt, Georgia, Kyrgyzstan, Latvia, Lebanon, Libya, Lithuania, Moldova, Montenegro, Morocco, North Macedonia, Romania, Russia, Serbia, Syria, Tunisia, Ukraine, Uzbekistan |

---

## 3. Calculation

SCORE2-Diabetes uses **sex-specific competing-risk (Fine–Gray sub-distribution hazard) regression models** with diabetes-specific predictors, followed by **risk-region recalibration** of the baseline cumulative incidence.

### 3.1 Linear predictor

For each sex, compute the centered linear predictor `LP`:

```
LP = Σ ( β_i × (x_i − x̄_i) )      // main effects
   + Σ ( β_ij × (x_i − x̄_i) × (age − 60)/5 )   // age interactions
```

Predictors entering the model:

1. `(age − 60) / 5`
2. `smoker_current` (0/1)
3. `(sbp − 120) / 20`
4. `total_cholesterol − 6`
5. `hdl_cholesterol − 1.3`
6. `(age_at_diabetes_diagnosis − 50) / 5`
7. `(hba1c − 31) / 9.34`            *(per 1 SD)*
8. `ln(egfr / 60)`
9. `ln(egfr / 60)²`                 *(quadratic; non-linear association)*
10. Age interactions for: smoking, SBP, total chol, HDL chol, age at diabetes onset, HbA1c, ln(eGFR)

### 3.2 Uncalibrated 10-year risk

```
risk_uncalibrated = 1 − S0(10)^exp(LP)
```

with sex-specific baseline survival at 10 years used in the SCORE2-Diabetes calculator:

| Sex | S0(10) |
|-----|--------|
| Men | 0.9605 |
| Women | 0.9776 |

Note: the published main text reports the median baseline survival in the derivation cohorts as 0.9625 (men) and 0.9795 (women). The values used in the published reference algorithm (and reproduced by the open-source `RiskScorescvd` R package, file `R/15_SCORE2-Diabetes_func.R`) are 0.9605 and 0.9776 respectively. Use the calculator values for risk computation.

### 3.3 Region recalibration

Apply scaling on the complementary log–log scale:

```
ln(−ln(1 − risk_recalibrated)) = scale1_region_sex + scale2_region_sex × ln(−ln(1 − risk_uncalibrated))
```

`scale1` and `scale2` are **sex- and region-specific** constants taken from SCORE2/SCORE2-Diabetes recalibration (low / moderate / high / very high). The recalibrated 10-year risk is:

```
risk_recalibrated = 1 − exp( −exp( scale1 + scale2 × ln(−ln(1 − risk_uncalibrated)) ) )
```

### 3.4 Coefficients (β) — log-sub-distribution-hazard

Sub-distribution-hazard ratios are reported in the SCORE2-Diabetes Writing Group (2023) paper (Table 2). The β values below are the log of those HRs and have been reproduced from the open-source reference R implementation in [`dvicencio/RiskScorescvd`](https://github.com/dvicencio/RiskScorescvd) (file [`R/15_SCORE2-Diabetes_func.R`](https://github.com/dvicencio/RiskScorescvd/blob/main/R/15_SCORE2-Diabetes_func.R)), which encodes the published Stata algorithm. They reproduce the worked examples in the paper's structured graphical abstract (e.g. 60-year-old non-smoking man, low-risk region, newly diagnosed diabetes, HbA1c 50, eGFR 90 → 8.4%).

#### Main-effect β coefficients

| Predictor (per unit shown) | Men β | Women β | Men HR | Women HR |
|----------------------------|------:|--------:|-------:|---------:|
| `(age − 60)/5` (per 5 years) | **+0.5368** | **+0.6624** | 1.71 | 1.94 |
| `smoker_current` (0/1) | **+0.4774** | **+0.6139** | 1.61 | 1.85 |
| `(sbp − 120)/20` (per 20 mmHg) | **+0.1322** | **+0.1421** | 1.14 | 1.15 |
| `diabetes` (0/1, fixed at 1 in this model) | **+0.6457** | **+0.8096** | 1.91 | 2.25 |
| `(total_cholesterol − 6)` (per 1 mmol/L) | **+0.1102** | **+0.1127** | 1.12 | 1.12 |
| `(hdl_cholesterol − 1.3)/0.5` (per 0.5 mmol/L) | **−0.1087** | **−0.1568** | 0.90 | 0.85 |
| `diabetes × (diabetes_age − 50)/5` (per 5 yr) | **−0.0998** | **−0.1180** | 0.90 | 0.89 |
| `(hba1c − 31)/9.34` (per SD = 9.34 mmol/mol) | **+0.0955** | **+0.1173** | 1.10 | 1.12 |
| `(ln(eGFR) − 4.5)/0.15` (per SD = 0.15 ln-units) | **−0.0591** | **−0.0640** | 0.94 | 0.94 |
| `((ln(eGFR) − 4.5)/0.15)²` (quadratic) | **+0.0058** | **+0.0062** | 1.01 | 1.01 |

#### Age-interaction β coefficients (multiplied by `(age − 60)/5`)

| Interaction | Men β | Women β |
|-------------|------:|--------:|
| `(age − 60)/5 × smoker_current` | **−0.0672** | **−0.1122** |
| `(age − 60)/5 × (sbp − 120)/20` | **−0.0268** | **−0.0167** |
| `(age − 60)/5 × diabetes` | **−0.0983** | **−0.1272** |
| `(age − 60)/5 × (total_cholesterol − 6)` | **−0.0181** | **−0.0200** |
| `(age − 60)/5 × (hdl_cholesterol − 1.3)/0.5` | **+0.0095** | **+0.0186** |
| `(age − 60)/5 × (hba1c − 31)/9.34` | **−0.0134** | **−0.0196** |
| `(age − 60)/5 × (ln(eGFR) − 4.5)/0.15` | **+0.0115** | **+0.0169** |

Notes:
- `ln(eGFR)` enters the model centered at 4.5 (≈ ln 90) and scaled by 0.15 (≈ 1 SD on the log scale, equivalent to "per ~15% change").
- `diabetes` is fixed at 1 in the SCORE2-Diabetes (T2DM) model, so its main effect contributes a constant +0.6457 (men) / +0.8096 (women) to the linear predictor.
- The published Table 2 hazard ratios are the *combined* SCORE2-base + SCORE2-Diabetes additional coefficients (i.e. the values above are already the full effects to use in calculation).

#### Region recalibration constants

Apply on the complementary log–log scale:
```
risk_recalibrated = 1 − exp(−exp(scale1 + scale2 × ln(−ln(1 − risk_uncalibrated))))
```

| Region | Sex | scale1 | scale2 |
|--------|-----|------:|------:|
| Low | male | **−0.5699** | **0.7476** |
| Moderate | male | **−0.1565** | **0.8009** |
| High | male | **+0.3207** | **0.9360** |
| Very high | male | **+0.5836** | **0.8294** |
| Low | female | **−0.7380** | **0.7019** |
| Moderate | female | **−0.3143** | **0.7701** |
| High | female | **+0.5710** | **0.9369** |
| Very high | female | **+0.9412** | **0.8329** |

These rescaling factors are identical to those used in the original SCORE2 (2021) recalibration (per the SCORE2-Diabetes paper text: *"The rescaling factors used in recalibration of SCORE2-Diabetes were identical to those used in recalibration of the SCORE2 risk models"*). Source: [`dvicencio/RiskScorescvd`](https://github.com/dvicencio/RiskScorescvd/blob/main/R/15_SCORE2-Diabetes_func.R), reproducing the published Stata implementation.

### 3.5 Reference Stata implementation

The authors publish reference Stata code for the algorithm; it is available on request and partially reproduced in the supplementary appendix of the SCORE2-Diabetes paper. The β-coefficients and recalibration constants above are reproduced from the open-source CRAN/GitHub R port `RiskScorescvd::SCORE2_Diabetes()` and have been verified against worked examples from the paper (e.g. 60-year-old non-smoking man, low-risk region, newly diagnosed diabetes, HbA1c 50 mmol/mol, eGFR 90, SBP 140, TC 5.5, HDL 1.3 → 8.4%; same patient diagnosed 10 years previously with HbA1c 70, eGFR 60 → 12.9%; women equivalents 6.1% and 9.8%). Any independent implementation MUST be cross-validated against the same worked examples before clinical use.

---

## 4. Output

### 4.1 Primary output

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `risk_10y_pct` | numeric | % | 10-year predicted absolute risk of fatal + non-fatal CVD, region-recalibrated |
| `risk_band` | categorical | — | Risk category (see below) |

### 4.2 Risk bands (2023 ESC Guidelines)

| Risk band | 10-year CVD risk | Recommended LDL-C target | Action |
|-----------|------------------|--------------------------|--------|
| Low–to–moderate | < 5 % | No specific target beyond lifestyle | Lifestyle advice |
| High | 5 – < 10 % | < 2.6 mmol/L (100 mg/dL) | Consider statin |
| Very high | 10 – < 20 % | < 1.8 mmol/L (70 mg/dL) and ≥ 50 % reduction | Statin recommended |
| Very high | ≥ 20 % | < 1.4 mmol/L (55 mg/dL) and ≥ 50 % reduction | Intensive lipid-lowering |

Note: For people with diabetes plus target-organ damage or ≥ 3 major risk factors, ESC classifies risk as very high *regardless* of SCORE2-Diabetes output.

### 4.3 Output schema (suggested)

```json
{
  "risk_10y_pct": 12.4,
  "risk_band": "very_high",
  "linear_predictor": 0.83,
  "baseline_survival": 0.9625,
  "uncalibrated_risk_pct": 9.7,
  "region": "moderate",
  "model_version": "SCORE2-Diabetes-2023"
}
```

---

## 5. References

### Primary publication
- **SCORE2-Diabetes Working Group and the ESC Cardiovascular Risk Collaboration.** SCORE2-Diabetes: 10-year cardiovascular risk estimation in type 2 diabetes in Europe. *European Heart Journal* 2023;44(28):2544–2556. doi:10.1093/eurheartj/ehad260.
  - https://academic.oup.com/eurheartj/article/44/28/2544/7188107

### Guidelines
- **Marx N, Federici M, Schütt K, et al.** 2023 ESC Guidelines for the management of cardiovascular disease in patients with diabetes. *European Heart Journal* 2023;44(39):3960–4156. doi:10.1093/eurheartj/ehad192.
- **Visseren FLJ, Mach F, Smulders YM, et al.** 2021 ESC Guidelines on cardiovascular disease prevention in clinical practice. *European Heart Journal* 2021;42(34):3227–3337. doi:10.1093/eurheartj/ehab484.

### Related models (same family)
- **SCORE2 Working Group.** SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe. *Eur Heart J* 2021;42(25):2439–2454.
- **SCORE2-OP Working Group.** SCORE2-OP risk prediction algorithms (≥ 70 years). *Eur Heart J* 2021;42(25):2455–2467.

### Online tools
- MDCalc — SCORE2-Diabetes: https://www.mdcalc.com/calc/10510/score2-diabetes
- ESC CVD Risk Calculation app: https://www.escardio.org/Education/ESC-Prevention-of-CVD-Programme/Risk-assessment

### Implementation notes
- Reference Stata code is available on request from the authors of the primary publication and is published as Supplementary Appendix 1/2 of the *Eur Heart J* 2023 article.
- The β-coefficients and region recalibration constants in §3.4 are reproduced from the open-source R port [`dvicencio/RiskScorescvd`, file `R/15_SCORE2-Diabetes_func.R`](https://github.com/dvicencio/RiskScorescvd/blob/main/R/15_SCORE2-Diabetes_func.R), which encodes the published Stata algorithm and reproduces the worked examples in the SCORE2-Diabetes paper.
