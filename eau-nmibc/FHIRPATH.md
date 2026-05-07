# EAU NMIBC Risk Calculator — FHIRPath expressions

Encoding of the EAU 2021 NMIBC risk-group classifier (Sylvester et al., *Eur Urol* 2021) for SDC. The model is a deterministic decision tree, not a numeric score, so the FHIRPath uses nested `iif` ladders that mirror the pseudocode in SPEC §3.3.

The form must gate "Calculate" until all required answers are present (see SPEC §2 — Form gating rules). Conditional grade inputs use `enableWhen` against the `classification` answer.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | choice | true | §2 — `age` | Codes: `le_70`, `gt_70` |
| `tumor_status` | choice | true | §2 — `tumor_status` | Codes: `primary`, `recurrent` |
| `number_of_tumors` | choice | true | §2 — `number_of_tumors` | Codes: `single`, `multiple` |
| `max_diameter` | choice | true | §2 — `max_diameter` | Codes: `lt_3cm`, `ge_3cm` |
| `stage` | choice | true | §2 — `stage` | Codes: `Ta`, `T1` |
| `cis` | boolean | true | §2 — `cis` | true = concomitant CIS |
| `classification` | choice | true | §2 — `classification` | Codes: `who_2004`, `who_1973`, `both` |
| `grade_who_2004` | choice | conditional | §2 — required when `classification` ∈ {`who_2004`,`both`} | Codes: `LG`, `HG` (LG includes LMP) |
| `grade_who_1973` | choice | conditional | §2 — required when `classification` ∈ {`who_1973`,`both`} | Codes: `G1`, `G2`, `G3` |

Use `enableWhen`/`enableBehavior=any` to enable each grade item against the matching `classification` codes, AND set `required=true` while enabled (FHIR SDC supports `enableWhen` + `required`).

## Variables

Bind on the `Questionnaire` (each resolves the underlying answer once for reuse):

| name | expression |
|---|---|
| `ageGt70` | `%resource.item.where(linkId='age').answer.valueCoding.code = 'gt_70'` |
| `multiple` | `%resource.item.where(linkId='number_of_tumors').answer.valueCoding.code = 'multiple'` |
| `dia3` | `%resource.item.where(linkId='max_diameter').answer.valueCoding.code = 'ge_3cm'` |
| `recurrent` | `%resource.item.where(linkId='tumor_status').answer.valueCoding.code = 'recurrent'` |
| `stage` | `%resource.item.where(linkId='stage').answer.valueCoding.code` |
| `cis` | `%resource.item.where(linkId='cis').answer.valueBoolean = true` |
| `classif` | `%resource.item.where(linkId='classification').answer.valueCoding.code` |
| `g2004` | `%resource.item.where(linkId='grade_who_2004').answer.valueCoding.code` |
| `g1973` | `%resource.item.where(linkId='grade_who_1973').answer.valueCoding.code` |
| `arf` | `iif(%ageGt70,1,0) + iif(%multiple,1,0) + iif(%dia3,1,0) + iif(%recurrent,1,0)` |

`%arf` is an integer in [0, 4].

## Calculated expressions

### `risk_who_2004` (string — Low / Intermediate / High / Very High)

Mirrors `eau_risk_who_2004` in SPEC §3.3 — order matters (Very High first, then High, then Low, then High via ARFs ≥ 3, otherwise Intermediate).

```fhirpath
iif(%stage = 'T1' and %g2004 = 'HG' and %cis            and %arf >= 1, 'Very High',
iif(%stage = 'T1' and %g2004 = 'HG' and %cis.not()      and %arf  = 4, 'Very High',
iif(%stage = 'T1' and %g2004 = 'HG' and %cis.not(),                    'High',
iif(%cis,                                                              'High',
iif(%stage = 'Ta' and %g2004 = 'LG' and %cis.not()      and %arf  = 0, 'Low',
iif(%cis.not() and %arf >= 3,                                          'High',
                                                                       'Intermediate'))))))
```

### `risk_who_1973` (string)

Mirrors `eau_risk_who_1973`. Note rule asymmetry for T1 G2 (any ARF ≥ 1 is High) and T1 G3 + ≥3 ARFs without CIS being Very High.

```fhirpath
iif(%stage = 'T1' and %g1973 = 'G3' and %cis            and %arf >= 1, 'Very High',
iif(%stage = 'T1' and %g1973 = 'G3' and %cis.not()      and %arf >= 3, 'Very High',
iif(%cis,                                                              'High',
iif(%stage = 'T1' and %g1973 = 'G3',                                   'High',
iif(%stage = 'T1' and %g1973 = 'G2',
       iif(%arf = 0, 'Intermediate', 'High'),
iif(%stage = 'Ta' and %g1973 = 'G1' and %arf = 0,                      'Low',
iif(%arf >= 3,                                                         'High',
                                                                       'Intermediate')))))))
```

### Progression-risk lookup (per system)

Encode the SPEC §4.1 / §4.2 tables as four `iif` ladders, one per (system, time-point). Example for WHO 2004/2016 1-year:

```fhirpath
iif(%risk_who_2004 = 'Low',          0.06,
iif(%risk_who_2004 = 'Intermediate', 1.0,
iif(%risk_who_2004 = 'High',         3.5,
                                     16.0)))    // Very High
```

Repeat with values from SPEC §4.1:

| output | Low | Intermediate | High | Very High |
|---|---:|---:|---:|---:|
| `progression_1yr_2004` (%) | 0.06 | 1.0 | 3.5 | 16 |
| `progression_5yr_2004` (%) | 0.93 | 4.9 | 9.6 | 40 |
| `progression_10yr_2004` (%) | 3.7 | 8.5 | 14 | 53 |

And SPEC §4.2 for WHO 1973:

| output | Low | Intermediate | High | Very High |
|---|---:|---:|---:|---:|
| `progression_1yr_1973` (%) | 0.12 | 0.65 | 3.8 | 20 |
| `progression_5yr_1973` (%) | 0.57 | 3.6 | 11 | 44 |
| `progression_10yr_1973` (%) | 3.0 | 7.4 | 14 | 59 |

### `treatment_recommendation` (string)

```fhirpath
iif(%risk = 'Low',          'Single immediate post-TURBT intravesical chemotherapy instillation; no further adjuvant therapy.',
iif(%risk = 'Intermediate', 'Intravesical chemotherapy OR 1-year full-dose BCG induction + maintenance at 3, 6, 12 months.',
iif(%risk = 'High',         'Full-dose BCG for 1-3 years (maintenance at 3, 6, 12, 18, 24, 30, 36 months); discuss radical cystectomy.',
                            'Radical cystectomy preferred; full-dose BCG 1-3 years if cystectomy declined or unfit.')))
```

`%risk` here is `%risk_who_2004` or `%risk_who_1973` — wire one calculatedExpression per system.

### Both-systems disagreement banner

```fhirpath
%classif = 'both' and %risk_who_2004 != %risk_who_1973
```

When true, render a warning ("Risk classes disagree — consider the higher of the two").

## Worked example — test case 1 (Mr. Stefan Bauer)

Inputs: `age = le_70`, `primary`, `single`, `<3cm`, `Ta`, `cis = false`, `classification = who_2004`, `grade_who_2004 = LG`.

- `%ageGt70 = false`, `%multiple = false`, `%dia3 = false`, `%recurrent = false` → `%arf = 0`.
- `%stage = 'Ta'`, `%g2004 = 'LG'`, `%cis = false`.
- Ladder evaluation:
  - branches 1–2 fail (not T1+HG)
  - branch 3 fails (not T1+HG)
  - branch 4 fails (no CIS)
  - **branch 5 matches**: `Ta and LG and not cis and arf = 0` → `'Low'` ✓
- `progression_1yr_2004 = 0.06`, `_5yr = 0.93`, `_10yr = 3.7`.
- Treatment: low-risk string. Matches expected outcome.

Quick check on test case 4 (Hervé Dubois): inputs gave `arf = 3`, `T1`, `HG`, `cis = true` → branch 1 matches (`T1 and HG and cis and arf >= 1`) → `'Very High'`. ✓

Test case 5 (WHO 1973 path, Augusto Silvestri): `arf = 4`, `T1`, `G3`, `cis = false` → branch 1 fails (no CIS), **branch 2 matches** (`T1 and G3 and not cis and arf >= 3`) → `'Very High'`. ✓

## Notes

- `cis` is a boolean. If you encode it as a `choice` with `Yes`/`No`, swap `%cis` for `... .valueCoding.code = 'Yes'`.
- The two ladders are intentionally written in matching order to the SPEC pseudocode so reviewers can diff them line-for-line.
- FHIRPath has no `switch`; `iif` chains are the cleanest representation. CQL would be more readable here (`case ... when ... else end`) but is not required — the current logic is short enough.
- For `classification = both`, instantiate **both** ladders and emit two output blocks. The disagreement check is a separate boolean expression.
- All percentages are rendered as numbers, not strings — the renderer should append `%` itself.
