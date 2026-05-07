# MAGGIC Risk Calculator for Heart Failure — FHIRPath expressions

> **STATUS.** SPEC §3.1 – §3.8 (the 13-input integer point assignment) is **fully resolved** and encoded as `iif` chains below. The integer `score` calculated expression is therefore complete and shippable today. **SPEC §3.9 (score → 1-year and 3-year mortality lookup) is NOT resolved**: only the two anchor values (score 0 → 1.5 % / 3.9 %; score 50 → 84.2 % / 98.5 %) are in the SPEC. The per-integer mortality values for scores 1–49 must be transcribed from **Pocock 2013 *Eur Heart J* 34:1404–1413, Appendix S1**. The mortality `iif` ladders below are written as full skeletons with a `<TBD_m1y_NN>` / `<TBD_m3y_NN>` placeholder at every score 1–49; the implementer pastes 49 integer values from Appendix S1 (or queries `heartfailurerisk.org` once and caches). **Do not curve-fit the two anchors** — SPEC §3.9 explicitly warns that the mapping is non-linear.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2 #1 | years; ≥18 |
| `sex` | choice | true | §2 #2 | `male` / `female` |
| `bmi` | decimal | true | §2 #3 | kg/m² |
| `systolic_bp` | integer | true | §2 #4 | mmHg |
| `ejection_fraction` | integer | true | §2 #5 | % |
| `nyha_class` | choice | true | §2 #6 | `I`/`II`/`III`/`IV` |
| `creatinine` | decimal | true | §2 #7 | **µmol/L canonical** (SPEC: convert mg/dL → µmol/L by × 88.4 *before* lookup) |
| `current_smoker` | boolean | true | §2 #8 | |
| `diabetes` | boolean | true | §2 #9 | any type |
| `copd` | boolean | true | §2 #10 | |
| `hf_diagnosed_gt_18mo` | boolean | true | §2 #11 | true if HF diagnosis duration > 18 months |
| `beta_blocker` | boolean | true | §2 #12 | currently on β-blocker |
| `acei_arb` | boolean | true | §2 #13 | currently on ACEi or ARB (or ARNI in modern practice) |

> If clinicians enter creatinine in mg/dL, either (a) provide a separate `creatinine_mg_dl` linkId and convert internally with `× 88.4`, or (b) attach a UCUM unit and require µmol/L.

---

## Variables

| name | expression |
|---|---|
| `%age` | `%resource.item.where(linkId='age').answer.value` |
| `%male` | `%resource.item.where(linkId='sex').answer.value.code = 'male'` |
| `%bmi` | `%resource.item.where(linkId='bmi').answer.value` |
| `%sbp` | `%resource.item.where(linkId='systolic_bp').answer.value` |
| `%ef` | `%resource.item.where(linkId='ejection_fraction').answer.value` |
| `%efBand` | `iif(%ef < 30, 'lt30', iif(%ef < 40, '30to39', 'gte40'))` |
| `%nyha` | `%resource.item.where(linkId='nyha_class').answer.value.code` |
| `%creat` | `%resource.item.where(linkId='creatinine').answer.value` |
| `%smoker` | `%resource.item.where(linkId='current_smoker').answer.value` |
| `%dm` | `%resource.item.where(linkId='diabetes').answer.value` |
| `%copd` | `%resource.item.where(linkId='copd').answer.value` |
| `%hfChronic` | `%resource.item.where(linkId='hf_diagnosed_gt_18mo').answer.value` |
| `%bb` | `%resource.item.where(linkId='beta_blocker').answer.value` |
| `%aceiArb` | `%resource.item.where(linkId='acei_arb').answer.value` |

---

## Calculated expressions — point components

### EF base points (SPEC §3.1)

```fhirpath
iif(%ef < 20, 7,
  iif(%ef < 25, 6,
    iif(%ef < 30, 5,
      iif(%ef < 35, 3,
        iif(%ef < 40, 2,
          0)))))
```

Bind: `%efPoints`.

### Age points stratified by EF band (SPEC §3.2)

```fhirpath
iif(%age < 55, 0,
  iif(%age < 60,
      iif(%efBand = 'lt30', 1, iif(%efBand = '30to39', 2, 3)),
  iif(%age < 65,
      iif(%efBand = 'lt30', 2, iif(%efBand = '30to39', 4, 5)),
  iif(%age < 70,
      iif(%efBand = 'lt30', 4, iif(%efBand = '30to39', 6, 7)),
  iif(%age < 75,
      iif(%efBand = 'lt30', 6, iif(%efBand = '30to39', 8, 9)),
  iif(%age < 80,
      iif(%efBand = 'lt30', 8, iif(%efBand = '30to39', 10, 12)),
      iif(%efBand = 'lt30', 10, iif(%efBand = '30to39', 13, 15))))))))
```

Bind: `%agePoints`.

### SBP points stratified by EF band (SPEC §3.3)

```fhirpath
iif(%sbp < 110,
    iif(%efBand = 'lt30', 5, iif(%efBand = '30to39', 3, 2)),
iif(%sbp < 120,
    iif(%efBand = 'lt30', 4, iif(%efBand = '30to39', 2, 1)),
iif(%sbp < 130,
    iif(%efBand = 'lt30', 3, iif(%efBand = '30to39', 1, 1)),
iif(%sbp < 140,
    iif(%efBand = 'lt30', 2, iif(%efBand = '30to39', 1, 0)),
iif(%sbp < 150,
    iif(%efBand = 'lt30', 1, iif(%efBand = '30to39', 0, 0)),
    0)))))
```

Bind: `%sbpPoints`.

### BMI points (SPEC §3.4)

```fhirpath
iif(%bmi < 15, 6,
  iif(%bmi < 20, 5,
    iif(%bmi < 25, 3,
      iif(%bmi < 30, 2,
        0))))
```

Bind: `%bmiPoints`.

### Creatinine points (SPEC §3.5; µmol/L)

```fhirpath
iif(%creat < 90, 0,
  iif(%creat < 110, 1,
    iif(%creat < 130, 2,
      iif(%creat < 150, 3,
        iif(%creat < 170, 4,
          iif(%creat < 210, 5,
            iif(%creat < 250, 6,
              8)))))))
```

Bind: `%creatPoints`.

### NYHA class points (SPEC §3.6)

```fhirpath
iif(%nyha = 'I', 0,
  iif(%nyha = 'II', 2,
    iif(%nyha = 'III', 6,
      8)))
```

Bind: `%nyhaPoints`.

### Binary / categorical predictors (SPEC §3.7)

```fhirpath
  iif(%male,      1, 0)
+ iif(%smoker,    1, 0)
+ iif(%dm,        3, 0)
+ iif(%copd,      2, 0)
+ iif(%hfChronic, 2, 0)
+ iif(%bb,        0, 3)         // points when OFF β-blocker
+ iif(%aceiArb,   0, 1)         // points when OFF ACEi/ARB
```

Bind: `%binaryPoints`.

### Total score (SPEC §3.8)

```fhirpath
%efPoints + %agePoints + %sbpPoints + %bmiPoints + %creatPoints + %nyhaPoints + %binaryPoints
```

| linkId | type | calculatedExpression |
|---|---|---|
| `total_points` | integer | expression above |

Per `TEST_CASES.md` test case 5, scores can exceed the SPEC's nominal 0–50 ceiling (e.g. 56). The mortality lookup (below) clamps at 50.

### Score-clamped lookup index

```fhirpath
iif(%totalPoints > 50, 50, iif(%totalPoints < 0, 0, %totalPoints))
```

Bind: `%scoreIdx`.

---

## Calculated expressions — score → mortality lookup (SPEC §3.9; TBD per integer)

Both ladders are written as nested `iif`. Score 0 and score 50 are filled in from the SPEC anchors; scores 1–49 are `<TBD_…>` placeholders that the implementer must replace verbatim from **Pocock 2013 Appendix S1** (or the cached output of <http://www.heartfailurerisk.org/>). The values are reported as percent (0–100), matching SPEC §4 output unit.

### `mortality_1yr` ladder (SPEC §3.9; percent 0–100)

```fhirpath
iif(%scoreIdx = 0,  1.5,
iif(%scoreIdx = 1,  <TBD_m1y_01>,
iif(%scoreIdx = 2,  <TBD_m1y_02>,
iif(%scoreIdx = 3,  <TBD_m1y_03>,
iif(%scoreIdx = 4,  <TBD_m1y_04>,
iif(%scoreIdx = 5,  <TBD_m1y_05>,        // TEST_CASES.md indicative ≈ 3.8 — verify against Appendix S1
iif(%scoreIdx = 6,  <TBD_m1y_06>,
iif(%scoreIdx = 7,  <TBD_m1y_07>,
iif(%scoreIdx = 8,  <TBD_m1y_08>,
iif(%scoreIdx = 9,  <TBD_m1y_09>,
iif(%scoreIdx = 10, <TBD_m1y_10>,        // indicative ≈ 6.5
iif(%scoreIdx = 11, <TBD_m1y_11>,
iif(%scoreIdx = 12, <TBD_m1y_12>,
iif(%scoreIdx = 13, <TBD_m1y_13>,        // test case 1 expected ≈ 8.5
iif(%scoreIdx = 14, <TBD_m1y_14>,
iif(%scoreIdx = 15, <TBD_m1y_15>,        // indicative ≈ 10.6
iif(%scoreIdx = 16, <TBD_m1y_16>,
iif(%scoreIdx = 17, <TBD_m1y_17>,
iif(%scoreIdx = 18, <TBD_m1y_18>,
iif(%scoreIdx = 19, <TBD_m1y_19>,
iif(%scoreIdx = 20, <TBD_m1y_20>,        // test case 2 expected ≈ 16.5; indicative ≈ 16.5
iif(%scoreIdx = 21, <TBD_m1y_21>,
iif(%scoreIdx = 22, <TBD_m1y_22>,
iif(%scoreIdx = 23, <TBD_m1y_23>,
iif(%scoreIdx = 24, <TBD_m1y_24>,
iif(%scoreIdx = 25, <TBD_m1y_25>,        // indicative ≈ 24.6
iif(%scoreIdx = 26, <TBD_m1y_26>,
iif(%scoreIdx = 27, <TBD_m1y_27>,        // test case 3 expected ≈ 29
iif(%scoreIdx = 28, <TBD_m1y_28>,
iif(%scoreIdx = 29, <TBD_m1y_29>,
iif(%scoreIdx = 30, <TBD_m1y_30>,        // indicative ≈ 34.7
iif(%scoreIdx = 31, <TBD_m1y_31>,
iif(%scoreIdx = 32, <TBD_m1y_32>,
iif(%scoreIdx = 33, <TBD_m1y_33>,
iif(%scoreIdx = 34, <TBD_m1y_34>,
iif(%scoreIdx = 35, <TBD_m1y_35>,        // indicative ≈ 46
iif(%scoreIdx = 36, <TBD_m1y_36>,
iif(%scoreIdx = 37, <TBD_m1y_37>,
iif(%scoreIdx = 38, <TBD_m1y_38>,
iif(%scoreIdx = 39, <TBD_m1y_39>,
iif(%scoreIdx = 40, <TBD_m1y_40>,        // indicative ≈ 58
iif(%scoreIdx = 41, <TBD_m1y_41>,
iif(%scoreIdx = 42, <TBD_m1y_42>,
iif(%scoreIdx = 43, <TBD_m1y_43>,
iif(%scoreIdx = 44, <TBD_m1y_44>,
iif(%scoreIdx = 45, <TBD_m1y_45>,
iif(%scoreIdx = 46, <TBD_m1y_46>,
iif(%scoreIdx = 47, <TBD_m1y_47>,        // test case 4 expected ≈ 77
iif(%scoreIdx = 48, <TBD_m1y_48>,
iif(%scoreIdx = 49, <TBD_m1y_49>,
    84.2))))))))))))))))))))))))))))))))))))))))))))))))))
```

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `mortality_1yr` | decimal | % (0–100) | ladder above |

### `mortality_3yr` ladder (SPEC §3.9; percent 0–100)

Same structure, with anchors 0 → 3.9 and 50 → 98.5:

```fhirpath
iif(%scoreIdx = 0,  3.9,
iif(%scoreIdx = 1,  <TBD_m3y_01>,
iif(%scoreIdx = 2,  <TBD_m3y_02>,
iif(%scoreIdx = 3,  <TBD_m3y_03>,
iif(%scoreIdx = 4,  <TBD_m3y_04>,
iif(%scoreIdx = 5,  <TBD_m3y_05>,        // indicative ≈ 9.3
iif(%scoreIdx = 6,  <TBD_m3y_06>,
iif(%scoreIdx = 7,  <TBD_m3y_07>,
iif(%scoreIdx = 8,  <TBD_m3y_08>,
iif(%scoreIdx = 9,  <TBD_m3y_09>,
iif(%scoreIdx = 10, <TBD_m3y_10>,        // indicative ≈ 15.6
iif(%scoreIdx = 11, <TBD_m3y_11>,
iif(%scoreIdx = 12, <TBD_m3y_12>,
iif(%scoreIdx = 13, <TBD_m3y_13>,        // test case 1 expected ≈ 20
iif(%scoreIdx = 14, <TBD_m3y_14>,
iif(%scoreIdx = 15, <TBD_m3y_15>,        // indicative ≈ 24.7
iif(%scoreIdx = 16, <TBD_m3y_16>,
iif(%scoreIdx = 17, <TBD_m3y_17>,
iif(%scoreIdx = 18, <TBD_m3y_18>,
iif(%scoreIdx = 19, <TBD_m3y_19>,
iif(%scoreIdx = 20, <TBD_m3y_20>,        // test case 2 expected ≈ 36.7; indicative ≈ 36.7
iif(%scoreIdx = 21, <TBD_m3y_21>,
iif(%scoreIdx = 22, <TBD_m3y_22>,
iif(%scoreIdx = 23, <TBD_m3y_23>,
iif(%scoreIdx = 24, <TBD_m3y_24>,
iif(%scoreIdx = 25, <TBD_m3y_25>,        // indicative ≈ 50.7
iif(%scoreIdx = 26, <TBD_m3y_26>,
iif(%scoreIdx = 27, <TBD_m3y_27>,        // test case 3 expected ≈ 57
iif(%scoreIdx = 28, <TBD_m3y_28>,
iif(%scoreIdx = 29, <TBD_m3y_29>,
iif(%scoreIdx = 30, <TBD_m3y_30>,        // indicative ≈ 64.3
iif(%scoreIdx = 31, <TBD_m3y_31>,
iif(%scoreIdx = 32, <TBD_m3y_32>,
iif(%scoreIdx = 33, <TBD_m3y_33>,
iif(%scoreIdx = 34, <TBD_m3y_34>,
iif(%scoreIdx = 35, <TBD_m3y_35>,        // indicative ≈ 76
iif(%scoreIdx = 36, <TBD_m3y_36>,
iif(%scoreIdx = 37, <TBD_m3y_37>,
iif(%scoreIdx = 38, <TBD_m3y_38>,
iif(%scoreIdx = 39, <TBD_m3y_39>,
iif(%scoreIdx = 40, <TBD_m3y_40>,        // indicative ≈ 85
iif(%scoreIdx = 41, <TBD_m3y_41>,
iif(%scoreIdx = 42, <TBD_m3y_42>,
iif(%scoreIdx = 43, <TBD_m3y_43>,
iif(%scoreIdx = 44, <TBD_m3y_44>,
iif(%scoreIdx = 45, <TBD_m3y_45>,
iif(%scoreIdx = 46, <TBD_m3y_46>,
iif(%scoreIdx = 47, <TBD_m3y_47>,        // test case 4 expected ≈ 96
iif(%scoreIdx = 48, <TBD_m3y_48>,
iif(%scoreIdx = 49, <TBD_m3y_49>,
    98.5))))))))))))))))))))))))))))))))))))))))))))))))))
```

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `mortality_3yr` | decimal | % (0–100) | ladder above |

> **Implementer's task**: replace each `<TBD_m1y_NN>` and `<TBD_m3y_NN>` with the integer-score row from Pocock 2013 Appendix S1. The "indicative" comments next to a few rows are the rough values quoted in `TEST_CASES.md` for sanity-checking once the table is loaded — they are **not** authoritative substitutes for the published values.

### Derived display fields

```fhirpath
%mortality1yr.iif(_ != null, 100 - %mortality1yr, null)   // pseudo-FHIRPath; in practice:
100 - %mortality1yr
```

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `survival_1yr` | decimal | % | `100 - %mortality1yr` |
| `survival_3yr` | decimal | % | `100 - %mortality3yr` |

### Risk band (SPEC §4 optional / Pocock 2013 risk-group bands)

The SPEC §3.9 resolution note quotes Pocock 2013 risk groups: 1–6 = scores 0–16, 17–20, 21–24, 25–28, 29–32, ≥33. Encode as a 6-band `iif`:

```fhirpath
iif(%scoreIdx <= 16, 'low',
  iif(%scoreIdx <= 20, 'low-intermediate',
    iif(%scoreIdx <= 24, 'intermediate',
      iif(%scoreIdx <= 28, 'intermediate-high',
        iif(%scoreIdx <= 32, 'high',
          'very-high')))))
```

| linkId | type | calculatedExpression |
|---|---|---|
| `risk_band` | string | expression above |

---

## Worked example — test case 1 (Mr. Arjun Bhatt)

Per `TEST_CASES.md` test case 1 — 48 y M, EF 28 % (band <30), NYHA II, on full GDMT.

| component | input → transform | value |
|---|---|---|
| `%efPoints` | EF 28 → range 25–29 | **5** |
| `%efBand` | EF 28 → `'lt30'` | — |
| `%agePoints` | age 48 → `<55` | **0** |
| `%sbpPoints` | SBP 124, EF<30 → 120–129 row | **3** |
| `%bmiPoints` | BMI 26.0 → range 25–29 | **2** |
| `%creatPoints` | creat 88 → `<90` | **0** |
| `%nyhaPoints` | NYHA II | **2** |
| `%binaryPoints` | male=1 (+1) + smoker=0 + dm=0 + copd=0 + hf>18mo=0 + bb=on (0) + acei/arb=on (0) | **1** |

`total_points = 5 + 0 + 3 + 2 + 0 + 2 + 1 = 13` ✓ (matches `TEST_CASES.md` test case 1 total of 13).

`%scoreIdx = 13` (no clamp needed). The 1-y and 3-y mortality lookups will return `<TBD_m1y_13>` and `<TBD_m3y_13>`. Per `TEST_CASES.md` indicative values, these should resolve to ≈ **8.5 %** and ≈ **20 %** respectively once Appendix S1 is transcribed. `risk_band` ladder: `13 ≤ 16` → **`'low'`**.

Test case 1's `total_points = 13` is exactly reproduced by the FHIRPath ladders above, demonstrating the score expression is fully wired. The mortality estimates remain blocked on the SPEC §3.9 lookup table.

---

## Notes

- **`iif` is fine for 50 branches**: a 50-arm nested `iif` is verbose but well within FHIRPath engine limits. If the runtime renders it slowly, consider lifting only the lookup into CQL (`define mortality1yr: case score when 0 then 1.5 when 1 then ... end`); the core 13-input score remains pure FHIRPath. **Default recommendation: stay in FHIRPath.**
- **No CQL needed for the score**: SPEC §3.1–3.8 is entirely point-additive with EF-stratified sub-tables, all expressible as `iif` chains. Do not escalate.
- **EF-band stratification**: the `%efBand` variable is the canonical pattern. The age and SBP point ladders both branch on `%efBand` *inside* their own `iif` cascade — the alternative (three separate variables `%agePointsLt30`, `%agePoints30to39`, `%agePointsGte40`, then a final `iif` on `%efBand`) is uglier. The version above keeps the table topology aligned with SPEC §3.2 / §3.3.
- **Inverted β-blocker / ACEi-ARB encoding**: SPEC §3.7 explicitly notes that **points are added when the patient is OFF therapy**. The `iif(%bb, 0, 3)` and `iif(%aceiArb, 0, 1)` encoding above respects this. Resist the urge to "fix" the apparent inversion.
- **Creatinine units**: the SPEC's lookup table is in µmol/L. If the form accepts mg/dL, **always convert to µmol/L (× 88.4) before lookup** — do not maintain a parallel mg/dL ladder, which would diverge slightly because the SPEC ranges are integer µmol/L boundaries (e.g. `90`, `110`, `130`) that translate to non-integer mg/dL values.
- **Score clamp at 50**: `TEST_CASES.md` test case 5 produces a raw total of 56; SPEC §3.9 says scores above 50 sit at the published ceiling. The `%scoreIdx` clamp handles this. Surface the raw total as `total_points` for transparency, and use `%scoreIdx` only for the lookup.
- **Source of the lookup**: SPEC §3.9 lists three viable sources for the 49 missing values: (a) digitise Pocock 2013 Appendix S1, (b) query `heartfailurerisk.org` once and cache, (c) reuse the MAGGIC R package. Option (a) is most defensible; option (b) was unreachable at SPEC-authoring time.
- **`risk_band` thresholds**: the 6-band cut-points (16/20/24/28/32) come from the SPEC §3.9 resolution-attempted note. If your clinical sign-off prefers tertiles or quartiles, edit the ladder accordingly — the underlying integer score is unchanged.
