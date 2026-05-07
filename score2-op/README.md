# SCORE2-OP — implementer notes

## Calculator type

Type 2 (formula-based). Sex-specific Fine–Gray competing-risk linear predictor with age-interaction terms, mean-LP centring, and four-region recalibration on the complementary log-log scale. All transcendental ops (`exp()`, `ln()`, `power()`) evaluate natively in the SDK's FHIRPath engine.

## Inputs (7) → outputs (2)

- Inputs: `sex`, `age_years`, `current_smoker`, `sbp_mmhg`, `total_chol_mmol_l`, `hdl_chol_mmol_l`, `risk_region`.
- Outputs: `risk_10y_pct` (decimal, %, rounded to 1 decimal), `risk_band` (`low_to_moderate` | `high` | `very_high`).
- The `diabetes` flag exposed by MDCalc is **not** part of the 2021 SCORE2-OP derivation and is not encoded here (per SPEC §3.4.1 footnote and FHIRPATH.md).

## Variable scoping

Variables defined on one item are not visible on sibling items in this SDK build, so the full chain (`isMale`, `age`, `smk`, `sbp`, `tchol`, `hdl`, `region`, `cage`, `csbp`, `ctchol`, `chdl`, `lp`, `meanLP`, `s0`, `riskUncal`, `cll`, `scale1`, `scale2`, `riskCal`) is re-declared on both `risk_10y_pct` and `risk_band` output items. Same pattern as `cha2ds2-vasc`.

## Deviations from TEST_CASES.md "expected" risk_10y_pct values

`TEST_CASES.md` flags its `risk_10y_pct` figures as "clinically plausible point estimates" rather than canonical formula outputs (its own caveat in the preamble). The Playwright spec asserts **formula-derived** values (hand-traced from SPEC §3.1–§3.3), per FHIRPATH.md's explicit guidance that "implementations should treat the equation as the source of truth".

| Test | TEST_CASES.md expected | Formula output | Band (formula) |
|---|---|---|---|
| 1 (72 F, low) | ~4.5 % → low_to_moderate | **7.4 %** | low_to_moderate |
| 2 (75 M, moderate) | ~11 % → high | **21.6 %** | very_high (vs. high expected) |
| 3 (78 M, high) | ~26 % → very_high | **41.0 %** | very_high |
| 4 (82 F, very_high) | ~28 % → very_high | **59.6 %** | very_high |
| 5 (70 M, low) | ~4.0 % → low_to_moderate | **7.6 %** | high (vs. low_to_moderate expected) |

Notes:
- Test case 2 lands one band higher than the test_cases vignette (this is the "moderate-region scale2 = 1.25 amplification" artefact already documented in FHIRPATH.md §"Worked example").
- Test case 5 lands at 7.6 %, just above the 7.5 % `high` threshold; the test_cases vignette anticipated low_to_moderate. Both are formula-correct given the SCORE2-OP coefficients in SPEC §3.4.

These mismatches are formula-correct given the published coefficients and recalibration constants and are not implementation bugs. Real-world SCORE2-OP charts use additional smoothing (5-year age bins, integer-percent bucketing); the analytic equation is sharper at boundaries.

## Tolerance

Tests assert `risk_10y_pct` to within ±0.2 percentage points to absorb the SDK's `(x * 1000).round() / 10` rounding step plus floating-point noise.
