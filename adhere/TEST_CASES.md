# ADHERE Algorithm — Fictional Test Cases

Five fictional bedside test cases for the ADHERE in-hospital mortality risk-stratification tree. All inputs are admission values. Risk band and mortality (%) are derived strictly from the SPEC.md decision tree:

- BUN < 43, SBP ≥ 115 → Very low (2.1%)
- BUN < 43, SBP < 115 → Low / Intermediate Risk 3 (7.0%)
- BUN ≥ 43, SBP ≥ 115 → Intermediate / Intermediate Risk 2 (9.4%)
- BUN ≥ 43, SBP < 115, Cr < 2.75 → High / Intermediate Risk 1 (15.3%)
- BUN ≥ 43, SBP < 115, Cr ≥ 2.75 → Very high / High Risk (21.9%)

---

## Test case 1

**Vignette.** Mrs. Eleanor Whitcombe, a 68-year-old retired teacher with HFpEF, presents to the ED with two weeks of progressive dyspnoea and bilateral leg oedema. She is hemodynamically stable, with a normal renal panel and only mildly elevated urea.

**Inputs**

| Field | Value |
|---|---|
| `BUN` | 22 mg/dL |
| `SBP` | 142 mmHg |
| `Cr` | 1.1 mg/dL |

**Decision-tree walk.**

1. BUN 22 < 43 → take the "favourable BUN" branch.
2. SBP 142 ≥ 115 → take the "favourable SBP" branch.
3. Terminal node: **Very low / Low Risk**.

**Expected output**

- `risk_band`: `very_low`
- `adhere_label`: Low Risk
- In-hospital mortality (derivation): **2.1 %**
- In-hospital mortality (validation): 2.0 %
- Disposition: routine ward management generally appropriate.

---

## Test case 2

**Vignette.** Mr. Hamza Bouzidi, a 74-year-old taxi driver with longstanding HFrEF (LVEF 30 %) and CKD stage 3, is admitted with worsening orthopnoea after running out of furosemide. Renal function is at his usual baseline; blood pressure is on the low side after his evening carvedilol.

**Inputs**

| Field | Value |
|---|---|
| `BUN` | 36 mg/dL |
| `SBP` | 104 mmHg |
| `Cr` | 1.6 mg/dL |

**Decision-tree walk.**

1. BUN 36 < 43 → "favourable BUN" branch.
2. SBP 104 < 115 → "adverse SBP" branch.
3. Terminal node: **Low / Intermediate Risk 3**.

**Expected output**

- `risk_band`: `low`
- `adhere_label`: Intermediate Risk 3
- In-hospital mortality (derivation): **7.0 %**
- In-hospital mortality (validation): 5.7 %
- Disposition: standard inpatient care with usual monitoring.

---

## Test case 3

**Vignette.** Mrs. Penelope Hartwell-Asare, an 81-year-old with chronic AF on furosemide and lisinopril, is admitted with acute decompensated HF after a community-acquired pneumonia. Her admission BP is preserved and she has prerenal azotemia from over-diuresis.

**Inputs**

| Field | Value |
|---|---|
| `BUN` | 58 mg/dL |
| `SBP` | 138 mmHg |
| `Cr` | 1.9 mg/dL |

**Decision-tree walk.**

1. BUN 58 ≥ 43 → "adverse BUN" branch.
2. SBP 138 ≥ 115 → "favourable SBP" branch.
3. Terminal node: **Intermediate / Intermediate Risk 2**.

**Expected output**

- `risk_band`: `intermediate`
- `adhere_label`: Intermediate Risk 2
- In-hospital mortality (derivation): **9.4 %**
- In-hospital mortality (validation): 8.1 %
- Disposition: standard inpatient care; reassess if trajectory worsens.

---

## Test case 4

**Vignette.** Mr. Thaddeus Okonkwo-Lindqvist, a 79-year-old with ischaemic cardiomyopathy (LVEF 25 %) and stage 3b CKD, is brought in by ambulance with acute pulmonary oedema. He is borderline hypotensive and has rising BUN, but his creatinine is still under the 2.75 threshold.

**Inputs**

| Field | Value |
|---|---|
| `BUN` | 64 mg/dL |
| `SBP` | 102 mmHg |
| `Cr` | 2.3 mg/dL |

**Decision-tree walk.**

1. BUN 64 ≥ 43 → "adverse BUN" branch.
2. SBP 102 < 115 → "adverse SBP" branch.
3. Cr 2.3 < 2.75 → "favourable Cr" branch.
4. Terminal node: **High / Intermediate Risk 1**.

**Expected output**

- `risk_band`: `high`
- `adhere_label`: Intermediate Risk 1
- In-hospital mortality (derivation): **15.3 %**
- In-hospital mortality (validation): 13.2 %
- Disposition: closer monitoring; reassess therapy aggressiveness.

---

## Test case 5 (edge case — top of the tree)

**Vignette.** Mrs. Caterina Schönfeld-Marais, an 83-year-old with end-stage HFrEF and pre-existing CKD stage 4, is admitted from the nursing home with cardiogenic shock physiology and severely deranged renal function. She sits at the worst-prognosis terminal node of the ADHERE tree.

**Inputs**

| Field | Value |
|---|---|
| `BUN` | 92 mg/dL |
| `SBP` | 88 mmHg |
| `Cr` | 3.4 mg/dL |

**Decision-tree walk.**

1. BUN 92 ≥ 43 → "adverse BUN" branch.
2. SBP 88 < 115 → "adverse SBP" branch.
3. Cr 3.4 ≥ 2.75 → "adverse Cr" branch.
4. Terminal node: **Very high / High Risk** (worst of five strata).

**Expected output**

- `risk_band`: `very_high`
- `adhere_label`: High Risk
- In-hospital mortality (derivation): **21.9 %**
- In-hospital mortality (validation): 21.4 %
- Disposition: consider ICU/step-down level of care, advanced therapies, and goals-of-care discussion.
