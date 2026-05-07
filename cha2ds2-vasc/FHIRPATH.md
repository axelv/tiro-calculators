# CHA₂DS₂-VASc Score for AF Stroke Risk — FHIRPath expressions

A pure-FHIRPath encoding of the original CHA₂DS₂-VASc calculator (max 9, with the female-sex point) suitable for an SDC `Questionnaire` with `cqf-expression` / `calculatedExpression` / `variable` extensions. All eight inputs are booleans; the score is computed as a weighted sum, and risk band / recommendation are nested `iif()` ladders.

> If the calling system needs the **CHA₂DS₂-VA** variant (ESC 2024), drop the `sex_female` term from the score and use the sex-neutral threshold ladder (see Notes).

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `chf` | boolean | yes | `chf` | Congestive heart failure (HFrEF or HFpEF). |
| `hypertension` | boolean | yes | `hypertension` | BP > 140/90 on ≥ 2 occasions, or on antihypertensive. |
| `age_ge_75` | boolean | yes | `age_ge_75` | Age ≥ 75 years (A₂, +2 points). Mutually exclusive with `age_65_74`. |
| `age_65_74` | boolean | yes | `age_65_74` | Age 65–74 inclusive (A, +1 point). Mutually exclusive with `age_ge_75`. |
| `diabetes` | boolean | yes | `diabetes` | FPG > 125 mg/dL, or on hypoglycaemic tx. |
| `stroke_tia_te` | boolean | yes | `stroke_tia_te` | Prior stroke / TIA / systemic thromboembolism (S₂, +2 points). |
| `vascular_disease` | boolean | yes | `vascular_disease` | Prior MI, PAD, or aortic plaque. |
| `sex_female` | boolean | yes | `sex_female` | Biological female sex (Sc, +1; original variant only). |
| `score` | integer | n/a (calculated) | output `score` | Sum of points; range [0, 9]. |
| `annual_stroke_risk_lip_2010_percent` | decimal | n/a (calculated) | output | Lip 2010 derivation, % per year. |
| `annual_stroke_risk_friberg_2012_percent` | decimal | n/a (calculated) | output | Friberg 2012 cohort, % per year (recommended primary figure). |
| `risk_band` | string | n/a (calculated) | derived | enum: `low` \| `low_moderate` \| `moderate` \| `high` \| `very_high`. |
| `recommendation` | string | n/a (calculated) | output | Sex-aware antithrombotic guidance (original variant). |

> The age categories are mutually exclusive; the renderer should enforce this with `enableWhen` (see Notes). The score expression below already gives the correct result if the caller obeys the mutual-exclusion rule (the +2 and +1 cannot both fire).

---

## Variables

| name | expression |
|---|---|
| `chf` | `%resource.item.where(linkId='chf').answer.value.first()` |
| `hypertension` | `%resource.item.where(linkId='hypertension').answer.value.first()` |
| `age_ge_75` | `%resource.item.where(linkId='age_ge_75').answer.value.first()` |
| `age_65_74` | `%resource.item.where(linkId='age_65_74').answer.value.first()` |
| `diabetes` | `%resource.item.where(linkId='diabetes').answer.value.first()` |
| `stroke_tia_te` | `%resource.item.where(linkId='stroke_tia_te').answer.value.first()` |
| `vascular_disease` | `%resource.item.where(linkId='vascular_disease').answer.value.first()` |
| `sex_female` | `%resource.item.where(linkId='sex_female').answer.value.first()` |

---

## Calculated expressions

### `score` (original CHA₂DS₂-VASc, max 9)

```
iif(%chf, 1, 0)
+ iif(%hypertension, 1, 0)
+ iif(%age_ge_75, 2, 0)
+ iif(%diabetes, 1, 0)
+ iif(%stroke_tia_te, 2, 0)
+ iif(%vascular_disease, 1, 0)
+ iif(%age_65_74, 1, 0)
+ iif(%sex_female, 1, 0)
```

### `annual_stroke_risk_lip_2010_percent`

```
iif(%score = 9, 100.0,
  iif(%score = 8, 11.1,
    iif(%score = 7, 8.0,
      iif(%score = 6, 3.6,
        iif(%score = 5, 3.2,
          iif(%score = 4, 1.9,
            iif(%score = 3, 3.9,
              iif(%score = 2, 1.6,
                iif(%score = 1, 0.6, 0.0))))))))) 
```

### `annual_stroke_risk_friberg_2012_percent` (recommended primary)

```
iif(%score = 9, 12.2,
  iif(%score = 8, 10.8,
    iif(%score = 7, 11.2,
      iif(%score = 6, 9.7,
        iif(%score = 5, 7.2,
          iif(%score = 4, 4.8,
            iif(%score = 3, 3.2,
              iif(%score = 2, 2.2,
                iif(%score = 1, 0.6, 0.2)))))))))
```

### `risk_band` (derived for UI banding)

```
iif(%score >= 7, 'very_high',
  iif(%score >= 3, 'high',
    iif(%score = 2, 'moderate',
      iif(%score = 1, 'low_moderate', 'low'))))
```

### `recommendation` — original variant, sex-aware thresholds

The SPEC §4.3 makes thresholds sex-dependent: a female with a sex-only score of 1 is treated as low-risk equivalent to a male with score 0. Encode that special case at the top of the ladder.

```
iif(%sex_female and %score = 1, 'No antithrombotic therapy (female with sex point only — low-risk equivalent to male score 0).',
  iif(%sex_female,
    iif(%score >= 3, 'OAC recommended (Class I) — DOAC preferred in non-valvular AF unless contraindicated.',
      iif(%score = 2, 'Consider OAC (Class IIa) — individualize based on bleeding risk and patient preference.',
        'No antithrombotic therapy.')),
    iif(%score >= 2, 'OAC recommended (Class I) — DOAC preferred in non-valvular AF unless contraindicated.',
      iif(%score = 1, 'Consider OAC (Class IIa) — individualize based on bleeding risk and patient preference.',
        'No antithrombotic therapy. Truly low-risk.'))))
```

---

## Worked example — test case 1 (Mr. Felix Andersen-Park, score 0)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%chf` | `false` |
| `%hypertension` | `false` |
| `%age_ge_75` | `false` |
| `%age_65_74` | `false` |
| `%diabetes` | `false` |
| `%stroke_tia_te` | `false` |
| `%vascular_disease` | `false` |
| `%sex_female` | `false` |

Evaluating `score`:

```
iif(false,1,0) + iif(false,1,0) + iif(false,2,0) + iif(false,1,0)
+ iif(false,2,0) + iif(false,1,0) + iif(false,1,0) + iif(false,1,0)
= 0
```

Evaluating `risk_band`: ladder falls through → `'low'`.

Evaluating `annual_stroke_risk_friberg_2012_percent`: ladder bottom-out → **0.2 %**.

Evaluating `recommendation`: `%sex_female=false`, `%score=0` → `'No antithrombotic therapy. Truly low-risk.'`

Matches expected output: `score = 0`, Lip 2010 0.0 %, Friberg 2012 0.2 %, recommendation "no antithrombotic therapy".

---

## Notes

### Mutual-exclusion of age categories

`age_ge_75` and `age_65_74` must not both be true. Two implementation options:

1. **Single `age_band` choice item** with three answer codes (`lt_65`, `between_65_74`, `ge_75`) and derive both booleans:
   - variable `age_ge_75` = `%resource.item.where(linkId='age_band').answer.value.code = 'ge_75'`
   - variable `age_65_74` = `%resource.item.where(linkId='age_band').answer.value.code = 'between_65_74'`
2. **Two booleans with `enableWhen`** so that `age_65_74` is enabled only when `age_ge_75 = false`. SPEC §3 makes the categories mutually exclusive; `enableWhen` enforces it at the form layer.

The score formula relies on the caller respecting this — there is no defensive `xor` in the score expression. If you want a defensive form, replace `iif(%age_65_74, 1, 0)` with `iif(%age_65_74 and %age_ge_75.not(), 1, 0)`.

### CHA₂DS₂-VA (ESC 2024) variant

Drop the `sex_female` term from the `score` expression and use the sex-neutral recommendation ladder:

```
iif(%score >= 2, 'OAC recommended (Class I).',
  iif(%score = 1, 'Consider OAC (Class IIa).', 'No antithrombotic therapy.'))
```

You can expose this as a configuration via a hidden `variant` answer item and gate the `sex_female` contribution behind it:

```
... + iif(%variant = 'CHA2DS2-VASc' and %sex_female, 1, 0)
```

### Lookup tables encode cleanly

Both annual-risk tables (Lip 2010, Friberg 2012) are 10-row score → percent maps. Nested `iif()` ladders are unwieldy at 10 rows but still pure FHIRPath. No CQL is required. If a project adopts CQL elsewhere, a `ValueSet`/`Concept Map`–backed lookup is cleaner — but pure FHIRPath is sufficient here.

### Rounding / clamping

- The score is integer by construction.
- All published % / year figures are pre-rounded to 1 decimal in the SPEC; do not re-round.
- Lip 2010 score 9 = 100 % is statistically unreliable (n=1). Surface a UI hint, but the ladder still returns 100.0; use Friberg 2012 (`12.2`) as the headline figure per SPEC §4.2 implementation recommendation.

### Inputs that benefit from `enableWhen`

- `age_65_74` enabled only when `age_ge_75 = false` (mutual exclusion).
- All other booleans are unconditionally required.
