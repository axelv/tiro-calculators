import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "hct-ci";

// Globally unique chip displays per the questionnaire (see CONVENTIONS).
const ARR_NO = "No arrhythmia";
const ARR_YES = "Arrhythmia";

const CARD_NO = "No cardiac disease";
const CARD_YES = "Cardiac disease";

const IBD_NO = "No IBD";
const IBD_YES = "IBD";

const DM_NO = "No diabetes";
const DM_YES = "Diabetes";

const CVD_NO = "No cerebrovascular disease";
const CVD_YES = "Cerebrovascular disease";

const PSY_NO = "No psychiatric disturbance";
const PSY_YES = "Psychiatric disturbance";

const OB_NO = "Not obese";
const OB_YES = "Obese";

const INF_NO = "No active infection";
const INF_YES = "Active infection";

const RHEUM_NO = "No rheumatologic disease";
const RHEUM_YES = "Rheumatologic disease";

const PUD_NO = "No peptic ulcer";
const PUD_YES = "Peptic ulcer";

const REN_NO = "No renal impairment";
const REN_YES = "Renal impairment";

const VALVE_NO = "No heart valve disease";
const VALVE_YES = "Heart valve disease";

const TUMOR_NO = "No prior solid tumor";
const TUMOR_YES = "Prior solid tumor";

const HEP_NONE = "No hepatic disease";
const HEP_MILD =
  "Hepatic mild (chronic hepatitis, bilirubin >ULN to 1.5×ULN, or AST/ALT >ULN to 2.5×ULN)";
const HEP_MOD_SEV =
  "Hepatic moderate/severe (cirrhosis, bilirubin >1.5×ULN, or AST/ALT >2.5×ULN)";

const PULM_NONE = "No pulmonary disease";
const PULM_MOD =
  "Pulmonary moderate (DLco/FEV1 66–80% or dyspnea on slight activity)";
const PULM_SEV =
  "Pulmonary severe (DLco/FEV1 ≤ 65%, rest dyspnea, or requiring oxygen)";

const AGE_LT_40 = "Age < 40 years";
const AGE_GE_40 = "Age ≥ 40 years";

/** Click "no/none" answers for every comorbidity except those overridden. */
async function setAllAbsent(
  page: import("@playwright/test").Page,
): Promise<void> {
  await selectChip(page, "arrhythmia", ARR_NO);
  await selectChip(page, "cardiac", CARD_NO);
  await selectChip(page, "ibd", IBD_NO);
  await selectChip(page, "diabetes", DM_NO);
  await selectChip(page, "cerebrovascular", CVD_NO);
  await selectChip(page, "psychiatric", PSY_NO);
  await selectChip(page, "obesity", OB_NO);
  await selectChip(page, "infection", INF_NO);
  await selectChip(page, "rheumatologic", RHEUM_NO);
  await selectChip(page, "peptic_ulcer", PUD_NO);
  await selectChip(page, "renal", REN_NO);
  await selectChip(page, "heart_valve", VALVE_NO);
  await selectChip(page, "prior_solid_tumor", TUMOR_NO);
  await selectChip(page, "hepatic", HEP_NONE);
  await selectChip(page, "pulmonary", PULM_NONE);
}

test.describe("HCT-CI — Hematopoietic Cell Transplantation Comorbidity Index", () => {
  test("Test case 1 — Léa Moreau (28 y, no comorbidities) → HCT-CI 0, low", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setAllAbsent(page);
    await selectChip(page, "age_ge_40", AGE_LT_40);

    await expectCalculatedDecimal(page, "hct_ci", 0);
    await expectCalculatedDecimal(page, "hct_ci_age", 0);
    await expectCalculatedString(page, "risk_group_2005", "low");
    await expectCalculatedString(page, "risk_group_2014", "low");
    await expectCalculatedDecimal(page, "nrm_2yr_pct", 14);
    await expectCalculatedDecimal(page, "os_2yr_pct", 71);
  });

  test("Test case 2 — Anthony Brooks (46 y, insulin DM + obesity) → HCT-CI 2, composite 3", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setAllAbsent(page);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "obesity", OB_YES);
    await selectChip(page, "age_ge_40", AGE_GE_40);

    await expectCalculatedDecimal(page, "hct_ci", 2);
    await expectCalculatedDecimal(page, "hct_ci_age", 3);
    await expectCalculatedString(page, "risk_group_2005", "intermediate");
    await expectCalculatedString(page, "risk_group_2014", "intermediate");
    await expectCalculatedDecimal(page, "nrm_2yr_pct", 21);
    await expectCalculatedDecimal(page, "os_2yr_pct", 60);
  });

  test("Test case 3 — Sophia Nakamura (52 y, AF + insulin DM + mild hepatic) → HCT-CI 3, composite 4", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setAllAbsent(page);
    await selectChip(page, "arrhythmia", ARR_YES);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "hepatic", HEP_MILD);
    await selectChip(page, "age_ge_40", AGE_GE_40);

    await expectCalculatedDecimal(page, "hct_ci", 3);
    await expectCalculatedDecimal(page, "hct_ci_age", 4);
    await expectCalculatedString(page, "risk_group_2005", "high");
    await expectCalculatedString(page, "risk_group_2014", "intermediate");
    await expectCalculatedDecimal(page, "nrm_2yr_pct", 41);
    await expectCalculatedDecimal(page, "os_2yr_pct", 34);
  });

  test("Test case 4 — Robert Klein (64 y, prior CABG + severe pulmonary) → HCT-CI 4, composite 5", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setAllAbsent(page);
    await selectChip(page, "cardiac", CARD_YES);
    await selectChip(page, "pulmonary", PULM_SEV);
    await selectChip(page, "age_ge_40", AGE_GE_40);

    await expectCalculatedDecimal(page, "hct_ci", 4);
    await expectCalculatedDecimal(page, "hct_ci_age", 5);
    await expectCalculatedString(page, "risk_group_2005", "high");
    await expectCalculatedString(page, "risk_group_2014", "high");
    await expectCalculatedDecimal(page, "nrm_2yr_pct", 41);
    await expectCalculatedDecimal(page, "os_2yr_pct", 34);
  });

  test("Test case 5 — Daichi Sato (67 y, extreme cumulative comorbidity) → HCT-CI 12, composite 13", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setAllAbsent(page);
    await selectChip(page, "arrhythmia", ARR_YES);
    await selectChip(page, "diabetes", DM_YES);
    await selectChip(page, "cerebrovascular", CVD_YES);
    await selectChip(page, "heart_valve", VALVE_YES);
    await selectChip(page, "peptic_ulcer", PUD_YES);
    await selectChip(page, "renal", REN_YES);
    await selectChip(page, "obesity", OB_YES);
    await selectChip(page, "hepatic", HEP_MILD);
    await selectChip(page, "age_ge_40", AGE_GE_40);

    await expectCalculatedDecimal(page, "hct_ci", 12);
    await expectCalculatedDecimal(page, "hct_ci_age", 13);
    await expectCalculatedString(page, "risk_group_2005", "high");
    await expectCalculatedString(page, "risk_group_2014", "high");
    await expectCalculatedDecimal(page, "nrm_2yr_pct", 41);
    await expectCalculatedDecimal(page, "os_2yr_pct", 34);
  });
});
