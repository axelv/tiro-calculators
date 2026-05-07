# EBMT (Gratwohl) Transplant Risk Score — Test Cases

Five fictional clinical test cases for the EBMT Risk Score for allogeneic HSCT (Gratwohl 1998 / 2009 / 2012). Scoring follows SPEC §2–§3.

Per-component points:

| Component | 0 | 1 | 2 |
|---|---|---|---|
| Age | < 20 | 20–40 | > 40 |
| Disease stage | Early | Intermediate | Advanced |
| Donor type | HLA-id sibling | Unrelated | — |
| Sex match | Any other | Female → Male | — |
| Time to HCT | ≤ 12 mo (or CR1) | > 12 mo | — |

Risk categories: 0–2 Low (5-yr OS ~60–70 %, TRM ~15–25 %); 3–4 Intermediate (~40–50 % / ~30–40 %); 5–7 High (~20–30 % / ~45–60 %).

---

## Test case 1 — Score 0 (minimum, Low risk)

**Vignette.** Lukas Bauer, a 14-year-old boy with high-risk acute lymphoblastic leukemia (ALL) in first complete remission (CR1), is transplanted 7 months after diagnosis. The donor is his 12-year-old HLA-identical brother.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| Age | 14 (< 20) | 0 |
| Disease stage | Early (ALL CR1) | 0 |
| Donor type | HLA-identical sibling | 0 |
| Donor → recipient sex | Male → Male | 0 |
| Time diagnosis → HCT | CR1 (7 mo) → 0 by convention | 0 |

**Computation**

```
Score = 0 + 0 + 0 + 0 + 0 = 0
```

**Expected outcome**

- Score: **0** (minimum)
- Risk category: **Low** (range 0–2)
- 5-year overall survival: **~71 %**
- 5-year transplant-related mortality: **~14 %**
- Clinical interpretation: acceptable transplant risk; standard allo-HCT pathway is appropriate.

---

## Test case 2 — Score 2 (Low risk, upper end)

**Vignette.** Marta Ivanović, a 33-year-old marketing analyst, has acute myeloid leukemia (AML) in CR1. She is transplanted 5 months after diagnosis from a 10/10 HLA-matched unrelated male donor.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| Age | 33 (20–40) | **+1** |
| Disease stage | Early (AML CR1) | 0 |
| Donor type | Unrelated donor | **+1** |
| Donor → recipient sex | Male → Female | 0 |
| Time diagnosis → HCT | CR1 (5 mo) | 0 |

**Computation**

```
Score = 1 + 0 + 1 + 0 + 0 = 2
```

**Expected outcome**

- Score: **2**
- Risk category: **Low** (range 0–2)
- 5-year overall survival: **~55 %**
- 5-year transplant-related mortality: **~26 %**
- Clinical interpretation: acceptable transplant risk; standard allo-HCT pathway is appropriate.

---

## Test case 3 — Score 4 (Intermediate risk)

**Vignette.** Mr. Hiroshi Tanaka, a 52-year-old engineer, has myelodysplastic syndrome that has progressed to RAEB (intermediate-stage). He is transplanted 8 months after diagnosis from a 9/10 HLA-matched unrelated male donor.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| Age | 52 (> 40) | **+2** |
| Disease stage | Intermediate (RAEB) | **+1** |
| Donor type | Unrelated donor | **+1** |
| Donor → recipient sex | Male → Male | 0 |
| Time diagnosis → HCT | ≤ 12 mo (8 mo) | 0 |

**Computation**

```
Score = 2 + 1 + 1 + 0 + 0 = 4
```

**Expected outcome**

- Score: **4**
- Risk category: **Intermediate** (range 3–4)
- 5-year overall survival: **~38 %**
- 5-year transplant-related mortality: **~38 %**
- Clinical interpretation: counsel about substantial mortality risk; consider HCT-CI co-assessment, optimization of modifiable factors, and reduced-intensity conditioning where indicated.

---

## Test case 4 — Score 6 (High risk)

**Vignette.** Mr. Patrick O'Connor, a 56-year-old logistics manager, has chronic myeloid leukemia in accelerated phase (intermediate stage). He is being transplanted 22 months after diagnosis from a 10/10 HLA-matched female unrelated donor.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| Age | 56 (> 40) | **+2** |
| Disease stage | Intermediate (CML accelerated phase) | **+1** |
| Donor type | Unrelated donor | **+1** |
| Donor → recipient sex | Female → Male | **+1** |
| Time diagnosis → HCT | > 12 mo (22 mo, not CR1) | **+1** |

**Computation**

```
Score = 2 + 1 + 1 + 1 + 1 = 6
```

**Expected outcome**

- Score: **6**
- Risk category: **High** (range 5–7)
- 5-year overall survival: **~26 %**
- 5-year transplant-related mortality: **~52 %**
- Clinical interpretation: discuss alternative strategies — clinical-trial enrolment, RIC, alternative graft source, or non-transplant approaches — given <30 % expected 5-year survival.

---

## Test case 5 — Score 7 (maximum, High risk edge case)

**Vignette.** Mr. José Ramírez, a 58-year-old retired chef with refractory AML after two failed induction cycles, is offered allogeneic HSCT 18 months after diagnosis. The only available graft is a 9/10 HLA-mismatched unrelated female donor.

**Inputs**

| Field | Value | Points |
|---|---|---:|
| Age | 58 (> 40) | **+2** |
| Disease stage | Advanced (refractory AML) | **+2** |
| Donor type | Unrelated donor | **+1** |
| Donor → recipient sex | Female → Male | **+1** |
| Time diagnosis → HCT | > 12 mo (18 mo) | **+1** |

**Computation**

```
Score = 2 + 2 + 1 + 1 + 1 = 7   ← maximum
```

**Expected outcome**

- Score: **7** (maximum possible)
- Risk category: **High** (range 5–7)
- 5-year overall survival: **~24 %**
- 5-year transplant-related mortality: **~56 %**
- Clinical interpretation: discuss alternative strategies — trial enrolment, RIC, alternative graft source, non-transplant approaches; combine with HCT-CI and Disease Risk Index. This is the maximum (worst-prognosis) score on the EBMT scale.
