# Subtle Anterior STEMI (4-variable Driver/Smith) — FHIRPath expressions

> Coefficient flag: SPEC §3 marks the coefficients (0.052, 0.151, 0.268, 1.062) and cut-point 18.2 as published-but-server-side in MDCalc and recommends cross-checking with Driver et al. 2017. The expressions below assume those values are accepted; treat as **TBD pending primary-source verification**.

## Item linkIds (QuestionnaireResponse contract)

Pre-condition gate (compute only when ECG meets entry criteria and no exclusions):

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `ste_v2_v4_ge_1mm` | boolean | yes | Pre-condition: ≥ 1 mm STE in ≥ 1 of V2–V4 | Must be true to compute. |
| `excl_ste_gt_5mm` | boolean | yes | Exclusion: STE > 5 mm in any precordial lead | Any exclusion → bypass formula → STEMI directly. |
| `excl_non_concave_st` | boolean | yes | Exclusion: convex / straight / tombstone ST morphology | |
| `excl_inferior_recip_depression` | boolean | yes | Exclusion: inferior reciprocal ST depression | |
| `excl_anterior_st_depression` | boolean | yes | Exclusion: anterior ST depression | |
| `excl_terminal_qrs_distortion_v2v3` | boolean | yes | Exclusion: terminal QRS distortion in V2 or V3 | |
| `excl_q_waves_v2_v4` | boolean | yes | Exclusion: pathologic Q waves V2–V4 | |
| `excl_t_inversion_v2_v6` | boolean | yes | Exclusion: T-wave inversion V2–V6 | |

Numeric inputs:

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `qtc` | decimal | yes | `QTc` (Bazett-corrected QT, ms) | 300–600 ms expected. |
| `qrs_v2` | decimal | yes | `QRSV2` (peak-to-trough QRS amplitude in V2, mm) | 1–40 mm expected. |
| `r_v4` | decimal | yes | `RV4` (R-wave amplitude in V4, mm) | 0–30 mm expected. |
| `ste60_v3` | decimal | yes | `STE60V3` (ST elevation 60 ms after J-point in V3, mm) | 0–5 mm; > 5 mm is an exclusion. |

## Variables

| name | expression |
|---|---|
| `qtc` | `%resource.item.where(linkId='qtc').answer.value` |
| `qrsV2` | `%resource.item.where(linkId='qrs_v2').answer.value` |
| `rV4` | `%resource.item.where(linkId='r_v4').answer.value` |
| `ste60V3` | `%resource.item.where(linkId='ste60_v3').answer.value` |
| `entryMet` | `%resource.item.where(linkId='ste_v2_v4_ge_1mm').answer.value = true` |
| `anyExclusion` | `(%resource.item.where(linkId='excl_ste_gt_5mm').answer.value = true) or (%resource.item.where(linkId='excl_non_concave_st').answer.value = true) or (%resource.item.where(linkId='excl_inferior_recip_depression').answer.value = true) or (%resource.item.where(linkId='excl_anterior_st_depression').answer.value = true) or (%resource.item.where(linkId='excl_terminal_qrs_distortion_v2v3').answer.value = true) or (%resource.item.where(linkId='excl_q_waves_v2_v4').answer.value = true) or (%resource.item.where(linkId='excl_t_inversion_v2_v6').answer.value = true)` |
| `preconditionsMet` | `%entryMet and (%anyExclusion = false)` |
| `linearPredictor` | `0.052 * %qtc - 0.151 * %qrsV2 - 0.268 * %rV4 + 1.062 * %ste60V3` |

## Calculated expressions

### `score` (primary output — Driver/Smith 4-variable value)

```fhirpath
%linearPredictor
```

Inline form:

```fhirpath
0.052 * %resource.item.where(linkId='qtc').answer.value
- 0.151 * %resource.item.where(linkId='qrs_v2').answer.value
- 0.268 * %resource.item.where(linkId='r_v4').answer.value
+ 1.062 * %resource.item.where(linkId='ste60_v3').answer.value
```

Round to 2 decimal places for display (engine-dependent — most engines accept `.round(2)` from FHIRPath math extensions; otherwise format in the renderer).

### `smith_positive` (decision flag)

```fhirpath
%score >= 18.2
```

### `interpretation`

```fhirpath
iif(%preconditionsMet = false,
    'Pre-conditions not met — do not apply formula. If any exclusion is present, treat as STEMI directly.',
    iif(%score >= 18.2,
        'Smith-positive — likely subtle anterior STEMI / LAD occlusion. Activate cath lab in appropriate clinical context.',
        'Smith-negative — favors benign early repolarization. Does not rule out LAD occlusion; consider serial ECGs and troponin.'))
```

### Optional band label (clinical pattern)

```fhirpath
iif(%score < 17, 'Classic BER pattern',
  iif(%score < 19, 'Borderline (17–19 grey zone) — repeat ECG, troponin, POCUS',
    'Subtle LAD occlusion pattern'))
```

## Worked example — test case 2 (Sandra Voss, borderline)

Inputs: `qtc = 410`, `qrs_v2 = 12`, `r_v4 = 10`, `ste60_v3 = 2`.

1. `0.052 * 410 = 21.320`
2. `0.151 * 12 = 1.812` (subtracted)
3. `0.268 * 10 = 2.680` (subtracted)
4. `1.062 * 2 = 2.124`
5. `score = 21.320 - 1.812 - 2.680 + 2.124 = 18.952` → **18.95**
6. `smith_positive = 18.95 >= 18.2` → **true** (just over threshold).

Matches TEST_CASES.md test case 2.

Spot-check test case 1 (Marcus Delacroix, BER):
- `0.052*380 - 0.151*22 - 0.268*18 + 1.062*1.5 = 19.760 - 3.322 - 4.824 + 1.593 = 13.207` → 13.21, smith_positive = false.

## Notes

- Pure linear arithmetic — FHIRPath alone is sufficient. No `exp()` or other math beyond `+ - * /` is required.
- Make sure all four numeric inputs are `decimal`; an integer `qtc` would still work (no division), but `r_v4 = 10` as integer plus `0.268` as decimal will coerce correctly in compliant engines.
- The pre-condition / exclusion gating is essential: do not surface a `smith_positive` flag when an exclusion is present — the formula is undefined there. The `interpretation` expression handles this with a single nested `iif`.
- Coefficient verification: implementers should confirm `0.052 / 0.151 / 0.268 / 1.062` and threshold `18.2` against the Driver 2017 primary publication before clinical deployment (SPEC §3 explicitly flags this).
- The formula is **not validated** for `STE60V3 > 5 mm` (also an exclusion criterion) — the gating above handles that via `excl_ste_gt_5mm`.
