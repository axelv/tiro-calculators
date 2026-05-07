# TRI-SCORE — FHIRPath expressions

Encodes the TRI-SCORE (Dreyfus et al. *Eur Heart J* 2022) — an additive 8-item
integer risk score (range 0–12) for in-hospital mortality after isolated
tricuspid valve surgery — as FHIRPath expressions for an SDC `Questionnaire`
with calculated outputs.

All coefficients (the eight 1- or 2-point weights, the 10-row mortality
lookup, the three-band classification) are fully specified in Dreyfus 2022;
**no TBDs**.

## Item linkIds (QuestionnaireResponse contract)

linkIds match the `Field` column from `SPEC.md` § 2 verbatim.

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_ge_70` | boolean | yes | Age ≥ 70 years at surgery | Alt: numeric `age` linkId with `>= 70` in a variable. |
| `nyha_class_iii_iv` | boolean | yes | NYHA III or IV | Alt: `choice` linkId `nyha_class` with codes I/II/III/IV. |
| `right_heart_failure_signs` | boolean | yes | Severe JVD, ascites, and/or marked oedema | Composite per Dreyfus 2022 verbatim. |
| `daily_furosemide_ge_125_mg` | boolean | yes | Daily furosemide ≥ 125 mg (or equivalent) | Convert bumetanide / torasemide to furosemide-equivalent before checking the threshold. |
| `gfr_lt_30` | boolean | yes | eGFR < 30 mL/min/1.73 m² (CKD-EPI / MDRD) | Chronic dialysis → coded `true`. |
| `bilirubin_elevated` | boolean | yes | Total bilirubin > local lab ULN | ULN lab-dependent (commonly > 1.2 mg/dL ≈ > 20.5 μmol/L). |
| `lvef_lt_60` | boolean | yes | LVEF < 60 % on TTE | Simpson biplane preferred. |
| `rv_dysfunction_mod_severe` | boolean | yes | Moderate or severe RV systolic dysfunction on TTE | TAPSE < 17 mm, S′ < 9.5 cm/s, or FAC < 35 % consistent with at least moderate dysfunction. |

Per SPEC § 4.3 every item is required; do not impute missing values.

## Variables

| name | expression |
|---|---|
| `ageGe70` | `%resource.item.where(linkId='age_ge_70').answer.value` |
| `nyha34` | `%resource.item.where(linkId='nyha_class_iii_iv').answer.value` |
| `rhfSigns` | `%resource.item.where(linkId='right_heart_failure_signs').answer.value` |
| `furo125` | `%resource.item.where(linkId='daily_furosemide_ge_125_mg').answer.value` |
| `gfrLt30` | `%resource.item.where(linkId='gfr_lt_30').answer.value` |
| `biliHigh` | `%resource.item.where(linkId='bilirubin_elevated').answer.value` |
| `lvefLt60` | `%resource.item.where(linkId='lvef_lt_60').answer.value` |
| `rvDysf` | `%resource.item.where(linkId='rv_dysfunction_mod_severe').answer.value` |

## Calculated expressions

### `score` (primary output, integer 0–12)

Eight inputs, weights 1 or 2; explicit `iif` per input:

```fhirpath
  iif(%ageGe70, 1, 0)
+ iif(%nyha34, 1, 0)
+ iif(%rhfSigns, 2, 0)
+ iif(%furo125, 2, 0)
+ iif(%gfrLt30, 2, 0)
+ iif(%biliHigh, 2, 0)
+ iif(%lvefLt60, 1, 0)
+ iif(%rvDysf, 1, 0)
```

Inline form (no variables):

```fhirpath
  iif(%resource.item.where(linkId='age_ge_70').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='nyha_class_iii_iv').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='right_heart_failure_signs').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='daily_furosemide_ge_125_mg').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='gfr_lt_30').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='bilirubin_elevated').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='lvef_lt_60').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='rv_dysfunction_mod_severe').answer.value, 1, 0)
```

### Secondary outputs

#### `predicted_inhospital_mortality_pct` (integer percentage, lookup by score)

Per Dreyfus 2022 Table 3:

```fhirpath
iif(%score = 0, 1,
iif(%score = 1, 2,
iif(%score = 2, 3,
iif(%score = 3, 5,
iif(%score = 4, 8,
iif(%score = 5, 14,
iif(%score = 6, 22,
iif(%score = 7, 34,
iif(%score = 8, 48,
65)))))))))
```

(All scores ≥ 9 fall into the `≥ 9` bucket → 65 %.)

#### `risk_band` (string, low/intermediate/high) — risk-band ladder

Per SPEC § 4.2: low 0–3, intermediate 4–5, high ≥ 6.

```fhirpath
iif(%score <= 3, 'low',
iif(%score <= 5, 'intermediate',
'high'))
```

#### Optional human-readable interpretation

```fhirpath
iif(%score <= 3, 'Low surgical risk (predicted in-hospital mortality ≤ 5 %).',
iif(%score <= 5, 'Intermediate surgical risk (predicted in-hospital mortality 8–14 %); Heart Team discussion required.',
'High surgical risk (predicted in-hospital mortality ≥ 22 %); consider transcatheter therapy or medical management.'))
```

## Worked example — test case 3 (Margarethe Schulz, intermediate)

Inputs from `TEST_CASES.md`:

| linkId | answer |
|---|---|
| `age_ge_70` | true (71) |
| `nyha_class_iii_iv` | true (III) |
| `right_heart_failure_signs` | false (mild oedema only) |
| `daily_furosemide_ge_125_mg` | true (160 mg) |
| `gfr_lt_30` | false (eGFR 48) |
| `bilirubin_elevated` | false (1.0 mg/dL) |
| `lvef_lt_60` | true (50 %) |
| `rv_dysfunction_mod_severe` | false |

Per-input `iif` evaluation:

| variable | iif | value |
|---|---|---|
| `ageGe70` | `iif(true, 1, 0)` | `1` |
| `nyha34` | `iif(true, 1, 0)` | `1` |
| `rhfSigns` | `iif(false, 2, 0)` | `0` |
| `furo125` | `iif(true, 2, 0)` | `2` |
| `gfrLt30` | `iif(false, 2, 0)` | `0` |
| `biliHigh` | `iif(false, 2, 0)` | `0` |
| `lvefLt60` | `iif(true, 1, 0)` | `1` |
| `rvDysf` | `iif(false, 1, 0)` | `0` |
| `score` | sum | `1 + 1 + 0 + 2 + 0 + 0 + 1 + 0 = 5` |
| `predicted_inhospital_mortality_pct` | `iif(5 = 0, 1, … iif(5 = 5, 14, …))` | `14` |
| `risk_band` | `iif(5 <= 3, 'low', iif(5 <= 5, 'intermediate', 'high'))` | `'intermediate'` |

Matches expected output (score 5, predicted 14 %, intermediate risk).

## Worked example — test case 5 (Edith Lambourne, max score)

All eight booleans true.

- Sum: `1 + 1 + 2 + 2 + 2 + 2 + 1 + 1 = 12`
- Mortality lookup: `12 ≥ 9` → falls through nested ladder to `65`
- Risk band: `12 > 5` → `'high'`

Matches expected output (score 12, 65 %, high risk).

## Notes

- **No TBD coefficients.** All eight weights (4 × 1 pt, 4 × 2 pt), the 10-row
  mortality lookup, and the three risk bands are fixed in Dreyfus 2022.
- **Required inputs / no imputation.** SPEC § 4.3 explicitly forbids imputing
  missing values — refuse to compute. Enforce with `required=true` on every
  item and no `defaultValue`.
- **Two-point items.** RHF signs, furosemide ≥ 125 mg/day, eGFR < 30, and
  bilirubin elevated each contribute 2 points; the `iif(<flag>, 2, 0)` form
  makes that explicit.
- **Mortality lookup.** Fixed integer percentages from Dreyfus 2022 Table 3
  (predicted column). Observed percentages from the derivation cohort are
  documented in SPEC § 4.1 but are not surfaced as a calculator output by
  default. If you want both, add a parallel `observed_inhospital_mortality_pct`
  expression with the observed values: 0/4/1/0/10/18/25/32/33/60.
- **`≥ 9` bucket.** The fall-through branch of the nested `iif` returns 65 %
  for any score ≥ 9 (max 12).
- **Risk-band ladder.** Three bands as published; encoded with two
  `<=` boundaries (3 and 5) plus a high-side fall-through.
- **Furosemide-equivalent dose.** SPEC §§ 2 & 4.3 require the caller to
  convert bumetanide / torasemide to furosemide equivalents before
  populating `daily_furosemide_ge_125_mg`. That conversion is a clinical
  pre-processing step and is intentionally out of scope for the FHIRPath.
- **Out-of-scope populations.** Combined left-sided + tricuspid surgery,
  congenital disease, primary IE, and transplant are explicitly out of
  scope per SPEC. The Questionnaire should display a banner / disclaimer
  warning rather than try to encode this in FHIRPath.
- **Optional NYHA `choice` form.** If you prefer a `choice` linkId
  `nyha_class` with codes `I`, `II`, `III`, `IV`, replace `%nyha34` with
  `(%resource.item.where(linkId='nyha_class').answer.value.code in ('III' | 'IV'))`.
- **No CQL needed.** Pure FHIRPath suffices: an explicit weighted sum of
  eight 0/n contributions plus two small lookup ladders.
