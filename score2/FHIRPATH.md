# SCORE2 — FHIRPath expressions

A pure-FHIRPath encoding of the **SCORE2** 10-year fatal+non-fatal CVD risk model (40–69 y, no DM/CKD/CVD). The model is a sex-stratified Cox sub-distribution hazard model with age interactions and four-region recalibration on the complementary log-log scale. Sex dispatch is encoded as an outer `iif(%sex = 'male', …, …)` ladder; within each branch every β is the published coefficient from *Eur Heart J* 2021;42:2439-2454 (cross-validated against `dvicencio/RiskScorescvd`).

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `sex` | choice | yes | `sex` | `male` \| `female`. |
| `age_years` | integer | yes | `age_years` | Years, 40–69. |
| `smoking` | choice | yes | `smoking` | `current` \| `other` (former / never pooled with non-smoker). |
| `sbp_mmHg` | decimal | yes | `sbp_mmHg` | mmHg. |
| `total_chol_mmol_L` | decimal | yes | `total_chol_mmol_L` | mmol/L. Convert mg/dL ÷ 38.67 upstream. |
| `hdl_chol_mmol_L` | decimal | yes | `hdl_chol_mmol_L` | mmol/L. Convert mg/dL ÷ 38.67 upstream. |
| `region` | choice | yes | `region` | `low` \| `moderate` \| `high` \| `very_high`. |
| `risk_pct` | decimal | n/a (calculated) | output `risk_pct` | 10-yr CVD risk, %. |
| `age_band` | string | n/a (calculated) | output `age_band` | `40_49` \| `50_69`. |
| `risk_category` | string | n/a (calculated) | output `risk_category` | `low_to_moderate` \| `high` \| `very_high`. |

> Implementation note: per SPEC §1, exclude prior CVD, diabetes, CKD, familial hypercholesterolaemia, and ages outside 40–69. Add `enableWhen`/preflight predicates upstream; the FHIRPath below assumes valid input.

---

## Variables

| name | expression |
|---|---|
| `sex` | `%resource.item.where(linkId='sex').answer.value.first()` |
| `age` | `%resource.item.where(linkId='age_years').answer.value.first()` |
| `smk_str` | `%resource.item.where(linkId='smoking').answer.value.first()` |
| `sbp` | `%resource.item.where(linkId='sbp_mmHg').answer.value.first()` |
| `tchol` | `%resource.item.where(linkId='total_chol_mmol_L').answer.value.first()` |
| `hdl` | `%resource.item.where(linkId='hdl_chol_mmol_L').answer.value.first()` |
| `region` | `%resource.item.where(linkId='region').answer.value.first()` |
| `smoking` | `iif(%smk_str = 'current', 1, 0)` |
| `cage` | `(%age - 60) / 5` |
| `csbp` | `(%sbp - 120) / 20` |
| `ctchol` | `%tchol - 6` |
| `chdl` | `(%hdl - 1.3) / 0.5` |

---

## Calculated expressions

### `linear_predictor` (`x`)

Sex-specific β table (SPEC §3.3):

```
iif(%sex = 'male',
      0.3742  * %cage
    + 0.6012  * %smoking
    + 0.2777  * %csbp
    + 0.1458  * %ctchol
    + (-0.2698) * %chdl
    + (-0.0755) * %cage * %smoking
    + (-0.0255) * %cage * %csbp
    + (-0.0281) * %cage * %ctchol
    + 0.0426  * %cage * %chdl
,
      0.4648  * %cage
    + 0.7744  * %smoking
    + 0.3131  * %csbp
    + 0.1002  * %ctchol
    + (-0.2606) * %chdl
    + (-0.1088) * %cage * %smoking
    + (-0.0277) * %cage * %csbp
    + (-0.0226) * %cage * %ctchol
    + 0.0613  * %cage * %chdl
)
```

### `baseline_survival` (`S0(10)`)

```
iif(%sex = 'male', 0.9605, 0.9776)
```

### `risk_uncalibrated`

```
1 - %baseline_survival.power(%linear_predictor.exp())
```

### `risk_calibrated`

Region recalibration on the complementary log-log scale (SPEC §3.5). Uses `1 - exp(-exp(scale1 + scale2 * ln(-ln(1 - risk_uncalibrated))))`.

```
1 - (-(iif(%sex = 'male',
        iif(%region = 'low',       -0.5699 + 0.7476 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'moderate',  -0.1565 + 0.8009 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'high',       0.3207 + 0.9360 * (-(1 - %risk_uncalibrated).ln()).ln(),
                                    0.5836 + 0.8294 * (-(1 - %risk_uncalibrated).ln()).ln())))
      ,
        iif(%region = 'low',       -0.7380 + 0.7019 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'moderate',  -0.3143 + 0.7701 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'high',       0.5710 + 0.9369 * (-(1 - %risk_uncalibrated).ln()).ln(),
                                    0.9412 + 0.8329 * (-(1 - %risk_uncalibrated).ln()).ln())))
     ).exp())).exp()
```

### `risk_pct`

```
(%risk_calibrated * 100).round(1)
```

### `age_band`

```
iif(%age < 50, '40_49', '50_69')
```

### `risk_category`

ESC 2021 thresholds (SPEC §4.1) — different cuts for the two age bands.

```
iif(%age_band = '40_49',
      iif(%risk_pct >= 7.5, 'very_high',
        iif(%risk_pct >= 2.5, 'high', 'low_to_moderate'))
,
      iif(%risk_pct >= 10, 'very_high',
        iif(%risk_pct >= 5, 'high', 'low_to_moderate'))
)
```

---

## Worked example — test case 3 (Miroslav Novak, High region, 62-y male smoker, High risk)

Inputs from `TEST_CASES.md` Test case 3:

| variable | value |
|---|---|
| `%sex` | `'male'` |
| `%age` | 62 |
| `%smoking` | 1 |
| `%sbp` | 158 |
| `%tchol` | 6.4 |
| `%hdl` | 1.0 |
| `%region` | `'high'` |

Centred predictors:

```
%cage    = (62 - 60) / 5  = 0.40
%csbp    = (158 - 120)/20 = 1.90
%ctchol  = 6.4 - 6        = 0.40
%chdl    = (1.0 - 1.3)/0.5 = -0.60
```

Linear predictor (men):

```
LP = 0.3742*0.40 + 0.6012*1 + 0.2777*1.90 + 0.1458*0.40 + (-0.2698)*(-0.60)
   + (-0.0755)*0.40*1 + (-0.0255)*0.40*1.90 + (-0.0281)*0.40*0.40 + 0.0426*0.40*(-0.60)
   = 0.14968 + 0.60120 + 0.52763 + 0.05832 + 0.16188
   - 0.03020 - 0.01938 - 0.00450 - 0.01022
   ≈ 1.4344
```

Uncalibrated risk:

```
exp(1.4344)        ≈ 4.197
S0^exp(LP)         = 0.9605 ^ 4.197 ≈ 0.84327
risk_uncalibrated  = 1 - 0.84327     ≈ 0.15673
```

Region recalibration (high, men):

```
ln(-ln(1 - 0.15673)) = ln(-ln(0.84327)) = ln(0.17050) ≈ -1.7691
scale1 + scale2 · cll = 0.3207 + 0.9360 · (-1.7691) ≈ -1.3354
exp(-1.3354)         ≈ 0.2632
exp(-0.2632)         ≈ 0.7686
risk_calibrated      = 1 - 0.7686    ≈ 0.2314
risk_pct             ≈ 23.1
```

The test case quotes the ESC chart value of ~17–19 %; the exact β-equation result of ~23 % is consistent with the high-region recalibration of an LP of 1.43 and lies in the same band. Either way:

```
age_band       = '50_69'
risk_category  = 'very_high'   (≥ 10 % at age 50–69)
```

The `risk_band = very_high` matches `TEST_CASES.md`. The exact percentage published in the chart is granular at SBP 150–159 / non-HDL 5.4; the per-subject β-equation result (~23 %) is the published-equation answer and should be preferred over chart bilinear interpolation.

---

## Notes

- All transcendental ops (`ln()`, `exp()`, `power()`) are native FHIRPath; no CQL library required.
- The recalibration block uses `(-x.ln()).ln()` to encode `ln(-ln(x))`. FHIRPath's `ln()` is the natural log; there is no built-in `cloglog`/`clog`. Care: `1 - risk_uncalibrated` must be in `(0, 1)` — clamp upstream if the LP is implausibly large.
- The β table includes the SCORE2 diabetes term in the derivation (β_dm = 0.6457 men / 0.8096 women, β_age·dm = -0.0983 men / -0.1272 women) per SPEC §3.3 footnote. **For SCORE2 (non-diabetic) the diabetes indicator is fixed to 0** so those terms drop out — they are not encoded above. Diabetic patients should be routed to **SCORE2-Diabetes**, not this Questionnaire.
- The `cage * %ctchol` and `cage * %chdl` cross-terms must be evaluated in the same order as written; FHIRPath evaluates left-to-right but the multiplications commute.
- ESC convention is to display risk as integer %, but the calculation must be retained as a float for correct threshold comparison (e.g. 2.49 % vs 2.50 % at age 49). The `(%risk_calibrated * 100).round(1)` keeps one decimal; for display, apply a rounding policy at the renderer.
- `risk_category` thresholds depend on age band and must NOT be hard-coded as a single ladder. The age-band split at 50 is sharp: a 49-year-old at 5 % is `very_high`, a 50-year-old at 5 % is `high` — verify with reviewers that this is the intended ESC behaviour for your jurisdiction.
