import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "score2-op";

/**
 * SCORE2-OP — Playwright suite.
 *
 * Coefficients per SPEC §3.4 (SCORE2-OP Working Group, Eur Heart J 2021;42:2455–2467).
 *
 * Expected values below are the **formula-derived** outputs (hand-traced from
 * the SPEC §3.1–§3.3 equations). Per FHIRPATH.md the equation is the source of
 * truth; the illustrative `risk_10y_pct` figures in TEST_CASES.md are
 * clinically plausible chart-eyeball estimates and may diverge from the strict
 * formula output (notably for borderline cases). Risk bands below match the
 * formula output. See score2-op/README.md for detail.
 *
 * Tolerance: 0.2 pp on the percentage value (covers SDK FP rounding and
 * round-to-1-decimal of the published equation).
 */

// Globally-unique chip displays per the questionnaire.
const SEX_MALE = "Male";
const SEX_FEMALE = "Female";
const SMOKE_NO = "Non-smoker";
const SMOKE_YES = "Current smoker";
const REGION_LOW = "Low risk region";
const REGION_MODERATE = "Moderate risk region";
const REGION_HIGH = "High risk region";
const REGION_VERY_HIGH = "Very high risk region";

const PCT_TOL = 0.2;

test.describe("SCORE2-OP (10-year CVD risk in adults ≥ 70)", () => {
  test("Test case 1 — 72 y/o female, Netherlands (low region), favourable profile (~7.4 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age_years", 72);
    await selectChip(page, "current_smoker", SMOKE_NO);
    await setNumber(page, "sbp_mmhg", 132);
    await setNumber(page, "total_chol_mmol_l", 5.0);
    await setNumber(page, "hdl_chol_mmol_l", 1.7);
    await selectChip(page, "risk_region", REGION_LOW);

    await expectCalculatedDecimal(page, "risk_10y_pct", 7.4, PCT_TOL);
    await expectCalculatedString(page, "risk_band", "low_to_moderate");
  });

  test("Test case 2 — 75 y/o male, Austria (moderate region), former smoker (~21.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 75);
    await selectChip(page, "current_smoker", SMOKE_NO);
    await setNumber(page, "sbp_mmhg", 152);
    await setNumber(page, "total_chol_mmol_l", 6.4);
    await setNumber(page, "hdl_chol_mmol_l", 1.2);
    await selectChip(page, "risk_region", REGION_MODERATE);

    await expectCalculatedDecimal(page, "risk_10y_pct", 21.6, PCT_TOL);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 3 — 78 y/o male, Hungary (high region), current smoker (~41.0 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 78);
    await selectChip(page, "current_smoker", SMOKE_YES);
    await setNumber(page, "sbp_mmhg", 168);
    await setNumber(page, "total_chol_mmol_l", 6.6);
    await setNumber(page, "hdl_chol_mmol_l", 1.0);
    await selectChip(page, "risk_region", REGION_HIGH);

    await expectCalculatedDecimal(page, "risk_10y_pct", 41.0, PCT_TOL);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 4 — 82 y/o female, Russia (very-high region), current smoker (~59.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age_years", 82);
    await selectChip(page, "current_smoker", SMOKE_YES);
    await setNumber(page, "sbp_mmhg", 170);
    await setNumber(page, "total_chol_mmol_l", 7.0);
    await setNumber(page, "hdl_chol_mmol_l", 1.1);
    await selectChip(page, "risk_region", REGION_VERY_HIGH);

    await expectCalculatedDecimal(page, "risk_10y_pct", 59.6, PCT_TOL);
    await expectCalculatedString(page, "risk_band", "very_high");
  });

  test("Test case 5 — 70 y/o male, France (low region), ideal profile (~7.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age_years", 70);
    await selectChip(page, "current_smoker", SMOKE_NO);
    await setNumber(page, "sbp_mmhg", 118);
    await setNumber(page, "total_chol_mmol_l", 4.2);
    await setNumber(page, "hdl_chol_mmol_l", 1.8);
    await selectChip(page, "risk_region", REGION_LOW);

    await expectCalculatedDecimal(page, "risk_10y_pct", 7.6, PCT_TOL);
    await expectCalculatedString(page, "risk_band", "high");
  });
});
