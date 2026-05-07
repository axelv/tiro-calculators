# HCT-CI — Fictional Test Cases

Five fictional clinical vignettes for the Hematopoietic Cell Transplantation-
specific Comorbidity Index (Sorror 2005 / 2014). Scoring uses the comorbidity
point table from `SPEC.md` §2.1, the +1 age augmentation from §2.2, and the
risk-group / 2-yr NRM and OS estimates from §3.2 and §4.1.

All patients and details are fictional.

---

## Test case 1 — Low risk (HCT-CI 0)

**Vignette.** Ms Léa Moreau, a 28-year-old woman with newly diagnosed
intermediate-risk AML in first complete remission, is referred for matched-
sibling allogeneic HCT. Pre-HCT workup: BMI 23, no chronic disease, normal
ECG with sinus rhythm, LVEF 62 %, normal liver/renal/pulmonary function,
no diabetes, no prior cancer, no infections, no psychiatric history.

**Comorbidity itemisation**

| Category | Present? | Points |
|---|---|---|
| Arrhythmia | no | 0 |
| Cardiac (CAD/CHF/MI/EF ≤ 50%) | no | 0 |
| IBD | no | 0 |
| Diabetes (insulin/oral) | no | 0 |
| Cerebrovascular | no | 0 |
| Psychiatric | no | 0 |
| Hepatic, mild | no | 0 |
| Obesity (BMI > 35) | no | 0 |
| Infection (post-day-0) | no | 0 |
| Rheumatologic | no | 0 |
| Peptic ulcer | no | 0 |
| Renal moderate/severe | no | 0 |
| Pulmonary moderate (DLco/FEV1 66–80 %) | no | 0 |
| Heart valve | no | 0 |
| Hepatic moderate/severe | no | 0 |
| Pulmonary severe (DLco/FEV1 ≤ 65 %) | no | 0 |
| Prior solid tumor | no | 0 |

- HCT-CI: **0**
- Age ≥ 40: false (age 28) → +0
- HCT Comorbidity/Age: **0**

**Expected output**

- Risk group (Sorror 2005): **Low** (score 0)
- Risk group (Sorror 2014 composite): **Low** (0–2)
- 2-yr NRM: 14 %
- 2-yr OS: 71 %
- Comment: physiologically fit candidate; full-intensity myeloablative
  conditioning is appropriate.

---

## Test case 2 — Intermediate (HCT-CI 2 — original / Composite 3)

**Vignette.** Mr Anthony Brooks, a 46-year-old man with chemo-refractory
DLBCL, planned for matched-unrelated-donor allogeneic HCT after CAR-T
failure. Pre-HCT workup: insulin-treated type 2 diabetes; PFTs show
DLco 74 % predicted (no rest dyspnoea); LVEF 58 %; no other comorbidities.

**Comorbidity itemisation**

| Category | Present? | Points |
|---|---|---|
| Diabetes (insulin) | yes | 1 |
| Pulmonary moderate (DLco 74 %) | yes | 2 |
| (all other categories) | no | 0 |

- HCT-CI: **3**

Wait — diabetes (1) + pulmonary moderate (2) = 3, not 2. Let me reframe to a
genuine intermediate-original case (HCT-CI 2):

Revised: Mr Anthony Brooks, 46, on insulin for type 2 DM. PFTs normal
(DLco 90 %), no other comorbidities, BMI 38 (obesity, 1 pt).

**Revised itemisation**

| Category | Present? | Points |
|---|---|---|
| Diabetes (insulin) | yes | 1 |
| Obesity (BMI 38 > 35) | yes | 1 |
| (all other) | no | 0 |

- HCT-CI: 1 + 1 = **2**
- Age ≥ 40: true (age 46) → +1
- HCT Comorbidity/Age: **3**

**Expected output**

- Risk group (Sorror 2005, HCT-CI = 2): **Intermediate** (1–2)
- Risk group (Sorror 2014, composite = 3): **Intermediate** (3–4)
- 2-yr NRM: 21 %
- 2-yr OS: 60 %
- Comment: composite ≥ 3 — non-myeloablative / RIC conditioning may be
  preferred due to lower NRM relative to high-dose conditioning at this
  composite score.

---

## Test case 3 — High risk (HCT-CI 4 — Sorror 2005 high)

**Vignette.** Mrs Sophia Nakamura, a 52-year-old woman with high-risk MDS
and a recent diagnostic workup showing: paroxysmal atrial fibrillation
(controlled), insulin-dependent diabetes, chronic hepatitis B with ALT 1.8×
ULN and bilirubin within normal limits.

**Comorbidity itemisation**

| Category | Present? | Points |
|---|---|---|
| Arrhythmia (AFib) | yes | 1 |
| Diabetes (insulin) | yes | 1 |
| Hepatic, mild (chronic hepatitis B, ALT 1.8× ULN) | yes | 1 |
| (all other) | no | 0 |

- HCT-CI: 1 + 1 + 1 = **3**
- Age ≥ 40: true (52) → +1
- HCT Comorbidity/Age: **4**

**Expected output**

- Risk group (Sorror 2005): **High** (≥ 3)
- Risk group (Sorror 2014, composite = 4): **Intermediate** (3–4)
- 2-yr NRM: 41 %
- 2-yr OS: 34 %
- Comment: per the 2014 cohort, scores 3–4 derive significantly lower NRM
  with non-myeloablative vs high-dose conditioning — strong argument for
  RIC in this patient.

---

## Test case 4 — Very high risk (HCT-CI 7 — Sorror 2014 high)

**Vignette.** Mr Robert Klein, a 64-year-old man with relapsed AML, prior
CABG with subsequent moderate aortic stenosis, prior treated colon cancer
4 years ago (now NED), well-controlled rheumatoid arthritis on
methotrexate, and chronic moderate dyspnoea on exertion (DLco 60 %
predicted).

**Comorbidity itemisation**

| Category | Present? | Points |
|---|---|---|
| Cardiac (prior CABG / CAD) | yes | 1 |
| Heart valve (moderate AS, not MVP) | yes | 3 |
| Pulmonary severe (DLco 60 %) | yes | 3 |
| Rheumatologic (RA) | yes | 2 |
| Prior solid tumor (treated colon cancer) | yes | 3 |
| (all other) | no | 0 |

Wait — the spec says hepatic and pulmonary categories are *mutually
exclusive*: score the highest tier only. Pulmonary severe (DLco ≤ 65 %)
applies; do not also count moderate. Already handled — only severe scored.

Sum: 1 + 3 + 3 + 2 + 3 = **12**

That is dramatically higher than I targeted. Let me revise to a cleaner
high-tier case (composite ≥ 5 but not extreme):

Revised: Mr Robert Klein, 64, with prior CABG (cardiac, 1 pt), DLco 60 %
(pulmonary severe, 3 pts) — no RA, no prior cancer, no valve disease.

**Revised itemisation**

| Category | Present? | Points |
|---|---|---|
| Cardiac (prior CABG) | yes | 1 |
| Pulmonary severe (DLco 60 %) | yes | 3 |
| (all other) | no | 0 |

- HCT-CI: 1 + 3 = **4**
- Age ≥ 40: true (64) → +1
- HCT Comorbidity/Age: **5**

**Expected output**

- Risk group (Sorror 2005, HCT-CI = 4): **High** (≥ 3)
- Risk group (Sorror 2014, composite = 5): **High** (≥ 5)
- 2-yr NRM: 41 %
- 2-yr OS: 34 %
- Comment: high NRM expected with high-dose conditioning; strongly favour
  RIC / non-myeloablative regimens. Pre-HCT cardiopulmonary optimisation
  and infection prophylaxis pivotal.

---

## Test case 5 — Edge case: extreme cumulative comorbidity (HCT-CI ≈ 11)

**Vignette.** Mr Daichi Sato, a 67-year-old man with relapsed-refractory
AML for whom his transplant team is debating eligibility. He has insulin-
treated diabetes, atrial fibrillation, prior ischaemic stroke 5 years ago,
moderate aortic stenosis, treated peptic ulcer disease (now H. pylori
negative on PPI), serum creatinine 2.4 mg/dL, BMI 37, mild non-cirrhotic
fatty liver disease (bilirubin 1.3× ULN). Pulmonary function and prior
solid-tumor history are negative.

**Comorbidity itemisation**

| Category | Present? | Points |
|---|---|---|
| Arrhythmia (AF) | yes | 1 |
| Diabetes (insulin) | yes | 1 |
| Cerebrovascular (prior CVA) | yes | 1 |
| Heart valve (moderate AS, not MVP) | yes | 3 |
| Peptic ulcer (treated) | yes | 2 |
| Renal moderate/severe (creatinine 2.4 > 2 mg/dL) | yes | 2 |
| Obesity (BMI 37 > 35) | yes | 1 |
| Hepatic, mild (bilirubin 1.3× ULN) | yes | 1 |
| (all other) | no | 0 |

Sum: 1 + 1 + 1 + 3 + 2 + 2 + 1 + 1 = **12**

- HCT-CI: **12**
- Age ≥ 40: true (67) → +1
- HCT Comorbidity/Age: **13**

**Expected output**

- Risk group (Sorror 2005, HCT-CI ≥ 3): **High**
- Risk group (Sorror 2014, composite ≥ 5): **High**
- 2-yr NRM: 41 % (table saturates at the high band; observed NRM in
  patients with scores this elevated is typically substantially worse —
  see Sorror 2014 supplemental data)
- 2-yr OS: 34 % (likely lower in practice at this score)
- Comment: extreme comorbidity burden. Allogeneic HCT is associated with
  prohibitive NRM at this composite score; team should explicitly discuss
  whether transplant remains the best therapeutic option vs alternative
  treatment paths. If pursued, RIC / non-myeloablative conditioning is
  mandatory and aggressive comorbidity optimisation (renal, glycaemic,
  weight, valve evaluation) must precede admission.

---

*2-yr NRM and OS estimates and risk-group labels follow Sorror 2005
(`SPEC.md` §4.1) and the composite stratification from Sorror 2014
(`SPEC.md` §3.2).*
