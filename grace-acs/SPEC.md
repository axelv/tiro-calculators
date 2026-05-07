# GRACE ACS Risk and Mortality Calculator

> Specification for the GRACE (Global Registry of Acute Coronary Events) ACS
> Risk and Mortality Calculator. Authoritative source:
> [MDCalc — GRACE ACS Risk and Mortality Calculator](https://www.mdcalc.com/calc/1099/grace-acs-risk-mortality-calculator).
> Primary publication: Granger CB et al., *Arch Intern Med* 2003;163:2345–2353.
> Updated nomogram: Fox KAA et al. (GRACE 2.0), *BMJ Open* 2014;4:e004425.

---

## 1. Purpose

The GRACE risk score estimates the prognosis of patients hospitalized with an
acute coronary syndrome (ACS) — including ST-elevation myocardial infarction
(STEMI), non-ST-elevation MI (NSTEMI), and unstable angina (UA). It is one of
the risk-stratification tools recommended by the European Society of Cardiology
(ESC 2023) and ACC/AHA (2025) ACS guidelines to triage NSTE-ACS patients toward
an early invasive vs. conservative strategy.

### Time horizons

| Version | Endpoints |
|---|---|
| **GRACE 1.0 (Granger 2003)** | In-hospital all-cause mortality |
| **GRACE 1.0 discharge score (Eagle 2004 / Tang 2007)** | 6-month post-discharge all-cause mortality |
| **GRACE 2.0 (Fox 2014)** | In-hospital, 6-month, 1-year, and 3-year all-cause mortality (also a combined death/MI endpoint at 1 year) |

Clinical decision support typically reports:
- **In-hospital mortality probability** (admission score) — guides immediate triage.
- **6-month mortality probability** (discharge score) — guides post-discharge
  follow-up intensity and secondary prevention.
- **1-year and 3-year mortality** — available only in the GRACE 2.0 nomogram
  (non-linear restricted-cubic-spline model).

---

## 2. Inputs

The score uses **8 routinely available variables** captured at first medical
contact / hospital admission.

| # | Field | Type | Units | Range / Allowed values | Clinical definition |
|---|---|---|---|---|---|
| 1 | `age` | numeric | years | 18 – 110 | Patient's age at admission. |
| 2 | `heart_rate` | numeric | beats / min | 0 – 300 | First measured pulse / HR at admission (sinus or paced). |
| 3 | `systolic_bp` | numeric | mm Hg | 0 – 300 | First measured systolic blood pressure at admission. |
| 4 | `creatinine` | numeric | mg/dL (or µmol/L) | 0.0 – 15.0 mg/dL (≈ 0 – 1300 µmol/L) | Admission serum creatinine. Conversion: µmol/L = mg/dL × 88.4. |
| 5 | `killip_class` | categorical | — | `I`, `II`, `III`, `IV` | Acute heart-failure class on physical exam (see below). |
| 6 | `cardiac_arrest_at_admission` | boolean | — | `true` / `false` | Witnessed or unwitnessed cardiac arrest at the time of hospital admission (pre-hospital arrest with successful resuscitation counts). |
| 7 | `st_segment_deviation` | boolean | — | `true` / `false` | ≥ 0.5 mm (0.05 mV) ST depression or transient ST elevation on the admission ECG, in any contiguous leads. |
| 8 | `elevated_cardiac_enzymes` | boolean | — | `true` / `false` | Initial troponin (preferred) or CK-MB above the upper reference limit (URL / 99th-percentile cut-off). |

### Killip class — clinical definitions

| Class | Finding |
|---|---|
| **I** | No clinical signs of heart failure. |
| **II** | Rales / crackles in the lungs, an S3 gallop, and/or elevated jugular venous pressure. |
| **III** | Frank acute pulmonary edema. |
| **IV** | Cardiogenic shock or hypotension (SBP < 90 mm Hg) with evidence of peripheral hypoperfusion (oliguria, cyanosis, sweating). |

### Validation / coercion rules

- Values outside the listed ranges should produce a validation warning; clinical
  inputs at extreme physiologic values (e.g. SBP < 50 or HR > 250) typically
  saturate at the lowest/highest band of the nomogram.
- `creatinine` must be normalized to **mg/dL** before applying the Granger 2003
  point table.
- `killip_class` defaults to `I` only when explicitly documented as "no CHF".

---

## 3. Calculation

The original GRACE risk score (Granger 2003) is a **point-table nomogram**
derived from a multivariable Cox / logistic regression on 11 389 ACS patients.
GRACE 2.0 (Fox 2014) replaces the linear point sums with a non-linear
restricted-cubic-spline model whose exact β-coefficients are not in the public
domain — implementations typically embed the published nomogram as a lookup
table or call the GRACE 2.0 web service.

### 3.1 GRACE 1.0 in-hospital mortality — point table (Granger 2003)

Sum the points from each row.

#### Age (years)

| Range | Points |
|---|---|
| < 30 | 0 |
| 30 – 39 | 8 |
| 40 – 49 | 25 |
| 50 – 59 | 41 |
| 60 – 69 | 58 |
| 70 – 79 | 75 |
| 80 – 89 | 91 |
| ≥ 90 | 100 |

#### Heart rate (bpm)

| Range | Points |
|---|---|
| < 50 | 0 |
| 50 – 69 | 3 |
| 70 – 89 | 9 |
| 90 – 109 | 15 |
| 110 – 149 | 24 |
| 150 – 199 | 38 |
| ≥ 200 | 46 |

#### Systolic BP (mm Hg)

| Range | Points |
|---|---|
| < 80 | 58 |
| 80 – 99 | 53 |
| 100 – 119 | 43 |
| 120 – 139 | 34 |
| 140 – 159 | 24 |
| 160 – 199 | 10 |
| ≥ 200 | 0 |

#### Serum creatinine (mg/dL)

| Range | Points |
|---|---|
| 0.00 – 0.39 | 1 |
| 0.40 – 0.79 | 4 |
| 0.80 – 1.19 | 7 |
| 1.20 – 1.59 | 10 |
| 1.60 – 1.99 | 13 |
| 2.00 – 3.99 | 21 |
| ≥ 4.00 | 28 |

#### Killip class

| Class | Points |
|---|---|
| I | 0 |
| II | 20 |
| III | 39 |
| IV | 59 |

#### Risk modifiers (binary)

| Field | Points if `true` |
|---|---|
| Cardiac arrest at admission | 39 |
| ST-segment deviation | 28 |
| Elevated cardiac enzymes | 14 |

#### Total

```
total_points = points_age
             + points_heart_rate
             + points_systolic_bp
             + points_creatinine
             + points_killip
             + (39 if cardiac_arrest_at_admission else 0)
             + (28 if st_segment_deviation else 0)
             + (14 if elevated_cardiac_enzymes else 0)
```

Maximum theoretical score: **372 points** (Granger 2003 reports a practical
max of ~263 for the in-hospital model after restricting biologically
implausible combinations).

### 3.2 In-hospital mortality probability lookup (Granger 2003 nomogram)

| Total points | Approx. in-hospital mortality |
|---|---|
| ≤ 60  | ≤ 0.2 % |
| 70    | 0.3 % |
| 80    | 0.4 % |
| 90    | 0.6 % |
| 100   | 0.8 % |
| 110   | 1.1 % |
| 120   | 1.6 % |
| 130   | 2.1 % |
| 140   | 2.9 % |
| 150   | 3.9 % |
| 160   | 5.4 % |
| 170   | 7.3 % |
| 180   | 9.8 % |
| 190   | 13 % |
| 200   | 18 % |
| 210   | 23 % |
| 220   | 29 % |
| 230   | 36 % |
| 240   | 44 % |
| ≥ 250 | ≥ 52 % |

For implementations that require continuous probabilities, linearly interpolate
between adjacent rows or fit a logistic curve to the table.

### 3.3 GRACE 2.0 (Fox 2014) — preferred when available

GRACE 2.0 uses the same 8 inputs but applies a non-linear, restricted-cubic-spline
hazard model and outputs **in-hospital, 6-month, 1-year, and 3-year mortality**
probabilities directly (no point-summation step). The model also handles
substitutions when Killip class or creatinine are missing (using diuretic use
and renal failure as proxies, respectively).

> The exact β-coefficients of the GRACE 2.0 splines are **TBD — see
> Fox 2014, *BMJ Open* 4:e004425, supplementary appendix**, or call the
> reference implementation hosted at the University of Edinburgh / Center
> for Outcomes Research, U-Mass Medical School. Implementations should embed
> the published nomogram as a multidimensional lookup or wrap an authorized
> service.

### 3.4 Discharge / 6-month post-discharge score (Eagle 2004)

A separate point system using 9 variables (the 8 above plus history of MI,
history of CHF, in-hospital PCI, and in-hospital CABG) predicts 6-month
post-discharge mortality. **TBD — see Eagle KA et al. *JAMA* 2004;291:2727–2733
for the discharge nomogram.** Most modern implementations use GRACE 2.0
instead, which produces the 6-month estimate directly from the admission inputs.

---

## 4. Output

### 4.1 Primary outputs

| Field | Type | Description |
|---|---|---|
| `total_points` | int | Sum of nomogram points (Granger 2003). |
| `in_hospital_mortality_pct` | float | Probability of in-hospital death (0 – 100 %). |
| `six_month_mortality_pct` | float | Probability of all-cause death at 6 months (GRACE 2.0). |
| `one_year_mortality_pct` | float | Probability at 1 year (GRACE 2.0 only). |
| `three_year_mortality_pct` | float | Probability at 3 years (GRACE 2.0 only). |
| `risk_category_inhospital` | enum | `low` / `intermediate` / `high`. |
| `risk_category_6mo` | enum | `low` / `intermediate` / `high`. |

### 4.2 Risk strata thresholds

#### In-hospital (admission GRACE score)

| Category | Score | Approx. mortality | Recommended management (NSTE-ACS, ESC 2023) |
|---|---|---|---|
| **Low** | ≤ 108 | < 1 % | Selective invasive strategy. |
| **Intermediate** | 109 – 140 | 1 – 3 % | Early invasive within 24 h. |
| **High** | > 140 | > 3 % | Urgent invasive (≤ 2 h if very-high-risk features). |

#### 6-month post-discharge (GRACE 2.0)

| Category | Score | Approx. mortality |
|---|---|---|
| **Low** | 1 – 88 | < 3 % |
| **Intermediate** | 89 – 118 | 3 – 8 % |
| **High** | 119 – 263 | > 8 % |

> Note: the in-hospital and 6-month strata use **different cut-offs**. A patient
> may be "intermediate" for in-hospital risk but "high" for 6-month risk, or
> vice-versa. UI/reports should display both with their own labels.

---

## 5. References

### Primary publications

1. **Granger CB, Goldberg RJ, Dabbous O, et al.** Predictors of hospital
   mortality in the global registry of acute coronary events.
   *Arch Intern Med* 2003;163(19):2345–2353.
   <https://pubmed.ncbi.nlm.nih.gov/14581255/>

2. **Eagle KA, Lim MJ, Dabbous OH, et al.** A validated prediction model for
   all forms of acute coronary syndrome: estimating the risk of 6-month
   postdischarge death in an international registry.
   *JAMA* 2004;291(22):2727–2733.
   <https://pubmed.ncbi.nlm.nih.gov/15187054/>

3. **Fox KAA, Fitzgerald G, Puymirat E, et al.** Should patients with acute
   coronary disease be stratified for management according to their risk?
   Derivation, external validation and outcomes using the updated GRACE
   risk score (GRACE 2.0). *BMJ Open* 2014;4(2):e004425.
   <https://bmjopen.bmj.com/content/4/2/e004425>

### Calculator / tool URLs

- MDCalc — GRACE ACS Risk and Mortality Calculator:
  <https://www.mdcalc.com/calc/1099/grace-acs-risk-mortality-calculator>
- Center for Outcomes Research, UMass Medical School (GRACE 2.0):
  <https://www.outcomes-umassmed.org/grace/acs_risk2/index.html>

### Supporting / validation

- **Pieper KS, Gore JM, FitzGerald G, et al.** Validity of a risk-prediction
  tool for hospital mortality: the Global Registry of Acute Coronary Events.
  *Am Heart J* 2009;157(6):1097–1105.
- **Tang EW, Wong CK, Herbison P.** Global Registry of Acute Coronary Events
  (GRACE) hospital discharge risk score accurately predicts long-term mortality
  post acute coronary syndrome. *Am Heart J* 2007;153(1):29–35.
  <https://pubmed.ncbi.nlm.nih.gov/17174633/>

### Guidelines citing GRACE

- **ESC 2023 NSTE-ACS Guidelines** — PMID: 37740496.
- **ACC/AHA 2025 ACS Guidelines** — PMID: 40014670.
