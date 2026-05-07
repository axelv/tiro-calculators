# HCT-CI: Hematopoietic Cell Transplantation-specific Comorbidity Index

## 1. Purpose

The **HCT-CI** is a pre-transplant risk assessment tool that predicts **non-relapse mortality (NRM)** and **overall survival (OS)** after allogeneic hematopoietic cell transplantation (HCT) in patients with hematologic malignancies. It was developed by Sorror et al. (2005) as a HCT-tailored refinement of the Charlson Comorbidity Index (CCI), demonstrating substantially better discrimination for post-HCT outcomes than the CCI (c-statistic 0.661 vs 0.561).

Key clinical uses:

- **Pre-HCT risk stratification** to inform shared decision-making between physician and patient.
- **Conditioning regimen selection** — high-dose myeloablative vs reduced-intensity / non-myeloablative conditioning. Patients with composite (age-augmented) scores >=3 derive disproportionate benefit from non-myeloablative approaches due to lower NRM.
- **Comparative outcome reporting** across centers and trials (risk-adjusted benchmarking).
- **Eligibility decisions** for allogeneic HCT in patients with significant pre-existing organ dysfunction.

The 2014 update (Sorror et al., JCO) integrates **age >=40 years** as an additional point, yielding the **HCT Comorbidity/Age Index** with improved prognostic performance (c-statistic for OS rose from 0.560 to 0.682).

> The original HCT-CI (without age adjustment) remains the standard; age adjustment is recommended when biologic age is a clinically relevant input.

---

## 2. Inputs

Each comorbidity is scored only if it meets the precise clinical definition below. Definitions are taken verbatim from Sorror et al. *Blood* 2005 (Table 2). All values are assessed in the immediate **pre-HCT** workup window.

### 2.1 Comorbidity Categories

| # | Category | Clinical Definition / Threshold | Points |
|---|----------|---------------------------------|:------:|
| 1 | **Arrhythmia** | Atrial fibrillation or flutter, sick sinus syndrome, or ventricular arrhythmias | **1** |
| 2 | **Cardiac** | Coronary artery disease (CAD), congestive heart failure (CHF), myocardial infarction (MI), or ejection fraction (EF) <=50% | **1** |
| 3 | **Inflammatory bowel disease (IBD)** | Crohn disease or ulcerative colitis | **1** |
| 4 | **Diabetes** | Requiring treatment with insulin or oral hypoglycemics; **not** diet-controlled alone | **1** |
| 5 | **Cerebrovascular disease** | Transient ischemic attack (TIA) or cerebrovascular accident (CVA) | **1** |
| 6 | **Psychiatric disturbance** | Depression or anxiety requiring psychiatric consult or treatment | **1** |
| 7 | **Hepatic, mild** | Chronic hepatitis, **OR** bilirubin >ULN to 1.5x ULN, **OR** AST/ALT >ULN to 2.5x ULN | **1** |
| 8 | **Obesity** | Body mass index (BMI) >35 kg/m^2 (adults); >95th percentile for age and sex (pediatric) | **1** |
| 9 | **Infection** | Requiring continuation of antimicrobial treatment after day 0 of HCT | **1** |
| 10 | **Rheumatologic** | Systemic lupus erythematosus (SLE), rheumatoid arthritis (RA), polymyositis, mixed connective tissue disease, or polymyalgia rheumatica | **2** |
| 11 | **Peptic ulcer** | Requiring treatment | **2** |
| 12 | **Renal, moderate / severe** | Serum creatinine >2 mg/dL (>177 µmol/L), on dialysis, or prior renal transplantation | **2** |
| 13 | **Pulmonary, moderate** | DLco and/or FEV1 **66%-80% predicted**, **OR** dyspnea on slight activity | **2** |
| 14 | **Heart valve disease** | Any valvular disease **except** mitral valve prolapse | **3** |
| 15 | **Hepatic, moderate / severe** | Liver cirrhosis, **OR** bilirubin >1.5x ULN, **OR** AST/ALT >2.5x ULN | **3** |
| 16 | **Pulmonary, severe** | DLco and/or FEV1 **<=65% predicted**, **OR** dyspnea at rest, **OR** requiring oxygen | **3** |
| 17 | **Prior solid tumor** | Treated at any point in patient's history, **excluding** non-melanoma skin cancer | **3** |

**Mutually exclusive groupings:** Hepatic and pulmonary categories have severity tiers — score the **highest applicable tier only** (do not double-count mild + severe).

ULN = upper limit of normal. DLco = diffusing capacity of the lungs for carbon monoxide. FEV1 = forced expiratory volume in 1 second.

### 2.2 Age (Sorror 2014 Update — HCT Comorbidity/Age Index)

| Variable | Threshold | Points |
|----------|-----------|:------:|
| **Age** | >=40 years at HCT | **+1** |

Underlying hazard ratios for NRM by age band (vs <20 years reference): 20-39 HR 1.21; 40-49 HR 1.48; 50-59 HR 1.75; >=60 HR 1.84. The dichotomous +1 point at age >=40 was validated as the optimal integration with HCT-CI.

---

## 3. Calculation

### 3.1 Formula

```
HCT-CI score              = sum of points across all applicable comorbidities (categories 1-17)
HCT Comorbidity/Age score = HCT-CI score + (1 if age >= 40 else 0)
```

- Theoretical maximum (HCT-CI alone): 26 points (sum of all 17 categories with severity at highest tier).
- Score is computed from the patient's **pre-transplant** workup (history, labs, ECG, echocardiogram, PFTs, BMI).

### 3.2 Risk Group Stratification

#### Original HCT-CI (Sorror 2005)

| Risk Group | HCT-CI Score |
|------------|:------------:|
| **Low** | 0 |
| **Intermediate** | 1-2 |
| **High** | >=3 |

#### Comorbidity/Age Index (Sorror 2014) — extended stratification

| Risk Group | Composite Score |
|------------|:---------------:|
| **Low** | 0-2 |
| **Intermediate** | 3-4 |
| **High** | >=5 |

> In the 2014 cohort, patients with composite scores 0-2 had **comparable NRM regardless of conditioning intensity**, whereas scores 3-4 and >=5 showed **significantly higher NRM with high-dose vs non-myeloablative conditioning** — driving the clinical use of the index for conditioning-regimen selection.

---

## 4. Output

### 4.1 Original HCT-CI — 2-Year Outcomes (Sorror 2005, validation cohort)

| Risk Group | Score | 2-yr NRM | 2-yr Overall Survival |
|------------|:-----:|:--------:|:---------------------:|
| **Low** | 0 | **14%** | **71%** |
| **Intermediate** | 1-2 | **21%** | **60%** |
| **High** | >=3 | **41%** | **34%** |

### 4.2 Discrimination Performance

| Metric | HCT-CI alone | + Age (2014) |
|--------|:------------:|:------------:|
| c-statistic, NRM | 0.661 | 0.664 |
| c-statistic, OS  | ~0.65 | 0.682 |
| c-statistic vs CCI (NRM) | 0.661 vs 0.561 | — |

### 4.3 Recommended Reporting

For each patient, report:

1. **Itemized comorbidity list** with points per category.
2. **HCT-CI total** (and **HCT Comorbidity/Age** total if age >=40 considered).
3. **Risk group label** (low / intermediate / high).
4. **2-yr NRM and OS estimates** from the validation cohort table.
5. **Clinical caveat:** estimates derived from a heterogeneous allogeneic HCT cohort; individual prognosis depends on disease, donor, conditioning, and center factors. Use for shared decision-making, not as a stand-alone exclusion criterion.

---

## 5. References

### Primary Publications

1. **Sorror ML, Maris MB, Storb R, Baron F, Sandmaier BM, Maloney DG, Storer B.**
   *Hematopoietic cell transplantation (HCT)-specific comorbidity index: a new tool for risk assessment before allogeneic HCT.*
   **Blood.** 2005;106(8):2912-2919.
   DOI: [10.1182/blood-2005-05-2004](https://doi.org/10.1182/blood-2005-05-2004)
   PMC: [PMC1895304](https://pmc.ncbi.nlm.nih.gov/articles/PMC1895304/)
   PubMed: [15994282](https://pubmed.ncbi.nlm.nih.gov/15994282/)

2. **Sorror ML, Storb RF, Sandmaier BM, Maziarz RT, Pulsipher MA, Maris MB, et al.**
   *Comorbidity-age index: a clinical measure of biologic age before allogeneic hematopoietic cell transplantation.*
   **J Clin Oncol.** 2014;32(29):3249-3256.
   DOI: [10.1200/JCO.2013.53.8157](https://doi.org/10.1200/JCO.2013.53.8157)
   PubMed: [25154831](https://pubmed.ncbi.nlm.nih.gov/25154831/)

### Calculator Reference

3. **MDCalc — HCT-CI Calculator.**
   <https://www.mdcalc.com/calc/3980/hematopoietic-cell-transplantation-specific-comorbidity-index-hct-ci>

### Supporting / Validation Literature

4. Sorror ML, Sandmaier BM, Storer BE, et al. *Comorbidity and disease status-based risk stratification of outcomes among patients with acute myeloid leukemia or myelodysplasia receiving allogeneic hematopoietic cell transplantation.* J Clin Oncol. 2007;25(27):4246-4254.
5. Raimondi R, Tosetto A, Oneto R, et al. *Validation of the Hematopoietic Cell Transplantation-Specific Comorbidity Index: a prospective, multicenter GITMO study.* Blood. 2012;120(6):1327-1333.
