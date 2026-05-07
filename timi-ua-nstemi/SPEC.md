# TIMI Risk Score for Unstable Angina / NSTEMI

A clinical prediction rule that estimates the 14-day risk of the composite
endpoint of all-cause mortality, new or recurrent myocardial infarction, and
severe recurrent ischaemia requiring urgent revascularisation in patients
presenting with unstable angina (UA) or non-ST-elevation myocardial infarction
(NSTEMI). Derived and validated by Antman et al. (JAMA, 2000) using the
TIMI 11B and ESSENCE trial cohorts.

---

## 1. Purpose

The TIMI Risk Score for UA/NSTEMI is used by clinicians to:

- **Risk-stratify** patients presenting with suspected non-ST-elevation acute
  coronary syndrome (NSTE-ACS) within the first 24 hours of presentation.
- **Estimate the 14-day risk** of the composite endpoint:
  - All-cause mortality
  - New or recurrent myocardial infarction
  - Severe recurrent ischaemia requiring urgent revascularisation
- **Inform the choice of management strategy** — early invasive (coronary
  angiography ± revascularisation) versus initial conservative (medical)
  strategy — and the intensity of antithrombotic therapy (e.g. low-molecular-
  weight heparin, glycoprotein IIb/IIIa inhibitors).
- Provide a **rapid bedside score** (7 binary inputs, integer total 0–7) using
  history, ECG, and a single cardiac biomarker.

**Patient population** — adults presenting with symptoms suggestive of UA or
NSTEMI (i.e. ischaemic chest discomfort at rest, or new-onset / accelerating
angina, without persistent ST-segment elevation on the presenting ECG). The
score is **not** intended for STEMI (use the TIMI Risk Score for STEMI),
non-cardiac chest pain, or undifferentiated chest pain — for those, the HEART
score is more appropriate.

**Caveats**

- A TIMI score of 0 does **not** equate to zero risk; the lowest band still
  carries an approximately 4.7 % 14-day event rate.
- The score was derived in trial populations selected for therapeutic
  comparison; absolute event rates in contemporary practice (with modern
  antiplatelets, statins, and early invasive strategies) are typically lower,
  but the score retains discriminatory value.
- The score does **not** incorporate troponin sensitivity (it predates
  high-sensitivity troponin assays). When using hs-cTn, treat any value above
  the assay's 99th-percentile upper reference limit as a "positive cardiac
  marker" for scoring purposes.

---

## 2. Inputs

All seven inputs are independent binary (yes/no) items, each worth **+1
point** when present. None require advanced imaging.

| Field key | Display name | Type | Clinical definition |
|---|---|---|---|
| `age_ge_65` | Age ≥ 65 years | boolean | Patient's chronological age at presentation is 65 years or older. |
| `cad_risk_factors_ge_3` | ≥ 3 CAD risk factors | boolean | At least three of the following traditional coronary artery disease risk factors: hypertension, hypercholesterolaemia, diabetes mellitus, family history of premature CAD (first-degree relative; men < 55 y, women < 65 y), or current cigarette smoking. |
| `known_cad_stenosis_ge_50` | Known CAD with stenosis ≥ 50 % | boolean | Prior coronary angiography demonstrating ≥ 50 % luminal stenosis in any major epicardial coronary artery. Prior MI, PCI, or CABG strongly implies but does not by itself satisfy this criterion — angiographic documentation is preferred. |
| `asa_use_past_7d` | Aspirin use in past 7 days | boolean | The patient has taken aspirin (any dose) within the 7 days preceding presentation. (A surrogate marker of more aggressive disease — patients who develop ACS *despite* recent aspirin have a worse prognosis.) |
| `severe_angina_ge_2_in_24h` | Severe anginal episodes (≥ 2 in 24 h) | boolean | Two or more separate episodes of anginal chest discomfort in the 24 hours preceding presentation. |
| `st_deviation_ge_0_5mm` | ST-segment deviation ≥ 0.5 mm on admission ECG | boolean | Horizontal or downsloping ST-segment depression **or** transient ST-segment elevation of at least 0.5 mm (0.05 mV) in two or more contiguous leads on the presenting 12-lead ECG. (Persistent ST elevation excludes the patient — that is STEMI.) |
| `cardiac_marker_positive` | Elevated cardiac biomarker | boolean | Any troponin (cTnI, cTnT, or hs-cTn) above the assay's 99th-percentile upper reference limit, **or** elevated CK-MB above the local upper limit of normal. |

Implementation note: each input must be strictly boolean. Missing values
should not be silently coerced to `false`; surface a validation error and
require the caller to confirm absence vs. unknown — particularly for
biomarkers, which must be measured (not assumed negative) before scoring.

---

## 3. Calculation

Each of the seven criteria contributes **+1 point** when present. The total
score is the unweighted sum.

| Criterion | Points if present |
|---|---|
| Age ≥ 65 years | **+1** |
| ≥ 3 CAD risk factors | **+1** |
| Known CAD with stenosis ≥ 50 % | **+1** |
| Aspirin use in past 7 days | **+1** |
| ≥ 2 anginal episodes in last 24 h | **+1** |
| ST-segment deviation ≥ 0.5 mm | **+1** |
| Elevated cardiac biomarker | **+1** |

```
TIMI = age_ge_65
     + cad_risk_factors_ge_3
     + known_cad_stenosis_ge_50
     + asa_use_past_7d
     + severe_angina_ge_2_in_24h
     + st_deviation_ge_0_5mm
     + cardiac_marker_positive
```

Total score is an integer in the closed range **[0, 7]**.

---

## 4. Output

### 4.1 Total score

Integer, 0 to 7 inclusive.

### 4.2 14-day rate of the composite endpoint

Per Antman EM et al., *JAMA* 2000;284(7):835–842, Table 2 (TIMI 11B unfractionated-heparin arm; rate of all-cause mortality, new or recurrent MI,
or severe recurrent ischaemia requiring urgent revascularisation through
14 days). Scores 0 and 1 are reported together, as are scores 6 and 7,
because of small sample sizes at the extremes.

| TIMI score | 14-day composite event rate (%) | Risk band |
|:-:|:-:|:-:|
| 0 – 1 | 4.7 | Low |
| 2 | 8.3 | Low |
| 3 | 13.2 | Intermediate |
| 4 | 19.9 | Intermediate |
| 5 | 26.2 | High |
| 6 – 7 | 40.9 | High |

### 4.3 Risk band interpretation

| Risk band | TIMI score | Suggested management emphasis |
|---|:-:|---|
| **Low** | 0 – 2 | Initial conservative (medical) strategy is reasonable: dual antiplatelet therapy, parenteral anticoagulation, anti-ischaemic therapy, and risk-factor modification. Reassess if symptoms recur or biomarkers evolve. Risk is low **but not zero**. |
| **Intermediate** | 3 – 4 | Consider an early invasive strategy (coronary angiography within 24–72 h). Benefit of GP IIb/IIIa inhibition and LMWH over UFH is greater than in low-risk patients. |
| **High** | 5 – 7 | Early invasive strategy (angiography, typically within 24 h) is preferred. Aggressive antithrombotic regimens demonstrated the greatest absolute benefit in this group in the derivation cohorts. |

These management implications summarise the original publication's
observations and historical ACC/AHA NSTE-ACS guidance. For contemporary
clinical decisions, defer to current local guidelines (e.g. ESC 2023
NSTE-ACS, AHA/ACC/ACEP/NAEMSP/SCAI 2025).

### 4.4 Output schema (implementation reference)

```json
{
  "score": 4,
  "composite_14d_risk_percent": 19.9,
  "risk_band": "intermediate",
  "endpoint": "All-cause mortality, new/recurrent MI, or severe recurrent ischaemia requiring urgent revascularisation through 14 days"
}
```

---

## 5. References

1. **Antman EM, Cohen M, Bernink PJLM, McCabe CH, Horacek T, Papuchis G,
   Mautner B, Corbalan R, Radley D, Braunwald E.**
   The TIMI risk score for unstable angina/non-ST elevation MI:
   a method for prognostication and therapeutic decision making.
   *JAMA.* 2000;284(7):835–842.
   doi:10.1001/jama.284.7.835.
   https://jamanetwork.com/journals/jama/fullarticle/192983

2. **MDCalc — TIMI Risk Score for UA/NSTEMI.**
   https://www.mdcalc.com/calc/111/timi-risk-score-ua-nstemi

3. **Pollack CV Jr, Sites FD, Shofer FS, Sease KL, Hollander JE.**
   Application of the TIMI risk score for unstable angina and non-ST
   elevation acute coronary syndrome to an unselected emergency department
   chest pain population.
   *Acad Emerg Med.* 2006;13(1):13–18.
   doi:10.1197/j.aem.2005.06.031.
   *(External validation in an unselected ED chest-pain cohort.)*

4. **Scirica BM, Cannon CP, Antman EM, Murphy SA, Morrow DA, Sabatine MS,
   McCabe CH, Gibson CM, Braunwald E.**
   Validation of the thrombolysis in myocardial infarction (TIMI) risk score
   for unstable angina pectoris and non-ST-elevation myocardial infarction
   in the TIMI III registry.
   *Am J Cardiol.* 2002;90(3):303–305.
   doi:10.1016/s0002-9149(02)02468-2.
