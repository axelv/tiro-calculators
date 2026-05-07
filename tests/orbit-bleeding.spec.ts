import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "orbit-bleeding";

const OLDER_NO = "Age < 75";
const OLDER_YES = "Age ≥ 75";
const HGB_NO = "No anemia / normal Hb-Hct";
const HGB_YES = "Reduced Hb/Hct or anemia";
const BLEED_NO = "No prior bleed";
const BLEED_YES = "Prior bleed (GI/ICH/hemorrhagic CVA)";
const RENAL_NO = "eGFR ≥ 60";
const RENAL_YES = "eGFR < 60";
const ANTIPLT_NO = "No antiplatelet";
const ANTIPLT_YES = "On antiplatelet";

test.describe("ORBIT bleeding score", () => {
  test("Test case 1 — score 0, low risk (minimum)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "older_age", OLDER_NO);
    await selectChip(page, "reduced_hgb_or_anemia", HGB_NO);
    await selectChip(page, "bleeding_history", BLEED_NO);
    await selectChip(page, "renal_insufficiency", RENAL_NO);
    await selectChip(page, "antiplatelet_use", ANTIPLT_NO);

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "rate_per_100_py", 1.7);
    await expectCalculatedDecimal(page, "rate_ci_low", 1.2);
    await expectCalculatedDecimal(page, "rate_ci_high", 2.4);
  });

  test("Test case 2 — score 2, low risk (anemia only)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "older_age", OLDER_NO);
    await selectChip(page, "reduced_hgb_or_anemia", HGB_YES);
    await selectChip(page, "bleeding_history", BLEED_NO);
    await selectChip(page, "renal_insufficiency", RENAL_NO);
    await selectChip(page, "antiplatelet_use", ANTIPLT_NO);

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "rate_per_100_py", 2.9);
    await expectCalculatedDecimal(page, "rate_ci_low", 2.3);
    await expectCalculatedDecimal(page, "rate_ci_high", 3.5);
  });

  test("Test case 3 — score 3, medium risk", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "older_age", OLDER_YES);
    await selectChip(page, "reduced_hgb_or_anemia", HGB_NO);
    await selectChip(page, "bleeding_history", BLEED_YES);
    await selectChip(page, "renal_insufficiency", RENAL_NO);
    await selectChip(page, "antiplatelet_use", ANTIPLT_NO);

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedString(page, "risk_band", "medium");
    await expectCalculatedDecimal(page, "rate_per_100_py", 4.7);
    await expectCalculatedDecimal(page, "rate_ci_low", 4.0);
    await expectCalculatedDecimal(page, "rate_ci_high", 5.6);
  });

  test("Test case 4 — score 5, high risk", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "older_age", OLDER_YES);
    await selectChip(page, "reduced_hgb_or_anemia", HGB_YES);
    await selectChip(page, "bleeding_history", BLEED_NO);
    await selectChip(page, "renal_insufficiency", RENAL_YES);
    await selectChip(page, "antiplatelet_use", ANTIPLT_YES);

    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(page, "rate_per_100_py", 9.0);
    await expectCalculatedDecimal(page, "rate_ci_low", 7.2);
    await expectCalculatedDecimal(page, "rate_ci_high", 11.2);
  });

  test("Test case 5 — score 7, high risk (maximum)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "older_age", OLDER_YES);
    await selectChip(page, "reduced_hgb_or_anemia", HGB_YES);
    await selectChip(page, "bleeding_history", BLEED_YES);
    await selectChip(page, "renal_insufficiency", RENAL_YES);
    await selectChip(page, "antiplatelet_use", ANTIPLT_YES);

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(page, "rate_per_100_py", 9.0);
    await expectCalculatedDecimal(page, "rate_ci_low", 7.2);
    await expectCalculatedDecimal(page, "rate_ci_high", 11.2);
  });
});
