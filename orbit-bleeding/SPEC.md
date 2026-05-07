# ORBIT Bleeding Score for Atrial Fibrillation

## 1. Purpose

The **ORBIT Bleeding Score** is a simple bedside tool that predicts the risk of
**major bleeding in patients with atrial fibrillation (AF) on oral anticoagulation**
(warfarin or DOACs).

It was derived from the Outcomes Registry for Better Informed Treatment of
Atrial Fibrillation (ORBIT-AF) and validated in the ROCKET-AF trial cohort.
The score is positioned as an **alternative to HAS-BLED**: it uses only five
readily-available clinical variables, performs at least as well as HAS-BLED on
discrimination (c-statistic ~0.67), and is the bleeding-risk score
**recommended by current ESC AF guidelines** for routine risk assessment when
initiating or continuing anticoagulation.

The score is **not used to withhold anticoagulation** — instead it identifies
patients who need closer monitoring, modifiable-risk-factor optimisation
(e.g. correcting anaemia, reviewing antiplatelet co-prescription), and shared
decision-making about anticoagulant choice and dosing.

---

## 2. Inputs

The calculator takes **five inputs**. All five are clinical/laboratory variables
assessed at the time of bleeding-risk evaluation.

| # | Field name              | Type    | Definition / threshold                                                                                                                                                                            |
|---|-------------------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `older_age`             | boolean | **Age ≥ 75 years** at time of assessment.                                                                                                                                                         |
| 2 | `reduced_hgb_or_anemia` | boolean | Any of the following: **Hemoglobin < 13 g/dL (men)** or **< 12 g/dL (women)**; **Hematocrit < 40% (men)** or **< 36% (women)**; or a documented **history of anemia** in the medical record.      |
| 3 | `bleeding_history`      | boolean | Prior history of **gastrointestinal bleeding, intracranial bleeding, or hemorrhagic stroke** documented at baseline.                                                                              |
| 4 | `renal_insufficiency`   | boolean | **eGFR < 60 mL/min/1.73 m²** (insufficient kidney function). Use the lab-reported eGFR (CKD-EPI or MDRD).                                                                                          |
| 5 | `antiplatelet_use`      | boolean | Current treatment with an **antiplatelet agent** (e.g. aspirin, clopidogrel, prasugrel, ticagrelor) — assessed independently of, and in addition to, the oral anticoagulant.                       |

### Lab threshold reference (input #2)

| Parameter   | Men cutoff   | Women cutoff |
|-------------|--------------|--------------|
| Hemoglobin  | < 13 g/dL    | < 12 g/dL    |
| Hematocrit  | < 40 %       | < 36 %       |

A patient meets criterion #2 if **any one** of: hemoglobin below sex-specific
cutoff, hematocrit below sex-specific cutoff, or documented anemia history.

---

## 3. Calculation

Sum the points awarded for each positive criterion. Maximum total = **7 points**.

| Criterion                                           | Points |
|-----------------------------------------------------|:------:|
| Older age (≥ 75 years)                              |   1    |
| Reduced hemoglobin / hematocrit / anemia history    |   2    |
| Bleeding history (GI, intracranial, hemorrhagic CVA)|   2    |
| Insufficient renal function (eGFR < 60)             |   1    |
| Antiplatelet treatment                              |   1    |
| **Maximum**                                         | **7**  |

```
ORBIT_score = 1 * older_age
            + 2 * reduced_hgb_or_anemia
            + 2 * bleeding_history
            + 1 * renal_insufficiency
            + 1 * antiplatelet_use
```

Mnemonic: **O-R-B-I-T**
- **O**lder (≥ 75) — 1 pt
- **R**educed Hgb/Hct or anemia — 2 pts
- **B**leeding history — 2 pts
- **I**nsufficient renal function — 1 pt
- **T**reatment with antiplatelet — 1 pt

---

## 4. Output

The score maps to a per-score event rate (major bleeds per 100 patient-years)
and a three-tier risk band.

### Per-score rates (ORBIT-AF derivation cohort)

| Score | Major bleeds / 100 patient-years (95% CI) |
|:-----:|-------------------------------------------|
|   0   | 1.7  (1.2 – 2.4)                          |
|   1   | 2.3  (1.9 – 2.9)                          |
|   2   | 2.9  (2.3 – 3.5)                          |
|   3   | 4.7  (4.0 – 5.6)                          |
|   4   | 6.8  (5.8 – 8.1)                          |
|  ≥ 5  | 9.0  (7.2 – 11.2)                         |

### Risk-band interpretation

| Total score | Risk band | Pooled rate (bleeds / 100 pt-yr) |
|:-----------:|-----------|:--------------------------------:|
| 0 – 2       | **Low**       | 2.4                          |
| 3           | **Medium**    | 4.7                          |
| 4 – 7       | **High**      | 8.1                          |

### Implementation note

The output object should expose:

| Field          | Type     | Example         |
|----------------|----------|-----------------|
| `score`        | int 0–7  | `3`             |
| `risk_band`    | enum     | `"medium"`      |
| `rate_per_100_py` | float | `4.7`           |
| `rate_ci_low`  | float    | `4.0`           |
| `rate_ci_high` | float    | `5.6`           |

Do **not** dichotomise the result into a "should anticoagulate" decision —
ORBIT informs risk discussion, it does not contraindicate anticoagulation.

---

## 5. References

**Primary publication**

- O'Brien EC, Simon DN, Thomas LE, Hylek EM, Gersh BJ, Ansell JE, Kowey PR,
  Mahaffey KW, Chang P, Fonarow GC, Pencina MJ, Piccini JP, Peterson ED.
  **The ORBIT bleeding score: a simple bedside score to assess bleeding risk in
  atrial fibrillation.** *European Heart Journal*. 2015;36(46):3258–3264.
  doi:10.1093/eurheartj/ehv476.
  PMID: [26424865](https://pubmed.ncbi.nlm.nih.gov/26424865/) ·
  PMC: [PMC4670965](https://pmc.ncbi.nlm.nih.gov/articles/PMC4670965/) ·
  Journal: <https://academic.oup.com/eurheartj/article/36/46/3258/2398371>

**Calculator reference**

- MDCalc — *ORBIT Bleeding Risk Score for Atrial Fibrillation*:
  <https://www.mdcalc.com/calc/10227/orbit-bleeding-risk-score-atrial-fibrillation>

**Guideline endorsement**

- Hindricks G, et al. *2020 ESC Guidelines for the diagnosis and management of
  atrial fibrillation* (and 2024 ESC focused update) — recommend ORBIT for
  bleeding-risk assessment in anticoagulated AF patients.
