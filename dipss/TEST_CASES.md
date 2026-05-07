# DIPSS — Test Cases

Five fictional clinical test cases for the Dynamic International Prognostic Scoring System (DIPSS) for myelofibrosis. Scoring follows Passamonti F et al., *Blood* 2010;115(9):1703–1708.

Reference scoring (per SPEC §3):

```
DIPSS = age_gt_65 + constitutional_symptoms + 2*hgb_lt_10 + wbc_gt_25 + blasts_ge_1
```

Risk bands (per SPEC §4.2): 0 = Low; 1–2 = Int-1 (median 14.2 y); 3–4 = Int-2 (4.0 y); 5–6 = High (1.5 y).

---

## Test case 1 — Low risk (minimum score)

**Vignette.** Mrs. Hilde Janssens, a 58-year-old retired schoolteacher, was diagnosed with primary myelofibrosis 8 months ago after presenting with fatigue and an incidentally noted splenomegaly. She is asymptomatic on follow-up; bloodwork is well preserved.

**Inputs**

| Field key | Value |
|---|---|
| `age_gt_65` | false (age 58) |
| `constitutional_symptoms` | false |
| `hgb_lt_10` | false (Hb 13.4 g/dL) |
| `wbc_gt_25` | false (WBC 9.1 × 10⁹/L) |
| `blasts_ge_1` | false (0 % blasts) |

**Computation**

```
0 + 0 + 2*0 + 0 + 0 = 0
```

**Expected outcome**

- Score: **0**
- Risk group: **Low**
- Median overall survival: **Not reached** (`median_survival_years = null`, label "Not reached")
- Suggested action: observation; symptom-directed therapy only. Allogeneic HSCT generally not indicated.

---

## Test case 2 — Intermediate-1

**Vignette.** Mr. Thomas Verlinden, a 71-year-old retired carpenter with PMF diagnosed 2 years ago, presents to clinic with stable disease. He has no constitutional symptoms; his only finding is mild anemia that does not yet meet the DIPSS threshold.

**Inputs**

| Field key | Value |
|---|---|
| `age_gt_65` | true (age 71) |
| `constitutional_symptoms` | false |
| `hgb_lt_10` | false (Hb 10.8 g/dL) |
| `wbc_gt_25` | false (WBC 14 × 10⁹/L) |
| `blasts_ge_1` | false (0 % blasts) |

**Computation**

```
1 (age>65) + 0 + 2*0 + 0 + 0 = 1
```

**Expected outcome**

- Score: **1**
- Risk group: **Intermediate-1**
- Median overall survival: **14.2 years**
- Suggested action: symptom-directed therapy; HSCT considered case-by-case, particularly with adverse molecular/karyotype features (consider DIPSS-Plus / MIPSS70+).

---

## Test case 3 — Intermediate-2

**Vignette.** Mr. Karim El-Hassan, a 68-year-old former civil engineer, is reassessed 18 months after his PMF diagnosis. He has progressive anemia and rising leukocytosis but remains constitutionally well. The peripheral smear is negative for blasts.

**Inputs**

| Field key | Value |
|---|---|
| `age_gt_65` | true (age 68) |
| `constitutional_symptoms` | false |
| `hgb_lt_10` | true (Hb 9.2 g/dL) |
| `wbc_gt_25` | true (WBC 28 × 10⁹/L) |
| `blasts_ge_1` | false (0 % blasts) |

**Computation**

```
1 (age>65) + 0 + 2*1 (Hb<10) + 1 (WBC>25) + 0 = 4
```

**Expected outcome**

- Score: **4**
- Risk group: **Intermediate-2**
- Median overall survival: **4.0 years**
- Suggested action: **allogeneic HSCT evaluation** if eligible; JAK inhibition for symptom control as bridge or definitive therapy if not transplant-eligible.

---

## Test case 4 — High risk

**Vignette.** Mr. Lucien Marais, a 70-year-old patient with established PMF, is admitted with worsening cachexia, drenching night sweats, intermittent fevers, transfusion-dependent anemia, and rising leukocytosis. The peripheral smear demonstrates 4 % circulating blasts.

**Inputs**

| Field key | Value |
|---|---|
| `age_gt_65` | true (age 70) |
| `constitutional_symptoms` | true (fevers, sweats, weight loss) |
| `hgb_lt_10` | true (Hb 7.9 g/dL) |
| `wbc_gt_25` | true (WBC 32 × 10⁹/L) |
| `blasts_ge_1` | true (blasts 4 %) |

**Computation**

```
1 + 1 + 2*1 + 1 + 1 = 6
```

**Expected outcome**

- Score: **6** (maximum)
- Risk group: **High**
- Median overall survival: **1.5 years**
- Suggested action: **allogeneic HSCT evaluation** if eligible; otherwise JAK inhibition, clinical trial, or best supportive care.

---

## Test case 5 — Edge case: young patient with severe anemia

**Vignette.** Ms. Aminata Diop, a 49-year-old graphic designer with primary myelofibrosis diagnosed 3 years ago, is reassessed in clinic. She is constitutionally well, has no leukocytosis and no circulating blasts, but her hemoglobin has dropped to 8.6 g/dL on routine labs — the only DIPSS variable that is positive.

**Inputs**

| Field key | Value |
|---|---|
| `age_gt_65` | false (age 49) |
| `constitutional_symptoms` | false |
| `hgb_lt_10` | true (Hb 8.6 g/dL) |
| `wbc_gt_25` | false (WBC 11 × 10⁹/L) |
| `blasts_ge_1` | false (0 % blasts) |

**Computation**

```
0 + 0 + 2*1 + 0 + 0 = 2
```

**Expected outcome**

- Score: **2**
- Risk group: **Intermediate-1**
- Median overall survival: **14.2 years**
- Suggested action: symptom-directed therapy (consider ESA/danazol/lenalidomide for anemia); HSCT considered case-by-case in younger patients with adverse mutations or unfavourable karyotype — apply DIPSS-Plus or MIPSS70+ for further refinement.
- Edge-case note: anemia alone (the double-weighted variable) is sufficient to lift a young, otherwise well patient out of the Low band into Intermediate-1, illustrating DIPSS's design principle.
