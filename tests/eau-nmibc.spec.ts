import { test } from "@playwright/test";
import {
  openCalc,
  selectChip,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "eau-nmibc";

// Globally-unique chip displays (mirroring the questionnaire). The SDK doesn't
// scope clicks by question, so each chip's visible text must be unique.
const AGE_LE_70 = "Age ≤70";
const AGE_GT_70 = "Age >70";

const TUMOR_PRIMARY = "Primary tumor";
const TUMOR_RECURRENT = "Recurrent tumor";

const N_SINGLE = "Single tumor";
const N_MULTIPLE = "Multiple tumors";

const DIA_LT_3 = "<3 cm";
const DIA_GE_3 = "≥3 cm";

const STAGE_TA = "Stage Ta";
const STAGE_T1 = "Stage T1";

const CIS_NO = "No CIS";
const CIS_YES = "CIS present";

const CLASS_2004 = "WHO 2004/2016";
const CLASS_1973 = "WHO 1973";

const GRADE_LG = "LG (low-grade, includes LMP)";
const GRADE_HG = "HG (high-grade)";

const GRADE_G3 = "G3";

test.describe("EAU NMIBC — 2021 risk-group calculator", () => {
  test("Test case 1 — Low risk (WHO 2004/2016): Ta LG, no CIS, ARF 0", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_LE_70);
    await selectChip(page, "tumor_status", TUMOR_PRIMARY);
    await selectChip(page, "number_of_tumors", N_SINGLE);
    await selectChip(page, "max_diameter", DIA_LT_3);
    await selectChip(page, "stage", STAGE_TA);
    await selectChip(page, "cis", CIS_NO);
    await selectChip(page, "classification", CLASS_2004);
    await selectChip(page, "grade_who_2004", GRADE_LG);

    await expectCalculatedDecimal(page, "arf_count", 0, 1e-6);
    await expectCalculatedString(page, "risk_who_2004", "Low");
    await expectCalculatedDecimal(page, "progression_1yr_2004", 0.06, 1e-3);
    await expectCalculatedDecimal(page, "progression_5yr_2004", 0.93, 1e-3);
    await expectCalculatedDecimal(page, "progression_10yr_2004", 3.7, 1e-3);
  });

  test("Test case 2 — Intermediate (WHO 2004/2016): Ta LG, ARF 2", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GT_70);
    await selectChip(page, "tumor_status", TUMOR_PRIMARY);
    await selectChip(page, "number_of_tumors", N_MULTIPLE);
    await selectChip(page, "max_diameter", DIA_LT_3);
    await selectChip(page, "stage", STAGE_TA);
    await selectChip(page, "cis", CIS_NO);
    await selectChip(page, "classification", CLASS_2004);
    await selectChip(page, "grade_who_2004", GRADE_LG);

    await expectCalculatedDecimal(page, "arf_count", 2, 1e-6);
    await expectCalculatedString(page, "risk_who_2004", "Intermediate");
    await expectCalculatedDecimal(page, "progression_1yr_2004", 1.0, 1e-3);
    await expectCalculatedDecimal(page, "progression_5yr_2004", 4.9, 1e-3);
    await expectCalculatedDecimal(page, "progression_10yr_2004", 8.5, 1e-3);
  });

  test("Test case 3 — High (WHO 2004/2016): T1 HG, no CIS, ARF 1", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_LE_70);
    await selectChip(page, "tumor_status", TUMOR_PRIMARY);
    await selectChip(page, "number_of_tumors", N_SINGLE);
    await selectChip(page, "max_diameter", DIA_GE_3);
    await selectChip(page, "stage", STAGE_T1);
    await selectChip(page, "cis", CIS_NO);
    await selectChip(page, "classification", CLASS_2004);
    await selectChip(page, "grade_who_2004", GRADE_HG);

    await expectCalculatedDecimal(page, "arf_count", 1, 1e-6);
    await expectCalculatedString(page, "risk_who_2004", "High");
    await expectCalculatedDecimal(page, "progression_1yr_2004", 3.5, 1e-3);
    await expectCalculatedDecimal(page, "progression_5yr_2004", 9.6, 1e-3);
    await expectCalculatedDecimal(page, "progression_10yr_2004", 14.0, 1e-3);
  });

  test("Test case 4 — Very High (WHO 2004/2016): T1 HG + CIS, ARF 3", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GT_70);
    await selectChip(page, "tumor_status", TUMOR_RECURRENT);
    await selectChip(page, "number_of_tumors", N_SINGLE);
    await selectChip(page, "max_diameter", DIA_GE_3);
    await selectChip(page, "stage", STAGE_T1);
    await selectChip(page, "cis", CIS_YES);
    await selectChip(page, "classification", CLASS_2004);
    await selectChip(page, "grade_who_2004", GRADE_HG);

    await expectCalculatedDecimal(page, "arf_count", 3, 1e-6);
    await expectCalculatedString(page, "risk_who_2004", "Very High");
    await expectCalculatedDecimal(page, "progression_1yr_2004", 16.0, 1e-3);
    await expectCalculatedDecimal(page, "progression_5yr_2004", 40.0, 1e-3);
    await expectCalculatedDecimal(page, "progression_10yr_2004", 53.0, 1e-3);
  });

  test("Test case 5 — Very High (WHO 1973): T1 G3, no CIS, ARF 4", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GT_70);
    await selectChip(page, "tumor_status", TUMOR_RECURRENT);
    await selectChip(page, "number_of_tumors", N_MULTIPLE);
    await selectChip(page, "max_diameter", DIA_GE_3);
    await selectChip(page, "stage", STAGE_T1);
    await selectChip(page, "cis", CIS_NO);
    await selectChip(page, "classification", CLASS_1973);
    await selectChip(page, "grade_who_1973", GRADE_G3);

    await expectCalculatedDecimal(page, "arf_count", 4, 1e-6);
    await expectCalculatedString(page, "risk_who_1973", "Very High");
    await expectCalculatedDecimal(page, "progression_1yr_1973", 20.0, 1e-3);
    await expectCalculatedDecimal(page, "progression_5yr_1973", 44.0, 1e-3);
    await expectCalculatedDecimal(page, "progression_10yr_1973", 59.0, 1e-3);
  });
});
