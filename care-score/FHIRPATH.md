# CARE Score for Acute Coronary Syndrome — FHIRPath expressions

A pure-FHIRPath encoding of the CARE Score (History + ECG + Age + Risk factors, total 0–8) suitable for an SDC `Questionnaire` with `cqf-expression` / `calculatedExpression` / `variable` extensions. Each component is an integer 0–2; the score is a simple sum; the rule-out band is derived from a single threshold (`score ≤ 1`).

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `history` | integer (or coding 0/1/2) | yes | `history` | 0 = slightly suspicious; 1 = moderately; 2 = highly suspicious. |
| `ecg` | integer (or coding 0/1/2) | yes | `ecg` | 0 = normal; 1 = non-specific repol disturbance; 2 = significant ST-deviation. |
| `age_years` | integer | yes | `age_years` | Patient's chronological age in completed years (used to derive the age component). |
| `age_component` | integer | n/a (calculated) | derived | 0 if `<45`, 1 if 45–64, 2 if `≥65`. |
| `risk_factor_count` | integer | yes | derived input | Count of: hypertension, hypercholesterolemia, diabetes, obesity (BMI > 30), current smoking (or quit ≤ 3 mo), positive family history. |
| `atherosclerotic_disease` | boolean | yes | derived input | Prior MI / PCI / CABG / CVA / TIA / PAD. Forces `risk_factors → 2` when true. |
| `risk_factors` | integer | n/a (calculated) | output `risk_factors` | 0 / 1 / 2, after atherosclerotic-disease override. |
| `score` | integer | n/a (calculated) | output `score` | History + ECG + Age + Risk factors; range [0, 8]. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | enum: `low` \| `not_low`. |
| `threshold` | integer | n/a (constant) | output `threshold` | Constant `1` (the rule-out cutoff). |
| `mace_6w_pct` | decimal | n/a (calculated) | output `mace_6w_pct` | `0.0` for `low`; `null` (no answer) for `not_low`. |
| `disposition` | string | n/a (calculated) | output `disposition` | `discharge_no_troponin` or `proceed_to_full_workup`. |

Implementation choice for the three enum-style inputs:

- **Preferred:** `choice` items bound to a `ValueSet` whose codes carry `valueInteger` 0/1/2 via the SDC `ordinalValue` extension; the variable then reads the ordinal.
- **Simplest:** integer items with `minValue = 0` and `maxValue = 2`. The expressions below assume the simplest form.

---

## Variables

| name | expression |
|---|---|
| `history` | `%resource.item.where(linkId='history').answer.value.first()` |
| `ecg` | `%resource.item.where(linkId='ecg').answer.value.first()` |
| `age_years` | `%resource.item.where(linkId='age_years').answer.value.first()` |
| `risk_factor_count` | `%resource.item.where(linkId='risk_factor_count').answer.value.first()` |
| `atherosclerotic_disease` | `%resource.item.where(linkId='atherosclerotic_disease').answer.value.first()` |

---

## Calculated expressions

### `age_component`

```
iif(%age_years >= 65, 2,
  iif(%age_years >= 45, 1, 0))
```

### `risk_factors`

Per SPEC §2: any documented atherosclerotic disease forces the value to 2 regardless of count.

```
iif(%atherosclerotic_disease, 2,
  iif(%risk_factor_count >= 3, 2,
    iif(%risk_factor_count >= 1, 1, 0)))
```

### `score`

```
%history + %ecg + %age_component + %risk_factors
```

### `risk_band`

```
iif(%score <= 1, 'low', 'not_low')
```

### `mace_6w_pct`

The SPEC publishes a 6-week MACE rate of 0 % only for the negative-CARE band; for `not_low` the published rate is TBD.

```
iif(%score <= 1, 0.0, {})
```

(`{}` is the FHIRPath empty collection — the surrounding Questionnaire item should be optional / nullable.)

### `disposition`

```
iif(%score <= 1, 'discharge_no_troponin', 'proceed_to_full_workup')
```

---

## Worked example — test case 1 (Ms. Charlotte Devereux, score 1)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%history` | `1` |
| `%ecg` | `0` |
| `%age_years` | `28` |
| `%risk_factor_count` | `0` |
| `%atherosclerotic_disease` | `false` |

Evaluating `age_component`:

```
iif(28 >= 65, 2, iif(28 >= 45, 1, 0)) = 0
```

Evaluating `risk_factors`:

```
iif(false, 2, iif(0 >= 3, 2, iif(0 >= 1, 1, 0))) = 0
```

Evaluating `score`:

```
1 + 0 + 0 + 0 = 1
```

Evaluating `risk_band`: `iif(1 <= 1, 'low', 'not_low') = 'low'`.

Evaluating `mace_6w_pct`: `0.0`.

Evaluating `disposition`: `'discharge_no_troponin'`.

Matches expected output: `score = 1`, `risk_band = low`, MACE 0 %, disposition `discharge_no_troponin`.

---

## Notes

- **Rule-out only.** The CARE score rules ACS *out*; it does not rule it in. `not_low` means "not low risk by CARE alone", **not** "high risk". The `disposition` lexicon (`proceed_to_full_workup`) reflects this.
- **Threshold configurability.** SPEC §4.1 mentions an alternative HEART-style 0–3 low-risk cutoff. To support both, expose a `threshold` integer answer (default `1`) and replace `%score <= 1` with `%score <= %threshold` in the `risk_band` and `disposition` expressions.
- **Atherosclerotic-disease override.** The `enableWhen` strategy: keep `risk_factor_count` always enabled, but show a hint when `atherosclerotic_disease = true` that the count will be overridden to 2.
- **Lookup tables encode cleanly.** All transformations (age band, risk-factor band, score → risk band, score → disposition) are nested `iif()` ladders. No CQL library is required.
- **Rounding / clamping.** All inputs are integer; the score is integer by construction. No rounding needed. Defensive clamping of `history`, `ecg`, and `risk_factors` to [0, 2] is the form's responsibility (`minValue` / `maxValue`).
- **Required-conditional inputs.** All inputs are required; nothing is `enableWhen`-gated. An optional UX nicety: split `risk_factor_count` into six individual booleans and compute the count via FHIRPath sum — but the SPEC's data model treats it as already-counted.
