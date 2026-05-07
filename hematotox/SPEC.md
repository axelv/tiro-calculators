# CAR-HEMATOTOX Score

Pre-CAR-T-infusion risk stratification model for prolonged hematologic toxicity (neutropenia, thrombocytopenia, anemia) and severe infections after CD19 CAR-T cell therapy in relapsed/refractory large B-cell lymphoma (LBCL).

> Authoritative publication: **Rejeski K, Perez A, Sesques P, et al.** *CAR-HEMATOTOX: a model for CAR T-cell-related hematologic toxicity in relapsed/refractory large B-cell lymphoma.* **Blood** 2021;138(24):2499-2513. doi:10.1182/blood.2020010543
> Not available on MDCalc at the time of writing.

---

## 1. Purpose

The CAR-HEMATOTOX (HT) score provides **pre-lymphodepletion** risk stratification for:

- **Prolonged / severe neutropenia** (ANC < 500/µL lasting ≥ 14 days)
- **Severe thrombocytopenia** and **anemia**
- **Severe infections** (any-grade and grade ≥ 3) post CAR-T infusion
- Secondarily: associations with worse progression-free and overall survival

It is intended to be calculated on the most recent labs available **before lymphodepleting chemotherapy** (typically days -7 to -5 prior to CAR-T infusion). It combines two physiologic axes:

1. **Hematopoietic reserve** — ANC, hemoglobin, platelet count
2. **Baseline systemic inflammation** — CRP, ferritin

Originally derived and validated in r/r LBCL treated with axicabtagene ciloleucel or tisagenlecleucel; subsequently validated in mantle cell lymphoma, multiple myeloma, follicular lymphoma, and ALL cohorts.

---

## 2. Inputs

All five values must be obtained **prior to lymphodepleting chemotherapy**.

| Input | Unit | Notes |
|---|---|---|
| **ANC** (absolute neutrophil count) | cells / µL | Equivalent: × 10⁹/L (1,200/µL = 1.2 × 10⁹/L) |
| **Platelet count** | × 10⁹/L | Equivalent: × 10³/µL |
| **Hemoglobin** | g/dL | |
| **CRP** (C-reactive protein) | mg/dL | NB: many EU labs report mg/L — divide by 10 to convert to mg/dL |
| **Ferritin** | ng/mL | Equivalent: µg/L |

---

## 3. Calculation

### 3.1 Per-item points (Rejeski 2021, Table 2)

| Variable | 0 points | 1 point | 2 points |
|---|---|---|---|
| **Platelet count** (× 10⁹/L) | > 175 | 75 – 175 | < 75 |
| **ANC** (cells/µL) | ≥ 1,200 | < 1,200 | — *(no 2-point tier)* |
| **Hemoglobin** (g/dL) | ≥ 9.0 | < 9.0 | — *(no 2-point tier)* |
| **CRP** (mg/dL) | < 3.0 | ≥ 3.0 | — *(no 2-point tier)* |
| **Ferritin** (ng/mL) | < 650 | 650 – 2,000 | > 2,000 |

> **Implementation note** — Only **platelet count** and **ferritin** carry a 2-point tier. ANC, hemoglobin, and CRP are binary (0 or 1 point). Total possible score = **0 – 7**. Boundary handling follows the published thresholds (use the published comparators above; e.g. ferritin exactly 650 → 1 point; platelet exactly 75 → 1 point).

### 3.2 Aggregation

```
HT_score = points(platelet) + points(ANC) + points(hemoglobin) + points(CRP) + points(ferritin)
```

### 3.3 Pseudocode

```python
def car_hematotox(
    anc_per_uL: float,           # cells/µL
    platelet_x10e9_per_L: float, # ×10⁹/L
    hemoglobin_g_dL: float,      # g/dL
    crp_mg_dL: float,            # mg/dL
    ferritin_ng_mL: float,       # ng/mL
) -> int:
    # Platelets — 2-point tier
    if platelet_x10e9_per_L < 75:
        plt = 2
    elif platelet_x10e9_per_L <= 175:
        plt = 1
    else:
        plt = 0

    # Ferritin — 2-point tier
    if ferritin_ng_mL > 2000:
        fer = 2
    elif ferritin_ng_mL >= 650:
        fer = 1
    else:
        fer = 0

    # Binary tiers
    anc = 1 if anc_per_uL < 1200 else 0
    hgb = 1 if hemoglobin_g_dL < 9.0 else 0
    crp = 1 if crp_mg_dL >= 3.0 else 0

    return plt + ferritin_pts := fer + anc + hgb + crp  # total 0–7
```

---

## 4. Output — risk stratification

### 4.1 Primary (Rejeski 2021) — two-tier classification

The original publication validates a **binary** cutoff:

| Total HT score | Category | Population |
|---|---|---|
| **0 – 1** | **HT-low** | Low risk of prolonged neutropenia / severe cytopenias / infection |
| **≥ 2**   | **HT-high** | High risk |

### 4.2 Optional finer stratification (subsequent validations)

Some downstream studies (e.g. multiple myeloma cohorts) report a 3-tier split. These are **not part of the original 2021 publication**; use only if your protocol specifies it:

| Total HT score | Category (3-tier, secondary) |
|---|---|
| 0 – 1 | Low |
| 2 – 4 | Intermediate |
| ≥ 5   | High / "ultra high" |

> **Note on the user-supplied "intermediate (2) / high (≥3)" 3-tier split:** this exact partition is **not specified in Rejeski 2021** — `TBD — see Rejeski 2021`. The original paper validated only the **0–1 vs ≥2** split. Implementations should default to the binary classification unless an institutional protocol mandates otherwise.

### 4.3 Predicted clinical outcomes (LBCL training + pooled validation cohorts)

| Outcome | HT-low (0–1) | HT-high (≥ 2) |
|---|---|---|
| Median duration of severe neutropenia (ANC < 500/µL) | ~ 5.5 days | ~ 12 days |
| Median total neutropenia duration | ~ 7 days | ~ 16.5 days |
| Severe thrombocytopenia (any during follow-up) | ~ 34 % | ~ 87 % |
| Anemia (any during follow-up) | ~ 40 % | ~ 96 % |
| Severe infection rate (grade ≥ 3) | Low (~ 8–13 %) | Markedly elevated (~ 30–40 %) |
| Non-relapse mortality | Lower | Higher |

Exact percentages vary by cohort (training vs validation, axi-cel vs tisa-cel); see Rejeski 2021 Tables 3–4 and Figure 3. Mark `TBD — see Rejeski 2021` for any specific outcome required by an institutional protocol that is not reproduced verbatim above.

### 4.4 Suggested clinical actions (illustrative — not in the original score)

| Tier | Suggested actions (institutional protocols vary) |
|---|---|
| HT-low | Standard monitoring; routine antimicrobial prophylaxis per institution |
| HT-high | Heightened infection surveillance, broader antimicrobial / antifungal prophylaxis, earlier G-CSF, consideration of stem cell boost / thrombopoietin receptor agonists for prolonged cytopenias, multidisciplinary review |

---

## 5. References

### Primary publication

1. **Rejeski K, Perez A, Sesques P, Hoster E, Berger C, Jentzsch L, Mougiakakos D, Frölich L, Ackermann J, Bücklein V, Blumenberg V, Schmidt C, Jallades L, Fehse B, Faul C, Karschnia P, Weigert O, Dreyling M, Locatelli F, Bachy E, Castilla-Llorente C, von Bergwelt-Baildon M, Mackensen A, Bethge W, Subklewe M.**
   *CAR-HEMATOTOX: a model for CAR T-cell-related hematologic toxicity in relapsed/refractory large B-cell lymphoma.*
   **Blood.** 2021;138(24):2499-2513. doi:[10.1182/blood.2020010543](https://doi.org/10.1182/blood.2020010543)
   - PubMed: <https://pubmed.ncbi.nlm.nih.gov/34166502/>
   - PMC full text: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8893508/>
   - Blood (publisher): <https://ashpublications.org/blood/article/138/24/2499/476241/CAR-HEMATOTOX-a-model-for-CAR-T-cell-related>

### Validation and extension studies

2. **Rejeski K, Perez A, Iacoboni G, et al.** *The CAR-HEMATOTOX risk-stratifies patients for severe infections and disease progression after CD19 CAR-T in R/R LBCL.* **J Immunother Cancer** 2022. PubMed: <https://pubmed.ncbi.nlm.nih.gov/35580927/>
3. **Rejeski K, Hansen DK, Bansal R, et al.** *The CAR-HEMATOTOX score as a prognostic model of toxicity and response in patients receiving BCMA-directed CAR-T for relapsed/refractory multiple myeloma.* **J Hematol Oncol** 2023. <https://jhoonline.biomedcentral.com/articles/10.1186/s13045-023-01465-x>
4. **Rejeski K, Wang Y, Albanyan O, et al.** *The CAR-HEMATOTOX score identifies patients at high risk for hematological toxicity, infectious complications, and poor treatment outcomes following brexucabtagene autoleucel for R/R MCL.* **J Hematol Oncol** 2023. PMC: <https://pmc.ncbi.nlm.nih.gov/articles/PMC10659121/>
5. **Rejeski K, Subklewe M, Locke FL.** *Immune effector cell-associated haematotoxicity after CAR T-cell therapy: from mechanism to management.* **Lancet Haematol** 2024. <https://www.thelancet.com/journals/lanhae/article/PIIS2352-3026(24)00077-2/fulltext>

### Educational summary

6. Lymphoma Hub. *The CAR-HEMATOTOX model for CAR T-cell hematotoxicity in r/r LBCL.* <https://lymphomahub.com/medical-information/the-car-hematotox-model-for-car-t-cell-hematotoxicity-in-rr-lbcl> — reproduces Table 2 of Rejeski 2021.

---

*Spec verified against Rejeski 2021 Blood Table 2 (per-item thresholds) and the binary HT-low / HT-high classification. Items where the request prompt and the publication disagreed are flagged inline (ANC, hemoglobin, intermediate-tier).*
