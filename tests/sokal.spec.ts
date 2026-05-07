import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  setNumber,
} from "./_helpers";

const SLUG = "sokal";

/**
 * Sokal Index for CML — Playwright suite.
 *
 * Formula (Sokal et al., Blood 1984;63:789-799):
 *   exp( 0.0116 * (age - 43.4)
 *      + 0.0345 * (spleen_cm - 7.51)
 *      + 0.188  * ((platelets/700)^2 - 0.563)
 *      + 0.0887 * (blasts_pct - 2.10) )
 *
 * Risk bands: low < 0.8, intermediate 0.8-1.2, high > 1.2.
 *
 * Tolerance: SPEC reports the score to two decimal places. We assert with a
 * 0.01 tolerance so floating-point drift in the FHIRPath engine doesn't matter.
 */

test.describe("Sokal Index for CML", () => {
  test("Test case 1 — low risk, young patient (score ≈ 0.57)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 32);
    await setNumber(page, "spleen_cm", 0);
    await setNumber(page, "platelets", 280);
    await setNumber(page, "blasts_pct", 1);

    await expectCalculatedDecimal(page, "score", 0.5685, 0.01);
    await expectCalculatedString(page, "risk_group", "low");
  });

  test("Test case 2 — intermediate risk, near cohort mean (score ≈ 1.19)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 47);
    await setNumber(page, "spleen_cm", 8);
    await setNumber(page, "platelets", 600);
    await setNumber(page, "blasts_pct", 3);

    await expectCalculatedDecimal(page, "score", 1.1862, 0.01);
    await expectCalculatedString(page, "risk_group", "intermediate");
  });

  test("Test case 3 — high risk, massive splenomegaly (score ≈ 4.39)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 68);
    await setNumber(page, "spleen_cm", 20);
    await setNumber(page, "platelets", 950);
    await setNumber(page, "blasts_pct", 8);

    await expectCalculatedDecimal(page, "score", 4.3929, 0.01);
    await expectCalculatedString(page, "risk_group", "high");
  });

  test("Test case 4 — minimum-score patient (score ≈ 0.47)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 25);
    await setNumber(page, "spleen_cm", 0);
    await setNumber(page, "platelets", 200);
    await setNumber(page, "blasts_pct", 0);

    await expectCalculatedDecimal(page, "score", 0.4727, 0.01);
    await expectCalculatedString(page, "risk_group", "low");
  });

  test("Test case 5 — extreme thrombocytosis (score ≈ 5.39)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 55);
    await setNumber(page, "spleen_cm", 12);
    await setNumber(page, "platelets", 1800);
    await setNumber(page, "blasts_pct", 5);

    await expectCalculatedDecimal(page, "score", 5.3866, 0.01);
    await expectCalculatedString(page, "risk_group", "high");
  });
});
