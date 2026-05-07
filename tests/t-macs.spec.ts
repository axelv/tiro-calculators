import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "t-macs";

/**
 * T-MACS — Playwright suite.
 *
 * Logistic model (Body 2017):
 *   p = 1 / (1 + exp(-(−4.766 + 1.713·E + 0.847·A + 0.607·R + 1.417·V
 *                       + 2.058·S + 1.208·H + 0.089·T)))
 *
 * Cut-points: p<0.02 very_low · 0.02–0.05 low · 0.05–0.95 moderate · ≥0.95 high.
 * Tolerance: 0.001 (probabilities specified to ~4 decimal places).
 */

// Display strings — must match the unique chip displays in the questionnaire.
const ECG_NO = "No ECG ischaemia";
const ECG_YES = "ECG ischaemia";
const ANG_NO = "No crescendo angina";
const ANG_YES = "Crescendo angina";
const RAD_NO = "No right-arm radiation";
const RAD_YES = "Right-arm radiation";
const VOM_NO = "No vomiting";
const VOM_YES = "Vomiting with pain";
const SWE_NO = "No diaphoresis";
const SWE_YES = "Diaphoresis observed";
const HYP_NO = "SBP ≥ 100 mmHg";
const HYP_YES = "SBP < 100 mmHg";

test.describe("T-MACS — Body 2017 logistic decision aid", () => {
  test("Test case 1 — Jana Bekker, very low risk (p ≈ 0.011)", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "hs_ctnt", 3);
    await selectChip(page, "ecg_ischaemia", ECG_NO);
    await selectChip(page, "worsening_angina", ANG_NO);
    await selectChip(page, "pain_radiates_right_arm", RAD_NO);
    await selectChip(page, "vomiting_with_pain", VOM_NO);
    await selectChip(page, "sweating_observed", SWE_NO);
    await selectChip(page, "sbp_lt_100", HYP_NO);

    await expectCalculatedDecimal(page, "linear_predictor", -4.499, 0.001);
    await expectCalculatedDecimal(page, "probability", 0.01099, 0.001);
    await expectCalculatedString(page, "risk_band", "very_low");
    await expectCalculatedString(
      page,
      "risk_band_label",
      "Very low risk — ACS effectively ruled out",
    );
  });

  test("Test case 2 — Adrian Costa, very low risk (p ≈ 0.017)", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "hs_ctnt", 8);
    await selectChip(page, "ecg_ischaemia", ECG_NO);
    await selectChip(page, "worsening_angina", ANG_NO);
    await selectChip(page, "pain_radiates_right_arm", RAD_NO);
    await selectChip(page, "vomiting_with_pain", VOM_NO);
    await selectChip(page, "sweating_observed", SWE_NO);
    await selectChip(page, "sbp_lt_100", HYP_NO);

    await expectCalculatedDecimal(page, "linear_predictor", -4.054, 0.001);
    await expectCalculatedDecimal(page, "probability", 0.01704, 0.001);
    await expectCalculatedString(page, "risk_band", "very_low");
    await expectCalculatedString(
      page,
      "risk_band_label",
      "Very low risk — ACS effectively ruled out",
    );
  });

  test("Test case 3 — Robert Kingsley, moderate risk (p ≈ 0.153)", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "hs_ctnt", 18);
    await selectChip(page, "ecg_ischaemia", ECG_NO);
    await selectChip(page, "worsening_angina", ANG_YES);
    await selectChip(page, "pain_radiates_right_arm", RAD_YES);
    await selectChip(page, "vomiting_with_pain", VOM_NO);
    await selectChip(page, "sweating_observed", SWE_NO);
    await selectChip(page, "sbp_lt_100", HYP_NO);

    await expectCalculatedDecimal(page, "linear_predictor", -1.71, 0.001);
    await expectCalculatedDecimal(page, "probability", 0.15316, 0.001);
    await expectCalculatedString(page, "risk_band", "moderate");
    await expectCalculatedString(
      page,
      "risk_band_label",
      "Moderate risk — observational zone (diagnostic uncertainty)",
    );
  });

  test("Test case 4 — Margaret O'Sullivan, high risk (p ≈ 0.99999)", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "hs_ctnt", 95);
    await selectChip(page, "ecg_ischaemia", ECG_YES);
    await selectChip(page, "worsening_angina", ANG_YES);
    await selectChip(page, "pain_radiates_right_arm", RAD_YES);
    await selectChip(page, "vomiting_with_pain", VOM_YES);
    await selectChip(page, "sweating_observed", SWE_YES);
    await selectChip(page, "sbp_lt_100", HYP_YES);

    await expectCalculatedDecimal(page, "linear_predictor", 11.539, 0.001);
    await expectCalculatedDecimal(page, "probability", 0.99999, 0.001);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedString(
      page,
      "risk_band_label",
      "High risk — ACS effectively ruled in",
    );
  });

  test("Test case 5 — Pieter Aldenberg, high risk on troponin alone (p ≈ 1.0)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "hs_ctnt", 250);
    await selectChip(page, "ecg_ischaemia", ECG_NO);
    await selectChip(page, "worsening_angina", ANG_NO);
    await selectChip(page, "pain_radiates_right_arm", RAD_NO);
    await selectChip(page, "vomiting_with_pain", VOM_NO);
    await selectChip(page, "sweating_observed", SWE_NO);
    await selectChip(page, "sbp_lt_100", HYP_NO);

    await expectCalculatedDecimal(page, "linear_predictor", 17.484, 0.001);
    await expectCalculatedDecimal(page, "probability", 1.0, 0.001);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedString(
      page,
      "risk_band_label",
      "High risk — ACS effectively ruled in",
    );
  });
});
