# CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk

## 1. Purpose

The **CHA₂DS₂-VASc score** is a clinical prediction rule for estimating the annual risk of stroke and systemic thromboembolism (TE) in patients with **non-valvular atrial fibrillation (AF)**. It refines the older **CHADS₂** score by including additional, clinically relevant non-major stroke risk factors (vascular disease, age 65–74, female sex), thereby improving discrimination at the low end of the risk spectrum.

The score is used to:

- Stratify stroke/TE risk in patients with non-valvular AF.
- Guide the decision to initiate oral anticoagulation (OAC).
- Identify "truly low-risk" patients in whom anticoagulation can be safely withheld.

It **supersedes CHADS₂** in major guidelines (ESC, AHA/ACC/HRS) because CHADS₂ classifies many patients as "intermediate risk" without clear treatment guidance, whereas CHA₂DS₂-VASc more reliably identifies low-risk individuals.

> **Note on scope:** The score is validated for **non-valvular AF**. Patients with moderate-to-severe mitral stenosis or mechanical heart valves require anticoagulation independent of this score.

---

## 2. Inputs

The acronym **CHA₂DS₂-VASc** encodes the eight components (with subscripts indicating point weights):

| Code | Component | Type | Definition / Criterion |
|------|-----------|------|------------------------|
| **C** | Congestive heart failure (CHF) | boolean | Signs/symptoms of heart failure or objective evidence of reduced left ventricular ejection fraction (LVEF), regardless of EF threshold; includes HFrEF and HFpEF. |
| **H** | Hypertension | boolean | Resting blood pressure consistently > 140/90 mmHg on at least two occasions, **or** current treatment with antihypertensive medication. |
| **A₂** | Age ≥ 75 years | boolean | Patient's chronological age is ≥ 75 years at time of assessment. |
| **D** | Diabetes mellitus | boolean | Fasting plasma glucose > 125 mg/dL (7 mmol/L) **or** treatment with oral hypoglycemic agents and/or insulin. Includes both Type 1 and Type 2 diabetes. |
| **S₂** | Prior stroke, TIA, or thromboembolism | boolean | Any history of ischemic stroke, transient ischemic attack (TIA), or systemic thromboembolic event. |
| **V** | Vascular disease | boolean | Prior myocardial infarction (MI), peripheral artery disease (PAD), **or** aortic plaque (e.g., complex atheroma on imaging). |
| **A** | Age 65–74 years | boolean | Patient's chronological age is between 65 and 74 years inclusive. (Mutually exclusive with **A₂**.) |
| **Sc** | Sex category — female | boolean | Biological female sex. |

### Notes on Sex Category (Sc) — original vs. 2024 ESC guidance

| Version | Treatment of Female Sex | Rationale |
|---------|------------------------|-----------|
| **Original CHA₂DS₂-VASc (Lip 2010 / pre-2024 guidelines)** | Female sex = +1 point as an **independent risk factor**. Maximum score = 9. | Empirical population-based observation that women with AF have higher stroke risk than men. |
| **2024 ESC Guidelines (CHA₂DS₂-VA)** | Female sex is treated as an **age-dependent risk modifier**, **not** an independent risk factor. The "Sc" component is **removed**. Maximum score = 8. | Subsequent analyses showed women with no other risk factors have stroke rates similar to low-risk men; sex amplifies risk only when other factors coexist. Simplification reduces under-treatment of women misclassified at score = 1. |

**Implementation recommendation:** support both variants behind a configuration flag (e.g., `variant: "CHA2DS2-VASc" | "CHA2DS2-VA"`), defaulting to the original CHA₂DS₂-VASc unless the calling system explicitly opts into the 2024 ESC formulation.

---

## 3. Calculation

The score is the **sum of points** assigned to each present component:

| Component | Points |
|-----------|-------:|
| Congestive heart failure (C) | +1 |
| Hypertension (H) | +1 |
| Age ≥ 75 (A₂) | **+2** |
| Diabetes mellitus (D) | +1 |
| Prior stroke / TIA / thromboembolism (S₂) | **+2** |
| Vascular disease (V) | +1 |
| Age 65–74 (A) | +1 |
| Sex category — female (Sc) | +1 |

```
Score = C + H + 2·(Age≥75) + D + 2·(Stroke/TIA/TE) + V + (Age 65–74) + (Female sex)
```

### Rules

- **Age categories are mutually exclusive.** A patient ≥ 75 receives +2 (A₂) and **0** for A; a patient 65–74 receives +1 (A); a patient < 65 receives 0 for both age components.
- All other components are independent boolean contributions.
- **Maximum score:**
  - **CHA₂DS₂-VASc (original):** 9 (C=1, H=1, A₂=2, D=1, S₂=2, V=1, Sc=1) — note that A₂ and A are mutually exclusive, so a single patient can sum at most 9.
  - **CHA₂DS₂-VA (ESC 2024):** 8 (Sc removed).
- **Minimum score:** 0.

---

## 4. Output

### 4.1 Score Range

Integer in **[0, 9]** (original) or **[0, 8]** (CHA₂DS₂-VA / ESC 2024).

### 4.2 Annual Stroke / Thromboembolism Risk

Risk percentages from the two principal validation studies:

| Score | Lip 2010 (derivation, % per year) | Friberg 2012 (Swedish national cohort, % per year) |
|-----:|----------------------------------:|---------------------------------------------------:|
| 0 | 0.0% | 0.2% |
| 1 | 0.6% | 0.6% |
| 2 | 1.6% | 2.2% |
| 3 | 3.9% | 3.2% |
| 4 | 1.9% | 4.8% |
| 5 | 3.2% | 7.2% |
| 6 | 3.6% | 9.7% |
| 7 | 8.0% | 11.2% |
| 8 | 11.1% | 10.8% |
| 9 | 100%¹ | 12.2% |

¹ *Lip 2010: based on a single patient at score = 9; not statistically reliable.*

**Recommendation for implementations:** report the **Friberg 2012** rates as the primary annual-risk figure (larger, population-based cohort, n = 182,678) and optionally show Lip 2010 as the original derivation rates.

### 4.3 Anticoagulation Recommendation Thresholds

#### Original CHA₂DS₂-VASc (ESC 2020 / AHA-ACC-HRS 2019/2023)

| Patient | Score | Recommendation |
|---------|------:|----------------|
| Male | 0 | **No antithrombotic therapy.** Truly low-risk. |
| Male | 1 | **Consider OAC** (Class IIa). Individualize based on bleeding risk and patient preference. |
| Male | ≥ 2 | **OAC recommended** (Class I). |
| Female | 1 (sex point only) | **No antithrombotic therapy.** Considered low-risk equivalent to male = 0. |
| Female | 2 | **Consider OAC** (Class IIa). |
| Female | ≥ 3 | **OAC recommended** (Class I). |

#### CHA₂DS₂-VA (ESC 2024) — sex-neutral thresholds

| Score | Recommendation |
|------:|----------------|
| 0 | No antithrombotic therapy. |
| 1 | Consider OAC (Class IIa). |
| ≥ 2 | OAC recommended (Class I). |

### 4.4 Choice of Anticoagulant

- **Direct oral anticoagulants (DOACs)** — apixaban, rivaroxaban, dabigatran, edoxaban — are preferred over warfarin in non-valvular AF.
- **Warfarin** (target INR 2.0–3.0) remains indicated for patients with mechanical valves, moderate-to-severe mitral stenosis, or DOAC contraindications.
- **Aspirin monotherapy is no longer recommended** for stroke prevention in AF — current evidence does not support efficacy and bleeding risk is comparable to OAC.
- Bleeding risk should be assessed in parallel (e.g., **HAS-BLED**); a high bleeding score is **not** in itself a contraindication to OAC but flags modifiable risk factors.

### 4.5 Suggested Output Schema

```json
{
  "score": 4,
  "variant": "CHA2DS2-VASc",
  "max_score": 9,
  "components": {
    "chf": 1,
    "hypertension": 1,
    "age_ge_75": 2,
    "diabetes": 0,
    "stroke_tia_te": 0,
    "vascular_disease": 0,
    "age_65_74": 0,
    "sex_female": 0
  },
  "annual_stroke_risk_percent": {
    "lip_2010": 1.9,
    "friberg_2012": 4.8
  },
  "recommendation": {
    "category": "high_risk",
    "guidance": "Oral anticoagulation recommended (Class I).",
    "guideline": "ESC 2020 / AHA-ACC-HRS 2023"
  }
}
```

---

## 5. References

### Primary Publication

1. **Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM.** *Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on Atrial Fibrillation.* **Chest.** 2010;137(2):263–272. doi:10.1378/chest.09-1584
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/19762550/

### Validation

2. **Friberg L, Rosenqvist M, Lip GYH.** *Evaluation of risk stratification schemes for ischaemic stroke and bleeding in 182 678 patients with atrial fibrillation: the Swedish Atrial Fibrillation cohort study.* **European Heart Journal.** 2012;33(12):1500–1510. doi:10.1093/eurheartj/ehr488
   - PubMed: https://pubmed.ncbi.nlm.nih.gov/22246443/

### Guidelines

3. **Hindricks G, Potpara T, Dagres N, et al.** *2020 ESC Guidelines for the diagnosis and management of atrial fibrillation developed in collaboration with the European Association for Cardio-Thoracic Surgery (EACTS).* **European Heart Journal.** 2021;42(5):373–498. doi:10.1093/eurheartj/ehaa612

4. **Van Gelder IC, Rienstra M, Bunting KV, et al.** *2024 ESC Guidelines for the management of atrial fibrillation developed in collaboration with the European Association for Cardio-Thoracic Surgery (EACTS).* **European Heart Journal.** 2024;45(36):3314–3414. doi:10.1093/eurheartj/ehae176
   - Introduces **CHA₂DS₂-VA** (sex category removed; female sex reframed as age-dependent risk modifier rather than independent risk factor).

5. **Joglar JA, Chung MK, Armbruster AL, et al.** *2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation.* **Circulation.** 2024;149(1):e1–e156. doi:10.1161/CIR.0000000000001193

### Online Calculator

6. **MDCalc — CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk.**
   https://www.mdcalc.com/calc/801/cha2ds2-vasc-score-atrial-fibrillation-stroke-risk
