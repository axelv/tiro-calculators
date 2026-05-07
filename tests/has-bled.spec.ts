import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "has-bled";

const H_NO = "No uncontrolled hypertension";
const H_YES = "Uncontrolled hypertension (SBP > 160)";
const AREN_NO = "Normal renal function";
const AREN_YES = "Abnormal renal function";
const ALIV_NO = "Normal liver function";
const ALIV_YES = "Abnormal liver function";
const S_NO = "No prior stroke";
const S_YES = "Prior stroke";
const B_NO = "No bleeding history";
const B_YES = "Bleeding history or predisposition";
const L_NO = "Stable INR or not on VKA";
const L_YES = "Labile INR";
const E_NO = "Age ≤ 65";
const E_YES = "Age > 65";
const DDRG_NO = "No bleeding-predisposing drugs";
const DDRG_YES = "Antiplatelets or NSAIDs";
const DALC_NO = "Alcohol < 8 drinks/week";
const DALC_YES = "Harmful alcohol use (≥ 8/week)";

const INTERP_LOW =
  "Low bleeding risk. Anticoagulation generally favorable; routine monitoring.";
const INTERP_MOD =
  "Moderate bleeding risk. Anticoagulation generally favorable; address modifiable factors.";
const INTERP_HIGH =
  "High bleeding risk. Caution and frequent review; aggressive correction of modifiable factors. Not by itself a contraindication to anticoagulation.";

test.describe("HAS-BLED — bleeding risk in AF", () => {
  test("Test case 1 — score 0 (low risk, all factors absent)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "H", H_NO);
    await selectChip(page, "A_renal", AREN_NO);
    await selectChip(page, "A_liver", ALIV_NO);
    await selectChip(page, "S", S_NO);
    await selectChip(page, "B", B_NO);
    await selectChip(page, "L", L_NO);
    await selectChip(page, "E", E_NO);
    await selectChip(page, "D_drugs", DDRG_NO);
    await selectChip(page, "D_alcohol", DALC_NO);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_per_100_py", "~1.13");
    await expectCalculatedString(page, "risk_category", "low");
    await expectCalculatedString(page, "interpretation", INTERP_LOW);
  });

  test("Test case 2 — score 2 (labile INR + elderly)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "H", H_NO);
    await selectChip(page, "A_renal", AREN_NO);
    await selectChip(page, "A_liver", ALIV_NO);
    await selectChip(page, "S", S_NO);
    await selectChip(page, "B", B_NO);
    await selectChip(page, "L", L_YES);
    await selectChip(page, "E", E_YES);
    await selectChip(page, "D_drugs", DDRG_NO);
    await selectChip(page, "D_alcohol", DALC_NO);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_per_100_py", "~1.88");
    await expectCalculatedString(page, "risk_category", "moderate");
    await expectCalculatedString(page, "interpretation", INTERP_MOD);
  });

  test("Test case 3 — score 3 (renal + stroke + elderly)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "H", H_NO);
    await selectChip(page, "A_renal", AREN_YES);
    await selectChip(page, "A_liver", ALIV_NO);
    await selectChip(page, "S", S_YES);
    await selectChip(page, "B", B_NO);
    await selectChip(page, "L", L_NO);
    await selectChip(page, "E", E_YES);
    await selectChip(page, "D_drugs", DDRG_NO);
    await selectChip(page, "D_alcohol", DALC_NO);

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedString(page, "risk_per_100_py", "~3.74");
    await expectCalculatedString(page, "risk_category", "high");
    await expectCalculatedString(page, "interpretation", INTERP_HIGH);
  });

  test("Test case 4 — score 5 (H, B, L, E, D_alcohol)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "H", H_YES);
    await selectChip(page, "A_renal", AREN_NO);
    await selectChip(page, "A_liver", ALIV_NO);
    await selectChip(page, "S", S_NO);
    await selectChip(page, "B", B_YES);
    await selectChip(page, "L", L_YES);
    await selectChip(page, "E", E_YES);
    await selectChip(page, "D_drugs", DDRG_NO);
    await selectChip(page, "D_alcohol", DALC_YES);

    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedString(page, "risk_per_100_py", "~12.50");
    await expectCalculatedString(page, "risk_category", "high");
    await expectCalculatedString(page, "interpretation", INTERP_HIGH);
  });

  test("Test case 5 — maximum score 9 (all factors present)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "H", H_YES);
    await selectChip(page, "A_renal", AREN_YES);
    await selectChip(page, "A_liver", ALIV_YES);
    await selectChip(page, "S", S_YES);
    await selectChip(page, "B", B_YES);
    await selectChip(page, "L", L_YES);
    await selectChip(page, "E", E_YES);
    await selectChip(page, "D_drugs", DDRG_YES);
    await selectChip(page, "D_alcohol", DALC_YES);

    await expectCalculatedDecimal(page, "score", 9);
    await expectCalculatedString(
      page,
      "risk_per_100_py",
      "data limited (very high)",
    );
    await expectCalculatedString(page, "risk_category", "very high");
    await expectCalculatedString(page, "interpretation", INTERP_HIGH);
  });
});
