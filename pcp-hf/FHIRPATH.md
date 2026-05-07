# PCP-HF — FHIRPath expressions

A pure-FHIRPath encoding of the Pooled Cohort Equations to Prevent Heart Failure (PCP-HF). The model is a race × sex stratified Cox proportional-hazards score: four sub-equations select on `(race, sex)`, each contributes a different `IndividualSum`, `MeanCV`, and `S0(10)`. All continuous predictors enter on the natural-log scale and a final survival exponentiation yields the 10-year incident-HF risk.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `sex` | choice | yes | Sex | `male` \| `female`. |
| `race` | choice | yes | Race | `white` \| `black`. Other races not validated. |
| `age` | integer | yes | Age | years, 30–79. |
| `sbp` | integer | yes | SBP | mmHg. |
| `on_antihypertensive` | boolean | yes | On antihypertensive treatment | Routes SBP through treated vs untreated coefficient. |
| `current_smoker` | boolean | yes | Current smoker | Former smokers count as `false`. |
| `glucose` | decimal | yes | Fasting glucose | mg/dL. |
| `on_dm_meds` | boolean | yes | On diabetes medication / has diabetes | Routes glucose through treated vs untreated coefficient. |
| `total_chol` | decimal | yes | Total cholesterol | mg/dL. |
| `hdl` | decimal | yes | HDL cholesterol | mg/dL. |
| `bmi` | decimal | yes | BMI | kg/m². |
| `qrs` | integer | yes | QRS duration | ms. |
| `risk_pct` | decimal | n/a (calculated) | output `risk_pct` | 10-yr incident-HF risk, %. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | enum: `low` \| `borderline` \| `intermediate` \| `high`. |

> Implementation note: per SPEC §1, exclude patients <30 or >79 years and those with prior MI/stroke/HF. Add `enableWhen`/preflight predicates upstream of this Questionnaire if needed; the FHIRPath below assumes valid input.

---

## Variables

Numeric inputs and the four log-transformed values reused in multiple terms.

| name | expression |
|---|---|
| `sex` | `%resource.item.where(linkId='sex').answer.value.first()` |
| `race` | `%resource.item.where(linkId='race').answer.value.first()` |
| `age` | `%resource.item.where(linkId='age').answer.value.first()` |
| `sbp` | `%resource.item.where(linkId='sbp').answer.value.first()` |
| `treated_bp` | `%resource.item.where(linkId='on_antihypertensive').answer.value.first()` |
| `smoker` | `%resource.item.where(linkId='current_smoker').answer.value.first()` |
| `glucose` | `%resource.item.where(linkId='glucose').answer.value.first()` |
| `treated_dm` | `%resource.item.where(linkId='on_dm_meds').answer.value.first()` |
| `total_chol` | `%resource.item.where(linkId='total_chol').answer.value.first()` |
| `hdl` | `%resource.item.where(linkId='hdl').answer.value.first()` |
| `bmi` | `%resource.item.where(linkId='bmi').answer.value.first()` |
| `qrs` | `%resource.item.where(linkId='qrs').answer.value.first()` |
| `lnAge` | `%age.ln()` |
| `lnSBP` | `%sbp.ln()` |
| `lnGlu` | `%glucose.ln()` |
| `lnChol` | `%total_chol.ln()` |
| `lnHDL` | `%hdl.ln()` |
| `lnBMI` | `%bmi.ln()` |
| `lnQRS` | `%qrs.ln()` |
| `stratum` | `iif(%race = 'white' and %sex = 'male', 'WM', iif(%race = 'white' and %sex = 'female', 'WF', iif(%race = 'black' and %sex = 'male', 'BM', 'BF')))` |

---

## Calculated expressions

### `individual_sum`

The sum is built from per-stratum coefficient × transform contributions. Terms whose coefficient is `—` for the stratum (per SPEC §3.2) are dropped — encoded below by gating on `stratum`.

```
// White Male — IndividualSum
iif(%stratum = 'WM',
    41.94 * %lnAge
  + (-0.88) * %lnAge.power(2)
  + iif(%treated_bp,  1.03 * %lnSBP, 0)
  + iif(%treated_bp,  0,             0.91 * %lnSBP)
  + iif(%smoker,      0.74,          0)
  + iif(%treated_dm,  0.90 * %lnGlu, 0.78 * %lnGlu)
  + 0.49  * %lnChol
  + (-0.44) * %lnHDL
  + 37.20 * %lnBMI
  + (-8.83) * %lnAge * %lnBMI
  + 0.63  * %lnQRS
,
// White Female — IndividualSum
iif(%stratum = 'WF',
    20.55 * %lnAge
  + iif(%treated_bp,  12.95 * %lnSBP, 0)
  + iif(%treated_bp, -2.96 * %lnAge * %lnSBP, 0)
  + iif(%treated_bp,  0,              11.86 * %lnSBP)
  + iif(%treated_bp,  0,             -2.73 * %lnAge * %lnSBP)
  + iif(%smoker,      11.02,          0)
  + iif(%smoker,     -2.50 * %lnAge,  0)
  + iif(%treated_dm,  1.04 * %lnGlu,  0.91 * %lnGlu)
  + (-0.07) * %lnHDL
  + 1.33  * %lnBMI
  + 1.06  * %lnQRS
,
// Black Male — IndividualSum
iif(%stratum = 'BM',
    2.88  * %lnAge
  + iif(%treated_bp,  2.31 * %lnSBP, 0)
  + iif(%treated_bp,  0,             2.17 * %lnSBP)
  + iif(%smoker,      1.66,          0)
  + iif(%smoker,     -0.25 * %lnAge, 0)
  + iif(%treated_dm,  0.64 * %lnGlu, 0.58 * %lnGlu)
  + (-0.81) * %lnHDL
  + 1.16  * %lnBMI
  + 0.73  * %lnQRS
,
// Black Female — IndividualSum
   51.75 * %lnAge
  + iif(%treated_bp, 29.00 * %lnSBP, 0)
  + iif(%treated_bp, -6.59 * %lnAge * %lnSBP, 0)
  + iif(%treated_bp,  0,             28.18 * %lnSBP)
  + iif(%treated_bp,  0,            -6.42 * %lnAge * %lnSBP)
  + iif(%smoker,      0.76,          0)
  + iif(%treated_dm,  0.97 * %lnGlu, 0.80 * %lnGlu)
  + 0.32  * %lnChol
  + 21.24 * %lnBMI
  + (-5.00) * %lnAge * %lnBMI
  + 1.27  * %lnQRS
)))
```

### `mean_cv`

```
iif(%stratum = 'WM', 171.5,
  iif(%stratum = 'WF', 99.73,
    iif(%stratum = 'BM', 28.73, 233.9)))
```

### `baseline_survival`

```
iif(%stratum = 'WM', 0.98752,
  iif(%stratum = 'WF', 0.99348,
    iif(%stratum = 'BM', 0.98295, 0.99260)))
```

### `risk_pct`

```
(1 - %baseline_survival.power((%individual_sum - %mean_cv).exp())) * 100
```

### `risk_band`

PCP-HF risk thresholds per SPEC §4 (and Khan 2019): `<5%` low, `5–<10%` borderline, `10–<20%` intermediate, `≥20%` high.

```
iif(%risk_pct >= 20, 'high',
  iif(%risk_pct >= 10, 'intermediate',
    iif(%risk_pct >= 5, 'borderline', 'low')))
```

---

## Worked example — test case 1 (Emma Verhoeven, White Female, Low risk)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%sex` | `'female'` |
| `%race` | `'white'` |
| `%age` | 35 |
| `%sbp` | 110 |
| `%treated_bp` | `false` |
| `%smoker` | `false` |
| `%glucose` | 86 |
| `%treated_dm` | `false` |
| `%total_chol` | 170 |
| `%hdl` | 70 |
| `%bmi` | 21.5 |
| `%qrs` | 88 |

Derived: `%lnAge = 3.5553`, `%lnSBP = 4.7005`, `%lnGlu = 4.4543`, `%lnHDL = 4.2485`, `%lnBMI = 3.0681`, `%lnQRS = 4.4773`. Stratum = `WF`.

Per-term contributions (only WF coefficients fire; total cholesterol, ln(Age)², and ln(Age)×ln(BMI) are `—` for WF and drop out):

| term | contribution |
|---|---:|
| 20.55 × 3.5553 | 73.062 |
| 11.86 × 4.7005 (untreated) | 55.748 |
| −2.73 × 3.5553 × 4.7005 (untreated) | −45.620 |
| smoker terms (smoker = false) | 0 |
| 0.91 × 4.4543 (untreated DM) | 4.053 |
| −0.07 × 4.2485 | −0.297 |
| 1.33 × 3.0681 | 4.081 |
| 1.06 × 4.4773 | 4.746 |

```
%individual_sum ≈ 95.773
%mean_cv          = 99.73
%baseline_survival = 0.99348
exp(95.773 − 99.73) = exp(−3.957) ≈ 0.01908
0.99348 ^ 0.01908   ≈ 0.999875
risk_pct            ≈ (1 − 0.999875) × 100 ≈ 0.013 %
risk_band           = 'low'  (< 5 %)
```

Matches expected output: `risk_pct ≈ 0.01 %`, `risk_band = low`.

---

## Notes

- The 4-way stratum dispatch is the single most error-prone part of an SDC encoding. Recommend adding a hidden read-only item `stratum` with the calculated expression above so that human reviewers can sanity-check that the right sub-equation fired.
- All transcendental ops (`ln()`, `exp()`, `power()`) are native FHIRPath; no CQL library required.
- Per SPEC §3.2, terms with `—` coefficients must be **omitted**, not multiplied by zero. The `iif(%stratum = 'WM', …, iif(%stratum = 'WF', …, …))` outer ladder achieves this at the per-stratum level; within each branch the formulae include only the rows with non-`—` coefficients.
- BP and glucose use a "treated XOR untreated" routing: exactly one branch contributes per term. The encoded `iif(%treated_bp, …, 0) + iif(%treated_bp, 0, …)` pattern keeps both expressions in the source so a reviewer can trace each path.
- Manual log/exp arithmetic accumulates rounding error in the few-percent range; the `risk_band` classification is robust but the precise `risk_pct` may shift by a fraction of a percent under exact float64 evaluation. This is consistent with the caveat noted in `TEST_CASES.md`.
- `risk_band` thresholds (5 %, 10 %, 20 %) match Khan 2019 recommendations — make these configurable if your local guideline body uses different cuts.
- Inputs in SI (mmol/L) need the conversion shown in SPEC §2 (`mg/dL = mmol/L × 18.0182` for glucose; `× 38.67` for cholesterol/HDL) applied **before** entering the FHIRPath; do not embed the conversion in the calculated expression.
