import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "chads2";

test.describe("CHADS₂ — Gage 2001", () => {
  test("Test case 1 — score 0 (low risk, edge case at minimum)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "No hypertension");
    await selectChip(page, "age_ge_75", "Age < 75");
    await selectChip(page, "diabetes", "No diabetes");
    await selectChip(page, "stroke_tia", "No prior stroke / TIA");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_percent",
      1.9,
      0.05,
    );
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedString(
      page,
      "recommendation",
      "No antithrombotic therapy preferred. Re-stratify with CHA2DS2-VASc before withholding therapy.",
    );
  });

  test("Test case 2 — score 1 (low–moderate, hypertension only)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_ge_75", "Age < 75");
    await selectChip(page, "diabetes", "No diabetes");
    await selectChip(page, "stroke_tia", "No prior stroke / TIA");

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_percent",
      2.8,
      0.05,
    );
    await expectCalculatedString(page, "risk_band", "low_moderate");
    await expectCalculatedString(
      page,
      "recommendation",
      "Oral anticoagulant or aspirin; OAC generally preferred. Re-stratify with CHA2DS2-VASc.",
    );
  });

  test("Test case 3 — score 2 (moderate, hypertension + age ≥ 75)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_ge_75", "Age ≥ 75");
    await selectChip(page, "diabetes", "No diabetes");
    await selectChip(page, "stroke_tia", "No prior stroke / TIA");

    await expectCalculatedDecimal(page, "score", 2);
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_percent",
      4.0,
      0.05,
    );
    await expectCalculatedString(page, "risk_band", "moderate");
    await expectCalculatedString(
      page,
      "recommendation",
      "Oral anticoagulation recommended (DOAC preferred over warfarin in non-valvular AF unless contraindicated).",
    );
  });

  test("Test case 4 — score 4 (high, multiple comorbidities, no stroke)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "chf", "CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_ge_75", "Age ≥ 75");
    await selectChip(page, "diabetes", "Diabetes");
    await selectChip(page, "stroke_tia", "No prior stroke / TIA");

    await expectCalculatedDecimal(page, "score", 4);
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_percent",
      8.5,
      0.05,
    );
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedString(
      page,
      "recommendation",
      "Oral anticoagulation recommended (DOAC preferred over warfarin in non-valvular AF unless contraindicated).",
    );
  });

  test("Test case 5 — maximum score 6 (very high)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "chf", "CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "age_ge_75", "Age ≥ 75");
    await selectChip(page, "diabetes", "Diabetes");
    await selectChip(page, "stroke_tia", "Prior stroke / TIA");

    await expectCalculatedDecimal(page, "score", 6);
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_percent",
      18.2,
      0.05,
    );
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedString(
      page,
      "recommendation",
      "Oral anticoagulation recommended (DOAC preferred over warfarin in non-valvular AF unless contraindicated).",
    );
  });
});
