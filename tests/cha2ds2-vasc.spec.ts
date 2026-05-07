import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "cha2ds2-vasc";

const AGE_LT_65 = "< 65 years";
const AGE_65_74 = "65–74 years";
const AGE_GE_75 = "≥ 75 years";

const SEX_MALE = "Male";
const SEX_FEMALE = "Female";

test.describe("CHA₂DS₂-VASc — original variant (max 9)", () => {
  test("Test case 1 — score 0, male <65, no risk factors", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LT_65);
    await selectChip(page, "sex", SEX_MALE);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "No hypertension");
    await selectChip(page, "diabetes", "No diabetes");
    await selectChip(page, "stroke_tia_te", "No prior stroke / TIA / TE");
    await selectChip(page, "vascular_disease", "No vascular disease");

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_friberg_2012_percent",
      0.2,
      0.05,
    );
    await expectCalculatedString(
      page,
      "recommendation",
      "No antithrombotic therapy. Truly low-risk.",
    );
  });

  test("Test case 2 — score 1 (sex point only, female)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_LT_65);
    await selectChip(page, "sex", SEX_FEMALE);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "No hypertension");
    await selectChip(page, "diabetes", "No diabetes");
    await selectChip(page, "stroke_tia_te", "No prior stroke / TIA / TE");
    await selectChip(page, "vascular_disease", "No vascular disease");

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_band", "low_moderate");
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_friberg_2012_percent",
      0.6,
      0.05,
    );
    await expectCalculatedString(
      page,
      "recommendation",
      "No antithrombotic therapy (female with sex point only — low-risk equivalent to male score 0).",
    );
  });

  test("Test case 3 — score 3 (male, 65–74, hypertension, diabetes)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_65_74);
    await selectChip(page, "sex", SEX_MALE);
    await selectChip(page, "chf", "No CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "diabetes", "Diabetes");
    await selectChip(page, "stroke_tia_te", "No prior stroke / TIA / TE");
    await selectChip(page, "vascular_disease", "No vascular disease");

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_friberg_2012_percent",
      3.2,
      0.05,
    );
    await expectCalculatedString(
      page,
      "recommendation",
      "OAC recommended (Class I) — DOAC preferred in non-valvular AF unless contraindicated.",
    );
  });

  test("Test case 4 — score 7 (female, 65–74, CHF, HT, DM, stroke)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_65_74);
    await selectChip(page, "sex", SEX_FEMALE);
    await selectChip(page, "chf", "CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "diabetes", "Diabetes");
    await selectChip(page, "stroke_tia_te", "Prior stroke / TIA / TE");
    await selectChip(page, "vascular_disease", "No vascular disease");

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_friberg_2012_percent",
      11.2,
      0.05,
    );
    await expectCalculatedString(
      page,
      "recommendation",
      "OAC recommended (Class I) — DOAC preferred in non-valvular AF unless contraindicated.",
    );
  });

  test("Test case 5 — maximum score 9 (female ≥75, all risk factors)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "age_band", AGE_GE_75);
    await selectChip(page, "sex", SEX_FEMALE);
    await selectChip(page, "chf", "CHF");
    await selectChip(page, "hypertension", "Hypertension");
    await selectChip(page, "diabetes", "Diabetes");
    await selectChip(page, "stroke_tia_te", "Prior stroke / TIA / TE");
    await selectChip(page, "vascular_disease", "Vascular disease");

    await expectCalculatedDecimal(page, "score", 9);
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedDecimal(
      page,
      "annual_stroke_risk_friberg_2012_percent",
      12.2,
      0.05,
    );
    await expectCalculatedString(
      page,
      "recommendation",
      "OAC recommended (Class I) — DOAC preferred in non-valvular AF unless contraindicated.",
    );
  });
});
