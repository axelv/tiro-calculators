import { test, type Page } from "@playwright/test";
import { openCalc, expectCalculatedString } from "./_helpers";

const SLUG = "r-iss";

// Chip option displays — globally unique per the questionnaire so we can click by
// button name directly (the form renderer doesn't expose semantic question groups
// that would let `selectChip` scope by question text).
const B2M_LT_35 = "< 3.5 mg/L";
const B2M_MID = "3.5 to < 5.5 mg/L";
const B2M_GTE_55 = "≥ 5.5 mg/L";

const ALB_LT_35 = "< 3.5 g/dL";
const ALB_GTE_35 = "≥ 3.5 g/dL";

const CA_ABSENT = "Absent (standard-risk)";
const CA_PRESENT = "Present (high-risk)";

const LDH_NORMAL = "Normal (≤ ULN)";
const LDH_ELEVATED = "Elevated (> ULN)";

async function clickChip(page: Page, optionDisplay: string): Promise<void> {
  await page.getByRole("button", { name: optionDisplay, exact: true }).first().click();
}

test.describe("R-ISS — Revised International Staging System", () => {
  test("Test case 1 — R-ISS I: β2M 2.6, alb 4.1, CA absent, LDH normal", async ({ page }) => {
    await openCalc(page, SLUG);
    await clickChip(page, B2M_LT_35);
    await clickChip(page, ALB_GTE_35);
    await clickChip(page, CA_ABSENT);
    await clickChip(page, LDH_NORMAL);
    await expectCalculatedString(page, "classification", "R-ISS I");
  });

  test("Test case 2 — R-ISS II via ISS I + high-risk CA: β2M 2.9, alb 3.9, CA present, LDH normal", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await clickChip(page, B2M_LT_35);
    await clickChip(page, ALB_GTE_35);
    await clickChip(page, CA_PRESENT);
    await clickChip(page, LDH_NORMAL);
    await expectCalculatedString(page, "classification", "R-ISS II");
  });

  test("Test case 3 — R-ISS II from ISS II baseline: β2M 4.1, alb 3.7, CA absent, LDH elevated", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await clickChip(page, B2M_MID);
    await clickChip(page, ALB_GTE_35);
    await clickChip(page, CA_ABSENT);
    await clickChip(page, LDH_ELEVATED);
    await expectCalculatedString(page, "classification", "R-ISS II");
  });

  test("Test case 4 — R-ISS II via ISS III downgrade: β2M 6.4, alb 2.9, CA absent, LDH normal", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await clickChip(page, B2M_GTE_55);
    await clickChip(page, ALB_LT_35);
    await clickChip(page, CA_ABSENT);
    await clickChip(page, LDH_NORMAL);
    await expectCalculatedString(page, "classification", "R-ISS II");
  });

  test("Test case 5 — R-ISS III: β2M 9.8, alb 2.4, CA present, LDH elevated", async ({ page }) => {
    await openCalc(page, SLUG);
    await clickChip(page, B2M_GTE_55);
    await clickChip(page, ALB_LT_35);
    await clickChip(page, CA_PRESENT);
    await clickChip(page, LDH_ELEVATED);
    await expectCalculatedString(page, "classification", "R-ISS III");
  });
});
