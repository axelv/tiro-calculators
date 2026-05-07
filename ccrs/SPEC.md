# CCRS / CHRS — Clonal Hematopoiesis Risk Score (Weeks 2023)

Implementation specification for the **Clonal Hematopoiesis Risk Score (CHRS)** — also referenced in the Atticus catalogue as **CCRS (Clonal Cytopenia Risk Score)** because the model is specifically designed to risk-stratify clonal cytopenia of undetermined significance (CCUS) alongside clonal hematopoiesis of indeterminate potential (CHIP) for progression to overt myeloid neoplasm (MDS / AML).

**Authoritative source:** [https://www.chrsapp.com](https://www.chrsapp.com) (online calculator referenced by the authors)
**Primary publication:** Weeks LD, Niroula A, Neuberg D, Wong W, Lindsley RC, Luskin MR, et al. *Prediction of Risk for Myeloid Malignancy in Clonal Hematopoiesis.* **NEJM Evidence** 2023;2(5):EVIDoa2200310. DOI: [10.1056/EVIDoa2200310](https://doi.org/10.1056/EVIDoa2200310). PMC: [PMC10361696](https://pmc.ncbi.nlm.nih.gov/articles/PMC10361696/).
**Not on MDCalc** at time of writing.

---

## 1. Purpose

CHRS estimates the **10-year cumulative incidence of progression from clonal hematopoiesis (CHIP or CCUS) to overt myeloid malignancy (MN: MDS, AML, MDS/MPN, MPN)**. The score was derived in 193,743 UK Biobank participants with sequenced exomes and validated in a 240,003-participant validation cohort (separate UKB tranche) and an external Mass General Brigham clinical cohort. C-index: **0.807 ± 0.016** in derivation, **0.799 ± 0.015** in validation.

The model is intended to:

- Triage incidentally-discovered CHIP for hematology referral / surveillance intensity.
- Stratify CCUS patients for whom MDS has been excluded but who carry myeloid driver mutations and unexplained cytopenia.
- Identify the small (~1%) high-risk subgroup that has a >50% 10-year risk of progression to MN.

---

## 2. Inputs

All eight features are required. Mutations are called from a curated panel of myeloid driver genes; "mutation present" follows Weeks 2023 cohort conventions (somatic, oncogenic / likely-oncogenic variant at VAF ≥ 2%).

### 2.1 Demographics & blood counts

| Variable | Type | Unit | Cutoff used in CHRS | Notes |
|---|---|---|---|---|
| `age` | numeric | years | **≥ 65 vs. < 65** | Single binary cutoff. |
| `RDW` | numeric | % | **≥ 15% vs. < 15%** | Red cell distribution width. |
| `MCV` | numeric | fL | **> 100 vs. < 100** | Mean corpuscular volume; macrocytosis flag. |

### 2.2 Cytopenia status (CHIP vs. CCUS classification)

| Variable | Type | Allowed values | Definition |
|---|---|---|---|
| `cytopenia_status` | categorical | `CHIP`, `CCUS` | `CCUS` if any unexplained, persistent cytopenia is present (see thresholds below); otherwise `CHIP`. |

**Cytopenia thresholds (per Weeks 2023, WHO criteria):**

| Lineage | Threshold for cytopenia |
|---|---|
| Anemia | Hemoglobin **< 13.0 g/dL** (men) or **< 12.0 g/dL** (women) |
| Thrombocytopenia | Platelet count **< 150 × 10⁹/L** |
| Neutropenia | Absolute neutrophil count **< 1.8 × 10⁹/L** |

CCUS requires that the cytopenia be persistent and otherwise unexplained, and that overt myeloid neoplasm has been excluded by bone marrow evaluation per WHO criteria (the CHRS is **not** intended for patients with diagnosed MDS / AML / MPN — use IPSS-M / IPSS-R / ELN instead).

### 2.3 Molecular variables

Calls come from a myeloid NGS panel covering at minimum the genes below. VAF is reported as a fraction (0–1). For multi-mutated cases use the **maximum VAF** across called variants.

| Variable | Type | Allowed values | Definition |
|---|---|---|---|
| `single_DNMT3A` | boolean | `true`, `false` | Exactly one mutation, in **DNMT3A** only (favorable signature when present alone). |
| `high_risk_mutation` | boolean | `true`, `false` | At least one mutation in any of: **SRSF2, SF3B1, ZRSR2, IDH1, IDH2, FLT3, RUNX1, JAK2, TP53**. |
| `n_mutations` | integer | `1`, `≥ 2` | Total number of qualifying somatic mutations on the panel (CHIP/CCUS-defining). |
| `max_VAF` | numeric | 0 – 1 | Maximum variant allele fraction across all called mutations. Cutoff: **> 0.2 vs. < 0.2**. |

> **Panel composition.** Weeks 2023 used a curated CHIP gene list (DNMT3A, TET2, ASXL1, JAK2, TP53, SF3B1, SRSF2, U2AF1, ZRSR2, IDH1, IDH2, RUNX1, FLT3, NPM1, CBL, KRAS, NRAS, GNB1, GNAS, BRCC3, PPM1D, BCOR, BCORL1, STAG2, EZH2, CSMD1, CHEK2, ATM, MPL, CALR, MYD88, and others). Implementations should use a clinically-validated myeloid CHIP/CCUS panel that covers the **9 high-risk genes** listed above explicitly. The exact full panel is documented in the Weeks 2023 Methods / Supplementary.

---

## 3. Calculation

CHRS is a **weighted points sum** derived from a Cox proportional-hazards model using recursive-partitioning–selected cutpoints (Weeks 2023, Table 2). Each variable contributes a fixed point weight; points are summed to produce the CHRS.

### 3.1 Point weights (Weeks 2023, Table 2)

| Variable | Condition | Points |
|---|---|---:|
| **Single DNMT3A** | Present (single DNMT3A only) | **0.5** |
| | Absent | **1.0** |
| **High-risk mutation** (SRSF2 / SF3B1 / ZRSR2 / IDH1 / IDH2 / FLT3 / RUNX1 / JAK2 / TP53) | Absent | **1.0** |
| | Present | **2.5** |
| **Number of mutations** | 1 | **1.0** |
| | ≥ 2 | **2.0** |
| **Maximum VAF** | < 0.2 | **1.0** |
| | > 0.2 | **2.0** |
| **RDW** | < 15% | **1.0** |
| | ≥ 15% | **2.5** |
| **MCV** | < 100 fL | **1.0** |
| | > 100 fL | **2.5** |
| **Cytopenia status** | CHIP (no cytopenia) | **1.0** |
| | CCUS (any cytopenia) | **1.5** |
| **Age** | < 65 y | **1.0** |
| | ≥ 65 y | **1.5** |

> **Note on the "Single DNMT3A" feature.** This feature captures the favorable phenotype of an isolated DNMT3A clone. When present, it lowers the contribution of the mutation-identity feature (0.5 vs. 1.0 / 2.5). It is **mutually exclusive** with `high_risk_mutation = present` and with `n_mutations ≥ 2` — i.e., it applies only when the patient has exactly one mutation, in DNMT3A, and no high-risk-gene mutation.

### 3.2 Score formula

```
CHRS = points(single_DNMT3A)
     + points(high_risk_mutation)
     + points(n_mutations)
     + points(max_VAF)
     + points(RDW)
     + points(MCV)
     + points(cytopenia_status)
     + points(age)
```

Score range (theoretical): **7.5 (most favorable) – 16.5 (most adverse)**. Observed range in derivation cohort: ~8 – 16.

### 3.3 Risk categories

| CHRS range | Category | n (% of CH cohort, derivation) |
|---|---|---|
| **≤ 9.5** | **Low risk** | 10,018 (88.4%) |
| **10.0 – 12.0** | **Intermediate risk** | 1,196 (10.5%) |
| **≥ 12.5** | **High risk** | 123 (1.1%) |

Cox-model relative hazards vs. low-risk (Weeks 2023):

- Intermediate vs. Low: **HR ≈ 11.8** (p < 2 × 10⁻¹⁶)
- High vs. Low: **HR ≈ 101** (p < 2 × 10⁻¹⁶)

### 3.4 Reference Cox coefficients

The published model is reported as a points-based system rather than as raw β coefficients in the main text. Underlying continuous Cox regression coefficients and baseline hazard for explicit 10-year probability prediction are documented in the **Weeks 2023 Supplementary Appendix** (model derivation tables).

> `TBD — extract exact β coefficients and baseline cumulative hazard h₀(10y) from Weeks 2023 Supplementary Appendix (NEJM Evid 2023;2:EVIDoa2200310)` if a continuous probability surface (rather than the three-tier categorical output) is required by the consuming application. The points-based scheme above is sufficient for the standard low / intermediate / high triage that the calculator at [chrsapp.com](https://www.chrsapp.com) returns.

---

## 4. Output

For each patient the calculator returns:

| Output | Type | Description |
|---|---|---|
| `CHRS_score` | numeric (7.5–16.5) | Total weighted points sum. |
| `CHRS_category` | enum | One of `low`, `intermediate`, `high`. |
| `risk_10y_progression_MN` | numeric (%) | 10-year cumulative incidence of progression to myeloid neoplasm (MDS / AML / MDS-MPN / MPN). |
| `feature_contributions` | map<string, numeric> | Per-feature points contribution (for explainability). |

### 4.1 10-year cumulative incidence of myeloid neoplasm by category

Per Weeks 2023 (derivation cohort, 10-year follow-up):

| Category | CHRS range | 10-yr cumulative incidence of MN | SE |
|---|---|---:|---:|
| **Low** | ≤ 9.5 | **0.67%** | ± 0.083 |
| **Intermediate** | 10.0 – 12.0 | **7.83%** | ± 0.81 |
| **High** | ≥ 12.5 | **52.2%** | ± 4.96 |

Validation cohort (independent UKB tranche) reproduced these incidences within confidence bounds; C-index 0.799 ± 0.015.

### 4.2 Clinical interpretation

- **Low (CHRS ≤ 9.5):** routine primary-care follow-up; no specialist hematology referral mandated by score alone. Re-evaluate if new cytopenia, rising RDW/MCV, or new mutation appears.
- **Intermediate (10–12):** hematology referral and periodic surveillance (CBC + repeat NGS panel; consider bone marrow only if cytopenia evolves) — ~8% 10-year MN risk warrants monitoring, not pre-emptive treatment.
- **High (≥ 12.5):** prompt hematology referral, bone marrow biopsy to exclude occult MDS, and discussion of clinical-trial enrolment for MN prevention. ~50% 10-year MN risk.

---

## 5. References

1. **Weeks LD, Niroula A, Neuberg D, Wong W, Lindsley RC, Luskin MR, Olszewski AJ, Roulston D, Soiffer R, Steensma DP, Stone RM, Ebert BL, Gibson CJ.** *Prediction of Risk for Myeloid Malignancy in Clonal Hematopoiesis.* **NEJM Evidence** 2023;2(5):EVIDoa2200310. [https://evidence.nejm.org/doi/full/10.1056/EVIDoa2200310](https://evidence.nejm.org/doi/full/10.1056/EVIDoa2200310). PMC: [PMC10361696](https://pmc.ncbi.nlm.nih.gov/articles/PMC10361696/). PubMed: [37483562](https://pubmed.ncbi.nlm.nih.gov/37483562/). — primary publication, model derivation, points table, validation cohort, supplementary appendix with Cox coefficients.
2. **CHRS online calculator** — [https://www.chrsapp.com](https://www.chrsapp.com) — authoritative web tool referenced by the Weeks 2023 authors.
3. **Dana-Farber press release.** *New clinical tool for clonal hematopoiesis pinpoints patients at high risk for blood cancer.* 2023. [https://www.dana-farber.org/newsroom/news-releases/2023/new-clinical-tool-for-clonal-hematopoiesis-pinpoints-patients-at-high-risk-for-blood-cancer](https://www.dana-farber.org/newsroom/news-releases/2023/new-clinical-tool-for-clonal-hematopoiesis-pinpoints-patients-at-high-risk-for-blood-cancer)
4. **The Hematologist (ASH).** Saygin C, Patel A. *Calibrating Personalized Risk in Patients With Clonal Hematopoiesis.* 2024. [https://ashpublications.org/thehematologist/article/doi/10.1182/hem.V21.1.202411/514616](https://ashpublications.org/thehematologist/article/doi/10.1182/hem.V21.1.202411/514616) — clinical commentary on CHRS use.
5. **MLL Munich Leukemia Laboratory.** *Clonal hematopoiesis risk score* (clinical implementation note). [https://www.mll.com/en/clonal-hematopoiesis-risk-score](https://www.mll.com/en/clonal-hematopoiesis-risk-score)
6. **Weeks LD, Marinac CR, Redd R, et al.** *Clonal Hematopoiesis Risk Score and All-Cause and Cardiovascular Mortality in Older Adults.* PMC: [PMC10794939](https://pmc.ncbi.nlm.nih.gov/articles/PMC10794939/) — extension of CHRS to non-malignant outcomes.
