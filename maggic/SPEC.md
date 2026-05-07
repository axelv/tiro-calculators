# MAGGIC Risk Calculator for Heart Failure

**Specification (implementation-ready)**

Authoritative sources:
- MDCalc: https://www.mdcalc.com/calc/3803/maggic-risk-calculator-heart-failure
- Primary publication: Pocock SJ, Ariti CA, McMurray JJV, et al. *Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies*. **Eur Heart J** 2013;34(19):1404-1413. https://academic.oup.com/eurheartj/article/34/19/1404/422939
- Online tool: http://www.heartfailurerisk.org/

---

## 1. Purpose

The Meta-Analysis Global Group In Chronic Heart Failure (MAGGIC) risk score estimates **1-year and 3-year all-cause mortality** in adult patients (≥18 years) with chronic heart failure, across the full spectrum of ejection fraction (HFrEF, HFmrEF, HFpEF). Derived from individual-patient data on 39,372 patients from 30 cohort studies (registries and clinical trials).

Intended use: prognostic risk-stratification at clinic encounter; not a diagnostic tool. Use with caution in HFpEF (validation came later — see Rich et al., *J Am Heart Assoc* 2018) and in patients with advanced/end-stage HF.

---

## 2. Inputs

All 13 predictors are required.

| # | Variable | Type | Unit | Definition / Notes |
|---|----------|------|------|--------------------|
| 1 | Age | integer | years | Patient age at assessment. Range used in scoring: <55 to ≥80. |
| 2 | Sex | categorical | — | Male / Female. |
| 3 | BMI | numeric | kg/m² | Body mass index. Range: <15 to ≥30. |
| 4 | Systolic blood pressure (SBP) | integer | mmHg | Office SBP. Range: <110 to ≥150. |
| 5 | Ejection fraction (EF) | integer | % | Left-ventricular ejection fraction (any modality, typically echo). Range: <20 to ≥40. |
| 6 | NYHA class | categorical | I / II / III / IV | New York Heart Association functional class. |
| 7 | Creatinine | numeric | µmol/L (preferred) or mg/dL | Serum creatinine. MDCalc default is µmol/L; conversion: mg/dL × 88.4 ≈ µmol/L. |
| 8 | Current smoker | boolean | — | Yes / No. |
| 9 | Diabetes mellitus | boolean | — | Yes / No (any type). |
| 10 | COPD | boolean | — | Chronic obstructive pulmonary disease, Yes / No. |
| 11 | HF first diagnosed >18 months ago | boolean | — | Yes if duration of HF diagnosis exceeds 18 months; No if ≤18 months. |
| 12 | Beta-blocker use | boolean | — | Currently on a beta-blocker, Yes / No. |
| 13 | ACEi / ARB use | boolean | — | Currently on ACE-inhibitor or angiotensin-receptor-blocker, Yes / No. |

---

## 3. Calculation

The score is the sum of integer points across all variables. **Age and SBP have non-linear interactions with EF**: their point values are looked up in EF-stratified sub-tables (EF <30, 30-39, ≥40). EF itself contributes a separate base point value.

Total integer score range: **0 to ~50 points**.

### 3.1 EF base points

| EF (%) | Points |
|--------|--------|
| <20 | 7 |
| 20-24 | 6 |
| 25-29 | 5 |
| 30-34 | 3 |
| 35-39 | 2 |
| ≥40 | 0 |

### 3.2 Age points (stratified by EF)

| Age (years) | EF <30 | EF 30-39 | EF ≥40 |
|-------------|:------:|:--------:|:------:|
| <55 | 0 | 0 | 0 |
| 55-59 | 1 | 2 | 3 |
| 60-64 | 2 | 4 | 5 |
| 65-69 | 4 | 6 | 7 |
| 70-74 | 6 | 8 | 9 |
| 75-79 | 8 | 10 | 12 |
| ≥80 | 10 | 13 | 15 |

### 3.3 SBP points (stratified by EF)

| SBP (mmHg) | EF <30 | EF 30-39 | EF ≥40 |
|------------|:------:|:--------:|:------:|
| <110 | 5 | 3 | 2 |
| 110-119 | 4 | 2 | 1 |
| 120-129 | 3 | 1 | 1 |
| 130-139 | 2 | 1 | 0 |
| 140-149 | 1 | 0 | 0 |
| ≥150 | 0 | 0 | 0 |

### 3.4 BMI points

| BMI (kg/m²) | Points |
|-------------|:------:|
| <15 | 6 |
| 15-19 | 5 |
| 20-24 | 3 |
| 25-29 | 2 |
| ≥30 | 0 |

### 3.5 Creatinine points

| Creatinine (µmol/L) | Creatinine (mg/dL, approx.) | Points |
|---------------------|----------------------------|:------:|
| <90 | <1.0 | 0 |
| 90-109 | 1.0-1.2 | 1 |
| 110-129 | 1.2-1.5 | 2 |
| 130-149 | 1.5-1.7 | 3 |
| 150-169 | 1.7-1.9 | 4 |
| 170-209 | 1.9-2.4 | 5 |
| 210-249 | 2.4-2.8 | 6 |
| ≥250 | ≥2.8 | 8 |

> Implementation note: the original tables are in µmol/L; mg/dL ranges shown are computed from µmol/L ÷ 88.4 and rounded. Implementations should convert mg/dL inputs to µmol/L (× 88.4) and look up against the µmol/L table to remain faithful to Pocock 2013.

### 3.6 NYHA class points

| NYHA class | Points |
|------------|:------:|
| I | 0 |
| II | 2 |
| III | 6 |
| IV | 8 |

### 3.7 Binary / categorical predictors

| Predictor | Condition giving points | Points |
|-----------|------------------------|:------:|
| Sex | Male | +1 |
| Sex | Female | 0 |
| Current smoker | Yes | +1 |
| Diabetes | Yes | +3 |
| COPD | Yes | +2 |
| HF first diagnosed >18 months ago | Yes | +2 |
| Beta-blocker | **Not** on beta-blocker | +3 |
| ACEi / ARB | **Not** on ACEi/ARB | +1 |

> Note the inversion for beta-blocker and ACEi/ARB: points are added when the patient is **off** therapy (not on therapy is the higher-risk condition).

### 3.8 Total score

```
total_points =
    EF_points
  + Age_points[EF_band]
  + SBP_points[EF_band]
  + BMI_points
  + Creatinine_points
  + NYHA_points
  + (1 if Male else 0)
  + (1 if Smoker else 0)
  + (3 if Diabetes else 0)
  + (2 if COPD else 0)
  + (2 if HF_>18mo else 0)
  + (3 if not Beta_blocker else 0)
  + (1 if not ACEi_ARB else 0)
```

The `EF_band` is `<30` for EF<30, `30-39` for EF 30-39, and `≥40` for EF≥40.

### 3.9 Score → mortality lookup

The integer total score maps to predicted 1-year and 3-year all-cause mortality via a lookup table derived from the multivariable Poisson regression in Pocock 2013. Published anchor values bracket the table; the per-integer values for scores 1–49 are the remaining TBD in this spec:

| Score | 1-year mortality | 3-year mortality |
|------:|:----------------:|:----------------:|
| 0 | 1.5 % | 3.9 % |
| 1–49 | **TBD — see Pocock 2013 Appendix S1** | **TBD — see Pocock 2013 Appendix S1** |
| 50 | 84.2 % | 98.5 % |

> **Resolution attempted**: The full integer-to-mortality lookup table for scores 1–49 is published as **Appendix S1 of Pocock SJ et al., *Eur Heart J* 2013;34(19):1404–1413** (`doi:10.1093/eurheartj/ehs337`) and is implemented in the official online calculator at <http://www.heartfailurerisk.org/> (which was unreachable — `ECONNREFUSED` — at the time of authoring this spec) and on MDCalc at <https://www.mdcalc.com/calc/3803/maggic-risk-calculator-heart-failure>. WebFetch attempts to the Oxford Academic full text returned HTTP 403 (paywall), and consumer-facing reproductions (mdapp.co, appcardio.com, mdpi review articles, the Sartipy 2014 and Rich 2018 validation papers, OBSERVO-ICD sub-analyses) only reproduce the two anchor values (0 → 1.5/3.9 %, 50 → 84.2/98.5 %) and aggregate risk-group bands (e.g. risk groups 1–6 = scores 0–16, 17–20, 21–24, 25–28, 29–32, ≥33) but not the full per-integer lookup. **Do not fit a curve to the two anchor points** — the published mapping is non-linear (faster rise in the middle of the distribution) and any synthesised curve would diverge from the reference implementation. Implementations should either: (a) digitise Appendix S1 of Pocock 2013, or (b) at runtime query the official online calculator at heartfailurerisk.org for each integer score and cache the results, or (c) use the MAGGIC R package or other open-source implementation that has already encoded the lookup table verbatim.

---

## 4. Output

The calculator returns:

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `total_points` | integer | points | Sum of all predictor points (0-50). |
| `mortality_1yr` | numeric | % (0-100) | Predicted 1-year all-cause mortality. |
| `mortality_3yr` | numeric | % (0-100) | Predicted 3-year all-cause mortality. |

Optional derived fields for clinical display:
- `survival_1yr` = 100 − `mortality_1yr`
- `survival_3yr` = 100 − `mortality_3yr`
- `risk_band` (tertile or quintile labels per Pocock 2013, e.g. low / intermediate / high)

---

## 5. References

1. **Pocock SJ, Ariti CA, McMurray JJV, Maggioni A, Køber L, Squire IB, Swedberg K, Dobson J, Poppe KK, Whalley GA, Doughty RN; Meta-Analysis Global Group in Chronic Heart Failure.** *Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies.* **European Heart Journal** 2013;34(19):1404-1413. doi:10.1093/eurheartj/ehs337.
   https://academic.oup.com/eurheartj/article/34/19/1404/422939

2. **Sartipy U, Dahlström U, Edner M, Lund LH.** *Predicting survival in heart failure: validation of the MAGGIC heart failure risk score in 51 043 patients from the Swedish Heart Failure Registry.* **Eur J Heart Fail** 2014;16(2):173-179.
   https://onlinelibrary.wiley.com/doi/10.1111/ejhf.32

3. **Rich JD, Burns J, Freed BH, Maurer MS, Burkhoff D, Shah SJ.** *Meta-Analysis Global Group in Chronic (MAGGIC) Heart Failure Risk Score: Validation of a Simple Tool for the Prediction of Morbidity and Mortality in Heart Failure With Preserved Ejection Fraction.* **J Am Heart Assoc** 2018;7(20):e009594.
   https://www.ahajournals.org/doi/10.1161/JAHA.118.009594

4. **MDCalc — MAGGIC Risk Calculator for Heart Failure.**
   https://www.mdcalc.com/calc/3803/maggic-risk-calculator-heart-failure

5. **Official MAGGIC online calculator (heartfailurerisk.org)** — reference implementation by the original authors.
   http://www.heartfailurerisk.org/
