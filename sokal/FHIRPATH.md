# Sokal Index for CML — FHIRPath expressions

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | decimal | yes | `age` (years at diagnosis) | Linear term, centred at 43.4. |
| `spleen_cm` | decimal | yes | `spleen_cm` (max palpable below LCM, cm) | `0` if not palpable. Centred at 7.51. |
| `platelets` | decimal | yes | `platelets` (×10⁹/L) | Squared/scaled term `(platelets/700)^2 − 0.563`. |
| `blasts_pct` | decimal | yes | `blasts_pct` (peripheral blood blasts %) | 0–100; ≥30% indicates non-chronic-phase, score does not apply. Centred at 2.10. |

## Variables

| name | expression |
|---|---|
| `age` | `%resource.item.where(linkId='age').answer.value` |
| `spleen` | `%resource.item.where(linkId='spleen_cm').answer.value` |
| `plt` | `%resource.item.where(linkId='platelets').answer.value` |
| `blasts` | `%resource.item.where(linkId='blasts_pct').answer.value` |
| `pltScaled` | `(%plt / 700)` |
| `pltTerm` | `(%pltScaled * %pltScaled) - 0.563` |
| `linearPredictor` | `0.0116 * (%age - 43.4) + 0.0345 * (%spleen - 7.51) + 0.188 * %pltTerm + 0.0887 * (%blasts - 2.10)` |

> FHIRPath has no built-in `^` / power operator. Square the platelet ratio with explicit multiplication (`x * x`).

## Calculated expressions

### `score` (primary output — Sokal hazard ratio)

```fhirpath
%linearPredictor.exp()
```

The result is a unitless relative hazard ratio (1.0 at all four cohort means).

Inline form (no helper variables):

```fhirpath
(0.0116 * (%resource.item.where(linkId='age').answer.value - 43.4)
 + 0.0345 * (%resource.item.where(linkId='spleen_cm').answer.value - 7.51)
 + 0.188  * (((%resource.item.where(linkId='platelets').answer.value / 700)
              * (%resource.item.where(linkId='platelets').answer.value / 700))
             - 0.563)
 + 0.0887 * (%resource.item.where(linkId='blasts_pct').answer.value - 2.10)
).exp()
```

### Secondary output — `risk_group`

Bands: `< 0.8` low; `0.8 ≤ score ≤ 1.2` intermediate; `> 1.2` high.

```fhirpath
iif(%score < 0.8, 'low',
  iif(%score > 1.2, 'high', 'intermediate'))
```

> Define `score` as a Variable that references the calculated expression above so this ladder can read it.

### Secondary outputs (pre-TKI survival lookup)

`two_year_pct_pretki`:

```fhirpath
iif(%score < 0.8, 90, iif(%score > 1.2, 65, 78))
```

(78 ≈ midpoint of the 65–90% band reported for intermediate.)

`median_years_pretki`:

```fhirpath
iif(%score < 0.8, 5.0, iif(%score > 1.2, 2.5, 3.75))
```

`five_year_pct_pretki`:

```fhirpath
iif(%score < 0.8, 76, iif(%score > 1.2, 25, 55))
```

`first_line_strategy`:

```fhirpath
iif(%score < 0.8, 'Standard-dose imatinib',
  iif(%score > 1.2,
      'Second-generation TKI; consider trial enrolment / transplant evaluation',
      'Standard-dose imatinib or 2G-TKI; consider patient-specific factors'))
```

## Worked example — test case 2 (Marek Kowalski, intermediate risk)

Inputs: `age = 47`, `spleen_cm = 8`, `platelets = 600`, `blasts_pct = 3`.

1. Age term: `0.0116 * (47 - 43.4) = 0.0116 * 3.6 = 0.04176`
2. Spleen term: `0.0345 * (8 - 7.51) = 0.0345 * 0.49 = 0.016905`
3. Platelet:
   - `pltScaled = 600 / 700 = 0.857143`
   - `pltScaled * pltScaled = 0.734694`
   - `pltTerm = 0.734694 - 0.563 = 0.171694`
   - `0.188 * 0.171694 = 0.032278`
4. Blast term: `0.0887 * (3 - 2.10) = 0.0887 * 0.9 = 0.079830`
5. `linearPredictor = 0.04176 + 0.016905 + 0.032278 + 0.079830 = 0.170773`
6. `score = exp(0.170773) ≈ 1.1862` → rounded **1.19**.
7. `risk_group = iif(1.19 < 0.8, 'low', iif(1.19 > 1.2, 'high', 'intermediate'))` → **`'intermediate'`**.

Matches TEST_CASES.md test case 2.

## Notes

- FHIRPath does not have a `^` exponent operator. Use repeated multiplication (`x * x`) for the square; for higher powers a helper variable is cleaner.
- `exp()` is available as a FHIRPath math function (FHIR `4.0.1+` "Additional functions" / FHIR `R5` math extension). If the engine in use doesn't expose it, fall back to CQL — `Exp(x)` is a CQL built-in.
- Coerce all four inputs to `decimal` to avoid integer arithmetic surprises (especially `platelets / 700`).
- The score is sensitive to the squared platelet term at high platelet counts (see test case 5: platelets = 1800 drives the score to 5.39). Form fields should accept ≥ 4-digit platelet inputs.
- The full `(platelets / 700)^2` is computed *before* subtracting `0.563` — operator precedence matters; use parentheses as shown.
- Spec §2.1 validations (`age ≥ 0`, `spleen_cm ≥ 0`, `platelets > 0`, `0 ≤ blasts_pct ≤ 100`, plus blasts_pct < 30 for chronic-phase applicability) should be enforced via item `extension[minValue]`/`maxValue` and a guard variable; the FHIRPath above assumes valid inputs.
