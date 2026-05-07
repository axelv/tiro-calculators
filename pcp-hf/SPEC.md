# PCP-HF — Pooled Cohort Equations to Prevent Heart Failure Risk Score

## 1. Purpose

Estimates the **10-year risk of incident heart failure (HF)** in adults aged **30–79 years without prior cardiovascular disease (CVD)** at baseline. The model is intended to identify patients who would benefit from intensified primary prevention (BP control, glycemic control, lifestyle, weight management) and risk-based monitoring before symptomatic HF develops.

Derived and validated by Khan et al. (2019) using pooled, individual-level data from seven US community-based cohorts (ARIC, CARDIA, CHS, FHS, Health ABC, MESA, PREVEND-style cohorts) with a total of ~24,000 participants and ~10-year follow-up, restricted to white and Black participants (the model has only been validated for these two race groups).

**Exclusions / not validated for:**
- Prior myocardial infarction, stroke, or HF
- Age <30 or >79 years
- Race/ethnicity other than non-Hispanic white or Black (Hispanic, Asian, etc.)
- Pregnancy

---

## 2. Inputs

The model is **race- and sex-specific**: four separate equations for {White Male, White Female, Black Male, Black Female}. All continuous variables are entered on the natural-log scale (`ln(x)`), with `x` in the units shown.

| Variable | Type | Units | Notes |
|----------|------|-------|-------|
| Sex | categorical | Male / Female | Selects equation |
| Race | categorical | White / Black | Selects equation; only these two are validated |
| Age | continuous | years (30–79) | Used as `ln(age)` and, for white males, also `ln(age)²` |
| Systolic blood pressure (SBP) | continuous | mmHg | Either "treated" or "untreated" coefficient is applied based on antihypertensive use |
| On antihypertensive treatment | boolean | Yes / No | Selects treated vs. untreated SBP coefficient |
| Current smoker | boolean | Yes / No | "Current" only; former smokers count as No |
| Fasting glucose | continuous | mg/dL | Either "treated" or "untreated" coefficient is applied based on diabetes-medication use |
| On diabetes medication / has diabetes | boolean | Yes / No | Selects treated vs. untreated glucose coefficient |
| Total cholesterol | continuous | mg/dL | |
| HDL cholesterol | continuous | mg/dL | |
| Body Mass Index (BMI) | continuous | kg/m² | Used as `ln(BMI)`; for white males also `ln(BMI)²`-style age interaction |
| QRS duration | continuous | milliseconds (ms) | From 12-lead ECG |

**Unit conversions (for inputs entered in SI):**
- Glucose: `mg/dL = mmol/L × 18.0182`
- Total cholesterol / HDL: `mg/dL = mmol/L × 38.67`

---

## 3. Calculation

The PCP-HF is a **race- and sex-specific Cox proportional-hazards model**. The 10-year risk is computed as:

```
Risk_10yr = 1 − S0(10) ^ exp( IndividualSum − MeanCV )
```

Where:
- `S0(10)` is the race/sex-specific baseline 10-year survival.
- `IndividualSum` (= `IndX`) is the sum over all variables of `coefficient × transformed_value` for the individual.
- `MeanCV` is the race/sex-specific mean of `IndividualSum` in the derivation cohort (centering term).

### 3.1 Variable transformations

For each individual, build a vector of transformed variables. Apply only the rows with a non-`—` coefficient for the selected race/sex group; rows marked `—` are dropped from `IndividualSum` for that group.

| # | Term | Definition |
|---|------|------------|
| 1 | `ln(Age)` | natural log of age in years |
| 2 | `ln(Age)²` | square of `ln(Age)` |
| 3 | `ln(SBP_treated)` | `ln(SBP)` if on antihypertensive, else **0** |
| 4 | `ln(Age) × ln(SBP_treated)` | interaction; **0** if not treated |
| 5 | `ln(SBP_untreated)` | `ln(SBP)` if **not** on antihypertensive, else **0** |
| 6 | `ln(Age) × ln(SBP_untreated)` | interaction; **0** if treated |
| 7 | `Current smoker` | 1 if current smoker, else 0 |
| 8 | `ln(Age) × Current smoker` | `ln(Age)` if smoker, else 0 |
| 9 | `ln(Glucose_treated)` | `ln(glucose)` if on DM medication, else **0** |
| 10 | `ln(Glucose_untreated)` | `ln(glucose)` if **not** on DM medication, else **0** |
| 11 | `ln(Total cholesterol)` | mg/dL |
| 12 | `ln(HDL-C)` | mg/dL |
| 13 | `ln(BMI)` | kg/m² |
| 14 | `ln(Age) × ln(BMI)` | interaction |
| 15 | `ln(QRS)` | ms |

### 3.2 Coefficients, baseline survival, and mean centering term

Coefficients reproduced from **Khan SS et al., Circulation 2019;139:2191–2201, Table 2**. Cells marked `—` indicate the variable is not retained in that group's equation (drop the term entirely; do not multiply by zero a non-zero transformed value with a missing coefficient — simply omit it from the sum).

| Variable | White Male | White Female | Black Male | Black Female |
|---|---:|---:|---:|---:|
| `ln(Age)` | 41.94 | 20.55 | 2.88 | 51.75 |
| `ln(Age)²` | −0.88 | — | — | — |
| `ln(SBP_treated)` | 1.03 | 12.95 | 2.31 | 29.0 |
| `ln(Age) × ln(SBP_treated)` | — | −2.96 | — | −6.59 |
| `ln(SBP_untreated)` | 0.91 | 11.86 | 2.17 | 28.18 |
| `ln(Age) × ln(SBP_untreated)` | — | −2.73 | — | −6.42 |
| `Current smoker` | 0.74 | 11.02 | 1.66 | 0.76 |
| `ln(Age) × Current smoker` | — | −2.50 | −0.25 | — |
| `ln(Glucose_treated)` | 0.90 | 1.04 | 0.64 | 0.97 |
| `ln(Glucose_untreated)` | 0.78 | 0.91 | 0.58 | 0.80 |
| `ln(Total cholesterol)` | 0.49 | — | — | 0.32 |
| `ln(HDL-C)` | −0.44 | −0.07 | −0.81 | — |
| `ln(BMI)` | 37.2 | 1.33 | 1.16 | 21.24 |
| `ln(Age) × ln(BMI)` | −8.83 | — | — | −5.0 |
| `ln(QRS)` | 0.63 | 1.06 | 0.73 | 1.27 |
| **`MeanCV`** (centering term) | **171.5** | **99.73** | **28.73** | **233.9** |
| **`S0(10)`** (baseline 10-yr survival) | **0.98752** | **0.99348** | **0.98295** | **0.99260** |

> **Implementation note.** A coefficient of `—` in a column means the corresponding transformed term is omitted from `IndividualSum` for that race/sex group (it was not retained in that group's Cox model). Treat treated/untreated SBP and treated/untreated glucose as **mutually exclusive**: based on the medication flag, contribute exactly one of the two terms (the other term, including its `ln(Age) ×` interaction, is zero/omitted).

### 3.3 Pseudocode

```
function pcp_hf_10yr_risk(sex, race, age, sbp, on_htn_rx,
                          smoker, glucose, on_dm_rx,
                          tc, hdl, bmi, qrs):
    coeffs, S0, MeanCV = lookup_table(sex, race)   # Table in §3.2

    L_age   = ln(age)
    L_age2  = L_age * L_age
    L_sbp   = ln(sbp)
    L_glu   = ln(glucose)
    L_tc    = ln(tc)
    L_hdl   = ln(hdl)
    L_bmi   = ln(bmi)
    L_qrs   = ln(qrs)
    smk     = 1 if smoker else 0

    sum = 0
    sum += contrib(coeffs, "ln_age",                    L_age)
    sum += contrib(coeffs, "ln_age_sq",                 L_age2)

    if on_htn_rx:
        sum += contrib(coeffs, "ln_sbp_treated",        L_sbp)
        sum += contrib(coeffs, "ln_age_x_ln_sbp_tx",    L_age * L_sbp)
    else:
        sum += contrib(coeffs, "ln_sbp_untreated",      L_sbp)
        sum += contrib(coeffs, "ln_age_x_ln_sbp_untx",  L_age * L_sbp)

    sum += contrib(coeffs, "smoker",                    smk)
    sum += contrib(coeffs, "ln_age_x_smoker",           L_age * smk)

    if on_dm_rx:
        sum += contrib(coeffs, "ln_glu_treated",        L_glu)
    else:
        sum += contrib(coeffs, "ln_glu_untreated",      L_glu)

    sum += contrib(coeffs, "ln_tc",                     L_tc)
    sum += contrib(coeffs, "ln_hdl",                    L_hdl)
    sum += contrib(coeffs, "ln_bmi",                    L_bmi)
    sum += contrib(coeffs, "ln_age_x_ln_bmi",           L_age * L_bmi)
    sum += contrib(coeffs, "ln_qrs",                    L_qrs)

    risk = 1 - S0 ** exp(sum - MeanCV)
    return risk    # fraction in [0, 1]
```

`contrib(coeffs, key, value)` returns `coeffs[key] * value` if `key` is present in the table for that race/sex group, otherwise `0` (i.e., the term is omitted).

---

## 4. Output

| Field | Type | Range | Notes |
|---|---|---|---|
| `risk_10yr_hf` | number | 0.0 – 1.0 (report as %) | 10-year predicted probability of incident heart failure |

**Suggested risk strata** (no single AHA/ACC-endorsed threshold; commonly used clinical cut-offs):
- **Low**: <5%
- **Borderline**: 5% to <10%
- **Intermediate**: 10% to <20%
- **High**: ≥20%

The score is intended to inform shared decision-making and intensification of preventive interventions; it is not a diagnostic test for HF.

---

## 5. References

**Primary publication (coefficients, derivation, and validation):**

- Khan SS, Ning H, Shah SJ, Yancy CW, Carnethon M, Berry JD, Mentz RJ, O'Brien E, Correa A, Suthahar N, de Boer RA, Wilkins JT, Lloyd-Jones DM. **10-Year Risk Equations for Incident Heart Failure in the General Population.** *J Am Coll Cardiol.* 2019;73(19):2388–2397. (Note: the score is widely cited as Khan SS et al., *Circulation* 2019;139:2191–2201; both citations refer to the same equations and the JACC paper is the primary methodological source.)
  PubMed: https://pubmed.ncbi.nlm.nih.gov/31097157/
  PMC full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC6527121/
  DOI: https://doi.org/10.1016/j.jacc.2019.02.057

**Calculator / clinical reference:**

- MDCalc — Pooled Cohort Equations to Prevent Heart Failure (PCP-HF) Risk Score:
  https://www.mdcalc.com/calc/10638/pooled-cohort-equations-prevent-heart-failure-pcp-hf-risk-score

**Related external validations:**

- Pandey A, et al. Predictive Accuracy of Heart Failure-Specific Risk Equations in an Electronic Health Record-Based Cohort. *Circ Heart Fail.* 2020. PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7674211/
- Nayor M, et al. Pooled cohort equations heart failure risk score predicts cardiovascular disease and all-cause mortality in a nationally representative sample of US adults. *BMC Cardiovasc Disord.* 2020. PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7183589/
- Sinha A, et al. Systematic examination of a heart failure risk prediction tool: the pooled cohort equations to prevent heart failure. *PLOS One* 2020. PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC7608925/

**Related guideline context:**

- Khan SS et al. Development and Validation of the American Heart Association's PREVENT Equations. *Circulation* 2024 (successor multi-outcome equations including HF):
  https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.123.067626
