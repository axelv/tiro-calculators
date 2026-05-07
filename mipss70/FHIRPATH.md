# MIPSS70 / MIPSS70+ v2.0 — FHIRPath expressions

> Two related models share one Questionnaire. A `version` choice item selects which scoring branch is active. All expressions below assume QuestionnaireResponse items with the SPEC field keys as `linkId`.

## Item linkIds (QuestionnaireResponse contract)

### Shared

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `version` | choice | yes | `version` | Allowed codes: `MIPSS70`, `MIPSS70+v2.0`. Selects scoring branch. |
| `blasts_ge_2` | boolean | yes | `blasts_ge_2` | PB blasts ≥ 2 %. |
| `constitutional_symptoms` | boolean | yes | `constitutional_symptoms` | Weight loss > 10 % / 6 mo, night sweats, unexplained fever. |
| `absence_calr_type1` | boolean | yes | `absence_calr_type1` | True if driver is **not** CALR type 1 / type 1-like. |

### MIPSS70 (original) only — used when `version = 'MIPSS70'`

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `hb_lt_10` | boolean | yes (if MIPSS70) | `hb_lt_10` | Single threshold (not sex-adjusted). |
| `wbc_gt_25` | boolean | yes (if MIPSS70) | `wbc_gt_25` | WBC > 25 × 10⁹/L. |
| `plt_lt_100` | boolean | yes (if MIPSS70) | `plt_lt_100` | Platelets < 100 × 10⁹/L. |
| `bm_fibrosis_ge_2` | boolean | yes (if MIPSS70) | `bm_fibrosis_ge_2` | WHO/EUMNET grade ≥ 2. |
| `hmr_present` | boolean | yes (if MIPSS70) | `hmr_present` | ≥ 1 of ASXL1, EZH2, SRSF2, IDH1, IDH2. |
| `hmr_two_or_more` | boolean | yes (if MIPSS70) | `hmr_two_or_more` | Additive on top of `hmr_present` in MIPSS70. |

### MIPSS70+ v2.0 only — used when `version = 'MIPSS70+v2.0'`

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `severe_anemia` | boolean | yes (if v2.0) | `severe_anemia` | Hb < 8 (women) / < 9 (men). Mutually exclusive with `moderate_anemia`. |
| `moderate_anemia` | boolean | yes (if v2.0) | `moderate_anemia` | Hb 8–9.9 (women) / 9–10.9 (men). |
| `hmr_status` | choice | yes (if v2.0) | `hmr_status` | Codes: `none`, `single`, `two_or_more`. Picks one of the three; **not additive**. Expanded list includes U2AF1 Q157. |
| `karyotype` | choice | yes (if v2.0) | `karyotype` | Codes: `vhr`, `unfavorable`, `favorable`. Pick exactly one. |

> Use `enableWhen` on the version-specific items so only the relevant set is rendered/validated for the selected `version`.

## Variables

| name | expression |
|---|---|
| `version` | `%resource.repeat(item).where(linkId='version').answer.value.code` |
| `blasts` | `%resource.repeat(item).where(linkId='blasts_ge_2').answer.value` |
| `consSymp` | `%resource.repeat(item).where(linkId='constitutional_symptoms').answer.value` |
| `noCalr1` | `%resource.repeat(item).where(linkId='absence_calr_type1').answer.value` |
| `hbLt10` | `%resource.repeat(item).where(linkId='hb_lt_10').answer.value` |
| `wbcGt25` | `%resource.repeat(item).where(linkId='wbc_gt_25').answer.value` |
| `pltLt100` | `%resource.repeat(item).where(linkId='plt_lt_100').answer.value` |
| `bmFibGe2` | `%resource.repeat(item).where(linkId='bm_fibrosis_ge_2').answer.value` |
| `hmrPresent` | `%resource.repeat(item).where(linkId='hmr_present').answer.value` |
| `hmrTwoOrMore` | `%resource.repeat(item).where(linkId='hmr_two_or_more').answer.value` |
| `severeAnemia` | `%resource.repeat(item).where(linkId='severe_anemia').answer.value` |
| `moderateAnemia` | `%resource.repeat(item).where(linkId='moderate_anemia').answer.value` |
| `hmrStatus` | `%resource.repeat(item).where(linkId='hmr_status').answer.value.code` |
| `karyotype` | `%resource.repeat(item).where(linkId='karyotype').answer.value.code` |

## Calculated expressions

### `score_mipss70` (MIPSS70 original; range 0–12)

```
iif(%hbLt10, 1, 0)
+ iif(%wbcGt25, 2, 0)
+ iif(%pltLt100, 2, 0)
+ iif(%blasts, 1, 0)
+ iif(%bmFibGe2, 1, 0)
+ iif(%consSymp, 1, 0)
+ iif(%noCalr1, 1, 0)
+ iif(%hmrPresent, 1, 0)
+ iif(%hmrTwoOrMore, 2, 0)
```

### `score_mipss70_v2` (MIPSS70+ v2.0; range 0–17)

```
iif(%karyotype = 'vhr', 4,
  iif(%karyotype = 'unfavorable', 3, 0))
+ iif(%hmrStatus = 'two_or_more', 3,
    iif(%hmrStatus = 'single', 2, 0))
+ iif(%noCalr1, 2, 0)
+ iif(%consSymp, 2, 0)
+ iif(%severeAnemia, 2,
    iif(%moderateAnemia, 1, 0))
+ iif(%blasts, 1, 0)
```

### `score` (active total, dispatched on `version`)

```
iif(%version = 'MIPSS70',     %scoreMipss70,    %scoreMipss70V2)
```

> Define `scoreMipss70` and `scoreMipss70V2` as named `variable` extensions on the Questionnaire root referencing the two expressions above; then `score` becomes a one-line dispatch. Alternatively inline both computations inside the `iif`.

### `risk_category`

**MIPSS70 (3 bands: Low / Intermediate / High):**

```
iif(%version = 'MIPSS70',
  iif(%scoreMipss70 <= 1, 'low',
    iif(%scoreMipss70 <= 4, 'intermediate', 'high')),
  /* MIPSS70+ v2.0 (5 bands) */
  iif(%scoreMipss70V2 = 0, 'very_low',
    iif(%scoreMipss70V2 <= 2, 'low',
      iif(%scoreMipss70V2 <= 4, 'intermediate',
        iif(%scoreMipss70V2 <= 8, 'high', 'very_high')))))
```

### `median_os_years`

```
iif(%version = 'MIPSS70',
  iif(%scoreMipss70 <= 1, 27.7,
    iif(%scoreMipss70 <= 4, 7.1, 2.3)),
  iif(%scoreMipss70V2 = 0, {} /* not reached */,
    iif(%scoreMipss70V2 <= 2, 16.4,
      iif(%scoreMipss70V2 <= 4, 7.7,
        iif(%scoreMipss70V2 <= 8, 4.1, 1.8)))))
```

> An empty collection (`{}`) represents the "not reached" sentinel for very-low MIPSS70+ v2.0; surface it as a string in the rendering layer.

### `survival_at_5y` (MIPSS70 only)

```
iif(%version = 'MIPSS70',
  iif(%scoreMipss70 <= 1, 0.95,
    iif(%scoreMipss70 <= 4, 0.70, 0.29)),
  {} )
```

### `survival_at_10y` (MIPSS70+ v2.0 only)

```
iif(%version = 'MIPSS70+v2.0',
  iif(%scoreMipss70V2 = 0, 0.92,
    iif(%scoreMipss70V2 <= 2, 0.56,
      iif(%scoreMipss70V2 <= 4, 0.37,
        iif(%scoreMipss70V2 <= 8, 0.13, 0.05)))),
  {} )
```

> 10-year OS for very-high stratum is reported as "< 5 %"; encoded here as `0.05` with a UI note that the published value is an upper bound.

### `transplant_recommendation`

```
iif(%version = 'MIPSS70',
  iif(%scoreMipss70 <= 1, 'defer',
    iif(%scoreMipss70 <= 4, 'consider', 'recommend')),
  iif(%scoreMipss70V2 <= 2, 'defer',
    iif(%scoreMipss70V2 <= 4, 'individualized',
      iif(%scoreMipss70V2 <= 8, 'recommend', 'strongly_recommend'))))
```

## Worked example — test case 3 (MIPSS70, High risk)

Hannah O'Brien — all clinical and molecular markers positive, including ≥ 2 HMR.

QuestionnaireResponse fragment (booleans):

| linkId | answer |
|---|---|
| `version` | `MIPSS70` |
| `hb_lt_10` | true |
| `wbc_gt_25` | true |
| `plt_lt_100` | true |
| `blasts_ge_2` | true |
| `bm_fibrosis_ge_2` | true |
| `constitutional_symptoms` | true |
| `absence_calr_type1` | true |
| `hmr_present` | true |
| `hmr_two_or_more` | true |

Compute `score_mipss70`:

```
1 + 2 + 2 + 1 + 1 + 1 + 1 + 1 + 2  =  12
```

- `%scoreMipss70 = 12`
- `risk_category` → `score > 4` → `'high'`
- `median_os_years` → `2.3`
- `survival_at_5y` → `0.29`
- `transplant_recommendation` → `'recommend'`

Matches SPEC test case 3 exactly (Total = 12, High, median OS 2.3 y, 5-y OS ~29 %).

### Worked example — test case 5 (MIPSS70+ v2.0, Very high)

Aiko Tanaka:

| linkId | answer |
|---|---|
| `version` | `MIPSS70+v2.0` |
| `severe_anemia` | true |
| `moderate_anemia` | false |
| `blasts_ge_2` | true |
| `constitutional_symptoms` | true |
| `absence_calr_type1` | true |
| `hmr_status` | `two_or_more` |
| `karyotype` | `vhr` |

Compute `score_mipss70_v2`:

```
karyotype 'vhr' → 4
hmr_status 'two_or_more' → 3
absence_calr_type1 true → 2
constitutional_symptoms true → 2
severe_anemia true → 2 (moderate branch ignored)
blasts true → 1
Total = 14
```

- `risk_category` → `score >= 9` → `'very_high'`
- `median_os_years` → `1.8`
- `survival_at_10y` → `0.05`
- `transplant_recommendation` → `'strongly_recommend'`

Matches SPEC test case 5 (Total = 14, Very high, median OS 1.8 y, 10-y OS < 5 %).

## Notes

- **MIPSS70 vs. MIPSS70+ v2.0 HMR rule differs deliberately.** In MIPSS70 the `hmr_two_or_more` point is **additive** on top of `hmr_present` (1 + 2 = 3 for two-HMR carriers). In MIPSS70+ v2.0 the HMR contribution is a single mutually-exclusive choice (`none = 0` / `single = 2` / `two_or_more = 3`). Encoded above accordingly — note the different field types (two booleans vs. one `choice` with three codes).
- Anemia in v2.0 is also a single mutually-exclusive choice in spirit but is encoded here as two booleans (`severe_anemia`, `moderate_anemia`) per the SPEC §2.2 field list. The `iif(%severeAnemia, 2, iif(%moderateAnemia, 1, 0))` ordering enforces severe-wins-over-moderate.
- Karyotype favourable scores 0; only `vhr` (4) and `unfavorable` (3) are emitted by the score expression.
- "Not reached" median OS for MIPSS70+ v2.0 very-low is encoded as `{}` (empty); the consumer must translate to a string label.
- All FHIRPath; no need to escalate to CQL.
