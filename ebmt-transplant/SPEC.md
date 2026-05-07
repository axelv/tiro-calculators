# EBMT Risk Score for Allogeneic Hematopoietic Stem Cell Transplantation

## 1. Purpose

The **EBMT Risk Score** (also called the **Gratwohl Score**) is a pre-transplant clinical prediction rule for stratifying mortality risk in patients undergoing **allogeneic hematopoietic stem cell transplantation (allo-HCT / allo-HSCT)**. Originally derived in 1998 from a chronic myeloid leukemia (CML) cohort by the Chronic Leukemia Working Party of the **European Group for Blood and Marrow Transplantation (EBMT)**, it was subsequently validated for **all acquired hematological disorders** in a cohort of 56,505 transplants (Gratwohl 2009; Gratwohl 2012).

It is used to:

- Estimate **5-year overall survival (OS)** and **transplant-related mortality (TRM)** / non-relapse mortality (NRM) for an individual transplant candidate.
- Support **shared decision-making and counseling** before allo-HCT.
- Identify high-risk candidates in whom alternative strategies (reduced-intensity conditioning, alternative donor sources, palliative pathways, or trial enrolment) should be considered.
- Provide a **simple, bedside-computable** score using only five routinely available pre-transplant variables.

> **Scope:** Validated primarily for **allogeneic** HSCT (matched sibling and unrelated donors) in acquired hematological disorders. The score does **not** incorporate disease-specific cytogenetics, performance status, comorbidity burden (see HCT-CI), conditioning intensity, or graft source — these are addressed by complementary tools (HCT-CI, Disease Risk Index, AL-EBMT, optimised disease-specific scores).

---

## 2. Inputs

The EBMT Risk Score is the **sum of five pre-transplant variables**, each contributing 0, 1, or 2 points, for a **total range of 0–7**.

| # | Component | Type | Definition / Criterion |
|---|-----------|------|------------------------|
| 1 | **Age of recipient** | categorical (3 bands) | Chronological age at transplant: `< 20` / `20–40` / `> 40` years. |
| 2 | **Disease stage at transplant** | categorical (3 bands) | `Early` / `Intermediate` / `Advanced` per EBMT disease-stage definitions (see §2.1). |
| 3 | **Donor type** | categorical (2 levels) | `HLA-identical sibling` vs. `Unrelated donor`. |
| 4 | **Donor–recipient sex match** | categorical (2 levels) | `Female donor → Male recipient` vs. all other combinations. |
| 5 | **Time from diagnosis to transplant** | categorical (2 levels) | `≤ 12 months` vs. `> 12 months`. **Not applied** to patients transplanted in first complete remission (CR1) — by convention these are scored as `≤ 12 months` (0 points) regardless of actual interval. |

### 2.1 Disease Stage Definitions (per Gratwohl / EBMT convention)

The original CML-derived definitions have been generalized to other hematologic malignancies. The standard mapping is:

| Stage | CML | Acute leukemia (AML, ALL) | MDS | Lymphoma / MM | Definition (general) |
|-------|-----|---------------------------|-----|----------------|----------------------|
| **Early** | First chronic phase (CP1) | First complete remission (CR1) | RA / RARS / low-risk untreated | First CR / first chronic phase | Untreated or first remission/chronic phase. |
| **Intermediate** | Accelerated phase, CP > CP1 | CR ≥ 2 | RAEB | CR ≥ 2, partial remission | More advanced than early but not refractory/blastic. |
| **Advanced** | Blast crisis, refractory | Active disease / induction failure / relapse / refractory | RAEB-t, sAML | Refractory / progressive | Active disease or refractory/relapsed at HCT. |

> Implementations should expose stage as an enum (`early` \| `intermediate` \| `advanced`) and document the disease-specific mapping used.

### 2.2 Sex-Match Rule

| Donor sex | Recipient sex | Points |
|-----------|---------------|-------:|
| Female | Male | **+1** |
| Female | Female | 0 |
| Male | Male | 0 |
| Male | Female | 0 |

Rationale: female-donor → male-recipient pairings carry higher risk of acute and chronic graft-versus-host disease (GVHD), driven in part by minor histocompatibility antigens encoded on the Y chromosome (H-Y antigens).

---

## 3. Calculation

The score is the **sum of points** across the five components:

| Component | 0 points | 1 point | 2 points |
|-----------|----------|---------|----------|
| **Age** | < 20 years | 20–40 years | > 40 years |
| **Disease stage** | Early | Intermediate | Advanced |
| **Donor type** | HLA-identical sibling | Unrelated donor | — |
| **Sex match (donor→recipient)** | Any other combination | Female → Male | — |
| **Time from diagnosis to HCT**¹ | ≤ 12 months (or CR1) | > 12 months | — |

¹ For patients transplanted in **first complete remission (CR1)**, the interval component is conventionally scored as **0** regardless of the actual time elapsed (CR1 is, by definition, the early-disease state for which the interval is not informative).

```
Score = points(age) + points(stage) + points(donor) + points(sex_match) + points(interval)
```

### Rules

- **Minimum score:** 0 (best prognosis).
- **Maximum score:** 7 (worst prognosis).
- All five components are **mandatory inputs**. Missing data should produce an explicit "indeterminate" result rather than a partial score.
- The score is computed **once, pre-transplant**, using the candidate's status at the time of HCT planning.

### Risk Categories

Validation studies group scores into three (sometimes four) risk strata. The most widely used grouping is:

| Category | Score range |
|----------|:-----------:|
| **Low risk** | 0 – 2 |
| **Intermediate risk** | 3 – 4 |
| **High (poor) risk** | 5 – 7 |

Some publications use a four-tier scheme (`0–1` / `2` / `3–4` / `5–7`); implementations should make the grouping configurable.

---

## 4. Output

### 4.1 Score Range

Integer in **[0, 7]**.

### 4.2 Predicted 5-Year Outcomes (Gratwohl 2009 / 2012, n = 56,505)

The headline figures from the multi-disease validation cohort:

| Score | 5-year overall survival (OS) | 5-year transplant-related mortality (TRM / NRM) |
|:----:|:---------------------------:|:------------------------------------------------:|
| 0 | ~71% | ~14% |
| 1 | ~63% | ~20% |
| 2 | ~55% | ~26% |
| 3 | ~47% | ~32% |
| 4 | ~38% | ~38% |
| 5 | ~32% | ~46% |
| 6 | ~26% | ~52% |
| 7 | ~24% | ~56% |

> **Implementation note:** the exact percentages vary by underlying disease, era, and conditioning regimen, and across published cohorts. The figures above are representative of the pooled multi-disease EBMT registry analysis; disease-specific tables (CML, AML, ALL, MDS, lymphoma, multiple myeloma, aplastic anemia) are published in Gratwohl 2009 (Cancer) and the EBMT Handbook (Tables 11.3 / 11.4) and should be preferred when the indication is known. Implementations should treat the table above as **reference outcomes** and clearly label them as such.

### 4.3 Risk-Category Outcomes (Pooled Cohorts)

| Category | Score | 5-year OS (approx.) | 5-year TRM (approx.) |
|----------|:----:|:-------------------:|:--------------------:|
| Low | 0–2 | 60–70% | 15–25% |
| Intermediate | 3–4 | 40–50% | 30–40% |
| High | 5–7 | 20–30% | 45–60% |

### 4.4 Clinical Interpretation

- **Score 0–2 (low):** acceptable transplant risk; standard allo-HCT pathway is appropriate.
- **Score 3–4 (intermediate):** counseling about substantial mortality risk; consider HCT-CI co-assessment, optimization of modifiable factors (e.g., better-matched donor, sex-matched donor where feasible, pre-HCT disease control), and reduced-intensity conditioning (RIC) where indicated.
- **Score 5–7 (high):** discuss alternative strategies — clinical trial enrolment, RIC, alternative graft source, or non-transplant approaches — given <30% expected 5-year survival.

### 4.5 Suggested Output Schema

```json
{
  "score": 4,
  "max_score": 7,
  "components": {
    "age_band": "20-40",
    "age_points": 1,
    "disease_stage": "intermediate",
    "stage_points": 1,
    "donor_type": "unrelated",
    "donor_points": 1,
    "sex_match": "female_to_male",
    "sex_match_points": 1,
    "interval_diagnosis_to_hct": "<=12_months",
    "interval_points": 0
  },
  "risk_category": "intermediate",
  "predicted_outcomes_5yr": {
    "overall_survival_percent": 38,
    "transplant_related_mortality_percent": 38,
    "source": "Gratwohl 2009 (pooled multi-disease cohort, n=56505)",
    "note": "Reference figures; disease-specific tables should be preferred when the indication is known."
  }
}
```

### 4.6 Caveats and Limitations

- Derived in an era predominantly using myeloablative conditioning and bone marrow grafts; performance with modern peripheral-blood/umbilical-cord/haploidentical transplants and post-transplant cyclophosphamide is variable.
- Does **not** incorporate **comorbidity** (use **HCT-CI** in parallel) or **disease genetics** (use Disease Risk Index or disease-specific scores).
- Does **not** account for **HLA-matching granularity** beyond sibling-vs-unrelated (e.g., 10/10 vs. 9/10 unrelated, haploidentical donors are not separately stratified).
- 1998 derivation was CML-specific; generalization to all hematologic indications was empirical and validated retrospectively.
- Disease-stage mapping is judgment-dependent for non-CML/non-acute-leukemia indications; document the local mapping used.

---

## 5. References

### Primary Publications

1. **Gratwohl A, Hermans J, Goldman JM, Arcese W, Carreras E, Devergie A, Frassoni F, Gahrton G, Kolb HJ, Niederwieser D, Ruutu T, Vernant JP, de Witte T, Apperley J; Chronic Leukemia Working Party of the European Group for Blood and Marrow Transplantation.** *Risk assessment for patients with chronic myeloid leukaemia before allogeneic blood or marrow transplantation.* **Lancet.** 1998;352(9134):1087–1092. doi:10.1016/S0140-6736(98)03030-X
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/9798583/

2. **Gratwohl A.** *The EBMT risk score.* **Bone Marrow Transplantation.** 2012;47(6):749–756. doi:10.1038/bmt.2011.110
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/21643021/
   - Full text: https://www.nature.com/articles/bmt2011110

### Multi-disease Validation

3. **Gratwohl A, Stern M, Brand R, Apperley J, Baldomero H, de Witte T, Dini G, Rocha V, Passweg J, Sureda A, Tichelli A, Niederwieser D; European Group for Blood and Marrow Transplantation and the European Leukemia Net.** *Risk score for outcome after allogeneic hematopoietic stem cell transplantation: a retrospective analysis.* **Cancer.** 2009;115(20):4715–4726. doi:10.1002/cncr.24531
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/19642176/
   - Full text: https://acsjournals.onlinelibrary.wiley.com/doi/10.1002/cncr.24531

### Disease-specific Validation (selected)

4. **Passweg JR, Walker I, Sobocinski KA, Klein JP, Horowitz MM, Giralt SA; Chronic Leukemia Working Committee, Center for International Blood and Marrow Transplant Research.** *Validation and extension of the EBMT Risk Score for patients with chronic myeloid leukaemia (CML) receiving allogeneic haematopoietic stem cell transplants.* **British Journal of Haematology.** 2004;125(5):613–620. doi:10.1111/j.1365-2141.2004.04955.x
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/15147377/

5. **Terwey TH, Hemmati PG, Martus P, Dietz E, Vuong LG, Massenkeil G, Dörken B, Arnold R.** *A modified EBMT risk score and the hematopoietic cell transplantation-specific comorbidity index for pre-transplant risk assessment in adult acute lymphoblastic leukemia.* **Haematologica.** 2010;95(5):810–818.
   - https://haematologica.org/article/view/5594

6. **Della Porta MG, Alessandrino EP, Bacigalupo A, et al.** *The EBMT Score Predicts Transplant Related Mortality and Overall Survival after Allogeneic Stem Cell Transplantation for Myelodysplastic Syndromes.* **Blood.** 2015;126(23):3223.
   - https://ashpublications.org/blood/article/126/23/3223/91226

### Handbooks and Online Calculators

7. **EBMT Handbook (8th edition), Chapter 11 — Evaluation and Counseling of Candidates.**
   https://www.ncbi.nlm.nih.gov/books/NBK608275/
   - Tables 11.2 (score components), 11.3 (TRM by score), 11.4 (OS by score).

8. **EBMT Risk Score table (Gratwohl) — NCBI Bookshelf, Table 11.2.**
   https://www.ncbi.nlm.nih.gov/books/NBK553925/table/ch11.Tab2/
