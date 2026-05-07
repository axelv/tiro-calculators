import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "grace-acs";

const KILLIP_I = "Killip I (no CHF)";
const KILLIP_II = "Killip II (rales / S3 / elevated JVP)";
const KILLIP_III = "Killip III (pulmonary edema)";

const ARREST_NO = "No cardiac arrest";
const ARREST_YES = "Cardiac arrest at admission";

const STDEV_NO = "No ST deviation";
const STDEV_YES = "ST-segment deviation present";

const ENZ_NO = "Normal cardiac enzymes";
const ENZ_YES = "Elevated cardiac enzymes";

/**
 * GRACE ACS — Granger 2003 GRACE 1.0 in-hospital admission point-table.
 * Stepwise mortality lookup per SPEC §3.2 / FHIRPATH.md (rounded down to the
 * nearest 10-point row; SPEC test cases quote linearly-interpolated values, so
 * stepwise output and SPEC's interpolated number can differ — assertions here
 * follow the encoded stepwise lookup, which is what the questionnaire computes).
 */

test.describe("GRACE ACS — Granger 2003 in-hospital nomogram", () => {
  test("Test case 1 — 42 y/o, low risk, total 75", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 42);
    await setNumber(page, "heart_rate", 72);
    await setNumber(page, "systolic_bp", 138);
    await setNumber(page, "creatinine", 0.9);
    await selectChip(page, "killip_class", KILLIP_I);
    await selectChip(page, "cardiac_arrest_at_admission", ARREST_NO);
    await selectChip(page, "st_segment_deviation", STDEV_NO);
    await selectChip(page, "elevated_cardiac_enzymes", ENZ_NO);

    await expectCalculatedDecimal(page, "total_points", 75);
    // Stepwise: 75 falls in [70,80) → 0.3 %.
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 0.3, 0.01);
    await expectCalculatedString(page, "risk_category_inhospital", "low");
  });

  test("Test case 2 — 68 y/o, NSTEMI with Killip II + ST deviation, total 169", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 68);
    await setNumber(page, "heart_rate", 95);
    await setNumber(page, "systolic_bp", 145);
    await setNumber(page, "creatinine", 1.4);
    await selectChip(page, "killip_class", KILLIP_II);
    await selectChip(page, "cardiac_arrest_at_admission", ARREST_NO);
    await selectChip(page, "st_segment_deviation", STDEV_YES);
    await selectChip(page, "elevated_cardiac_enzymes", ENZ_YES);

    await expectCalculatedDecimal(page, "total_points", 169);
    // Stepwise: 169 falls in [160,170) → 5.4 %.
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 5.4, 0.01);
    await expectCalculatedString(page, "risk_category_inhospital", "high");
  });

  test("Test case 3 — 58 y/o borderline NSTEMI, total 105", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 58);
    await setNumber(page, "heart_rate", 76);
    await setNumber(page, "systolic_bp", 132);
    await setNumber(page, "creatinine", 1.0);
    await selectChip(page, "killip_class", KILLIP_I);
    await selectChip(page, "cardiac_arrest_at_admission", ARREST_NO);
    await selectChip(page, "st_segment_deviation", STDEV_NO);
    await selectChip(page, "elevated_cardiac_enzymes", ENZ_YES);

    await expectCalculatedDecimal(page, "total_points", 105);
    // Stepwise: 105 falls in [100,110) → 0.8 %.
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 0.8, 0.01);
    await expectCalculatedString(page, "risk_category_inhospital", "low");
  });

  test("Test case 4 — 81 y/o resuscitated arrest, Killip III, total 309", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 81);
    await setNumber(page, "heart_rate", 118);
    await setNumber(page, "systolic_bp", 92);
    await setNumber(page, "creatinine", 2.4);
    await selectChip(page, "killip_class", KILLIP_III);
    await selectChip(page, "cardiac_arrest_at_admission", ARREST_YES);
    await selectChip(page, "st_segment_deviation", STDEV_YES);
    await selectChip(page, "elevated_cardiac_enzymes", ENZ_YES);

    await expectCalculatedDecimal(page, "total_points", 309);
    // Stepwise: ≥ 250 saturates at 52 %.
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 52.0, 0.01);
    await expectCalculatedString(page, "risk_category_inhospital", "high");
  });

  test("Test case 5 — 28 y/o low-risk floor, total 7", async ({ page }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 28);
    await setNumber(page, "heart_rate", 64);
    await setNumber(page, "systolic_bp", 210);
    await setNumber(page, "creatinine", 0.7);
    await selectChip(page, "killip_class", KILLIP_I);
    await selectChip(page, "cardiac_arrest_at_admission", ARREST_NO);
    await selectChip(page, "st_segment_deviation", STDEV_NO);
    await selectChip(page, "elevated_cardiac_enzymes", ENZ_NO);

    await expectCalculatedDecimal(page, "total_points", 7);
    // Stepwise: ≤ 60 floors at 0.2 %.
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 0.2, 0.01);
    await expectCalculatedString(page, "risk_category_inhospital", "low");
  });
});
