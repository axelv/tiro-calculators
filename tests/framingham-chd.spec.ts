import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "framingham-chd";

// Globally-unique chip displays per the questionnaire.
const SEX_MALE = "Male";
const SEX_FEMALE = "Female";
const HTN_NO = "Untreated hypertension";
const HTN_YES = "Treated hypertension";
const SMOKER_NO = "Non-smoker";
const SMOKER_YES = "Current smoker";

test.describe("Framingham Risk Score for Hard CHD (10-year)", () => {
  test("Test case 1 — low risk, 42 y/o female (2 pts → < 1 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age", 42);
    await setNumber(page, "total_chol", 180);
    await setNumber(page, "hdl", 65);
    await setNumber(page, "sbp", 110);
    await selectChip(page, "treated_htn", HTN_NO);
    await selectChip(page, "smoker", SMOKER_NO);

    await expectCalculatedDecimal(page, "total_points", 2);
    await expectCalculatedString(page, "risk_10yr_pct", "< 1 %");
    await expectCalculatedDecimal(page, "risk_10yr_pct_numeric", 0.5);
    await expectCalculatedString(page, "risk_category", "low");
  });

  test("Test case 2 — 50 y/o male, treated HTN (12 pts → 10 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age", 50);
    await setNumber(page, "total_chol", 220);
    await setNumber(page, "hdl", 45);
    await setNumber(page, "sbp", 132);
    await selectChip(page, "treated_htn", HTN_YES);
    await selectChip(page, "smoker", SMOKER_NO);

    await expectCalculatedDecimal(page, "total_points", 12);
    await expectCalculatedString(page, "risk_10yr_pct", "10 %");
    await expectCalculatedDecimal(page, "risk_10yr_pct_numeric", 10);
    await expectCalculatedString(page, "risk_category", "intermediate");
  });

  test("Test case 3 — 53 y/o male smoker (13 pts → 12 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age", 53);
    await setNumber(page, "total_chol", 210);
    await setNumber(page, "hdl", 45);
    await setNumber(page, "sbp", 128);
    await selectChip(page, "treated_htn", HTN_NO);
    await selectChip(page, "smoker", SMOKER_YES);

    await expectCalculatedDecimal(page, "total_points", 13);
    await expectCalculatedString(page, "risk_10yr_pct", "12 %");
    await expectCalculatedDecimal(page, "risk_10yr_pct_numeric", 12);
    await expectCalculatedString(page, "risk_category", "intermediate");
  });

  test("Test case 4 — 62 y/o male smoker, untreated HTN (14 pts → 16 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "age", 62);
    await setNumber(page, "total_chol", 230);
    await setNumber(page, "hdl", 42);
    await setNumber(page, "sbp", 145);
    await selectChip(page, "treated_htn", HTN_NO);
    await selectChip(page, "smoker", SMOKER_YES);

    await expectCalculatedDecimal(page, "total_points", 14);
    await expectCalculatedString(page, "risk_10yr_pct", "16 %");
    await expectCalculatedDecimal(page, "risk_10yr_pct_numeric", 16);
    await expectCalculatedString(page, "risk_category", "intermediate");
  });

  test("Test case 5 — 78 y/o female smoker, treated HTN (27 pts → ≥ 30 %)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "age", 78);
    await setNumber(page, "total_chol", 290);
    await setNumber(page, "hdl", 35);
    await setNumber(page, "sbp", 170);
    await selectChip(page, "treated_htn", HTN_YES);
    await selectChip(page, "smoker", SMOKER_YES);

    await expectCalculatedDecimal(page, "total_points", 27);
    await expectCalculatedString(page, "risk_10yr_pct", ">= 30 %");
    await expectCalculatedDecimal(page, "risk_10yr_pct_numeric", 30);
    await expectCalculatedString(page, "risk_category", "high");
  });
});
