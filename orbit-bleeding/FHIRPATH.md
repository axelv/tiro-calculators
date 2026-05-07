# ORBIT Bleeding Score — FHIRPath expressions

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `older_age` | boolean | yes | `older_age` | Age ≥ 75 years. |
| `reduced_hgb_or_anemia` | boolean | yes | `reduced_hgb_or_anemia` | Hb < 13 (men) / 12 (women) **or** Hct < 40 % (men) / 36 % (women) **or** documented anemia history. Composite — clinician evaluates upstream. |
| `bleeding_history` | boolean | yes | `bleeding_history` | Prior GI / intracranial / hemorrhagic-stroke bleed. |
| `renal_insufficiency` | boolean | yes | `renal_insufficiency` | eGFR < 60 mL/min/1.73 m². |
| `antiplatelet_use` | boolean | yes | `antiplatelet_use` | Current aspirin / clopidogrel / prasugrel / ticagrelor. |

## Variables

| name | expression |
|---|---|
| `olderAge` | `%resource.repeat(item).where(linkId='older_age').answer.value` |
| `reducedHgb` | `%resource.repeat(item).where(linkId='reduced_hgb_or_anemia').answer.value` |
| `bleedHx` | `%resource.repeat(item).where(linkId='bleeding_history').answer.value` |
| `renal` | `%resource.repeat(item).where(linkId='renal_insufficiency').answer.value` |
| `antiplatelet` | `%resource.repeat(item).where(linkId='antiplatelet_use').answer.value` |

## Calculated expressions

### `score` (range 0–7)

```
iif(%olderAge,     1, 0)
+ iif(%reducedHgb, 2, 0)
+ iif(%bleedHx,    2, 0)
+ iif(%renal,      1, 0)
+ iif(%antiplatelet, 1, 0)
```

### `risk_band`

```
iif(%score <= 2, 'low',
  iif(%score = 3, 'medium', 'high'))
```

### `rate_per_100_py` (per-score rate, ORBIT-AF derivation)

```
iif(%score = 0, 1.7,
iif(%score = 1, 2.3,
iif(%score = 2, 2.9,
iif(%score = 3, 4.7,
iif(%score = 4, 6.8,
                 9.0)))))
```

> Scores ≥ 5 collapse to a single rate (9.0), per the SPEC's per-score table (the `≥ 5` row).

### `rate_ci_low`

```
iif(%score = 0, 1.2,
iif(%score = 1, 1.9,
iif(%score = 2, 2.3,
iif(%score = 3, 4.0,
iif(%score = 4, 5.8,
                 7.2)))))
```

### `rate_ci_high`

```
iif(%score = 0, 2.4,
iif(%score = 1, 2.9,
iif(%score = 2, 3.5,
iif(%score = 3, 5.6,
iif(%score = 4, 8.1,
                 11.2)))))
```

### `rate_per_100_py_band` (pooled-band rate, optional display)

```
iif(%score <= 2, 2.4,
  iif(%score = 3, 4.7, 8.1))
```

## Worked example — test case 4 (Score 5, High risk)

Henryk Kowalski:

| linkId | answer |
|---|---|
| `older_age` | true (82) |
| `reduced_hgb_or_anemia` | true (Hb 10.9, chronic anemia) |
| `bleeding_history` | false |
| `renal_insufficiency` | true (eGFR 38) |
| `antiplatelet_use` | true (clopidogrel) |

Compute `score`:

```
1 + 2 + 0 + 1 + 1  =  5
```

- `score = 5`
- `risk_band` → `score > 3` → `'high'`
- `rate_per_100_py` → score not in 0..4, falls through → **9.0**
- `rate_ci_low` / `rate_ci_high` → **7.2 / 11.2**
- `rate_per_100_py_band` → `score > 3` → **8.1**

Matches SPEC test case 4 exactly.

## Notes

- ORBIT is a clean weighted boolean sum — pure FHIRPath, no CQL needed.
- `reduced_hgb_or_anemia` is a composite. If the implementation wants to derive it from raw lab values, expose three booleans (`hgb_below_threshold`, `hct_below_threshold`, `anemia_history`) and use `iif(%hgbBelow or %hctBelow or %anemiaHx, 2, 0)` in the score expression. Sex-specific Hb/Hct thresholds would in turn require a `sex` variable. The SPEC keeps it as one boolean to avoid duplicating the threshold logic in the calculator.
- "ORBIT does not contraindicate anticoagulation" — render the `risk_band` as informational, not gating.
- All five inputs are independent booleans; nothing is mutually exclusive.
