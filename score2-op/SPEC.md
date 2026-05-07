# SCORE2-OP (Older Persons) — 10-Year CVD Risk

Implementation specification for **SCORE2-OP** (Systematic COronary Risk Evaluation 2 – Older Persons), a sex-specific, region-recalibrated, competing-risk-adjusted prediction model for **10-year cardiovascular disease (CVD) risk in apparently healthy adults aged ≥70 years**.

Authoritative source: [MDCalc — SCORE2-OP](https://www.mdcalc.com/calc/10503/score2-older-persons-score2-op)

Primary publication: **SCORE2-OP Working Group and ESC Cardiovascular Risk Collaboration. SCORE2-OP risk prediction algorithms: estimating incident cardiovascular event risk in older persons in four geographical risk regions.** *European Heart Journal* 2021;42(25):2455–2467. DOI: [10.1093/eurheartj/ehab312](https://doi.org/10.1093/eurheartj/ehab312)

---

## 1. Purpose

Estimate the **10-year risk of fatal and non-fatal cardiovascular disease events** (myocardial infarction, stroke, and cardiovascular death) in **apparently healthy adults aged 70 years and older** across four European risk regions.

### Intended population
- Adults aged **70–89 years** (model derived in this age band; predictions outside this range are extrapolations).
- **Without** prior atherosclerotic cardiovascular disease (ASCVD).
- **Without** familial hypercholesterolemia.
- **Without** chronic kidney disease (separate algorithms apply).

### Do **not** use when**
- The patient has **established CVD** (prior MI, stroke, TIA, peripheral arterial disease, coronary revascularisation).
- Age **<70 years** — use **SCORE2** (40–69 years) instead.
- Type 2 **diabetes mellitus** with end-organ damage or longstanding disease is present — use **SCORE2-Diabetes** instead (note: MDCalc's SCORE2-OP form includes a diabetes input; the original 2021 derivation did **not** include diabetes as a predictor — see §3.4).
- Severe hypercholesterolemia or genetic dyslipidaemia.
- The patient is on lipid-lowering therapy and the pre-treatment lipid profile is unavailable.

---

## 2. Inputs

| # | Input | Type | Units | Allowed range | Notes |
|---|-------|------|-------|---------------|-------|
| 1 | **Sex** | enum | — | `male` \| `female` | Sex-specific coefficients are used; there is **no unisex model**. |
| 2 | **Age** | integer | years | **70 – 89** | Model derived on adults aged 65–84 followed up; the calculator is intended for use from age 70. Values outside 70–89 are extrapolations. |
| 3 | **Current smoker** | boolean | — | `true` \| `false` | "Current" = currently smoking any tobacco. Former smokers count as non-smokers in the model (clinical judgement may upgrade risk). |
| 4 | **Systolic blood pressure (SBP)** | number | mmHg | **100 – 200** (typical clinical range) | Use the average of repeated office measurements. Treated and untreated patients use the same coefficient. |
| 5 | **Total cholesterol** | number | mmol/L | **3.0 – 8.0** (typical) | If reported in mg/dL, convert: `mmol/L = mg/dL ÷ 38.67`. |
| 6 | **HDL cholesterol** | number | mmol/L | **0.5 – 2.5** (typical) | If reported in mg/dL, convert: `mmol/L = mg/dL ÷ 38.67`. |
| 7 | **Risk region** | enum | — | `low` \| `moderate` \| `high` \| `very_high` | Regional recalibration is **mandatory** — see §2.1 below. |
| 8 | *(optional)* **Diabetes mellitus** | boolean | — | `true` \| `false` | The 2021 SCORE2-OP derivation **did not include diabetes** as a predictor. MDCalc exposes a diabetes flag for parity with SCORE2-Diabetes; if `true`, prefer **SCORE2-Diabetes** when applicable, or treat diabetes as a clinical risk-modifier rather than a model input. |

### 2.1 Risk regions (ESC 2021)

The four regions are derived from World Health Organization age- and sex-standardised CVD mortality rates. Each region has a distinct **recalibration scaling factor** applied to the linear predictor (see §3.3).

| Region | Representative countries (non-exhaustive) |
|--------|-------------------------------------------|
| **Low risk**       | Belgium, Denmark, France, Israel, Luxembourg, Norway, Spain, Switzerland, the Netherlands, the United Kingdom |
| **Moderate risk**  | Austria, Cyprus, Finland, Germany, Greece, Iceland, Ireland, Italy, Malta, Portugal, San Marino, Slovenia, Sweden |
| **High risk**      | Albania, Bosnia and Herzegovina, Croatia, Czechia, Estonia, Hungary, Kazakhstan, Poland, Slovakia, Türkiye |
| **Very high risk** | Algeria, Armenia, Azerbaijan, Belarus, Bulgaria, Egypt, Georgia, Kyrgyzstan, Latvia, Lebanon, Libya, Lithuania, Montenegro, Morocco, North Macedonia, Republic of Moldova, Romania, Russian Federation, Serbia, Syrian Arab Republic, Tunisia, Ukraine, Uzbekistan |

Refer to the ESC 2021 CVD Prevention Guidelines (Visseren *et al.*, *Eur Heart J* 2021;42:3227-3337) for the authoritative country-to-region mapping.

### 2.2 Input data model (suggested)

```text
Score2OpInputs {
  sex:                "male" | "female"
  age_years:          integer 70..89
  current_smoker:     boolean
  sbp_mmhg:           number 100..200
  total_chol_mmol_l:  number 3.0..8.0
  hdl_chol_mmol_l:    number 0.5..2.5
  risk_region:        "low" | "moderate" | "high" | "very_high"
  diabetes:           boolean        # optional; not part of original SCORE2-OP β
}
```

---

## 3. Calculation

SCORE2-OP uses a **sex-specific Fine–Gray competing-risk model** (CVD event vs. non-CVD death as the competing risk) with **age-interaction terms** for each predictor and a region-specific **recalibration**. The 10-year CVD risk is computed in three steps:

1. Compute the **linear predictor** `LP` from the centred covariates and their age interactions (§3.1).
2. Apply the **baseline survival** (uncalibrated) at 10 years to obtain the uncalibrated predicted risk (§3.2).
3. Apply the **regional recalibration** to obtain the final 10-year CVD risk (§3.3).

### 3.1 Linear predictor

For sex `s ∈ {male, female}`, the linear predictor is:

```
LP_s =   β_age_s          · (age − 73)
       + β_smk_s          · smoking
       + β_sbp_s          · (SBP − 150) / 20
       + β_tchol_s        · (total_chol − 6.0)
       + β_hdl_s          · (HDL − 1.4)
       + β_age·smk_s      · (age − 73) · smoking
       + β_age·sbp_s      · (age − 73) · (SBP − 150) / 20
       + β_age·tchol_s    · (age − 73) · (total_chol − 6.0)
       + β_age·hdl_s      · (age − 73) · (HDL − 1.4)
```

Where:
- `smoking ∈ {0, 1}` (0 = non-smoker, 1 = current smoker).
- Centring constants (age 73, SBP 150 mmHg, total cholesterol 6.0 mmol/L, HDL 1.4 mmol/L) match the SCORE2-OP 2021 derivation cohort.
- All units are SI (mmol/L, mmHg, years).

### 3.2 Uncalibrated 10-year risk

```
risk_uncalibrated = 1 − S0_s(10) ^ exp(LP_s)
```

Where `S0_s(10)` is the **sex-specific baseline survival at 10 years** from the derivation cohort.

### 3.3 Regional recalibration

The uncalibrated risk is recalibrated per sex × region using region-specific scaling constants `(scale1, scale2)`:

```
risk_calibrated = 1 − exp( −exp( scale1_{s,r} + scale2_{s,r} · ln( −ln(1 − risk_uncalibrated) ) ) )
```

This is the standard SCORE2 recalibration form (a regional shift and slope on the complementary log-log scale). The final 10-year CVD risk is reported as `risk_calibrated × 100 %`.

### 3.4 Coefficients and constants

The published numerical values from the SCORE2-OP supplementary appendix (Eur Heart J 2021;42:2455–2467) are reproduced below and cross-validated against the open-source R port `dvicencio/RiskScorescvd` (`R/11_SCORE2_func.R`, the SCORE2-OP branch for `Age >= 70`).

#### 3.4.1 Sex-specific β-coefficients (age centred at 73)

| Term | Symbol | Men (β) | Women (β) |
|------|--------|---------|-----------|
| Age (per 1 yr above 73) | β_age | 0.0634 | 0.0789 |
| Current smoker | β_smk | 0.3524 | 0.4921 |
| SBP (centred, per 20 mmHg) | β_sbp | 0.0094 | 0.0102 |
| Total cholesterol (centred, per 1 mmol/L) | β_tchol | 0.0850 | 0.0605 |
| HDL cholesterol (centred, per 1 mmol/L) | β_hdl | −0.3564 | −0.3040 |
| Age × smoking | β_age·smk | −0.0247 | −0.0255 |
| Age × SBP | β_age·sbp | −0.0005 | −0.0004 |
| Age × total cholesterol | β_age·tchol | 0.0073 | −0.0009 |
| Age × HDL cholesterol | β_age·hdl | 0.0091 | 0.0154 |

> **Note on diabetes.** The SCORE2-OP derivation included a diabetes term (β_dm = 0.4245 men / 0.6010 women, age × dm interaction = −0.0174 men / −0.0107 women) for population-recalibration purposes, but **SCORE2-OP is not validated for use in patients with diabetes** — for those patients use SCORE2-Diabetes. In a SCORE2-OP implementation set the diabetes indicator to 0 so the term drops out.

#### 3.4.2 Baseline survival `S0(10)` and mean-LP centring

The published SCORE2-OP risk equation is:

```
risk_uncal = 1 − S0(10) ^ exp( LP − mean_LP )
```

where `mean_LP` is the cohort-mean linear predictor for that sex (subtracted to centre the baseline).

| Sex | `S0(10)` | `mean_LP` |
|-----|----------|-----------|
| Men | 0.7576 | 0.0929 |
| Women | 0.8082 | 0.2290 |

#### 3.4.3 Region-specific recalibration scaling factors

| Region | Men: `scale1`, `scale2` | Women: `scale1`, `scale2` |
|--------|--------------------------|----------------------------|
| Low | −0.34, 1.19 | −0.52, 1.01 |
| Moderate | 0.01, 1.25 | −0.10, 1.10 |
| High | 0.08, 1.15 | 0.38, 1.09 |
| Very high | 0.05, 0.70 | 0.38, 0.69 |

**Source of truth:** SCORE2-OP Working Group, *Eur Heart J* 2021;42:2455–2467, **Supplementary material online** (`ehab312_supplementary_data.zip`). Cross-validated against the R reference port: <https://github.com/dvicencio/RiskScorescvd/blob/main/R/11_SCORE2_func.R> (lines 131–164 for region scaling, 210–250 for the OP coefficients and baseline survival). Implementers should still load these constants from a versioned data file (e.g. `score2_op_coefficients.json`) and cite the source version in the data file header.

### 3.5 Reference implementation skeleton

```python
def score2_op(
    sex: Literal["male", "female"],
    age_years: int,
    current_smoker: bool,
    sbp_mmhg: float,
    total_chol_mmol_l: float,
    hdl_chol_mmol_l: float,
    risk_region: Literal["low", "moderate", "high", "very_high"],
) -> float:
    """Return 10-year CVD risk as a fraction in [0, 1]."""
    c = COEFFICIENTS[sex]                          # TBD — load from data file
    cal = RECALIBRATION[sex][risk_region]          # TBD — load from data file

    age_c   = age_years - 73
    sbp_c   = (sbp_mmhg - 150) / 20
    tchol_c = total_chol_mmol_l - 6.0
    hdl_c   = hdl_chol_mmol_l - 1.4
    smk     = 1 if current_smoker else 0

    lp = (
        c["age"]       * age_c
      + c["smk"]       * smk
      + c["sbp"]       * sbp_c
      + c["tchol"]     * tchol_c
      + c["hdl"]       * hdl_c
      + c["age_smk"]   * age_c * smk
      + c["age_sbp"]   * age_c * sbp_c
      + c["age_tchol"] * age_c * tchol_c
      + c["age_hdl"]   * age_c * hdl_c
    )

    # SCORE2-OP centres the baseline by subtracting the cohort mean LP
    # (mean_LP = 0.0929 for men, 0.2290 for women — see §3.4.2).
    risk_uncal = 1.0 - c["S0_10"] ** math.exp(lp - c["mean_LP"])
    # Recalibrate on the cloglog scale:
    cll = math.log(-math.log(1.0 - risk_uncal))
    risk_cal = 1.0 - math.exp(-math.exp(cal["scale1"] + cal["scale2"] * cll))
    return risk_cal
```

---

## 4. Output

### 4.1 Reported value

10-year CVD risk as a percentage, rounded to one decimal place (e.g. `12.4 %`).

### 4.2 Age-band-specific risk thresholds (ESC 2021 Guidelines)

For SCORE2-OP (age ≥70), the ESC 2021 Guidelines on CVD prevention specify thresholds **distinct from SCORE2** (40–69), reflecting the higher absolute baseline risk in older adults:

| Age band | Low-to-moderate risk | High risk | Very high risk |
|----------|----------------------|-----------|----------------|
| **≥70 years** | **< 7.5 %** | **7.5 % – < 15 %** | **≥ 15 %** |

Compare with SCORE2 (for context):

| Age band (SCORE2) | Low-to-moderate | High | Very high |
|-------------------|-----------------|------|-----------|
| <50 years         | <2.5 %          | 2.5 – <7.5 % | ≥7.5 % |
| 50–69 years       | <5 %            | 5 – <10 %    | ≥10 %  |
| ≥70 years (OP)    | <7.5 %          | 7.5 – <15 %  | ≥15 %  |

### 4.3 Treatment recommendations (ESC 2021)

| Risk band | Recommendation |
|-----------|----------------|
| **Low to moderate** (<7.5 %) | Risk-factor treatment **generally not recommended**; lifestyle counselling. Consider individualised treatment in the presence of risk-modifiers (e.g. frailty, life expectancy, patient preference). |
| **High** (7.5 % – <15 %)     | Risk-factor management **should be considered** after shared decision-making, weighing benefit, frailty, polypharmacy, and life expectancy. |
| **Very high** (≥15 %)        | Risk-factor management **should be recommended** unless contraindicated by frailty / limited life expectancy. |

### 4.4 Output data model (suggested)

```text
Score2OpResult {
  risk_10y_pct:    number          # 10-year CVD risk, %
  risk_band:       "low_to_moderate" | "high" | "very_high"
  age_band:        "ge_70"
  recommendation:  "lifestyle_only" | "treatment_consider" | "treatment_recommend"
  inputs_echo:     Score2OpInputs
  model_version:   string           # e.g. "score2-op-2021-v1"
  region:          "low" | "moderate" | "high" | "very_high"
}
```

### 4.5 Important caveats

- The model is for **primary prevention only**. Patients with established ASCVD are already in the highest-risk category by definition.
- **Frailty, biological age, polypharmacy, life expectancy, and patient preference** must be considered before initiating preventive therapy in older adults.
- **Competing non-CVD mortality** is high in this age group and explicitly modelled — interpret risk in the context of overall prognosis.
- Predictions outside age 70–89 are extrapolations and should be reported with caution.
- Use the **pre-treatment** lipid profile and untreated SBP (or current treated values, with awareness that the model treats these identically — clinical judgement applies).

---

## 5. References

### Primary publication

1. **SCORE2-OP Working Group and ESC Cardiovascular Risk Collaboration.** SCORE2-OP risk prediction algorithms: estimating incident cardiovascular event risk in older persons in four geographical risk regions. *European Heart Journal.* 2021;42(25):2455–2467.
   DOI: [10.1093/eurheartj/ehab312](https://doi.org/10.1093/eurheartj/ehab312)
   PubMed: <https://pubmed.ncbi.nlm.nih.gov/34120185/>
   Open access: <https://academic.oup.com/eurheartj/article/42/25/2455/6297709>
   Supplementary appendix (coefficients, baseline survival, recalibration constants): see journal supplementary data zip (`ehab312_supplementary_data.zip`).

### Companion publications

2. **SCORE2 Working Group and ESC Cardiovascular Risk Collaboration.** SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe. *European Heart Journal.* 2021;42(25):2439–2454.
   DOI: [10.1093/eurheartj/ehab309](https://doi.org/10.1093/eurheartj/ehab309)

3. **Visseren FLJ, Mach F, Smulders YM, *et al.*** 2021 ESC Guidelines on cardiovascular disease prevention in clinical practice. *European Heart Journal.* 2021;42(34):3227–3337.
   DOI: [10.1093/eurheartj/ehab484](https://doi.org/10.1093/eurheartj/ehab484)
   PubMed: <https://pubmed.ncbi.nlm.nih.gov/34458905/>

### Calculator source

- MDCalc — SCORE2-OP (Older Persons): <https://www.mdcalc.com/calc/10503/score2-older-persons-score2-op>

### Implementation note

Coefficients (`β`), baseline survival (`S0_10`), and region-specific recalibration constants (`scale1`, `scale2`) are **not reproduced inline** in this spec. Implementations must extract them from the supplementary appendix of reference [1] and store them in a versioned data file. The implementation must record the supplementary-data version (e.g. `ehab312_supplementary_data.zip`, accessed YYYY-MM-DD) in the model metadata.
