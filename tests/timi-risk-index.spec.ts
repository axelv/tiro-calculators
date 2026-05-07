import { test, expect, type Page } from "@playwright/test";
import {
  openCalc,
  setNumber,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "timi-risk-index";

/**
 * TIMI Risk Index — bedside short-term mortality estimate in ACS.
 *
 * Type 2 (closed-form formula) + Type 3 (lookup tables).
 *
 * Formula: TRI = HR * (Age / 10)^2 / SBP
 * Quintile cut-points (per SPEC §4.1): 12.5 / 17.5 / 22.5 / 30.0
 *
 * TRI tolerance ±0.05 (SPEC reports values to 1-2 decimals).
 * Mortality % is an exact lookup (default 1e-3 tolerance).
 */

interface Inputs {
  heart_rate: number;
  systolic_bp: number;
  age: number;
}

/**
 * `openCalc` waits for `__tiroState === "ready"` but the SDK occasionally has
 * the inputs un-mounted by the time the readiness flag flips. `setNumber`
 * doesn't poll — guard it with this readiness check (same idiom as
 * adhere.spec.ts).
 */
async function waitForInput(page: Page, linkId: string): Promise<void> {
  await expect
    .poll(
      async () =>
        page.evaluate((id) => {
          const filler = document.querySelector("tiro-form-filler");
          const root = filler?.shadowRoot;
          const wrapper = root?.querySelector(`[data-testid="${id}"]`);
          return !!wrapper?.querySelector("input");
        }, linkId),
      { timeout: 6_000, intervals: [50, 100, 200, 400] },
    )
    .toBe(true);
}

async function fillInputs(page: Page, inputs: Inputs): Promise<void> {
  await waitForInput(page, "heart_rate");
  await setNumber(page, "heart_rate", inputs.heart_rate);
  await waitForInput(page, "systolic_bp");
  await setNumber(page, "systolic_bp", inputs.systolic_bp);
  await waitForInput(page, "age");
  await setNumber(page, "age", inputs.age);
}

test.describe("TIMI Risk Index", () => {
  test("Test case 1 — Q1 low (HR 72, age 42, SBP 138 → 9.20)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { heart_rate: 72, age: 42, systolic_bp: 138 });
    await expectCalculatedDecimal(page, "tri", 9.20, 0.05);
    await expectCalculatedDecimal(page, "quintile", 1);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mortality_30d_estimate_pct", 0.8);
    await expectCalculatedDecimal(page, "mortality_24h_estimate_pct", 0.4);
  });

  test("Test case 2 — Q3 intermediate (HR 78, age 58, SBP 142 → 18.48)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { heart_rate: 78, age: 58, systolic_bp: 142 });
    await expectCalculatedDecimal(page, "tri", 18.48, 0.05);
    await expectCalculatedDecimal(page, "quintile", 3);
    await expectCalculatedString(page, "risk_band", "intermediate");
    await expectCalculatedDecimal(page, "mortality_30d_estimate_pct", 2.9);
    await expectCalculatedDecimal(page, "mortality_24h_estimate_pct", 1.6);
  });

  test("Test case 3 — Q5 very high (HR 102, age 68, SBP 108 → 43.67)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { heart_rate: 102, age: 68, systolic_bp: 108 });
    await expectCalculatedDecimal(page, "tri", 43.67, 0.05);
    await expectCalculatedDecimal(page, "quintile", 5);
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedDecimal(page, "mortality_30d_estimate_pct", 16.1);
    await expectCalculatedDecimal(page, "mortality_24h_estimate_pct", 6.9);
  });

  test("Test case 4 — Q5 cardiogenic shock (HR 118, age 84, SBP 82 → 101.54)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { heart_rate: 118, age: 84, systolic_bp: 82 });
    await expectCalculatedDecimal(page, "tri", 101.54, 0.05);
    await expectCalculatedDecimal(page, "quintile", 5);
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedDecimal(page, "mortality_30d_estimate_pct", 16.1);
    await expectCalculatedDecimal(page, "mortality_24h_estimate_pct", 6.9);
  });

  test("Test case 5 — Q1 minimum plausible (HR 55, age 19, SBP 130 → 1.53)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { heart_rate: 55, age: 19, systolic_bp: 130 });
    await expectCalculatedDecimal(page, "tri", 1.53, 0.05);
    await expectCalculatedDecimal(page, "quintile", 1);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "mortality_30d_estimate_pct", 0.8);
    await expectCalculatedDecimal(page, "mortality_24h_estimate_pct", 0.4);
  });
});
