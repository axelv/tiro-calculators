import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "ebmt-transplant";

// Age-band chip displays
const AGE_LT_20 = "< 20 years";
const AGE_20_40 = "20–40 years";
const AGE_GT_40 = "> 40 years";

// Disease-stage chip displays
const STAGE_EARLY = "Early (untreated / first remission / first chronic phase)";
const STAGE_INTERMEDIATE = "Intermediate (CR ≥ 2, partial remission, accelerated phase)";
const STAGE_ADVANCED = "Advanced (active / refractory / blast crisis)";

// Donor-type chip displays
const DONOR_SIBLING = "HLA-identical sibling donor";
const DONOR_UNRELATED = "Unrelated donor";

// Sex-match chip displays
const SEX_OTHER = "Other donor → recipient sex combination";
const SEX_F_TO_M = "Female donor → male recipient";

// Interval chip displays
const INTERVAL_LE_12 = "≤ 12 months (or transplanted in CR1)";
const INTERVAL_GT_12 = "> 12 months (and not in CR1)";

const INTERPRETATION_LOW =
  "Acceptable transplant risk; standard allo-HCT pathway is appropriate.";
const INTERPRETATION_INTERMEDIATE =
  "Counsel about substantial mortality risk; consider HCT-CI co-assessment, optimisation of modifiable factors, and reduced-intensity conditioning where indicated.";
const INTERPRETATION_HIGH =
  "Discuss alternative strategies — clinical-trial enrolment, RIC, alternative graft source, or non-transplant approaches; expected 5-yr OS <30%.";

test.describe("EBMT (Gratwohl) Transplant Risk Score", () => {
  test("Test case 1 — score 0 (Low risk, minimum)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LT_20);
    await selectChip(page, "disease_stage", STAGE_EARLY);
    await selectChip(page, "donor_type", DONOR_SIBLING);
    await selectChip(page, "sex_match", SEX_OTHER);
    await selectChip(page, "interval_dx_to_hct", INTERVAL_LE_12);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_category", "Low");
    await expectCalculatedDecimal(page, "os_5yr_pct", 71);
    await expectCalculatedDecimal(page, "trm_5yr_pct", 14);
    await expectCalculatedString(page, "clinical_interpretation", INTERPRETATION_LOW);
  });

  test("Test case 2 — score 2 (Low risk, upper end)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_20_40);
    await selectChip(page, "disease_stage", STAGE_EARLY);
    await selectChip(page, "donor_type", DONOR_UNRELATED);
    await selectChip(page, "sex_match", SEX_OTHER);
    await selectChip(page, "interval_dx_to_hct", INTERVAL_LE_12);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_category", "Low");
    await expectCalculatedDecimal(page, "os_5yr_pct", 55);
    await expectCalculatedDecimal(page, "trm_5yr_pct", 26);
    await expectCalculatedString(page, "clinical_interpretation", INTERPRETATION_LOW);
  });

  test("Test case 3 — score 4 (Intermediate risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GT_40);
    await selectChip(page, "disease_stage", STAGE_INTERMEDIATE);
    await selectChip(page, "donor_type", DONOR_UNRELATED);
    await selectChip(page, "sex_match", SEX_OTHER);
    await selectChip(page, "interval_dx_to_hct", INTERVAL_LE_12);

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedString(page, "risk_category", "Intermediate");
    await expectCalculatedDecimal(page, "os_5yr_pct", 38);
    await expectCalculatedDecimal(page, "trm_5yr_pct", 38);
    await expectCalculatedString(
      page,
      "clinical_interpretation",
      INTERPRETATION_INTERMEDIATE,
    );
  });

  test("Test case 4 — score 6 (High risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GT_40);
    await selectChip(page, "disease_stage", STAGE_INTERMEDIATE);
    await selectChip(page, "donor_type", DONOR_UNRELATED);
    await selectChip(page, "sex_match", SEX_F_TO_M);
    await selectChip(page, "interval_dx_to_hct", INTERVAL_GT_12);

    await expectCalculatedDecimal(page, "score", 6);
    await expectCalculatedString(page, "risk_category", "High");
    await expectCalculatedDecimal(page, "os_5yr_pct", 26);
    await expectCalculatedDecimal(page, "trm_5yr_pct", 52);
    await expectCalculatedString(page, "clinical_interpretation", INTERPRETATION_HIGH);
  });

  test("Test case 5 — score 7 (High risk, maximum)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GT_40);
    await selectChip(page, "disease_stage", STAGE_ADVANCED);
    await selectChip(page, "donor_type", DONOR_UNRELATED);
    await selectChip(page, "sex_match", SEX_F_TO_M);
    await selectChip(page, "interval_dx_to_hct", INTERVAL_GT_12);

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedString(page, "risk_category", "High");
    await expectCalculatedDecimal(page, "os_5yr_pct", 24);
    await expectCalculatedDecimal(page, "trm_5yr_pct", 56);
    await expectCalculatedString(page, "clinical_interpretation", INTERPRETATION_HIGH);
  });
});
