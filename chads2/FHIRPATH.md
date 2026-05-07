# CHADS₂ Score for Atrial Fibrillation Stroke Risk — FHIRPath expressions

A pure-FHIRPath encoding of the CHADS₂ calculator suitable for an SDC `Questionnaire` with `cqf-expression` / `calculatedExpression` / `variable` extensions. All boolean inputs are mapped to integer point contributions via `iif()`. Risk band and annual stroke risk are encoded as nested `iif()` ladders driven by the integer `score`.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `chf` | boolean | yes | `chf` | Congestive heart failure history (any EF). |
| `hypertension` | boolean | yes | `hypertension` | Prior dx, BP > 140/90 on ≥ 2 occasions, or on antihypertensive. |
| `age_ge_75` | boolean | yes | `age_ge_75` | Age ≥ 75 years at assessment. |
| `diabetes` | boolean | yes | `diabetes` | T1DM or T2DM, FPG > 125 mg/dL, or on glucose-lowering tx. |
| `stroke_tia` | boolean | yes | `stroke_tia` | Prior ischaemic stroke / TIA / systemic thromboembolism. |
| `score` | integer | n/a (calculated) | output `score` | Sum of points; range [0, 6]. |
| `annual_stroke_risk_percent` | decimal | n/a (calculated) | output `annual_stroke_risk_percent` | Gage 2001 NRAF cohort table. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | enum: `low` \| `low_moderate` \| `moderate` \| `high` \| `very_high`. |
| `recommendation` | string | n/a (calculated) | output `recommendation` | Free-text antithrombotic guidance. |

> Implementation note: per SPEC §2, missing booleans must surface a validation error rather than be coerced to `false`. Mark each boolean item `required = true`.

---

## Variables

(One row per intermediate. Use the FHIRPath `variable` extension on the root Questionnaire item.)

| name | expression |
|---|---|
| `chf` | `%resource.item.where(linkId='chf').answer.value.first()` |
| `hypertension` | `%resource.item.where(linkId='hypertension').answer.value.first()` |
| `age_ge_75` | `%resource.item.where(linkId='age_ge_75').answer.value.first()` |
| `diabetes` | `%resource.item.where(linkId='diabetes').answer.value.first()` |
| `stroke_tia` | `%resource.item.where(linkId='stroke_tia').answer.value.first()` |

---

## Calculated expressions

### `score`

```
iif(%chf, 1, 0) + iif(%hypertension, 1, 0) + iif(%age_ge_75, 1, 0) + iif(%diabetes, 1, 0) + iif(%stroke_tia, 2, 0)
```

### `annual_stroke_risk_percent`

```
iif(%score = 6, 18.2,
  iif(%score = 5, 12.5,
    iif(%score = 4, 8.5,
      iif(%score = 3, 5.9,
        iif(%score = 2, 4.0,
          iif(%score = 1, 2.8, 1.9))))))
```

### `risk_band`

```
iif(%score >= 5, 'very_high',
  iif(%score >= 3, 'high',
    iif(%score = 2, 'moderate',
      iif(%score = 1, 'low_moderate', 'low'))))
```

### `recommendation`

```
iif(%score >= 2, 'Oral anticoagulation recommended (DOAC preferred over warfarin in non-valvular AF unless contraindicated).',
  iif(%score = 1, 'Oral anticoagulant or aspirin; OAC generally preferred. Re-stratify with CHA2DS2-VASc.',
    'No antithrombotic therapy preferred. Re-stratify with CHA2DS2-VASc before withholding therapy.'))
```

---

## Worked example — test case 1 (Mr. Cyril Beaumont-Hayashi, score 0)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%chf` | `false` |
| `%hypertension` | `false` |
| `%age_ge_75` | `false` |
| `%diabetes` | `false` |
| `%stroke_tia` | `false` |

Evaluating `score`:

```
iif(false, 1, 0) + iif(false, 1, 0) + iif(false, 1, 0) + iif(false, 1, 0) + iif(false, 2, 0)
= 0 + 0 + 0 + 0 + 0
= 0
```

Evaluating `risk_band`:

```
iif(0 >= 5, 'very_high',
  iif(0 >= 3, 'high',
    iif(0 = 2, 'moderate',
      iif(0 = 1, 'low_moderate', 'low'))))
= 'low'
```

Evaluating `annual_stroke_risk_percent`: ladder falls all the way through to `1.9`.

Matches the expected output: `score = 0`, `risk_band = low`, annual stroke risk **1.9 %**.

---

## Notes

- The 95 % CI on the annual stroke rate is published as a pair (e.g. `[1.2, 3.0]` for score 0). FHIRPath has no native tuple/array literal a Questionnaire renderer can bind to a single answer; if the consumer needs the CI, encode it as two separate calculated items (`annual_stroke_risk_ci_lower`, `annual_stroke_risk_ci_upper`) with an analogous nested `iif()` ladder per bound.
- All inputs are required (`required=true` at the item level). Do not silently coerce missing booleans — per SPEC §2 surface a validation error.
- No rounding rule needed: the score is integer by construction; the published `% / year` figures already come pre-rounded to 1 decimal.
- The lookup tables (score → risk %, score → risk band, score → recommendation) are small (7 rows each) and encode cleanly as nested `iif()` ladders. No CQL library is required.
