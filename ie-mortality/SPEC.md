# Infective Endocarditis (IE) 6-Month Mortality Risk Score

Implementation specification for the Park / ICE-PCS validated risk score for
predicting 6-month all-cause mortality in patients with definite infective
endocarditis (IE).

> Note on provenance. The MDCalc page lists "Park LP. *Eur Heart J* 2016;
> 37:3194-3203" as the primary publication, but the validated paper is
> actually published in *Journal of the American Heart Association*
> 2016;5(4):e003016 (DOI 10.1161/JAHA.115.003016, PMID 27091179). The
> reference 37:3194-3203 in the *European Heart Journal* belongs to a
> different IE article from the same year (Cabell / ICE-PCS group). This
> spec implements the published JAHA 2016 model that MDCalc calculates, and
> cites both sources.

---

## 1. Purpose

Predicts **6-month all-cause mortality** in adults with **definite infective
endocarditis** (modified Duke criteria), using clinical variables that are
typically known **at or shortly after admission**.

- Population: adults (age >= 18) with definite IE (native valve, prosthetic
  valve, or cardiac device-related).
- Endpoint: probability of death from any cause within 6 months of IE
  diagnosis.
- Use case: bedside risk stratification, triage of multidisciplinary
  endocarditis-team review, shared decision-making about surgery vs medical
  management. Not intended to be the sole determinant of clinical care.

The model was derived from the **ICE-PCS** prospective registry
(2000-2006, n = 4049) and externally validated in the **ICE-PLUS** cohort
(2008-2012, n = 1197). Reported discrimination: c-statistic 0.715
(derivation) and 0.682 (validation).

---

## 2. Inputs and Scoring

The score is the **sum of the integer points** assigned to each variable.
Each variable defaults to 0 if "No" / "Absent" / "Unknown".

### 2.1 Host factors

| Variable | Category | Points |
|---|---|---|
| Age (years) | <= 45 | 0 |
|  | 46-60 | +2 |
|  | 61-70 | +3 |
|  | > 70  | +4 |
| History of dialysis | No | 0 |
|  | Yes | +3 |

### 2.2 IE factors

| Variable | Value | Points |
|---|---|---|
| Infection acquisition (nosocomial IE) | No (community-acquired) | 0 |
|  | Yes (nosocomial / healthcare-associated) | +2 |
| Infection type / valve | Native valve endocarditis (NVE) | 0 |
|  | Prosthetic valve endocarditis (PVE) **or** cardiac device-related IE | +1 |
| Symptoms > 1 month before admission | No (subacute presentation absent) | 0 |
|  | Yes | -1 |
| Pathogen: *Staphylococcus aureus* | No | 0 |
|  | Yes | +1 |
| Pathogen: viridans group streptococci (VGS) | No | 0 |
|  | Yes | -2 |
| Aortic valve vegetation | No | 0 |
|  | Yes | +1 |
| Mitral valve vegetation | No | 0 |
|  | Yes | +1 |

Notes on pathogen handling:

- *S. aureus* and VGS are scored independently (mutually exclusive in
  practice). All other pathogens (CoNS, enterococci, HACEK, fungi,
  culture-negative, etc.) score **0** for both pathogen items, i.e. they
  contribute the implicit "other" baseline.
- Fungal IE is **not** an explicit term in the published model (despite
  its known high mortality). It scores 0 for both pathogen items in this
  score; consider clinical judgement.
- Aortic and mitral vegetations are scored independently and **stack** when
  both are present (+1 + +1 = +2).

### 2.3 IE complications

| Variable | Value | Points |
|---|---|---|
| Heart failure (NYHA class III or IV) | No | 0 |
|  | Yes | +3 |
| Stroke (any clinically apparent stroke) | No | 0 |
|  | Yes | +2 |
| Paravalvular complication (abscess, fistula, dehiscence) | No | 0 |
|  | Yes | +2 |
| Persistent bacteremia | No | 0 |
|  | Yes | +2 |
| Surgical treatment of IE undertaken (during the index admission) | No | 0 |
|  | Yes | -2 |

### 2.4 Score range

The integer score ranges from approximately **-3 to +22** depending on which
variables are present. Park et al. report observed values 0-22 in the
derivation cohort and stratify into quintiles (see section 4).

---

## 3. Calculation

### 3.1 Total points

```
score = age_points
      + dialysis_points
      + nosocomial_points
      + prosthetic_or_device_points
      + symptoms_gt_1_month_points        # negative
      + s_aureus_points
      + vgs_points                        # negative
      + aortic_vegetation_points
      + mitral_vegetation_points
      + nyha_3_4_hf_points
      + stroke_points
      + paravalvular_points
      + persistent_bacteremia_points
      + surgery_points                    # negative
```

### 3.2 Probability of 6-month mortality

The published mapping from integer score to probability is a logistic model
with linear and quadratic terms in score (Park et al., JAHA 2016, Table 5):

```
linear_predictor = -4.849 + 2.416 * score + 0.109 * (score ** 2)
probability_6mo_mortality = exp(linear_predictor) / (1 + exp(linear_predictor))
```

Equivalently, using `logit^-1(x) = 1 / (1 + exp(-x))`:

```
p = 1 / (1 + exp(-(-4.849 + 2.416 * score + 0.109 * score^2)))
```

> The original paper prints the equation as
> "Probability of 6-month mortality = 2.416 x score + 0.109 x score^2 - 4.849".
> That right-hand side is the **logit (linear predictor)**, not the
> probability itself — applying the logistic (inverse-logit) transform is
> required to obtain a value bounded in [0, 1]. Implementations should
> always wrap the expression in the logistic function as shown above.

Implementation guidance:

- Compute in float64.
- Clamp `probability` to `[0.0, 1.0]` defensively.
- Return both the raw integer `score` and the `probability` (and a
  `risk_band` label per section 4) so downstream UIs can render either.

### 3.3 Reference Python implementation

```python
import math
from dataclasses import dataclass
from typing import Literal

AgeBand = Literal["<=45", "46-60", "61-70", ">70"]
ValveType = Literal["NVE", "PVE", "device"]
Pathogen = Literal["s_aureus", "vgs", "fungal", "other"]


@dataclass(frozen=True)
class IEMortalityInputs:
    age_band: AgeBand
    history_of_dialysis: bool
    nosocomial: bool
    valve_type: ValveType
    symptoms_gt_1_month: bool
    pathogen: Pathogen
    aortic_vegetation: bool
    mitral_vegetation: bool
    nyha_3_or_4_heart_failure: bool
    stroke: bool
    paravalvular_complication: bool
    persistent_bacteremia: bool
    surgical_treatment: bool


_AGE_POINTS: dict[AgeBand, int] = {"<=45": 0, "46-60": 2, "61-70": 3, ">70": 4}


def ie_mortality_score(inputs: IEMortalityInputs) -> int:
    score = 0
    score += _AGE_POINTS[inputs.age_band]
    score += 3 if inputs.history_of_dialysis else 0
    score += 2 if inputs.nosocomial else 0
    score += 1 if inputs.valve_type in ("PVE", "device") else 0
    score += -1 if inputs.symptoms_gt_1_month else 0
    score += 1 if inputs.pathogen == "s_aureus" else 0
    score += -2 if inputs.pathogen == "vgs" else 0
    # 'fungal' and 'other' contribute 0 to both pathogen items
    score += 1 if inputs.aortic_vegetation else 0
    score += 1 if inputs.mitral_vegetation else 0
    score += 3 if inputs.nyha_3_or_4_heart_failure else 0
    score += 2 if inputs.stroke else 0
    score += 2 if inputs.paravalvular_complication else 0
    score += 2 if inputs.persistent_bacteremia else 0
    score += -2 if inputs.surgical_treatment else 0
    return score


def ie_mortality_probability(score: int) -> float:
    """6-month all-cause mortality probability per Park et al. JAHA 2016."""
    logit = -4.849 + 2.416 * score + 0.109 * (score ** 2)
    p = 1.0 / (1.0 + math.exp(-logit))
    return max(0.0, min(1.0, p))
```

---

## 4. Output

### 4.1 Continuous output

- `score`: integer (typically -3 to +22).
- `probability_6mo_mortality`: float in `[0, 1]` (multiply by 100 for %).

### 4.2 Quintile risk bands (observed 6-month mortality, ICE-PCS)

| Quintile | Score range | Observed 6-month mortality |
|---|---|---|
| 1 (lowest risk) | 0-6 | 10.3% |
| 2 | 7-8 | 17.0% |
| 3 | 9-10 | 25.5% |
| 4 | 11-16 | 37.8% |
| 5 (highest risk) | 17-22 | 52.9% |

Use the **continuous logistic prediction** (section 3.2) for the
calculator's reported probability; the quintile table is provided as
contextual interpretation.

### 4.3 Suggested UI output payload

```json
{
  "score": 9,
  "probability_6mo_mortality": 0.214,
  "risk_band": "Quintile 3 (score 9-10): observed 25.5% 6-month mortality",
  "advice": "Consider multidisciplinary endocarditis-team consultation including cardiothoracic surgery and infectious disease."
}
```

---

## 5. References

1. **Park LP, Chu VH, Peterson G, et al.** Validated Risk Score for
   Predicting 6-Month Mortality in Infective Endocarditis. *J Am Heart
   Assoc.* 2016;5(4):e003016. doi:10.1161/JAHA.115.003016. PMID 27091179.
   - Full text (open access):
     https://www.ahajournals.org/doi/10.1161/JAHA.115.003016
   - PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC4859286/
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/27091179/
2. MDCalc. Infective Endocarditis (IE) Mortality Risk Score.
   https://www.mdcalc.com/calc/3121/infective-endocarditis-ie-mortality-risk-score
3. ICE-PCS / ICE-PLUS investigators (background cohorts). Cabell CH, Wang
   A, et al. International Collaboration on Endocarditis - Prospective
   Cohort Study (ICE-PCS). For cohort design see Murdoch DR, Corey GR,
   Hoen B, et al. Clinical presentation, etiology, and outcome of
   infective endocarditis in the 21st century: the International
   Collaboration on Endocarditis-Prospective Cohort Study. *Arch Intern
   Med.* 2009;169(5):463-473.

### Caveats

- The model predicts **all-cause** 6-month mortality in patients with
  **definite** IE; it is not validated in possible IE or in pediatric
  populations.
- Discrimination in external validation was modest (c = 0.682); use
  alongside, not in place of, clinical judgement and endocarditis-team
  review.
- "Surgery undertaken = Yes" reduces predicted mortality by 2 points.
  This reflects the *observed* survival benefit in those selected for
  surgery in ICE-PCS; it is **not** a counterfactual treatment effect and
  must not be interpreted as "score will drop by 2 if we operate" for an
  individual patient.
- Fungal pathogens are not represented as a distinct term in the score
  despite their known prognostic weight; treat such cases with extra
  caution.
