# CHA₂DS₂-VASc — Fictional Test Cases

Five fictional test cases for the **CHA₂DS₂-VASc score** (original variant, max 9). All annual-stroke-risk percentages are taken from SPEC.md (Lip 2010 derivation and Friberg 2012 Swedish national cohort).

Point weights: C 1, H 1, A₂ (≥75) **2**, D 1, S₂ (prior stroke/TIA/TE) **2**, V 1, A (65–74) 1, Sc (female) 1. Age categories are mutually exclusive.

Anticoagulation thresholds (ESC 2020 / AHA-ACC-HRS 2023):
- Male: 0 = no therapy; 1 = consider OAC; ≥ 2 = OAC recommended (Class I)
- Female: 1 (sex point only) = no therapy; 2 = consider OAC; ≥ 3 = OAC recommended (Class I)

---

## Test case 1 — Score 0 (truly low risk, male)

**Vignette.** Mr. Felix Andersen-Park, a 52-year-old male software architect with newly diagnosed paroxysmal AF detected on a wearable. He has no other medical history, normal blood pressure, no diabetes, no prior stroke, no vascular disease.

**Inputs**

| Component | Value | Points |
|---|---|---:|
| Congestive heart failure | No | 0 |
| Hypertension | No | 0 |
| Age ≥ 75 | No (52) | 0 |
| Diabetes mellitus | No | 0 |
| Prior stroke / TIA / TE | No | 0 |
| Vascular disease | No | 0 |
| Age 65–74 | No | 0 |
| Sex — female | No (male) | 0 |

**Calculation.** 0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 = **0** (minimum).

**Expected output**

- `score`: 0
- `variant`: CHA2DS2-VASc (max 9)
- Annual stroke risk: Lip 2010 **0.0 %**; Friberg 2012 **0.2 %**
- `risk_band`: low
- Recommendation: **no antithrombotic therapy** — truly low-risk.

---

## Test case 2 — Score 1 (single sex point in a female — low-risk equivalent)

**Vignette.** Ms. Marisol Villanueva-Khoo, a 54-year-old female with newly diagnosed AF. No hypertension, no diabetes, no heart failure, no prior stroke, no vascular disease. Her only point comes from being female. This is the canonical "1 = sex point only" case the spec calls out as low-risk equivalent to male = 0.

**Inputs**

| Component | Value | Points |
|---|---|---:|
| Congestive heart failure | No | 0 |
| Hypertension | No | 0 |
| Age ≥ 75 | No (54) | 0 |
| Diabetes mellitus | No | 0 |
| Prior stroke / TIA / TE | No | 0 |
| Vascular disease | No | 0 |
| Age 65–74 | No | 0 |
| Sex — female | Yes | 1 |

**Calculation.** 0 + 0 + 0 + 0 + 0 + 0 + 0 + 1 = **1**.

**Expected output**

- `score`: 1 (sex point only)
- Annual stroke risk: Lip 2010 **0.6 %**; Friberg 2012 **0.6 %**
- `risk_band`: low (sex-only — treated as male = 0 equivalent)
- Recommendation: **no antithrombotic therapy** (female with score 1 from sex alone = low-risk equivalent).

---

## Test case 3 — Score 3 (intermediate-to-high, male)

**Vignette.** Mr. Vladimir Stoyanov-Mendes, a 67-year-old male with persistent AF, treated essential hypertension, and type 2 diabetes on metformin. No prior stroke, no heart failure, no vascular disease.

**Inputs**

| Component | Value | Points |
|---|---|---:|
| Congestive heart failure | No | 0 |
| Hypertension | Yes | 1 |
| Age ≥ 75 | No (67) | 0 |
| Diabetes mellitus | Yes | 1 |
| Prior stroke / TIA / TE | No | 0 |
| Vascular disease | No | 0 |
| Age 65–74 | Yes (67) | 1 |
| Sex — female | No (male) | 0 |

**Calculation.** 0 + 1 + 0 + 1 + 0 + 0 + 1 + 0 = **3**.

**Expected output**

- `score`: 3
- Annual stroke risk: Lip 2010 **3.9 %**; Friberg 2012 **3.2 %**
- `risk_band`: high
- Recommendation (male, ≥ 2): **OAC recommended (Class I)** — DOAC preferred over warfarin in non-valvular AF.

---

## Test case 4 — Score 7 (high risk, female with stroke and CHF)

**Vignette.** Mrs. Geneviève Lacroix-Onyemaechi, a 71-year-old female with permanent AF, longstanding hypertension, type 2 diabetes, HFrEF (LVEF 32 %), and a history of ischaemic stroke 18 months ago. No vascular disease.

**Inputs**

| Component | Value | Points |
|---|---|---:|
| Congestive heart failure | Yes (HFrEF) | 1 |
| Hypertension | Yes | 1 |
| Age ≥ 75 | No (71) | 0 |
| Diabetes mellitus | Yes | 1 |
| Prior stroke / TIA / TE | Yes (prior ischaemic stroke) | 2 |
| Vascular disease | No | 0 |
| Age 65–74 | Yes (71) | 1 |
| Sex — female | Yes | 1 |

**Calculation.** 1 + 1 + 0 + 1 + 2 + 0 + 1 + 1 = **7**.

**Expected output**

- `score`: 7
- Annual stroke risk: Lip 2010 **8.0 %**; Friberg 2012 **11.2 %**
- `risk_band`: high
- Recommendation (female, ≥ 3): **OAC recommended (Class I)** — DOAC preferred. Patient already qualifies for full anticoagulation indefinitely on the basis of prior stroke alone (S₂ = 2).

---

## Test case 5 — Edge case: maximum score 9 (female, all risk factors present, ≥ 75)

**Vignette.** Mrs. Constance Rutherford-Yamada, an 83-year-old female with permanent AF, treated hypertension, HFpEF, type 2 diabetes, prior PCI for inferior STEMI three years ago, and a TIA last year. She represents the maximum CHA₂DS₂-VASc exemplar.

**Inputs**

| Component | Value | Points |
|---|---|---:|
| Congestive heart failure | Yes (HFpEF) | 1 |
| Hypertension | Yes | 1 |
| Age ≥ 75 | Yes (83) | 2 |
| Diabetes mellitus | Yes | 1 |
| Prior stroke / TIA / TE | Yes (TIA) | 2 |
| Vascular disease | Yes (prior MI / PCI) | 1 |
| Age 65–74 | No (mutually exclusive with A₂; age ≥ 75) | 0 |
| Sex — female | Yes | 1 |

**Calculation.** 1 + 1 + 2 + 1 + 2 + 1 + 0 + 1 = **9** (theoretical maximum).

**Expected output**

- `score`: 9 (maximum)
- Annual stroke risk: Lip 2010 **100 %**¹; Friberg 2012 **12.2 %** *(¹ Lip 2010 figure based on n = 1 patient at score 9; not statistically reliable — Friberg 2012 should be the headline figure, per the SPEC's "Recommendation for implementations".)*
- `risk_band`: very high
- Recommendation (female, ≥ 3): **OAC recommended (Class I)** — DOAC preferred unless contraindicated. Parallel HAS-BLED assessment is mandatory but is not a contraindication to OAC; flagged modifiable bleeding risks should be addressed instead.
