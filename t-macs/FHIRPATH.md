# T-MACS (Troponin-only Manchester ACS Decision Aid) — FHIRPath expressions

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `hs_ctnt` | decimal | yes | `T` — hs-cTnT (ng/L, Roche Elecsys 5th-gen) | Continuous; coefficient calibrated to this assay only. |
| `ecg_ischaemia` | boolean | yes | `E` — ECG ischaemia | Treating clinician's interpretation. |
| `worsening_angina` | boolean | yes | `A` — Crescendo angina | More frequent / less exertional / more prolonged. |
| `pain_radiates_right_arm` | boolean | yes | `R` — Pain radiating to right arm/shoulder | Patient history. |
| `vomiting_with_pain` | boolean | yes | `V` — Vomiting with chest pain | Patient-reported. |
| `sweating_observed` | boolean | yes | `S` — Diaphoresis observed | Clinician-observed (not patient-reported). |
| `sbp_lt_100` | boolean | yes | `H` — Hypotension (SBP < 100 mmHg on arrival) | Derive from first ED SBP. |

> If preferable, model `sbp_lt_100` as a derived flag from a numeric `sbp` item: `%resource.item.where(linkId='sbp').answer.value < 100`.

## Variables

| name | expression |
|---|---|
| `T` | `%resource.item.where(linkId='hs_ctnt').answer.value` |
| `E` | `iif(%resource.item.where(linkId='ecg_ischaemia').answer.value = true, 1, 0)` |
| `A` | `iif(%resource.item.where(linkId='worsening_angina').answer.value = true, 1, 0)` |
| `R` | `iif(%resource.item.where(linkId='pain_radiates_right_arm').answer.value = true, 1, 0)` |
| `V` | `iif(%resource.item.where(linkId='vomiting_with_pain').answer.value = true, 1, 0)` |
| `S` | `iif(%resource.item.where(linkId='sweating_observed').answer.value = true, 1, 0)` |
| `H` | `iif(%resource.item.where(linkId='sbp_lt_100').answer.value = true, 1, 0)` |
| `linearPredictor` | `-4.766 + 1.713 * %E + 0.847 * %A + 0.607 * %R + 1.417 * %V + 2.058 * %S + 1.208 * %H + 0.089 * %T` |

## Calculated expressions

### `probability` (primary output)

T-MACS is a logistic model. Linear predictor:

```
LP = -4.766 + 1.713·E + 0.847·A + 0.607·R + 1.417·V + 2.058·S + 1.208·H + 0.089·T
```

Probability transform `p = 1 / (1 + exp(-LP))`:

```fhirpath
1 / (1 + (-1 * %linearPredictor).exp())
```

Inline form:

```fhirpath
1 / (1 + (-1 * (
  -4.766
  + 1.713 * iif(%resource.item.where(linkId='ecg_ischaemia').answer.value = true, 1, 0)
  + 0.847 * iif(%resource.item.where(linkId='worsening_angina').answer.value = true, 1, 0)
  + 0.607 * iif(%resource.item.where(linkId='pain_radiates_right_arm').answer.value = true, 1, 0)
  + 1.417 * iif(%resource.item.where(linkId='vomiting_with_pain').answer.value = true, 1, 0)
  + 2.058 * iif(%resource.item.where(linkId='sweating_observed').answer.value = true, 1, 0)
  + 1.208 * iif(%resource.item.where(linkId='sbp_lt_100').answer.value = true, 1, 0)
  + 0.089 * %resource.item.where(linkId='hs_ctnt').answer.value
)).exp())
```

### `risk_band` (rule-out / observation / rule-in stratification)

Bands per Body 2017: `< 0.02` very low · `0.02 ≤ p < 0.05` low · `0.05 ≤ p < 0.95` moderate · `p ≥ 0.95` high.

```fhirpath
iif(%probability < 0.02, 'very_low',
  iif(%probability < 0.05, 'low',
    iif(%probability < 0.95, 'moderate', 'high')))
```

### `risk_band_label`

```fhirpath
iif(%probability < 0.02, 'Very low risk — ACS effectively ruled out',
  iif(%probability < 0.05, 'Low risk — ACS unlikely but not excluded',
    iif(%probability < 0.95, 'Moderate risk — observational zone (diagnostic uncertainty)',
      'High risk — ACS effectively ruled in')))
```

### `disposition`

```fhirpath
iif(%probability < 0.02, 'Consider discharge from ED after this single blood test',
  iif(%probability < 0.05, 'Serial troponin in low-dependency area (e.g. ED observation)',
    iif(%probability < 0.95, 'Serial troponin on general / acute medical ward',
      'Refer for cardiology assessment per local ACS pathway')))
```

## Worked example — test case 3 (Robert Kingsley, moderate risk)

Inputs: `T = 18`, `E = 0`, `A = 1`, `R = 1`, `V = 0`, `S = 0`, `H = 0`.

1. `linearPredictor = -4.766 + 1.713·0 + 0.847·1 + 0.607·1 + 1.417·0 + 2.058·0 + 1.208·0 + 0.089·18`
2. `= -4.766 + 0 + 0.847 + 0.607 + 0 + 0 + 0 + 1.602`
3. `= -1.710`
4. `(-1 * -1.710).exp() = exp(1.710) ≈ 5.529`
5. `probability = 1 / (1 + 5.529) ≈ 0.15316` → ~**15.3 %**
6. `risk_band`: `0.153 < 0.02`? no. `< 0.05`? no. `< 0.95`? yes → **`'moderate'`**.

Matches TEST_CASES.md test case 3.

Spot-check test case 1 (Jana Bekker, very low):
- `LP = -4.766 + 0.089*3 = -4.499`
- `p = 1 / (1 + exp(4.499)) ≈ 1 / 90.94 ≈ 0.011` → `risk_band = 'very_low'`. Matches.

## Notes

- T-MACS is a logistic regression — written explicitly as `1 / (1 + exp(-LP))`. The negation is encoded as `(-1 * %linearPredictor).exp()` because FHIRPath's unary minus inside `.exp()` can be ambiguous in some engines; multiplication is universally portable.
- `exp()` is the FHIR R5 math-extension function; if your engine lacks it, escalate to CQL (`Exp(x)`).
- Booleans are coerced to 1/0 via `iif(... = true, 1, 0)` — necessary because FHIRPath does not implicitly cast booleans to numeric.
- The coefficient on `T` (`+0.089` per ng/L) is calibrated to the **Roche Elecsys 5th-generation hs-cTnT** assay only. Recalibration is required for other assays — surface this in any UI tooltip.
- `hs_ctnt` should be `decimal`; ensure upstream parsing accepts `< 3 ng/L` and similar reporting limits as numeric (commonly substituted with the lower limit).
- All seven inputs are required (Body 2017 used complete-case analysis). Gate the calculation with `iif(<all-present>, <expr>, {})` if you need to suppress output during data entry.
