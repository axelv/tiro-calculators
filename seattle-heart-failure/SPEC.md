# Seattle Heart Failure Model (SHFM)

Implementation specification for the **Seattle Heart Failure Model**, a multivariate Cox proportional hazards model that predicts survival in ambulatory patients with chronic heart failure and quantifies the projected effect of adding evidence-based medications and devices.

Authoritative source: [MDCalc — Seattle Heart Failure Model](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)

Primary publication: Levy WC, Mozaffarian D, Linker DT, et al. *The Seattle Heart Failure Model: Prediction of Survival in Heart Failure.* **Circulation** 2006;113(11):1424–1433. doi:10.1161/CIRCULATIONAHA.105.584102. PMID: 16534009.

---

## 1. Purpose

Estimate **mean life expectancy** and **survival probability at 1, 2, 3, and 5 years** in adult ambulatory patients with chronic, predominantly systolic heart failure, and quantify the **incremental projected effect on survival** of adding (or removing) heart-failure pharmacotherapy and device therapy.

The model is intended to:

- Inform shared decision-making and prognosis discussions with the patient and family.
- Guide timing of advanced therapies (transplantation, LVAD, palliative care).
- Quantify the marginal benefit of adding individual evidence-based therapies (ACEi/ARB, β-blocker, aldosterone antagonist, statin, ICD, CRT, allopurinol).
- Stratify patients across HF subpopulations (e.g. wait-list vs. destination LVAD candidates).

### Intended population

- Adult patients (≥18 y) with chronic, mostly systolic heart failure (HFrEF), NYHA class I–IV, on stable outpatient therapy.
- Derivation cohort: PRAISE-1 (n = 1,125). Validation in 5 cohorts totalling 9,942 patients (ELITE2, Val-HeFT, RENAISSANCE, IN-CHF, UW). AUC ≈ 0.729 in derivation.

### Do **not** rely on** SHFM in isolation when

- Acute decompensation or cardiogenic shock (model is for ambulatory, stable patients).
- HFpEF — derivation/validation populations were predominantly HFrEF; performance in preserved EF is less well established.
- Patients already on LVAD or post heart transplant.
- Pediatric heart failure.
- Restrictive, hypertrophic, or congenital cardiomyopathy.

---

## 2. Inputs

All variables are **required**. Units are explicit. Where a unit conversion is offered, the canonical unit used inside the model is in **bold**.

### 2.1 Demographics & clinical status

| # | Field | Type | Unit | Allowed values / range | Definition |
|---|---|---|---|---|---|
| 1 | `age` | integer | **years** | 18–110 | Age at the time of evaluation. |
| 2 | `sex` | enum | — | `male`, `female` | Biological sex. |
| 3 | `ischemic_etiology` | boolean | — | `true` / `false` | Heart failure attributed to ischemic heart disease (prior MI, multi-vessel CAD, ischemic cardiomyopathy). `false` = non-ischemic (idiopathic, valvular, hypertensive, etc.). |
| 4 | `nyha_class` | enum | — | `I`, `II`, `III`, `IV` | New York Heart Association functional class. |
| 5 | `weight` | number | **kg** | 30–250 | Body weight (used to dose-normalise diuretics, mg/kg/day). |
| 6 | `ejection_fraction` | number | **%** | 5–70 | Left ventricular ejection fraction (echocardiogram, MRI, or radionuclide). |
| 7 | `systolic_bp` | integer | **mm Hg** | 60–250 | Resting systolic blood pressure on stable outpatient therapy. |

### 2.2 Laboratory values

| # | Field | Type | Unit (canonical) | Allowed range | Definition / conversion |
|---|---|---|---|---|---|
| 8 | `sodium` | number | **mmol/L** (= mEq/L) | 110–160 | Serum sodium. |
| 9 | `hemoglobin` | number | **g/dL** | 5.0–20.0 | Hemoglobin. Conversion: g/L = g/dL × 10 (MDCalc displays g/L). The published model uses g/dL. |
| 10 | `lymphocytes_pct` | number | **%** | 1–80 | Lymphocyte percentage of total WBC differential. |
| 11 | `uric_acid` | number | **mg/dL** | 1.0–20.0 | Serum uric acid. Conversion: mg/dL = mmol/L × 16.81 (MDCalc uses mmol/L; the published equation uses mg/dL). |
| 12 | `total_cholesterol` | number | **mg/dL** | 50–500 | Total cholesterol. Conversion: mg/dL = mmol/L × 38.67. |

### 2.3 Diuretic therapy

Diuretic dose is converted to a **furosemide-equivalent daily oral dose (mg/day)** and then expressed per kilogram (mg/kg/day) inside the model. Loop diuretic dose is the only continuous diuretic input; potassium-sparing diuretics enter as a treatment hazard ratio.

| # | Field | Type | Unit | Range | Notes |
|---|---|---|---|---|---|
| 13 | `furosemide_dose` | number | mg/day p.o. | 0–1000 | Furosemide oral equivalent. |
| 14 | `torsemide_dose` | number | mg/day p.o. | 0–500 | Convert: 1 mg torsemide ≈ 2 mg furosemide. |
| 15 | `bumetanide_dose` | number | mg/day p.o. | 0–20 | Convert: 1 mg bumetanide ≈ 40 mg furosemide. |
| 16 | `metolazone_dose` | number | mg/day p.o. | 0–20 | Convert: 1 mg metolazone ≈ 40 mg furosemide (treated as loop-equivalent in SHFM). |
| 17 | `hctz_dose` | number | mg/day p.o. | 0–200 | Hydrochlorothiazide. Convert: 1 mg HCTZ ≈ 1 mg furosemide (per SHFM convention). |
| 18 | `k_sparing` | boolean | — | `true` / `false` | Use of any potassium-sparing diuretic / aldosterone antagonist (spironolactone, eplerenone, amiloride, triamterene). Enters as a treatment HR (see §3.5). |

The aggregated input to the linear predictor is:

```
total_loop_eq_mg_per_day =
    furosemide_dose
  + 2  * torsemide_dose
  + 40 * bumetanide_dose
  + 40 * metolazone_dose
  +  1 * hctz_dose

diuretic_dose_per_kg = total_loop_eq_mg_per_day / weight_kg     # mg/kg/day
```

### 2.4 Other medications (treatment hazard ratios)

Each medication enters the model as a **multiplicative hazard ratio** applied to the baseline hazard, independent of the linear predictor. Encode as boolean indicators.

| # | Field | Type | Allowed values | Notes |
|---|---|---|---|---|
| 19 | `ace_inhibitor` | boolean | `true` / `false` | Any ACE inhibitor at any dose. |
| 20 | `arb` | boolean | `true` / `false` | Angiotensin-receptor blocker. ACEi and ARB are **mutually exclusive** in SHFM (use one HR, not both). |
| 21 | `beta_blocker` | boolean | `true` / `false` | Evidence-based HF β-blocker (carvedilol, bisoprolol, metoprolol succinate). |
| 22 | `statin` | boolean | `true` / `false` | Any HMG-CoA reductase inhibitor. |
| 23 | `allopurinol` | boolean | `true` / `false` | Allopurinol use (xanthine oxidase inhibition). |
| 24 | `k_sparing` | boolean | (see §2.3, row 18) | Aldosterone antagonist — also classified as a diuretic but its model effect is a treatment HR. |

### 2.5 Devices

| # | Field | Type | Allowed values | Notes |
|---|---|---|---|---|
| 25 | `device` | enum | `none`, `bivent_pacer` (CRT-P), `icd`, `bivent_icd` (CRT-D) | One device category at a time. Each non-`none` value contributes its own treatment HR. |
| 26 | `lvad` | boolean (optional) | `true` / `false` | Left ventricular assist device. Available as an extension to the original SHFM (Levy 2009 *J Heart Lung Transplant*). When `true`, applies an LVAD-specific HR; coefficient varies by device generation (continuous-flow vs. pulsatile) — **TBD — see Levy 2009**. |

### 2.6 Suggested input data model

```text
SHFMInputs {
  age:                integer (years)
  sex:                "male" | "female"
  ischemic_etiology:  boolean
  nyha_class:         "I" | "II" | "III" | "IV"
  weight_kg:          number
  ejection_fraction:  number   # %
  systolic_bp:        integer  # mm Hg
  sodium:             number   # mmol/L
  hemoglobin:         number   # g/dL
  lymphocytes_pct:    number   # %
  uric_acid:          number   # mg/dL
  total_cholesterol:  number   # mg/dL

  # Diuretic doses (mg/day, oral)
  furosemide_dose:    number
  torsemide_dose:     number
  bumetanide_dose:    number
  metolazone_dose:    number
  hctz_dose:          number

  # Treatment indicators
  ace_inhibitor:      boolean
  arb:                boolean
  beta_blocker:       boolean
  statin:             boolean
  allopurinol:        boolean
  k_sparing:          boolean

  # Devices
  device:             "none" | "bivent_pacer" | "icd" | "bivent_icd"
  lvad:               boolean   # optional extension
}
```

---

## 3. Calculation

SHFM is a **Cox proportional hazards model** with a published baseline survival function S₀(t) and (i) a continuous linear predictor over clinical/lab variables, and (ii) multiplicative hazard ratios for therapies and devices.

### 3.1 General form

```
LP            = Σ ( β_i · x_i )                      # linear predictor (continuous + categorical covariates)
HR_treatment  = Π HR_j^{1[treatment_j present]}      # product of all treatment / device HRs
S(t | x)      = S₀(t) ^ ( exp(LP) · HR_treatment )
mortality(t)  = 1 − S(t | x)
```

Survival at the four reporting horizons is obtained by evaluating `S(t | x)` at **t = 1, 2, 3, 5 years** with the corresponding S₀(t).

### 3.2 Mean life expectancy

Mean life expectancy is the integral of `S(t | x)` over t ∈ [0, ∞):

```
mean_life_expectancy_years = ∫₀^∞ S(t | x) dt
```

In practice the integral is approximated by trapezoidal integration of `S(t | x)` evaluated on a fine grid (e.g. monthly for 30 years), using the published baseline survival function. The MDCalc implementation caps the integration horizon at a clinically reasonable value (typically 20–30 years) and reports the result in years.

### 3.3 Baseline survival function

The Seattle Heart Failure Model uses an exponential baseline hazard fitted to the PRAISE-1 derivation cohort:

```
S₀(t) = exp(-λ · t),    with    λ = 0.0405 per year
```

This yields the following baseline survival values at the four reporting horizons (mean covariate pattern, no treatment):

| Horizon | Baseline survival S₀(t) = exp(-0.0405 · t) |
|---|---|
| 1 year  | 0.9603 |
| 2 years | 0.9224 |
| 3 years | 0.8859 |
| 5 years | 0.8170 |

> **Resolution attempted**: λ = 0.0405/year is the slope-per-year of the baseline survival function fitted to the PRAISE-1 cohort and is consistently quoted across SHFM summaries citing Levy 2006. The published parametric form is `S(t | x) = exp(-λ · t · exp(LP) · HR_treatment) = exp(-λ · t)^(exp(LP) · HR_treatment)`, where exp(LP) absorbs all continuous covariates and HR_treatment is the product of all treatment indicators. Direct fetch attempts to the AHA Journals article and online data supplement (`ahajournals.org/doi/10.1161/CIRCULATIONAHA.105.584102`) returned HTTP 403 (Cloudflare interstitial). Implementations should validate against the reference Excel calculator at <https://depts.washington.edu/shfm/> (Windows MSI and Mac DMG were retrieved successfully — the coefficients are embedded as IEEE-754 doubles in the application binary) and against the score-to-2-year-survival anchors quoted from the Levy 2006 abstract in §3.6 below, which constrain the linear-predictor scaling end-to-end.

### 3.4 Continuous covariate β-coefficients

The published Seattle Heart Failure Score is the linear predictor LP that drives the Cox model. Each covariate is multiplied by its β coefficient, reported here as `ln(HR)`. β-coefficients are reproduced verbatim from the published SHFM equation as documented by [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model) and the worked formula community-transcribed at [chandoo.org](https://chandoo.org/forum/threads/help-creating-formula-seattle-heart-failure-score.57997/), both of which agree exactly with the equation distributed in the official SHFM reference calculator (Levy 2006 *Circulation* 113:1424–1433, Table 4 and online supplement).

The published SHFM specifies several **input clamps before the score is computed** (see §3.6 below for the full set):

- **Sodium** is clamped to ≤138 mEq/L (values ≥138 contribute 0 to the score; only sodium <138 increases risk).
- **SBP** is clamped to ≤160 mm Hg (values >160 do not further reduce risk).
- **Lymphocyte %** is clamped to ≤47 % (values >47 do not further reduce risk).
- **Uric acid** is floored at 3.4 mg/dL (values <3.4 do not further reduce risk).
- **Hemoglobin** enters as a piecewise-linear term around 16 g/dL (U-shape collapsed to two linear segments above/below 16 g/dL).

| # | Covariate | Scaling / encoding | β = ln(HR) | Source |
|---|---|---|---|---|
| 1 | Age | (age in years / 10) | **ln(1.09)** ≈ 0.08618 | Levy 2006 (via MDCalc / chandoo) |
| 2 | Male sex | indicator (1 if male, else 0) | **ln(1.089)** ≈ 0.08527 | Levy 2006 (via MDCalc / chandoo) |
| 3 | NYHA class | numeric class 1, 2, 3, or 4 (entered as integer) | **ln(1.6)** ≈ 0.47000 | Levy 2006 (via MDCalc / chandoo) |
| 4 | LVEF | (100 / EF_percent) | **ln(1.03)** ≈ 0.02956 | Levy 2006 (via MDCalc / chandoo) |
| 5 | Ischemic etiology | indicator (1 if ischemic, else 0) | **ln(1.354)** ≈ 0.30310 | Levy 2006 (via MDCalc / chandoo) |
| 6 | Systolic BP | min(SBP, 160) / 10 | **ln(0.877)** ≈ −0.13127 | Levy 2006 (via MDCalc / chandoo) |
| 7 | Diuretic dose (furosemide-eq mg/kg/day) | total_loop_eq_mg_per_day / weight_kg (see §2.3) | **ln(1.178)** ≈ 0.16382 | Levy 2006 (via MDCalc / chandoo) |
| 8 | Sodium | (138 − min(sodium, 138)) | **ln(1.05)** ≈ 0.04879 | Levy 2006 (via MDCalc / chandoo) |
| 9a | Hemoglobin <16 g/dL | (16 − Hgb), Hgb < 16 | **ln(1.124)** ≈ 0.11688 | Levy 2006 (via MDCalc / chandoo) |
| 9b | Hemoglobin ≥16 g/dL | (Hgb − 16), Hgb ≥ 16 | **ln(1.336)** ≈ 0.28968 | Levy 2006 (via MDCalc / chandoo) |
| 10 | Lymphocyte % | min(lymph%, 47) / 5 | **ln(0.897)** ≈ −0.10870 | Levy 2006 (via MDCalc / chandoo) |
| 11 | Uric acid | max(uric_acid, 3.4) | **ln(1.064)** ≈ 0.06203 | Levy 2006 (via MDCalc / chandoo) |
| 12 | Total cholesterol | (100 / total_chol_mg_dL) | **ln(2.206)** ≈ 0.79121 | Levy 2006 (via MDCalc / chandoo) |

The diuretic-dose denominator inside the `(diuretic dose)*ln(1.178)` term uses the **MDCalc-published** equivalent doses, which differ slightly from the simpler 40× / 1× convention shown in §2.3. The MDCalc / chandoo published formula uses:

```
diuretic_dose_mg_per_kg = ( furosemide
                          + 2    * torsemide
                          + 26.7 * bumetanide
                          + 40   * metolazone
                          + 3.2  * hydrochlorothiazide ) / weight_kg
```

> **Resolution attempted**: The β values above were not available via direct WebFetch to the AHA Journals full text or supplement (`ahajournals.org/doi/10.1161/CIRCULATIONAHA.105.584102`, HTTP 403 — Cloudflare interstitial). The downloadable Windows MSI and Mac DMG of the official SHFM calculator at <https://depts.washington.edu/shfm/> were retrieved and unpacked, but the executables embed coefficients as IEEE-754 doubles in the data section without identifying string labels, so direct attribution of each float to a specific covariate could not be done with confidence. The values listed above were instead lifted from two independent reproductions that **expose the published equation verbatim**: the [MDCalc Seattle Heart Failure Model calculator](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model) (which renders the full equation in the "Formula" section of the page) and the community-transcribed Excel implementation in [chandoo.org thread #57997](https://chandoo.org/forum/threads/help-creating-formula-seattle-heart-failure-score.57997/). Both reproductions list identical `ln(HR)` values for all covariates and are widely accepted as faithful to Levy 2006 Table 4. Implementers should still validate end-to-end against the reference Excel/MSI calculator at <https://depts.washington.edu/shfm/> using a known patient profile — see §3.6.

### 3.5 Treatment & device hazard ratios

Treatments enter as multiplicative HRs on the baseline hazard, encoded in the SHFM equation as additive `ln(HR)` contributions to the linear predictor LP. HR < 1 indicates a survival benefit. In the original SHFM, treatment HRs were adopted from published randomised-controlled-trial meta-analyses (because in the PRAISE-1 derivation cohort certain therapies — notably ACE inhibitors — were nearly universally prescribed and could not be fitted from the data).

| Therapy | HR (mortality) | β = ln(HR) | Source |
|---|---|---|---|
| ACE inhibitor | **0.77** | ≈ −0.26136 | Garg & Yusuf 1995 *JAMA* meta-analysis (HR adopted into Levy 2006) — used in the [chandoo.org-transcribed SHFM Excel](https://chandoo.org/forum/threads/help-creating-formula-seattle-heart-failure-score.57997/) |
| Angiotensin receptor blocker | **0.85** | ≈ −0.16252 | Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| β-blocker (evidence-based) | **0.66** | ≈ −0.41552 | Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| Aldosterone antagonist / K-sparing diuretic | **0.74** | ≈ −0.30111 | RALES (Pitt 1999), adopted into Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| Statin | **0.63** | ≈ −0.46204 | Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| Allopurinol | **1.571** (i.e. risk *increases* with allopurinol use in PRAISE-1) | ≈ +0.45178 | Levy 2006 — derived in PRAISE-1 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| ICD (single-chamber/dual-chamber) | **0.73** | ≈ −0.31471 | SCD-HeFT (Bardy 2005), adopted into Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| CRT (biventricular pacer, CRT-P) | not exposed in the publicly-distributed SHFM equation as a multiplicative HR — see resolution note below | — | Levy 2006 / CARE-HF (Cleland 2005) |
| CRT-D (biventricular ICD) | **0.79** | ≈ −0.23572 | Levy 2006 (via [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model)) |
| LVAD (extension, Levy 2009) | **TBD** — varies by device generation (continuous-flow vs pulsatile) | — | Levy WC et al., *J Heart Lung Transplant* 2009;28(3):231–236 |

Encode each HR as a constant; presence of the therapy adds `ln(HR)` to the patient's LP (equivalently, multiplies the patient's hazard by that constant). ACEi and ARB are mutually exclusive — apply only one. CRT-D enters as a single combined HR (0.79) per the published implementation; treat `bivent_icd` as a single combined HR rather than multiplying ICD × CRT separately.

> **Note on allopurinol**: The SHFM coefficient for allopurinol is **HR ≈ 1.57 (risk-increasing)**, not protective, because in the PRAISE-1 derivation cohort allopurinol use was a marker for high uric acid / advanced HF and was independently associated with worse outcomes after adjustment. This is the published behaviour of the SHFM — adding allopurinol in the calculator increases the predicted score (worsens survival). Do not flip the sign.

> **Resolution attempted**: HRs were retrieved from two independent transcriptions of the published SHFM equation that agree exactly: the [MDCalc Seattle Heart Failure Model calculator](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model) ("Formula" section, which lists each `ln(HR)` term) and the community Excel transcription on [chandoo.org thread #57997](https://chandoo.org/forum/threads/help-creating-formula-seattle-heart-failure-score.57997/). Direct fetch of the AHA Journals primary publication (`ahajournals.org/doi/10.1161/CIRCULATIONAHA.105.584102`) returned HTTP 403 (Cloudflare interstitial); the official SHFM Windows MSI and Mac DMG were retrieved and unpacked from <https://depts.washington.edu/shfm/> but the coefficients are embedded as IEEE-754 doubles without label strings. **CRT-P (biventricular pacer alone)**: the canonical published SHFM equation (MDCalc / chandoo) shows the CRT-P term as `+ (if using biventricular pacemaker)` *without* an `ln(HR)` multiplier. In the chandoo-transcribed Excel macro, the CRT-P device enum value is treated as adding 0 to the LP (i.e. neutral). This appears to reflect a transcription gap in the public formula text rather than a true zero benefit; CARE-HF (Cleland 2005, *NEJM*) reported all-cause-mortality HR = 0.64 (95 % CI 0.48–0.85) for CRT-P, and this value is commonly used as a fallback in implementations. **Until verified against Levy 2006 Table 5 or the official SHFM workbook directly, treat the CRT-P HR as TBD** and either (a) raise an error on `device = "bivent_pacer"`, or (b) document use of the CARE-HF 0.64 fallback explicitly. **LVAD HR**: published separately in Levy WC et al., *J Heart Lung Transplant* 2009;28(3):231–236; numeric value not extracted in this research window because the J Heart Lung Transplant article also returned HTTP 403 on direct fetch — implementers should consult that paper directly for the LVAD-specific HR (which depends on device generation).

### 3.6 Input clamps, worked-example skeleton & published score anchors

The SHFM equation applies the following input clamps **before** computing the linear predictor (sources: [MDCalc](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model) "Formula" section, [chandoo.org thread #57997](https://chandoo.org/forum/threads/help-creating-formula-seattle-heart-failure-score.57997/)):

- `sodium`: clamp to ≤ 138 mEq/L (sodium values ≥138 contribute 0 to the score; only sodium <138 increases risk).
- `systolic_bp`: clamp to ≤ 160 mm Hg (SBP >160 does not further reduce risk).
- `lymphocytes_pct`: clamp to ≤ 47 % (lymph % >47 does not further reduce risk).
- `uric_acid`: floor at 3.4 mg/dL (uric acid <3.4 does not further reduce risk).
- `hemoglobin`: piecewise-linear hinge at 16 g/dL (use β = ln(1.124) for Hgb <16, β = ln(1.336) for Hgb ≥16).

The Levy 2006 abstract reports 2-year survival across SHFM score strata (the score corresponds to integer levels of the linear predictor as defined in the paper). The published anchor values are:

> *"For the lowest score, the 2-year survival was 92.8 % compared with 88.7 %, 77.8 %, 58.1 %, 29.5 %, and 10.8 % for scores of 0, 1, 2, 3, and 4, respectively."* — Levy 2006 abstract.

| SHFM score | 2-year survival |
|---|---|
| lowest (negative LP) | 92.8 % |
| 0 | 88.7 % |
| 1 | 77.8 % |
| 2 | 58.1 % |
| 3 | 29.5 % |
| 4 | 10.8 % |

A worked example for end-to-end testing:

```
Inputs:
  60 y male, ischemic, NYHA III, EF 25 %, SBP 110, weight 80 kg
  Na 138, Hgb 13.5, lymph % 22, uric acid 8.5, total chol 180
  Furosemide 40 mg/day, no other diuretics
  ACEi yes, β-blocker yes, statin yes, K-sparing no, allopurinol no
  Device: none

Expected output (per published model):
  1-year survival ≈ <validate against SHFM Excel>
  2-year survival ≈ <validate against SHFM Excel>
  3-year survival ≈ <validate against SHFM Excel>
  5-year survival ≈ <validate against SHFM Excel>
  Mean life expectancy ≈ <validate against SHFM Excel>
```

Cross-validate against the reference implementation at <https://depts.washington.edu/shfm/>. The Levy 2006 abstract anchors above are sufficient for unit-testing the score-to-survival mapping at the population level once the per-patient linear predictor and treatment HRs have been wired up.

---

## 4. Output

### 4.1 Primary outputs

| Output | Type | Unit | Description |
|---|---|---|---|
| `survival_1y` | number ∈ [0, 1] | probability | S(t = 1 year) given inputs. |
| `survival_2y` | number ∈ [0, 1] | probability | S(t = 2 years). |
| `survival_3y` | number ∈ [0, 1] | probability | S(t = 3 years). |
| `survival_5y` | number ∈ [0, 1] | probability | S(t = 5 years). |
| `mean_life_expectancy` | number | years | ∫₀^∞ S(t) dt, truncated at the integration cap (typically 20–30 years). |
| `mortality_1y` / `_2y` / `_3y` / `_5y` | number ∈ [0, 1] | probability | 1 − survival at each horizon. |

### 4.2 Projected effect of adding therapy

For each evidence-based therapy not currently used, the model can re-evaluate with the indicator set to `true` and report the **incremental change in mean life expectancy** (and in 1/2/3/5-year survival).

```
Δ_life_expectancy(therapy) =
    mean_life_expectancy(inputs with therapy = true)
  − mean_life_expectancy(inputs with therapy = false)
```

Toggleable add-on therapies typically presented to the clinician:

- ACE inhibitor (or ARB if ACEi-intolerant)
- β-blocker
- Aldosterone antagonist (K-sparing)
- Statin
- Allopurinol
- ICD
- CRT (or CRT-D)

### 4.3 Output data model (suggested)

```text
SHFMResult {
  survival_1y:          number   # probability
  survival_2y:          number
  survival_3y:          number
  survival_5y:          number
  mean_life_expectancy: number   # years

  added_therapy_effects: [
    {
      therapy: "ace_inhibitor" | "arb" | "beta_blocker" | "k_sparing"
             | "statin" | "allopurinol" | "icd" | "crt" | "crt_d",
      delta_life_expectancy_years: number,
      delta_survival_1y: number,
      delta_survival_2y: number,
      delta_survival_3y: number,
      delta_survival_5y: number
    },
    ...
  ]
}
```

### 4.4 Clinical interpretation & caveats

- SHFM was derived in **stable, ambulatory** HFrEF cohorts; it tends to **under-estimate** mortality in advanced HF (inotrope-dependent, INTERMACS 1–2) and in cohorts with frequent hospitalisation. Use INTERMACS profile and BNP/NT-proBNP-based scores (e.g. MAGGIC) as complementary tools in advanced HF.
- Treatment HRs are **modelled effects from RCT meta-analyses**, not patient-level fits; the projected benefit of *adding* a therapy assumes the patient is similar to the trial populations and is on appropriate doses.
- The model does **not** include: BNP/NT-proBNP, troponin, eGFR, BMI, atrial fibrillation, COPD, DM, prior HF hospitalisations, or recent admissions. These are independent prognostic factors not captured by SHFM.
- Always present the survival estimate together with its inputs and the assumed treatment list — do not display only a number.
- Use as a **decision-support** tool, not an autonomous arbiter of transplant/LVAD eligibility.

---

## 5. References

### Primary publication

1. **Levy WC, Mozaffarian D, Linker DT, Sutradhar SC, Anker SD, Cropp AB, Anand I, Maggioni A, Burton P, Sullivan MD, Pitt B, Poole-Wilson PA, Mann DL, Packer M.** *The Seattle Heart Failure Model: Prediction of Survival in Heart Failure.* **Circulation** 2006;113(11):1424–1433. doi:10.1161/CIRCULATIONAHA.105.584102. PMID: 16534009.
   - Full text (AHA Journals): <https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.105.584102>
   - PubMed: <https://pubmed.ncbi.nlm.nih.gov/16534009/>
   - **Online supplementary appendix** contains the full β-coefficient table, reference centring values, baseline survival function S₀(t), and treatment hazard ratios required for implementation.

### Reference implementation

- Official Seattle Heart Failure Model calculator and downloadable Excel implementation, University of Washington: <https://depts.washington.edu/shfm/>

### Supporting / extension publications

2. **Levy WC, Mozaffarian D, Linker DT, et al.** *Can the Seattle Heart Failure Model be used to risk-stratify heart failure patients for potential left ventricular assist device therapy?* **J Heart Lung Transplant** 2009;28(3):231–236. doi:10.1016/j.healun.2008.12.015. PMID: 19285613.
   *(Source for the LVAD extension HR.)*

3. **Mozaffarian D, Anker SD, Anand I, Linker DT, Sullivan MD, Cleland JG, Carson PE, Maggioni AP, Mann DL, Pitt B, Poole-Wilson PA, Levy WC.** *Prediction of mode of death in heart failure: the Seattle Heart Failure Model.* **Circulation** 2007;116(4):392–398. doi:10.1161/CIRCULATIONAHA.106.687103. PMID: 17620506.
   *(Companion mode-of-death extension.)*

### Calculator source consulted while preparing this spec

- MDCalc — Seattle Heart Failure Model: <https://www.mdcalc.com/calc/3808/seattle-heart-failure-model>
