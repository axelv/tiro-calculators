import { test } from "@playwright/test";
import {
  expectCalculatedDecimal,
  expectCalculatedString,
  openCalc,
  selectChip,
} from "./_helpers";

const SLUG = "ottawa-hf-risk";

const VARIANT_BASIC = "Basic OHFRS (10 items)";
const VARIANT_QUANTITATIVE = "Quantitative OHFRS (with NT-proBNP)";

test.describe("Ottawa Heart Failure Risk Scale (OHFRS)", () => {
  test("Test case 1 — basic variant, score 0, low risk (minimum-score edge case)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "variant", VARIANT_BASIC);
    await selectChip(page, "history_stroke_or_tia", "No prior stroke/TIA");
    await selectChip(page, "history_intubation_resp_distress", "No prior intubation");
    await selectChip(page, "hr_arrival_ge_110", "Arrival HR < 110");
    await selectChip(page, "sao2_arrival_lt_90", "Arrival SaO₂ ≥ 90%");
    await selectChip(
      page,
      "walk_test_hr_ge_110_or_unable",
      "Walk-test HR < 110 (test completed)",
    );
    await selectChip(
      page,
      "walk_test_room_air_sao2_lt_90_or_unable",
      "Walk-test SaO₂ ≥ 90% (test completed)",
    );
    await selectChip(page, "ecg_new_ischemia", "No new ECG ischemia");
    await selectChip(page, "urea_ge_12_mmol_l", "Urea < 12 mmol/L");
    await selectChip(page, "serum_co2_ge_35_mmol_l", "Serum CO₂ < 35 mmol/L");
    await selectChip(
      page,
      "troponin_elevated_to_mi_level",
      "Troponin not elevated to MI level",
    );

    await expectCalculatedDecimal(page, "score_basic", 0);
    await expectCalculatedDecimal(page, "score", 0);
    await expectCalculatedString(page, "risk_band", "low");
    await expectCalculatedDecimal(page, "sae_14d_pct_approx", 2.8, 0.05);
    await expectCalculatedString(page, "disposition", "discharge_with_followup");
  });

  test("Test case 2 — basic variant, score 1, low–intermediate (TIA only)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "variant", VARIANT_BASIC);
    await selectChip(page, "history_stroke_or_tia", "Prior stroke/TIA");
    await selectChip(page, "history_intubation_resp_distress", "No prior intubation");
    await selectChip(page, "hr_arrival_ge_110", "Arrival HR < 110");
    await selectChip(page, "sao2_arrival_lt_90", "Arrival SaO₂ ≥ 90%");
    await selectChip(
      page,
      "walk_test_hr_ge_110_or_unable",
      "Walk-test HR < 110 (test completed)",
    );
    await selectChip(
      page,
      "walk_test_room_air_sao2_lt_90_or_unable",
      "Walk-test SaO₂ ≥ 90% (test completed)",
    );
    await selectChip(page, "ecg_new_ischemia", "No new ECG ischemia");
    await selectChip(page, "urea_ge_12_mmol_l", "Urea < 12 mmol/L");
    await selectChip(page, "serum_co2_ge_35_mmol_l", "Serum CO₂ < 35 mmol/L");
    await selectChip(
      page,
      "troponin_elevated_to_mi_level",
      "Troponin not elevated to MI level",
    );

    await expectCalculatedDecimal(page, "score_basic", 1);
    await expectCalculatedDecimal(page, "score", 1);
    await expectCalculatedString(page, "risk_band", "low_intermediate");
    await expectCalculatedDecimal(page, "sae_14d_pct_approx", 6.0, 0.05);
    await expectCalculatedString(page, "disposition", "discharge_with_followup");
  });

  test("Test case 3 — quantitative variant, score 6 (HR ≥ 110 + ECG ischemia + urea + NT-proBNP)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "variant", VARIANT_QUANTITATIVE);
    await selectChip(page, "history_stroke_or_tia", "No prior stroke/TIA");
    await selectChip(page, "history_intubation_resp_distress", "No prior intubation");
    await selectChip(page, "hr_arrival_ge_110", "Arrival HR ≥ 110");
    await selectChip(page, "sao2_arrival_lt_90", "Arrival SaO₂ ≥ 90%");
    await selectChip(
      page,
      "walk_test_hr_ge_110_or_unable",
      "Walk-test HR < 110 (test completed)",
    );
    await selectChip(page, "ecg_new_ischemia", "New ECG ischemic changes");
    await selectChip(page, "urea_ge_12_mmol_l", "Urea ≥ 12 mmol/L");
    await selectChip(page, "serum_co2_ge_35_mmol_l", "Serum CO₂ < 35 mmol/L");
    await selectChip(
      page,
      "troponin_elevated_to_mi_level",
      "Troponin not elevated to MI level",
    );
    await selectChip(page, "nt_probnp_ge_5000_ng_l", "NT-proBNP ≥ 5 000 ng/L");

    await expectCalculatedDecimal(page, "score_quantitative", 6);
    await expectCalculatedDecimal(page, "score", 6);
  });

  test("Test case 4 — basic variant, score 5, very high (prior intubation + arrival tachycardia + hypoxemia + unable to walk)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "variant", VARIANT_BASIC);
    await selectChip(page, "history_stroke_or_tia", "No prior stroke/TIA");
    await selectChip(
      page,
      "history_intubation_resp_distress",
      "Prior intubation for respiratory distress",
    );
    await selectChip(page, "hr_arrival_ge_110", "Arrival HR ≥ 110");
    await selectChip(page, "sao2_arrival_lt_90", "Arrival SaO₂ < 90%");
    await selectChip(
      page,
      "walk_test_hr_ge_110_or_unable",
      "Walk-test HR ≥ 110 or unable to perform",
    );
    await selectChip(
      page,
      "walk_test_room_air_sao2_lt_90_or_unable",
      "Walk-test SaO₂ < 90% or unable to perform",
    );
    await selectChip(page, "ecg_new_ischemia", "No new ECG ischemia");
    await selectChip(page, "urea_ge_12_mmol_l", "Urea < 12 mmol/L");
    await selectChip(page, "serum_co2_ge_35_mmol_l", "Serum CO₂ < 35 mmol/L");
    await selectChip(
      page,
      "troponin_elevated_to_mi_level",
      "Troponin not elevated to MI level",
    );

    await expectCalculatedDecimal(page, "score_basic", 5);
    await expectCalculatedDecimal(page, "score", 5);
    await expectCalculatedString(page, "risk_band", "very_high");
    await expectCalculatedDecimal(page, "sae_14d_pct_approx", 89.0, 0.05);
    await expectCalculatedString(page, "disposition", "admit_observe");
  });

  test("Test case 5 — quantitative variant, maximum score 15 (all positive)", async ({
    page,
  }) => {
    await openCalc(page, SLUG);
    await selectChip(page, "variant", VARIANT_QUANTITATIVE);
    await selectChip(page, "history_stroke_or_tia", "Prior stroke/TIA");
    await selectChip(
      page,
      "history_intubation_resp_distress",
      "Prior intubation for respiratory distress",
    );
    await selectChip(page, "hr_arrival_ge_110", "Arrival HR ≥ 110");
    await selectChip(page, "sao2_arrival_lt_90", "Arrival SaO₂ < 90%");
    await selectChip(
      page,
      "walk_test_hr_ge_110_or_unable",
      "Walk-test HR ≥ 110 or unable to perform",
    );
    await selectChip(page, "ecg_new_ischemia", "New ECG ischemic changes");
    await selectChip(page, "urea_ge_12_mmol_l", "Urea ≥ 12 mmol/L");
    await selectChip(page, "serum_co2_ge_35_mmol_l", "Serum CO₂ ≥ 35 mmol/L");
    await selectChip(
      page,
      "troponin_elevated_to_mi_level",
      "Troponin elevated to MI level",
    );
    await selectChip(page, "nt_probnp_ge_5000_ng_l", "NT-proBNP ≥ 5 000 ng/L");

    await expectCalculatedDecimal(page, "score_quantitative", 15);
    await expectCalculatedDecimal(page, "score", 15);
    await expectCalculatedString(page, "disposition", "admit_observe");
  });
});
