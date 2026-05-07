import { test } from "@playwright/test";
import {
  openCalc,
  selectChip,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "killip";

const CLASS_I = "Class I — No HF signs";
const CLASS_II = "Class II — S3 and/or rales <50% of lung fields";
const CLASS_III = "Class III — Pulmonary oedema, rales >50% of lung fields";
const CLASS_IV = "Class IV — Cardiogenic shock";

const INTERP_I =
  "No clinical signs of heart failure; lowest mortality stratum.";
const INTERP_II =
  "Mild–moderate left-ventricular failure; ~3× the Class I mortality.";
const INTERP_III =
  "Acute pulmonary oedema; urgent reperfusion, NIV, IV diuretic, vasodilator therapy.";
const INTERP_IV =
  "Cardiogenic shock; emergent revascularisation, vasopressors / inotropes, mechanical circulatory support.";

test.describe("Killip Classification for Heart Failure", () => {
  test("Test case 1 — Class I (no HF signs)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "killip_class", CLASS_I);
    await expectCalculatedString(page, "killip_class_output", "I");
    await expectCalculatedDecimal(page, "mortality_30d_modern_pct", 2.8);
    await expectCalculatedDecimal(page, "mortality_6m_modern_pct", 5.0);
    await expectCalculatedDecimal(page, "mortality_inhospital_original_pct", 6);
    await expectCalculatedString(page, "interpretation", INTERP_I);
  });

  test("Test case 2 — Class II (S3 only)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "killip_class", CLASS_II);
    await expectCalculatedString(page, "killip_class_output", "II");
    await expectCalculatedDecimal(page, "mortality_30d_modern_pct", 8.8);
    await expectCalculatedDecimal(page, "mortality_6m_modern_pct", 14.7);
    await expectCalculatedDecimal(page, "mortality_inhospital_original_pct", 17);
    await expectCalculatedString(page, "interpretation", INTERP_II);
  });

  test("Test case 3 — Class II (rales <50% of lung fields)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "killip_class", CLASS_II);
    await expectCalculatedString(page, "killip_class_output", "II");
    await expectCalculatedDecimal(page, "mortality_30d_modern_pct", 8.8);
    await expectCalculatedDecimal(page, "mortality_6m_modern_pct", 14.7);
    await expectCalculatedDecimal(page, "mortality_inhospital_original_pct", 17);
    await expectCalculatedString(page, "interpretation", INTERP_II);
  });

  test("Test case 4 — Class III (acute pulmonary oedema)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "killip_class", CLASS_III);
    await expectCalculatedString(page, "killip_class_output", "III");
    await expectCalculatedDecimal(page, "mortality_30d_modern_pct", 14.4);
    await expectCalculatedDecimal(page, "mortality_6m_modern_pct", 23.0);
    await expectCalculatedDecimal(page, "mortality_inhospital_original_pct", 38);
    await expectCalculatedString(page, "interpretation", INTERP_III);
  });

  test("Test case 5 — Class IV (cardiogenic shock)", async ({ page }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "killip_class", CLASS_IV);
    await expectCalculatedString(page, "killip_class_output", "IV");
    await expectCalculatedDecimal(page, "mortality_30d_modern_pct", 14.4);
    await expectCalculatedDecimal(page, "mortality_6m_modern_pct", 23.0);
    await expectCalculatedDecimal(page, "mortality_inhospital_original_pct", 81);
    await expectCalculatedString(page, "interpretation", INTERP_IV);
  });
});
