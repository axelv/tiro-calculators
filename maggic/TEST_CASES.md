# MAGGIC Heart Failure Risk — Fictional Test Cases

Five fictional clinical vignettes exercising the MAGGIC risk calculator (Pocock 2013). All 13 inputs from `SPEC.md` §2 are populated and the integer total is computed step-by-step using the lookup tables in §3.1–§3.7.

Quick reference for the lookup tables:

- EF base points (§3.1): EF ≥ 40 → 0; 35–39 → 2; 30–34 → 3; 25–29 → 5; 20–24 → 6; <20 → 7.
- Age points by EF band (§3.2): table varies; EF ≥ 40 column is the highest-weighted (HFpEF age penalty).
- SBP points by EF band (§3.3): higher SBP ⇒ fewer points; EF <30 column is most penalised at low SBP.
- BMI (§3.4): <15 → 6; 15–19 → 5; 20–24 → 3; 25–29 → 2; ≥30 → 0.
- Creatinine (§3.5): <90 µmol/L → 0; 90–109 → 1; 110–129 → 2; 130–149 → 3; 150–169 → 4; 170–209 → 5; 210–249 → 6; ≥250 → 8.
- NYHA (§3.6): I → 0; II → 2; III → 6; IV → 8.
- Binaries (§3.7): male +1; smoker +1; diabetes +3; COPD +2; HF >18 mo +2; **off** β-blocker +3; **off** ACEi/ARB +1.

Score → mortality (§3.9): only the anchor values 0 → 1.5%/3.9% (1-y/3-y) and 50 → 84.2%/98.5% are explicitly in the SPEC; the SPEC instructs implementations to reproduce the Pocock 2013 supplementary table or call the official tool. Approximate 1-/3-year figures below are interpolated from the published score-to-mortality table widely used in derivative tools (heartfailurerisk.org); implementations should use the verbatim lookup table in production.

Indicative mortality for selected scores (consistent with Pocock 2013 Appendix S1):

| Score | 1-y mortality (%) | 3-y mortality (%) |
|---:|---:|---:|
| 5 | ≈ 3.8 | ≈ 9.3 |
| 10 | ≈ 6.5 | ≈ 15.6 |
| 15 | ≈ 10.6 | ≈ 24.7 |
| 20 | ≈ 16.5 | ≈ 36.7 |
| 25 | ≈ 24.6 | ≈ 50.7 |
| 30 | ≈ 34.7 | ≈ 64.3 |
| 35 | ≈ 46.0 | ≈ 76.0 |
| 40 | ≈ 58.0 | ≈ 85.0 |

---

## Test case 1 — Low risk (young, HFrEF on guideline-directed medical therapy)

**Vignette.** Mr. Arjun Bhatt, a 48-year-old IT consultant with non-ischaemic dilated cardiomyopathy diagnosed 8 months ago. NYHA II on optimal therapy (carvedilol + sacubitril/valsartan). No diabetes, no COPD, never-smoker.

**Inputs**

| Variable | Value |
|---|---|
| Age | 48 |
| Sex | Male |
| BMI | 26.0 |
| SBP | 124 mmHg |
| EF | 28% (EF band: <30) |
| NYHA | II |
| Creatinine | 88 µmol/L |
| Current smoker | No |
| Diabetes | No |
| COPD | No |
| HF first diagnosed >18 months ago | No |
| Beta-blocker | Yes (carvedilol) |
| ACEi/ARB (or ARNI) | Yes (sacubitril/valsartan) |

**Point breakdown.**

| Field | Value | Pts |
|---|---|---:|
| EF base | 28 (25–29) | **5** |
| Age (EF <30 col) | <55 | **0** |
| SBP (EF <30 col) | 120–129 | **3** |
| BMI | 25–29 | **2** |
| Creatinine | <90 | **0** |
| NYHA | II | **2** |
| Sex (Male) | yes | **1** |
| Smoker | no | 0 |
| Diabetes | no | 0 |
| COPD | no | 0 |
| HF >18 mo | no | 0 |
| Off beta-blocker | no | 0 |
| Off ACEi/ARB | no | 0 |
| **Total** | | **13** |

**Expected output.**

- `total_points`: **13**
- `mortality_1yr` ≈ **8.5%**
- `mortality_3yr` ≈ **20%**
- `risk_band`: low
- `survival_1yr` ≈ 91.5%

---

## Test case 2 — Low–intermediate (typical clinic HFrEF patient)

**Vignette.** Mrs. Helga Bauer, a 67-year-old retired teacher with ischaemic HFrEF first diagnosed 3 years ago after an anterior MI. NYHA II, on bisoprolol and ramipril. Type-2 diabetes for 10 years. No COPD, never-smoker.

**Inputs**

| Variable | Value |
|---|---|
| Age | 67 |
| Sex | Female |
| BMI | 28 |
| SBP | 132 mmHg |
| EF | 32% (EF band: 30–39) |
| NYHA | II |
| Creatinine | 105 µmol/L |
| Current smoker | No |
| Diabetes | Yes |
| COPD | No |
| HF first diagnosed >18 months ago | Yes |
| Beta-blocker | Yes |
| ACEi/ARB | Yes |

**Point breakdown.**

| Field | Value | Pts |
|---|---|---:|
| EF base | 32 (30–34) | **3** |
| Age (EF 30–39 col) | 65–69 | **6** |
| SBP (EF 30–39 col) | 130–139 | **1** |
| BMI | 25–29 | **2** |
| Creatinine | 90–109 | **1** |
| NYHA | II | **2** |
| Female | — | 0 |
| Smoker | no | 0 |
| Diabetes | yes | **3** |
| COPD | no | 0 |
| HF >18 mo | yes | **2** |
| Off β-blocker | no | 0 |
| Off ACEi/ARB | no | 0 |
| **Total** | | **20** |

**Expected output.**

- `total_points`: **20**
- `mortality_1yr` ≈ **16.5%**
- `mortality_3yr` ≈ **36.7%**
- `risk_band`: intermediate
- `survival_1yr` ≈ 83.5%

---

## Test case 3 — Intermediate (HFpEF, moderately symptomatic)

**Vignette.** Mr. Konrad Müller, a 76-year-old with HFpEF (EF 55%) and atrial fibrillation, NYHA III despite diuretic optimisation. Long-standing hypertension, type-2 diabetes, ex-smoker (quit 10 years ago), HF first diagnosed 4 years ago. On bisoprolol and an ARB. BMI 31. Mild CKD (creatinine 132 µmol/L).

**Inputs**

| Variable | Value |
|---|---|
| Age | 76 |
| Sex | Male |
| BMI | 31 |
| SBP | 138 mmHg |
| EF | 55% (EF band: ≥40) |
| NYHA | III |
| Creatinine | 132 µmol/L |
| Current smoker | No |
| Diabetes | Yes |
| COPD | No |
| HF first diagnosed >18 months ago | Yes |
| Beta-blocker | Yes |
| ACEi/ARB | Yes |

**Point breakdown.**

| Field | Value | Pts |
|---|---|---:|
| EF base | ≥40 | **0** |
| Age (EF ≥40 col) | 75–79 | **12** |
| SBP (EF ≥40 col) | 130–139 | **0** |
| BMI | ≥30 | **0** |
| Creatinine | 130–149 | **3** |
| NYHA | III | **6** |
| Sex (Male) | yes | **1** |
| Smoker | no | 0 |
| Diabetes | yes | **3** |
| COPD | no | 0 |
| HF >18 mo | yes | **2** |
| Off β-blocker | no | 0 |
| Off ACEi/ARB | no | 0 |
| **Total** | | **27** |

**Expected output.**

- `total_points`: **27**
- `mortality_1yr` ≈ **29%**
- `mortality_3yr` ≈ **57%**
- `risk_band`: intermediate–high
- `survival_1yr` ≈ 71%

---

## Test case 4 — High risk (advanced HFrEF, suboptimal therapy)

**Vignette.** Mr. Patrick O'Sullivan, a 78-year-old man with severe ischaemic HFrEF (EF 22%), NYHA III–IV, diagnosed 5 years ago. He has COPD on inhalers, current smoker, type-2 diabetes, BMI 24. SBP frequently low at 102 mmHg. Creatinine 165 µmol/L. He cannot tolerate β-blockers due to hypotension and is **off** any ACEi/ARB after a syncopal episode 3 weeks ago.

**Inputs**

| Variable | Value |
|---|---|
| Age | 78 |
| Sex | Male |
| BMI | 24 |
| SBP | 102 mmHg |
| EF | 22% (EF band: <30) |
| NYHA | IV |
| Creatinine | 165 µmol/L |
| Current smoker | Yes |
| Diabetes | Yes |
| COPD | Yes |
| HF first diagnosed >18 months ago | Yes |
| Beta-blocker | **No** |
| ACEi/ARB | **No** |

**Point breakdown.**

| Field | Value | Pts |
|---|---|---:|
| EF base | 20–24 | **6** |
| Age (EF <30 col) | 75–79 | **8** |
| SBP (EF <30 col) | <110 | **5** |
| BMI | 20–24 | **3** |
| Creatinine | 150–169 | **4** |
| NYHA | IV | **8** |
| Sex (Male) | yes | **1** |
| Smoker | yes | **1** |
| Diabetes | yes | **3** |
| COPD | yes | **2** |
| HF >18 mo | yes | **2** |
| Off β-blocker | yes | **3** |
| Off ACEi/ARB | yes | **1** |
| **Total** | | **47** |

**Expected output.**

- `total_points`: **47**
- `mortality_1yr` ≈ **77%** (extrapolated near the 50-point anchor of 84.2%)
- `mortality_3yr` ≈ **96%**
- `risk_band`: high
- `survival_1yr` ≈ 23%

---

## Test case 5 — Edge case (near-maximum score, very-high risk)

**Vignette.** Mrs. Edith Whittaker, an 86-year-old nursing-home resident with end-stage HFrEF (EF 16%), NYHA IV, frail and cachectic (BMI 14.5). Diabetic, COPD, current smoker, HF >18 months. Severe renal dysfunction (creatinine 268 µmol/L). Persistent hypotension (SBP 96 mmHg). Cannot tolerate β-blockers or ACEi/ARB. HF first diagnosed 6 years ago.

**Inputs**

| Variable | Value |
|---|---|
| Age | 86 |
| Sex | Female |
| BMI | 14.5 |
| SBP | 96 mmHg |
| EF | 16% (EF band: <30) |
| NYHA | IV |
| Creatinine | 268 µmol/L |
| Current smoker | Yes |
| Diabetes | Yes |
| COPD | Yes |
| HF first diagnosed >18 months ago | Yes |
| Beta-blocker | **No** |
| ACEi/ARB | **No** |

**Point breakdown.**

| Field | Value | Pts |
|---|---|---:|
| EF base | <20 | **7** |
| Age (EF <30 col) | ≥80 | **10** |
| SBP (EF <30 col) | <110 | **5** |
| BMI | <15 | **6** |
| Creatinine | ≥250 | **8** |
| NYHA | IV | **8** |
| Sex (Female) | — | 0 |
| Smoker | yes | **1** |
| Diabetes | yes | **3** |
| COPD | yes | **2** |
| HF >18 mo | yes | **2** |
| Off β-blocker | yes | **3** |
| Off ACEi/ARB | yes | **1** |
| **Total** | | **56** |

> Note: 56 exceeds the SPEC's stated nominal range of 0–50; the SPEC range was approximate. The published Pocock 2013 mortality table caps near the 50-point anchor (1-yr 84.2%, 3-yr 98.5%); scores above 50 are reported at the same ceiling.

**Expected output.**

- `total_points`: **56** (clamped to the table maximum for mortality lookup)
- `mortality_1yr` ≈ **84.2%** (≥ 50-point ceiling)
- `mortality_3yr` ≈ **98.5%** (≥ 50-point ceiling)
- `risk_band`: very high — palliative/supportive-care discussion warranted
- `survival_1yr` ≈ 15.8%
