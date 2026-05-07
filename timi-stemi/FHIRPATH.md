# TIMI Risk Score for STEMI — FHIRPath expressions

Encodes Morrow et al. 2000 TIMI Risk Score for STEMI as FHIRPath expressions
suitable for an SDC `Questionnaire` with calculated outputs surfaced via
`http://hl7.org/fhir/StructureDefinition/sdc-questionnaire-calculatedExpression`
and `http://hl7.org/fhir/StructureDefinition/variable`.

All coefficients are fully specified in the source publication; **no TBDs**.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer (or decimal) | yes | Component 1 — Age in years | Numeric age, used to derive 3-level bucket. Alternative: a `choice` linkId `age_band` with codes `lt_65` / `65_74` / `ge_75` if you prefer pre-bucketed input. |
| `dm_htn_angina` | boolean | yes | Component 2 — History of DM, HTN, or angina | Composite: true if any one is documented. |
| `sbp_lt_100` | boolean | yes | Component 3 — SBP < 100 mmHg | Pre-derived flag from first recorded SBP. Alternatively keep a numeric `sbp` linkId and derive in a variable. |
| `hr_gt_100` | boolean | yes | Component 4 — HR > 100 bpm | Pre-derived flag from first recorded HR. Alternatively keep numeric `hr`. |
| `killip_2_4` | boolean | yes | Component 5 — Killip class II–IV | True for Killip II/III/IV; false for Killip I. |
| `weight_lt_67` | boolean | yes | Component 6 — Weight < 67 kg | Pre-derived flag. Alternatively numeric `weight_kg`. |
| `anterior_or_lbbb` | boolean | yes | Component 7 — Anterior STEMI or LBBB | True if anterior ST-elevation OR new/presumed-new LBBB. |
| `ttt_gt_4h` | boolean | yes | Component 8 — Time-to-treatment > 4 h | Pre-derived flag from symptom-onset to reperfusion. |

The sample expressions below use the **boolean-only** variant (recommended for
SDC simplicity). If you prefer numeric inputs, swap `%sbpLt100` for
`%sbp < 100`, etc.

## Variables

Each `variable` extension is attached to the root `Questionnaire` (or the
calculated-output item) so the expressions stay readable.

| name | expression |
|---|---|
| `age` | `%resource.item.where(linkId='age').answer.value` |
| `dmHtnAngina` | `%resource.item.where(linkId='dm_htn_angina').answer.value` |
| `sbpLt100` | `%resource.item.where(linkId='sbp_lt_100').answer.value` |
| `hrGt100` | `%resource.item.where(linkId='hr_gt_100').answer.value` |
| `killip24` | `%resource.item.where(linkId='killip_2_4').answer.value` |
| `weightLt67` | `%resource.item.where(linkId='weight_lt_67').answer.value` |
| `antOrLbbb` | `%resource.item.where(linkId='anterior_or_lbbb').answer.value` |
| `tttGt4h` | `%resource.item.where(linkId='ttt_gt_4h').answer.value` |
| `agePoints` | `iif(%age >= 75, 3, iif(%age >= 65, 2, 0))` |
| `dmHtnAnginaPoints` | `iif(%dmHtnAngina, 1, 0)` |
| `sbpPoints` | `iif(%sbpLt100, 3, 0)` |
| `hrPoints` | `iif(%hrGt100, 2, 0)` |
| `killipPoints` | `iif(%killip24, 2, 0)` |
| `weightPoints` | `iif(%weightLt67, 1, 0)` |
| `ecgPoints` | `iif(%antOrLbbb, 1, 0)` |
| `tttPoints` | `iif(%tttGt4h, 1, 0)` |

## Calculated expressions

### `score` (primary output, integer 0–14)

```fhirpath
%agePoints
  + %dmHtnAnginaPoints
  + %sbpPoints
  + %hrPoints
  + %killipPoints
  + %weightPoints
  + %ecgPoints
  + %tttPoints
```

If you would rather inline everything in one expression on a single
`calculatedExpression` item (no variables):

```fhirpath
iif(%resource.item.where(linkId='age').answer.value >= 75, 3,
  iif(%resource.item.where(linkId='age').answer.value >= 65, 2, 0))
+ iif(%resource.item.where(linkId='dm_htn_angina').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='sbp_lt_100').answer.value, 3, 0)
+ iif(%resource.item.where(linkId='hr_gt_100').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='killip_2_4').answer.value, 2, 0)
+ iif(%resource.item.where(linkId='weight_lt_67').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='anterior_or_lbbb').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='ttt_gt_4h').answer.value, 1, 0)
```

### Secondary outputs

#### `mortality_30d_pct` (decimal, looked up by score)

```fhirpath
iif(%score = 0, 0.8,
iif(%score = 1, 1.6,
iif(%score = 2, 2.2,
iif(%score = 3, 4.4,
iif(%score = 4, 7.3,
iif(%score = 5, 12.4,
iif(%score = 6, 16.1,
iif(%score = 7, 23.4,
iif(%score = 8, 26.8,
35.9))))))))))
```

(All scores ≥ 9 fall into the `>8` bucket → 35.9 %.)

#### Optional human-readable label

```fhirpath
iif(%score <= 8, %score.toString() & ' (mortality ' & %mortality_30d_pct.toString() & '%)',
  '>8 (mortality 35.9%)')
```

The original publication does **not** define discrete low/intermediate/high
risk bands for STEMI — it explicitly behaves as a continuous gradient — so no
band ladder is provided here.

## Worked example — test case 4 (Mathilde Janssens, max-side)

Inputs from `TEST_CASES.md`:

| linkId | answer |
|---|---|
| `age` | 82 |
| `dm_htn_angina` | true |
| `sbp_lt_100` | true (84 mmHg) |
| `hr_gt_100` | true (124 bpm) |
| `killip_2_4` | true (Killip III) |
| `weight_lt_67` | true (58 kg) |
| `anterior_or_lbbb` | true (new LBBB) |
| `ttt_gt_4h` | true (6 h) |

Step-by-step:

| variable | expression | value |
|---|---|---|
| `agePoints` | `iif(82 >= 75, 3, …)` | `3` |
| `dmHtnAnginaPoints` | `iif(true, 1, 0)` | `1` |
| `sbpPoints` | `iif(true, 3, 0)` | `3` |
| `hrPoints` | `iif(true, 2, 0)` | `2` |
| `killipPoints` | `iif(true, 2, 0)` | `2` |
| `weightPoints` | `iif(true, 1, 0)` | `1` |
| `ecgPoints` | `iif(true, 1, 0)` | `1` |
| `tttPoints` | `iif(true, 1, 0)` | `1` |
| `score` | sum | `3 + 1 + 3 + 2 + 2 + 1 + 1 + 1 = 14` |
| `mortality_30d_pct` | score = 14 → `>8` bucket | `35.9` |

Matches expected output (score 14, 30-day mortality 35.9 %).

## Worked example — test case 1 (Felix Hartmann, low-risk)

All booleans false; `age = 38`. `agePoints = iif(38 >= 75, 3, iif(38 >= 65, 2, 0)) = 0`.
All other point variables = 0. `score = 0`. Lookup → `0.8 %`. Matches.

## Notes

- **No TBD coefficients.** All eight points and the 10-row mortality lookup
  are fixed in Morrow 2000.
- **Age input form.** Two equally valid encodings: (a) numeric `age` with the
  three-level `iif` ladder shown above; (b) `choice` linkId `age_band` with
  codes `lt_65 / 65_74 / ge_75` and an `iif` on the coded value. Pick (a) if
  you want to reuse the patient's birth date elsewhere; pick (b) if the form
  designer wants the bucket explicit on the UI.
- **SBP / HR / weight as booleans vs numerics.** The expressions above assume
  pre-derived booleans. If you keep numerics (`sbp`, `hr`, `weight_kg`),
  replace each `%sbpLt100` etc. with the corresponding `< threshold`
  comparison, e.g. `iif(%resource.item.where(linkId='sbp').answer.value < 100, 3, 0)`.
- **Strict `<` and `>`.** SPEC uses strict inequalities for SBP < 100, HR > 100,
  weight < 67, time-to-treatment > 4 h, age < 65 vs ≥ 65 vs ≥ 75. The
  expressions above preserve that exactly (`>=`, `<`, `>`).
- **Killip composite.** A single boolean is simplest. If you prefer a `choice`
  linkId `killip_class` with codes `I / II / III / IV`, replace the
  variable with `%resource.item.where(linkId='killip_class').answer.value.code != 'I'`.
- **DM / HTN / angina composite.** SPEC explicitly says this is a single
  composite item worth 1 point if any present — so a single boolean is
  faithful. If you split it into three booleans for documentation, OR them:
  `(%dm or %htn or %angina)`.
- **`>8` mortality bucket.** Encoded as the fall-through branch of the nested
  `iif` so that any score ≥ 9 (max 14) returns 35.9 %.
- **No CQL needed.** Pure FHIRPath is sufficient: the calculation is an
  explicit point sum with one nested `iif` for age and a flat lookup for
  mortality.
