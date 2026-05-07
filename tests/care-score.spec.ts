import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "care-score";

const HISTORY_0 = "Slightly suspicious history";
const HISTORY_1 = "Moderately suspicious history";
const HISTORY_2 = "Highly suspicious history";

const ECG_0 = "Normal ECG";
const ECG_1 = "Non-specific repolarization disturbance";
const ECG_2 = "Significant ST-deviation";

const AGE_LT_45 = "< 45 years";
const AGE_45_64 = "45–64 years";
const AGE_GE_65 = "≥ 65 years";

const RF_0 = "No known risk factors";
const RF_1 = "1–2 risk factors";
const RF_2 = "≥ 3 risk factors or known atherosclerotic disease";

test.describe("CARE Score for ACS — troponin-free 4-component HEART subset", () => {
  test("Test case 1 — score 1, low risk (28F, history 1)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_1);
    await selectChip(page, "ecg", ECG_0);
    await selectChip(page, "age_band", AGE_LT_45);
    await selectChip(page, "risk_factors", RF_0);

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mace_6w_pct", 0.0);
    await expectCalculatedString(page, "disposition", "discharge_no_troponin");
  });

  test("Test case 2 — minimum score 0 (22M, all zero)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_0);
    await selectChip(page, "ecg", ECG_0);
    await selectChip(page, "age_band", AGE_LT_45);
    await selectChip(page, "risk_factors", RF_0);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mace_6w_pct", 0.0);
    await expectCalculatedString(page, "disposition", "discharge_no_troponin");
  });

  test("Test case 3 — score 4, not low (56M, mixed)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_1);
    await selectChip(page, "ecg", ECG_1);
    await selectChip(page, "age_band", AGE_45_64);
    await selectChip(page, "risk_factors", RF_1);

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedString(page, "risk_band", "not_low");
    await expectCalculatedString(page, "disposition", "proceed_to_full_workup");
  });

  test("Test case 4 — maximum score 8 (72F, prior PCI)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_2);
    await selectChip(page, "ecg", ECG_2);
    await selectChip(page, "age_band", AGE_GE_65);
    await selectChip(page, "risk_factors", RF_2);

    await expectCalculatedDecimal(page, "score", 8);
    await expectCalculatedString(page, "risk_band", "not_low");
    await expectCalculatedString(page, "disposition", "proceed_to_full_workup");
  });

  test("Test case 5 — borderline score 2 (47M, history 1, age 1)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_1);
    await selectChip(page, "ecg", ECG_0);
    await selectChip(page, "age_band", AGE_45_64);
    await selectChip(page, "risk_factors", RF_0);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_band", "not_low");
    await expectCalculatedString(page, "disposition", "proceed_to_full_workup");
  });
});
