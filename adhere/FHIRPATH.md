# ADHERE Algorithm — FHIRPath expressions

A pure-FHIRPath encoding of the ADHERE in-hospital-mortality risk-stratification CART decision tree, suitable for an SDC `Questionnaire` with `cqf-expression` / `calculatedExpression` / `variable` extensions. The tree has three numeric inputs (BUN, SBP, Cr) and five terminal risk bands; everything is encoded as nested `iif()` against the published thresholds.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `BUN` | decimal | yes | `BUN` | Blood urea nitrogen at admission, mg/dL. Threshold 43. |
| `SBP` | decimal | yes | `SBP` | Systolic blood pressure at admission, mmHg. Threshold 115. |
| `Cr` | decimal | yes | `Cr` | Serum creatinine at admission, mg/dL. Threshold 2.75. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | enum: `very_low` \| `low` \| `intermediate` \| `high` \| `very_high`. |
| `adhere_label` | string | n/a (calculated) | output `adhere_label` | Original ADHERE / JAMA name (e.g. "Low Risk", "Intermediate Risk 3"). |
| `in_hospital_mortality_pct` | decimal | n/a (calculated) | output (derivation cohort) | 2.1 / 7.0 / 9.4 / 15.3 / 21.9. |
| `in_hospital_mortality_pct_validation` | decimal | n/a (calculated) | output (validation cohort) | 2.0 / 5.7 / 8.1 / 13.2 / 21.4. |
| `BUN_ge_43` | boolean | n/a (calculated) | path[0] | Branch flag exposed for explainability. |
| `SBP_lt_115` | boolean | n/a (calculated) | path[1] | Branch flag. |
| `Cr_ge_2_75` | boolean | n/a (calculated) | path[2] | Branch flag (only meaningful on the BUN≥43 / SBP<115 limb). |

> Per SPEC §2 input validation: all three inputs must be positive numbers. Use `minValueDecimal` constraints (and renderer-side plausibility ranges 1–300 / 40–260 / 0.1–20) to enforce this. The expressions below assume valid inputs.

---

## Variables

| name | expression |
|---|---|
| `BUN` | `%resource.item.where(linkId='BUN').answer.value.first()` |
| `SBP` | `%resource.item.where(linkId='SBP').answer.value.first()` |
| `Cr` | `%resource.item.where(linkId='Cr').answer.value.first()` |

---

## Calculated expressions

### `BUN_ge_43`

```
%BUN >= 43
```

### `SBP_lt_115`

```
%SBP < 115
```

### `Cr_ge_2_75`

```
%Cr >= 2.75
```

### `risk_band`

The CART tree (SPEC §3) — `BUN ≥ 43` is the adverse branch, `SBP < 115` is the adverse branch, `Cr ≥ 2.75` is the adverse branch (only consulted on the BUN≥43 / SBP<115 limb).

```
iif(%BUN < 43,
  iif(%SBP >= 115, 'very_low', 'low'),
  iif(%SBP >= 115,
    'intermediate',
    iif(%Cr < 2.75, 'high', 'very_high')))
```

### `adhere_label`

The original ADHERE / JAMA label per SPEC §4. Drive it off `risk_band` to keep one source of truth:

```
iif(%risk_band = 'very_low', 'Low Risk',
  iif(%risk_band = 'low', 'Intermediate Risk 3',
    iif(%risk_band = 'intermediate', 'Intermediate Risk 2',
      iif(%risk_band = 'high', 'Intermediate Risk 1', 'High Risk'))))
```

### `in_hospital_mortality_pct` (derivation cohort)

```
iif(%risk_band = 'very_low', 2.1,
  iif(%risk_band = 'low', 7.0,
    iif(%risk_band = 'intermediate', 9.4,
      iif(%risk_band = 'high', 15.3, 21.9))))
```

### `in_hospital_mortality_pct_validation`

```
iif(%risk_band = 'very_low', 2.0,
  iif(%risk_band = 'low', 5.7,
    iif(%risk_band = 'intermediate', 8.1,
      iif(%risk_band = 'high', 13.2, 21.4))))
```

---

## Worked example — test case 1 (Mrs. Eleanor Whitcombe)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%BUN` | `22` |
| `%SBP` | `142` |
| `%Cr` | `1.1` |

Branch flags:

- `%BUN_ge_43` = `22 >= 43` = `false`
- `%SBP_lt_115` = `142 < 115` = `false`
- `%Cr_ge_2_75` = `1.1 >= 2.75` = `false`

Evaluating `risk_band`:

```
iif(22 < 43,
  iif(142 >= 115, 'very_low', 'low'),
  ...)
= iif(true, iif(true, 'very_low', 'low'), ...)
= 'very_low'
```

Evaluating `adhere_label`: `'Low Risk'`.

Evaluating `in_hospital_mortality_pct`: `2.1`.

Evaluating `in_hospital_mortality_pct_validation`: `2.0`.

Matches expected output: `risk_band = very_low`, label "Low Risk", derivation 2.1 %, validation 2.0 %.

---

## Notes

### Threshold conventions

- BUN: **`>= 43`** (inclusive) is the adverse branch.
- SBP: **`< 115`** (exclusive) is the adverse branch — equivalently, `SBP >= 115` is favourable.
- Cr: **`>= 2.75`** (inclusive) is the adverse branch.

The expressions above use `<` for the favourable BUN branch (`%BUN < 43`) and `>=` for the favourable SBP branch (`%SBP >= 115`), matching SPEC §3 verbatim.

### Unit conversions (SPEC §2)

If the source system reports SI units, convert before evaluating the FHIRPath:

- `BUN_mgdl = urea_mmol_per_L * 2.801`
- `Cr_mgdl = creatinine_umol_per_L / 88.4`

These conversions are best done outside the Questionnaire — either at the source (FHIR `Observation.valueQuantity` with mg/dL) or in a pre-population pre-extract step. If you must do it inline, inject the SI value as a separate item and compute the mg/dL value with a calculated FHIRPath expression (`%urea_mmol * 2.801`). Be careful: FHIRPath has no built-in unit-aware arithmetic, so input units must be explicit.

### Required / validation rules

- All three inputs are required; mark `required = true` on each item.
- Reject `null`, `NaN`, and values `<= 0`. Use `minValueDecimal` to block `<= 0`. The plausibility warnings (BUN 1–300, SBP 40–260, Cr 0.1–20) are best implemented as renderer-side soft warnings rather than `enableWhen` constraints.
- Cr is only consulted on the BUN≥43 / SBP<115 limb. You can still mark it required (for input completeness) — the FHIRPath simply ignores it on the other limbs.

### Rounding

The mortality percentages are pre-rounded to 1 decimal in the SPEC. No further rounding needed.

### Decision-tree fits FHIRPath cleanly

The ADHERE algorithm is a 3-level CART with 5 terminal nodes. Pure-FHIRPath nested `iif()` expresses it directly with no need for a CQL library.
