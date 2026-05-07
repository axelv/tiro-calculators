import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "score2-diabetes";

/**
 * SCORE2-Diabetes — Playwright suite.
 *
 * Sex-stratified Fine-Gray competing-risk model with diabetes-specific
 * predictors and four-region recalibration (SPEC §3, FHIRPATH.md).
 *
 * Tolerance: 0.5 percentage-point on `risk_10y_pct`. The β-equation is the
 * source of truth (per SPEC §3.5). Reference values were re-computed in
 * Python from the published coefficients and cross-validated against the
 * SPEC §3.5 worked example (60 y/o non-smoking man, moderate region,
 * HbA1c 70, eGFR 60 → 12.9 %).
 *
 * Note: TEST_CASES.md publishes illustrative point estimates. For TC2
 * (Klaus Weber) the equation produces ~12.9 % (very_high band), one tier
 * above the test-case's "high" expectation — FHIRPATH.md §"Worked example"
 * documents this divergence and confirms the equation's value matches the
 * SPEC's own worked example. Tests assert formula-derived values.
 */

// Globally-unique chip displays (per CONVENTIONS.md).
const SEX_MALE = "Male";
const SEX_FEMALE = "Female";

const SMOKER_NO = "Non-smoker";
const SMOKER_YES = "Current smoker";

const REGION_LOW = "Low-risk region";
const REGION_MODERATE = "Moderate-risk region";
const REGION_HIGH = "High-risk region";
const REGION_VERY_HIGH = "Very high-risk region";

test.describe("SCORE2-Diabetes", () => {
  test("Test case 1 — 47 y/o female, low-risk region, well-controlled (~2.3 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age", 47);
    await selectChip(page, "smoker_current", SMOKER_NO);
    await setNumber(page, "sbp", 122);
    await setNumber(page, "total_cholesterol", 4.6);
    await setNumber(page, "hdl_cholesterol", 1.5);
    await setNumber(page, "age_at_diabetes_diagnosis", 46);
    await setNumber(page, "hba1c", 48);
    await setNumber(page, "egfr", 95);
    await selectChip(page, "risk_region", REGION_LOW);

    await expectCalculatedDecimal(page, "risk_10y_pct", 2.3, 0.5);
    await expectCalculatedString(page, "risk_band", "low_to_moderate");
  });

  test("Test case 2 — 58 y/o male, moderate region, mildly poor control (~12.9 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age", 58);
    await selectChip(page, "smoker_current", SMOKER_NO);
    await setNumber(page, "sbp", 138);
    await setNumber(page, "total_cholesterol", 5.4);
    await setNumber(page, "hdl_cholesterol", 1.1);
    await setNumber(page, "age_at_diabetes_diagnosis", 52);
    await setNumber(page, "hba1c", 58);
    await setNumber(page, "egfr", 72);
    await selectChip(page, "risk_region", REGION_MODERATE);

    await expectCalculatedDecimal(page, "risk_10y_pct", 12.9, 0.5);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 3 — 64 y/o male smoker, high region, poorly controlled (~46.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age", 64);
    await selectChip(page, "smoker_current", SMOKER_YES);
    await setNumber(page, "sbp", 162);
    await setNumber(page, "total_cholesterol", 6.4);
    await setNumber(page, "hdl_cholesterol", 1.0);
    await setNumber(page, "age_at_diabetes_diagnosis", 52);
    await setNumber(page, "hba1c", 75);
    await setNumber(page, "egfr", 52);
    await selectChip(page, "risk_region", REGION_HIGH);

    await expectCalculatedDecimal(page, "risk_10y_pct", 46.6, 0.5);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 4 — 69 y/o female smoker, very-high region, severe (~89.4 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age", 69);
    await selectChip(page, "smoker_current", SMOKER_YES);
    await setNumber(page, "sbp", 170);
    await setNumber(page, "total_cholesterol", 7.2);
    await setNumber(page, "hdl_cholesterol", 0.9);
    await setNumber(page, "age_at_diabetes_diagnosis", 44);
    await setNumber(page, "hba1c", 80);
    await setNumber(page, "egfr", 38);
    await selectChip(page, "risk_region", REGION_VERY_HIGH);

    await expectCalculatedDecimal(page, "risk_10y_pct", 89.4, 0.5);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 5 — 40 y/o female, low region, brand-new diabetes (~1.1 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age", 40);
    await selectChip(page, "smoker_current", SMOKER_NO);
    await setNumber(page, "sbp", 110);
    await setNumber(page, "total_cholesterol", 4.0);
    await setNumber(page, "hdl_cholesterol", 1.8);
    await setNumber(page, "age_at_diabetes_diagnosis", 40);
    await setNumber(page, "hba1c", 49);
    await setNumber(page, "egfr", 110);
    await selectChip(page, "risk_region", REGION_LOW);

    await expectCalculatedDecimal(page, "risk_10y_pct", 1.1, 0.5);
    await expectCalculatedString(page, "risk_band", "low_to_moderate");
  });
});
