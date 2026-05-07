import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "heart-score";

const HISTORY_SLIGHT = "Slightly suspicious history";
const HISTORY_MODERATE = "Moderately suspicious history";
const HISTORY_HIGH = "Highly suspicious history";

const ECG_NORMAL = "Normal ECG";
const ECG_NONSPECIFIC = "Non-specific repolarization disturbance";
const ECG_ST_DEVIATION = "Significant ST-deviation";

const AGE_LT_45 = "< 45 years";
const AGE_45_64 = "45–64 years";
const AGE_GE_65 = "≥ 65 years";

const RF_NONE = "No known risk factors";
const RF_1_2 = "1–2 risk factors";
const RF_GE_3_OR_ATHERO = "≥ 3 risk factors or history of atherosclerotic disease";

const TROP_LE_1X = "≤ normal limit";
const TROP_1_3X = "1–3× normal limit";
const TROP_GT_3X = "> 3× normal limit";

test.describe("HEART Score for Major Cardiac Events", () => {
  test("Test case 1 — score 1 (low, discharge)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_SLIGHT);
    await selectChip(page, "ecg", ECG_NORMAL);
    await selectChip(page, "age", AGE_LT_45);
    await selectChip(page, "risk_factors", RF_1_2);
    await selectChip(page, "troponin", TROP_LE_1X);

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mace_6w_pct", 1.7, 0.05);
    await expectCalculatedString(page, "disposition", "discharge");
  });

  test("Test case 2 — score 3 (top of low band, discharge)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_MODERATE);
    await selectChip(page, "ecg", ECG_NORMAL);
    await selectChip(page, "age", AGE_LT_45);
    await selectChip(page, "risk_factors", RF_1_2);
    await selectChip(page, "troponin", TROP_1_3X);

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mace_6w_pct", 1.7, 0.05);
    await expectCalculatedString(page, "disposition", "discharge");
  });

  test("Test case 3 — score 5 (moderate, admit/observe)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_MODERATE);
    await selectChip(page, "ecg", ECG_NONSPECIFIC);
    await selectChip(page, "age", AGE_45_64);
    await selectChip(page, "risk_factors", RF_GE_3_OR_ATHERO);
    await selectChip(page, "troponin", TROP_LE_1X);

    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedString(page, "risk_band", "moderate");
    await expectCalculatedDecimal(page, "mace_6w_pct", 16.6, 0.05);
    await expectCalculatedString(page, "disposition", "admit_observe");
  });

  test("Test case 4 — score 8 (high, early invasive)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_HIGH);
    await selectChip(page, "ecg", ECG_NONSPECIFIC);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "risk_factors", RF_GE_3_OR_ATHERO);
    await selectChip(page, "troponin", TROP_1_3X);

    await expectCalculatedDecimal(page, "score", 8);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(page, "mace_6w_pct", 50.1, 0.05);
    await expectCalculatedString(page, "disposition", "early_invasive");
  });

  test("Test case 5 — score 10 (max, high, early invasive)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "history", HISTORY_HIGH);
    await selectChip(page, "ecg", ECG_ST_DEVIATION);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "risk_factors", RF_GE_3_OR_ATHERO);
    await selectChip(page, "troponin", TROP_GT_3X);

    await expectCalculatedDecimal(page, "score", 10);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(page, "mace_6w_pct", 50.1, 0.05);
    await expectCalculatedString(page, "disposition", "early_invasive");
  });
});
