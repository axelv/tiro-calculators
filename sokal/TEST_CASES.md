# Sokal Index — Test Cases

Five fictional clinical test cases for the Sokal Index for Chronic Myelogenous Leukemia (CML).

Formula (from SPEC.md):

```
Sokal = exp( 0.0116 × (age − 43.4)
           + 0.0345 × (spleen_cm − 7.51)
           + 0.188  × ((platelets / 700)² − 0.563)
           + 0.0887 × (blasts_pct − 2.10) )
```

Risk bands: Low `< 0.8`, Intermediate `0.8 – 1.2`, High `> 1.2`.

---

## Test case 1 — Low risk, young patient

**Vignette.** Lieve Janssens, a 32-year-old female office worker, presents to her GP with mild fatigue. CBC reveals leukocytosis. Bone-marrow biopsy and BCR–ABL1 FISH confirm chronic-phase Ph+ CML. The spleen tip is just palpable on deep inspiration but otherwise unremarkable.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 32 years |
| `spleen_cm` | 0 cm (not palpable below costal margin) |
| `platelets` | 280 ×10⁹/L |
| `blasts_pct` | 1 % |

**Term-by-term breakdown.**

- Age term: `0.0116 × (32 − 43.4) = 0.0116 × −11.4 = −0.13224`
- Spleen term: `0.0345 × (0 − 7.51) = 0.0345 × −7.51 = −0.259095`
- Platelet term: `(280/700)² = 0.4² = 0.16`; `0.16 − 0.563 = −0.403`; `0.188 × −0.403 = −0.075764`
- Blast term: `0.0887 × (1 − 2.10) = 0.0887 × −1.10 = −0.097570`
- Sum of linear predictor: `−0.13224 + −0.259095 + −0.075764 + −0.097570 = −0.564669`
- Sokal score: `exp(−0.564669) ≈ 0.5685`

**Expected output.**

| Field | Value |
|---|---|
| `score` | **0.57** |
| `risk_group` | **low** (score < 0.8) |
| 2-year survival (pre-TKI) | ~ 90 % |
| Median survival (pre-TKI) | ~ 5 years |
| Suggested first-line | Standard-dose imatinib |

---

## Test case 2 — Intermediate risk, near cohort mean

**Vignette.** Marek Kowalski, a 47-year-old male carpenter, is referred after routine bloods showed WBC 65 ×10⁹/L. Examination finds the spleen palpable 8 cm below the left costal margin. CML chronic phase is confirmed.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 47 years |
| `spleen_cm` | 8 cm |
| `platelets` | 600 ×10⁹/L |
| `blasts_pct` | 3 % |

**Term-by-term breakdown.**

- Age term: `0.0116 × (47 − 43.4) = 0.0116 × 3.6 = 0.04176`
- Spleen term: `0.0345 × (8 − 7.51) = 0.0345 × 0.49 = 0.0169050`
- Platelet term: `(600/700)² = 0.857143² = 0.734694`; `0.734694 − 0.563 = 0.171694`; `0.188 × 0.171694 = 0.032278`
- Blast term: `0.0887 × (3 − 2.10) = 0.0887 × 0.90 = 0.079830`
- Sum: `0.04176 + 0.016905 + 0.032278 + 0.079830 = 0.170773`
- Sokal score: `exp(0.170773) ≈ 1.1862`

**Expected output.**

| Field | Value |
|---|---|
| `score` | **1.19** |
| `risk_group` | **intermediate** (0.8 ≤ score ≤ 1.2) |
| 2-year survival (pre-TKI) | ~ 65 – 90 % |
| Median survival (pre-TKI) | ~ 2.5 – 5 years |
| Suggested first-line | Standard-dose imatinib or 2G-TKI |

---

## Test case 3 — High risk, older patient with massive splenomegaly

**Vignette.** Hans Vermeulen, a 68-year-old retired schoolteacher, presents with early satiety, drenching night sweats, and 6 kg weight loss. The spleen is massive, palpable 20 cm below the left costal margin. Peripheral smear shows the typical CML left shift with 8 % blasts.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 68 years |
| `spleen_cm` | 20 cm |
| `platelets` | 950 ×10⁹/L |
| `blasts_pct` | 8 % |

**Term-by-term breakdown.**

- Age term: `0.0116 × (68 − 43.4) = 0.0116 × 24.6 = 0.285360`
- Spleen term: `0.0345 × (20 − 7.51) = 0.0345 × 12.49 = 0.430905`
- Platelet term: `(950/700)² = 1.357143² = 1.841837`; `1.841837 − 0.563 = 1.278837`; `0.188 × 1.278837 = 0.240421`
- Blast term: `0.0887 × (8 − 2.10) = 0.0887 × 5.90 = 0.523330`
- Sum: `0.285360 + 0.430905 + 0.240421 + 0.523330 = 1.480016`
- Sokal score: `exp(1.480016) ≈ 4.3929`

**Expected output.**

| Field | Value |
|---|---|
| `score` | **4.39** |
| `risk_group` | **high** (score > 1.2) |
| 2-year survival (pre-TKI) | ~ 65 % |
| Median survival (pre-TKI) | ~ 2.5 years |
| Suggested first-line | Second-generation TKI; consider trial enrolment / transplant evaluation |

---

## Test case 4 — Edge case: minimum-score patient (very low risk)

**Vignette.** Aïsha El Amrani, a 25-year-old graduate student, is diagnosed with chronic-phase Ph+ CML during a pre-employment medical work-up. She is asymptomatic; the spleen is not palpable and the differential shows essentially no circulating blasts.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 25 years |
| `spleen_cm` | 0 cm |
| `platelets` | 200 ×10⁹/L |
| `blasts_pct` | 0 % |

**Term-by-term breakdown.**

- Age term: `0.0116 × (25 − 43.4) = 0.0116 × −18.4 = −0.213440`
- Spleen term: `0.0345 × (0 − 7.51) = −0.259095`
- Platelet term: `(200/700)² = 0.285714² = 0.081633`; `0.081633 − 0.563 = −0.481367`; `0.188 × −0.481367 = −0.090497`
- Blast term: `0.0887 × (0 − 2.10) = 0.0887 × −2.10 = −0.186270`
- Sum: `−0.213440 + −0.259095 + −0.090497 + −0.186270 = −0.749302`
- Sokal score: `exp(−0.749302) ≈ 0.4727`

**Expected output.**

| Field | Value |
|---|---|
| `score` | **0.47** |
| `risk_group` | **low** (well below 0.8 — near minimum of plausible range) |
| 2-year survival (pre-TKI) | ~ 90 % |
| Median survival (pre-TKI) | ~ 5 years |
| Suggested first-line | Standard-dose imatinib |

---

## Test case 5 — Edge case: extreme thrombocytosis driving the squared platelet term

**Vignette.** Diego Ferraro, a 55-year-old male restaurateur, presents with a transient ischaemic attack. CBC shows platelets 1,800 ×10⁹/L and WBC 180 ×10⁹/L. JAK2 is negative; BCR–ABL1 transcripts are detected and chronic-phase CML is confirmed. Spleen is moderately enlarged, 12 cm below the costal margin; peripheral blasts 5 %. This case probes the upper end of the squared platelet term, where Sokal is most sensitive.

**Inputs.**

| Field | Value |
|---|---|
| `age` | 55 years |
| `spleen_cm` | 12 cm |
| `platelets` | 1,800 ×10⁹/L |
| `blasts_pct` | 5 % |

**Term-by-term breakdown.**

- Age term: `0.0116 × (55 − 43.4) = 0.0116 × 11.6 = 0.134560`
- Spleen term: `0.0345 × (12 − 7.51) = 0.0345 × 4.49 = 0.154905`
- Platelet term: `(1800/700)² = 2.571429² = 6.612245`; `6.612245 − 0.563 = 6.049245`; `0.188 × 6.049245 = 1.137258`
- Blast term: `0.0887 × (5 − 2.10) = 0.0887 × 2.90 = 0.257230`
- Sum: `0.134560 + 0.154905 + 1.137258 + 0.257230 = 1.683953`
- Sokal score: `exp(1.683953) ≈ 5.3866`

**Expected output.**

| Field | Value |
|---|---|
| `score` | **5.39** |
| `risk_group` | **high** (score > 1.2; dominated by the squared platelet term) |
| 2-year survival (pre-TKI) | ~ 65 % |
| Median survival (pre-TKI) | ~ 2.5 years |
| Suggested first-line | Second-generation TKI up front; trial enrolment / transplant evaluation |

---

> Note: All survival figures are the pre-TKI 1984-cohort estimates from the SPEC. Modern TKI-era survival is substantially higher in all risk groups.
