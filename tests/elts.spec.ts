import { test, expect, type Page } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  setNumber,
} from "./_helpers";

const SLUG = "elts";

/**
 * ELTS — EUTOS Long-Term Survival Score for chronic-phase CML.
 * Pfirrmann M et al., Leukemia 2016;30(1):48-56. Type 2 (formula).
 *
 * ELTS = 0.0025 × (age/10)^3 + 0.0615 × spleen_cm + 0.1052 × round(blasts_pct)
 *      + 0.4104 × (platelets/1000)^(-0.5)
 *
 * Cut-points: ≤ 1.5680 Low; > 1.5680 and ≤ 2.2185 Intermediate; > 2.2185 High.
 */

interface ELTSInputs {
  age: number;
  spleen_cm: number;
  blasts_pct: number;
  platelets: number;
}

/**
 * Wait until the decimal input for `linkId` is in the DOM.
 *
 * `openCalc` waits for `__tiroState === "ready"` but on cold-start runs the
 * SDK occasionally still has the inputs un-mounted by the time the readiness
 * flag flips. `setNumber` is a one-shot and doesn't poll, so without this
 * guard we hit "no item <linkId>" intermittently on the first input of a run.
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

async function fillInputs(page: Page, inputs: ELTSInputs): Promise<void> {
  await waitForInput(page, "age");
  await setNumber(page, "age", inputs.age);
  await waitForInput(page, "spleen_cm");
  await setNumber(page, "spleen_cm", inputs.spleen_cm);
  await waitForInput(page, "blasts_pct");
  await setNumber(page, "blasts_pct", inputs.blasts_pct);
  await waitForInput(page, "platelets");
  await setNumber(page, "platelets", inputs.platelets);
}

test.describe("ELTS — Pfirrmann 2016", () => {
  test("Test case 1 — 35 y, no splenomegaly, 0 % blasts, plt 320 (0.8327, Low)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { age: 35, spleen_cm: 0, blasts_pct: 0, platelets: 320 });

    await expectCalculatedDecimal(page, "score", 0.8327, 0.0001);
    await expectCalculatedString(page, "risk_group", "Low");
    await expectCalculatedDecimal(page, "ten_year_cml_specific_death_pct", 2);
    await expectCalculatedDecimal(
      page,
      "ten_year_cml_specific_survival_pct",
      98,
    );
  });

  test("Test case 2 — 52 y, spleen 2 cm, 1 % blasts, plt 280 (1.3553, Low)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { age: 52, spleen_cm: 2, blasts_pct: 1, platelets: 280 });

    await expectCalculatedDecimal(page, "score", 1.3553, 0.0001);
    await expectCalculatedString(page, "risk_group", "Low");
    await expectCalculatedDecimal(page, "ten_year_cml_specific_death_pct", 2);
    await expectCalculatedDecimal(
      page,
      "ten_year_cml_specific_survival_pct",
      98,
    );
  });

  test("Test case 3 — 60 y, spleen 5 cm, 2 % blasts, plt 220 (1.9329, Intermediate)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { age: 60, spleen_cm: 5, blasts_pct: 2, platelets: 220 });

    await expectCalculatedDecimal(page, "score", 1.9329, 0.0001);
    await expectCalculatedString(page, "risk_group", "Intermediate");
    await expectCalculatedDecimal(page, "ten_year_cml_specific_death_pct", 5);
    await expectCalculatedDecimal(
      page,
      "ten_year_cml_specific_survival_pct",
      95,
    );
  });

  test("Test case 4 — 72 y, spleen 12 cm, 6 % blasts, plt 180 (3.2696, High)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { age: 72, spleen_cm: 12, blasts_pct: 6, platelets: 180 });

    await expectCalculatedDecimal(page, "score", 3.2696, 0.0001);
    await expectCalculatedString(page, "risk_group", "High");
    await expectCalculatedDecimal(page, "ten_year_cml_specific_death_pct", 12);
    await expectCalculatedDecimal(
      page,
      "ten_year_cml_specific_survival_pct",
      88,
    );
  });

  test("Test case 5 — 82 y, spleen 25 cm, 12 % blasts, plt 60 (5.8538, High)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await fillInputs(page, { age: 82, spleen_cm: 25, blasts_pct: 12, platelets: 60 });

    await expectCalculatedDecimal(page, "score", 5.8538, 0.0001);
    await expectCalculatedString(page, "risk_group", "High");
    await expectCalculatedDecimal(page, "ten_year_cml_specific_death_pct", 12);
    await expectCalculatedDecimal(
      page,
      "ten_year_cml_specific_survival_pct",
      88,
    );
  });
});
