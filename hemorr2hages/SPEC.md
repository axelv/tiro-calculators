# HEMORR₂HAGES Score for Major Bleeding Risk

> Implementation specification for the HEMORR₂HAGES bleeding-risk score in elderly patients with atrial fibrillation (AF) on anticoagulation.
>
> **Authoritative sources**
> - MDCalc — [HEMORR₂HAGES Score for Major Bleeding Risk](https://www.mdcalc.com/calc/1785/hemorr2hages-score-major-bleeding-risk)
> - Primary publication — Gage BF, Yan Y, Milligan PE, et al. *Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF).* **Am Heart J 2006;151(3):713–719.** PMID: [16504638](https://pubmed.ncbi.nlm.nih.gov/16504638/)

---

## 1. Purpose

The HEMORR₂HAGES score quantifies the **risk of major hemorrhage** in **older patients with atrial fibrillation receiving oral anticoagulation** (originally validated for warfarin therapy). It was derived from the **National Registry of Atrial Fibrillation (NRAF)**, a Medicare-beneficiary cohort of 3,791 patients with AF, in which 162 hospitalisations for hemorrhage occurred.

Intended use:
- **Bleeding-risk stratification** prior to initiating or continuing oral anticoagulation in elderly AF patients.
- Counterpart to stroke-risk scores (CHADS₂ / CHA₂DS₂-VASc) — together they support shared decision-making about the net clinical benefit of anticoagulation.
- The score is **informative, not prohibitive**: a high HEMORR₂HAGES score should prompt mitigation of modifiable risk factors (uncontrolled hypertension, fall prevention, alcohol counselling, anaemia work-up) rather than automatic withholding of anticoagulation.

> **Clinical caveat (per MDCalc):** *Risks and benefits of anticoagulation should be carefully considered in ALL patients prior to initiating therapy.*

The mnemonic **HEMORR₂HAGES** encodes the eleven risk factors; the subscript **R₂** indicates the **R**ebleeding risk component, which is weighted **2 points** while every other component contributes **1 point**.

---

## 2. Inputs

All inputs are **boolean** (`true` = present, `false` = absent). Eleven components, each independently assessed.

| # | Mnemonic letter | Component | Type | Points | Clinical definition |
|---|---|---|---|---|---|
| 1 | **H** | Hepatic or renal disease | boolean | +1 | Significant hepatic disease (e.g., cirrhosis, elevated transaminases >2× ULN, bilirubin >1.5× ULN) **or** renal disease (e.g., chronic dialysis, renal transplant, serum creatinine ≥2.26 mg/dL / ≥200 µmol/L). |
| 2 | **E** | Ethanol abuse | boolean | +1 | Ongoing alcohol abuse or dependence (per clinical judgement; e.g., ≥8 drinks/week or documented alcohol use disorder). |
| 3 | **M** | Malignancy history | boolean | +1 | Active or prior malignancy (excluding non-melanoma skin cancer). |
| 4 | **O** | Older (age > 75 years) | boolean | +1 | Patient age **strictly greater than 75 years** at the time of assessment. |
| 5 | **R** | Reduced platelet count or function | boolean | +1 | Includes **aspirin or other antiplatelet use**, any **thrombocytopenia** (e.g., platelet count < 75 × 10⁹/L), or blood dyscrasia such as **haemophilia**. |
| 6 | **R₂** | **Rebleeding risk** (prior bleed) | boolean | **+2** | History of any **prior major bleeding event** (especially gastrointestinal, intracranial, or other clinically significant haemorrhage). **Weighted double.** |
| 7 | **H** | Hypertension (uncontrolled) | boolean | +1 | Uncontrolled hypertension, typically defined as **systolic BP > 160 mmHg** despite therapy. |
| 8 | **A** | Anaemia | boolean | +1 | Haemoglobin **< 13 g/dL in men** or **< 12 g/dL in women** (WHO criteria). |
| 9 | **G** | Genetic factors | boolean | +1 | Known **CYP2C9 single-nucleotide polymorphisms** (CYP2C9\*2 or CYP2C9\*3) associated with reduced warfarin metabolism and increased bleeding risk. |
| 10 | **E** | Excessive fall risk | boolean | +1 | History of recurrent falls or clinical assessment indicating high fall risk (e.g., gait/balance impairment, prior fall-related injury, frailty). |
| 11 | **S** | Stroke history | boolean | +1 | Any prior stroke (ischaemic or haemorrhagic), or transient ischaemic attack per the original derivation cohort. |

**Total components:** 11
**Maximum achievable score:** **12 points** (all 11 components positive: 10 × 1 pt + 1 × 2 pts).

---

## 3. Calculation

Sum the points across all eleven components. Each component contributes its weight only if present.

```
score =  H  + E  + M  + O  + R  + 2·R2  + H  + A  + G  + E  + S
```

Where each variable ∈ {0, 1}. Equivalent pseudocode:

```python
def hemorrhages_score(
    hepatic_or_renal: bool,
    ethanol_abuse: bool,
    malignancy: bool,
    age_over_75: bool,
    reduced_platelets: bool,
    rebleeding_risk: bool,         # weighted x2
    uncontrolled_hypertension: bool,
    anemia: bool,
    genetic_cyp2c9: bool,
    excessive_fall_risk: bool,
    stroke_history: bool,
) -> int:
    return (
        int(hepatic_or_renal)
        + int(ethanol_abuse)
        + int(malignancy)
        + int(age_over_75)
        + int(reduced_platelets)
        + 2 * int(rebleeding_risk)            # R2 — double-weighted
        + int(uncontrolled_hypertension)
        + int(anemia)
        + int(genetic_cyp2c9)
        + int(excessive_fall_risk)
        + int(stroke_history)
    )
```

- **Range:** integer in `[0, 12]`.
- **No missing-value imputation** — every component must be answered (treat unknown as `false` only with explicit clinical justification).

---

## 4. Output

Map the integer score to the **observed bleeding rate per 100 patient-years of warfarin therapy** from the NRAF derivation cohort (Gage 2006). Scores ≥ 5 are pooled into a single high-risk band in the original publication.

| Score | Bleeds per 100 patient-years (95% CI) | Risk category | Suggested clinical interpretation |
|------:|---|---|---|
| **0** | **1.9** (0.6 – 4.4) | Low | Bleeding risk is low. Anticoagulation generally favourable when stroke risk warrants it. |
| **1** | **2.5** (1.3 – 4.3) | Low | Bleeding risk remains low; standard monitoring. |
| **2** | **5.3** (3.4 – 8.1) | Intermediate | Moderate bleeding risk. Address modifiable factors (BP control, fall prevention, alcohol, anaemia). |
| **3** | **8.4** (4.9 – 13.6) | Intermediate–high | Substantial bleeding risk. Optimise modifiable factors; consider closer INR/anticoagulation monitoring. |
| **4** | **10.4** (5.1 – 18.9) | High | High bleeding risk. Re-evaluate net clinical benefit; intensify mitigation; consider alternatives (e.g., DOAC where appropriate, LAA occlusion in selected patients). |
| **≥ 5** | **12.3** (5.8 – 23.1) | Very high | Very high bleeding risk. Multidisciplinary review; weigh against stroke risk; mitigate every reversible factor. |

**Notes**
- Rates are derived from a Medicare cohort on **warfarin**; absolute rates may differ for direct oral anticoagulants (DOACs).
- The c-statistic (discrimination) of HEMORR₂HAGES in the NRAF derivation cohort was **0.67**, exceeding contemporaneous bleeding-risk schemes.
- A high score should **not automatically contraindicate anticoagulation** — it identifies patients in whom bleeding-risk reduction strategies are most warranted and in whom the **net benefit calculation** (stroke prevented vs. bleed caused) needs careful weighing.

### Output payload (suggested implementation shape)

```jsonc
{
  "score": 4,                              // integer 0..12
  "bleeds_per_100_patient_years": 10.4,    // point estimate from Gage 2006
  "ci_95": [5.1, 18.9],                    // lower, upper
  "risk_category": "High",
  "interpretation": "High bleeding risk. Re-evaluate net clinical benefit..."
}
```

---

## 5. References

1. **Gage BF, Yan Y, Milligan PE, Waterman AD, Culverhouse R, Rich MW, Radford MJ.** *Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF).* **American Heart Journal. 2006 Mar;151(3):713–719.** doi:10.1016/j.ahj.2005.04.017. PMID: 16504638.
   - PubMed: <https://pubmed.ncbi.nlm.nih.gov/16504638/>
   - Publisher: <https://www.ahjonline.com/article/S0002-8703(05)00779-7/fulltext>

2. **MDCalc — HEMORR₂HAGES Score for Major Bleeding Risk.** <https://www.mdcalc.com/calc/1785/hemorr2hages-score-major-bleeding-risk>

3. **Comparative validation studies (context, not used for scoring):**
   - Apostolakis S, Lane DA, Guo Y, Buller H, Lip GYH. *Performance of the HEMORR₂HAGES, ATRIA, and HAS-BLED bleeding risk-prediction scores in patients with atrial fibrillation undergoing anticoagulation: the AMADEUS study.* J Am Coll Cardiol. 2012;60(9):861–867.
   - Roldán V, Marín F, Fernández H, et al. *Predictive value of the HAS-BLED and ATRIA bleeding scores for the risk of serious bleeding in a "real-world" population with atrial fibrillation receiving anticoagulant therapy.* Chest. 2013;143(1):179–184.

---

*Spec version:* 1.0 — derived from MDCalc and Gage 2006 primary publication. Implementation must use the eleven boolean inputs, the weighting (R₂ = 2 pts), and the score → rate mapping above verbatim.
