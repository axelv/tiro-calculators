import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "score2";

/**
 * SCORE2 — Playwright suite.
 *
 * Sex-stratified competing-risks Cox model with age interactions and
 * four-region recalibration. Coefficients per SPEC §3.3 (SCORE2 Working Group,
 * Eur Heart J 2021;42:2439–2454, supplement).
 *
 * Expected `risk_pct` values are computed from the published β-coefficient
 * equation (per the FHIRPATH.md worked example for TC 3 — ~23.1 %). The
 * TEST_CASES.md "expected" percentages are chart-band approximations and
 * intentionally diverge from the per-subject β-equation answer; this suite
 * asserts the β-equation value because that is what the FHIRPath actually
 * computes. `risk_category` is asserted against the ESC 2021 thresholds
 * applied to the computed `risk_pct`.
 *
 * Tolerance: 0.2 percentage-points (covers float precision drift through
 * exp/ln/power chain).
 */

const SEX_MALE = "Male";
const SEX_FEMALE = "Female";
const SMK_CURRENT = "Current smoker";
const SMK_OTHER = "Never / former smoker";
const REG_LOW = "Low risk region";
const REG_MOD = "Moderate risk region";
const REG_HIGH = "High risk region";
const REG_VHIGH = "Very high risk region";

test.describe("SCORE2 — 10-year CVD risk (40-69 y)", () => {
  test("Test case 1 — Low region, 42 y/o female non-smoker (~0.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age_years", 42);
    await selectChip(page, "smoking", SMK_OTHER);
    await setNumber(page, "sbp_mmHg", 118);
    await setNumber(page, "total_chol_mmol_L", 4.2);
    await setNumber(page, "hdl_chol_mmol_L", 1.7);
    await selectChip(page, "region", REG_LOW);

    await expectCalculatedDecimal(page, "risk_pct", 0.6, 0.2);
    await expectCalculatedString(page, "age_band", "40_49");
    await expectCalculatedString(page, "risk_category", "low_to_moderate");
  });

  test("Test case 2 — Moderate region, 55 y/o male non-smoker (~5.7 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 55);
    await selectChip(page, "smoking", SMK_OTHER);
    await setNumber(page, "sbp_mmHg", 138);
    await setNumber(page, "total_chol_mmol_L", 5.4);
    await setNumber(page, "hdl_chol_mmol_L", 1.2);
    await selectChip(page, "region", REG_MOD);

    await expectCalculatedDecimal(page, "risk_pct", 5.7, 0.2);
    await expectCalculatedString(page, "age_band", "50_69");
    // β-equation gives 5.7%, which is ≥ 5% → "high" in 50–69 band.
    await expectCalculatedString(page, "risk_category", "high");
  });

  test("Test case 3 — High region, 62 y/o male smoker (~23.1 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 62);
    await selectChip(page, "smoking", SMK_CURRENT);
    await setNumber(page, "sbp_mmHg", 158);
    await setNumber(page, "total_chol_mmol_L", 6.4);
    await setNumber(page, "hdl_chol_mmol_L", 1.0);
    await selectChip(page, "region", REG_HIGH);

    await expectCalculatedDecimal(page, "risk_pct", 23.0, 0.2);
    await expectCalculatedString(page, "age_band", "50_69");
    await expectCalculatedString(page, "risk_category", "very_high");
  });

  test("Test case 4 — Very high region, 69 y/o female smoker (~50.3 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age_years", 69);
    await selectChip(page, "smoking", SMK_CURRENT);
    await setNumber(page, "sbp_mmHg", 168);
    await setNumber(page, "total_chol_mmol_L", 7.0);
    await setNumber(page, "hdl_chol_mmol_L", 0.9);
    await selectChip(page, "region", REG_VHIGH);

    await expectCalculatedDecimal(page, "risk_pct", 50.3, 0.5);
    await expectCalculatedString(page, "age_band", "50_69");
    await expectCalculatedString(page, "risk_category", "very_high");
  });

  test("Test case 5 — Low region, 49 y/o male non-smoker (~3.0 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 49);
    await selectChip(page, "smoking", SMK_OTHER);
    await setNumber(page, "sbp_mmHg", 132);
    await setNumber(page, "total_chol_mmol_L", 5.6);
    await setNumber(page, "hdl_chol_mmol_L", 1.3);
    await selectChip(page, "region", REG_LOW);

    await expectCalculatedDecimal(page, "risk_pct", 3.0, 0.2);
    await expectCalculatedString(page, "age_band", "40_49");
    // β-equation gives ~3.0%, which is ≥ 2.5% → "high" in the 40–49 band.
    await expectCalculatedString(page, "risk_category", "high");
  });
});
