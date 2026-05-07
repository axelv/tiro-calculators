# EUTOS Long-Term Survival (ELTS) Score for CML

A prognostic score for newly-diagnosed chronic-phase chronic myeloid leukaemia
(CML) that predicts the probability of dying *of CML* (not all-cause mortality)
in patients treated with tyrosine-kinase inhibitors (TKIs). Derived and
validated by the European Treatment and Outcome Study (EUTOS) consortium and
published by Pfirrmann M et al., *Leukemia* 2016;30(1):48–56.

The score is **not** listed on MDCalc. The European LeukemiaNet provides the
reference calculator and formula at
<https://www.leukemia-net.org/content/leukemias/cml/elts_score/>.

---

## 1. Purpose

ELTS is used by haematologists to:

- **Risk-stratify** newly-diagnosed adults with chronic-phase Ph+/BCR::ABL1+
  CML for **CML-specific (disease-specific) long-term survival** in the TKI
  era.
- **Identify the ~12 % high-risk patients** who carry a meaningfully elevated
  probability of dying of CML and who may warrant a more potent first-line TKI
  (e.g. a 2nd-generation TKI rather than imatinib), closer molecular
  monitoring, and earlier consideration of treatment changes.
- **Replace the Sokal score** as the recommended baseline risk score in the
  ELN 2020 / 2024 CML management recommendations, because Sokal — derived in
  the chemotherapy era — overestimates risk and discriminates poorly under
  TKIs.

**Patient population** — adults (≥ 18 years) with newly-diagnosed CML in
chronic phase, scored at diagnosis **prior to initiation of any CML-directed
therapy** (including hydroxyurea where possible). Not validated for accelerated
phase, blast crisis, or paediatric CML.

**Caveats** — the ELTS score is intended for *baseline* prognostication only.
It does not incorporate response milestones (e.g. BCR::ABL1 transcript level at
3/6/12 months) and must not be used in place of on-treatment molecular
monitoring. Variables are continuous; do not dichotomise inputs before
computation.

---

## 2. Inputs

All inputs must be measured **at diagnosis, before any cytoreductive or TKI
therapy** (hydroxyurea pretreatment can shrink the spleen and lower platelet
counts and should be avoided as the basis for scoring whenever possible).

| Field key | Display name | Type | Unit | Clinical definition |
|---|---|---|---|---|
| `age` | Age | number | completed years | Patient's age at diagnosis, in completed years (validated for ≥ 18 y). |
| `spleen_cm` | Spleen size below costal margin | number | cm | Maximum palpable distance of the spleen tip below the left costal margin in centimetres, measured clinically. Enter **0** if the spleen is not palpable. Imaging-only splenomegaly does **not** substitute. |
| `blasts_pct` | Peripheral-blood blasts | number | % | Percentage of blasts in the peripheral blood differential (rounded to the nearest integer per the EUTOS convention). |
| `platelets` | Platelet count | number | × 10⁹ / L | Peripheral-blood platelet count at diagnosis. Equivalent to platelets per µL ÷ 1000 (e.g. 450 000/µL → 450 × 10⁹/L). |

Implementation notes:

- All four inputs are **required** and must be numeric and finite. Missing
  values should surface a validation error rather than be imputed.
- Enforce **`platelets > 0`** strictly: the formula contains
  `(platelets / 1000)^(-0.5)`, which diverges as the count approaches zero.
- Enforce **`spleen_cm ≥ 0`** and **`0 ≤ blasts_pct ≤ 100`**.
- Round `blasts_pct` to the nearest integer **before** computation (per the
  original EUTOS convention) but keep the other inputs at full precision.
- Age is validated for adults; warn (do not block) if `age < 18`.

---

## 3. Calculation

The ELTS score is a continuous linear combination of four transformed
covariates derived by Pfirrmann et al. from a Cox regression on disease-
specific death:

```
ELTS = 0.0025 × (age / 10)^3
     + 0.0615 × spleen_cm
     + 0.1052 × blasts_pct
     + 0.4104 × (platelets / 1000)^(-0.5)
```

| Term | Coefficient | Variable | Transformation |
|---|---:|---|---|
| Age | 0.0025 | `age` (years) | cube of age in decades, `(age/10)^3` |
| Spleen | 0.0615 | `spleen_cm` (cm below costal margin) | linear |
| Blasts | 0.1052 | `blasts_pct` (%, integer-rounded) | linear |
| Platelets | 0.4104 | `platelets` (× 10⁹/L) | inverse square root, `(platelets/1000)^(-0.5)` |

The output is a continuous, dimensionless score. Carry full floating-point
precision through the computation and only round the **displayed** value
(typically to 4 decimal places, matching the published cut-points).

Reference Python implementation:

```python
def elts_score(age: float, spleen_cm: float, blasts_pct: float, platelets: float) -> float:
    if platelets <= 0:
        raise ValueError("platelets must be > 0")
    if spleen_cm < 0:
        raise ValueError("spleen_cm must be >= 0")
    if not 0 <= blasts_pct <= 100:
        raise ValueError("blasts_pct must be in [0, 100]")
    blasts = round(blasts_pct)
    return (
        0.0025 * (age / 10) ** 3
        + 0.0615 * spleen_cm
        + 0.1052 * blasts
        + 0.4104 * (platelets / 1000) ** -0.5
    )
```

Worked example (a typical low-risk patient — 45 y, non-palpable spleen, 1 %
blasts, 350 × 10⁹/L platelets):

```
0.0025 × (45/10)^3   = 0.0025 × 91.125     = 0.22781
0.0615 × 0           = 0.00000
0.1052 × 1           = 0.10520
0.4104 × (350/1000)^(-0.5) = 0.4104 × 1.69031 = 0.69370
                                        ELTS = 1.02671  → Low risk
```

---

## 4. Output

### 4.1 Continuous score

A non-negative real number. The published cut-points are stated to four
decimal places and that precision should be preserved.

### 4.2 Risk groups

Cut-points from Pfirrmann 2016 (Table 3) and reproduced on the European
LeukemiaNet ELTS reference page:

| Risk group | ELTS range | Approx. share of newly-diagnosed pts (Pfirrmann 2016 derivation cohort) |
|---|---|---|
| **Low** | ≤ 1.5680 | ~ 60 % |
| **Intermediate** | > 1.5680 and ≤ 2.2185 | ~ 27 % |
| **High** | > 2.2185 | ~ 12 % |

Boundary handling: the low/intermediate boundary is **inclusive** at 1.5680
(low) and the intermediate/high boundary is **inclusive** at 2.2185
(intermediate). Implement with `score <= 1.5680`, `score <= 2.2185`, else high.

### 4.3 Long-term CML-specific outcome

In the Pfirrmann 2016 derivation cohort (n = 2205 imatinib-treated patients
from the EUTOS in-study registry, median follow-up 5.9 years), the
**cumulative incidence of CML-specific death at 10 years** differed
significantly between the three groups:

| Risk group | 10-yr cumulative incidence of CML-specific death | 10-yr CML-specific survival (1 − CI) |
|---|:-:|:-:|
| Low | ≈ 2 % | ≈ 98 % |
| Intermediate | ≈ 5 % | ≈ 95 % |
| High | ≈ 12 % | ≈ 88 % |

Numbers are read from the cumulative-incidence curves in Figure 2 of
Pfirrmann 2016 and are quoted as approximate; consult the published figure
for exact estimates and confidence intervals. Subsequent real-world
validation cohorts have reported broadly consistent stratification, with
larger absolute event rates in the high-risk group when follow-up extends
beyond 10 years (e.g. 10-yr CI of CML death ~ 3 % / 9 % / 43 % in some Asian
imatinib-treated cohorts).

### 4.4 Output schema (implementation reference)

```json
{
  "score": 1.0267,
  "risk_group": "low",
  "risk_group_cutoffs": {
    "low_max": 1.5680,
    "intermediate_max": 2.2185
  },
  "ten_year_cml_specific_death_pct": 2,
  "ten_year_cml_specific_survival_pct": 98,
  "interpretation": "Low risk of CML-specific death at 10 years. Standard first-line TKI (imatinib or 2G-TKI) per ELN guidance."
}
```

### 4.5 Clinical interpretation

The original publication does not prescribe a treatment algorithm. The
following summarises ELN 2020 / 2024 use of ELTS as a baseline risk score:

| Risk group | Practical implication |
|---|---|
| Low | Standard first-line TKI (imatinib or any approved 2G-TKI) per local guidance; routine 3-monthly molecular monitoring. |
| Intermediate | First-line TKI as above; lower threshold to switch on inadequate response at the ELN molecular milestones. |
| High | Strongly consider a **2nd-generation TKI** (nilotinib, dasatinib, bosutinib) over imatinib first-line, given higher CML-related mortality risk; closer monitoring and earlier discussion of switch / allo-HCT eligibility on suboptimal response. |

Always integrate ELTS with on-treatment molecular response milestones
(BCR::ABL1 IS at 3, 6, 12 months) and with patient-level factors
(comorbidities, drug interactions, pregnancy plans, cardiovascular risk).

---

## 5. References

1. **Pfirrmann M, Baccarani M, Saussele S, Guilhot J, Cervantes F,
   Ossenkoppele G, Hoffmann VS, Castagnetti F, Hasford J, Hehlmann R,
   Simonsson B.**
   Prognosis of long-term survival considering disease-specific death in
   patients with chronic myeloid leukemia.
   *Leukemia.* 2016;30(1):48–56.
   doi:10.1038/leu.2015.261. PMID: 26416462.
   <https://www.nature.com/articles/leu2015261>

2. **European LeukemiaNet — The EUTOS long-term survival (ELTS) score.**
   Reference implementation, formula, and cut-points.
   <https://www.leukemia-net.org/content/leukemias/cml/elts_score/>

3. **Pfirrmann M, Clark RE, Prejzner W, Lauseker M, Baccarani M, Saussele S,
   Guilhot F, Heibl S, Hehlmann R, Faber E, et al.**
   The EUTOS long-term survival (ELTS) score is superior to the Sokal score
   for predicting survival in chronic myeloid leukemia.
   *Leukemia.* 2020;34(8):2138–2149. doi:10.1038/s41375-020-0931-9.
   <https://www.nature.com/articles/s41375-020-0931-9>
   *(Independent IRIS-cohort validation confirming superior discrimination
   over Sokal under TKI therapy.)*

4. **Hochhaus A, Baccarani M, Silver RT, et al.**
   European LeukemiaNet 2020 recommendations for treating chronic myeloid
   leukemia. *Leukemia.* 2020;34(4):966–984. doi:10.1038/s41375-020-0776-2.
   *(ELN guidance recommending ELTS as the baseline prognostic score in
   chronic-phase CML.)*
