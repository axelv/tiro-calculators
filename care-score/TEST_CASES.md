# CARE Score for Acute Coronary Syndrome — Fictional Test Cases

Five fictional ED test cases for the **CARE Score** (the troponin-free, four-component subset of HEART: History + ECG + Age + Risk factors, total 0–8). The low-risk threshold per SPEC.md is **CARE ≤ 1** ("negative CARE", 6-week MACE 0 % in Moumneh 2018, n = 641); ≥ 2 is **not low** and warrants full troponin-based workup.

Age mapping: <45 → 0; 45–64 → 1; ≥65 → 2. Any documented atherosclerotic disease (prior MI / PCI / CABG / CVA-TIA / PAD) forces Risk-factor → 2 regardless of count.

---

## Test case 1 — Low risk (negative CARE, score 1)

**Vignette.** Ms. Charlotte Devereux, a 28-year-old graduate student with no medical history, presents to the ED at 02:00 with sharp left-sided chest pain that is reproducible on palpation and worse on inspiration. ECG is normal. She has no cardiovascular risk factors.

**Inputs**

| Field | Value | Component score |
|---|---|---:|
| `history` | 1 (moderately suspicious — atypical features dominate but examiner cannot fully exclude ACS) | 1 |
| `ecg` | 0 (normal) | 0 |
| `age_years` | 28 → maps to 0 | 0 |
| `risk_factors` | 0 (no risk factors, no atherosclerotic disease) | 0 |

**Calculation.** CARE = 1 + 0 + 0 + 0 = **1**.

**Expected output**

- `score`: 1
- `risk_band`: `low` ("negative CARE")
- 6-week MACE: **0 %** (95 % CI 0.0 – 1.9 %, Moumneh 2018)
- Disposition: `discharge_no_troponin` — consider safe ED discharge without serial troponin testing, with appropriate follow-up arranged.

---

## Test case 2 — Edge case: minimum score (CARE 0)

**Vignette.** Mr. Tobias Halvorsen-Yu, a 22-year-old non-smoking university athlete, is brought in by his roommate after a single 30-second episode of left-sided chest tightness that resolved before arrival. He is asymptomatic in the ED, ECG is completely normal, and he has no risk factors. He is the lower-bound exemplar for the CARE rule.

**Inputs**

| Field | Value | Component score |
|---|---|---:|
| `history` | 0 (slightly suspicious — atypical) | 0 |
| `ecg` | 0 (normal) | 0 |
| `age_years` | 22 → maps to 0 | 0 |
| `risk_factors` | 0 | 0 |

**Calculation.** CARE = 0 + 0 + 0 + 0 = **0** (minimum possible).

**Expected output**

- `score`: 0
- `risk_band`: `low` ("negative CARE")
- 6-week MACE: **0 %** (95 % CI 0.0 – 1.9 %)
- Disposition: `discharge_no_troponin` — safe early ED discharge supported by the rule; clinical judgment must still concur.

---

## Test case 3 — Mid-range / "not low" by CARE alone (CARE 3)

**Vignette.** Mr. Geoffrey Penhaligon-Maris, a 56-year-old accountant with treated hypertension and current 15-pack-year smoking, presents with two hours of central chest tightness radiating to the left arm, partially relieved by rest. ECG shows non-specific T-wave flattening but no significant ST deviation.

**Inputs**

| Field | Value | Component score |
|---|---|---:|
| `history` | 1 (moderately suspicious — mixed features) | 1 |
| `ecg` | 1 (non-specific repolarization disturbance) | 1 |
| `age_years` | 56 → maps to 1 | 1 |
| `risk_factors` | 2 risk factors (hypertension + current smoking), no atherosclerotic disease → 1 | 0 |

Wait — re-deriving the risk-factor score from the spec: hypertension (1) + smoking (1) = 2 risk factors → maps to **1** point. (No prior atherosclerotic disease, so the auto-2 override does not apply.)

| Field | Value | Component score |
|---|---|---:|
| `history` | 1 | 1 |
| `ecg` | 1 | 1 |
| `age_years` | 56 → 1 | 1 |
| `risk_factors` | 2 risk factors → 1 | 1 |

**Calculation.** CARE = 1 + 1 + 1 + 1 = **4**.

**Expected output**

- `score`: 4
- `risk_band`: `not_low` (above the CARE ≤ 1 threshold)
- 6-week MACE: TBD per spec (Moumneh 2018 publishes only the negative-CARE rate)
- Disposition: `proceed_to_full_workup` — do **not** rule out with CARE alone; proceed to full HEART score with troponin (or HEART Pathway / serial hs-cTn protocol).

---

## Test case 4 — Higher-risk score (CARE 6)

**Vignette.** Mrs. Birgit Ostermann-Cole, a 72-year-old with treated hypertension, type 2 diabetes, and a prior PCI for NSTEMI five years ago, presents with one hour of crushing substernal chest pain at rest. ECG shows 1.5 mm ST depression in the lateral leads.

**Inputs**

| Field | Value | Component score |
|---|---|---:|
| `history` | 2 (highly suspicious — predominantly classical ACS features at rest) | 2 |
| `ecg` | 2 (significant ST depression, no LBBB / LVH / digoxin effect) | 2 |
| `age_years` | 72 → 2 | 2 |
| `risk_factors` | Prior PCI = atherosclerotic disease → forced to 2 | 2 |

**Calculation.** CARE = 2 + 2 + 2 + 2 = **8** (maximum possible).

**Expected output**

- `score`: 8 (maximum)
- `risk_band`: `not_low`
- 6-week MACE: TBD per spec (well above the ≤1 rule-out band)
- Disposition: `proceed_to_full_workup` — full HEART + troponin / serial hs-cTn workup; this patient is also a candidate for early invasive evaluation per local ACS pathways. CARE alone cannot rule out ACS at this score.

---

## Test case 5 — Borderline / threshold case (CARE 2 — just above the rule-out cut-off)

**Vignette.** Mr. Domenico Riccelli, a 47-year-old construction supervisor with no past medical history and no cardiovascular risk factors (no hypertension, no hypercholesterolemia, non-smoker, no diabetes, no obesity, no family history of CVD, and no atherosclerotic disease), presents with two days of intermittent epigastric burning that occasionally radiates to the chest, no exertional pattern. ECG is normal. This is the canonical borderline case where CARE crosses from `low` to `not_low`.

**Inputs**

| Field | Value | Component score |
|---|---|---:|
| `history` | 1 (moderately suspicious — atypical, but cannot exclude) | 1 |
| `ecg` | 0 (completely normal) | 0 |
| `age_years` | 47 → maps to 1 | 1 |
| `risk_factors` | 0 RFs, no atherosclerotic disease → 0 | 0 |

**Calculation.** CARE = 1 + 0 + 1 + 0 = **2**.

**Expected output**

- `score`: 2 (just above the rule-out threshold of ≤ 1)
- `risk_band`: `not_low`
- 6-week MACE: TBD per spec (above the validated negative-CARE band)
- Disposition: `proceed_to_full_workup` — even though the patient has no risk factors, age 45–64 and a moderately suspicious history alone push the score to the boundary; proceed to troponin-based workup (full HEART or HEART Pathway). This case illustrates that the rule's specificity at the threshold is intentionally conservative.

---

> **Implementation note.** Implementations should expose the cut-off (`threshold: 1`) in the result so the UI can clearly state which side of the rule-out boundary each case falls on. Test cases 1 and 2 are negative CARE; cases 3, 4, and 5 are positive CARE and require the full troponin-based workup the spec mandates.
