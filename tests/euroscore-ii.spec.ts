import { test, type Page } from "@playwright/test";
import {
  openCalc,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "euroscore-ii";

/**
 * EuroSCORE II — Playwright suite.
 *
 * Coefficients per SPEC §3.3 (Nashef et al. 2012, Table 4).
 * Tolerance: 0.05 percentage-point — SPEC says "reproduce to within rounding".
 */

interface EuroInputs {
  age: number;
  sex: string;
  renal: string;
  extracardiac_arteriopathy: string;
  poor_mobility: string;
  previous_cardiac_surgery: string;
  chronic_lung_disease: string;
  active_endocarditis: string;
  critical_preoperative_state: string;
  diabetes_on_insulin: string;
  nyha: string;
  ccs_class_4: string;
  lv: string;
  recent_mi: string;
  pap: string;
  urgency: string;
  weight_of_procedure: string;
  thoracic_aorta_surgery: string;
}

const baseline: EuroInputs = {
  age: 60,
  sex: "Male",
  renal: "Normal (CC > 85 mL/min)",
  extracardiac_arteriopathy: "No",
  poor_mobility: "No",
  previous_cardiac_surgery: "No",
  chronic_lung_disease: "No",
  active_endocarditis: "No",
  critical_preoperative_state: "No",
  diabetes_on_insulin: "No",
  nyha: "I",
  ccs_class_4: "No",
  lv: "Good (>= 51 %)",
  recent_mi: "No",
  pap: "< 31 mmHg",
  urgency: "Elective",
  weight_of_procedure: "Isolated CABG",
  thoracic_aorta_surgery: "No",
};

/**
 * The Tiro web SDK renders inside a custom element with shadow DOM and uses
 * `<input name="inputs.<linkId>.answer">` for numeric/text fields and chip
 * buttons (with text matching `display`) for coding items. We pierce shadow
 * roots and select by `name`/`textContent` because Playwright's `getByLabel`
 * doesn't see SDK-rendered labels.
 */
async function fillEuroscore(page: Page, inputs: EuroInputs): Promise<void> {
  // Wait until the SDK has actually rendered the age <input> (the only number
  // field — useful as a render readiness signal). The SDK fires `tiro-ready`
  // before its template fully paints in some browsers.
  await page.waitForFunction(() => {
    const filler = document.querySelector("tiro-form-filler");
    if (!filler) return false;
    const found: { ok: boolean } = { ok: false };
    const visit = (node: Element | null): void => {
      if (!node || found.ok) return;
      if (node.tagName === "INPUT" && (node as HTMLInputElement).name === "inputs.age.answer") {
        found.ok = true;
        return;
      }
      const sr = (node as HTMLElement).shadowRoot;
      if (sr) Array.from(sr.children).forEach((c) => visit(c));
      if (node.children) Array.from(node.children).forEach((c) => visit(c));
    };
    visit(filler);
    return found.ok;
  }, { timeout: 10_000 });

  await page.evaluate((data) => {
    const filler = document.querySelector("tiro-form-filler") as HTMLElement | null;
    if (!filler) throw new Error("tiro-form-filler not found");

    // Walk the DOM (including shadow roots) to collect inputs and buttons in
    // the order they appear (so chip order maps to questionnaire item order).
    const numberInputs = new Map<string, HTMLInputElement>();
    const chipButtons: HTMLButtonElement[] = [];
    const visit = (node: Element | null): void => {
      if (!node) return;
      if (node.tagName === "INPUT") {
        const inp = node as HTMLInputElement;
        if (inp.name) numberInputs.set(inp.name, inp);
      }
      if (node.tagName === "BUTTON") {
        const btn = node as HTMLButtonElement;
        const txt = btn.textContent?.trim() ?? "";
        if (txt.length > 0 && btn.querySelector("img") === null) {
          chipButtons.push(btn);
        }
      }
      const sr = (node as HTMLElement).shadowRoot;
      if (sr) Array.from(sr.children).forEach((c) => visit(c));
      if (node.children) Array.from(node.children).forEach((c) => visit(c));
    };
    visit(filler);

    // Fill the age decimal input.
    const ageInput = numberInputs.get("inputs.age.answer");
    if (!ageInput) throw new Error("age input not found");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
    setter.call(ageInput, String(data.age));
    ageInput.dispatchEvent(new Event("input", { bubbles: true }));
    ageInput.dispatchEvent(new Event("change", { bubbles: true }));
    ageInput.dispatchEvent(new Event("blur", { bubbles: true }));

    // Chip buttons appear in questionnaire order. We need to click one button
    // per group with the requested display text.  Group boundaries align with
    // the order of input items in the SPEC.
    // Group sizes (in DOM order, matching the questionnaire `inputs` group):
    const groups: Array<{ name: keyof typeof data; size: number; want: string }> = [
      { name: "sex",                          size: 2, want: data.sex },
      { name: "renal",                        size: 4, want: data.renal },
      { name: "extracardiac_arteriopathy",    size: 2, want: data.extracardiac_arteriopathy },
      { name: "poor_mobility",                size: 2, want: data.poor_mobility },
      { name: "previous_cardiac_surgery",     size: 2, want: data.previous_cardiac_surgery },
      { name: "chronic_lung_disease",         size: 2, want: data.chronic_lung_disease },
      { name: "active_endocarditis",          size: 2, want: data.active_endocarditis },
      { name: "critical_preoperative_state",  size: 2, want: data.critical_preoperative_state },
      { name: "diabetes_on_insulin",          size: 2, want: data.diabetes_on_insulin },
      { name: "nyha",                         size: 4, want: data.nyha },
      { name: "ccs_class_4",                  size: 2, want: data.ccs_class_4 },
      { name: "lv",                           size: 4, want: data.lv },
      { name: "recent_mi",                    size: 2, want: data.recent_mi },
      { name: "pap",                          size: 3, want: data.pap },
      { name: "urgency",                      size: 4, want: data.urgency },
      { name: "weight_of_procedure",          size: 4, want: data.weight_of_procedure },
      { name: "thoracic_aorta_surgery",       size: 2, want: data.thoracic_aorta_surgery },
    ];

    let cursor = 0;
    for (const g of groups) {
      const slice = chipButtons.slice(cursor, cursor + g.size);
      const target = slice.find((b) => b.textContent?.trim() === g.want);
      if (!target) {
        throw new Error(
          `chip not found for ${String(g.name)}: wanted "${g.want}" in ${slice.map((b) => `"${b.textContent?.trim()}"`).join(", ")}`,
        );
      }
      target.click();
      cursor += g.size;
    }
  }, inputs);
}

test.describe("EuroSCORE II", () => {
  test("Test case 1 — minimal-risk 58 y/o male, isolated CABG (~0.50 %)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillEuroscore(page, { ...baseline, age: 58 });
    await expectCalculatedDecimal(page, "predicted_mortality_percent", 0.50, 0.05);
    await expectCalculatedString(page, "risk_stratum", "Low");
  });

  test("Test case 2 — 70 y/o male, NYHA II, LV moderate, CC 50-85 (~1.36 %)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillEuroscore(page, {
      ...baseline,
      age: 70,
      nyha: "II",
      lv: "Moderate (31-50 %)",
      renal: "Moderate (CC 50-85 mL/min)",
    });
    await expectCalculatedDecimal(page, "predicted_mortality_percent", 1.36, 0.05);
    await expectCalculatedString(page, "risk_stratum", "Low");
  });

  test("Test case 3 — 78 y/o female, CABG+AVR, NYHA III (~6.05 %)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillEuroscore(page, {
      ...baseline,
      age: 78,
      sex: "Female",
      nyha: "III",
      lv: "Moderate (31-50 %)",
      renal: "Moderate (CC 50-85 mL/min)",
      weight_of_procedure: "Two procedures",
      diabetes_on_insulin: "Yes",
    });
    await expectCalculatedDecimal(page, "predicted_mortality_percent", 6.05, 0.05);
    await expectCalculatedString(page, "risk_stratum", "Intermediate");
  });

  test("Test case 4 — 75 y/o, urgent re-do CABG+AVR, LV poor (~40.6 %)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillEuroscore(page, {
      ...baseline,
      age: 75,
      nyha: "III",
      lv: "Poor (21-30 %)",
      renal: "Severe (CC < 50 mL/min)",
      previous_cardiac_surgery: "Yes",
      extracardiac_arteriopathy: "Yes",
      urgency: "Urgent",
      weight_of_procedure: "Two procedures",
    });
    await expectCalculatedDecimal(page, "predicted_mortality_percent", 40.60, 0.05);
    await expectCalculatedString(page, "risk_stratum", "High");
  });

  test("Test case 5 — 76 y/o salvage, three+ procedures, very-poor LV (~97.4 %)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillEuroscore(page, {
      ...baseline,
      age: 76,
      nyha: "IV",
      lv: "Very poor (<= 20 %)",
      renal: "On dialysis",
      previous_cardiac_surgery: "Yes",
      active_endocarditis: "Yes",
      critical_preoperative_state: "Yes",
      diabetes_on_insulin: "Yes",
      recent_mi: "Yes",
      urgency: "Salvage",
      weight_of_procedure: "Three or more procedures",
      thoracic_aorta_surgery: "Yes",
    });
    await expectCalculatedDecimal(page, "predicted_mortality_percent", 97.38, 0.05);
    await expectCalculatedString(page, "risk_stratum", "High");
  });
});
