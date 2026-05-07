# ADHERE Algorithm — Specification

**Acute Decompensated Heart Failure National Registry (ADHERE) Risk Stratification Tree**

A bedside risk-stratification rule derived by Classification and Regression Tree (CART) analysis of the ADHERE registry. It uses three admission laboratory/vital-sign values to assign one of five in-hospital mortality risk groups.

---

## 1. Purpose

Predicts **in-hospital mortality** in patients hospitalized with **acute decompensated heart failure (ADHF)** using a CART-derived decision tree. Designed as a simple, user-friendly bedside tool to identify low-risk patients who may be managed conservatively and high-risk patients who warrant intensive monitoring and therapy.

- **Population:** Adult patients admitted with a primary discharge diagnosis of ADHF.
- **Endpoint:** In-hospital all-cause mortality.
- **Discrimination (derivation):** Odds ratio for mortality between the highest- and lowest-risk groups ~ **12.9**.
- **Mortality range across the 5 strata:** **2.1 % to 21.9 %** (derivation cohort).

---

## 2. Inputs

All three variables are measured at **hospital admission**.

| Variable | Symbol | Unit | Threshold used in tree |
|---|---|---|---|
| Blood Urea Nitrogen | `BUN` | mg/dL | **≥ 43** mg/dL  (≈ 15.35 mmol/L urea) |
| Systolic Blood Pressure | `SBP` | mmHg | **< 115** mmHg |
| Serum Creatinine | `Cr` | mg/dL | **≥ 2.75** mg/dL  (≈ 243 µmol/L) |

### Unit-conversion notes (implementation)

- BUN (mg/dL) = urea (mmol/L) × 2.801
- Cr (mg/dL)  = creatinine (µmol/L) / 88.4

If the source system reports urea (mmol/L) rather than BUN (mg/dL), convert before applying the threshold.

### Input validation

- All three inputs are **required**.
- Values must be **positive numbers**. Reject `null`, `NaN`, ≤ 0.
- Plausibility (warn, do not block):
  - BUN: 1–300 mg/dL
  - SBP: 40–260 mmHg
  - Cr:  0.1–20 mg/dL

---

## 3. Calculation — Decision Tree

The tree branches first on **BUN**, then on **SBP**, and (only in the high-BUN / low-SBP branch) on **creatinine**.

```
                          ┌────────────────────────┐
                          │  Admission BUN ≥ 43 ?  │
                          └────────────┬───────────┘
                          NO           │            YES
                ┌─────────┘            │            └─────────┐
                ▼                                             ▼
        ┌──────────────┐                              ┌──────────────┐
        │  SBP < 115 ? │                              │  SBP < 115 ? │
        └──────┬───────┘                              └──────┬───────┘
        NO     │     YES                              NO     │     YES
        │      │      │                               │      │      │
        ▼      ▼      ▼                               ▼      ▼      ▼
   ┌────────┐    ┌────────────────┐          ┌────────────────┐   ┌──────────────┐
   │  LOW   │    │  INTERMEDIATE  │          │  INTERMEDIATE  │   │ Cr ≥ 2.75 ?  │
   │ RISK   │    │     RISK 3     │          │     RISK 2     │   └──────┬───────┘
   │ 2.1 %  │    │     7.0 %      │          │     9.4 %      │   NO     │     YES
   └────────┘    └────────────────┘          └────────────────┘   │      │      │
                                                                   ▼             ▼
                                                          ┌────────────────┐ ┌────────┐
                                                          │  INTERMEDIATE  │ │  HIGH  │
                                                          │     RISK 1     │ │ RISK   │
                                                          │     15.3 %     │ │ 21.9 % │
                                                          └────────────────┘ └────────┘
```

### Branching rules (implementation pseudocode)

```text
if BUN < 43:
    if SBP >= 115:
        return "Low"                  # ≈ "very low" in 5-band nomenclature
    else:
        return "Intermediate Risk 3"  # ≈ "low"
else:  # BUN >= 43
    if SBP >= 115:
        return "Intermediate Risk 2"  # ≈ "intermediate"
    else:
        if Cr < 2.75:
            return "Intermediate Risk 1"  # ≈ "high"
        else:
            return "High"                 # ≈ "very high"
```

The threshold convention is **inclusive** for BUN and Cr (`≥`) and **exclusive** for the cut-down on SBP (`<`). Equivalently: `SBP ≥ 115` is the "favourable" branch, `BUN ≥ 43` and `Cr ≥ 2.75` are the "adverse" branches.

---

## 4. Output

The algorithm returns **one of five mutually exclusive risk bands** with the associated in-hospital mortality estimate (derivation cohort; validation cohort values shown for reference).

| 5-band label | ADHERE / JAMA name | Defining path | In-hospital mortality (derivation) | In-hospital mortality (validation) |
|---|---|---|---|---|
| **Very low** | Low Risk            | BUN < 43, SBP ≥ 115                                         | **2.1 %** | 2.0 % |
| **Low**      | Intermediate Risk 3 | BUN < 43, SBP < 115                                         | **7.0 %** | 5.7 % |
| **Intermediate** | Intermediate Risk 2 | BUN ≥ 43, SBP ≥ 115                                     | **9.4 %** | 8.1 % |
| **High**     | Intermediate Risk 1 | BUN ≥ 43, SBP < 115, Cr < 2.75                              | **15.3 %** | 13.2 % |
| **Very high** | High Risk          | BUN ≥ 43, SBP < 115, Cr ≥ 2.75                              | **21.9 %** | 21.4 % |

### Recommended return shape (machine-readable)

```json
{
  "risk_band": "very_high",
  "adhere_label": "High Risk",
  "in_hospital_mortality_pct": 21.9,
  "in_hospital_mortality_pct_validation": 21.4,
  "path": {
    "BUN_ge_43": true,
    "SBP_lt_115": true,
    "Cr_ge_2.75": true
  }
}
```

`risk_band` ∈ `{"very_low", "low", "intermediate", "high", "very_high"}`.

### Interpretation

- **Very low (2.1 %)**: routine ward management is generally appropriate.
- **Low / Intermediate (7.0 – 9.4 %)**: standard inpatient care with usual monitoring.
- **High (15.3 %)**: consider closer monitoring; reassess therapy aggressiveness.
- **Very high (21.9 %)**: consider ICU/step-down level of care, advanced therapies, and goals-of-care discussion.

The tool is **prognostic**, not diagnostic, and does not replace clinical judgement.

---

## 5. References

### Primary publication

> **Fonarow GC, Adams KF Jr, Abraham WT, Yancy CW, Boscardin WJ; ADHERE Scientific Advisory Committee, Study Group, and Investigators.**
> Risk stratification for in-hospital mortality in acutely decompensated heart failure: classification and regression tree analysis.
> *JAMA*. 2005 Feb 2;**293**(5):572–580.
> doi:[10.1001/jama.293.5.572](https://doi.org/10.1001/jama.293.5.572) · PMID: 15687312

### URLs

- MDCalc — ADHERE Algorithm: https://www.mdcalc.com/calc/3829/acute-decompensated-heart-failure-national-registry-adhere-algorithm
- JAMA full text: https://jamanetwork.com/journals/jama/fullarticle/200287

### Supporting / related literature

- Adams KF Jr. Clinical predictors of in-hospital mortality in acutely decompensated heart failure — piecing together the outcome puzzle. *Congest Heart Fail*. 2008;14(3):117–119.
- Abraham WT, Fonarow GC, Albert NM, et al. Predictors of in-hospital mortality in patients hospitalized for heart failure: insights from the OPTIMIZE-HF registry. *J Am Coll Cardiol*. 2008;52(5):347–356.
