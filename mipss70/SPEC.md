# MIPSS70 / MIPSS70+ v2.0

**Mutation-Enhanced International Prognostic Score System for Primary Myelofibrosis (transplant-age patients, ≤70 years)**

This specification covers two distinct, complementary risk-stratification models:

- **MIPSS70 (2018)** — clinical + mutation variables only.
- **MIPSS70+ v2.0 (2018)** — clinical + mutation + karyotype, with sex- and severity-adjusted hemoglobin thresholds and an expanded HMR mutation list.

Both models target patients with **overt primary myelofibrosis (PMF)** age ≤70 years to guide allogeneic hematopoietic-cell transplantation (allo-HCT) decision-making. Neither model is validated for post-PV/post-ET secondary myelofibrosis (use MYSEC-PM instead) or for patients >70 years.

---

## 1. Purpose

Both versions stratify prognosis in transplant-eligible (≤70 y) PMF patients by integrating:

- **Clinical** disease-burden variables (cytopenias, leukocytosis, blasts, symptoms).
- **Molecular** drivers (driver mutation status — CALR type 1/like protective; high-molecular-risk [HMR] mutations).
- **Cytogenetic** risk (MIPSS70+ v2.0 only).

Risk categories inform the trade-off between **allo-HCT (curative, transplant-related mortality)** and **conservative management**:

| Risk category | Transplant implication (general guidance) |
|---|---|
| Very-low / Low | Defer transplant; observe or use disease-directed medical therapy. |
| Intermediate | Individualized decision; consider transplant if other adverse features. |
| High / Very-high | Transplant strongly recommended if eligible; expected median OS without transplant is short. |

> Treatment decisions must integrate comorbidities, donor availability, transplant-specific risk scores (e.g. HCT-CI), and patient preference. The score is prognostic, not prescriptive.

---

## 2. Inputs

### 2.1 MIPSS70 (original)

| Variable | Definition / Threshold | Type | Notes |
|---|---|---|---|
| Hemoglobin | < 10 g/dL (< 100 g/L) | Boolean | Single threshold; not sex-adjusted. |
| Leukocyte count | > 25 × 10⁹/L | Boolean | |
| Platelet count | < 100 × 10⁹/L | Boolean | |
| Circulating blasts | ≥ 2 % | Boolean | Peripheral blood blast fraction. |
| Bone marrow fibrosis grade | ≥ 2 (WHO/EUMNET) | Boolean | Requires bone-marrow biopsy. |
| Constitutional symptoms | Present (weight loss >10 % in 6 mo, night sweats, unexplained fever) | Boolean | |
| Absence of CALR type 1 / type 1-like mutation | Driver mutation is **not** CALR type 1 / type 1-like | Boolean | Patients with JAK2, MPL, triple-negative, or CALR type 2 score positive. |
| HMR mutation present | ≥ 1 of: ASXL1, EZH2, SRSF2, IDH1, IDH2 | Boolean | Requires NGS panel. |
| ≥ 2 HMR mutations | 2 or more from the HMR list above | Boolean | Scored **in addition to** the HMR-present point. |

### 2.2 MIPSS70+ v2.0

Differences from MIPSS70:

- **Hemoglobin** uses sex- and severity-adjusted thresholds (severe vs. moderate anemia).
- **HMR mutation list** is expanded to include **U2AF1 Q157**.
- **Karyotype** replaces leukocytes, platelets, and BM fibrosis grade as a separate weighted variable.
- Constitutional symptoms, blasts, CALR status, and HMR mutations remain.

| Variable | Definition / Threshold | Type | Notes |
|---|---|---|---|
| Severe anemia | Hb < 8 g/dL (women) or < 9 g/dL (men) | Boolean | Mutually exclusive with moderate. |
| Moderate anemia | Hb 8.0–9.9 g/dL (women) or 9.0–10.9 g/dL (men) | Boolean | Mutually exclusive with severe. |
| Circulating blasts | ≥ 2 % | Boolean | |
| Constitutional symptoms | As above | Boolean | |
| Absence of CALR type 1 / type 1-like mutation | Driver is not CALR type 1 / type 1-like | Boolean | |
| HMR mutation present | ≥ 1 of: ASXL1, EZH2, SRSF2, IDH1, IDH2, **U2AF1 Q157** | Boolean | U2AF1 Q157 added in v2.0. |
| ≥ 2 HMR mutations | 2 or more from the expanded HMR list | Boolean | Replaces — not added to — the single-HMR point (see §3.2). |
| Karyotype: very-high risk (VHR) | Single/multiple abnormalities of −7, i(17q), inv(3)/3q21, 12p−/12p11.2, 11q−/11q23, or autosomal trisomies other than +8/+9 | Categorical | Mutually exclusive with the other karyotype rows. |
| Karyotype: unfavorable | Any abnormality not classified as VHR or favorable | Categorical | |
| Karyotype: favorable | Normal, or sole abnormality of 13q−, +9, 20q−, chromosome 1 translocation/duplication, or sex chromosome abnormality including −Y | Categorical | Scores **0** points. |

> Karyotype is selected exactly once: VHR, unfavorable, or favorable.

---

## 3. Calculation

### 3.1 MIPSS70 — point assignments

| Variable | Points |
|---|---|
| Hemoglobin < 10 g/dL | 1 |
| Leukocytes > 25 × 10⁹/L | 2 |
| Platelets < 100 × 10⁹/L | 2 |
| Circulating blasts ≥ 2 % | 1 |
| BM fibrosis grade ≥ 2 | 1 |
| Constitutional symptoms | 1 |
| Absence of CALR type 1/like | 1 |
| HMR mutation present | 1 |
| ≥ 2 HMR mutations | 2 (additive on top of the HMR-present point) |

**Total range:** 0–12.

**Risk categories (3):**

| Category | Score | 5-year OS | Median OS |
|---|---|---|---|
| Low | 0–1 | ~95 % | 27.7 y (95 % CI 22–34) |
| Intermediate | 2–4 | ~70 % | 7.1 y (95 % CI 6.2–8.1) |
| High | ≥ 5 | ~29 % | 2.3 y (95 % CI 1.9–2.7) |

### 3.2 MIPSS70+ v2.0 — point assignments

| Variable | Points |
|---|---|
| Very-high-risk (VHR) karyotype | 4 |
| Unfavorable karyotype | 3 |
| Favorable karyotype | 0 |
| ≥ 2 HMR mutations | 3 |
| Single HMR mutation (no second HMR) | 2 |
| Absence of CALR type 1/like | 2 |
| Constitutional symptoms | 2 |
| Severe anemia (Hb < 8 women / < 9 men g/dL) | 2 |
| Moderate anemia (Hb 8–9.9 women / 9–10.9 men g/dL) | 1 |
| Circulating blasts ≥ 2 % | 1 |

**Notes on combining:**

- Karyotype: pick exactly one of VHR (4) / unfavorable (3) / favorable (0).
- HMR: pick exactly one of ≥2-HMR (3) / single HMR (2) / no HMR (0). The single- and double-HMR points are **not additive** (this differs from MIPSS70).
- Anemia: pick exactly one of severe (2) / moderate (1) / Hb above threshold (0).

**Total range:** 0–17.

**Risk categories (5):**

| Category | Score | Median OS | 10-year OS |
|---|---|---|---|
| Very low | 0 | Not reached | 92 % |
| Low | 1–2 | 16.4 y | 56 % |
| Intermediate | 3–4 | 7.7 y | 37 % |
| High | 5–8 | 4.1 y | 13 % |
| Very high | ≥ 9 | 1.8 y | < 5 % |

---

## 4. Output

### 4.1 Returned fields (recommended API shape)

For each version the calculator should return:

- `version`: `"MIPSS70"` or `"MIPSS70+v2.0"`
- `total_score`: integer
- `risk_category`: enum (see §3)
- `median_os_years`: number or `"not_reached"`
- `survival_at_5y` (MIPSS70) / `survival_at_10y` (MIPSS70+ v2.0): number (proportion)
- `transplant_recommendation`: derived (see §4.2)
- `component_points`: map of variable → points contributed (for transparency)

### 4.2 Transplant-decision implications

| Version | Risk category | Suggested allo-HCT posture |
|---|---|---|
| MIPSS70 | Low | Defer; observe / medical therapy. |
| MIPSS70 | Intermediate | Consider; weigh donor, age, comorbidity, symptoms. |
| MIPSS70 | High | Recommend allo-HCT in eligible patients. |
| MIPSS70+ v2.0 | Very low | Defer. |
| MIPSS70+ v2.0 | Low | Defer; reassess at progression. |
| MIPSS70+ v2.0 | Intermediate | Individualized — typical threshold to start donor search. |
| MIPSS70+ v2.0 | High | Recommend allo-HCT. |
| MIPSS70+ v2.0 | Very high | Strongly recommend allo-HCT if eligible; expected OS <2 y otherwise. |

These map the published guidance: median OS < ~5 years is the conventional tipping point at which transplant-related mortality is outweighed by disease mortality.

---

## 5. References

1. **Guglielmelli P, Lasho TL, Rotunno G, et al.** MIPSS70: Mutation-Enhanced International Prognostic Score System for Transplantation-Age Patients With Primary Myelofibrosis. *J Clin Oncol* 2018; 36(4): 310–318. <https://ascopubs.org/doi/10.1200/JCO.2017.76.4886> · PubMed: <https://pubmed.ncbi.nlm.nih.gov/29226763/>

2. **Tefferi A, Guglielmelli P, Lasho TL, et al.** MIPSS70+ Version 2.0: Mutation and Karyotype-Enhanced International Prognostic Scoring System for Primary Myelofibrosis. *J Clin Oncol* 2018; 36(17): 1769–1770. <https://ascopubs.org/doi/10.1200/JCO.2018.78.9867> · PubMed: <https://pubmed.ncbi.nlm.nih.gov/29708808/>

3. **MDCalc — Mutation-Enhanced International Prognostic Score System (MIPSS70/MIPSS70+).** <https://www.mdcalc.com/calc/10581/mutation-enhanced-international-prognostic-score-system-mipss70-mipss70+>

4. **Official MIPSS70 / MIPSS70+ v2.0 score web calculator (Mayo Clinic / University of Florence).** <https://www.mipss70score.it/>

5. **Tefferi A, et al.** MIPSS70+ v2.0 predicts long-term survival in myelofibrosis after allogeneic HCT with the Flu/Mel conditioning regimen. *Blood Adv* 2019; 3(1): 83–95. <https://ashpublications.org/bloodadvances/article/3/1/83/11159/>

6. **Tefferi A, Barbui T.** Polycythemia vera and essential thrombocythemia: 2024 update on diagnosis, risk-stratification and management. *Am J Hematol* (review of risk models in MF). <https://onlinelibrary.wiley.com/doi/full/10.1002/ajh.27270>

---

## Appendix A — Worked examples

### Example 1: MIPSS70

A 58-year-old man with PMF; Hb 9.5 g/dL, WBC 30 × 10⁹/L, platelets 180 × 10⁹/L, blasts 3 %, BM fibrosis grade 3, no constitutional symptoms, JAK2-mutated (no CALR), ASXL1-mutated, no other HMR.

- Hb < 10: **1**
- WBC > 25: **2**
- Platelets < 100: 0
- Blasts ≥ 2 %: **1**
- BM fibrosis ≥ 2: **1**
- Constitutional symptoms: 0
- Absence of CALR type 1/like (JAK2): **1**
- HMR present (ASXL1): **1**
- ≥ 2 HMR: 0

**Total: 7 → High risk → median OS ~2.3 y → recommend allo-HCT.**

### Example 2: MIPSS70+ v2.0

A 62-year-old woman; Hb 7.8 g/dL, blasts 1 %, mild constitutional symptoms, CALR type 1, ASXL1 + SRSF2 mutated, karyotype with sole 20q− deletion.

- Karyotype favorable (sole 20q−): 0
- ≥ 2 HMR (ASXL1 + SRSF2): **3**
- Absence of CALR type 1/like: 0 (she has CALR type 1)
- Constitutional symptoms: **2**
- Severe anemia (Hb < 8 in a woman): **2**
- Blasts ≥ 2 %: 0

**Total: 7 → High risk → median OS 4.1 y → recommend allo-HCT.**
