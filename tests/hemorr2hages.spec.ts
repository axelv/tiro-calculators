import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "hemorr2hages";

const INTERP_0 =
  "Bleeding risk is low. Anticoagulation generally favourable when stroke risk warrants it.";
const INTERP_1 = "Bleeding risk remains low; standard monitoring.";
const INTERP_3 =
  "Substantial bleeding risk. Optimise modifiable factors; consider closer INR/anticoagulation monitoring.";
const INTERP_4 =
  "High bleeding risk. Re-evaluate net clinical benefit; intensify mitigation; consider alternatives (e.g., DOAC where appropriate, LAA occlusion in selected patients).";
const INTERP_VERY_HIGH =
  "Very high bleeding risk. Multidisciplinary review; weigh against stroke risk; mitigate every reversible factor.";

test.describe("HEMORR₂HAGES — major bleeding risk (range 0–12)", () => {
  test("Test case 1 — score 0, no risk factors", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hepatic_or_renal", "No hepatic or renal disease");
    await selectChip(page, "ethanol_abuse", "No ethanol abuse");
    await selectChip(page, "malignancy", "No malignancy");
    await selectChip(page, "age_over_75", "Age ≤ 75 years");
    await selectChip(page, "reduced_platelets", "Normal platelet count and function");
    await selectChip(page, "rebleeding_risk", "No prior major bleed");
    await selectChip(page, "uncontrolled_hypertension", "Controlled blood pressure");
    await selectChip(page, "anemia", "No anaemia");
    await selectChip(page, "genetic_cyp2c9", "No CYP2C9 variant");
    await selectChip(page, "excessive_fall_risk", "No excessive fall risk");
    await selectChip(page, "stroke_history", "No prior stroke or TIA");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedDecimal(page, "bleeds_per_100_patient_years", 1.9);
    await expectCalculatedString(page, "risk_category", "Low");
    await expectCalculatedString(page, "interpretation", INTERP_0);
  });

  test("Test case 2 — score 1, anaemia only", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hepatic_or_renal", "No hepatic or renal disease");
    await selectChip(page, "ethanol_abuse", "No ethanol abuse");
    await selectChip(page, "malignancy", "No malignancy");
    await selectChip(page, "age_over_75", "Age ≤ 75 years");
    await selectChip(page, "reduced_platelets", "Normal platelet count and function");
    await selectChip(page, "rebleeding_risk", "No prior major bleed");
    await selectChip(page, "uncontrolled_hypertension", "Controlled blood pressure");
    await selectChip(page, "anemia", "Anaemia");
    await selectChip(page, "genetic_cyp2c9", "No CYP2C9 variant");
    await selectChip(page, "excessive_fall_risk", "No excessive fall risk");
    await selectChip(page, "stroke_history", "No prior stroke or TIA");

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedDecimal(page, "bleeds_per_100_patient_years", 2.5);
    await expectCalculatedString(page, "risk_category", "Low");
    await expectCalculatedString(page, "interpretation", INTERP_1);
  });

  test("Test case 3 — score 3 (age > 75, antiplatelet, fall risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hepatic_or_renal", "No hepatic or renal disease");
    await selectChip(page, "ethanol_abuse", "No ethanol abuse");
    await selectChip(page, "malignancy", "No malignancy");
    await selectChip(page, "age_over_75", "Age > 75 years");
    await selectChip(page, "reduced_platelets", "Reduced platelet count or function");
    await selectChip(page, "rebleeding_risk", "No prior major bleed");
    await selectChip(page, "uncontrolled_hypertension", "Controlled blood pressure");
    await selectChip(page, "anemia", "No anaemia");
    await selectChip(page, "genetic_cyp2c9", "No CYP2C9 variant");
    await selectChip(page, "excessive_fall_risk", "Excessive fall risk");
    await selectChip(page, "stroke_history", "No prior stroke or TIA");

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedDecimal(page, "bleeds_per_100_patient_years", 8.4);
    await expectCalculatedString(page, "risk_category", "Intermediate-high");
    await expectCalculatedString(page, "interpretation", INTERP_3);
  });

  test("Test case 4 — score 4 (age > 75, prior GI bleed, prior TIA)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hepatic_or_renal", "No hepatic or renal disease");
    await selectChip(page, "ethanol_abuse", "No ethanol abuse");
    await selectChip(page, "malignancy", "No malignancy");
    await selectChip(page, "age_over_75", "Age > 75 years");
    await selectChip(page, "reduced_platelets", "Normal platelet count and function");
    await selectChip(page, "rebleeding_risk", "Prior major bleed (rebleeding risk)");
    await selectChip(page, "uncontrolled_hypertension", "Controlled blood pressure");
    await selectChip(page, "anemia", "No anaemia");
    await selectChip(page, "genetic_cyp2c9", "No CYP2C9 variant");
    await selectChip(page, "excessive_fall_risk", "No excessive fall risk");
    await selectChip(page, "stroke_history", "Prior stroke or TIA");

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedDecimal(page, "bleeds_per_100_patient_years", 10.4);
    await expectCalculatedString(page, "risk_category", "High");
    await expectCalculatedString(page, "interpretation", INTERP_4);
  });

  test("Test case 5 — maximum score 12 (all eleven components positive)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "hepatic_or_renal", "Hepatic or renal disease");
    await selectChip(page, "ethanol_abuse", "Ethanol abuse");
    await selectChip(page, "malignancy", "Malignancy");
    await selectChip(page, "age_over_75", "Age > 75 years");
    await selectChip(page, "reduced_platelets", "Reduced platelet count or function");
    await selectChip(page, "rebleeding_risk", "Prior major bleed (rebleeding risk)");
    await selectChip(page, "uncontrolled_hypertension", "Uncontrolled hypertension (SBP > 160)");
    await selectChip(page, "anemia", "Anaemia");
    await selectChip(page, "genetic_cyp2c9", "CYP2C9*2 or CYP2C9*3 variant");
    await selectChip(page, "excessive_fall_risk", "Excessive fall risk");
    await selectChip(page, "stroke_history", "Prior stroke or TIA");

    await expectCalculatedDecimal(page, "score", 12);
    await expectCalculatedDecimal(page, "bleeds_per_100_patient_years", 12.3);
    await expectCalculatedString(page, "risk_category", "Very high");
    await expectCalculatedString(page, "interpretation", INTERP_VERY_HIGH);
  });
});
