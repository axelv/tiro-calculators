import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "hatch-score";

const LOW_INTERPRETATION =
  "Low likelihood of progression to persistent AF; rhythm-control strategies (including cardioversion) reasonable.";
const MODERATE_INTERPRETATION =
  "Intermediate progression risk; rhythm control still reasonable but counsel that recurrence is meaningfully possible.";
const HIGH_INTERPRETATION =
  "High progression risk; consider antiarrhythmic prophylaxis or early referral for catheter ablation.";
const VERY_HIGH_INTERPRETATION =
  "Very high progression risk (~50% within 1 year); weigh repeat cardioversions against early rate-control strategy.";

test.describe("HATCH score — De Vos 2010 (max 7)", () => {
  test("Test case 1 — score 0 (no risk factors)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hypertension", "No hypertension");
    await selectChip(page, "age_gt_75", "Age ≤ 75 years");
    await selectChip(page, "tia_or_stroke", "No prior TIA / stroke");
    await selectChip(page, "copd", "No COPD");
    await selectChip(page, "heart_failure", "No heart failure");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "progression_probability_percent", 6);
    await expectCalculatedString(page, "interpretation", LOW_INTERPRETATION);
  });

  test("Test case 2 — score 1 (hypertension only)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_gt_75", "Age ≤ 75 years");
    await selectChip(page, "tia_or_stroke", "No prior TIA / stroke");
    await selectChip(page, "copd", "No COPD");
    await selectChip(page, "heart_failure", "No heart failure");

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "progression_probability_percent", 7);
    await expectCalculatedString(page, "interpretation", LOW_INTERPRETATION);
  });

  test("Test case 3 — score 2 (hypertension + age >75)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_gt_75", "Age > 75 years");
    await selectChip(page, "tia_or_stroke", "No prior TIA / stroke");
    await selectChip(page, "copd", "No COPD");
    await selectChip(page, "heart_failure", "No heart failure");

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_band", "moderate");
    await expectCalculatedDecimal(page, "progression_probability_percent", 14);
    await expectCalculatedString(
      page,
      "interpretation",
      MODERATE_INTERPRETATION,
    );
  });

  test("Test case 4 — score 4 (HTN, COPD, HF)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_gt_75", "Age ≤ 75 years");
    await selectChip(page, "tia_or_stroke", "No prior TIA / stroke");
    await selectChip(page, "copd", "COPD");
    await selectChip(page, "heart_failure", "Heart failure");

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(page, "progression_probability_percent", 25);
    await expectCalculatedString(page, "interpretation", HIGH_INTERPRETATION);
  });

  test("Test case 5 — maximum score 7 (all risk factors)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_gt_75", "Age > 75 years");
    await selectChip(page, "tia_or_stroke", "Prior TIA / stroke");
    await selectChip(page, "copd", "COPD");
    await selectChip(page, "heart_failure", "Heart failure");

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedString(page, "risk_band", "very high");
    await expectCalculatedDecimal(page, "progression_probability_percent", 50);
    await expectCalculatedString(
      page,
      "interpretation",
      VERY_HIGH_INTERPRETATION,
    );
  });
});
