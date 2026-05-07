import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "mipss70";

// Version chip displays
const VERSION_MIPSS70 = "MIPSS70 (original)";
const VERSION_V2 = "MIPSS70+ v2.0";

// MIPSS70 booleans (original)
const HB_LT_10_NO = "Hb ≥ 10 g/dL";
const HB_LT_10_YES = "Hb < 10 g/dL";
const WBC_GT_25_NO = "WBC ≤ 25 × 10⁹/L";
const WBC_GT_25_YES = "WBC > 25 × 10⁹/L";
const PLT_LT_100_NO = "Platelets ≥ 100 × 10⁹/L";
const PLT_LT_100_YES = "Platelets < 100 × 10⁹/L";
const BM_FIB_NO = "BM fibrosis grade < 2";
const BM_FIB_YES = "BM fibrosis grade ≥ 2";
const HMR_PRESENT_NO = "No HMR mutation";
const HMR_PRESENT_YES = "HMR mutation present";
const HMR_TWO_NO = "< 2 HMR mutations";
const HMR_TWO_YES = "≥ 2 HMR mutations";

// Shared
const BLASTS_NO = "PB blasts < 2 %";
const BLASTS_YES = "PB blasts ≥ 2 %";
const CONS_NO = "No constitutional symptoms";
const CONS_YES = "Constitutional symptoms present";
const CALR_TYPE1 = "CALR type 1 / type 1-like driver";
const CALR_NOT_TYPE1 = "Driver is not CALR type 1 / type 1-like";

// MIPSS70+ v2.0 specific
const SEV_ANEMIA_NO = "Not severe anemia";
const SEV_ANEMIA_YES = "Severe anemia (Hb < 8 ♀ / < 9 ♂)";
const MOD_ANEMIA_NO = "Not moderate anemia";
const MOD_ANEMIA_YES = "Moderate anemia (Hb 8–9.9 ♀ / 9–10.9 ♂)";
const HMR_STATUS_NONE = "No HMR mutation (v2.0)";
const HMR_STATUS_SINGLE = "Single HMR mutation (v2.0)";
const HMR_STATUS_TWO_PLUS = "≥ 2 HMR mutations (v2.0)";
const KARYO_FAVORABLE = "Favorable karyotype";
const KARYO_UNFAVORABLE = "Unfavorable karyotype";
const KARYO_VHR = "Very-high-risk (VHR) karyotype";

test.describe("MIPSS70 / MIPSS70+ v2.0", () => {
  test("Test case 1 — MIPSS70 Low risk (score 0)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "version", VERSION_MIPSS70);
    await selectChip(page, "hb_lt_10", HB_LT_10_NO);
    await selectChip(page, "wbc_gt_25", WBC_GT_25_NO);
    await selectChip(page, "plt_lt_100", PLT_LT_100_NO);
    await selectChip(page, "blasts_ge_2", BLASTS_NO);
    await selectChip(page, "bm_fibrosis_ge_2", BM_FIB_NO);
    await selectChip(page, "constitutional_symptoms", CONS_NO);
    await selectChip(page, "absence_calr_type1", CALR_TYPE1);
    await selectChip(page, "hmr_present", HMR_PRESENT_NO);
    await selectChip(page, "hmr_two_or_more", HMR_TWO_NO);

    await expectCalculatedDecimal(page, "total_score", 0);
    await expectCalculatedString(page, "risk_category", "low");
    await expectCalculatedString(page, "median_os_label", "27.7 years");
    await expectCalculatedDecimal(page, "survival_at_5y", 0.95, 0.005);
    await expectCalculatedString(page, "transplant_recommendation", "defer");
  });

  test("Test case 2 — MIPSS70 Intermediate risk (score 4)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "version", VERSION_MIPSS70);
    await selectChip(page, "hb_lt_10", HB_LT_10_YES);
    await selectChip(page, "wbc_gt_25", WBC_GT_25_NO);
    await selectChip(page, "plt_lt_100", PLT_LT_100_NO);
    await selectChip(page, "blasts_ge_2", BLASTS_NO);
    await selectChip(page, "bm_fibrosis_ge_2", BM_FIB_YES);
    await selectChip(page, "constitutional_symptoms", CONS_NO);
    await selectChip(page, "absence_calr_type1", CALR_NOT_TYPE1);
    await selectChip(page, "hmr_present", HMR_PRESENT_YES);
    await selectChip(page, "hmr_two_or_more", HMR_TWO_NO);

    await expectCalculatedDecimal(page, "total_score", 4);
    await expectCalculatedString(page, "risk_category", "intermediate");
    await expectCalculatedString(page, "median_os_label", "7.1 years");
    await expectCalculatedDecimal(page, "survival_at_5y", 0.7, 0.005);
    await expectCalculatedString(page, "transplant_recommendation", "consider");
  });

  test("Test case 3 — MIPSS70 High risk, maximum score 12", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "version", VERSION_MIPSS70);
    await selectChip(page, "hb_lt_10", HB_LT_10_YES);
    await selectChip(page, "wbc_gt_25", WBC_GT_25_YES);
    await selectChip(page, "plt_lt_100", PLT_LT_100_YES);
    await selectChip(page, "blasts_ge_2", BLASTS_YES);
    await selectChip(page, "bm_fibrosis_ge_2", BM_FIB_YES);
    await selectChip(page, "constitutional_symptoms", CONS_YES);
    await selectChip(page, "absence_calr_type1", CALR_NOT_TYPE1);
    await selectChip(page, "hmr_present", HMR_PRESENT_YES);
    await selectChip(page, "hmr_two_or_more", HMR_TWO_YES);

    await expectCalculatedDecimal(page, "total_score", 12);
    await expectCalculatedString(page, "risk_category", "high");
    await expectCalculatedString(page, "median_os_label", "2.3 years");
    await expectCalculatedDecimal(page, "survival_at_5y", 0.29, 0.005);
    await expectCalculatedString(page, "transplant_recommendation", "recommend");
  });

  test("Test case 4 — MIPSS70+ v2.0 Very low risk (score 0)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "version", VERSION_V2);
    await selectChip(page, "blasts_ge_2", BLASTS_NO);
    await selectChip(page, "constitutional_symptoms", CONS_NO);
    await selectChip(page, "absence_calr_type1", CALR_TYPE1);
    await selectChip(page, "severe_anemia", SEV_ANEMIA_NO);
    await selectChip(page, "moderate_anemia", MOD_ANEMIA_NO);
    await selectChip(page, "hmr_status", HMR_STATUS_NONE);
    await selectChip(page, "karyotype", KARYO_FAVORABLE);

    await expectCalculatedDecimal(page, "total_score", 0);
    await expectCalculatedString(page, "risk_category", "very_low");
    await expectCalculatedString(page, "median_os_label", "Not reached");
    await expectCalculatedDecimal(page, "survival_at_10y", 0.92, 0.005);
    await expectCalculatedString(page, "transplant_recommendation", "defer");
  });

  test("Test case 5 — MIPSS70+ v2.0 Very high risk (score 14)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "version", VERSION_V2);
    await selectChip(page, "blasts_ge_2", BLASTS_YES);
    await selectChip(page, "constitutional_symptoms", CONS_YES);
    await selectChip(page, "absence_calr_type1", CALR_NOT_TYPE1);
    await selectChip(page, "severe_anemia", SEV_ANEMIA_YES);
    await selectChip(page, "moderate_anemia", MOD_ANEMIA_NO);
    await selectChip(page, "hmr_status", HMR_STATUS_TWO_PLUS);
    await selectChip(page, "karyotype", KARYO_VHR);

    await expectCalculatedDecimal(page, "total_score", 14);
    await expectCalculatedString(page, "risk_category", "very_high");
    await expectCalculatedString(page, "median_os_label", "1.8 years");
    await expectCalculatedDecimal(page, "survival_at_10y", 0.05, 0.005);
    await expectCalculatedString(page, "transplant_recommendation", "strongly_recommend");
  });
});
