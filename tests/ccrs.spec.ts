import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "ccrs";

const AGE_LT_65 = "Age < 65 years";
const AGE_GE_65 = "Age ≥ 65 years";

const RDW_LT_15 = "RDW < 15%";
const RDW_GE_15 = "RDW ≥ 15%";

const MCV_LE_100 = "MCV ≤ 100 fL";
const MCV_GT_100 = "MCV > 100 fL";

const CYTO_CHIP = "CHIP (no cytopenia)";
const CYTO_CCUS = "CCUS (cytopenia present)";

const DNMT3A_ISOLATED = "Isolated DNMT3A only";
const DNMT3A_NOT_ISOLATED = "Not isolated DNMT3A";

const HRM_PRESENT = "High-risk mutation present";
const HRM_ABSENT = "No high-risk mutation";

const N_ONE = "1 mutation";
const N_TWO_PLUS = "≥ 2 mutations";

const VAF_LE_02 = "Max VAF ≤ 0.2";
const VAF_GT_02 = "Max VAF > 0.2";

const REC_LOW =
  "Routine primary-care follow-up; no specialist hematology referral mandated by score alone. Re-evaluate if new cytopenia, rising RDW/MCV, or new mutation appears.";
const REC_INT =
  "Hematology referral and periodic surveillance (CBC + repeat NGS panel; consider bone marrow only if cytopenia evolves).";
const REC_HIGH =
  "Prompt hematology referral, bone marrow biopsy to exclude occult MDS, and discussion of clinical-trial enrolment for MN prevention.";

test.describe("CHRS / CCRS — Clonal Hematopoiesis Risk Score", () => {
  test("Test case 1 — score 7.5, low (isolated DNMT3A, theoretical minimum)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_LT_65);
    await selectChip(page, "RDW", RDW_LT_15);
    await selectChip(page, "MCV", MCV_LE_100);
    await selectChip(page, "cytopenia_status", CYTO_CHIP);
    await selectChip(page, "single_DNMT3A", DNMT3A_ISOLATED);
    await selectChip(page, "high_risk_mutation", HRM_ABSENT);
    await selectChip(page, "n_mutations", N_ONE);
    await selectChip(page, "max_VAF", VAF_LE_02);

    await expectCalculatedDecimal(page, "CHRS_score", 7.5);
    await expectCalculatedString(page, "CHRS_category", "low");
    await expectCalculatedDecimal(page, "risk_10y_progression_MN", 0.67);
    await expectCalculatedString(page, "recommendation", REC_LOW);
  });

  test("Test case 2 — score 9.5, low (older, two non-high-risk mutations)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "RDW", RDW_LT_15);
    await selectChip(page, "MCV", MCV_LE_100);
    await selectChip(page, "cytopenia_status", CYTO_CHIP);
    await selectChip(page, "single_DNMT3A", DNMT3A_NOT_ISOLATED);
    await selectChip(page, "high_risk_mutation", HRM_ABSENT);
    await selectChip(page, "n_mutations", N_TWO_PLUS);
    await selectChip(page, "max_VAF", VAF_LE_02);

    await expectCalculatedDecimal(page, "CHRS_score", 9.5);
    await expectCalculatedString(page, "CHRS_category", "low");
    await expectCalculatedDecimal(page, "risk_10y_progression_MN", 0.67);
    await expectCalculatedString(page, "recommendation", REC_LOW);
  });

  test("Test case 3 — score 10.0, intermediate (CCUS, high VAF, no high-risk gene)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "RDW", RDW_LT_15);
    await selectChip(page, "MCV", MCV_LE_100);
    await selectChip(page, "cytopenia_status", CYTO_CCUS);
    await selectChip(page, "single_DNMT3A", DNMT3A_NOT_ISOLATED);
    await selectChip(page, "high_risk_mutation", HRM_ABSENT);
    await selectChip(page, "n_mutations", N_ONE);
    await selectChip(page, "max_VAF", VAF_GT_02);

    await expectCalculatedDecimal(page, "CHRS_score", 10.0);
    await expectCalculatedString(page, "CHRS_category", "intermediate");
    await expectCalculatedDecimal(page, "risk_10y_progression_MN", 7.83);
    await expectCalculatedString(page, "recommendation", REC_INT);
  });

  test("Test case 4 — score 15.5, high (CCUS, SRSF2 + TET2, RDW & MCV up)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "RDW", RDW_GE_15);
    await selectChip(page, "MCV", MCV_GT_100);
    await selectChip(page, "cytopenia_status", CYTO_CCUS);
    await selectChip(page, "single_DNMT3A", DNMT3A_NOT_ISOLATED);
    await selectChip(page, "high_risk_mutation", HRM_PRESENT);
    await selectChip(page, "n_mutations", N_TWO_PLUS);
    await selectChip(page, "max_VAF", VAF_GT_02);

    await expectCalculatedDecimal(page, "CHRS_score", 15.5);
    await expectCalculatedString(page, "CHRS_category", "high");
    await expectCalculatedDecimal(page, "risk_10y_progression_MN", 52.2);
    await expectCalculatedString(page, "recommendation", REC_HIGH);
  });

  test("Test case 5 — score 15.5, high (TP53 + SRSF2 + DNMT3A, all adverse bins)", async ({
    page,
  }) => {
    // SPEC §3.2 quotes a theoretical max of 16.5 but the point-table sum in
    // §3.1 maxes at 15.5 (1.0 + 2.5 + 2.0 + 2.0 + 2.5 + 2.5 + 1.5 + 1.5).
    // TEST_CASES.md TC5 lists the same bins (totalling 15.5) but labels the
    // total as 16.5 — internally inconsistent. We follow the bin sum.
    await openCalc(page, SLUG);
    await selectChip(page, "age", AGE_GE_65);
    await selectChip(page, "RDW", RDW_GE_15);
    await selectChip(page, "MCV", MCV_GT_100);
    await selectChip(page, "cytopenia_status", CYTO_CCUS);
    await selectChip(page, "single_DNMT3A", DNMT3A_NOT_ISOLATED);
    await selectChip(page, "high_risk_mutation", HRM_PRESENT);
    await selectChip(page, "n_mutations", N_TWO_PLUS);
    await selectChip(page, "max_VAF", VAF_GT_02);

    await expectCalculatedDecimal(page, "CHRS_score", 15.5);
    await expectCalculatedString(page, "CHRS_category", "high");
    await expectCalculatedDecimal(page, "risk_10y_progression_MN", 52.2);
    await expectCalculatedString(page, "recommendation", REC_HIGH);
  });
});
