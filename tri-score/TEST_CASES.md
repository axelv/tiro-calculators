# TRI-SCORE — Test Cases

Five fictional clinical test cases for the TRI-SCORE (Dreyfus 2022): an
8-item additive integer score (range 0–12) predicting in-hospital mortality
after isolated tricuspid valve surgery in adults with severe TR.

Point allocation:
- Age ≥70 → 1
- NYHA III–IV → 1
- RHF signs (severe JVD / ascites / marked oedema) → 2
- Daily furosemide ≥125 mg (or equivalent) → 2
- eGFR <30 mL/min/1.73 m² → 2
- Elevated total bilirubin (> local ULN) → 2
- LVEF <60 % → 1
- Moderate/severe RV dysfunction → 1

Predicted in-hospital mortality (Dreyfus 2022 Table 3): 0→1 %, 1→2 %, 2→3 %,
3→5 %, 4→8 %, 5→14 %, 6→22 %, 7→34 %, 8→48 %, ≥9→65 %.

Risk bands: **Low** 0–3 · **Intermediate** 4–5 · **High** ≥6.

---

## Test case 1 — Low risk (score 0)

**Vignette.** Annelies Vermeulen, a 52-year-old woman with severe primary
(degenerative) TR diagnosed during work-up for an exertional murmur. She is
asymptomatic with full functional capacity (NYHA I). No congestion, no
diuretics, normal kidney and liver function, LVEF 65 %, normal RV function.

**Inputs:**

| Field | Value | Points |
|---|---|---|
| `age_ge_70` | false (52) | 0 |
| `nyha_class_iii_iv` | false (I) | 0 |
| `right_heart_failure_signs` | false | 0 |
| `daily_furosemide_ge_125_mg` | false | 0 |
| `gfr_lt_30` | false (eGFR 92) | 0 |
| `bilirubin_elevated` | false (0.7 mg/dL) | 0 |
| `lvef_lt_60` | false (65 %) | 0 |
| `rv_dysfunction_mod_severe` | false | 0 |

**Total score: 0**

**Expected output:**
- Score: **0**
- Predicted in-hospital mortality: **1 %** (observed 0 % in derivation)
- Risk band: **Low** — surgical risk comparable to other elective valve
  operations; isolated tricuspid surgery generally appropriate.

---

## Test case 2 — Low risk (score 3)

**Vignette.** Rashid Patel, a 66-year-old man with severe functional TR
secondary to atrial fibrillation. He reports marked breathlessness on
minimal exertion (NYHA III) but has no overt right-heart failure signs and
is on low-dose loop diuretic only. Labs are unremarkable (normal eGFR and
bilirubin). Echo: LVEF 55 %, moderate RV dysfunction (TAPSE 15 mm).

**Inputs:**

| Field | Value | Points |
|---|---|---|
| `age_ge_70` | false (66) | 0 |
| `nyha_class_iii_iv` | true (III) | 1 |
| `right_heart_failure_signs` | false | 0 |
| `daily_furosemide_ge_125_mg` | false (40 mg) | 0 |
| `gfr_lt_30` | false (eGFR 70) | 0 |
| `bilirubin_elevated` | false (0.9 mg/dL) | 0 |
| `lvef_lt_60` | true (55 %) | 1 |
| `rv_dysfunction_mod_severe` | true (TAPSE 15 mm) | 1 |

**Total score: 3**

**Expected output:**
- Score: **3**
- Predicted in-hospital mortality: **5 %** (observed 0 % in derivation)
- Risk band: **Low** — proceed to surgery before further end-organ damage.

---

## Test case 3 — Intermediate risk (score 5)

**Vignette.** Margarethe Schulz, a 71-year-old woman with severe functional
TR and longstanding atrial fibrillation. She has NYHA III dyspnoea and
mild peripheral oedema only (not "marked" — the RHF-signs flag is false).
She is on furosemide 160 mg daily. eGFR 48 mL/min/1.73 m², total bilirubin
normal at 1.0 mg/dL. Echo: LVEF 50 %, qualitatively preserved RV systolic
function (TAPSE 18 mm, FAC 38 %).

**Inputs:**

| Field | Value | Points |
|---|---|---|
| `age_ge_70` | true (71) | 1 |
| `nyha_class_iii_iv` | true (III) | 1 |
| `right_heart_failure_signs` | false | 0 |
| `daily_furosemide_ge_125_mg` | true (160 mg) | 2 |
| `gfr_lt_30` | false (48) | 0 |
| `bilirubin_elevated` | false (1.0) | 0 |
| `lvef_lt_60` | true (50 %) | 1 |
| `rv_dysfunction_mod_severe` | false | 0 |

**Total score: 5**

**Expected output:**
- Score: **5**
- Predicted in-hospital mortality: **14 %** (observed 18 % in derivation)
- Risk band: **Intermediate** — Heart Team discussion required; weigh
  surgical repair vs replacement vs transcatheter edge-to-edge or
  annuloplasty; optimise volume status, renal and hepatic function pre-op.

---

## Test case 4 — High risk (score 7)

**Vignette.** Joseph Whitfield, a 76-year-old man with severe functional TR
and chronic right-heart failure. NYHA III, with ascites, 3+ pitting
peripheral oedema, and prominent JVD. On furosemide 250 mg daily. Renal
and hepatic function are preserved (eGFR 55 mL/min/1.73 m², total bilirubin
1.0 mg/dL). Echo: LVEF 55 %, mild RV dysfunction only (qualitatively not
moderate).

**Inputs:**

| Field | Value | Points |
|---|---|---|
| `age_ge_70` | true (76) | 1 |
| `nyha_class_iii_iv` | true (III) | 1 |
| `right_heart_failure_signs` | true (ascites + oedema + JVD) | 2 |
| `daily_furosemide_ge_125_mg` | true (250 mg) | 2 |
| `gfr_lt_30` | false (eGFR 55) | 0 |
| `bilirubin_elevated` | false (1.0) | 0 |
| `lvef_lt_60` | true (55 %) | 1 |
| `rv_dysfunction_mod_severe` | false (mild only) | 0 |

**Total score: 7**

**Expected output:**
- Score: **7**
- Predicted in-hospital mortality: **34 %** (observed 32 % in derivation)
- Risk band: **High** — surgery carries prohibitive risk; favour
  transcatheter therapy or medical management; Heart Team-led shared
  decision-making.

---

## Test case 5 — Edge case: maximum score (score 12)

**Vignette.** Edith Lambourne, an 84-year-old woman with longstanding
severe functional TR and end-stage right-heart failure. She is NYHA IV
with massive ascites, anasarca, and prominent JVD. On furosemide 500 mg
daily plus metolazone. Chronic dialysis-dependent CKD. Total bilirubin
3.8 mg/dL (cardiac cirrhosis). Echo: LVEF 35 %, severe RV dysfunction
(TAPSE 9 mm, FAC 18 %).

**Inputs:**

| Field | Value | Points |
|---|---|---|
| `age_ge_70` | true (84) | 1 |
| `nyha_class_iii_iv` | true (IV) | 1 |
| `right_heart_failure_signs` | true (ascites, anasarca, JVD) | 2 |
| `daily_furosemide_ge_125_mg` | true (500 mg) | 2 |
| `gfr_lt_30` | true (chronic dialysis → coded true per spec) | 2 |
| `bilirubin_elevated` | true (3.8 mg/dL) | 2 |
| `lvef_lt_60` | true (35 %) | 1 |
| `rv_dysfunction_mod_severe` | true (severe) | 1 |

**Total score: 12 (maximum possible)**

**Expected output:**
- Score: **12**
- Predicted in-hospital mortality: **65 %** (≥9 bucket; observed 60 % in
  derivation)
- Risk band: **High** — surgical mortality prohibitive. Conventional
  surgery is generally not recommended; consider transcatheter therapy
  vs medical management with palliative-care input. This case illustrates
  why early referral, before progression to multi-organ congestion, is
  critical.
