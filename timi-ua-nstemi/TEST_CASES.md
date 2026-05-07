# TIMI Risk Score for UA / NSTEMI — Test Cases

Five fictional clinical test cases for the TIMI Risk Score for Unstable
Angina / NSTEMI (Antman 2000). Range 0–7, each criterion +1.

14-day composite endpoint (death, MI, urgent revascularisation):

| Score | 14-day rate | Risk band |
|---|---|---|
| 0–1 | 4.7 % | Low |
| 2 | 8.3 % | Low |
| 3 | 13.2 % | Intermediate |
| 4 | 19.9 % | Intermediate |
| 5 | 26.2 % | High |
| 6–7 | 40.9 % | High |

Criteria: age ≥65; ≥3 CAD risk factors; known CAD ≥50 % stenosis; ASA in
past 7 d; ≥2 anginal episodes in 24 h; ST-deviation ≥0.5 mm; positive
biomarker.

---

## Test case 1 — Lowest risk (score 0)

**Vignette.** Yuki Tanaka, a 38-year-old female schoolteacher, presents
with a single brief episode of atypical chest discomfort. No CAD risk
factors, no prior CAD, no recent aspirin use, ECG normal, hs-cTn negative.

**Inputs:**

| Criterion | Value | Points |
|---|---|---|
| Age ≥65 | no | 0 |
| ≥3 CAD risk factors | no | 0 |
| Known CAD ≥50 % stenosis | no | 0 |
| ASA in past 7 d | no | 0 |
| ≥2 anginal episodes in 24 h | no (1 episode) | 0 |
| ST-deviation ≥0.5 mm | no | 0 |
| Positive biomarker | no | 0 |

**Total score: 0**

**Expected output:**
- Score: **0**
- 14-day composite event rate: **4.7 %** (0–1 bucket)
- Risk band: **Low** — initial conservative (medical) strategy; reassess if
  symptoms recur or biomarkers evolve. Note the lowest band still carries
  ~5 % event risk — risk is low but not zero.

---

## Test case 2 — Low (score 2)

**Vignette.** Imani Okafor, a 54-year-old woman with hypertension and
hypercholesterolaemia, on aspirin 81 mg daily for primary prevention. No
diabetes, no family history, non-smoker. She presents reporting two
separate episodes of exertional chest tightness over the past 24 h. ECG
normal; hs-cTn negative.

**Inputs:**

| Criterion | Value | Points |
|---|---|---|
| Age ≥65 | no (54) | 0 |
| ≥3 CAD risk factors | HTN + chol (2) | 0 |
| Known CAD ≥50 % stenosis | no | 0 |
| ASA in past 7 d | yes | 1 |
| ≥2 anginal episodes in 24 h | yes | 1 |
| ST-deviation ≥0.5 mm | no | 0 |
| Positive biomarker | no | 0 |

**Total score: 2**

**Expected output:**
- Score: **2**
- 14-day composite event rate: **8.3 %**
- Risk band: **Low** — initial conservative strategy reasonable; serial
  troponin, antiplatelet therapy, and risk-factor modification.

---

## Test case 3 — Intermediate (score 4)

**Vignette.** Henry Whitaker, a 67-year-old male with hypertension,
hypercholesterolaemia, and type 2 diabetes (no prior PCI/MI and no prior
coronary angiography). He is not on aspirin or any antiplatelet at baseline.
He presents with three anginal episodes in the past 24 h. ECG shows no
ST-segment deviation. Initial hs-cTn 22 ng/L (positive).

**Inputs:**

| Criterion | Value | Points |
|---|---|---|
| Age ≥65 | yes (67) | 1 |
| ≥3 CAD risk factors | HTN + chol + DM (3) | 1 |
| Known CAD ≥50 % stenosis | no | 0 |
| ASA in past 7 d | no | 0 |
| ≥2 anginal episodes in 24 h | yes (3) | 1 |
| ST-deviation ≥0.5 mm | no | 0 |
| Positive biomarker | yes (hs-cTn 22 ng/L) | 1 |

**Total score: 4**

**Expected output:**
- Score: **4**
- 14-day composite event rate: **19.9 %**
- Risk band: **Intermediate** — consider an early invasive strategy
  (coronary angiography within 24–72 h); LMWH and GP IIb/IIIa inhibition
  carry greater absolute benefit than in low-risk patients.

---

## Test case 4 — High risk (score 6)

**Vignette.** Robert Kavanagh, a 74-year-old man with hypertension,
hypercholesterolaemia, type 2 diabetes, current smoker, prior coronary
angiogram showing 70 % LAD stenosis (no PCI). On daily aspirin. Today he
reports four episodes of rest angina over the past 18 h. ECG shows 1.5 mm
ST depression in II/III/aVF. Serial hs-cTn remains below the 99th-percentile
upper reference limit (negative).

**Inputs:**

| Criterion | Value | Points |
|---|---|---|
| Age ≥65 | yes (74) | 1 |
| ≥3 CAD risk factors | HTN + chol + DM + smoking (4) | 1 |
| Known CAD ≥50 % stenosis | yes (70 % LAD) | 1 |
| ASA in past 7 d | yes | 1 |
| ≥2 anginal episodes in 24 h | yes (4) | 1 |
| ST-deviation ≥0.5 mm | yes (1.5 mm) | 1 |
| Positive biomarker | no (hs-cTn negative) | 0 |

**Total score: 6**

**Expected output:**
- Score: **6**
- 14-day composite event rate: **40.9 %** (6–7 bucket)
- Risk band: **High** — early invasive strategy (angiography typically
  within 24 h) preferred; aggressive antithrombotic regimen.

---

## Test case 5 — Maximum score (edge case, score 7)

**Vignette.** Eleanor Pritchard, an 81-year-old woman with hypertension,
hypercholesterolaemia, type 2 diabetes, family history of premature CAD
(brother MI at 48), prior PCI of the RCA with documented 80 % stenosis on
angiography. On daily aspirin. She presents with five episodes of rest
angina over the past 12 h. ECG shows 2 mm horizontal ST depression in
V4–V6. hs-cTn 110 ng/L (positive).

**Inputs:**

| Criterion | Value | Points |
|---|---|---|
| Age ≥65 | yes (81) | 1 |
| ≥3 CAD risk factors | HTN + chol + DM + FHx (4) | 1 |
| Known CAD ≥50 % stenosis | yes (80 % RCA) | 1 |
| ASA in past 7 d | yes | 1 |
| ≥2 anginal episodes in 24 h | yes (5) | 1 |
| ST-deviation ≥0.5 mm | yes (2 mm) | 1 |
| Positive biomarker | yes (110 ng/L) | 1 |

**Total score: 7 (maximum possible)**

**Expected output:**
- Score: **7**
- 14-day composite event rate: **40.9 %** (6–7 bucket)
- Risk band: **High** — early invasive strategy mandated; aggressive
  guideline-directed antithrombotic therapy. This represents the
  upper-bound presentation in the original derivation cohort.
