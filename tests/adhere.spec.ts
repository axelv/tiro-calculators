import { test, expect, type Page } from "@playwright/test";
import {
  openCalc,
  setNumber,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "adhere";

/**
 * ADHERE in-hospital mortality risk-stratification CART (Type 3 — discrete logic).
 *
 * Inputs: BUN (mg/dL), SBP (mmHg), Cr (mg/dL).
 * Tree (SPEC §3):
 *   BUN < 43, SBP >= 115            → very_low      (Low Risk,            2.1 % / 2.0 %)
 *   BUN < 43, SBP < 115             → low           (Intermediate Risk 3, 7.0 % / 5.7 %)
 *   BUN >= 43, SBP >= 115           → intermediate  (Intermediate Risk 2, 9.4 % / 8.1 %)
 *   BUN >= 43, SBP < 115, Cr < 2.75 → high          (Intermediate Risk 1, 15.3 % / 13.2 %)
 *   BUN >= 43, SBP < 115, Cr >= 2.75 → very_high    (High Risk,           21.9 % / 21.4 %)
 *
 * Inputs are pre-rounded numbers from SPEC; outputs use exact-decimal tolerance
 * (1e-3) since they're picked from a fixed lookup table.
 */

interface Inputs {
  BUN: number;
  SBP: number;
  Cr: number;
}

/**
 * Wait until the decimal input for `linkId` is in the DOM.
 *
 * `openCalc` waits for `__tiroState === "ready"` but on cold-start runs the
 * SDK occasionally still has the inputs un-mounted by the time the readiness
 * flag flips. `setNumber` is a one-shot and doesn't poll, so without this
 * guard we hit "no item BUN" intermittently on the first input of a run.
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
  await waitForInput(page, "BUN");
  await setNumber(page, "BUN", inputs.BUN);
  await waitForInput(page, "SBP");
  await setNumber(page, "SBP", inputs.SBP);
  await waitForInput(page, "Cr");
  await setNumber(page, "Cr", inputs.Cr);
}

test.describe("ADHERE — in-hospital mortality CART", () => {
  test("Test case 1 — very low: BUN 22, SBP 142, Cr 1.1", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { BUN: 22, SBP: 142, Cr: 1.1 });
    await expectCalculatedString(page, "risk_band", "very_low");
    await expectCalculatedString(page, "adhere_label", "Low Risk");
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 2.1);
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct_validation", 2.0);
  });

  test("Test case 2 — low: BUN 36, SBP 104, Cr 1.6", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { BUN: 36, SBP: 104, Cr: 1.6 });
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedString(page, "adhere_label", "Intermediate Risk 3");
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 7.0);
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct_validation", 5.7);
  });

  test("Test case 3 — intermediate: BUN 58, SBP 138, Cr 1.9", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { BUN: 58, SBP: 138, Cr: 1.9 });
    await expectCalculatedString(page, "risk_band", "intermediate");
    await expectCalculatedString(page, "adhere_label", "Intermediate Risk 2");
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 9.4);
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct_validation", 8.1);
  });

  test("Test case 4 — high: BUN 64, SBP 102, Cr 2.3", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { BUN: 64, SBP: 102, Cr: 2.3 });
    await expectCalculatedString(page, "risk_band", "high");
    await expectCalculatedString(page, "adhere_label", "Intermediate Risk 1");
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 15.3);
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct_validation", 13.2);
  });

  test("Test case 5 — very high (top of tree): BUN 92, SBP 88, Cr 3.4", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { BUN: 92, SBP: 88, Cr: 3.4 });
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedString(page, "adhere_label", "High Risk");
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct", 21.9);
    await expectCalculatedDecimal(page, "in_hospital_mortality_pct_validation", 21.4);
  });
});
