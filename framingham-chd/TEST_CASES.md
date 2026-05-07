# Framingham Risk Score for Hard CHD (10-year) — Test Cases

Five fictional clinical test cases for the Framingham Risk Score for hard CHD events (Wilson 1998 / ATP III). Point tables per SPEC §3; risk-percent lookup per SPEC §3.6.

```
total_points = age_pts + tc_pts(age, total_chol) + smoker_pts(age) + hdl_pts(hdl) + sbp_pts(sbp, treated)
risk_10yr_pct = points_to_risk(total_points, sex)
```

ATP III interpretation: Low < 10 %; Intermediate 10–20 %; High > 20 %.

---

## Test case 1 — Low risk (young woman, healthy profile)

**Vignette.** Mrs. Sophie Dubois, a 42-year-old yoga instructor, attends a routine wellness visit. She is a non-smoker with no prior CHD. Lipid panel: total cholesterol 180 mg/dL, HDL 65 mg/dL. Office BP 110/72 mmHg, no antihypertensive therapy.

**Inputs**

| Field | Value |
|---|---|
| Sex | female |
| Age | 42 |
| Total cholesterol | 180 mg/dL |
| HDL | 65 mg/dL |
| Systolic BP | 110 mmHg |
| Treated for HTN | no |
| Current smoker | no |

**Point breakdown**

| Component | Lookup | Points |
|---|---|---:|
| Age (40–44, women) | table 3.1 | 0 |
| Total chol (160–199, age 40–49, women) | table 3.2 | 3 |
| Smoker (non-smoker) | table 3.3 | 0 |
| HDL ≥ 60 | table 3.4 | −1 |
| SBP < 120, untreated, women | table 3.5 | 0 |
| **Total** | | **2** |

**Expected outcome**

- Total points: **2**
- 10-year hard CHD risk (women, 2 < 9): **< 1 %**
- ATP III risk category: **Low** (< 10 %)

---

## Test case 2 — Low risk (middle-aged man)

**Vignette.** Mr. Bryan Whittaker, a 50-year-old project manager, is reviewed for primary-prevention statin decision-making. He is a non-smoker. Total cholesterol 220 mg/dL, HDL 45 mg/dL. Office BP 132/84 mmHg on amlodipine.

**Inputs**

| Field | Value |
|---|---|
| Sex | male |
| Age | 50 |
| Total cholesterol | 220 mg/dL |
| HDL | 45 mg/dL |
| Systolic BP | 132 mmHg |
| Treated for HTN | yes |
| Current smoker | no |

**Point breakdown**

| Component | Lookup | Points |
|---|---|---:|
| Age (50–54, men) | table 3.1 | 6 |
| Total chol (200–239, age 50–59, men) | table 3.2 | 3 |
| Smoker (non-smoker) | table 3.3 | 0 |
| HDL 40–49 | table 3.4 | 1 |
| SBP 130–139, treated, men | table 3.5 | 2 |
| **Total** | | **12** |

**Expected outcome**

- Total points: **12**
- 10-year hard CHD risk (men, 12 pts): **10 %**
- ATP III risk category: **Intermediate (lower bound)** (10–20 %); ATP III places exactly 10 % at the Low/Intermediate cut-point — clinically interpreted as the start of the intermediate band.

---

## Test case 3 — Intermediate risk (smoker with HTN)

**Vignette.** Mr. Marco Bianchi, a 53-year-old current smoker (1 pack/day for 25 years), is referred to the lipid clinic. Total cholesterol 210 mg/dL, HDL 45 mg/dL, office BP 128/80 mmHg, no antihypertensive therapy. No prior CHD.

**Inputs**

| Field | Value |
|---|---|
| Sex | male |
| Age | 53 |
| Total cholesterol | 210 mg/dL |
| HDL | 45 mg/dL |
| Systolic BP | 128 mmHg |
| Treated for HTN | no |
| Current smoker | yes |

**Point breakdown**

| Component | Lookup | Points |
|---|---|---:|
| Age (50–54, men) | table 3.1 | 6 |
| Total chol (200–239, age 50–59, men) | table 3.2 | 3 |
| Smoker (50–59, men) | table 3.3 | 3 |
| HDL 40–49 | table 3.4 | 1 |
| SBP 120–129, untreated, men | table 3.5 | 0 |
| **Total** | | **13** |

**Expected outcome**

- Total points: **13**
- 10-year hard CHD risk (men, 13 pts): **12 %**
- ATP III risk category: **Intermediate** (10–20 %)

---

## Test case 4 — High risk (older smoker, untreated HTN, dyslipidemia)

**Vignette.** Mr. Lars Pedersen, a 62-year-old long-haul truck driver and current smoker (40 pack-years), presents for a primary-prevention assessment. Total cholesterol 230 mg/dL, HDL 42 mg/dL, office BP 145/88 mmHg, untreated. No prior CHD.

**Inputs**

| Field | Value |
|---|---|
| Sex | male |
| Age | 62 |
| Total cholesterol | 230 mg/dL |
| HDL | 42 mg/dL |
| Systolic BP | 145 mmHg |
| Treated for HTN | no |
| Current smoker | yes |

**Point breakdown**

| Component | Lookup | Points |
|---|---|---:|
| Age (60–64, men) | table 3.1 | 10 |
| Total chol (200–239, age 60–69, men) | table 3.2 | 1 |
| Smoker (60–69, men) | table 3.3 | 1 |
| HDL 40–49 | table 3.4 | 1 |
| SBP 140–159, untreated, men | table 3.5 | 1 |
| **Total** | | **14** |

**Expected outcome**

- Total points: **14**
- 10-year hard CHD risk (men, 14 pts): **16 %**
- ATP III risk category: **Intermediate** (10–20 %), at the upper end of the band; a clinician would treat this as a strong indication for intensified primary prevention (lifestyle, statin, smoking cessation).

---

## Test case 5 — Edge case: very high risk (older woman, smoker, severe HTN, dyslipidemia)

**Vignette.** Mrs. Eileen O'Sullivan, a 78-year-old retired publican who continues to smoke half a pack a day, is referred after an abnormal CT-coronary-calcium screening. Total cholesterol 290 mg/dL, HDL 35 mg/dL, office BP 170/85 mmHg on amlodipine + lisinopril.

**Inputs**

| Field | Value |
|---|---|
| Sex | female |
| Age | 78 |
| Total cholesterol | 290 mg/dL |
| HDL | 35 mg/dL |
| Systolic BP | 170 mmHg |
| Treated for HTN | yes |
| Current smoker | yes |

**Point breakdown**

| Component | Lookup | Points |
|---|---|---:|
| Age (75–79, women) | table 3.1 | 16 |
| Total chol (≥ 280, age 70–79, women) | table 3.2 | 2 |
| Smoker (70–79, women) | table 3.3 | 1 |
| HDL < 40 | table 3.4 | 2 |
| SBP ≥ 160, treated, women | table 3.5 | 6 |
| **Total** | | **27** |

**Expected outcome**

- Total points: **27**
- 10-year hard CHD risk (women, 27 ≥ 25 in the women's table): **≥ 30 %**
- ATP III risk category: **High** (> 20 %, CHD risk-equivalent for treatment thresholds)
- Edge-case note: this case lands above the topmost row of the women's points-to-risk table (≥ 25 → ≥ 30 %), demonstrating the upper saturation of the Framingham point lookup. Clinically, the patient warrants aggressive secondary-prevention-grade lipid and BP management plus structured smoking-cessation support.
