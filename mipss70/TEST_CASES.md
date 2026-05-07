# MIPSS70 / MIPSS70+ v2.0 — Fictional Test Cases

Five fictional clinical test cases covering the spread of risk categories for both
the original **MIPSS70** and **MIPSS70+ v2.0** scoring systems. All patients,
demographics, and lab values are illustrative.

---

## Test case 1 — MIPSS70, Low risk (minimum-score edge case)

### Vignette
**Marta Lindqvist**, a 41-year-old woman with newly diagnosed primary myelofibrosis
detected on incidental thrombocytosis workup. She is asymptomatic with preserved
performance status and was referred for risk stratification before considering
transplant.

### Inputs (MIPSS70)

| Field key | Value |
|---|---|
| `version` | `MIPSS70` |
| `hb_lt_10` | false (Hb 12.4 g/dL) |
| `wbc_gt_25` | false (WBC 9.8 × 10⁹/L) |
| `plt_lt_100` | false (Plt 410 × 10⁹/L) |
| `blasts_ge_2` | false (PB blasts 0%) |
| `bm_fibrosis_ge_2` | false (MF-1) |
| `constitutional_symptoms` | false |
| `absence_calr_type1` | false (CALR type 1 mutation present) |
| `hmr_present` | false |
| `hmr_two_or_more` | false |

### Expected output — point-by-point

- Hb < 10: 0
- WBC > 25: 0
- Plt < 100: 0
- Blasts ≥ 2%: 0
- BM fibrosis ≥ 2: 0
- Constitutional symptoms: 0
- Absence of CALR type 1/like: 0
- HMR present: 0
- ≥ 2 HMR: 0

**Total = 0 → Low risk (0–1)**
- 5-year OS: ~95%
- Median OS: 27.7 years
- Transplant recommendation: **Defer**; observe / medical therapy

---

## Test case 2 — MIPSS70, Intermediate risk

### Vignette
**Tomás Reyes-García**, a 56-year-old man with a 3-year history of PMF presenting
with progressive fatigue and mild splenomegaly. Bone-marrow biopsy confirmed
MF-2 fibrosis; NGS shows a JAK2 V617F driver and a single ASXL1 mutation.

### Inputs (MIPSS70)

| Field key | Value |
|---|---|
| `version` | `MIPSS70` |
| `hb_lt_10` | true (Hb 9.6 g/dL) |
| `wbc_gt_25` | false (WBC 14 × 10⁹/L) |
| `plt_lt_100` | false (Plt 145 × 10⁹/L) |
| `blasts_ge_2` | false (PB blasts 1%) |
| `bm_fibrosis_ge_2` | true (MF-2) |
| `constitutional_symptoms` | false |
| `absence_calr_type1` | true (JAK2 V617F driver, no CALR) |
| `hmr_present` | true (ASXL1) |
| `hmr_two_or_more` | false |

### Expected output — point-by-point

- Hb < 10: **1**
- WBC > 25: 0
- Plt < 100: 0
- Blasts ≥ 2%: 0
- BM fibrosis ≥ 2: **1**
- Constitutional symptoms: 0
- Absence of CALR type 1/like: **1**
- HMR present: **1**
- ≥ 2 HMR: 0

**Total = 4 → Intermediate risk (2–4)**
- 5-year OS: ~70%
- Median OS: 7.1 years
- Transplant recommendation: **Consider**; individualized decision

---

## Test case 3 — MIPSS70, High risk

### Vignette
**Hannah O'Brien**, a 62-year-old woman with PMF complicated by night sweats,
12% weight loss, and worsening leukocytosis. Peripheral blood shows 4% blasts;
NGS reveals JAK2 V617F plus ASXL1 and EZH2 mutations.

### Inputs (MIPSS70)

| Field key | Value |
|---|---|
| `version` | `MIPSS70` |
| `hb_lt_10` | true (Hb 8.7 g/dL) |
| `wbc_gt_25` | true (WBC 32 × 10⁹/L) |
| `plt_lt_100` | true (Plt 78 × 10⁹/L) |
| `blasts_ge_2` | true (PB blasts 4%) |
| `bm_fibrosis_ge_2` | true (MF-3) |
| `constitutional_symptoms` | true |
| `absence_calr_type1` | true (JAK2 V617F) |
| `hmr_present` | true |
| `hmr_two_or_more` | true (ASXL1 + EZH2) |

### Expected output — point-by-point

- Hb < 10: **1**
- WBC > 25: **2**
- Plt < 100: **2**
- Blasts ≥ 2%: **1**
- BM fibrosis ≥ 2: **1**
- Constitutional symptoms: **1**
- Absence of CALR type 1/like: **1**
- HMR present: **1**
- ≥ 2 HMR: **2** (additive on top of HMR-present in MIPSS70)

**Total = 12 → High risk (≥ 5); maximum-score edge case**
- 5-year OS: ~29%
- Median OS: 2.3 years
- Transplant recommendation: **Strongly recommend allo-HCT** if eligible

---

## Test case 4 — MIPSS70+ v2.0, Very low risk (minimum-score edge case)

### Vignette
**Pieter Janssens**, a 49-year-old man with newly diagnosed PMF discovered on
routine occupational health screening. He is asymptomatic with normal blood
counts; karyotype is normal and he carries a CALR type 1 driver mutation with
no HMR mutations on extended panel.

### Inputs (MIPSS70+ v2.0)

| Field key | Value |
|---|---|
| `version` | `MIPSS70+v2.0` |
| `severe_anemia` | false (Hb 14.2 g/dL, male) |
| `moderate_anemia` | false |
| `blasts_ge_2` | false (PB blasts 0%) |
| `constitutional_symptoms` | false |
| `absence_calr_type1` | false (CALR type 1 present) |
| `hmr_status` | `none` |
| `karyotype` | `favorable` (normal 46,XY) |

### Expected output — point-by-point

- Karyotype favorable: 0
- HMR none: 0
- Absence of CALR type 1/like: 0
- Constitutional symptoms: 0
- Severe anemia: 0
- Moderate anemia: 0
- Blasts ≥ 2%: 0

**Total = 0 → Very low risk (score = 0)**
- 10-year OS: 92%
- Median OS: not reached
- Transplant recommendation: **Defer**

---

## Test case 5 — MIPSS70+ v2.0, Very high risk

### Vignette
**Aiko Tanaka**, a 67-year-old woman with PMF and progressive cytopenias. She
reports drenching night sweats and 8 kg weight loss over 4 months. NGS shows
ASXL1 + SRSF2 + U2AF1 Q157 mutations; karyotype shows a complex abnormality
including i(17q), placing her in the very-high-risk (VHR) cytogenetic group.

### Inputs (MIPSS70+ v2.0)

| Field key | Value |
|---|---|
| `version` | `MIPSS70+v2.0` |
| `severe_anemia` | true (Hb 7.4 g/dL, female; threshold < 8) |
| `moderate_anemia` | false |
| `blasts_ge_2` | true (PB blasts 3%) |
| `constitutional_symptoms` | true |
| `absence_calr_type1` | true (JAK2 V617F driver) |
| `hmr_status` | `two_or_more` (ASXL1 + SRSF2 + U2AF1 Q157) |
| `karyotype` | `vhr` (i(17q)) |

### Expected output — point-by-point

- Karyotype VHR: **4**
- ≥ 2 HMR (chosen, not additive): **3**
- Absence of CALR type 1/like: **2**
- Constitutional symptoms: **2**
- Severe anemia: **2**
- Blasts ≥ 2%: **1**

**Total = 14 → Very high risk (≥ 9)**
- 10-year OS: < 5%
- Median OS: 1.8 years
- Transplant recommendation: **Strongly recommend allo-HCT** if eligible; expected OS < 2 y otherwise
