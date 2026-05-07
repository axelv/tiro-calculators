# TIMI Risk Index — FHIRPath expressions

A pure-FHIRPath encoding of the TIMI Risk Index (TRI) suitable for an SDC `Questionnaire`. The score is a single closed-form formula over three numeric inputs; quintile and risk-band derivations are nested `iif()` ladders.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `heart_rate` | integer | yes | `heart_rate` | Admission HR in bpm. Must be > 0. |
| `age` | integer | yes | `age` | Age in years. Must be > 0. |
| `systolic_bp` | integer | yes | `systolic_bp` | Admission SBP in mmHg. Must be > 0 (denominator). |
| `tri` | decimal | n/a (calculated) | output `tri` | TIMI Risk Index value (unitless). |
| `quintile` | integer | n/a (calculated) | output `quintile` | 1–5. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | enum: `low` \| `intermediate` \| `high` \| `very_high`. |
| `mortality_30d_estimate_pct` | decimal | n/a (calculated) | output `mortality_30d_estimate_pct` | STEMI derivation cohort. |
| `mortality_24h_estimate_pct` | decimal | n/a (calculated) | output | STEMI derivation cohort. |

> Implementation note: per SPEC §2 all three inputs are required. Reject `systolic_bp = 0` upstream — the FHIRPath expression assumes SBP > 0 and will produce `+Infinity` if violated.

---

## Variables

| name | expression |
|---|---|
| `hr` | `%resource.item.where(linkId='heart_rate').answer.value.first()` |
| `age` | `%resource.item.where(linkId='age').answer.value.first()` |
| `sbp` | `%resource.item.where(linkId='systolic_bp').answer.value.first()` |

---

## Calculated expressions

### `tri`

```
(%hr * (%age / 10).power(2)) / %sbp
```

### `quintile`

```
iif(%tri >= 30.0, 5,
  iif(%tri >= 22.5, 4,
    iif(%tri >= 17.5, 3,
      iif(%tri >= 12.5, 2, 1))))
```

### `risk_band`

```
iif(%quintile >= 5, 'very_high',
  iif(%quintile = 4, 'high',
    iif(%quintile = 3, 'intermediate', 'low')))
```

### `mortality_30d_estimate_pct`

```
iif(%quintile = 5, 16.1,
  iif(%quintile = 4, 5.5,
    iif(%quintile = 3, 2.9,
      iif(%quintile = 2, 1.9, 0.8))))
```

### `mortality_24h_estimate_pct`

```
iif(%quintile = 5, 6.9,
  iif(%quintile = 4, 3.3,
    iif(%quintile = 3, 1.6,
      iif(%quintile = 2, 0.9, 0.4))))
```

---

## Worked example — test case 1 (Lukas Brenner, Q1)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%hr` | 72 |
| `%age` | 42 |
| `%sbp` | 138 |

Evaluating `tri`:

```
(72 * (42 / 10).power(2)) / 138
= (72 * 4.2.power(2)) / 138
= (72 * 17.64)        / 138
= 1270.08             / 138
≈ 9.20
```

Evaluating `quintile`: `9.20 < 12.5` → falls through to `1`.
Evaluating `risk_band`: quintile = 1 → `'low'`.
Evaluating `mortality_30d_estimate_pct`: quintile = 1 → `0.8`.
Evaluating `mortality_24h_estimate_pct`: quintile = 1 → `0.4`.

Matches expected output: TRI ≈ 9.20, quintile Q1, 30-day mortality 0.8 %, risk band `low`.

---

## Notes

- `power()` is a native FHIRPath function and accepts integer exponents — no CQL escalation required.
- Division uses real arithmetic; the result is a `decimal`. Implementations should round at presentation time only (typically 1–2 decimals).
- Quintile boundaries follow SPEC §4.1 with `<` on the upper bound and `≥` on the lower; the ladder above uses `>=` from the top down to make the boundary behaviour explicit (TRI = 30.0 → Q5; TRI = 22.5 → Q4).
- The SPEC notes quintile cut-points are approximate and source-dependent; treat the constants `12.5 / 17.5 / 22.5 / 30.0` as configuration if you ever need to switch source publication.
- All three inputs are `required = true`. Surface a validation error for non-positive SBP rather than letting the calculated expression evaluate to `+Infinity`.
