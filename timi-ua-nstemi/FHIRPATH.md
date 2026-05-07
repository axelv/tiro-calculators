# TIMI Risk Score for UA / NSTEMI — FHIRPath expressions

Encodes Antman et al. 2000 TIMI Risk Score for Unstable Angina / NSTEMI as
FHIRPath expressions for an SDC `Questionnaire` with calculated outputs
surfaced via
`http://hl7.org/fhir/StructureDefinition/sdc-questionnaire-calculatedExpression`
and `http://hl7.org/fhir/StructureDefinition/variable`.

All coefficients are fully specified in the source publication; **no TBDs**.

## Item linkIds (QuestionnaireResponse contract)

linkIds match the `field key` column from `SPEC.md` § 2 verbatim.

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_ge_65` | boolean | yes | Age ≥ 65 years | Pre-derived flag. Alternatively a numeric `age` linkId with `>= 65` in a variable. |
| `cad_risk_factors_ge_3` | boolean | yes | ≥ 3 CAD risk factors | True if at least 3 of {HTN, hypercholesterolaemia, DM, family hx premature CAD, current smoking}. |
| `known_cad_stenosis_ge_50` | boolean | yes | Known CAD with stenosis ≥ 50 % | Requires angiographic documentation. |
| `asa_use_past_7d` | boolean | yes | Aspirin use in past 7 days | Any dose. |
| `severe_angina_ge_2_in_24h` | boolean | yes | ≥ 2 anginal episodes in 24 h | |
| `st_deviation_ge_0_5mm` | boolean | yes | ST-segment deviation ≥ 0.5 mm | Horizontal/downsloping depression OR transient elevation; persistent ST-elevation excludes (that is STEMI). |
| `cardiac_marker_positive` | boolean | yes | Elevated cardiac biomarker | hs-cTn / cTnI / cTnT / CK-MB above local 99th-percentile / ULN. |

SPEC mandates that missing values must **not** be silently coerced to false —
surface a validation error instead. Encode that as `required=true` on every
item plus an `enableWhen`/skip-logic-free design (no item is conditionally
hidden), so the answer must be supplied.

## Variables

| name | expression |
|---|---|
| `ageGe65` | `%resource.item.where(linkId='age_ge_65').answer.value` |
| `cadRf3` | `%resource.item.where(linkId='cad_risk_factors_ge_3').answer.value` |
| `knownCad` | `%resource.item.where(linkId='known_cad_stenosis_ge_50').answer.value` |
| `asa7d` | `%resource.item.where(linkId='asa_use_past_7d').answer.value` |
| `angina2` | `%resource.item.where(linkId='severe_angina_ge_2_in_24h').answer.value` |
| `stDev` | `%resource.item.where(linkId='st_deviation_ge_0_5mm').answer.value` |
| `marker` | `%resource.item.where(linkId='cardiac_marker_positive').answer.value` |

## Calculated expressions

### `score` (primary output, integer 0–7)

Each criterion is an unweighted +1; explicit `iif` per input:

```fhirpath
  iif(%ageGe65, 1, 0)
+ iif(%cadRf3, 1, 0)
+ iif(%knownCad, 1, 0)
+ iif(%asa7d, 1, 0)
+ iif(%angina2, 1, 0)
+ iif(%stDev, 1, 0)
+ iif(%marker, 1, 0)
```

Inline form (no variables):

```fhirpath
  iif(%resource.item.where(linkId='age_ge_65').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='cad_risk_factors_ge_3').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='known_cad_stenosis_ge_50').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='asa_use_past_7d').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='severe_angina_ge_2_in_24h').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='st_deviation_ge_0_5mm').answer.value, 1, 0)
+ iif(%resource.item.where(linkId='cardiac_marker_positive').answer.value, 1, 0)
```

### Secondary outputs

#### `composite_14d_risk_percent` (decimal, lookup by score)

```fhirpath
iif(%score <= 1, 4.7,
iif(%score = 2, 8.3,
iif(%score = 3, 13.2,
iif(%score = 4, 19.9,
iif(%score = 5, 26.2,
40.9)))))
```

(Scores 0 and 1 share 4.7 %; scores 6 and 7 share 40.9 %.)

#### `risk_band` (string, low/intermediate/high)

```fhirpath
iif(%score <= 2, 'low',
iif(%score <= 4, 'intermediate',
'high'))
```

#### `endpoint` (constant string for the output schema)

```fhirpath
'All-cause mortality, new/recurrent MI, or severe recurrent ischaemia requiring urgent revascularisation through 14 days'
```

## Worked example — test case 4 (Robert Kavanagh)

Inputs from `TEST_CASES.md`:

| linkId | answer |
|---|---|
| `age_ge_65` | true (74) |
| `cad_risk_factors_ge_3` | true (HTN + chol + DM + smoking → 4) |
| `known_cad_stenosis_ge_50` | true (70 % LAD on prior angiogram) |
| `asa_use_past_7d` | true |
| `severe_angina_ge_2_in_24h` | true (4 episodes) |
| `st_deviation_ge_0_5mm` | true (1.5 mm) |
| `cardiac_marker_positive` | false |

Per-input `iif` evaluation:

| variable | iif | value |
|---|---|---|
| `ageGe65` | `iif(true, 1, 0)` | `1` |
| `cadRf3` | `iif(true, 1, 0)` | `1` |
| `knownCad` | `iif(true, 1, 0)` | `1` |
| `asa7d` | `iif(true, 1, 0)` | `1` |
| `angina2` | `iif(true, 1, 0)` | `1` |
| `stDev` | `iif(true, 1, 0)` | `1` |
| `marker` | `iif(false, 1, 0)` | `0` |
| `score` | sum | `6` |
| `composite_14d_risk_percent` | `iif(6 <= 1, …, …, 40.9)` | `40.9` |
| `risk_band` | `iif(6 <= 2, …, iif(6 <= 4, …, 'high'))` | `'high'` |

Matches expected output (score 6, 40.9 %, high risk).

## Worked example — test case 2 (Imani Okafor)

Two true booleans (`asa_use_past_7d`, `severe_angina_ge_2_in_24h`); five false.

- `score = 0 + 0 + 0 + 1 + 1 + 0 + 0 = 2`
- `composite_14d_risk_percent`: `iif(2 <= 1, 4.7, iif(2 = 2, 8.3, …)) = 8.3`
- `risk_band`: `iif(2 <= 2, 'low', …) = 'low'`

Matches expected output (score 2, 8.3 %, low risk).

## Notes

- **No TBD coefficients.** All seven +1 weights, the six-row 14-day rate
  lookup, and the three-band classification are fixed in Antman 2000.
- **Compaction option.** Because every input is +1, the score can be expressed
  more tersely as `%inputs.where($this).count()` if all seven booleans are
  collected into one repeating answer; with one item per criterion, the
  per-input `iif` form above is clearer for an implementer to audit and
  matches the user's explicit-point-sum convention.
- **Buckets in the lookup.** Scores 0 and 1 share 4.7 %; scores 6 and 7
  share 40.9 %. Encoded with `<= 1` (low end) and the fall-through `40.9`
  (high end). Range is bounded [0, 7] by the score expression itself; no
  out-of-range branch is needed.
- **Risk-band ladder.** Three bands per SPEC § 4.3:
  - Low: 0–2
  - Intermediate: 3–4
  - High: 5–7
- **Strict missing-input handling.** Per SPEC § 2 implementation note, do
  not coerce missing booleans to false. Enforce via `required=true` on each
  item; do not provide a `defaultValue` extension.
- **`age` input form.** SPEC defines this criterion as `age_ge_65` (boolean).
  If you collect numeric `age` instead, replace `%ageGe65` with
  `(%resource.item.where(linkId='age').answer.value >= 65)` — the rest of
  the score expression is unchanged.
- **No CQL needed.** Pure FHIRPath suffices: a flat sum of seven 0/1
  contributions plus two small lookup ladders.
