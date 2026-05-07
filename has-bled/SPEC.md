# HAS-BLED Score for Major Bleeding Risk

Implementation specification for the HAS-BLED clinical decision rule estimating
1-year risk of major bleeding in patients with atrial fibrillation (AF) receiving
oral anticoagulation.

---

## 1. Purpose

The HAS-BLED score estimates the **1-year risk of major bleeding** in patients with
atrial fibrillation (AF) who are on, or being considered for, oral anticoagulation
therapy (vitamin K antagonists, direct oral anticoagulants, or antiplatelet therapy).

**Clinical use**

- Used alongside a thromboembolic risk score (e.g. CHA2DS2-VASc) to inform the
  shared decision about initiating, modifying, or continuing anticoagulation in AF.
- A high HAS-BLED score is **not** in itself a contraindication to anticoagulation;
  it identifies patients who warrant closer monitoring, more frequent review, and
  attention to **modifiable** bleeding risk factors (uncontrolled hypertension,
  labile INR, concomitant antiplatelets/NSAIDs, harmful alcohol use).

**Population**

- Adults with non-valvular atrial fibrillation considered for, or receiving,
  antithrombotic therapy.
- The score has been validated across multiple AF cohorts and is endorsed by
  ESC and other guidelines for bleeding risk assessment in AF.

**Out of scope**

- Not validated for venous thromboembolism prophylaxis, mechanical valve patients,
  or non-AF indications for anticoagulation.

---

## 2. Inputs

The HAS-BLED acronym encodes 7 clinical items. Two of these items
(**A**bnormal renal/liver function and **D**rugs/alcohol) are each split into
**two independent subitems**, yielding 9 binary inputs in total.

| # | Acronym | Field name                              | Type    | Clinical definition |
|---|---------|-----------------------------------------|---------|---------------------|
| 1 | **H**   | Hypertension                            | boolean | **Uncontrolled** systolic blood pressure **> 160 mmHg**. |
| 2 | **A**   | Abnormal renal function                 | boolean | Chronic dialysis, prior renal transplantation, **or** serum creatinine **≥ 200 µmol/L (≥ 2.26 mg/dL)**. |
| 2 | **A**   | Abnormal liver function                 | boolean | Chronic hepatic disease (e.g. cirrhosis) **or** biochemical evidence of significant hepatic derangement: **bilirubin > 2× upper limit of normal (ULN)** **AND** **AST or ALT or ALP > 3× ULN**. |
| 3 | **S**   | Stroke                                  | boolean | History of prior stroke (ischemic or hemorrhagic cerebrovascular event). |
| 4 | **B**   | Bleeding history or predisposition      | boolean | Previous major bleeding event **or** predisposition to bleeding (e.g. bleeding diathesis, anemia, severe thrombocytopenia). |
| 5 | **L**   | Labile INR                              | boolean | Unstable / high INRs, **or time in therapeutic range (TTR) < 60 %** in patients on a vitamin K antagonist. Score 0 if not on VKA. |
| 6 | **E**   | Elderly                                 | boolean | **Age > 65 years**. |
| 7 | **D**   | Drugs predisposing to bleeding          | boolean | Concomitant use of antiplatelet agents (aspirin, clopidogrel, etc.) or NSAIDs. |
| 7 | **D**   | Alcohol use                             | boolean | **Harmful alcohol use: ≥ 8 standard drinks per week.** |

**Notes on definitions (per Pisters et al. 2010):**

- **Hypertension** in HAS-BLED specifically refers to *uncontrolled* SBP > 160 mmHg,
  not a history of hypertension. This differs from the H in CHA2DS2-VASc.
- **Abnormal renal function** and **Abnormal liver function** are scored
  **independently**; a patient with both scores 2 points for the "A" component.
- **Drugs** and **Alcohol** are likewise scored **independently**; a patient with
  both scores 2 points for the "D" component.
- **Labile INR** applies only to patients on a vitamin K antagonist. For patients
  on a DOAC or not anticoagulated, this item is scored 0 (some implementations
  treat it as not applicable; for consistency with the original score, treat as 0).

---

## 3. Calculation

Each of the 9 binary subitems contributes **0 or 1 point**. The total score is
the sum of points.

| Component                                | Points if positive |
|------------------------------------------|--------------------|
| H — Hypertension (uncontrolled, SBP > 160 mmHg) | 1 |
| A — Abnormal renal function              | 1 |
| A — Abnormal liver function              | 1 |
| S — Stroke history                       | 1 |
| B — Bleeding history or predisposition   | 1 |
| L — Labile INR (TTR < 60 %)              | 1 |
| E — Elderly (age > 65)                   | 1 |
| D — Drugs predisposing to bleeding       | 1 |
| D — Alcohol use (≥ 8 drinks/week)        | 1 |
| **Maximum total**                        | **9** |

```
HAS_BLED = H + A_renal + A_liver + S + B + L + E + D_drugs + D_alcohol
```

Where each term ∈ {0, 1}.

---

## 4. Output

### 4.1 Score range

Integer score from **0 to 9**.

### 4.2 Bleeding risk per score band

Risk of major bleeding per 100 patient-years, derived from the original
Pisters et al. (2010) Euro Heart Survey AF cohort.

| HAS-BLED score | Bleeds per 100 patient-years | Risk category   |
|---------------:|:-----------------------------|:----------------|
| 0              | ~1.13                        | Low             |
| 1              | ~1.02                        | Low             |
| 2              | ~1.88                        | Moderate        |
| 3              | ~3.74                        | High            |
| 4              | ~8.70                        | High            |
| 5              | ~12.50                       | High            |
| ≥ 6            | Data limited (very high)     | Very high       |

(Original derivation cohort had few patients with scores ≥ 5; estimates for
high scores are imprecise.)

### 4.3 Clinical interpretation

| Score band | Interpretation |
|------------|----------------|
| **0–1**    | **Low bleeding risk.** Anticoagulation generally favorable; routine monitoring. |
| **2**      | **Moderate bleeding risk.** Anticoagulation generally favorable when indicated; monitor closely and address modifiable risk factors. |
| **≥ 3**    | **High bleeding risk.** Anticoagulation may still be indicated when stroke risk is high, but requires caution, regular review (e.g. every 4 weeks initially), and aggressive correction of modifiable factors (BP control, INR stability, minimizing antiplatelet/NSAID use, reducing alcohol). A high HAS-BLED is **not** by itself a reason to withhold anticoagulation. |

**Modifiable risk factors** to address regardless of total score:

- Uncontrolled hypertension (target SBP ≤ 160 mmHg, ideally lower).
- Labile INR — improve TTR or switch to a DOAC.
- Concomitant aspirin / NSAID use — discontinue if not strictly indicated.
- Harmful alcohol use — counsel to reduce intake.

---

## 5. References

**Primary publication**

1. Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJGM, Lip GYH.
   *A novel user-friendly score (HAS-BLED) to assess 1-year risk of major
   bleeding in patients with atrial fibrillation: the Euro Heart Survey.*
   **Chest. 2010;138(5):1093–1100.**
   doi:10.1378/chest.10-0134
   PMID: 20299623

**Calculator reference**

2. MDCalc — HAS-BLED Score for Major Bleeding Risk.
   <https://www.mdcalc.com/calc/807/has-bled-score-major-bleeding-risk>

**Selected validation and guideline references**

3. Lip GYH, Frison L, Halperin JL, Lane DA. *Comparative validation of a novel
   risk score for predicting bleeding risk in anticoagulated patients with
   atrial fibrillation: the HAS-BLED score.* **J Am Coll Cardiol.**
   2011;57(2):173–180. doi:10.1016/j.jacc.2010.09.024

4. Hindricks G, Potpara T, Dagres N, et al. *2020 ESC Guidelines for the
   diagnosis and management of atrial fibrillation developed in collaboration
   with the EACTS.* **Eur Heart J.** 2021;42(5):373–498.
   doi:10.1093/eurheartj/ehaa612
