# ELTS (EUTOS Long-Term Survival) Score — FHIRPath expressions

Encoding of the ELTS score for chronic-phase CML (Pfirrmann et al., *Leukemia* 2016) for SDC. The score is a continuous Cox-derived linear combination with cube and inverse-square-root transforms, so the FHIRPath uses `power()` and full floating-point precision.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2 — Age | Completed years (validated for ≥ 18) |
| `spleen_cm` | decimal | true | §2 — Spleen size below costal margin | cm; `0` if not palpable; imaging-only does not substitute |
| `blasts_pct` | decimal | true | §2 — Peripheral-blood blasts | %, 0–100; rounded to nearest integer **before** computation |
| `platelets` | decimal | true | §2 — Platelet count | × 10⁹/L; must be strictly > 0 |

Add `minValue` / `maxValue` extensions on the items: `age >= 18` (warning only), `spleen_cm >= 0`, `blasts_pct in [0, 100]`, `platelets > 0`.

## Variables

| name | expression |
|---|---|
| `age` | `%resource.item.where(linkId='age').answer.valueInteger` |
| `spleen` | `%resource.item.where(linkId='spleen_cm').answer.valueDecimal` |
| `blastsRaw` | `%resource.item.where(linkId='blasts_pct').answer.valueDecimal` |
| `blasts` | `%blastsRaw.round()` |
| `plt` | `%resource.item.where(linkId='platelets').answer.valueDecimal` |

`round()` in FHIRPath rounds half-to-even by default; the SPEC says "nearest integer" — for the integer-valued blasts inputs in the test cases this is a non-issue, but document it for the integration team.

## Calculated expressions

### `score` (decimal, ≥ 0)

```fhirpath
  0.0025 * (%age / 10).power(3)
+ 0.0615 * %spleen
+ 0.1052 * %blasts
+ 0.4104 * (%plt / 1000).power(-0.5)
```

Equivalent fully expanded form (no variables, single expression):

```fhirpath
  0.0025 * (%resource.item.where(linkId='age').answer.valueInteger / 10).power(3)
+ 0.0615 * %resource.item.where(linkId='spleen_cm').answer.valueDecimal
+ 0.1052 * %resource.item.where(linkId='blasts_pct').answer.valueDecimal.round()
+ 0.4104 * (%resource.item.where(linkId='platelets').answer.valueDecimal / 1000).power(-0.5)
```

`power(-0.5)` is supported by FHIRPath (the `power(exponent)` function accepts negative and fractional exponents and returns Decimal). Carry full precision and only round at display time.

### `score_display` (decimal, 4 dp — matches the cut-points)

```fhirpath
(%score * 10000).round() / 10000
```

### `risk_group` (string)

Cut-points per SPEC §4.2 — boundaries inclusive on the lower-risk side.

```fhirpath
iif(%score <= 1.5680, 'Low',
iif(%score <= 2.2185, 'Intermediate',
                      'High'))
```

### `ten_year_cml_specific_death_pct` (integer; from SPEC §4.3)

```fhirpath
iif(%score <= 1.5680, 2,
iif(%score <= 2.2185, 5,
                      12))
```

### `ten_year_cml_specific_survival_pct`

```fhirpath
100 - %ten_year_cml_specific_death_pct
```

or directly:

```fhirpath
iif(%score <= 1.5680, 98,
iif(%score <= 2.2185, 95,
                      88))
```

### `interpretation` (string, SPEC §4.5)

```fhirpath
iif(%risk_group = 'Low',          'Standard first-line TKI per local guidance; routine 3-monthly molecular monitoring.',
iif(%risk_group = 'Intermediate', 'First-line TKI as above; lower threshold to switch on inadequate response at the ELN molecular milestones.',
                                  'Strongly consider a 2nd-generation TKI over imatinib first-line; closer molecular monitoring and earlier discussion of switch / allo-HCT eligibility.'))
```

## Worked example — test case 1 (Mr. Niels Andersen)

Inputs: `age = 35`, `spleen_cm = 0`, `blasts_pct = 0`, `platelets = 320`.

| term | computation | value |
|---|---|---|
| age term | `0.0025 * (35/10)^3 = 0.0025 * 42.875` | 0.10719 |
| spleen term | `0.0615 * 0` | 0.00000 |
| blasts term | `0.1052 * 0` | 0.00000 |
| platelet term | `0.4104 * (320/1000)^(-0.5) = 0.4104 * 1.76777` | 0.72549 |

`%score = 0.83268`, rounded to 4 dp → **0.8327** → `≤ 1.5680` → `'Low'` → 10-yr CML death ~2 %, survival ~98 %. ✓

Sanity-check test case 4 (Jean-Luc Moreau, age 72 / spleen 12 / blasts 6 / plt 180):

```
0.0025 * (7.2)^3                = 0.0025 * 373.248       = 0.93312
0.0615 * 12                                              = 0.73800
0.1052 * 6                                               = 0.63120
0.4104 * (0.180)^(-0.5)         = 0.4104 * 2.35702       = 0.96732
                                                  Total  = 3.26964
```

→ 3.2696 → `> 2.2185` → `'High'`. ✓

Test case 5 (extreme): age 82, spleen 25, blasts 12, plt 60 → 5.8538 → `'High'`. ✓

## Notes

- The cube and inverse-square-root transforms are the only "tricky" pieces — both handled by `power()` with appropriate exponent. There is **no need** to escalate to CQL.
- Unit normalisation is the caller's responsibility (see SPEC §2 implementation notes). Platelet inputs in K/µL × 1000 = ×10⁹/L; serum platelets in ×10⁹/L are passed through unchanged.
- Enforce `platelets > 0` at the form level (`minValueDecimal = 1` is too coarse — use a Quantity validation extension or skip the score expression if `%plt = 0`).
- Display the score to 4 decimal places via `(%score * 10000).round() / 10000` — this matches the published cut-point precision and avoids spurious classification flips.
- `blasts_pct` is rounded **inside** the calculation per SPEC §2 / §3. If your renderer wants to display the rounded value to the clinician, surface `%blasts` as a derived display item.
- The score is undefined at `platelets = 0` (division by zero in the inverse square root). Either gate the calculation with `iif(%plt > 0, <expression>, {})` or reject the answer at form-level. The spec recommends the latter.
