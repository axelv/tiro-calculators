import { test, type Page } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  itemLocator,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "afiss";

/**
 * AFISS / SAFE — qualitative-tier suite.
 *
 * The published model is a 10-variable logistic regression whose β coefficients
 * could not be sourced (see SPEC.md §3 and FHIRPATH.md). Per TEST_CASES.md, the
 * expected outputs are the *operational tier* (Low / Moderate / High) derived
 * from the directionality of each predictor. The questionnaire uses a heuristic
 * adverse-risk-factor count as a surrogate for the unavailable probability —
 * see afiss/README.md for the full deviation note.
 */

interface AfissInputs {
  age: number;
  bmi: number;
  immunocompromised: string;
  septic_shock: string;
  vasopressor_inotrope: string;
  crp: number;
  wbc: number;
  renal_failure: string;
  potassium: number;
  fio2: number;
}

async function fillAfiss(page: Page, inputs: AfissInputs): Promise<void> {
  // Wait until the SDK has actually rendered the first input. `openCalc`
  // resolves when `__tiroState === "ready"`, but the form template can paint
  // asynchronously after that flag is set; `setNumber` does not poll, so we
  // gate here.
  await itemLocator(page, "age").waitFor({ state: "attached", timeout: 10_000 });
  await setNumber(page, "age", inputs.age);
  await setNumber(page, "bmi", inputs.bmi);
  await selectChip(page, "immunocompromised", inputs.immunocompromised);
  await selectChip(page, "septic_shock", inputs.septic_shock);
  await selectChip(page, "vasopressor_inotrope", inputs.vasopressor_inotrope);
  await setNumber(page, "crp", inputs.crp);
  await setNumber(page, "wbc", inputs.wbc);
  await selectChip(page, "renal_failure", inputs.renal_failure);
  await setNumber(page, "potassium", inputs.potassium);
  await setNumber(page, "fio2", inputs.fio2);
}

test.describe("AFISS — qualitative tiers (heuristic surrogate; coefficients TBD)", () => {
  test("Test case 1 — Low (32 y/o, mild sepsis, room air)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillAfiss(page, {
      age: 32,
      bmi: 23,
      immunocompromised: "Not immunocompromised",
      septic_shock: "No septic shock",
      vasopressor_inotrope: "No vasopressor/inotrope",
      crp: 95,
      wbc: 12.0,
      renal_failure: "No renal failure",
      potassium: 4.1,
      fio2: 0.21,
    });
    await expectCalculatedDecimal(page, "risk_factor_count", 0);
    await expectCalculatedString(page, "risk_tier", "Low");
  });

  test("Test case 2 — Moderate (58 y/o, septic shock, single vasopressor)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillAfiss(page, {
      age: 58,
      bmi: 28,
      immunocompromised: "Not immunocompromised",
      septic_shock: "Septic shock",
      vasopressor_inotrope: "Vasopressor/inotrope",
      crp: 220,
      wbc: 18,
      renal_failure: "No renal failure",
      potassium: 4.6,
      fio2: 0.40,
    });
    await expectCalculatedDecimal(page, "risk_factor_count", 2);
    await expectCalculatedString(page, "risk_tier", "Moderate");
  });

  test("Test case 3 — High (78 y/o, immunocompromised, MOF)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillAfiss(page, {
      age: 78,
      bmi: 31,
      immunocompromised: "Immunocompromised",
      septic_shock: "Septic shock",
      vasopressor_inotrope: "Vasopressor/inotrope",
      crp: 380,
      wbc: 0.5,
      renal_failure: "Renal failure",
      potassium: 5.4,
      fio2: 0.80,
    });
    await expectCalculatedDecimal(page, "risk_factor_count", 8);
    await expectCalculatedString(page, "risk_tier", "High");
  });

  test("Test case 4 — Moderate (67 y/o, weaning vasopressor)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillAfiss(page, {
      age: 67,
      bmi: 26,
      immunocompromised: "Not immunocompromised",
      septic_shock: "No septic shock",
      vasopressor_inotrope: "Vasopressor/inotrope",
      crp: 110,
      wbc: 13,
      renal_failure: "No renal failure",
      potassium: 3.8,
      fio2: 0.35,
    });
    await expectCalculatedDecimal(page, "risk_factor_count", 1);
    await expectCalculatedString(page, "risk_tier", "Moderate");
  });

  test("Test case 5 — Low (24 y/o, near floor of predictor space)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillAfiss(page, {
      age: 24,
      bmi: 21,
      immunocompromised: "Not immunocompromised",
      septic_shock: "No septic shock",
      vasopressor_inotrope: "No vasopressor/inotrope",
      crp: 30,
      wbc: 8,
      renal_failure: "No renal failure",
      potassium: 4.2,
      fio2: 0.21,
    });
    await expectCalculatedDecimal(page, "risk_factor_count", 0);
    await expectCalculatedString(page, "risk_tier", "Low");
  });
});
