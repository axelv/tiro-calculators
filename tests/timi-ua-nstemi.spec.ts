import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "timi-ua-nstemi";

const AGE_NO = "Age < 65";
const AGE_YES = "Age ≥ 65";
const RF_NO = "< 3 CAD risk factors";
const RF_YES = "≥ 3 CAD risk factors";
const CAD_NO = "No known CAD ≥ 50%";
const CAD_YES = "Known CAD ≥ 50%";
const ASA_NO = "No aspirin in past 7 d";
const ASA_YES = "Aspirin in past 7 d";
const ANG_NO = "< 2 anginal episodes / 24 h";
const ANG_YES = "≥ 2 anginal episodes / 24 h";
const ST_NO = "No ST deviation ≥ 0.5 mm";
const ST_YES = "ST deviation ≥ 0.5 mm";
const MARKER_NO = "Cardiac marker negative";
const MARKER_YES = "Cardiac marker positive";

test.describe("TIMI Risk Score for UA / NSTEMI", () => {
  test("Test case 1 — score 0 (lowest risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_65", AGE_NO);
    await selectChip(page, "cad_risk_factors_ge_3", RF_NO);
    await selectChip(page, "known_cad_stenosis_ge_50", CAD_NO);
    await selectChip(page, "asa_use_past_7d", ASA_NO);
    await selectChip(page, "severe_angina_ge_2_in_24h", ANG_NO);
    await selectChip(page, "st_deviation_ge_0_5mm", ST_NO);
    await selectChip(page, "cardiac_marker_positive", MARKER_NO);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedDecimal(page, "composite_14d_risk_percent", 4.7);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 2 — score 2 (low)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_65", AGE_NO);
    await selectChip(page, "cad_risk_factors_ge_3", RF_NO);
    await selectChip(page, "known_cad_stenosis_ge_50", CAD_NO);
    await selectChip(page, "asa_use_past_7d", ASA_YES);
    await selectChip(page, "severe_angina_ge_2_in_24h", ANG_YES);
    await selectChip(page, "st_deviation_ge_0_5mm", ST_NO);
    await selectChip(page, "cardiac_marker_positive", MARKER_NO);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedDecimal(page, "composite_14d_risk_percent", 8.3);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 3 — score 4 (intermediate)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_65", AGE_YES);
    await selectChip(page, "cad_risk_factors_ge_3", RF_YES);
    await selectChip(page, "known_cad_stenosis_ge_50", CAD_NO);
    await selectChip(page, "asa_use_past_7d", ASA_NO);
    await selectChip(page, "severe_angina_ge_2_in_24h", ANG_YES);
    await selectChip(page, "st_deviation_ge_0_5mm", ST_NO);
    await selectChip(page, "cardiac_marker_positive", MARKER_YES);

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedDecimal(page, "composite_14d_risk_percent", 19.9);
    await expectCalculatedString(page, "risk_band", "intermediate");
  });

  test("Test case 4 — score 6 (high)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_65", AGE_YES);
    await selectChip(page, "cad_risk_factors_ge_3", RF_YES);
    await selectChip(page, "known_cad_stenosis_ge_50", CAD_YES);
    await selectChip(page, "asa_use_past_7d", ASA_YES);
    await selectChip(page, "severe_angina_ge_2_in_24h", ANG_YES);
    await selectChip(page, "st_deviation_ge_0_5mm", ST_YES);
    await selectChip(page, "cardiac_marker_positive", MARKER_NO);

    await expectCalculatedDecimal(page, "score", 6);
    await expectCalculatedDecimal(page, "composite_14d_risk_percent", 40.9);
    await expectCalculatedString(page, "risk_band", "high");
  });

  test("Test case 5 — score 7 (maximum)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_65", AGE_YES);
    await selectChip(page, "cad_risk_factors_ge_3", RF_YES);
    await selectChip(page, "known_cad_stenosis_ge_50", CAD_YES);
    await selectChip(page, "asa_use_past_7d", ASA_YES);
    await selectChip(page, "severe_angina_ge_2_in_24h", ANG_YES);
    await selectChip(page, "st_deviation_ge_0_5mm", ST_YES);
    await selectChip(page, "cardiac_marker_positive", MARKER_YES);

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedDecimal(page, "composite_14d_risk_percent", 40.9);
    await expectCalculatedString(page, "risk_band", "high");
  });
});
