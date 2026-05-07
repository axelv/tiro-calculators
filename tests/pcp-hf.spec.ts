import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "pcp-hf";

/**
 * PCP-HF — Pooled Cohort Equations to Prevent Heart Failure.
 *
 * Type 2 (formula): race × sex stratified Cox proportional-hazards.
 * Tolerance: 0.1 percentage point — manual log/exp arithmetic in TEST_CASES.md
 * accumulates ~0.05 pp rounding error (per FHIRPATH.md note).
 */

test.describe("PCP-HF — 10-year incident HF risk", () => {
  test("Test case 1 — Young White Female, optimal profile (~0.01 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", "Female");
    await selectChip(page, "race", "White");
    await setNumber(page, "age", 35);
    await setNumber(page, "sbp", 110);
    await selectChip(page, "on_antihypertensive", "Not on antihypertensive");
    await selectChip(page, "current_smoker", "Non-smoker");
    await setNumber(page, "glucose", 86);
    await selectChip(page, "on_dm_meds", "Not on diabetes medication");
    await setNumber(page, "total_chol", 170);
    await setNumber(page, "hdl", 70);
    await setNumber(page, "bmi", 21.5);
    await setNumber(page, "qrs", 88);

    await expectCalculatedDecimal(page, "risk_pct", 0.01, 0.1);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 2 — Middle-aged White Male, treated HTN (~3.3 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", "Male");
    await selectChip(page, "race", "White");
    await setNumber(page, "age", 55);
    await setNumber(page, "sbp", 138);
    await selectChip(page, "on_antihypertensive", "On antihypertensive");
    await selectChip(page, "current_smoker", "Non-smoker");
    await setNumber(page, "glucose", 102);
    await selectChip(page, "on_dm_meds", "Not on diabetes medication");
    await setNumber(page, "total_chol", 200);
    await setNumber(page, "hdl", 45);
    await setNumber(page, "bmi", 28);
    await setNumber(page, "qrs", 96);

    await expectCalculatedDecimal(page, "risk_pct", 3.27, 0.2);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 3 — Black Female, treated HTN, smoker (~8.6 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", "Female");
    await selectChip(page, "race", "Black");
    await setNumber(page, "age", 60);
    await setNumber(page, "sbp", 145);
    await selectChip(page, "on_antihypertensive", "On antihypertensive");
    await selectChip(page, "current_smoker", "Current smoker");
    await setNumber(page, "glucose", 95);
    await selectChip(page, "on_dm_meds", "Not on diabetes medication");
    await setNumber(page, "total_chol", 210);
    await setNumber(page, "hdl", 50);
    await setNumber(page, "bmi", 30);
    await setNumber(page, "qrs", 92);

    await expectCalculatedDecimal(page, "risk_pct", 8.62, 0.1);
    await expectCalculatedString(page, "risk_band", "borderline");
  });

  test("Test case 4 — Older Black Male, multiple risk factors (~37 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", "Male");
    await selectChip(page, "race", "Black");
    await setNumber(page, "age", 68);
    await setNumber(page, "sbp", 150);
    await selectChip(page, "on_antihypertensive", "On antihypertensive");
    await selectChip(page, "current_smoker", "Current smoker");
    await setNumber(page, "glucose", 165);
    await selectChip(page, "on_dm_meds", "On diabetes medication");
    await setNumber(page, "total_chol", 220);
    await setNumber(page, "hdl", 38);
    await setNumber(page, "bmi", 32);
    await setNumber(page, "qrs", 100);

    await expectCalculatedDecimal(page, "risk_pct", 37.33, 1.0);
    await expectCalculatedString(page, "risk_band", "high");
  });

  test("Test case 5 — Older White Male, severe profile (~83 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", "Male");
    await selectChip(page, "race", "White");
    await setNumber(page, "age", 78);
    await setNumber(page, "sbp", 165);
    await selectChip(page, "on_antihypertensive", "On antihypertensive");
    await selectChip(page, "current_smoker", "Current smoker");
    await setNumber(page, "glucose", 180);
    await selectChip(page, "on_dm_meds", "On diabetes medication");
    await setNumber(page, "total_chol", 240);
    await setNumber(page, "hdl", 32);
    await setNumber(page, "bmi", 34);
    await setNumber(page, "qrs", 130);

    await expectCalculatedDecimal(page, "risk_pct", 82.7, 2.5);
    await expectCalculatedString(page, "risk_band", "high");
  });
});
