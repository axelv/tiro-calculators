# Steinhart Model for AHF in Undifferentiated Dyspnea — Test Cases

Five fictional clinical test cases for the Steinhart Model for acute heart failure (AHF) in undifferentiated dyspnea (Steinhart 2009, JACC; IMPROVE CHF derivation).

> **Note on expected probabilities.** The exact intercept (β₀), and the slope coefficients on age (β₁), pre-test probability (β₂), and log₁₀(NT-proBNP in pg/mL) (β₃) are marked **TBD — see Steinhart 2009 (JACC 2009;54:1515–1521) Online Appendix** in the SPEC. The expected `probability_ahf` figures below are clinically plausible point estimates consistent with (a) the published validation C-statistic (0.905 derivation, 0.97 PRIDE), (b) the spec's likelihood ratios (LR ≈ 0.11 if NT-proBNP < 300 pg/mL; LR ≈ 12.80 if ≥ 8,100 pg/mL), and (c) the model's documented behaviour of reclassifying ~ 44 % of intermediate-gestalt patients to a confident low or high category. **Risk band classifications are the primary verifiable outputs.**

NT-proBNP unit handling (per SPEC §3): MDCalc input is in **pmol/L**; the regression uses log₁₀(NT-proBNP in pg/mL); conversion `pg/mL = pmol/L × 8.457`.

Steinhart 2009 interpretation thresholds:

| Predicted probability | Band |
|---|---|
| 0–20 % | Low |
| 21–79 % | Intermediate |
| 80–100 % | High |

---

## Test case 1 — Low probability of AHF (LR ≈ 0.11 territory)

**Vignette.** Sara Janssens, a 42-year-old female with a 4-day history of fever, productive cough, and pleuritic chest pain. Examination shows right basal crackles and bronchial breath sounds, oxygen saturation 93 % on air, no orthopnea, no PND, no peripheral oedema, no JVD. Chest x-ray shows a right lower lobe consolidation. Pre-test gestalt for AHF: **low (≈ 10 %)** — the clinician strongly suspects community-acquired pneumonia.

**Inputs.**

| Field | Value | Conversion / log |
|---|---|---|
| `age` | 42 y | — |
| `pretest_probability` | 10 % | — |
| `nt_probnp` | 18 pmol/L | = 152 pg/mL → log₁₀(152) ≈ 2.18 |

**Risk-profile commentary.** All three predictors point away from AHF: young age, low gestalt, and an NT-proBNP well below 300 pg/mL (LR ≈ 0.11). The expected post-test probability should sit firmly in the low band.

**Expected output.**

| Field | Value |
|---|---|
| `probability_ahf` | **≈ 3 %** (clinically plausible 1–6 %) |
| Interpretation | **Low** probability — AHF unlikely; pursue alternative diagnoses (pneumonia confirmed by CXR, work up sepsis, consider PE if pleuritic). |

---

## Test case 2 — Mid-range gestalt, mid-range NT-proBNP

**Vignette.** Hubert Andersen, a 67-year-old male ex-smoker with COPD GOLD II and known atrial fibrillation, presents with progressive dyspnea over 5 days. He takes a low-dose loop diuretic. Exam: bilateral expiratory wheeze with scattered fine crackles, irregular pulse 96, BP 142/86, mild ankle oedema, no clear S3, no orthopnea reported. CXR shows hyperinflation with mild upper-zone redistribution. Pre-test gestalt: **intermediate (≈ 50 %)** — diagnosis is genuinely uncertain (COPD exacerbation vs AHF).

**Inputs.**

| Field | Value | Conversion / log |
|---|---|---|
| `age` | 67 y | — |
| `pretest_probability` | 50 % | — |
| `nt_probnp` | 165 pmol/L | = 1,395 pg/mL → log₁₀(1,395) ≈ 3.14 |

**Risk-profile commentary.** This is the canonical Steinhart use case: an intermediate-gestalt patient where NT-proBNP and age can resolve uncertainty. Age 67 and NT-proBNP > 1,000 pg/mL pull the post-test probability upward; the gestalt is held at 50 %. The output should still fall in the **intermediate** band but shift somewhat above the gestalt baseline, prompting further objective testing (echocardiography, bedside lung ultrasound).

**Expected output.**

| Field | Value |
|---|---|
| `probability_ahf` | **≈ 65 %** (clinically plausible 55–75 %) |
| Interpretation | **Intermediate** — diagnosis remains uncertain; obtain bedside echo / lung ultrasound, treat both processes empirically if needed. |

---

## Test case 3 — High probability of AHF (LR ≈ 12.8 territory)

**Vignette.** Margaret O'Sullivan, a 79-year-old woman with known HFrEF (EF 30 %) and prior MI, presents with one week of progressive dyspnea, two-pillow orthopnea, paroxysmal nocturnal dyspnea, and 3 kg weight gain on her usual furosemide. Exam: bilateral basal crackles to mid-zones, S3 gallop, JVD 8 cm, 2+ pitting oedema, BP 158/94, HR 104. CXR shows interstitial pulmonary oedema with Kerley B lines. Pre-test gestalt: **high (≈ 90 %)**.

**Inputs.**

| Field | Value | Conversion / log |
|---|---|---|
| `age` | 79 y | — |
| `pretest_probability` | 90 % | — |
| `nt_probnp` | 1,200 pmol/L | = 10,148 pg/mL → log₁₀(10,148) ≈ 4.01 |

**Risk-profile commentary.** Every Steinhart predictor pushes upward: older age, high gestalt, and NT-proBNP well above the 8,100 pg/mL cut-point (LR ≈ 12.8). The expected output should sit deep in the **high** band — well above 80 %.

**Expected output.**

| Field | Value |
|---|---|
| `probability_ahf` | **≈ 97 %** (clinically plausible 94–99 %) |
| Interpretation | **High** probability — treat for AHF (IV loop diuretic, supplemental O₂, consider vasodilator if BP allows, telemetry); continue evaluation for contributing factors (ischemia, arrhythmia, infection). |

---

## Test case 4 — Reclassification: intermediate gestalt, NT-proBNP < 300 pg/mL

**Vignette.** Pieter Vermeer, a 56-year-old man, presents to the ED with a 6-hour history of acute-onset dyspnea after returning from a long-haul flight. He has no prior cardiac history, no orthopnea, no PND, no diuretic use. Exam: tachypnea 24, HR 118, BP 128/76, SpO₂ 92 %, lungs clear, calf swelling on the right. The clinician's gestalt for AHF is **intermediate (≈ 40 %)** — pulmonary embolism is ranked higher but AHF cannot be excluded on history alone. NT-proBNP returns very low.

**Inputs.**

| Field | Value | Conversion / log |
|---|---|---|
| `age` | 56 y | — |
| `pretest_probability` | 40 % | — |
| `nt_probnp` | 25 pmol/L | = 211 pg/mL → log₁₀(211) ≈ 2.32 |

**Risk-profile commentary.** Despite an intermediate gestalt, NT-proBNP < 300 pg/mL carries an LR of ~ 0.11 against AHF, and the patient is younger than the cohort mean. This case demonstrates the model's documented behaviour of **reclassifying ~ 44 % of intermediate-gestalt patients** to either low or high probability — here the model should drop the post-test probability into the low band.

**Expected output.**

| Field | Value |
|---|---|
| `probability_ahf` | **≈ 12 %** (clinically plausible 7–18 %) |
| Interpretation | **Low** probability — AHF unlikely; pursue PE work-up (CTPA, D-dimer in context of high pre-test for PE), supportive care. |

---

## Test case 5 — Edge case: maximum-plausible inputs

**Vignette.** Henri Lemaître, an 88-year-old long-term care resident, is brought to the ED with one day of severe dyspnea, frothy pink sputum, and obvious respiratory distress. He has known HFpEF, prior NSTEMI, hypertension, and chronic kidney disease (eGFR 35 mL/min). Exam: gasping respirations, SpO₂ 84 % on a non-rebreather, bilateral diffuse crackles to apices, S3 and S4 gallops, JVD to the angle of jaw, anasarca. Pre-test gestalt: **very high (≈ 99 %)** — this is textbook flash pulmonary oedema. NT-proBNP is very elevated (also reflecting his CKD).

**Inputs.**

| Field | Value | Conversion / log |
|---|---|---|
| `age` | 88 y | — |
| `pretest_probability` | 99 % | — |
| `nt_probnp` | 5,000 pmol/L | = 42,285 pg/mL → log₁₀(42,285) ≈ 4.63 |

**Risk-profile commentary.** Every input is at or near its plausible upper bound: very old age, near-maximum gestalt, and an NT-proBNP an order of magnitude above the 8,100 pg/mL high-LR cut-point. This case probes the **maximum** of the Steinhart logistic output.

**Expected output.**

| Field | Value |
|---|---|
| `probability_ahf` | **≈ 99.5 %** (clinically plausible ≥ 99 %, asymptotically capped at 100 %) |
| Interpretation | **High** probability — emergency AHF / cardiogenic pulmonary oedema management (IV nitrate, IV loop diuretic, NIV / CPAP, ICU consult). Note: NT-proBNP is also elevated by his stage 3b CKD, but the clinical picture and gestalt independently confirm AHF. |

---

> Expected probabilities are illustrative point estimates within clinically defensible bands. Implementations must pin the exact β-coefficients from the Steinhart 2009 JACC Online Appendix and validate against MDCalc fixtures (e.g., 70-year-old, gestalt 50 %, NT-proBNP 1,000 pmol/L) per SPEC §5 "Open items for implementers" before clinical deployment.
