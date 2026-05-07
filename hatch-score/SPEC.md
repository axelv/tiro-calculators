# HATCH Score for AF Recurrence After Cardioversion

A clinical prediction rule estimating the likelihood that a patient with
paroxysmal atrial fibrillation (AF) will progress to persistent AF — and, by
extension, the likelihood of AF recurrence after restoration of sinus rhythm
(e.g. electrical or pharmacological cardioversion). Derived by **De Vos CB et
al.**, *J Am Coll Cardiol* 2010;55(8):725–731, from a 1,219-patient subset of
the Euro Heart Survey on AF observed for one year.

The acronym **HATCH** encodes the five independent predictors:
**H**ypertension · **A**ge >75 · prior **T**IA/stroke · **C**OPD ·
**H**eart failure.

---

## 1. Purpose

HATCH is used by clinicians to:

- **Predict progression** from paroxysmal AF to persistent / sustained AF
  within ~1 year of follow-up.
- **Stratify patients** for the likelihood of AF recurrence after sinus-rhythm
  restoration (e.g. after electrical cardioversion), since the same substrate
  factors that drive progression also drive early relapse.
- **Inform rhythm-vs-rate-control discussions**: a high HATCH score predicts a
  difficult-to-maintain sinus rhythm and may shift the conversation toward
  early acceptance of a rate-control strategy or earlier referral for
  catheter-based therapies.
- Provide a **5-input bedside score** (integer total 0–7) that can be computed
  from clinical history alone — no labs, ECG measurements, or imaging required.

**Patient population** — adults with documented paroxysmal atrial fibrillation,
particularly those undergoing or being considered for cardioversion. The
derivation cohort was the Euro Heart Survey on AF.

**Caveats**

- HATCH was derived to predict **progression to persistent AF**; its use as a
  predictor of post-cardioversion recurrence is supported by subsequent
  observational work but is an **extrapolation** of the original endpoint.
- HATCH performs **poorly** as a predictor of AF recurrence after **catheter
  ablation** and after cavotricuspid-isthmus ablation for typical atrial
  flutter — do not apply it in those settings.
- The score is **clinical only**: it does not incorporate left-atrial size, AF
  duration, BMI, OSA, or biomarkers, all of which independently influence
  recurrence risk. Use HATCH as an adjunct, not a sole decision rule.
- Validation in emergency-department populations with new-onset AF found the
  HATCH score's discrimination diminished (sustained AF developed in ~1 in 5
  patients with HATCH = 0), so calibration outside the Euro Heart Survey
  paroxysmal-AF cohort is uncertain.

---

## 2. Inputs

All inputs are independent binary (yes/no) clinical history items. None
require laboratory values, imaging, or ECG measurements.

| Field key | Display name | Type | Clinical definition |
|---|---|---|---|
| `hypertension` | Hypertension | boolean | Prior diagnosis of hypertension, resting BP > 140/90 mmHg on at least two occasions, or currently on antihypertensive therapy. |
| `age_gt_75` | Age > 75 years | boolean | Patient is **strictly older than 75** years at assessment. (Note: original De Vos definition is "age >75", not "≥75" — implementations should use the strict inequality.) |
| `tia_or_stroke` | Prior TIA or stroke | boolean | Any history of transient ischaemic attack or ischaemic/haemorrhagic stroke. (Systemic thromboembolism is **not** part of the original HATCH definition.) |
| `copd` | Chronic obstructive pulmonary disease | boolean | Documented diagnosis of COPD (chronic bronchitis or emphysema), typically with post-bronchodilator FEV₁/FVC < 0.70, or currently on COPD-directed pharmacotherapy. |
| `heart_failure` | Heart failure | boolean | History of heart failure (any ejection fraction), current signs/symptoms of decompensated HF, or recent HF hospitalisation. |

Implementation note: each input must be strictly boolean. Missing values
should not be silently coerced to `false`; surface a validation error and
require the caller to confirm absence vs. unknown.

---

## 3. Calculation

The HATCH acronym encodes the point weighting:
**H**ypertension (1) · **A**ge >75 (1) · **T**IA/stroke (**2**) ·
**C**OPD (1) · **H**eart failure (**2**).

| Condition | Points if present |
|---|---|
| Hypertension | **+1** |
| Age > 75 years | **+1** |
| Prior TIA / stroke | **+2** |
| COPD | **+1** |
| Heart failure | **+2** |

```
HATCH = hypertension + age_gt_75 + 2 * tia_or_stroke + copd + 2 * heart_failure
```

Total score is an integer in the closed range **[0, 7]**.

---

## 4. Output

### 4.1 Total score

Integer, 0 to 7 inclusive.

### 4.2 Probability of progression to persistent AF

Per De Vos CB et al., *JACC* 2010;55(8):725–731. Overall progression rate in
the cohort was **15% at 1 year**. The original publication reports
progression rates **grouped by score band** (not per individual integer
score):

| HATCH score band | Probability of progression to persistent AF (≈1 year) | Risk band |
|:-:|:-:|:-:|
| 0 | ~ 6 % | Low |
| 1 | ~ 7 % | Low |
| 2 | ~ 14 % | Moderate |
| 3 – 4 | ~ 25 % | High |
| 5 – 7 | ~ 50 % | Very high |

> The De Vos paper presents the relationship as a near-monotonic increase
> across HATCH band, with a steep rise above score 4. The often-quoted
> headline figures are **6 % at HATCH 0** and **~50 % at HATCH > 5**.
> Implementations should display the band-level probability and note that
> the original publication did not publish a full per-integer table.

### 4.3 Clinical interpretation

The original publication did **not** prescribe a treatment algorithm; the
suggestions below summarise common clinical use of HATCH at the bedside.
Defer to current local guidelines for definitive management.

| HATCH score | Risk category | Suggested clinical interpretation |
|:-:|---|---|
| 0 – 1 | Low | Low likelihood of progression to persistent AF; rhythm-control strategies (including cardioversion) are reasonable, with a high probability of maintaining sinus rhythm. |
| 2 | Moderate | Intermediate progression risk; rhythm control is still reasonable but counsel the patient that recurrence is meaningfully possible. |
| 3 – 4 | High | High progression risk; expect a meaningful chance of recurrence after cardioversion. Consider antiarrhythmic prophylaxis, aggressive risk-factor modification, and earlier referral for catheter ablation in symptomatic patients. |
| 5 – 7 | Very high | Very high progression risk (~50 % within 1 year). Sinus-rhythm maintenance is unlikely with conservative measures; weigh the burden of repeat cardioversions against an early rate-control strategy. |

In every case, decisions should be paired with stroke-risk assessment
(CHA₂DS₂-VASc) and bleeding-risk assessment (HAS-BLED, ORBIT) and the
patient's preferences.

### 4.4 Output schema (implementation reference)

```json
{
  "score": 3,
  "max_score": 7,
  "progression_probability_band": "high",
  "progression_probability_estimate_percent": 25,
  "interpretation": "High progression risk; consider antiarrhythmic prophylaxis or early referral for ablation."
}
```

---

## 5. References

1. **De Vos CB, Pisters R, Nieuwlaat R, Prins MH, Tieleman RG, Coelen RJ,
   van den Heijkant AC, Allessie MA, Crijns HJGM.** Progression from
   paroxysmal to persistent atrial fibrillation: clinical correlates and
   prognosis. *J Am Coll Cardiol.* 2010;55(8):725–731.
   doi:10.1016/j.jacc.2009.11.040. PMID: 20170808.
   https://www.jacc.org/doi/10.1016/j.jacc.2009.11.040

2. **Jahangir A, Murarka S.** Progression of paroxysmal to persistent atrial
   fibrillation: factors promoting the HATCH score [editorial].
   *J Am Coll Cardiol.* 2010;55(8):732–734.
   doi:10.1016/j.jacc.2009.12.010. PMID: 20170809.
   https://www.jacc.org/doi/10.1016/j.jacc.2009.12.010

3. **MDCalc — HATCH Score for Atrial Fibrillation Recurrence After
   Cardioversion.**
   https://www.mdcalc.com/calc/2056/hatch-score-atrial-fibrillation-recurrence-cardioversion

4. **Barrett TW, Self WH, Wasserman BS, McNaughton CD, Darbar D.**
   Evaluating the HATCH score for predicting progression to sustained atrial
   fibrillation in ED patients with new atrial fibrillation.
   *Am J Emerg Med.* 2013;31(5):792–797. doi:10.1016/j.ajem.2013.01.020.
   PMC: PMC3655117.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC3655117/
   *(External validation in an emergency-department cohort; performance
   diminished outside the original paroxysmal-AF setting.)*

5. **Suenari K, Chao T-F, Liu C-J, Kihara Y, Chen T-J, Chen S-A.**
   Usefulness of HATCH score in the prediction of new-onset atrial
   fibrillation for Asians.
   *Medicine (Baltimore).* 2017;96(1):e5597.
   doi:10.1097/MD.0000000000005597. PMC: PMC5228657.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC5228657/

6. **Maskoun W, Pino MI, Ayoub K, Llanos OL, Almomani A, Nairooz R,
   Hakeem A, Miller J.** Clinical scores for outcomes of rhythm control or
   arrhythmia progression in patients with atrial fibrillation: a systematic
   review. *Pacing Clin Electrophysiol.* 2017;40(9):1054–1060.
   PMC: PMC5613037.
   https://pmc.ncbi.nlm.nih.gov/articles/PMC5613037/
   *(Systematic review summarising HATCH and competing scores.)*
