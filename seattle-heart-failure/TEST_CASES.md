# Seattle Heart Failure Model (SHFM) — Test Cases

Five fictional clinical test cases for the Seattle Heart Failure Model.

> **Note on expected outputs.** The SPEC marks the full β-coefficient table, the baseline survival function `S₀(t)`, and several treatment hazard ratios as `TBD — see Levy 2006 supplementary appendix / depts.washington.edu/shfm`. The expected 1/2/3/5-year survival figures and mean life expectancy below are clinically plausible point estimates consistent with the published derivation cohort, the illustrative HRs printed in the SPEC (ACEi ≈ 0.83, β-blocker ≈ 0.66, K-sparing ≈ 0.74, ICD ≈ 0.74, CRT ≈ 0.64), and the documented validation AUC (0.729). Implementations must be cross-validated against the official SHFM Excel/web tool before clinical use.

Diuretic aggregation reminder (per SPEC §2.3):

```
total_loop_eq_mg_per_day =
    furosemide + 2 × torsemide + 40 × bumetanide + 40 × metolazone + 1 × hctz
diuretic_dose_per_kg = total_loop_eq_mg_per_day / weight_kg
```

---

## Test case 1 — Low risk: well-treated NYHA II HFrEF

**Vignette.** Jean-Claude Moreau, a 58-year-old male non-ischemic dilated cardiomyopathy patient, NYHA II, on full guideline-directed medical therapy. EF 35 %, normotensive, normal renal/hepatic function. He plays doubles tennis weekly.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 58 y |
| `sex` | male |
| `ischemic_etiology` | false |
| `nyha_class` | II |
| `weight_kg` | 78 kg |
| `ejection_fraction` | 35 % |
| `systolic_bp` | 124 mmHg |
| `sodium` | 140 mmol/L |
| `hemoglobin` | 14.5 g/dL |
| `lymphocytes_pct` | 28 % |
| `uric_acid` | 5.5 mg/dL |
| `total_cholesterol` | 195 mg/dL |
| `furosemide_dose` | 20 mg/day p.o. |
| Other diuretics | 0 |
| `ace_inhibitor` | true |
| `arb` | false |
| `beta_blocker` | true |
| `statin` | true |
| `allopurinol` | false |
| `k_sparing` | true |
| `device` | none |
| `lvad` | false |

**Aggregated diuretic.** `total_loop_eq = 20 mg/day`; `diuretic_dose_per_kg = 20 / 78 ≈ 0.256 mg/kg/day`.

**Risk profile commentary.** Younger, well-treated, non-ischemic, NYHA II, with preserved BP, normal sodium, normal Hb and lymphocytes. The full triad of ACEi + β-blocker + aldosterone antagonist plus statin contributes a multiplicative HR ≈ 0.83 × 0.66 × 0.74 ≈ 0.40 to the baseline hazard. Expected SHFM output is favourable.

**Expected output.**

| Field | Value |
|---|---|
| `survival_1y` | ≈ 0.97 |
| `survival_2y` | ≈ 0.94 |
| `survival_3y` | ≈ 0.91 |
| `survival_5y` | ≈ 0.85 |
| `mean_life_expectancy` | **≈ 14 years** (clinically plausible 12–17 y) |
| `mortality_1y` | ≈ 3 % |

Interpretation: low-risk ambulatory HFrEF on optimal therapy. Continue current GDMT; assess CRT/ICD eligibility per QRS / EF criteria over time.

---

## Test case 2 — Intermediate risk: NYHA III ischemic, partial therapy

**Vignette.** Robert McAllister, a 67-year-old male with ischemic cardiomyopathy following an anterior MI five years ago. NYHA III, EF 28 %, on ACE inhibitor and β-blocker but not yet on an aldosterone antagonist. Mildly anaemic. No device therapy.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 67 y |
| `sex` | male |
| `ischemic_etiology` | true |
| `nyha_class` | III |
| `weight_kg` | 84 kg |
| `ejection_fraction` | 28 % |
| `systolic_bp` | 112 mmHg |
| `sodium` | 137 mmol/L |
| `hemoglobin` | 12.5 g/dL |
| `lymphocytes_pct` | 22 % |
| `uric_acid` | 7.8 mg/dL |
| `total_cholesterol` | 165 mg/dL |
| `furosemide_dose` | 40 mg/day |
| Other diuretics | 0 |
| `ace_inhibitor` | true |
| `arb` | false |
| `beta_blocker` | true |
| `statin` | true |
| `allopurinol` | false |
| `k_sparing` | false |
| `device` | none |
| `lvad` | false |

**Aggregated diuretic.** `total_loop_eq = 40 mg/day`; `diuretic_dose_per_kg = 40 / 84 ≈ 0.476 mg/kg/day`.

**Risk profile commentary.** Older, ischemic, NYHA III, with low–normal SBP, mild hyponatraemia and anaemia, raised uric acid. ACEi and β-blocker present; aldosterone antagonist and ICD/CRT are missing add-on candidates.

**Expected output.**

| Field | Value |
|---|---|
| `survival_1y` | ≈ 0.88 |
| `survival_2y` | ≈ 0.78 |
| `survival_3y` | ≈ 0.69 |
| `survival_5y` | ≈ 0.52 |
| `mean_life_expectancy` | **≈ 6.5 years** (clinically plausible 5–8 y) |
| `mortality_1y` | ≈ 12 % |

**Projected effect of adding therapy** (illustrative, sign and approximate magnitude consistent with SHFM):

| Add-on therapy | Δ mean life expectancy |
|---|---|
| Aldosterone antagonist (k_sparing → true) | ≈ +1.4 y |
| ICD | ≈ +1.0 y |
| CRT-D (if QRS ≥ 150 ms, LBBB) | ≈ +1.8 y |

---

## Test case 3 — High risk: NYHA IV ischemic with end-organ stress

**Vignette.** Eleanor Whitcombe, a 74-year-old female with end-stage ischemic cardiomyopathy. NYHA IV at minimal exertion despite high-dose loop diuretic. EF 18 %, hyponatraemic, anaemic, hyperuricaemic. CRT-D in situ. Currently being evaluated for advanced therapies (transplant ineligible due to age; LVAD destination therapy under discussion).

**Inputs.**

| Field | Value |
|---|---|
| `age` | 74 y |
| `sex` | female |
| `ischemic_etiology` | true |
| `nyha_class` | IV |
| `weight_kg` | 62 kg |
| `ejection_fraction` | 18 % |
| `systolic_bp` | 92 mmHg |
| `sodium` | 130 mmol/L |
| `hemoglobin` | 10.8 g/dL |
| `lymphocytes_pct` | 14 % |
| `uric_acid` | 11.2 mg/dL |
| `total_cholesterol` | 132 mg/dL |
| `furosemide_dose` | 160 mg/day |
| `metolazone_dose` | 5 mg/day |
| Other diuretics | 0 |
| `ace_inhibitor` | true (low dose) |
| `arb` | false |
| `beta_blocker` | true (low dose carvedilol) |
| `statin` | true |
| `allopurinol` | true |
| `k_sparing` | true |
| `device` | bivent_icd (CRT-D) |
| `lvad` | false |

**Aggregated diuretic.** `total_loop_eq = 160 + 40 × 5 = 360 mg/day`; `diuretic_dose_per_kg = 360 / 62 ≈ 5.81 mg/kg/day` — very high dose.

**Risk profile commentary.** Multiple SHFM hazard contributors maxed out: NYHA IV, very low EF, low SBP, hyponatraemia, anaemia, severe lymphopenia, marked hyperuricaemia, low cholesterol, very high diuretic dose per kg. All available evidence-based therapies including CRT-D are already on board, so no further treatment-HR offset is available.

**Expected output.**

| Field | Value |
|---|---|
| `survival_1y` | ≈ 0.55 |
| `survival_2y` | ≈ 0.34 |
| `survival_3y` | ≈ 0.21 |
| `survival_5y` | ≈ 0.08 |
| `mean_life_expectancy` | **≈ 1.6 years** (clinically plausible 1.0–2.2 y) |
| `mortality_1y` | ≈ 45 % |

Interpretation: very high risk — appropriate trigger for advanced-HF / palliative-care discussion; LVAD destination therapy is reasonable to evaluate.

---

## Test case 4 — Mid-range, modifiable: NYHA II ischemic on minimal therapy

**Vignette.** Ahmed Faour, a 62-year-old male, NYHA II ischemic cardiomyopathy following a small inferior MI. EF 40 %. Currently only on aspirin and a statin, with no ACEi, no β-blocker, no aldosterone antagonist, and no device. This case is designed to demonstrate the **incremental benefit of adding therapies**.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 62 y |
| `sex` | male |
| `ischemic_etiology` | true |
| `nyha_class` | II |
| `weight_kg` | 88 kg |
| `ejection_fraction` | 40 % |
| `systolic_bp` | 130 mmHg |
| `sodium` | 139 mmol/L |
| `hemoglobin` | 13.8 g/dL |
| `lymphocytes_pct` | 24 % |
| `uric_acid` | 6.4 mg/dL |
| `total_cholesterol` | 175 mg/dL |
| `furosemide_dose` | 0 mg/day |
| Other diuretics | 0 |
| `ace_inhibitor` | false |
| `arb` | false |
| `beta_blocker` | false |
| `statin` | true |
| `allopurinol` | false |
| `k_sparing` | false |
| `device` | none |
| `lvad` | false |

**Aggregated diuretic.** `total_loop_eq = 0`; `diuretic_dose_per_kg = 0`.

**Risk profile commentary.** Despite mild disease (NYHA II, EF 40 %), the patient is not on any of the three pillar GDMTs. SHFM should produce a moderate baseline projection, with substantial **projected gains from add-on therapies** — this is the core decision-support use case for SHFM.

**Expected output (current therapy).**

| Field | Value |
|---|---|
| `survival_1y` | ≈ 0.90 |
| `survival_2y` | ≈ 0.81 |
| `survival_3y` | ≈ 0.73 |
| `survival_5y` | ≈ 0.58 |
| `mean_life_expectancy` | **≈ 8.5 years** |

**Projected effect of adding therapy (illustrative, signs consistent with SHFM):**

| Add-on therapy | Δ mean life expectancy |
|---|---|
| ACE inhibitor (HR ≈ 0.83) | ≈ +1.6 y |
| β-blocker (HR ≈ 0.66) | ≈ +3.2 y |
| Aldosterone antagonist (HR ≈ 0.74) | ≈ +2.2 y |
| ACEi + β-blocker + K-sparing combined | ≈ +6.5 y |

Adding all three pillar GDMTs roughly doubles the mean life expectancy at this profile — this is the canonical SHFM educational example.

---

## Test case 5 — Edge case: maximum-severity NYHA IV non-ischemic on no therapy

**Vignette.** Petra Lindgren, a 51-year-old woman with end-stage non-ischemic dilated cardiomyopathy presenting late, refusing all guideline therapy until now. NYHA IV at rest, EF 12 %. Severe cachexia (low weight, low cholesterol), hyponatraemia, anaemia, lymphopenia, hyperuricaemia, hypotensive. No device. No medications. This sits near the **upper extreme of SHFM-projected mortality** for an ambulatory patient still eligible for the model.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 51 y |
| `sex` | female |
| `ischemic_etiology` | false |
| `nyha_class` | IV |
| `weight_kg` | 48 kg |
| `ejection_fraction` | 12 % |
| `systolic_bp` | 84 mmHg |
| `sodium` | 128 mmol/L |
| `hemoglobin` | 9.5 g/dL |
| `lymphocytes_pct` | 11 % |
| `uric_acid` | 13.5 mg/dL |
| `total_cholesterol` | 110 mg/dL |
| `furosemide_dose` | 80 mg/day |
| Other diuretics | 0 |
| `ace_inhibitor` | false |
| `arb` | false |
| `beta_blocker` | false |
| `statin` | false |
| `allopurinol` | false |
| `k_sparing` | false |
| `device` | none |
| `lvad` | false |

**Aggregated diuretic.** `total_loop_eq = 80 mg/day`; `diuretic_dose_per_kg = 80 / 48 ≈ 1.67 mg/kg/day`.

**Risk profile commentary.** Every SHFM continuous predictor is set in the unfavourable direction (low EF, low SBP, low Na, low Hb, low lymphocytes, high uric acid, low cholesterol, high diuretic per kg, NYHA IV) and **no** treatment HR offsets are present. Younger age provides only a small offset. Expected to produce one of the lowest plausible SHFM survival outputs and a strong incremental projected benefit from adding all GDMT.

**Expected output (current therapy).**

| Field | Value |
|---|---|
| `survival_1y` | ≈ 0.40 |
| `survival_2y` | ≈ 0.22 |
| `survival_3y` | ≈ 0.13 |
| `survival_5y` | ≈ 0.04 |
| `mean_life_expectancy` | **≈ 1.2 years** |

**Projected effect of adding all GDMT + CRT-D (illustrative):**

| Scenario | Mean life expectancy |
|---|---|
| Current (no therapy) | ≈ 1.2 y |
| + ACEi + β-blocker + K-sparing | ≈ 3.5 y |
| + above + statin + allopurinol + CRT-D | ≈ 5.5 y |

This is exactly the population in whom SHFM is most useful as a shared-decision-making aid: it quantifies that aggressive GDMT adds *years* of expected life. Note: SHFM is also known to under-estimate mortality in the very advanced HF / inotrope-dependent population (SPEC §4.4) — pair with INTERMACS profile and clinical judgement.

---

> Expected survival curves and mean life-expectancy figures are illustrative; implementations must be cross-validated against the official Seattle Heart Failure Model Excel/web tool at <https://depts.washington.edu/shfm/> before clinical deployment.
