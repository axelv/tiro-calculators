# ORBIT Bleeding Score — Fictional Test Cases

Five fictional clinical test cases covering the spread of ORBIT risk bands
(Low / Medium / High) plus minimum and maximum-score edge cases. All patients,
demographics, and lab values are illustrative.

---

## Test case 1 — Score 0, Low risk (minimum-score edge case)

### Vignette
**Sofie Andersen**, a 58-year-old woman with newly diagnosed paroxysmal atrial
fibrillation, otherwise healthy with no comorbidities. She is starting apixaban
and her clinician runs the ORBIT score before initiation.

### Inputs

| Field key | Value | Notes |
|---|---|---|
| `older_age` | false | Age 58 (< 75) |
| `reduced_hgb_or_anemia` | false | Hb 13.6 g/dL (≥ 12 in women); no anemia history |
| `bleeding_history` | false | No prior GI/intracranial/hemorrhagic CVA |
| `renal_insufficiency` | false | eGFR 92 mL/min/1.73 m² |
| `antiplatelet_use` | false | No aspirin, clopidogrel, or other antiplatelet |

### Expected output — point-by-point

- Older age (≥ 75): 0
- Reduced Hgb / anemia: 0
- Bleeding history: 0
- Renal insufficiency: 0
- Antiplatelet use: 0

**Total score = 0 → Low risk band (0–2)**
- Major bleeds / 100 pt-yr: **1.7** (95% CI 1.2 – 2.4)
- Pooled rate (band): 2.4 / 100 pt-yr
- Interpretation: Low bleeding risk; standard anticoagulation monitoring

---

## Test case 2 — Score 2, Low risk (top of low band)

### Vignette
**Marc Dubois**, a 69-year-old man with persistent AF on warfarin who presents
for routine review. Hb 12.4 g/dL (below the 13 g/dL men cutoff); he takes no
antiplatelets and has no bleeding history.

### Inputs

| Field key | Value | Notes |
|---|---|---|
| `older_age` | false | Age 69 |
| `reduced_hgb_or_anemia` | true | Hb 12.4 g/dL (< 13 in men) |
| `bleeding_history` | false | None |
| `renal_insufficiency` | false | eGFR 71 mL/min/1.73 m² |
| `antiplatelet_use` | false | None |

### Expected output — point-by-point

- Older age: 0
- Reduced Hgb / anemia: **2**
- Bleeding history: 0
- Renal insufficiency: 0
- Antiplatelet use: 0

**Total score = 2 → Low risk band (0–2)**
- Major bleeds / 100 pt-yr: **2.9** (95% CI 2.3 – 3.5)
- Pooled rate (band): 2.4 / 100 pt-yr
- Interpretation: Still low band; address modifiable cause of mild anemia

---

## Test case 3 — Score 3, Medium risk

### Vignette
**Eleanor Whitcombe**, a 78-year-old woman with persistent AF on rivaroxaban
following a recent NSTEMI. She was started on aspirin 81 mg post-PCI. She has
a documented history of a self-limited lower-GI bleed two years ago. eGFR is
preserved and her Hb is 12.8 g/dL.

### Inputs

| Field key | Value | Notes |
|---|---|---|
| `older_age` | true | Age 78 |
| `reduced_hgb_or_anemia` | false | Hb 12.8 g/dL |
| `bleeding_history` | true | Prior LGIB two years ago |
| `renal_insufficiency` | false | eGFR 68 |
| `antiplatelet_use` | false | Aspirin discontinued at presentation |

### Expected output — point-by-point

- Older age (≥ 75): **1**
- Reduced Hgb / anemia: 0
- Bleeding history: **2**
- Renal insufficiency: 0
- Antiplatelet use: 0

**Total score = 3 → Medium risk band**
- Major bleeds / 100 pt-yr: **4.7** (95% CI 4.0 – 5.6)
- Interpretation: Medium risk; review modifiable factors, shared decision on dual therapy and PPI cover

---

## Test case 4 — Score 5, High risk

### Vignette
**Henryk Kowalski**, an 82-year-old man with permanent AF on apixaban,
post-coronary stenting on clopidogrel, with stage 3b CKD (eGFR 38) and
chronic anemia of CKD (Hb 10.9 g/dL). No prior major bleeding.

### Inputs

| Field key | Value | Notes |
|---|---|---|
| `older_age` | true | Age 82 |
| `reduced_hgb_or_anemia` | true | Hb 10.9 g/dL (< 13 men); chronic anemia |
| `bleeding_history` | false | None documented |
| `renal_insufficiency` | true | eGFR 38 mL/min/1.73 m² |
| `antiplatelet_use` | true | Clopidogrel post-PCI |

### Expected output — point-by-point

- Older age (≥ 75): **1**
- Reduced Hgb / anemia: **2**
- Bleeding history: 0
- Renal insufficiency: **1**
- Antiplatelet use: **1**

**Total score = 5 → High risk band (4–7)**
- Major bleeds / 100 pt-yr: **9.0** (95% CI 7.2 – 11.2)
- Pooled rate (band): 8.1 / 100 pt-yr
- Interpretation: High risk; intensive bleeding-risk modification (limit DAPT duration, PPI cover, optimize Hb), close monitoring

---

## Test case 5 — Score 7, High risk (maximum-score edge case)

### Vignette
**Margarethe Hofer**, an 88-year-old woman with longstanding AF on warfarin,
prior intracerebral hemorrhage 4 years ago (anticoagulation later resumed),
CKD stage 4 (eGFR 24), chronic anemia (Hb 10.2 g/dL), and on aspirin 81 mg
for secondary prevention after a TIA.

### Inputs

| Field key | Value | Notes |
|---|---|---|
| `older_age` | true | Age 88 |
| `reduced_hgb_or_anemia` | true | Hb 10.2 g/dL (< 12 women) |
| `bleeding_history` | true | Prior ICH |
| `renal_insufficiency` | true | eGFR 24 |
| `antiplatelet_use` | true | Aspirin 81 mg |

### Expected output — point-by-point

- Older age (≥ 75): **1**
- Reduced Hgb / anemia: **2**
- Bleeding history: **2**
- Renal insufficiency: **1**
- Antiplatelet use: **1**

**Total score = 7 → High risk band (4–7); maximum possible score**
- Major bleeds / 100 pt-yr: **9.0** (95% CI 7.2 – 11.2)
- Interpretation: Maximum ORBIT score; very high bleeding risk. Score informs **risk discussion** — does NOT contraindicate anticoagulation. Address modifiable risks aggressively, consider whether antiplatelet remains essential, and engage shared decision-making
