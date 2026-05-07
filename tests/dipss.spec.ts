import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  getCalculated,
  openCalc,
  selectChip,
} from "./_helpers";
import { expect } from "@playwright/test";

const SLUG = "dipss";

const AGE_NO = "Age ≤ 65";
const AGE_YES = "Age > 65";
const CS_NO = "No constitutional symptoms";
const CS_YES = "Constitutional symptoms";
const HGB_NO = "Hgb ≥ 10 g/dL";
const HGB_YES = "Hgb < 10 g/dL";
const WBC_NO = "WBC ≤ 25 × 10⁹/L";
const WBC_YES = "WBC > 25 × 10⁹/L";
const BLASTS_NO = "Blasts < 1%";
const BLASTS_YES = "Blasts ≥ 1%";

test.describe("DIPSS — Dynamic International Prognostic Scoring System", () => {
  test("Test case 1 — score 0, Low risk (Not reached)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_gt_65", AGE_NO);
    await selectChip(page, "constitutional_symptoms", CS_NO);
    await selectChip(page, "hgb_lt_10", HGB_NO);
    await selectChip(page, "wbc_gt_25", WBC_NO);
    await selectChip(page, "blasts_ge_1", BLASTS_NO);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_group", "Low");
    await expectCalculatedString(page, "median_survival_label", "Not reached");

    // Low risk: median_survival_years should be empty / null
    const item = await getCalculated(page, "median_survival_years");
    const v = item?.answer?.[0];
    expect(v?.valueDecimal ?? v?.valueInteger ?? null).toBeNull();
  });

  test("Test case 2 — score 1, Intermediate-1 (14.2 years)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_gt_65", AGE_YES);
    await selectChip(page, "constitutional_symptoms", CS_NO);
    await selectChip(page, "hgb_lt_10", HGB_NO);
    await selectChip(page, "wbc_gt_25", WBC_NO);
    await selectChip(page, "blasts_ge_1", BLASTS_NO);

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_group", "Intermediate-1");
    await expectCalculatedDecimal(page, "median_survival_years", 14.2);
    await expectCalculatedString(page, "median_survival_label", "14.2 years");
  });

  test("Test case 3 — score 4, Intermediate-2 (4.0 years)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_gt_65", AGE_YES);
    await selectChip(page, "constitutional_symptoms", CS_NO);
    await selectChip(page, "hgb_lt_10", HGB_YES);
    await selectChip(page, "wbc_gt_25", WBC_YES);
    await selectChip(page, "blasts_ge_1", BLASTS_NO);

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedString(page, "risk_group", "Intermediate-2");
    await expectCalculatedDecimal(page, "median_survival_years", 4.0);
    await expectCalculatedString(page, "median_survival_label", "4.0 years");
  });

  test("Test case 4 — score 6 (max), High risk (1.5 years)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_gt_65", AGE_YES);
    await selectChip(page, "constitutional_symptoms", CS_YES);
    await selectChip(page, "hgb_lt_10", HGB_YES);
    await selectChip(page, "wbc_gt_25", WBC_YES);
    await selectChip(page, "blasts_ge_1", BLASTS_YES);

    await expectCalculatedDecimal(page, "score", 6);
    await expectCalculatedString(page, "risk_group", "High");
    await expectCalculatedDecimal(page, "median_survival_years", 1.5);
    await expectCalculatedString(page, "median_survival_label", "1.5 years");
  });

  test("Test case 5 — score 2 via Hgb alone, Intermediate-1 (edge case)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_gt_65", AGE_NO);
    await selectChip(page, "constitutional_symptoms", CS_NO);
    await selectChip(page, "hgb_lt_10", HGB_YES);
    await selectChip(page, "wbc_gt_25", WBC_NO);
    await selectChip(page, "blasts_ge_1", BLASTS_NO);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_group", "Intermediate-1");
    await expectCalculatedDecimal(page, "median_survival_years", 14.2);
    await expectCalculatedString(page, "median_survival_label", "14.2 years");
  });
});
