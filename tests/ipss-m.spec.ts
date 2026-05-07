import { test, type Page } from "@playwright/test";
import {
  openCalc,
  selectChip,
  setNumber,
  expectCalculatedDecimal,
  expectCalculatedString,
} from "./_helpers";

const SLUG = "ipss-m";

/**
 * IPSS-M — Playwright suite.
 *
 * Score is a linear combination of mean-centred features on log₂ HR scale,
 * using SPEC §3.2 reference means (papaemmelab/ipssm Bernard 2022). With those
 * means the five TEST_CASES land in the same risk bands as documented even
 * though the absolute score differs by a few hundredths from TEST_CASES.md
 * (which uses a slightly different means snapshot). Tolerance: 0.05 log₂-HR
 * units on the continuous score, exact match on the categorical band.
 */

const CYTO_VERY_GOOD = "Very Good";
const CYTO_GOOD = "Good";
const CYTO_INT = "Intermediate";
const CYTO_POOR = "Poor";
const CYTO_VERY_POOR = "Very Poor";

// Helper: select all gene wild-type defaults, then override the listed mutated genes.
const ALL_GENE_LINKIDS = [
  "TP53multi", "FLT3", "MLL_PTD", "SF3B1_5q", "SF3B1_alpha",
  "NPM1", "RUNX1", "NRAS", "ETV6", "IDH2",
  "CBL", "EZH2", "U2AF1", "SRSF2", "DNMT3A",
  "ASXL1", "KRAS",
  "BCOR", "BCORL1", "CEBPA", "ETNK1", "GATA2",
  "GNB1", "IDH1", "NF1", "PHF6", "PPM1D",
  "PRPF8", "PTPN11", "SETBP1", "STAG2", "WT1",
] as const;

// Map linkId → ("wild-type" display, "mutated" display) so we can drive the
// chip selector deterministically.
const GENE_DISPLAYS: Record<string, [string, string]> = {
  TP53multi: ["TP53 mono / wild-type", "TP53 multi-hit"],
  FLT3: ["FLT3 wild-type", "FLT3 mutated"],
  MLL_PTD: ["MLL-PTD absent", "MLL-PTD present"],
  SF3B1_5q: ["SF3B1+del(5q) absent", "SF3B1+del(5q) present"],
  SF3B1_alpha: ["SF3B1-alpha absent", "SF3B1-alpha present"],
  NPM1: ["NPM1 wild-type", "NPM1 mutated"],
  RUNX1: ["RUNX1 wild-type", "RUNX1 mutated"],
  NRAS: ["NRAS wild-type", "NRAS mutated"],
  ETV6: ["ETV6 wild-type", "ETV6 mutated"],
  IDH2: ["IDH2 wild-type", "IDH2 mutated"],
  CBL: ["CBL wild-type", "CBL mutated"],
  EZH2: ["EZH2 wild-type", "EZH2 mutated"],
  U2AF1: ["U2AF1 wild-type", "U2AF1 mutated"],
  SRSF2: ["SRSF2 wild-type", "SRSF2 mutated"],
  DNMT3A: ["DNMT3A wild-type", "DNMT3A mutated"],
  ASXL1: ["ASXL1 wild-type", "ASXL1 mutated"],
  KRAS: ["KRAS wild-type", "KRAS mutated"],
  BCOR: ["BCOR wild-type", "BCOR mutated"],
  BCORL1: ["BCORL1 wild-type", "BCORL1 mutated"],
  CEBPA: ["CEBPA wild-type", "CEBPA mutated"],
  ETNK1: ["ETNK1 wild-type", "ETNK1 mutated"],
  GATA2: ["GATA2 wild-type", "GATA2 mutated"],
  GNB1: ["GNB1 wild-type", "GNB1 mutated"],
  IDH1: ["IDH1 wild-type", "IDH1 mutated"],
  NF1: ["NF1 wild-type", "NF1 mutated"],
  PHF6: ["PHF6 wild-type", "PHF6 mutated"],
  PPM1D: ["PPM1D wild-type", "PPM1D mutated"],
  PRPF8: ["PRPF8 wild-type", "PRPF8 mutated"],
  PTPN11: ["PTPN11 wild-type", "PTPN11 mutated"],
  SETBP1: ["SETBP1 wild-type", "SETBP1 mutated"],
  STAG2: ["STAG2 wild-type", "STAG2 mutated"],
  WT1: ["WT1 wild-type", "WT1 mutated"],
};

interface IpssmInputs {
  BM_BLAST: number;
  HB: number;
  PLT: number;
  cyto: string;
  mutatedGenes: ReadonlyArray<string>;
}

async function fillIpssm(page: Page, inputs: IpssmInputs): Promise<void> {
  await setNumber(page, "BM_BLAST", inputs.BM_BLAST);
  await setNumber(page, "HB", inputs.HB);
  await setNumber(page, "PLT", inputs.PLT);
  await selectChip(page, "CYTO_IPSSR", inputs.cyto);
  const mutatedSet = new Set(inputs.mutatedGenes);
  for (const linkId of ALL_GENE_LINKIDS) {
    const [wt, mut] = GENE_DISPLAYS[linkId];
    await selectChip(page, linkId, mutatedSet.has(linkId) ? mut : wt);
  }
}

test.describe("IPSS-M — Molecular International Prognostic Scoring System for MDS", () => {
  test("Test case 1 — VL: SF3B1-alpha favourable phenotype (~−1.76)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillIpssm(page, {
      BM_BLAST: 2,
      HB: 10.6,
      PLT: 380,
      cyto: CYTO_GOOD,
      mutatedGenes: ["SF3B1_alpha"],
    });
    await expectCalculatedDecimal(page, "IPSSM_score", -1.76, 0.05);
    await expectCalculatedString(page, "IPSSM_category", "VL");
    await expectCalculatedDecimal(page, "median_OS_years", 11.7, 0.05);
    await expectCalculatedString(page, "AML_transformation_risk", "very low");
  });

  test("Test case 2 — L: lower-risk MDS, isolated SRSF2 (~−1.06)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillIpssm(page, {
      BM_BLAST: 1,
      HB: 9.2,
      PLT: 280,
      cyto: CYTO_GOOD,
      mutatedGenes: ["SRSF2"],
    });
    await expectCalculatedDecimal(page, "IPSSM_score", -1.06, 0.05);
    await expectCalculatedString(page, "IPSSM_category", "L");
    await expectCalculatedDecimal(page, "median_OS_years", 7.1, 0.05);
    await expectCalculatedString(page, "AML_transformation_risk", "low");
  });

  test("Test case 3 — MH: RUNX1, intermediate cytogenetics (~+0.33)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillIpssm(page, {
      BM_BLAST: 5,
      HB: 10.0,
      PLT: 95,
      cyto: CYTO_INT,
      mutatedGenes: ["RUNX1"],
    });
    await expectCalculatedDecimal(page, "IPSSM_score", 0.33, 0.05);
    await expectCalculatedString(page, "IPSSM_category", "MH");
    await expectCalculatedDecimal(page, "median_OS_years", 3.1, 0.05);
    await expectCalculatedString(page, "AML_transformation_risk", "intermediate-high");
  });

  test("Test case 4 — H: SF3B1+del(5q) plus PHF6 residual (~+0.72)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillIpssm(page, {
      BM_BLAST: 8,
      HB: 7.8,
      PLT: 280,
      cyto: CYTO_GOOD,
      mutatedGenes: ["SF3B1_5q", "PHF6"],
    });
    await expectCalculatedDecimal(page, "IPSSM_score", 0.72, 0.05);
    await expectCalculatedString(page, "IPSSM_category", "H");
    await expectCalculatedDecimal(page, "median_OS_years", 2.3, 0.05);
    await expectCalculatedString(page, "AML_transformation_risk", "high");
  });

  test("Test case 5 — VH: TP53 multi-hit + FLT3 + complex karyotype (~+6.5)", async ({ page }) => {
    await openCalc(page, SLUG);
    await fillIpssm(page, {
      BM_BLAST: 17,
      HB: 7.2,
      PLT: 30,
      cyto: CYTO_VERY_POOR,
      mutatedGenes: ["TP53multi", "FLT3", "SRSF2", "STAG2", "WT1", "BCOR"],
    });
    // Score should be well above 1.5; assert by category and median OS.
    await expectCalculatedString(page, "IPSSM_category", "VH");
    await expectCalculatedDecimal(page, "median_OS_years", 1.3, 0.05);
    await expectCalculatedString(page, "AML_transformation_risk", "very high");
  });
});
