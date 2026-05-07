# PCP-HF — Fictional Test Cases

Five fictional clinical test cases for the **Pooled Cohort Equations to Prevent
Heart Failure** (PCP-HF) 10-year incident-HF risk score. Cases span low,
borderline, intermediate, and high risk strata, with at least one edge case
(extreme high risk and a young low-risk minimum). All patients, demographics,
and lab values are illustrative.

The expected risk is computed strictly from the SPEC.md formula:

```
Risk_10yr = 1 − S0(10) ^ exp( IndividualSum − MeanCV )
```

Each case shows the per-term contributions, `IndividualSum`, the centred
exponent `exp(sum − MeanCV)`, and the resulting risk.

---

## Test case 1 — Young White Female, optimal profile, Low risk

### Vignette
**Emma Verhoeven**, a 35-year-old white non-Hispanic woman who runs marathons,
non-smoker, lean, normotensive, with optimal lipids and a normal ECG. Comes in
for a baseline preventive risk assessment.

### Inputs

| Field | Value |
|---|---|
| Sex | Female |
| Race | White |
| Age | 35 yr |
| SBP | 110 mmHg |
| On antihypertensive | No |
| Current smoker | No |
| Fasting glucose | 86 mg/dL |
| On DM medication | No |
| Total cholesterol | 170 mg/dL |
| HDL | 70 mg/dL |
| BMI | 21.5 kg/m² |
| QRS duration | 88 ms |

### Calculation (White Female coefficients; S0 = 0.99348; MeanCV = 99.73)

| Term | Coeff | Value | Contribution |
|---|---:|---:|---:|
| ln(Age) [ln 35 = 3.5553] | 20.55 | 3.5553 | 73.062 |
| ln(SBP_untreated) [ln 110 = 4.7005] | 11.86 | 4.7005 | 55.748 |
| ln(Age) × ln(SBP_untreated) | −2.73 | 16.7106 | −45.620 |
| Smoker | 11.02 | 0 | 0 |
| ln(Age) × Smoker | −2.50 | 0 | 0 |
| ln(Glu_untreated) [ln 86 = 4.4543] | 0.91 | 4.4543 | 4.053 |
| ln(HDL) [ln 70 = 4.2485] | −0.07 | 4.2485 | −0.297 |
| ln(BMI) [ln 21.5 = 3.0681] | 1.33 | 3.0681 | 4.081 |
| ln(QRS) [ln 88 = 4.4773] | 1.06 | 4.4773 | 4.746 |

(Total cholesterol coefficient is `—` for white females → omitted.
ln(Age)² is `—` for white females → omitted.
ln(Age)×ln(BMI) is `—` for white females → omitted.)

**IndividualSum ≈ 73.062 + 55.748 − 45.620 + 0 + 0 + 4.053 − 0.297 + 4.081 + 4.746 ≈ 95.773**

`Sum − MeanCV = 95.773 − 99.73 = −3.957`
`exp(−3.957) ≈ 0.01908`
`Risk = 1 − 0.99348^0.01908 ≈ 1 − 0.999875 ≈ 0.000125`

**Expected risk_10yr_hf ≈ 0.01% → Low (< 5%)**

---

## Test case 2 — Middle-aged White Male, average profile, Borderline

### Vignette
**Daniel Foster**, a 55-year-old non-Hispanic white man, former smoker (counts
as non-current), modest hypertension on lisinopril, BMI 28, mildly elevated
glucose without diabetes. ECG normal.

### Inputs

| Field | Value |
|---|---|
| Sex | Male |
| Race | White |
| Age | 55 yr |
| SBP | 138 mmHg |
| On antihypertensive | Yes |
| Current smoker | No |
| Fasting glucose | 102 mg/dL |
| On DM medication | No |
| Total cholesterol | 200 mg/dL |
| HDL | 45 mg/dL |
| BMI | 28 kg/m² |
| QRS duration | 96 ms |

### Calculation (White Male; S0 = 0.98752; MeanCV = 171.5)

`ln(55) = 4.0073`; `(ln 55)² = 16.0588`; `ln(138) = 4.9273`;
`ln(102) = 4.6250`; `ln(200) = 5.2983`; `ln(45) = 3.8067`;
`ln(28) = 3.3322`; `ln(96) = 4.5643`.

| Term | Coeff | Value | Contribution |
|---|---:|---:|---:|
| ln(Age) | 41.94 | 4.0073 | 168.066 |
| ln(Age)² | −0.88 | 16.0588 | −14.132 |
| ln(SBP_treated) | 1.03 | 4.9273 | 5.075 |
| ln(SBP_untreated) | — | — | 0 |
| Smoker | 0.74 | 0 | 0 |
| ln(Glu_untreated) | 0.78 | 4.6250 | 3.608 |
| ln(TC) | 0.49 | 5.2983 | 2.596 |
| ln(HDL) | −0.44 | 3.8067 | −1.675 |
| ln(BMI) | 37.20 | 3.3322 | 123.958 |
| ln(Age)×ln(BMI) | −8.83 | 13.3522 | −117.900 |
| ln(QRS) | 0.63 | 4.5643 | 2.875 |

**IndividualSum ≈ 168.066 − 14.132 + 5.075 + 3.608 + 2.596 − 1.675 + 123.958 − 117.900 + 2.875 ≈ 172.471**

`Sum − MeanCV = 172.471 − 171.5 = 0.971`
`exp(0.971) ≈ 2.640`
`Risk = 1 − 0.98752^2.640 ≈ 1 − 0.96731 ≈ 0.0327`

**Expected risk_10yr_hf ≈ 3.3% → Low (< 5%) (close to borderline)**

---

## Test case 3 — Black Female, hypertension on treatment, Borderline–Intermediate

### Vignette
**Tasha Williams**, a 60-year-old Black woman with treated hypertension on
amlodipine, current smoker, BMI 30. No diabetes. Normal ECG.

### Inputs

| Field | Value |
|---|---|
| Sex | Female |
| Race | Black |
| Age | 60 yr |
| SBP | 145 mmHg |
| On antihypertensive | Yes |
| Current smoker | Yes |
| Fasting glucose | 95 mg/dL |
| On DM medication | No |
| Total cholesterol | 210 mg/dL |
| HDL | 50 mg/dL |
| BMI | 30 kg/m² |
| QRS duration | 92 ms |

### Calculation (Black Female; S0 = 0.99260; MeanCV = 233.9)

`ln(60) = 4.0943`; `ln(145) = 4.9767`; `ln(95) = 4.5539`;
`ln(210) = 5.3471`; `ln(30) = 3.4012`; `ln(92) = 4.5218`.

| Term | Coeff | Value | Contribution |
|---|---:|---:|---:|
| ln(Age) | 51.75 | 4.0943 | 211.880 |
| ln(SBP_treated) | 29.0 | 4.9767 | 144.324 |
| ln(Age)×ln(SBP_treated) | −6.59 | 20.3784 | −134.293 |
| Smoker | 0.76 | 1 | 0.760 |
| ln(Glu_untreated) | 0.80 | 4.5539 | 3.643 |
| ln(TC) | 0.32 | 5.3471 | 1.711 |
| ln(BMI) | 21.24 | 3.4012 | 72.241 |
| ln(Age)×ln(BMI) | −5.0 | 13.9237 | −69.619 |
| ln(QRS) | 1.27 | 4.5218 | 5.743 |

(`ln(HDL)` and `ln(Age)×Smoker` are `—` for Black females → omitted.)

**IndividualSum ≈ 211.880 + 144.324 − 134.293 + 0.760 + 3.643 + 1.711 + 72.241 − 69.619 + 5.743 ≈ 236.390**

`Sum − MeanCV = 236.390 − 233.9 = 2.490`
`exp(2.490) ≈ 12.058`
`Risk = 1 − 0.99260^12.058 ≈ 1 − 0.91428 ≈ 0.0857`

**Expected risk_10yr_hf ≈ 8.6% → Borderline (5% to < 10%)**

---

## Test case 4 — Older Black Male, multiple risk factors, Intermediate–High

### Vignette
**Marcus Johnson**, a 68-year-old Black man with treated hypertension and
type 2 diabetes on metformin, current smoker, BMI 32, normal ECG.

### Inputs

| Field | Value |
|---|---|
| Sex | Male |
| Race | Black |
| Age | 68 yr |
| SBP | 150 mmHg |
| On antihypertensive | Yes |
| Current smoker | Yes |
| Fasting glucose | 165 mg/dL |
| On DM medication | Yes |
| Total cholesterol | 220 mg/dL |
| HDL | 38 mg/dL |
| BMI | 32 kg/m² |
| QRS duration | 100 ms |

### Calculation (Black Male; S0 = 0.98295; MeanCV = 28.73)

`ln(68) = 4.2195`; `ln(150) = 5.0106`; `ln(165) = 5.1059`;
`ln(38) = 3.6376`; `ln(32) = 3.4657`; `ln(100) = 4.6052`.

| Term | Coeff | Value | Contribution |
|---|---:|---:|---:|
| ln(Age) | 2.88 | 4.2195 | 12.152 |
| ln(SBP_treated) | 2.31 | 5.0106 | 11.575 |
| Smoker | 1.66 | 1 | 1.660 |
| ln(Age)×Smoker | −0.25 | 4.2195 | −1.055 |
| ln(Glu_treated) | 0.64 | 5.1059 | 3.268 |
| ln(HDL) | −0.81 | 3.6376 | −2.946 |
| ln(BMI) | 1.16 | 3.4657 | 4.020 |
| ln(QRS) | 0.73 | 4.6052 | 3.362 |

(`ln(Age)²`, `ln(Age)×ln(SBP_*)`, `ln(TC)`, `ln(Age)×ln(BMI)` are `—` for Black males → omitted.)

**IndividualSum ≈ 12.152 + 11.575 + 1.660 − 1.055 + 3.268 − 2.946 + 4.020 + 3.362 ≈ 32.036**

`Sum − MeanCV = 32.036 − 28.73 = 3.306`
`exp(3.306) ≈ 27.276`
`Risk = 1 − 0.98295^27.276 ≈ 1 − 0.62665 ≈ 0.3733`

**Expected risk_10yr_hf ≈ 37% → High (≥ 20%)**

---

## Test case 5 — Older White Male, severe risk profile, Very High (high-end edge)

### Vignette
**Walter Bergmann**, a 78-year-old non-Hispanic white man, current smoker,
treated hypertension, type 2 diabetes on insulin, BMI 34, low HDL, prolonged
QRS at 130 ms (LBBB-like) on ECG. He has not yet had a CV event.

### Inputs

| Field | Value |
|---|---|
| Sex | Male |
| Race | White |
| Age | 78 yr |
| SBP | 165 mmHg |
| On antihypertensive | Yes |
| Current smoker | Yes |
| Fasting glucose | 180 mg/dL |
| On DM medication | Yes |
| Total cholesterol | 240 mg/dL |
| HDL | 32 mg/dL |
| BMI | 34 kg/m² |
| QRS duration | 130 ms |

### Calculation (White Male; S0 = 0.98752; MeanCV = 171.5)

`ln(78) = 4.3567`; `(ln 78)² = 18.9809`; `ln(165) = 5.1059`;
`ln(180) = 5.1930`; `ln(240) = 5.4806`; `ln(32) = 3.4657`;
`ln(34) = 3.5264`; `ln(130) = 4.8675`.

| Term | Coeff | Value | Contribution |
|---|---:|---:|---:|
| ln(Age) | 41.94 | 4.3567 | 182.720 |
| ln(Age)² | −0.88 | 18.9809 | −16.703 |
| ln(SBP_treated) | 1.03 | 5.1059 | 5.259 |
| Smoker | 0.74 | 1 | 0.740 |
| ln(Glu_treated) | 0.90 | 5.1930 | 4.674 |
| ln(TC) | 0.49 | 5.4806 | 2.685 |
| ln(HDL) | −0.44 | 3.4657 | −1.525 |
| ln(BMI) | 37.20 | 3.5264 | 131.182 |
| ln(Age)×ln(BMI) | −8.83 | 15.3636 | −135.660 |
| ln(QRS) | 0.63 | 4.8675 | 3.067 |

**IndividualSum ≈ 182.720 − 16.703 + 5.259 + 0.740 + 4.674 + 2.685 − 1.525 + 131.182 − 135.660 + 3.067 ≈ 176.439**

`Sum − MeanCV = 176.439 − 171.5 = 4.939`
`exp(4.939) ≈ 139.72`
`Risk = 1 − 0.98752^139.72 ≈ 1 − e^(139.72 · ln 0.98752) = 1 − e^(139.72 · −0.012558) = 1 − e^(−1.7546) ≈ 1 − 0.1730 ≈ 0.8270`

**Expected risk_10yr_hf ≈ 83% → High (≥ 20%); essentially saturating the score**

> Note: PCP-HF is most stable in middle-age; very high predicted values like
> this should prompt a clinical review and shared decision-making rather than
> mechanical interpretation.
