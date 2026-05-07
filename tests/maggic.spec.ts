import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "maggic";

// Globally-unique chip displays.
const SEX_MALE = "Male";
const SEX_FEMALE = "Female";

const NYHA_I = "NYHA I";
const NYHA_II = "NYHA II";
const NYHA_III = "NYHA III";
const NYHA_IV = "NYHA IV";

const SMOKER_NO = "Not currently smoking";
const SMOKER_YES = "Current smoker";

const DM_NO = "No diabetes";
const DM_YES = "Diabetes";

const COPD_NO = "No COPD";
const COPD_YES = "COPD";

const HF_NO = "HF diagnosed ≤ 18 months ago";
const HF_YES = "HF diagnosed > 18 months ago";

const BB_OFF = "Off beta-blocker";
const BB_ON = "On beta-blocker";

const ACEI_OFF = "Off ACEi/ARB/ARNI";
const ACEI_ON = "On ACEi/ARB/ARNI";

test.describe("MAGGIC Heart Failure Risk Score", () => {
  test("Test case 1 — score 13, low (48 y M, EF 28, NYHA II, on GDMT)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 48);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "bmi", 26.0);
    await setNumber(page, "systolic_bp", 124);
    await setNumber(page, "ejection_fraction", 28);
    await selectChip(page, "nyha_class", NYHA_II);
    await setNumber(page, "creatinine", 88);
    await selectChip(page, "current_smoker", SMOKER_NO);
    await selectChip(page, "diabetes", DM_NO);
    await selectChip(page, "copd", COPD_NO);
    await selectChip(page, "hf_diagnosed_gt_18mo", HF_NO);
    await selectChip(page, "beta_blocker", BB_ON);
    await selectChip(page, "acei_arb", ACEI_ON);

    await expectCalculatedDecimal(page, "total_points", 13);
    await expectCalculatedString(page, "risk_band", "low");
  });

  test("Test case 2 — score 20, low-intermediate (67 y F, EF 32, NYHA II, DM, chronic HF)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 67);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "bmi", 28);
    await setNumber(page, "systolic_bp", 132);
    await setNumber(page, "ejection_fraction", 32);
    await selectChip(page, "nyha_class", NYHA_II);
    await setNumber(page, "creatinine", 105);
    await selectChip(page, "current_smoker", SMOKER_NO);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "copd", COPD_NO);
    await selectChip(page, "hf_diagnosed_gt_18mo", HF_YES);
    await selectChip(page, "beta_blocker", BB_ON);
    await selectChip(page, "acei_arb", ACEI_ON);

    await expectCalculatedDecimal(page, "total_points", 20);
    await expectCalculatedString(page, "risk_band", "low-intermediate");
  });

  test("Test case 3 — score 27, intermediate-high (76 y M, HFpEF EF 55, NYHA III)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 76);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "bmi", 31);
    await setNumber(page, "systolic_bp", 138);
    await setNumber(page, "ejection_fraction", 55);
    await selectChip(page, "nyha_class", NYHA_III);
    await setNumber(page, "creatinine", 132);
    await selectChip(page, "current_smoker", SMOKER_NO);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "copd", COPD_NO);
    await selectChip(page, "hf_diagnosed_gt_18mo", HF_YES);
    await selectChip(page, "beta_blocker", BB_ON);
    await selectChip(page, "acei_arb", ACEI_ON);

    await expectCalculatedDecimal(page, "total_points", 27);
    await expectCalculatedString(page, "risk_band", "intermediate-high");
  });

  test("Test case 4 — score 47, very-high (78 y M, EF 22, NYHA IV, off GDMT)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 78);
    await selectChip(page, "sex", SEX_MALE);
    await setNumber(page, "bmi", 24);
    await setNumber(page, "systolic_bp", 102);
    await setNumber(page, "ejection_fraction", 22);
    await selectChip(page, "nyha_class", NYHA_IV);
    await setNumber(page, "creatinine", 165);
    await selectChip(page, "current_smoker", SMOKER_YES);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "copd", COPD_YES);
    await selectChip(page, "hf_diagnosed_gt_18mo", HF_YES);
    await selectChip(page, "beta_blocker", BB_OFF);
    await selectChip(page, "acei_arb", ACEI_OFF);

    await expectCalculatedDecimal(page, "total_points", 47);
    await expectCalculatedString(page, "risk_band", "very-high");
  });

  test("Test case 5 — score 56, very-high (86 y F, EF 16, NYHA IV, end-stage)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 86);
    await selectChip(page, "sex", SEX_FEMALE);
    await setNumber(page, "bmi", 14.5);
    await setNumber(page, "systolic_bp", 96);
    await setNumber(page, "ejection_fraction", 16);
    await selectChip(page, "nyha_class", NYHA_IV);
    await setNumber(page, "creatinine", 268);
    await selectChip(page, "current_smoker", SMOKER_YES);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "copd", COPD_YES);
    await selectChip(page, "hf_diagnosed_gt_18mo", HF_YES);
    await selectChip(page, "beta_blocker", BB_OFF);
    await selectChip(page, "acei_arb", ACEI_OFF);

    await expectCalculatedDecimal(page, "total_points", 56);
    await expectCalculatedString(page, "risk_band", "very-high");
  });
});
