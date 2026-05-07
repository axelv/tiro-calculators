# EuroSCORE II — FHIRPath expressions

Encoding of EuroSCORE II (Nashef et al., *EJCTS* 2012) for SDC. EuroSCORE II is a single-step logistic regression over 18 inputs, so the FHIRPath builds the linear predictor `y` as a sum of `iif(...)` terms and applies the logistic transform via `exp()`.

## Item linkIds (QuestionnaireResponse contract)

### Patient-related

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2.1 #1 | 18–110 completed years |
| `sex` | choice | true | §2.1 #2 | `male` (ref) / `female` |
| `renal_function` | choice | true | §2.1 #3 | `normal_cc_gt_85` (ref), `moderate_cc_50_85`, `severe_cc_lt_50`, `dialysis` |
| `extracardiac_arteriopathy` | boolean | true | §2.1 #4 | |
| `poor_mobility` | boolean | true | §2.1 #5 | |
| `previous_cardiac_surgery` | boolean | true | §2.1 #6 | |
| `chronic_lung_disease` | boolean | true | §2.1 #7 | |
| `active_endocarditis` | boolean | true | §2.1 #8 | |
| `critical_preoperative_state` | boolean | true | §2.1 #9 | |
| `diabetes_on_insulin` | boolean | true | §2.1 #10 | |

### Cardiac-related

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `nyha_class` | choice | true | §2.2 #11 | `I` (ref), `II`, `III`, `IV` |
| `ccs_class_4` | boolean | true | §2.2 #12 | |
| `lv_function` | choice | true | §2.2 #13 | `good_ge_51` (ref), `moderate_31_50`, `poor_21_30`, `very_poor_le_20` |
| `recent_mi` | boolean | true | §2.2 #14 | |
| `pa_systolic_pressure` | choice | true | §2.2 #15 | `lt_31` (ref), `moderate_31_55`, `severe_ge_55` |

### Operation-related

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `urgency` | choice | true | §2.3 #16 | `elective` (ref), `urgent`, `emergency`, `salvage` |
| `weight_of_procedure` | choice | true | §2.3 #17 | `isolated_cabg` (ref), `single_non_cabg`, `two_procedures`, `three_or_more` |
| `thoracic_aorta_surgery` | boolean | true | §2.3 #18 | |

## Variables

Compact bindings to keep the score expression legible. Each enum variable resolves to its `Coding.code`, each boolean to its `valueBoolean`.

| name | expression |
|---|---|
| `age` | `%resource.item.where(linkId='age').answer.valueInteger` |
| `xAge` | `iif(%age <= 60, 1, %age - 59)` |
| `sex` | `%resource.item.where(linkId='sex').answer.valueCoding.code` |
| `renal` | `%resource.item.where(linkId='renal_function').answer.valueCoding.code` |
| `nyha` | `%resource.item.where(linkId='nyha_class').answer.valueCoding.code` |
| `lv` | `%resource.item.where(linkId='lv_function').answer.valueCoding.code` |
| `pap` | `%resource.item.where(linkId='pa_systolic_pressure').answer.valueCoding.code` |
| `urg` | `%resource.item.where(linkId='urgency').answer.valueCoding.code` |
| `wop` | `%resource.item.where(linkId='weight_of_procedure').answer.valueCoding.code` |
| `arterio` | `%resource.item.where(linkId='extracardiac_arteriopathy').answer.valueBoolean = true` |
| `mobility` | `%resource.item.where(linkId='poor_mobility').answer.valueBoolean = true` |
| `prevCardiac` | `%resource.item.where(linkId='previous_cardiac_surgery').answer.valueBoolean = true` |
| `lung` | `%resource.item.where(linkId='chronic_lung_disease').answer.valueBoolean = true` |
| `endo` | `%resource.item.where(linkId='active_endocarditis').answer.valueBoolean = true` |
| `crit` | `%resource.item.where(linkId='critical_preoperative_state').answer.valueBoolean = true` |
| `diabIns` | `%resource.item.where(linkId='diabetes_on_insulin').answer.valueBoolean = true` |
| `ccs4` | `%resource.item.where(linkId='ccs_class_4').answer.valueBoolean = true` |
| `recentMi` | `%resource.item.where(linkId='recent_mi').answer.valueBoolean = true` |
| `aorta` | `%resource.item.where(linkId='thoracic_aorta_surgery').answer.valueBoolean = true` |

## Calculated expressions

### `y` (linear predictor — Decimal)

Coefficients verbatim from SPEC §3.3 / Nashef 2012 Table 4. Reference categories contribute zero and are omitted.

```fhirpath
-5.324537
+ 0.0285181 * %xAge

+ iif(%sex   = 'female',              0.2196434, 0)

+ iif(%nyha  = 'II',                  0.1070545,
  iif(%nyha  = 'III',                 0.2958358,
  iif(%nyha  = 'IV',                  0.5597929, 0)))

+ iif(%ccs4,                          0.2226147, 0)
+ iif(%diabIns,                       0.3542749, 0)
+ iif(%arterio,                       0.5360268, 0)
+ iif(%lung,                          0.1886564, 0)
+ iif(%mobility,                      0.2407181, 0)
+ iif(%prevCardiac,                   1.118599,  0)

+ iif(%renal = 'moderate_cc_50_85',   0.303553,
  iif(%renal = 'severe_cc_lt_50',     0.8592256,
  iif(%renal = 'dialysis',            0.6421508, 0)))

+ iif(%endo,                          0.6194522, 0)
+ iif(%crit,                          1.086517,  0)

+ iif(%lv    = 'moderate_31_50',      0.3150652,
  iif(%lv    = 'poor_21_30',          0.8084096,
  iif(%lv    = 'very_poor_le_20',     0.9346919, 0)))

+ iif(%recentMi,                      0.1528943, 0)

+ iif(%pap   = 'moderate_31_55',      0.1788899,
  iif(%pap   = 'severe_ge_55',        0.3491475, 0))

+ iif(%urg   = 'urgent',              0.3174673,
  iif(%urg   = 'emergency',           0.7039121,
  iif(%urg   = 'salvage',             1.362947,  0)))

+ iif(%wop   = 'single_non_cabg',     0.0062118,
  iif(%wop   = 'two_procedures',      0.5521478,
  iif(%wop   = 'three_or_more',       0.9724533, 0)))

+ iif(%aorta,                         0.6527205, 0)
```

### `predicted_mortality` (Decimal in [0, 1] — primary output)

```fhirpath
%y.exp() / (1 + %y.exp())
```

`exp()` is supported by FHIRPath (`Decimal.exp() : Decimal`). Numerically stable for the ranges encountered in EuroSCORE II (`y` typically in [-7, +5]). For very large `|y|` the expression is fine (logistic saturates at 0/1 with full precision).

### `predicted_mortality_pct` (Decimal — convenience)

```fhirpath
%predicted_mortality * 100
```

### `risk_stratum` (string — UI hint, configurable per SPEC §4.2)

```fhirpath
iif(%predicted_mortality < 0.04, 'Low',
iif(%predicted_mortality < 0.08, 'Intermediate',
                                 'High'))
```

### `interpretation` (string)

```fhirpath
iif(%risk_stratum = 'Low',          'Conventional surgery generally appropriate.',
iif(%risk_stratum = 'Intermediate', 'Heart Team discussion; consider alternatives in selected patients.',
                                    'Strong indication for Heart Team review; TAVI or alternative strategies frequently preferred.'))
```

## Worked example — test case 2 (Mr. Pieter de Vries)

Inputs: `age = 70`, `nyha_class = II`, `lv_function = moderate_31_50`, `renal_function = moderate_cc_50_85`. All other fields at reference (`sex = male`, `urgency = elective`, `weight_of_procedure = isolated_cabg`, all booleans `false`, `pa_systolic_pressure = lt_31`).

| term | computation | value |
|---|---|---|
| intercept | β0 | −5.324537 |
| age | `%xAge = max(1, 70-59) = 11`; `0.0285181 × 11` | +0.3136991 |
| NYHA II | 0.1070545 | +0.1070545 |
| LV moderate | 0.3150652 | +0.3150652 |
| renal CC 50-85 | 0.303553 | +0.303553 |
| (all other terms 0) | | |

`%y = −4.285165` → `%y.exp() ≈ 0.013772` → `predicted_mortality ≈ 0.013772 / 1.013772 ≈ 0.01359` → **1.36 %** → `Low`. Matches the SPEC §3.4 sanity check and test-case 2 expected outcome.

Sanity-check test case 5 (Otto Brenner, salvage scenario): the eleven non-reference terms sum to `%y = +3.616764` → `e^y ≈ 37.215` → `mortality ≈ 0.9738 ≈ 97.4 %` → `High`. ✓

## Notes

- All 18 items are mandatory; do not allow partial scoring (SPEC §3 / §3.3 conventions).
- Reference categories (`sex = male`, `nyha = I`, `lv = good_ge_51`, `pap = lt_31`, `renal = normal_cc_gt_85`, `urgency = elective`, `weight_of_procedure = isolated_cabg`) all carry coefficient 0 and are simply omitted from the sum.
- The age transform is `x_age = max(1, age − 59)`, encoded as `iif(%age <= 60, 1, %age - 59)` — both forms produce the same result for all integer ages.
- Coefficients are reproduced **verbatim** from SPEC §3.3 / Nashef 2012 Table 4. If the SPEC ever updates a coefficient, edit this file in lockstep.
- Output is a probability in [0, 1]. The percentage and risk-stratum derivations are pure UI conveniences; the model output is always the probability.
- EuroSCORE II is known to under-predict at the very high-risk end (SPEC §4.3); show the inputs alongside the percentage so the clinician can audit the answer (SPEC §4.3 last bullet).
- This logistic regression is fully expressible in FHIRPath using `iif`, `+`, `*`, `exp()` — no escalation to CQL needed.
