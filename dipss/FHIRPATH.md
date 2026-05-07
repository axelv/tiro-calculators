# DIPSS — FHIRPath expressions

Encoding of the Dynamic International Prognostic Scoring System (Passamonti et al., *Blood* 2010) for use in a FHIR SDC `Questionnaire` and downstream `QuestionnaireResponse` extraction. All five inputs are clinician-confirmed booleans, so the form should not infer truthiness from missing answers.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_gt_65` | boolean | true | §2 — Age > 65 years | Strict `>` 65 |
| `constitutional_symptoms` | boolean | true | §2 — Constitutional symptoms | Weight loss > 10 % / fever / drenching night sweats |
| `hgb_lt_10` | boolean | true | §2 — Hemoglobin < 10 g/dL | Caller normalises units to g/dL before answering |
| `wbc_gt_25` | boolean | true | §2 — Leukocyte count > 25 × 10⁹/L | Caller normalises to 10⁹/L |
| `blasts_ge_1` | boolean | true | §2 — Peripheral blasts ≥ 1 % | Recompute from absolute count if needed |

The five items must be wired with `required = true` in the `Questionnaire` and validation must reject `null`/missing answers (see SPEC §2 — "Missing values must not be coerced to `false`").

## Variables

Bind these as `extension[http://hl7.org/fhir/StructureDefinition/variable]` on the root `Questionnaire` (or on the score item). Each one resolves an answer to a 1/0 integer.

| name | expression |
|---|---|
| `age` | `iif(%resource.item.where(linkId='age_gt_65').answer.valueBoolean = true, 1, 0)` |
| `cs` | `iif(%resource.item.where(linkId='constitutional_symptoms').answer.valueBoolean = true, 1, 0)` |
| `hgb` | `iif(%resource.item.where(linkId='hgb_lt_10').answer.valueBoolean = true, 1, 0)` |
| `wbc` | `iif(%resource.item.where(linkId='wbc_gt_25').answer.valueBoolean = true, 1, 0)` |
| `blasts` | `iif(%resource.item.where(linkId='blasts_ge_1').answer.valueBoolean = true, 1, 0)` |

(Replace `%resource` with the appropriate root context — typically `%resource` on a `Questionnaire` evaluating against `%context` of type `QuestionnaireResponse`, or `QuestionnaireResponse` directly when invoked from extraction.)

## Calculated expressions

### `score` (integer 0–6)

```fhirpath
%age + %cs + (2 * %hgb) + %wbc + %blasts
```

Inline form (no variables):

```fhirpath
  iif(%resource.item.where(linkId='age_gt_65').answer.valueBoolean,            1, 0)
+ iif(%resource.item.where(linkId='constitutional_symptoms').answer.valueBoolean, 1, 0)
+ iif(%resource.item.where(linkId='hgb_lt_10').answer.valueBoolean,            2, 0)
+ iif(%resource.item.where(linkId='wbc_gt_25').answer.valueBoolean,            1, 0)
+ iif(%resource.item.where(linkId='blasts_ge_1').answer.valueBoolean,          1, 0)
```

### `risk_group`

```fhirpath
iif(%score = 0,        'Low',
iif(%score <= 2,       'Intermediate-1',
iif(%score <= 4,       'Intermediate-2',
                       'High')))
```

### `median_survival_years` (Decimal | empty for Low)

Per SPEC §4.2 / §4.4: Low → `null` / "Not reached"; Int-1 14.2 y; Int-2 4.0 y; High 1.5 y.

```fhirpath
iif(%score = 0,        {},
iif(%score <= 2,       14.2,
iif(%score <= 4,       4.0,
                       1.5)))
```

(`{}` is FHIRPath empty collection — maps to `null` on extraction. If the consumer prefers a sentinel, use `-1` or wire `median_survival_label` instead.)

### `median_survival_label` (string)

```fhirpath
iif(%score = 0,        'Not reached',
iif(%score <= 2,       '14.2 years',
iif(%score <= 4,       '4.0 years',
                       '1.5 years')))
```

## Worked example — test case 1 (Mrs. Hilde Janssens)

Inputs: all five booleans `false`.

| variable | value |
|---|---|
| `%age` | 0 |
| `%cs` | 0 |
| `%hgb` | 0 |
| `%wbc` | 0 |
| `%blasts` | 0 |

`%score = 0 + 0 + 2*0 + 0 + 0 = 0` → `risk_group = 'Low'` → `median_survival_years = {}` → `median_survival_label = 'Not reached'`. Matches expected outcome (score 0, Low, "Not reached").

Quick check on test case 4 (all five `true`): `1 + 1 + 2*1 + 1 + 1 = 6` → `'High'`, 1.5 y. Pass.

## Notes

- All five linkIds match SPEC field keys verbatim; do not rename.
- DIPSS is integer-valued; no rounding step is required. Keep the result as `valueInteger`.
- For the **DIPSS-Plus** extension (SPEC §5), add four further items (`dipss_score` as 0–3 int, `platelets_lt_100`, `transfusion_dependent`, `unfavorable_karyotype`) and replace the score expression with `%dipss_score + %karyo + %plt + %tx`. Risk band uses the same `iif` ladder shape against the {0, 1, 2-3, 4-6} cut-points.
- Because every input is a clinician-asserted boolean, the upstream form must require explicit answers — DO NOT use `coalesce`/`first().exists()` style fallbacks that silently treat absence as `false`.
