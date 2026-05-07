# HATCH Score — Fictional Test Cases

Five fictional clinical vignettes for the HATCH score (De Vos 2010), which
predicts progression from paroxysmal to persistent AF (and, by extension,
recurrence after cardioversion). Scoring uses the point weights and
band-level probabilities from `SPEC.md` §3 and §4.2.

All patients and details are fictional.

---

## Test case 1 — HATCH 0 (low risk)

**Vignette.** Sven Eriksen, a 54-year-old recreational marathon runner with
new-onset paroxysmal AF (lone AF), no comorbidities, scheduled for elective
electrical cardioversion. BMI 22, normotensive, no respiratory disease, no
prior CVA/TIA, no heart-failure history.

**Inputs**

| Field | Value |
|---|---|
| `hypertension` | false |
| `age_gt_75` | false |
| `tia_or_stroke` | false |
| `copd` | false |
| `heart_failure` | false |

**Point breakdown:** 0 + 0 + 2·0 + 0 + 2·0 = **0**

**Expected output**

- Score: 0
- Risk band: **Low**
- Probability of progression to persistent AF (≈ 1 yr): ~6 %
- Interpretation: low likelihood of progression; rhythm-control strategies
  (including cardioversion) reasonable, with a high probability of
  maintaining sinus rhythm.

---

## Test case 2 — HATCH 1 (low risk)

**Vignette.** Mrs Margaret O'Brien, a 67-year-old woman with paroxysmal AF
and well-controlled hypertension on perindopril. She has no other
comorbidities and is being considered for pharmacological cardioversion
with flecainide.

**Inputs**

| Field | Value |
|---|---|
| `hypertension` | true |
| `age_gt_75` | false (67) |
| `tia_or_stroke` | false |
| `copd` | false |
| `heart_failure` | false |

**Point breakdown:** 1 + 0 + 2·0 + 0 + 2·0 = **1**

**Expected output**

- Score: 1
- Risk band: **Low**
- Probability of progression: ~7 %
- Interpretation: low progression risk; rhythm control reasonable with a
  high probability of sustained sinus rhythm.

---

## Test case 3 — HATCH 2 (moderate risk)

**Vignette.** Mr Karl Becker, a 78-year-old retired carpenter, has long-
standing hypertension and now paroxysmal AF picked up on a wearable. No
respiratory disease, no prior cerebrovascular event, no heart failure.
He is debating cardioversion vs rate control.

**Inputs**

| Field | Value |
|---|---|
| `hypertension` | true |
| `age_gt_75` | true (78 > 75) |
| `tia_or_stroke` | false |
| `copd` | false |
| `heart_failure` | false |

**Point breakdown:** 1 + 1 + 2·0 + 0 + 2·0 = **2**

**Expected output**

- Score: 2
- Risk band: **Moderate**
- Probability of progression: ~14 %
- Interpretation: intermediate risk; rhythm control still reasonable, but
  counsel the patient that recurrence is meaningfully possible.

---

## Test case 4 — HATCH 4 (high risk)

**Vignette.** Mrs Beatriz Lopes, a 72-year-old former smoker with
hypertension, GOLD-stage 2 COPD on tiotropium, NYHA II heart failure
(LVEF 40 %), and paroxysmal AF. No prior stroke or TIA. Symptomatic
palpitations limit her exercise tolerance.

**Inputs**

| Field | Value |
|---|---|
| `hypertension` | true |
| `age_gt_75` | false (72) |
| `tia_or_stroke` | false |
| `copd` | true |
| `heart_failure` | true |

**Point breakdown:** 1 + 0 + 2·0 + 1 + 2·1 = **4**

**Expected output**

- Score: 4
- Risk band: **High**
- Probability of progression: ~25 %
- Interpretation: high progression risk; expect a meaningful chance of
  recurrence after cardioversion. Consider antiarrhythmic prophylaxis
  (avoid flecainide given structural heart disease — amiodarone or
  dronedarone where appropriate), aggressive risk-factor modification,
  and earlier discussion of catheter ablation.

---

## Test case 5 — HATCH 7 (maximum, very high risk)

**Vignette.** Mr Henrik Larsson, an 82-year-old man with longstanding
hypertension, severe COPD on long-term oxygen therapy, prior ischaemic
stroke 4 years ago (residual mild left hemiparesis), and chronic heart
failure with reduced ejection fraction (LVEF 28 %, NYHA III). He
presents with another paroxysm of symptomatic AF; his cardiologist asks
about the value of further cardioversions.

**Inputs**

| Field | Value |
|---|---|
| `hypertension` | true |
| `age_gt_75` | true (82 > 75) |
| `tia_or_stroke` | true |
| `copd` | true |
| `heart_failure` | true |

**Point breakdown:** 1 + 1 + 2·1 + 1 + 2·1 = **7** (maximum)

**Expected output**

- Score: 7
- Risk band: **Very high**
- Probability of progression: ~50 %
- Interpretation: very high progression risk; sinus-rhythm maintenance is
  unlikely with conservative measures. Weigh the burden of repeat
  cardioversions against an early rate-control strategy. Pair with
  CHA₂DS₂-VASc and HAS-BLED for stroke/bleeding decisions; Mr Larsson
  has clear indications for ongoing oral anticoagulation regardless.

---

*Probabilities and risk-band labels follow De Vos 2010 (Euro Heart Survey
on AF) as reproduced in `SPEC.md` §4.2.*
