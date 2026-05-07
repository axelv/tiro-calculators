# EUTOS Long-Term Survival (ELTS) Score for CML — Test Cases

Five fictional clinical test cases for the ELTS score (Pfirrmann M et al., *Leukemia* 2016;30(1):48–56). Formula and cut-points per SPEC §3 and §4.2.

```
ELTS = 0.0025 × (age / 10)^3
     + 0.0615 × spleen_cm
     + 0.1052 × blasts_pct          (rounded to nearest integer)
     + 0.4104 × (platelets / 1000)^(-0.5)
```

Cut-points: ≤ 1.5680 Low; > 1.5680 and ≤ 2.2185 Intermediate; > 2.2185 High.

---

## Test case 1 — Low risk (typical young patient)

**Vignette.** Mr. Niels Andersen, a 35-year-old software engineer, is referred to the hematology clinic after routine bloodwork showed leukocytosis. Workup confirms newly-diagnosed chronic-phase Ph+ CML. He is asymptomatic; the spleen is not palpable on examination; peripheral-blood differential shows 0 % blasts; platelets 320 × 10⁹/L. Scoring is performed prior to any cytoreductive therapy.

**Inputs**

| Field | Value |
|---|---|
| `age` | 35 |
| `spleen_cm` | 0 |
| `blasts_pct` | 0 |
| `platelets` | 320 |

**Computation**

```
0.0025 × (35/10)^3      = 0.0025 × 42.875       = 0.10719
0.0615 × 0              = 0.00000
0.1052 × 0              = 0.00000
0.4104 × (320/1000)^-0.5 = 0.4104 × 1.76777     = 0.72549
                                          ELTS  = 0.83268  → ≤ 1.5680 → Low
```

**Expected outcome**

- ELTS score: **0.8327** (4 dp)
- Risk group: **Low** (≤ 1.5680)
- 10-year cumulative incidence of CML-specific death: **~ 2 %** (10-year CML-specific survival ~ 98 %)
- Practical implication: standard first-line TKI (imatinib or any approved 2G-TKI) per local guidance; routine 3-monthly molecular monitoring.

---

## Test case 2 — Low risk (upper end of Low band)

**Vignette.** Mrs. Emine Yıldız, a 52-year-old nurse, presents with mild fatigue and is found to have leukocytosis. Examination reveals a spleen tip 2 cm below the left costal margin. Peripheral smear: 1 % blasts; platelets 280 × 10⁹/L.

**Inputs**

| Field | Value |
|---|---|
| `age` | 52 |
| `spleen_cm` | 2 |
| `blasts_pct` | 1 |
| `platelets` | 280 |

**Computation**

```
0.0025 × (52/10)^3      = 0.0025 × 140.608      = 0.35152
0.0615 × 2              = 0.12300
0.1052 × 1              = 0.10520
0.4104 × (280/1000)^-0.5 = 0.4104 × 1.88982     = 0.77558
                                          ELTS  = 1.35530  → ≤ 1.5680 → Low
```

**Expected outcome**

- ELTS score: **1.3553** (4 dp)
- Risk group: **Low** (≤ 1.5680)
- 10-year cumulative incidence of CML-specific death: **~ 2 %** (10-yr CML-specific survival ~ 98 %)
- Practical implication: standard first-line TKI; routine 3-monthly molecular monitoring.

---

## Test case 3 — Intermediate risk

**Vignette.** Mr. Robert Müller, a 60-year-old retired teacher, is diagnosed with chronic-phase CML after presenting with abdominal fullness. He has a palpable spleen 5 cm below the left costal margin. Differential shows 2 % blasts; platelets 220 × 10⁹/L.

**Inputs**

| Field | Value |
|---|---|
| `age` | 60 |
| `spleen_cm` | 5 |
| `blasts_pct` | 2 |
| `platelets` | 220 |

**Computation**

```
0.0025 × (60/10)^3      = 0.0025 × 216         = 0.54000
0.0615 × 5              = 0.30750
0.1052 × 2              = 0.21040
0.4104 × (220/1000)^-0.5 = 0.4104 × 2.13201    = 0.87498
                                          ELTS = 1.93288  → > 1.5680 and ≤ 2.2185 → Intermediate
```

**Expected outcome**

- ELTS score: **1.9329** (4 dp)
- Risk group: **Intermediate** (> 1.5680, ≤ 2.2185)
- 10-year cumulative incidence of CML-specific death: **~ 5 %** (10-yr CML-specific survival ~ 95 %)
- Practical implication: first-line TKI as for Low risk; lower threshold to switch on inadequate response at the ELN molecular milestones.

---

## Test case 4 — High risk

**Vignette.** Mr. Jean-Luc Moreau, a 72-year-old retired vintner, presents with a 4-month history of weight loss, early satiety, and a markedly enlarged abdomen. Examination reveals a spleen palpable 12 cm below the costal margin. Peripheral-blood differential: 6 % blasts; platelets 180 × 10⁹/L.

**Inputs**

| Field | Value |
|---|---|
| `age` | 72 |
| `spleen_cm` | 12 |
| `blasts_pct` | 6 |
| `platelets` | 180 |

**Computation**

```
0.0025 × (72/10)^3      = 0.0025 × 373.248     = 0.93312
0.0615 × 12             = 0.73800
0.1052 × 6              = 0.63120
0.4104 × (180/1000)^-0.5 = 0.4104 × 2.35702    = 0.96732
                                          ELTS = 3.26964  → > 2.2185 → High
```

**Expected outcome**

- ELTS score: **3.2696** (4 dp)
- Risk group: **High** (> 2.2185)
- 10-year cumulative incidence of CML-specific death: **~ 12 %** (10-yr CML-specific survival ~ 88 %)
- Practical implication: strongly consider a 2nd-generation TKI (nilotinib, dasatinib, or bosutinib) over imatinib first-line; closer molecular monitoring and earlier discussion of switch / allo-HCT eligibility on suboptimal response.

---

## Test case 5 — Edge case: very high score in elderly thrombocytopenic patient

**Vignette.** Mrs. Vera Kuznetsova, an 82-year-old retired physician, is referred with massive splenomegaly (palpable 25 cm below the costal margin), constitutional symptoms, and pancytopenia. Peripheral smear demonstrates 12 % blasts; platelets are 60 × 10⁹/L. The bone-marrow biopsy and BCR::ABL1 PCR confirm chronic-phase CML (no blast crisis criteria met yet).

**Inputs**

| Field | Value |
|---|---|
| `age` | 82 |
| `spleen_cm` | 25 |
| `blasts_pct` | 12 |
| `platelets` | 60 |

**Computation**

```
0.0025 × (82/10)^3      = 0.0025 × 551.368     = 1.37842
0.0615 × 25             = 1.53750
0.1052 × 12             = 1.26240
0.4104 × (60/1000)^-0.5 = 0.4104 × 4.08248     = 1.67545
                                          ELTS = 5.85377  → ≫ 2.2185 → High
```

**Expected outcome**

- ELTS score: **5.8538** (4 dp)
- Risk group: **High** (> 2.2185)
- 10-year cumulative incidence of CML-specific death: **~ 12 %** (per SPEC §4.3 the High band is ~ 12 %; real-world cohorts report substantially higher absolute event rates at the extreme of the High band)
- Practical implication: strongly consider 2G-TKI first-line; closer monitoring; early discussion of switch and allo-HCT eligibility. Integrate with comorbidities and patient-level factors.
- Edge-case note: this case combines all four covariates near the upper plausible range and demonstrates how the inverse-square-root platelet term and cubic age term together drive very high scores in elderly thrombocytopenic CML patients.
