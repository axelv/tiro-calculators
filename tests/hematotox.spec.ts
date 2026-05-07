import { test, expect, type Page } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  setNumber,
} from "./_helpers";

const SLUG = "hematotox";

interface Inputs {
  platelet: number;
  anc: number;
  hgb: number;
  crp: number;
  fer: number;
}

/**
 * `openCalc` waits for `__tiroState === "ready"` but on cold-start runs the
 * SDK occasionally still has the decimal inputs un-mounted by the time the
 * readiness flag flips. `setNumber` is a one-shot and doesn't poll, so we
 * guard the first fill with this helper (same pattern as adhere.spec.ts).
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
  await waitForInput(page, "platelet_x10e9_per_L");
  await setNumber(page, "platelet_x10e9_per_L", inputs.platelet);
  await waitForInput(page, "anc_per_uL");
  await setNumber(page, "anc_per_uL", inputs.anc);
  await waitForInput(page, "hemoglobin_g_dL");
  await setNumber(page, "hemoglobin_g_dL", inputs.hgb);
  await waitForInput(page, "crp_mg_dL");
  await setNumber(page, "crp_mg_dL", inputs.crp);
  await waitForInput(page, "ferritin_ng_mL");
  await setNumber(page, "ferritin_ng_mL", inputs.fer);
}

test.describe("CAR-HEMATOTOX — Rejeski 2021 pre-lymphodepletion risk score", () => {
  test("Test case 1 — HT 0 (HT-low): plt 220, ANC 3400, Hb 12.4, CRP 0.8, ferritin 180", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { platelet: 220, anc: 3400, hgb: 12.4, crp: 0.8, fer: 180 });

    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "category", "HT-low");
    await expectCalculatedString(page, "category_3tier", "low");
  });

  test("Test case 2 — HT 1 (HT-low edge): plt 130, ANC 1800, Hb 10.5, CRP 1.4, ferritin 320", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { platelet: 130, anc: 1800, hgb: 10.5, crp: 1.4, fer: 320 });

    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "category", "HT-low");
    await expectCalculatedString(page, "category_3tier", "low");
  });

  test("Test case 3 — HT 3 (HT-high, intermediate 3-tier): plt 110, ANC 950, Hb 10.1, CRP 4.2, ferritin 540", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { platelet: 110, anc: 950, hgb: 10.1, crp: 4.2, fer: 540 });

    await expectCalculatedDecimal(page, "score", 3);
    await expectCalculatedString(page, "category", "HT-high");
    await expectCalculatedString(page, "category_3tier", "intermediate");
  });

  test("Test case 4 — HT 5 (HT-high, ultra high 3-tier): plt 60, ANC 700, Hb 8.5, CRP 2.4, ferritin 1400", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { platelet: 60, anc: 700, hgb: 8.5, crp: 2.4, fer: 1400 });

    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedString(page, "category", "HT-high");
    await expectCalculatedString(page, "category_3tier", "high");
  });

  test("Test case 5 — HT 7 (max): plt 40, ANC 400, Hb 7.8, CRP 9.5, ferritin 3200", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { platelet: 40, anc: 400, hgb: 7.8, crp: 9.5, fer: 3200 });

    await expectCalculatedDecimal(page, "score", 7);
    await expectCalculatedString(page, "category", "HT-high");
    await expectCalculatedString(page, "category_3tier", "high");
  });
});
