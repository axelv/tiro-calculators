import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "seattle-heart-failure";

/**
 * Seattle Heart Failure Model — Playwright suite.
 *
 * Implements the SPEC §3.3 closed-form parametric survival
 *   S(t) = exp(-λ · t · exp(LP)),  λ = 0.0405/year
 * with mean-life-expectancy = 1 / (λ · exp(LP)) (closed-form integral).
 *
 * Per FHIRPATH.md "Worked example" note, the closed-form survivals are
 * systematically higher than the clinical-illustrative numbers in
 * TEST_CASES.md (which were derived from the official MDCalc/Excel tool
 * with discrete-step integration and additional anchoring). The expected
 * values below are computed from the SPEC formula directly.
 *
 * Expected values per test case (SPEC formula):
 *   TC1 (low-risk):           s1=0.9866 s2=0.9735 s3=0.9605 s5=0.9350 mle=74.38
 *   TC2 (intermediate):       s1=0.9058 s2=0.8205 s3=0.7432 s5=0.6098 mle=10.11
 *   TC3 (high-risk CRT-D):    s1=0.2642 s2=0.0698 s3=0.0184 s5=0.0013 mle=0.75
 *   TC4 (mid, minimal Rx):    s1=0.9440 s2=0.8912 s3=0.8413 s5=0.7497 mle=17.36
 *   TC5 (max severity):       s1=0.0503 s2=0.0025 s3=~0 s5=~0       mle=0.33
 *
 * Tolerance: 0.01 (probabilities), 0.5 (mean LE in years).
 */

const SEX_MALE = "Male";
const SEX_FEMALE = "Female";

const ISCHEMIC_NO = "Non-ischemic etiology";
const ISCHEMIC_YES = "Ischemic etiology";

const NYHA_I = "NYHA I";
const NYHA_II = "NYHA II";
const NYHA_III = "NYHA III";
const NYHA_IV = "NYHA IV";

const ACEI_NO = "No ACE inhibitor";
const ACEI_YES = "On ACE inhibitor";

const ARB_NO = "No ARB";
const ARB_YES = "On ARB";

const BB_NO = "No beta-blocker";
const BB_YES = "On beta-blocker";

const STATIN_NO = "No statin";
const STATIN_YES = "On statin";

const ALLOP_NO = "No allopurinol";
const ALLOP_YES = "On allopurinol";

const KSPARING_NO = "No K-sparing diuretic";
const KSPARING_YES = "On K-sparing diuretic";

const DEV_NONE = "No device";
const DEV_CRTP = "Biventricular pacer (CRT-P)";
const DEV_ICD = "ICD";
const DEV_CRTD = "Biventricular ICD (CRT-D)";

const PROB_TOL = 0.01;
const MLE_TOL = 0.5;

test.describe("Seattle Heart Failure Model", () => {
  test("Test case 1 — low risk, well-treated NYHA II HFrEF (58 y M, non-ischemic)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 58);
    await selectChip(page, "sex", SEX_MALE);
    await selectChip(page, "ischemic_etiology", ISCHEMIC_NO);
    await selectChip(page, "nyha_class", NYHA_II);
    await setNumber(page, "weight_kg", 78);
    await setNumber(page, "ejection_fraction", 35);
    await setNumber(page, "systolic_bp", 124);
    await setNumber(page, "sodium", 140);
    await setNumber(page, "hemoglobin", 14.5);
    await setNumber(page, "lymphocytes_pct", 28);
    await setNumber(page, "uric_acid", 5.5);
    await setNumber(page, "total_cholesterol", 195);
    await setNumber(page, "furosemide_dose", 20);
    await setNumber(page, "torsemide_dose", 0);
    await setNumber(page, "bumetanide_dose", 0);
    await setNumber(page, "metolazone_dose", 0);
    await setNumber(page, "hctz_dose", 0);
    await selectChip(page, "ace_inhibitor", ACEI_YES);
    await selectChip(page, "arb", ARB_NO);
    await selectChip(page, "beta_blocker", BB_YES);
    await selectChip(page, "statin", STATIN_YES);
    await selectChip(page, "allopurinol", ALLOP_NO);
    await selectChip(page, "k_sparing", KSPARING_YES);
    await selectChip(page, "device", DEV_NONE);

    await expectCalculatedDecimal(page, "survival_1y", 0.9866, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_2y", 0.9735, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_3y", 0.9605, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_5y", 0.9350, PROB_TOL);
    await expectCalculatedDecimal(page, "mean_life_expectancy", 74.38, 1.0);
  });

  test("Test case 2 — intermediate risk, NYHA III ischemic, partial therapy (67 y M)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 67);
    await selectChip(page, "sex", SEX_MALE);
    await selectChip(page, "ischemic_etiology", ISCHEMIC_YES);
    await selectChip(page, "nyha_class", NYHA_III);
    await setNumber(page, "weight_kg", 84);
    await setNumber(page, "ejection_fraction", 28);
    await setNumber(page, "systolic_bp", 112);
    await setNumber(page, "sodium", 137);
    await setNumber(page, "hemoglobin", 12.5);
    await setNumber(page, "lymphocytes_pct", 22);
    await setNumber(page, "uric_acid", 7.8);
    await setNumber(page, "total_cholesterol", 165);
    await setNumber(page, "furosemide_dose", 40);
    await setNumber(page, "torsemide_dose", 0);
    await setNumber(page, "bumetanide_dose", 0);
    await setNumber(page, "metolazone_dose", 0);
    await setNumber(page, "hctz_dose", 0);
    await selectChip(page, "ace_inhibitor", ACEI_YES);
    await selectChip(page, "arb", ARB_NO);
    await selectChip(page, "beta_blocker", BB_YES);
    await selectChip(page, "statin", STATIN_YES);
    await selectChip(page, "allopurinol", ALLOP_NO);
    await selectChip(page, "k_sparing", KSPARING_NO);
    await selectChip(page, "device", DEV_NONE);

    await expectCalculatedDecimal(page, "survival_1y", 0.9058, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_2y", 0.8205, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_3y", 0.7432, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_5y", 0.6098, PROB_TOL);
    await expectCalculatedDecimal(page, "mean_life_expectancy", 10.11, MLE_TOL);
  });

  test("Test case 3 — high risk, NYHA IV ischemic with CRT-D (74 y F)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 74);
    await selectChip(page, "sex", SEX_FEMALE);
    await selectChip(page, "ischemic_etiology", ISCHEMIC_YES);
    await selectChip(page, "nyha_class", NYHA_IV);
    await setNumber(page, "weight_kg", 62);
    await setNumber(page, "ejection_fraction", 18);
    await setNumber(page, "systolic_bp", 92);
    await setNumber(page, "sodium", 130);
    await setNumber(page, "hemoglobin", 10.8);
    await setNumber(page, "lymphocytes_pct", 14);
    await setNumber(page, "uric_acid", 11.2);
    await setNumber(page, "total_cholesterol", 132);
    await setNumber(page, "furosemide_dose", 160);
    await setNumber(page, "torsemide_dose", 0);
    await setNumber(page, "bumetanide_dose", 0);
    await setNumber(page, "metolazone_dose", 5);
    await setNumber(page, "hctz_dose", 0);
    await selectChip(page, "ace_inhibitor", ACEI_YES);
    await selectChip(page, "arb", ARB_NO);
    await selectChip(page, "beta_blocker", BB_YES);
    await selectChip(page, "statin", STATIN_YES);
    await selectChip(page, "allopurinol", ALLOP_YES);
    await selectChip(page, "k_sparing", KSPARING_YES);
    await selectChip(page, "device", DEV_CRTD);

    await expectCalculatedDecimal(page, "survival_1y", 0.2642, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_2y", 0.0698, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_3y", 0.0184, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_5y", 0.0013, PROB_TOL);
    await expectCalculatedDecimal(page, "mean_life_expectancy", 0.75, 0.1);
  });

  test("Test case 4 — mid-range, modifiable: NYHA II ischemic on minimal therapy (62 y M)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 62);
    await selectChip(page, "sex", SEX_MALE);
    await selectChip(page, "ischemic_etiology", ISCHEMIC_YES);
    await selectChip(page, "nyha_class", NYHA_II);
    await setNumber(page, "weight_kg", 88);
    await setNumber(page, "ejection_fraction", 40);
    await setNumber(page, "systolic_bp", 130);
    await setNumber(page, "sodium", 139);
    await setNumber(page, "hemoglobin", 13.8);
    await setNumber(page, "lymphocytes_pct", 24);
    await setNumber(page, "uric_acid", 6.4);
    await setNumber(page, "total_cholesterol", 175);
    await setNumber(page, "furosemide_dose", 0);
    await setNumber(page, "torsemide_dose", 0);
    await setNumber(page, "bumetanide_dose", 0);
    await setNumber(page, "metolazone_dose", 0);
    await setNumber(page, "hctz_dose", 0);
    await selectChip(page, "ace_inhibitor", ACEI_NO);
    await selectChip(page, "arb", ARB_NO);
    await selectChip(page, "beta_blocker", BB_NO);
    await selectChip(page, "statin", STATIN_YES);
    await selectChip(page, "allopurinol", ALLOP_NO);
    await selectChip(page, "k_sparing", KSPARING_NO);
    await selectChip(page, "device", DEV_NONE);

    await expectCalculatedDecimal(page, "survival_1y", 0.9440, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_2y", 0.8912, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_3y", 0.8413, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_5y", 0.7497, PROB_TOL);
    await expectCalculatedDecimal(page, "mean_life_expectancy", 17.36, 1.0);
  });

  test("Test case 5 — maximum-severity NYHA IV non-ischemic on no therapy (51 y F)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 51);
    await selectChip(page, "sex", SEX_FEMALE);
    await selectChip(page, "ischemic_etiology", ISCHEMIC_NO);
    await selectChip(page, "nyha_class", NYHA_IV);
    await setNumber(page, "weight_kg", 48);
    await setNumber(page, "ejection_fraction", 12);
    await setNumber(page, "systolic_bp", 84);
    await setNumber(page, "sodium", 128);
    await setNumber(page, "hemoglobin", 9.5);
    await setNumber(page, "lymphocytes_pct", 11);
    await setNumber(page, "uric_acid", 13.5);
    await setNumber(page, "total_cholesterol", 110);
    await setNumber(page, "furosemide_dose", 80);
    await setNumber(page, "torsemide_dose", 0);
    await setNumber(page, "bumetanide_dose", 0);
    await setNumber(page, "metolazone_dose", 0);
    await setNumber(page, "hctz_dose", 0);
    await selectChip(page, "ace_inhibitor", ACEI_NO);
    await selectChip(page, "arb", ARB_NO);
    await selectChip(page, "beta_blocker", BB_NO);
    await selectChip(page, "statin", STATIN_NO);
    await selectChip(page, "allopurinol", ALLOP_NO);
    await selectChip(page, "k_sparing", KSPARING_NO);
    await selectChip(page, "device", DEV_NONE);

    await expectCalculatedDecimal(page, "survival_1y", 0.0503, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_2y", 0.0025, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_3y", 0.0001, PROB_TOL);
    await expectCalculatedDecimal(page, "survival_5y", 0.0, PROB_TOL);
    await expectCalculatedDecimal(page, "mean_life_expectancy", 0.33, 0.1);
  });
});
