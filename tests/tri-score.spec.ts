import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "tri-score";

test.describe("TRI-SCORE — In-hospital mortality after isolated tricuspid valve surgery", () => {
  test("Test case 1 — Annelies Vermeulen, score 0 (low risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_70", "Age < 70");
    await selectChip(page, "nyha_class_iii_iv", "NYHA I–II");
    await selectChip(page, "right_heart_failure_signs", "No RHF signs");
    await selectChip(page, "daily_furosemide_ge_125_mg", "Furosemide < 125 mg/day");
    await selectChip(page, "gfr_lt_30", "eGFR ≥ 30");
    await selectChip(page, "bilirubin_elevated", "Bilirubin normal");
    await selectChip(page, "lvef_lt_60", "LVEF ≥ 60 %");
    await selectChip(page, "rv_dysfunction_mod_severe", "RV function normal/mild");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedDecimal(page, "predicted_inhospital_mortality_pct", 1);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 2 — Rashid Patel, score 3 (low risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_70", "Age < 70");
    await selectChip(page, "nyha_class_iii_iv", "NYHA III–IV");
    await selectChip(page, "right_heart_failure_signs", "No RHF signs");
    await selectChip(page, "daily_furosemide_ge_125_mg", "Furosemide < 125 mg/day");
    await selectChip(page, "gfr_lt_30", "eGFR ≥ 30");
    await selectChip(page, "bilirubin_elevated", "Bilirubin normal");
    await selectChip(page, "lvef_lt_60", "LVEF < 60 %");
    await selectChip(page, "rv_dysfunction_mod_severe", "RV dysfunction mod/severe");

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedDecimal(page, "predicted_inhospital_mortality_pct", 5);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 3 — Margarethe Schulz, score 5 (intermediate risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_70", "Age ≥ 70");
    await selectChip(page, "nyha_class_iii_iv", "NYHA III–IV");
    await selectChip(page, "right_heart_failure_signs", "No RHF signs");
    await selectChip(page, "daily_furosemide_ge_125_mg", "Furosemide ≥ 125 mg/day");
    await selectChip(page, "gfr_lt_30", "eGFR ≥ 30");
    await selectChip(page, "bilirubin_elevated", "Bilirubin normal");
    await selectChip(page, "lvef_lt_60", "LVEF < 60 %");
    await selectChip(page, "rv_dysfunction_mod_severe", "RV function normal/mild");

    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedDecimal(page, "predicted_inhospital_mortality_pct", 14);
    await expectCalculatedString(page, "risk_band", "intermediate");
  });

  test("Test case 4 — Joseph Whitfield, score 7 (high risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_70", "Age ≥ 70");
    await selectChip(page, "nyha_class_iii_iv", "NYHA III–IV");
    await selectChip(page, "right_heart_failure_signs", "RHF signs present");
    await selectChip(page, "daily_furosemide_ge_125_mg", "Furosemide ≥ 125 mg/day");
    await selectChip(page, "gfr_lt_30", "eGFR ≥ 30");
    await selectChip(page, "bilirubin_elevated", "Bilirubin normal");
    await selectChip(page, "lvef_lt_60", "LVEF < 60 %");
    await selectChip(page, "rv_dysfunction_mod_severe", "RV function normal/mild");

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedDecimal(page, "predicted_inhospital_mortality_pct", 34);
    await expectCalculatedString(page, "risk_band", "high");
  });

  test("Test case 5 — Edith Lambourne, maximum score 12 (high risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_ge_70", "Age ≥ 70");
    await selectChip(page, "nyha_class_iii_iv", "NYHA III–IV");
    await selectChip(page, "right_heart_failure_signs", "RHF signs present");
    await selectChip(page, "daily_furosemide_ge_125_mg", "Furosemide ≥ 125 mg/day");
    await selectChip(page, "gfr_lt_30", "eGFR < 30 or dialysis");
    await selectChip(page, "bilirubin_elevated", "Bilirubin elevated");
    await selectChip(page, "lvef_lt_60", "LVEF < 60 %");
    await selectChip(page, "rv_dysfunction_mod_severe", "RV dysfunction mod/severe");

    await expectCalculatedDecimal(page, "score", 12);
    await expectCalculatedDecimal(page, "predicted_inhospital_mortality_pct", 65);
    await expectCalculatedString(page, "risk_band", "high");
  });
});
