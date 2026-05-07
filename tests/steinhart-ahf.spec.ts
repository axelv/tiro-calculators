import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  setNumber,
} from "./_helpers";

const SLUG = "steinhart-ahf";

/**
 * Steinhart Model for Acute Heart Failure (AHF) in Undifferentiated Dyspnea.
 *
 * SPEC §3 flags the regression β coefficients (β0, β_age, β_pretest,
 * β_log10(NT-proBNP)) as TBD pending the Steinhart 2009 JACC Online Appendix.
 * Per FHIRPATH.md, the implementation uses the LR-based Bayesian update
 * (post_odds = pre_odds × LR) which is fully derivable from the published
 * abstract for the three reported NT-proBNP bands. The intermediate bands
 * (300–1799 and 1800–2699 pg/mL) use defensible estimates: LR = 2.0 and
 * LR = 2.7 respectively. TEST_CASES.md flags risk-band classification as the
 * primary verifiable output; numeric probabilities are checked against the
 * LR-Bayesian computed value (within the SPEC's plausibility windows).
 */

test.describe("Steinhart Model for AHF in Undifferentiated Dyspnea", () => {
  test("Test case 1 — pneumonia, low gestalt, low NT-proBNP (Low band)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 42);
    await setNumber(page, "pretest_probability", 10);
    await setNumber(page, "nt_probnp", 18);

    // 18 pmol/L × 8.457 = 152.2 pg/mL → LR = 0.11.
    // pre_odds = 0.10 / 0.90 = 0.1111; post_odds = 0.01222;
    // post_prob = 0.01222 / 1.01222 = 1.207 %.
    await expectCalculatedDecimal(page, "probability_ahf", 1.207, 0.05);
    await expectCalculatedString(page, "risk_band", "Low");
  });

  test("Test case 2 — intermediate gestalt, mid-range NT-proBNP (Intermediate band)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 67);
    await setNumber(page, "pretest_probability", 50);
    await setNumber(page, "nt_probnp", 165);

    // 165 pmol/L × 8.457 = 1395.4 pg/mL → LR = 2.0 (300 ≤ x < 1800 band).
    // pre_odds = 1.0; post_odds = 2.0; post_prob = 66.667 %.
    await expectCalculatedDecimal(page, "probability_ahf", 66.667, 0.1);
    await expectCalculatedString(page, "risk_band", "Intermediate");
  });

  test("Test case 3 — known HFrEF, high gestalt, very high NT-proBNP (High band)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 79);
    await setNumber(page, "pretest_probability", 90);
    await setNumber(page, "nt_probnp", 1200);

    // 1200 pmol/L × 8.457 = 10148.4 pg/mL → LR = 12.80.
    // pre_odds = 0.90 / 0.10 = 9.0; post_odds = 115.2; post_prob = 99.139 %.
    await expectCalculatedDecimal(page, "probability_ahf", 99.139, 0.05);
    await expectCalculatedString(page, "risk_band", "High");
  });

  test("Test case 4 — reclassification: intermediate gestalt, low NT-proBNP (Low band)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 56);
    await setNumber(page, "pretest_probability", 40);
    await setNumber(page, "nt_probnp", 25);

    // 25 pmol/L × 8.457 = 211.4 pg/mL → LR = 0.11.
    // pre_odds = 0.40 / 0.60 = 0.6667; post_odds = 0.07333;
    // post_prob = 0.07333 / 1.07333 = 6.832 %.
    await expectCalculatedDecimal(page, "probability_ahf", 6.832, 0.05);
    await expectCalculatedString(page, "risk_band", "Low");
  });

  test("Test case 5 — flash pulmonary oedema, very high gestalt, very high NT-proBNP (High band)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await setNumber(page, "age", 88);
    await setNumber(page, "pretest_probability", 99);
    await setNumber(page, "nt_probnp", 5000);

    // 5000 pmol/L × 8.457 = 42285 pg/mL → LR = 12.80.
    // pre_odds = 0.99 / 0.01 = 99.0; post_odds = 1267.2;
    // post_prob = 1267.2 / 1268.2 = 99.921 %.
    await expectCalculatedDecimal(page, "probability_ahf", 99.921, 0.05);
    await expectCalculatedString(page, "risk_band", "High");
  });
});
