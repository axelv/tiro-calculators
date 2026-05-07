# Sokal Index for Chronic Myelogenous Leukemia (CML)

A continuous prognostic risk score for newly diagnosed, chronic-phase
Philadelphia chromosome-positive chronic myelogenous (granulocytic) leukemia.
Originally derived by Sokal et al. (*Blood*, 1984) from a multinational cohort
of 813 patients using a Cox proportional hazards model with four pre-treatment
covariates: age, palpable spleen size, platelet count, and peripheral blood
blast percentage.

---

## 1. Purpose

The Sokal Index is used by clinicians to:

- **Risk-stratify** patients with newly diagnosed chronic-phase CML at the
  moment of diagnosis, before initiation of disease-modifying therapy.
- **Inform prognosis** by assigning patients to one of three risk groups
  (low / intermediate / high) with distinct expected survival.
- **Inform first-line therapy choice**: low- and intermediate-risk patients
  are often started on standard-dose imatinib, whereas high-risk patients are
  more frequently considered for second-generation tyrosine kinase inhibitors
  (TKIs) or trial enrollment.

**Patient population** — adults with newly diagnosed, untreated, chronic-phase
Ph+ CML (originally termed "chronic granulocytic leukemia"). The score is
**not** validated for accelerated-phase, blast-phase, or previously treated
disease, and was derived in a pre-TKI cohort.

**Caveats**

- The original cohort received pre-TKI therapy (busulfan, hydroxyurea,
  splenectomy, allogeneic transplant in a minority). Absolute survival
  estimates from the original publication therefore underestimate survival
  achievable with modern TKI therapy. The score nonetheless retains
  discriminatory value for relapse and progression endpoints in the TKI era,
  although newer scores (Hasford/Euro, EUTOS, ELTS) are also in routine use.
- Spleen size must be measured as the **maximum distance below the left costal
  margin in centimetres** at clinical examination. Imaging-based or normalised
  spleen volumes are not interchangeable.
- The score is sensitive to platelet count near the upper end of the range
  because the platelet term is squared.

---

## 2. Inputs

All four inputs must be obtained at the time of diagnosis, **before** any
cytoreductive or disease-modifying therapy.

| Field key | Display name | Type | Unit | Clinical definition |
|---|---|---|---|---|
| `age` | Age | number | years | Patient's age at diagnosis. |
| `spleen_cm` | Spleen size below costal margin | number | cm | Maximum palpable distance of the spleen tip below the **left costal margin** on physical examination. Use `0` if the spleen is not palpable. |
| `platelets` | Platelet count | number | ×10⁹/L | Pre-treatment peripheral blood platelet count (equivalent to ×10³/µL or ×10³/mm³ — numerically identical). |
| `blasts_pct` | Peripheral blood blasts | number | % | Percentage of myeloblasts in the **peripheral blood** differential at diagnosis (not the bone marrow blast percentage). |

Implementation notes:

- All four inputs are required; do not impute missing values silently.
- Validate ranges before computing: `age ≥ 0`, `spleen_cm ≥ 0`,
  `platelets > 0`, `0 ≤ blasts_pct ≤ 100`. Patients with ≥ 30 % peripheral
  blasts are by definition not in chronic phase and the score does not apply.
- Platelet count must be in **×10⁹/L**. If the source system reports platelets
  in another unit, convert before applying the formula.

---

## 3. Calculation

The Sokal score is the exponential of a linear combination of the four
pre-treatment covariates, centred at the cohort means used in the original
1984 derivation.

**Exact formula** (Sokal et al., *Blood* 1984;63:789–799):

```
Sokal = exp( 0.0116 × (age − 43.4)
           + 0.0345 × (spleen_cm − 7.51)
           + 0.188  × ((platelets / 700)² − 0.563)
           + 0.0887 × (blasts_pct − 2.10) )
```

Equivalent term-by-term breakdown:

| Term | Coefficient | Centring constant | Notes |
|---|:-:|:-:|---|
| Age (years) | 0.0116 | 43.4 | Linear in age. |
| Spleen size (cm below costal margin) | 0.0345 | 7.51 | Linear in palpable spleen length. Use 0 if not palpable. |
| Platelet count (×10⁹/L) | 0.188 | 0.563 | Applied to the **squared, scaled** value `(platelets / 700)²`; the constant 0.563 is subtracted **after** squaring. |
| Peripheral blasts (%) | 0.0887 | 2.10 | Linear in peripheral blood blast percentage. |

The result is a unitless **relative hazard ratio** versus the cohort baseline.
By construction, the score equals **1.0** for a patient at all four cohort
means (age 43.4 y, spleen 7.51 cm, platelets ≈ 587 ×10⁹/L giving the centring
of 0.563, blasts 2.10 %).

```python
import math

def sokal(age: float, spleen_cm: float, platelets: float, blasts_pct: float) -> float:
    return math.exp(
        0.0116 * (age - 43.4)
        + 0.0345 * (spleen_cm - 7.51)
        + 0.188  * ((platelets / 700.0) ** 2 - 0.563)
        + 0.0887 * (blasts_pct - 2.10)
    )
```

---

## 4. Output

### 4.1 Sokal score

A positive real number (relative hazard ratio). Report to **two decimal
places** in clinical contexts.

### 4.2 Risk groups and survival

Risk thresholds and survival figures from Sokal JE et al., *Blood*
1984;63:789–799 (pre-TKI cohort, n = 813). Five-year survival figures are
those most commonly cited from the derivation cohort; modern TKI-era survival
in all groups is substantially higher.

| Sokal score | Risk group | 2-year survival¹ | Median survival¹ | Approx. 5-year survival² |
|:-:|:-:|:-:|:-:|:-:|
| **< 0.8** | Low | ~ 90 % | ~ 5 years | ~ 76 % |
| **0.8 – 1.2** | Intermediate | ~ 65 – 90 % | ~ 2.5 – 5 years | ~ 55 % |
| **> 1.2** | High | ~ 65 % | ~ 2.5 years | ~ 25 % |

¹ Reported by Sokal 1984: low-risk subsequent death rate < 20 % / year;
high-risk death rate ≈ 35 % / year.
² Approximate 5-year survival is widely quoted in clinical references and
secondary literature derived from the 1984 cohort; exact 5-year point
estimates are not reported in the primary publication abstract. Use these
figures for **historical / comparative** reporting only — not as expected
outcomes for contemporary TKI-treated patients.

### 4.3 Suggested first-line management (informational)

The original Sokal paper does not prescribe a treatment algorithm. The
recommendations below summarise commonly cited contemporary practice; defer
to current local guidelines (e.g. ESMO, NCCN, ELN 2020).

| Risk group | Suggested first-line strategy |
|---|---|
| Low | Standard-dose imatinib is generally appropriate. |
| Intermediate | Standard-dose imatinib **or** a second-generation TKI; consider patient-specific factors. |
| High | Consider a **second-generation TKI** (e.g. dasatinib, nilotinib, bosutinib) up front; evaluate trial enrolment and transplant eligibility. |

### 4.4 Output schema (implementation reference)

```json
{
  "score": 0.62,
  "risk_group": "low",
  "thresholds": { "low_max_exclusive": 0.8, "high_min_exclusive": 1.2 },
  "expected_survival": {
    "two_year_percent": 90,
    "median_years": 5,
    "five_year_percent_pre_tki": 76
  },
  "era_note": "Survival figures derived from the pre-TKI 1984 cohort; modern TKI-era survival is substantially higher across all risk groups."
}
```

---

## 5. References

1. **Sokal JE, Cox EB, Baccarani M, Tura S, Gomez GA, Robertson JE, Tso CY,
   Braun TJ, Clarkson BD, Cervantes F, Rozman C.** Prognostic discrimination
   in "good-risk" chronic granulocytic leukemia. *Blood.* 1984;63(4):789–799.
   PMID: 6584184.
   https://pubmed.ncbi.nlm.nih.gov/6584184/

2. **MDCalc — Sokal Index for Chronic Myelogenous Leukemia (CML).**
   https://www.mdcalc.com/calc/2143/sokal-index-chronic-myelogenous-leukemia-cml

3. **European LeukemiaNet — Calculation of Relative Risk of CML Patients
   (Euro and Sokal Score).**
   https://www.leukemia-net.org/leukemias/cml/euro__and_sokal_score/

4. **Hasford J, Pfirrmann M, Hehlmann R, et al.** A new prognostic score for
   survival of patients with chronic myeloid leukemia treated with interferon
   alfa. *J Natl Cancer Inst.* 1998;90(11):850–858.
   doi:10.1093/jnci/90.11.850.
   *(Hasford/Euro score — refinement of Sokal for the interferon era.)*

5. **Hasford J, Baccarani M, Hoffmann V, et al.** Predicting complete cytogenetic
   response and subsequent progression-free survival in 2060 patients with CML
   on imatinib treatment: the EUTOS score. *Blood.* 2011;118(3):686–692.
   doi:10.1182/blood-2010-12-319038.
   *(EUTOS score — TKI-era alternative.)*

6. **Pfirrmann M, Baccarani M, Saussele S, et al.** Prognosis of long-term
   survival considering disease-specific death in patients with chronic myeloid
   leukemia. *Leukemia.* 2016;30(1):48–56. doi:10.1038/leu.2015.261.
   *(ELTS score — long-term-survival-focused TKI-era alternative.)*
