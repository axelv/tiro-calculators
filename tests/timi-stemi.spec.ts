import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "timi-stemi";

const AGE_LT_65 = "< 65 years";
const AGE_65_74 = "65–74 years";
const AGE_GE_75 = "≥ 75 years";

test.describe("TIMI Risk Score for STEMI (Morrow 2000)", () => {
  test("Test case 1 — Felix Hartmann (score 0, low risk)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LT_65);
    await selectChip(page, "dm_htn_angina", "No DM / HTN / angina");
    await selectChip(page, "sbp_lt_100", "SBP ≥ 100 mmHg");
    await selectChip(page, "hr_gt_100", "HR ≤ 100 bpm");
    await selectChip(page, "killip_2_4", "Killip I (no CHF signs)");
    await selectChip(page, "weight_lt_67", "Weight ≥ 67 kg");
    await selectChip(page, "anterior_or_lbbb", "Non-anterior STEMI, no LBBB");
    await selectChip(page, "ttt_gt_4h", "Time-to-treatment ≤ 4 h");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedDecimal(page, "mortality_30d_pct", 0.8, 0.05);
  });

  test("Test case 2 — Carla Mendoza (score 4, mid-range)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_65_74);
    await selectChip(page, "dm_htn_angina", "DM, HTN, or angina");
    await selectChip(page, "sbp_lt_100", "SBP ≥ 100 mmHg");
    await selectChip(page, "hr_gt_100", "HR ≤ 100 bpm");
    await selectChip(page, "killip_2_4", "Killip I (no CHF signs)");
    await selectChip(page, "weight_lt_67", "Weight ≥ 67 kg");
    await selectChip(page, "anterior_or_lbbb", "Anterior STEMI or LBBB");
    await selectChip(page, "ttt_gt_4h", "Time-to-treatment ≤ 4 h");

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedDecimal(page, "mortality_30d_pct", 7.3, 0.05);
  });

  test("Test case 3 — Howard Greaves (score 9, very high risk, >8 bucket)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GE_75);
    await selectChip(page, "dm_htn_angina", "DM, HTN, or angina");
    await selectChip(page, "sbp_lt_100", "SBP ≥ 100 mmHg");
    await selectChip(page, "hr_gt_100", "HR > 100 bpm");
    await selectChip(page, "killip_2_4", "Killip II–IV");
    await selectChip(page, "weight_lt_67", "Weight ≥ 67 kg");
    await selectChip(page, "anterior_or_lbbb", "Anterior STEMI or LBBB");
    await selectChip(page, "ttt_gt_4h", "Time-to-treatment ≤ 4 h");

    await expectCalculatedDecimal(page, "score", 9);
    await expectCalculatedDecimal(page, "mortality_30d_pct", 35.9, 0.05);
  });

  test("Test case 4 — Mathilde Janssens (score 14, maximum)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GE_75);
    await selectChip(page, "dm_htn_angina", "DM, HTN, or angina");
    await selectChip(page, "sbp_lt_100", "SBP < 100 mmHg");
    await selectChip(page, "hr_gt_100", "HR > 100 bpm");
    await selectChip(page, "killip_2_4", "Killip II–IV");
    await selectChip(page, "weight_lt_67", "Weight < 67 kg");
    await selectChip(page, "anterior_or_lbbb", "Anterior STEMI or LBBB");
    await selectChip(page, "ttt_gt_4h", "Time-to-treatment > 4 h");

    await expectCalculatedDecimal(page, "score", 14);
    await expectCalculatedDecimal(page, "mortality_30d_pct", 35.9, 0.05);
  });

  test("Test case 5 — Sofía Reyes (score 1, low-edge, weight only)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LT_65);
    await selectChip(page, "dm_htn_angina", "No DM / HTN / angina");
    await selectChip(page, "sbp_lt_100", "SBP ≥ 100 mmHg");
    await selectChip(page, "hr_gt_100", "HR ≤ 100 bpm");
    await selectChip(page, "killip_2_4", "Killip I (no CHF signs)");
    await selectChip(page, "weight_lt_67", "Weight < 67 kg");
    await selectChip(page, "anterior_or_lbbb", "Non-anterior STEMI, no LBBB");
    await selectChip(page, "ttt_gt_4h", "Time-to-treatment ≤ 4 h");

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedDecimal(page, "mortality_30d_pct", 1.6, 0.05);
  });
});
