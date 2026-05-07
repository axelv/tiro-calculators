import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "subtle-anterior-stemi";

/**
 * Subtle Anterior STEMI (4-variable Driver/Smith) — Playwright suite.
 *
 * Formula (SPEC §3):
 *   Value = 0.052·QTc − 0.151·QRSV2 − 0.268·RV4 + 1.062·STE60V3
 * Threshold: Value >= 18.2 → Smith-positive.
 *
 * All five test cases assume preconditions met and no exclusions, so we click
 * the "met" / "no" chips for the entry criterion and the seven exclusion items.
 * Tolerance 0.05 follows the SPEC's two-decimal rounding for the worked
 * examples in TEST_CASES.md.
 */

interface Inputs {
  qtc: number;
  qrs_v2: number;
  r_v4: number;
  ste60_v3: number;
}

async function fillPreconditions(page: import("@playwright/test").Page): Promise<void> {
  await selectChip(page, "ste_v2_v4_ge_1mm", "Entry criterion met");
  await selectChip(page, "excl_ste_gt_5mm", "No STE > 5 mm");
  await selectChip(page, "excl_non_concave_st", "ST morphology concave");
  await selectChip(page, "excl_inferior_recip_depression", "No inferior reciprocal depression");
  await selectChip(page, "excl_anterior_st_depression", "No anterior ST depression");
  await selectChip(page, "excl_terminal_qrs_distortion_v2v3", "No terminal QRS distortion");
  await selectChip(page, "excl_q_waves_v2_v4", "No pathologic Q waves");
  await selectChip(page, "excl_t_inversion_v2_v6", "No T-wave inversion");
}

async function fillNumerics(
  page: import("@playwright/test").Page,
  inputs: Inputs,
): Promise<void> {
  await setNumber(page, "qtc", inputs.qtc);
  await setNumber(page, "qrs_v2", inputs.qrs_v2);
  await setNumber(page, "r_v4", inputs.r_v4);
  await setNumber(page, "ste60_v3", inputs.ste60_v3);
}

test.describe("Subtle Anterior STEMI Calculator (4-Variable)", () => {
  test("Test case 1 — classic BER, score ~13.21 (Smith-negative)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillPreconditions(page);
    await fillNumerics(page, { qtc: 380, qrs_v2: 22, r_v4: 18, ste60_v3: 1.5 });

    await expectCalculatedDecimal(page, "score", 13.207, 0.01);
    await expectCalculatedString(page, "smith_positive", "No");
    await expectCalculatedString(page, "interpretation", /Smith-negative/);
  });

  test("Test case 2 — borderline, score ~18.95 (Smith-positive)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillPreconditions(page);
    await fillNumerics(page, { qtc: 410, qrs_v2: 12, r_v4: 10, ste60_v3: 2 });

    await expectCalculatedDecimal(page, "score", 18.952, 0.01);
    await expectCalculatedString(page, "smith_positive", "Yes");
    await expectCalculatedString(page, "interpretation", /Smith-positive/);
  });

  test("Test case 3 — high-risk subtle LAD occlusion, score ~23.36", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillPreconditions(page);
    await fillNumerics(page, { qtc: 445, qrs_v2: 9, r_v4: 6, ste60_v3: 3 });

    await expectCalculatedDecimal(page, "score", 23.359, 0.01);
    await expectCalculatedString(page, "smith_positive", "Yes");
    await expectCalculatedString(page, "interpretation", /Smith-positive/);
  });

  test("Test case 4 — athletic-heart minimum, score ~8.55 (Smith-negative)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillPreconditions(page);
    await fillNumerics(page, { qtc: 360, qrs_v2: 30, r_v4: 25, ste60_v3: 1 });

    await expectCalculatedDecimal(page, "score", 8.552, 0.01);
    await expectCalculatedString(page, "smith_positive", "No");
    await expectCalculatedString(page, "interpretation", /Smith-negative/);
  });

  test("Test case 5 — high-probability LAD occlusion, score ~28.03", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillPreconditions(page);
    await fillNumerics(page, { qtc: 480, qrs_v2: 6, r_v4: 3, ste60_v3: 4.5 });

    await expectCalculatedDecimal(page, "score", 28.029, 0.01);
    await expectCalculatedString(page, "smith_positive", "Yes");
    await expectCalculatedString(page, "interpretation", /Smith-positive/);
  });
});
