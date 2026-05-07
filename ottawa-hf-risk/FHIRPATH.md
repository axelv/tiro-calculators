# Ottawa Heart Failure Risk Scale (OHFRS) — FHIRPath expressions

> The SPEC defines two scoring variants: **basic** (10 boolean items, 1 point each, range 0–10) and **quantitative** (weighted, with NT-proBNP, range 0–15). A `variant` choice item dispatches between the two. The walk-test SaO₂ item participates only in the basic variant per §3.2.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `variant` | choice | yes | `variant` | Codes: `basic`, `quantitative`. Selects scoring branch. |
| `history_stroke_or_tia` | boolean | yes | `history_stroke_or_tia` | Any prior CVA or TIA. |
| `history_intubation_resp_distress` | boolean | yes | `history_intubation_resp_distress` | Prior intubation for respiratory failure. |
| `hr_arrival_ge_110` | boolean | yes | `hr_arrival_ge_110` | First triage HR ≥ 110 bpm. |
| `sao2_arrival_lt_90` | boolean | yes | `sao2_arrival_lt_90` | First arrival SaO₂ < 90 % (room air or usual home O₂). |
| `walk_test_hr_ge_110_or_unable` | boolean | yes | `walk_test_hr_ge_110_or_unable` | HR ≥ 110 during 3-min walk **or** unable to perform. |
| `walk_test_room_air_sao2_lt_90_or_unable` | boolean | yes (basic only) | `walk_test_room_air_sao2_lt_90_or_unable` | SaO₂ < 90 % on room air during walk **or** unable. **Not used in quantitative variant.** |
| `ecg_new_ischemia` | boolean | yes | `ecg_new_ischemia` | New ST/T-wave changes vs. prior ECG. |
| `urea_ge_12_mmol_l` | boolean | yes | `urea_ge_12_mmol_l` | Urea ≥ 12 mmol/L (BUN ≥ 33 mg/dL). |
| `serum_co2_ge_35_mmol_l` | boolean | yes | `serum_co2_ge_35_mmol_l` | Serum HCO₃ ≥ 35 mmol/L. |
| `troponin_elevated_to_mi_level` | boolean | yes | `troponin_elevated_to_mi_level` | Troponin above local MI cutoff. |
| `nt_probnp_ge_5000_ng_l` | boolean | yes (quantitative only) | `nt_probnp_ge_5000_ng_l` | NT-proBNP ≥ 5 000 ng/L. Only used in quantitative variant. |

> Apply `enableWhen` so `walk_test_room_air_sao2_lt_90_or_unable` is required only when `variant = 'basic'`, and `nt_probnp_ge_5000_ng_l` only when `variant = 'quantitative'`.

## Variables

| name | expression |
|---|---|
| `variant` | `%resource.repeat(item).where(linkId='variant').answer.value.code` |
| `histStroke` | `%resource.repeat(item).where(linkId='history_stroke_or_tia').answer.value` |
| `histIntub` | `%resource.repeat(item).where(linkId='history_intubation_resp_distress').answer.value` |
| `hrArr` | `%resource.repeat(item).where(linkId='hr_arrival_ge_110').answer.value` |
| `sao2Arr` | `%resource.repeat(item).where(linkId='sao2_arrival_lt_90').answer.value` |
| `walkHr` | `%resource.repeat(item).where(linkId='walk_test_hr_ge_110_or_unable').answer.value` |
| `walkSao2` | `%resource.repeat(item).where(linkId='walk_test_room_air_sao2_lt_90_or_unable').answer.value` |
| `ecgIsch` | `%resource.repeat(item).where(linkId='ecg_new_ischemia').answer.value` |
| `urea` | `%resource.repeat(item).where(linkId='urea_ge_12_mmol_l').answer.value` |
| `co2` | `%resource.repeat(item).where(linkId='serum_co2_ge_35_mmol_l').answer.value` |
| `trop` | `%resource.repeat(item).where(linkId='troponin_elevated_to_mi_level').answer.value` |
| `ntpro` | `%resource.repeat(item).where(linkId='nt_probnp_ge_5000_ng_l').answer.value` |

## Calculated expressions

### `score_basic` (range 0–10)

```
iif(%histStroke, 1, 0)
+ iif(%histIntub, 1, 0)
+ iif(%hrArr, 1, 0)
+ iif(%sao2Arr, 1, 0)
+ iif(%walkHr, 1, 0)
+ iif(%walkSao2, 1, 0)
+ iif(%ecgIsch, 1, 0)
+ iif(%urea, 1, 0)
+ iif(%co2, 1, 0)
+ iif(%trop, 1, 0)
```

### `score_quantitative` (range 0–15)

```
iif(%histStroke, 1, 0)
+ iif(%histIntub, 2, 0)
+ iif(%hrArr, 2, 0)
+ iif(%sao2Arr, 1, 0)
+ iif(%walkHr, 1, 0)
+ iif(%ecgIsch, 2, 0)
+ iif(%urea, 1, 0)
+ iif(%co2, 2, 0)
+ iif(%trop, 2, 0)
+ iif(%ntpro, 1, 0)
```

> Walk-test SaO₂ (`%walkSao2`) is intentionally absent from the quantitative formula per SPEC §3.2.

### `score` (active total, dispatched on variant)

```
iif(%variant = 'basic', %scoreBasic, %scoreQuantitative)
```

### `risk_band` (basic-variant bands per §4.1)

```
iif(%scoreBasic = 0, 'low',
  iif(%scoreBasic = 1, 'low_intermediate',
    iif(%scoreBasic = 2, 'intermediate',
      iif(%scoreBasic <= 4, 'high', 'very_high'))))
```

> The SPEC publishes risk bands only for the basic variant. The quantitative score should be reported numerically with its sensitivity context; do not map quantitative bands without a published table.

### `sae_14d_pct_approx` (representative 14-day SAE %, basic only)

```
iif(%scoreBasic = 0, 2.8,
  iif(%scoreBasic = 1, 6.0,
    iif(%scoreBasic = 2, 12.0,
      iif(%scoreBasic = 3, 22.0,
        iif(%scoreBasic = 4, 35.0,
                              89.0)))))
```

> Midpoint values from SPEC §4.1 ranges (5–7 → 6, 10–15 → 12, 20–25 → 22, 30–40 → 35). Surface as approximate; precise per-score figures should be sourced from Stiell 2013/2017 directly.

### `disposition` (decision support)

```
iif(%scoreBasic <= 1, 'discharge_with_followup', 'admit_observe')
```

> SPEC §4.3 shows two operating points (cutoff ≥ 1 vs. ≥ 2). The expression above uses cutoff ≥ 2 (the preferred operating point). For the more sensitive cutoff replace `<= 1` with `= 0`.

## Worked example — test case 3 (basic = 3, quantitative = 6)

Aïsha Belkacem — HR 116 on arrival, new ECG ischemia, urea 14.8, NT-proBNP 8 200.

| linkId | answer |
|---|---|
| `variant` | `quantitative` (with NT-proBNP available; basic also computed for context) |
| `history_stroke_or_tia` | false |
| `history_intubation_resp_distress` | false |
| `hr_arrival_ge_110` | true |
| `sao2_arrival_lt_90` | false |
| `walk_test_hr_ge_110_or_unable` | false |
| `walk_test_room_air_sao2_lt_90_or_unable` | false |
| `ecg_new_ischemia` | true |
| `urea_ge_12_mmol_l` | true |
| `serum_co2_ge_35_mmol_l` | false |
| `troponin_elevated_to_mi_level` | false |
| `nt_probnp_ge_5000_ng_l` | true |

Basic:

```
0 + 0 + 1 + 0 + 0 + 0 + 1 + 1 + 0 + 0  =  3
```

Quantitative:

```
0 + 0 + 2 + 0 + 0 + 2 + 1 + 0 + 0 + 1  =  6
```

- `score_basic = 3`
- `score_quantitative = 6`
- `score` (variant = quantitative) → 6
- `risk_band` (uses scoreBasic) → score = 3 → `'high'`
- `sae_14d_pct_approx` → 22 %
- `disposition` → score > 1 → `'admit_observe'`

Matches SPEC test case 3 exactly (basic 3, quantitative 6, High risk, admit).

## Notes

- The SPEC's quantitative algorithm in §3.2 (and the pseudocode in §3) deliberately omits the walk-test SaO₂ item per the MDCalc encoding. The expression above mirrors that exactly.
- "Unable to perform" the walk test maps to `true` for both walk-test booleans (positive-by-default rule, SPEC §2 notes).
- All boolean weights are integers; FHIRPath summation is exact and there's no need for CQL.
- Risk bands and SAE percentages are derived from SPEC §4.1 and are intentionally approximate (midpoints of published ranges) — flag in the UI that exact per-score probabilities should be cited from Stiell 2013/2017.
