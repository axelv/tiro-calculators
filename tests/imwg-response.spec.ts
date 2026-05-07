import { test, type Page } from "@playwright/test";
import {
  expectCalculatedString,
  openCalc,
  selectChip,
  setNumber,
} from "./_helpers";

const SLUG = "imwg-response";

// Globally-unique chip displays — see questionnaire.json answerOption.display
const SIFE_NEG = "Serum IFE negative";
const SIFE_POS = "Serum IFE positive";
const UIFE_NEG = "Urine IFE negative";
const UIFE_POS = "Urine IFE positive";

const BM_POLYCLONAL = "BM polyclonal (no clonal plasma cells)";
const BM_CLONAL = "BM clonal plasma cells present";

const PLASM0_NO = "No baseline plasmacytoma";
const PLASM0_YES = "Baseline plasmacytoma present";

const PLASM_NEW_NO = "No new or enlarged plasmacytoma";

const NGF_NEG = "NGF MRD negative (≥10⁻⁵)";
const NGF_NOT = "NGF MRD positive or not done";

const NGS_NOT = "NGS MRD positive or not done";

const IMG_NEG = "Imaging MRD negative (PET resolution)";
const IMG_NOT = "Imaging MRD positive or not done";

const SUSTAINED_YES = "Sustained MRD ≥ 1 year";
const SUSTAINED_NO = "Not sustained ≥ 1 year";

const CONFIRMED_YES = "Confirmed on 2 consecutive assessments";

/**
 * Fill every decimal input exactly once. The Tiro SDK's re-render churn breaks
 * subsequent setNumber calls on the same field — they appear to apply but the
 * SDK overwrites the value during its debounced re-render. So we never call
 * setNumber twice for the same linkId in a single test.
 *
 * Defaults are chosen so unrelated predicates short-circuit to false.
 */
interface Decimals {
  serum_m_baseline_g_dL?: number;
  serum_m_current_g_dL?: number;
  serum_m_nadir_g_dL?: number;
  urine_m_baseline_mg_24h?: number;
  urine_m_current_mg_24h?: number;
  urine_m_nadir_mg_24h?: number;
  flc_ratio?: number;
  dflc_baseline_mg_L?: number;
  dflc_current_mg_L?: number;
  dflc_nadir_mg_L?: number;
  bmpc_baseline_pct?: number;
  bmpc_current_pct?: number;
  bmpc_nadir_pct?: number;
  plasmacytoma_spd_baseline_cm2?: number;
  plasmacytoma_spd_current_cm2?: number;
  corrected_calcium_mg_dL?: number;
}

const DEFAULTS: Required<Decimals> = {
  serum_m_baseline_g_dL: 0,
  serum_m_current_g_dL: 0,
  serum_m_nadir_g_dL: 0,
  urine_m_baseline_mg_24h: 0,
  urine_m_current_mg_24h: 0,
  urine_m_nadir_mg_24h: 0,
  flc_ratio: 1,
  dflc_baseline_mg_L: 0,
  dflc_current_mg_L: 0,
  dflc_nadir_mg_L: 0,
  bmpc_baseline_pct: 0,
  bmpc_current_pct: 0,
  bmpc_nadir_pct: 0,
  plasmacytoma_spd_baseline_cm2: 0,
  plasmacytoma_spd_current_cm2: 0,
  corrected_calcium_mg_dL: 9,
};

async function fillDecimals(page: Page, overrides: Decimals): Promise<void> {
  const merged: Required<Decimals> = { ...DEFAULTS, ...overrides };
  for (const [linkId, value] of Object.entries(merged)) {
    await setNumber(page, linkId, value);
  }
}

test.describe("IMWG 2016 Multiple Myeloma Response Criteria", () => {
  test("Test case 1 — Partial Response (PR)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillDecimals(page, {
      serum_m_baseline_g_dL: 4.2,
      serum_m_current_g_dL: 1.8,
      urine_m_baseline_mg_24h: 850,
      urine_m_current_mg_24h: 150,
      bmpc_baseline_pct: 45,
      bmpc_current_pct: 12,
    });

    await selectChip(page, "serum_ife", SIFE_POS);
    await selectChip(page, "urine_ife", UIFE_POS);
    await selectChip(page, "bm_clonality", BM_CLONAL);
    await selectChip(page, "plasmacytoma_baseline_present", PLASM0_NO);
    await selectChip(page, "plasmacytoma_new_or_enlarged", PLASM_NEW_NO);
    await selectChip(page, "mrd_ngf_negative", NGF_NOT);
    await selectChip(page, "mrd_ngs_negative", NGS_NOT);
    await selectChip(page, "mrd_imaging_negative", IMG_NOT);
    await selectChip(page, "mrd_sustained_ge_1y", SUSTAINED_NO);
    await selectChip(page, "confirmed_two_consecutive", CONFIRMED_YES);

    await expectCalculatedString(page, "category", "PR");
  });

  test("Test case 2 — Very Good Partial Response (VGPR)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillDecimals(page, {
      serum_m_baseline_g_dL: 3.6,
      serum_m_current_g_dL: 0, // undetectable on SPEP
      urine_m_baseline_mg_24h: 320,
      urine_m_current_mg_24h: 30,
      bmpc_baseline_pct: 38,
      bmpc_current_pct: 4,
    });

    await selectChip(page, "serum_ife", SIFE_POS);
    await selectChip(page, "urine_ife", UIFE_POS);
    await selectChip(page, "bm_clonality", BM_POLYCLONAL);
    await selectChip(page, "plasmacytoma_baseline_present", PLASM0_NO);
    await selectChip(page, "plasmacytoma_new_or_enlarged", PLASM_NEW_NO);
    await selectChip(page, "mrd_ngf_negative", NGF_NOT);
    await selectChip(page, "mrd_ngs_negative", NGS_NOT);
    await selectChip(page, "mrd_imaging_negative", IMG_NOT);
    await selectChip(page, "mrd_sustained_ge_1y", SUSTAINED_NO);
    await selectChip(page, "confirmed_two_consecutive", CONFIRMED_YES);

    await expectCalculatedString(page, "category", "VGPR");
  });

  test("Test case 3 — Stringent Complete Response (sCR)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillDecimals(page, {
      bmpc_current_pct: 1,
      flc_ratio: 0.95,
    });

    await selectChip(page, "serum_ife", SIFE_NEG);
    await selectChip(page, "urine_ife", UIFE_NEG);
    await selectChip(page, "bm_clonality", BM_POLYCLONAL);
    await selectChip(page, "plasmacytoma_baseline_present", PLASM0_NO);
    await selectChip(page, "plasmacytoma_new_or_enlarged", PLASM_NEW_NO);
    await selectChip(page, "mrd_ngf_negative", NGF_NOT);
    await selectChip(page, "mrd_ngs_negative", NGS_NOT);
    await selectChip(page, "mrd_imaging_negative", IMG_NOT);
    await selectChip(page, "mrd_sustained_ge_1y", SUSTAINED_NO);
    await selectChip(page, "confirmed_two_consecutive", CONFIRMED_YES);

    await expectCalculatedString(page, "category", "sCR");
  });

  test("Test case 4 — Sustained MRD-negative (deepest)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillDecimals(page, {
      flc_ratio: 1.10,
      plasmacytoma_spd_baseline_cm2: 5,
      plasmacytoma_spd_current_cm2: 0, // resolved
    });

    await selectChip(page, "serum_ife", SIFE_NEG);
    await selectChip(page, "urine_ife", UIFE_NEG);
    await selectChip(page, "bm_clonality", BM_POLYCLONAL);
    await selectChip(page, "plasmacytoma_baseline_present", PLASM0_YES);
    await selectChip(page, "plasmacytoma_new_or_enlarged", PLASM_NEW_NO);
    await selectChip(page, "mrd_ngf_negative", NGF_NEG);
    await selectChip(page, "mrd_ngs_negative", NGS_NOT);
    await selectChip(page, "mrd_imaging_negative", IMG_NEG);
    await selectChip(page, "mrd_sustained_ge_1y", SUSTAINED_YES);
    await selectChip(page, "confirmed_two_consecutive", CONFIRMED_YES);

    await expectCalculatedString(page, "category", "Sustained MRD-negative");
  });

  test("Test case 5 — Progressive Disease (PD) from nadir", async ({ page }) => {
    await openCalc(page, SLUG);
    // Per TEST_CASES.md: only nadir and current are reported (no original baseline
    // collected for this relapsed-MM workflow). PD is evaluated against nadir.
    await fillDecimals(page, {
      serum_m_current_g_dL: 1.2,
      serum_m_nadir_g_dL: 0.4,
      urine_m_current_mg_24h: 320,
      urine_m_nadir_mg_24h: 0,
      bmpc_current_pct: 8,
      bmpc_nadir_pct: 3,
      corrected_calcium_mg_dL: 9.5,
    });

    await selectChip(page, "serum_ife", SIFE_POS);
    await selectChip(page, "urine_ife", UIFE_POS);
    await selectChip(page, "bm_clonality", BM_CLONAL);
    await selectChip(page, "plasmacytoma_baseline_present", PLASM0_NO);
    await selectChip(page, "plasmacytoma_new_or_enlarged", PLASM_NEW_NO);
    await selectChip(page, "mrd_ngf_negative", NGF_NOT);
    await selectChip(page, "mrd_ngs_negative", NGS_NOT);
    await selectChip(page, "mrd_imaging_negative", IMG_NOT);
    await selectChip(page, "mrd_sustained_ge_1y", SUSTAINED_NO);
    await selectChip(page, "confirmed_two_consecutive", CONFIRMED_YES);

    await expectCalculatedString(page, "category", "PD");
  });
});
