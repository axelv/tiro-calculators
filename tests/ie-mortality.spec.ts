import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "ie-mortality";

// Age chip displays
const AGE_LE_45 = "≤ 45 years";
const AGE_46_60 = "46–60 years";
const AGE_61_70 = "61–70 years";
const AGE_GT_70 = "> 70 years";

// Dialysis
const DIALYSIS_NO = "No dialysis history";
const DIALYSIS_YES = "On / history of dialysis";

// Nosocomial
const ACQ_COMMUNITY = "Community-acquired";
const ACQ_NOSO = "Nosocomial / healthcare-associated";

// Valve type
const VALVE_NVE = "Native valve (NVE)";
const VALVE_PVE = "Prosthetic valve (PVE)";
const VALVE_DEVICE = "Cardiac device-related";

// Symptoms duration
const SYMP_ACUTE = "Acute presentation (≤ 1 month)";
const SYMP_SUBACUTE = "Subacute (> 1 month symptoms)";

// Pathogen
const PATH_S_AUREUS = "Staphylococcus aureus";
const PATH_VGS = "Viridans group streptococci";
const PATH_FUNGAL = "Fungal";
const PATH_OTHER = "Other / culture-negative";

// Aortic
const AO_NO = "No aortic vegetation";
const AO_YES = "Aortic vegetation";

// Mitral
const MI_NO = "No mitral vegetation";
const MI_YES = "Mitral vegetation";

// NYHA
const HF_NO = "No NYHA III/IV HF";
const HF_YES = "NYHA III/IV heart failure";

// Stroke
const STROKE_NO = "No stroke";
const STROKE_YES = "Stroke present";

// Paravalvular
const PV_NO = "No paravalvular complication";
const PV_YES = "Paravalvular complication";

// Bacteremia
const BACT_NO = "No persistent bacteremia";
const BACT_YES = "Persistent bacteremia";

// Surgery
const SURG_NO = "No surgery";
const SURG_YES = "Surgery undertaken";

test.describe("IE 6-month mortality risk score (Park / ICE-PCS)", () => {
  test("Test case 1 — VGS NVE, score = -2, p ≈ 0.0001", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LE_45);
    await selectChip(page, "history_of_dialysis", DIALYSIS_NO);
    await selectChip(page, "nosocomial", ACQ_COMMUNITY);
    await selectChip(page, "valve_type", VALVE_NVE);
    await selectChip(page, "symptoms_gt_1_month", SYMP_SUBACUTE);
    await selectChip(page, "pathogen", PATH_VGS);
    await selectChip(page, "aortic_vegetation", AO_YES);
    await selectChip(page, "mitral_vegetation", MI_NO);
    await selectChip(page, "nyha_3_or_4_heart_failure", HF_NO);
    await selectChip(page, "stroke", STROKE_NO);
    await selectChip(page, "paravalvular_complication", PV_NO);
    await selectChip(page, "persistent_bacteremia", BACT_NO);
    await selectChip(page, "surgical_treatment", SURG_NO);

    await expectCalculatedDecimal(page, "score", -2);
    await expectCalculatedDecimal(page, "probability_6mo_mortality", 0.0001, 1e-3);
    await expectCalculatedString(
      page,
      "risk_band",
      "Below Quintile 1 (very low)",
    );
    await expectCalculatedDecimal(page, "risk_band_observed_pct", 10.3, 0.05);
  });

  test("Test case 2 — score 2 (Q1), p ≈ 0.603", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_46_60);
    await selectChip(page, "history_of_dialysis", DIALYSIS_NO);
    await selectChip(page, "nosocomial", ACQ_COMMUNITY);
    await selectChip(page, "valve_type", VALVE_NVE);
    await selectChip(page, "symptoms_gt_1_month", SYMP_SUBACUTE);
    await selectChip(page, "pathogen", PATH_OTHER);
    await selectChip(page, "aortic_vegetation", AO_NO);
    await selectChip(page, "mitral_vegetation", MI_YES);
    await selectChip(page, "nyha_3_or_4_heart_failure", HF_NO);
    await selectChip(page, "stroke", STROKE_NO);
    await selectChip(page, "paravalvular_complication", PV_NO);
    await selectChip(page, "persistent_bacteremia", BACT_NO);
    await selectChip(page, "surgical_treatment", SURG_NO);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedDecimal(page, "probability_6mo_mortality", 0.603, 1e-3);
    await expectCalculatedString(
      page,
      "risk_band",
      "Quintile 1 (score 0-6): observed 10.3% 6-month mortality",
    );
    await expectCalculatedDecimal(page, "risk_band_observed_pct", 10.3, 0.05);
  });

  test("Test case 3 — score 10 (Q3), p saturates ≈ 1.0", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_61_70);
    await selectChip(page, "history_of_dialysis", DIALYSIS_NO);
    await selectChip(page, "nosocomial", ACQ_NOSO);
    await selectChip(page, "valve_type", VALVE_PVE);
    await selectChip(page, "symptoms_gt_1_month", SYMP_ACUTE);
    await selectChip(page, "pathogen", PATH_S_AUREUS);
    await selectChip(page, "aortic_vegetation", AO_YES);
    await selectChip(page, "mitral_vegetation", MI_NO);
    await selectChip(page, "nyha_3_or_4_heart_failure", HF_NO);
    await selectChip(page, "stroke", STROKE_NO);
    await selectChip(page, "paravalvular_complication", PV_YES);
    await selectChip(page, "persistent_bacteremia", BACT_NO);
    await selectChip(page, "surgical_treatment", SURG_NO);

    await expectCalculatedDecimal(page, "score", 10);
    await expectCalculatedDecimal(page, "probability_6mo_mortality", 1.0, 1e-3);
    await expectCalculatedString(
      page,
      "risk_band",
      "Quintile 3 (score 9-10): observed 25.5% 6-month mortality",
    );
    await expectCalculatedDecimal(page, "risk_band_observed_pct", 25.5, 0.05);
  });

  test("Test case 4 — score 14 (Q4), surgery applied, p ≈ 1.0", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GT_70);
    await selectChip(page, "history_of_dialysis", DIALYSIS_YES);
    await selectChip(page, "nosocomial", ACQ_NOSO);
    await selectChip(page, "valve_type", VALVE_NVE);
    await selectChip(page, "symptoms_gt_1_month", SYMP_ACUTE);
    await selectChip(page, "pathogen", PATH_S_AUREUS);
    await selectChip(page, "aortic_vegetation", AO_NO);
    await selectChip(page, "mitral_vegetation", MI_YES);
    await selectChip(page, "nyha_3_or_4_heart_failure", HF_YES);
    await selectChip(page, "stroke", STROKE_YES);
    await selectChip(page, "paravalvular_complication", PV_NO);
    await selectChip(page, "persistent_bacteremia", BACT_NO);
    await selectChip(page, "surgical_treatment", SURG_YES);

    await expectCalculatedDecimal(page, "score", 14);
    await expectCalculatedDecimal(page, "probability_6mo_mortality", 1.0, 1e-3);
    await expectCalculatedString(
      page,
      "risk_band",
      "Quintile 4 (score 11-16): observed 37.8% 6-month mortality",
    );
    await expectCalculatedDecimal(page, "risk_band_observed_pct", 37.8, 0.05);
  });

  test("Test case 5 — maximum score 22 (Q5), p ≈ 1.0", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GT_70);
    await selectChip(page, "history_of_dialysis", DIALYSIS_YES);
    await selectChip(page, "nosocomial", ACQ_NOSO);
    await selectChip(page, "valve_type", VALVE_PVE);
    await selectChip(page, "symptoms_gt_1_month", SYMP_ACUTE);
    await selectChip(page, "pathogen", PATH_S_AUREUS);
    await selectChip(page, "aortic_vegetation", AO_YES);
    await selectChip(page, "mitral_vegetation", MI_YES);
    await selectChip(page, "nyha_3_or_4_heart_failure", HF_YES);
    await selectChip(page, "stroke", STROKE_YES);
    await selectChip(page, "paravalvular_complication", PV_YES);
    await selectChip(page, "persistent_bacteremia", BACT_YES);
    await selectChip(page, "surgical_treatment", SURG_NO);

    await expectCalculatedDecimal(page, "score", 22);
    await expectCalculatedDecimal(page, "probability_6mo_mortality", 1.0, 1e-3);
    await expectCalculatedString(
      page,
      "risk_band",
      "Quintile 5 (score 17-22): observed 52.9% 6-month mortality",
    );
    await expectCalculatedDecimal(page, "risk_band_observed_pct", 52.9, 0.05);
  });
});
