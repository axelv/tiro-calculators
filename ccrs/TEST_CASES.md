# CHRS / CCRS — Fictional Test Cases

Five fictional test cases for the **Clonal Hematopoiesis Risk Score (CHRS / CCRS, Weeks 2023)** — predicts 10-year cumulative incidence of progression from CHIP / CCUS to overt myeloid neoplasm.

Score is the sum of 8 weighted features (theoretical range 7.5 – 16.5):

- Single DNMT3A: present 0.5 / absent 1.0
- High-risk mutation (SRSF2 / SF3B1 / ZRSR2 / IDH1 / IDH2 / FLT3 / RUNX1 / JAK2 / TP53): absent 1.0 / present 2.5
- Number of mutations: 1 → 1.0; ≥ 2 → 2.0
- Max VAF: < 0.2 → 1.0; > 0.2 → 2.0
- RDW: < 15 % → 1.0; ≥ 15 % → 2.5
- MCV: < 100 fL → 1.0; > 100 fL → 2.5
- Cytopenia status: CHIP → 1.0; CCUS → 1.5
- Age: < 65 → 1.0; ≥ 65 → 1.5

Categories: **Low** ≤ 9.5 (10-y MN risk 0.67 %); **Intermediate** 10.0–12.0 (7.83 %); **High** ≥ 12.5 (52.2 %).

Cytopenia thresholds (WHO): Hb < 13 g/dL (M) or < 12 g/dL (F); platelets < 150 × 10⁹/L; ANC < 1.8 × 10⁹/L.

---

## Test case 1 — Low risk (canonical favourable CHIP, isolated DNMT3A)

**Vignette.** Mr. Ronald Beauchamp, a 58-year-old male incidentally found to have a single low-VAF DNMT3A mutation on a research NGS panel during a healthy-volunteer biobank study. CBC is fully normal; no cytopenia.

**Inputs**

| Variable | Value |
|---|---|
| Age | 58 y |
| RDW | 13.4 % |
| MCV | 92 fL |
| Hb | 14.6 g/dL (normal for M) |
| Platelets | 240 × 10⁹/L |
| ANC | 4.2 × 10⁹/L |
| Cytopenia status | CHIP |
| Mutations | DNMT3A only, 1 variant, VAF 0.08 |
| `single_DNMT3A` | true |
| `high_risk_mutation` | false |
| `n_mutations` | 1 |
| `max_VAF` | 0.08 (< 0.2) |

**Point breakdown**

| Feature | Bin | Points |
|---|---|---:|
| Single DNMT3A | present | 0.5 |
| High-risk mutation | absent | 1.0 |
| n_mutations | 1 | 1.0 |
| max_VAF | < 0.2 | 1.0 |
| RDW | < 15 % | 1.0 |
| MCV | < 100 fL | 1.0 |
| Cytopenia status | CHIP | 1.0 |
| Age | < 65 y | 1.0 |
| **Total** | | **7.5** |

**Expected output**

- `CHRS_score`: **7.5** (theoretical minimum)
- `CHRS_category`: **Low**
- `risk_10y_progression_MN`: **0.67 %** (± 0.083)
- Recommendation: routine primary-care follow-up; no specialist hematology referral mandated by score alone. Re-evaluate if new cytopenia, rising RDW/MCV, or new mutation appears.

---

## Test case 2 — Low risk, slightly higher (older, two mutations, no high-risk gene)

**Vignette.** Mrs. Henrietta Vasquez-Lindemann, a 71-year-old female with well-controlled hypertension. Routine NGS shows two mutations in TET2 and ASXL1 (neither on the 9-gene high-risk list), VAFs both < 0.2. CBC, RDW, MCV normal.

**Inputs**

| Variable | Value |
|---|---|
| Age | 71 y |
| RDW | 14.2 % |
| MCV | 94 fL |
| Hb | 13.4 g/dL (normal for F) |
| Platelets | 180 × 10⁹/L |
| ANC | 3.5 × 10⁹/L |
| Cytopenia status | CHIP |
| Mutations | TET2 + ASXL1 (2 variants); max VAF 0.18 |
| `single_DNMT3A` | false |
| `high_risk_mutation` | false |
| `n_mutations` | 2 |
| `max_VAF` | 0.18 (< 0.2) |

**Point breakdown**

| Feature | Bin | Points |
|---|---|---:|
| Single DNMT3A | absent | 1.0 |
| High-risk mutation | absent | 1.0 |
| n_mutations | ≥ 2 | 2.0 |
| max_VAF | < 0.2 | 1.0 |
| RDW | < 15 % | 1.0 |
| MCV | < 100 fL | 1.0 |
| Cytopenia status | CHIP | 1.0 |
| Age | ≥ 65 y | 1.5 |
| **Total** | | **9.5** |

**Expected output**

- `CHRS_score`: **9.5** (top of Low band)
- `CHRS_category`: **Low**
- `risk_10y_progression_MN`: **0.67 %**
- Recommendation: routine follow-up; reassess CBC and panel periodically given older age and ≥ 2 clones.

---

## Test case 3 — Intermediate risk (CCUS, high VAF, no high-risk gene)

**Vignette.** Mr. Aleksander Wojtkiewicz-Brennan, a 68-year-old male haematology referral for unexplained, persistent normocytic anaemia (Hb 11.8). Bone marrow excludes overt MDS. NGS shows a single TET2 mutation at VAF 0.32. RDW and MCV are within normal limits.

**Inputs**

| Variable | Value |
|---|---|
| Age | 68 y |
| RDW | 14.3 % (< 15 %) |
| MCV | 96 fL (< 100 fL) |
| Hb | 11.8 g/dL (anaemic for M) |
| Platelets | 175 × 10⁹/L |
| ANC | 2.0 × 10⁹/L |
| Cytopenia status | CCUS |
| Mutations | TET2 only, 1 variant, VAF 0.32 |
| `single_DNMT3A` | false |
| `high_risk_mutation` | false |
| `n_mutations` | 1 |
| `max_VAF` | 0.32 (> 0.2) |

**Point breakdown**

| Feature | Bin | Points |
|---|---|---:|
| Single DNMT3A | absent | 1.0 |
| High-risk mutation | absent | 1.0 |
| n_mutations | 1 | 1.0 |
| max_VAF | > 0.2 | 2.0 |
| RDW | < 15 % | 1.0 |
| MCV | < 100 fL | 1.0 |
| Cytopenia status | CCUS | 1.5 |
| Age | ≥ 65 y | 1.5 |
| **Total** | | **10.0** |

**Expected output**

- `CHRS_score`: **10.0**
- `CHRS_category`: **Intermediate** (band 10.0 – 12.0)
- `risk_10y_progression_MN`: **7.83 %** (± 0.81)
- Recommendation: hematology referral and periodic surveillance (CBC + repeat NGS panel; consider bone marrow only if cytopenia evolves). Score does not warrant pre-emptive treatment.

---

## Test case 4 — High risk (CCUS with high-risk-gene mutation, two clones, high VAF, RDW & MCV up)

**Vignette.** Mrs. Iolanthe Karras-Whitfield, a 74-year-old female referred for evaluation of progressive macrocytic anaemia (Hb 10.6) and mild thrombocytopenia (platelets 138). Bone marrow is non-diagnostic for MDS but shows 5 % dysplastic erythroid forms. NGS reveals **SRSF2** + **TET2** mutations, max VAF 0.42.

**Inputs**

| Variable | Value |
|---|---|
| Age | 74 y |
| RDW | 17.8 % |
| MCV | 108 fL |
| Hb | 10.6 g/dL (anaemic for F) |
| Platelets | 138 × 10⁹/L (thrombocytopenia) |
| ANC | 2.4 × 10⁹/L |
| Cytopenia status | CCUS (anaemia + thrombocytopenia) |
| Mutations | SRSF2 + TET2, 2 variants; max VAF 0.42 |
| `single_DNMT3A` | false |
| `high_risk_mutation` | true (SRSF2) |
| `n_mutations` | 2 |
| `max_VAF` | 0.42 (> 0.2) |

**Point breakdown**

| Feature | Bin | Points |
|---|---|---:|
| Single DNMT3A | absent | 1.0 |
| High-risk mutation | present | 2.5 |
| n_mutations | ≥ 2 | 2.0 |
| max_VAF | > 0.2 | 2.0 |
| RDW | ≥ 15 % | 2.5 |
| MCV | > 100 fL | 2.5 |
| Cytopenia status | CCUS | 1.5 |
| Age | ≥ 65 y | 1.5 |
| **Total** | | **15.5** |

**Expected output**

- `CHRS_score`: **15.5**
- `CHRS_category`: **High** (≥ 12.5)
- `risk_10y_progression_MN`: **52.2 %** (± 4.96)
- Recommendation: prompt hematology referral, bone marrow biopsy to exclude occult MDS, and discussion of clinical-trial enrolment for MN prevention.

---

## Test case 5 — Edge case (theoretical maximum score, 16.5)

**Vignette.** Mr. Bartholomew Edgerton-Magnusson, an 81-year-old male referred with severe macrocytic anaemia (Hb 9.4), borderline thrombocytopenia, and high RDW. NGS shows three mutations including **TP53** and **SRSF2**, max VAF 0.55. Bone marrow excludes overt MDS by current WHO criteria — diagnosis is high-risk CCUS. He is the practical maximum-CHRS exemplar.

**Inputs**

| Variable | Value |
|---|---|
| Age | 81 y |
| RDW | 19.2 % |
| MCV | 112 fL |
| Hb | 9.4 g/dL |
| Platelets | 142 × 10⁹/L |
| ANC | 2.1 × 10⁹/L |
| Cytopenia status | CCUS |
| Mutations | TP53 + SRSF2 + DNMT3A, 3 variants; max VAF 0.55 |
| `single_DNMT3A` | false (multiple mutations, including non-DNMT3A) |
| `high_risk_mutation` | true (TP53 and SRSF2 — both on the high-risk list) |
| `n_mutations` | 3 (≥ 2) |
| `max_VAF` | 0.55 (> 0.2) |

**Point breakdown**

| Feature | Bin | Points |
|---|---|---:|
| Single DNMT3A | absent | 1.0 |
| High-risk mutation | present | 2.5 |
| n_mutations | ≥ 2 | 2.0 |
| max_VAF | > 0.2 | 2.0 |
| RDW | ≥ 15 % | 2.5 |
| MCV | > 100 fL | 2.5 |
| Cytopenia status | CCUS | 1.5 |
| Age | ≥ 65 y | 1.5 |
| **Total** | | **16.5** (theoretical maximum) |

**Expected output**

- `CHRS_score`: **16.5** (theoretical maximum)
- `CHRS_category`: **High**
- `risk_10y_progression_MN`: **52.2 %** (± 4.96) — this is the published category mean; individual hazards in this region of the score are at the very top of the cohort distribution (Cox HR ≈ 101 vs. Low band).
- Recommendation: prompt hematology referral, bone marrow biopsy, and MN-prevention trial discussion. Close longitudinal monitoring is essential given combined TP53 / SRSF2 biology.
