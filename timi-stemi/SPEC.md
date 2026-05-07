# TIMI Risk Score for STEMI

Implementation specification for the **Thrombolysis In Myocardial Infarction (TIMI) Risk Score for ST-Elevation Myocardial Infarction (STEMI)**.

---

## 1. Purpose

The TIMI Risk Score for STEMI is a bedside clinical prediction rule that estimates **30-day all-cause mortality** in patients presenting with ST-elevation myocardial infarction. It was derived from the InTIME-II trial cohort (patients treated with fibrinolytic therapy) by Morrow et al. and stratifies risk using eight readily available clinical variables collected at first medical contact. Higher scores correspond to substantially higher short-term mortality, with a >40-fold gradient between the lowest and highest risk strata.

Intended use: rapid triage and prognostic stratification of STEMI patients at presentation to inform monitoring intensity, level of care, and shared decision-making. It is **not** a treatment-selection tool; reperfusion (primary PCI or fibrinolysis) is indicated per guidelines regardless of score.

---

## 2. Inputs

All inputs are evaluated **at the time of first medical contact / presentation** for STEMI.

| # | Component | Type | Definition / Operationalization |
|---|-----------|------|--------------------------------|
| 1 | **Age** | categorical (3 levels) | Patient age in years at presentation. Buckets: `<65`, `65–74`, `≥75`. |
| 2 | **History of diabetes, hypertension, or angina** | boolean | Documented prior diagnosis of *any one or more* of: diabetes mellitus (type 1 or 2), hypertension, or angina pectoris. Counts as a single composite item (1 point if any present). |
| 3 | **Systolic blood pressure <100 mmHg** | boolean | Presenting SBP (mmHg) strictly less than 100. Use first recorded value at presentation. |
| 4 | **Heart rate >100 bpm** | boolean | Presenting heart rate (beats per minute) strictly greater than 100. Use first recorded value at presentation. |
| 5 | **Killip class II–IV** | boolean | Clinical signs of heart failure on examination — i.e., jugular venous distension (JVD) or any pulmonary findings consistent with congestive heart failure (rales, S3, pulmonary edema, or cardiogenic shock). Killip class I (no signs of CHF) → false. |
| 6 | **Weight <67 kg** | boolean | Patient weight strictly less than 67 kg (≈147.7 lb). |
| 7 | **Anterior ST elevation or LBBB** | boolean | 12-lead ECG shows ST-elevation in anterior leads (V1–V4 territory) **or** new/presumed-new left bundle branch block. Inferior, lateral, or posterior STEMI without anterior involvement and without LBBB → false. |
| 8 | **Time to treatment >4 hours** | boolean | Time from symptom onset to initiation of reperfusion therapy strictly greater than 4 hours. |

---

## 3. Calculation

The total score is the **sum of points** assigned per item below. Maximum possible score = **14**.

| Component | Condition | Points |
|-----------|-----------|-------:|
| Age | `<65` years | 0 |
| Age | `65–74` years | 2 |
| Age | `≥75` years | 3 |
| History of DM, HTN, or angina | present | 1 |
| SBP `<100` mmHg | yes | 3 |
| HR `>100` bpm | yes | 2 |
| Killip class II–IV | yes | 2 |
| Weight `<67` kg | yes | 1 |
| Anterior STEMI or LBBB | yes | 1 |
| Time to treatment `>4` h | yes | 1 |
| **Maximum total** |  | **14** |

Notes:
- The **Age** component contributes a single value (0, 2, or 3) — the buckets are mutually exclusive.
- All other components are independent binary flags; absence contributes 0 points.
- Compute total as: `score = age_points + dm_htn_angina + sbp_lt_100*3 + hr_gt_100*2 + killip_2_4*2 + weight_lt_67 + anterior_or_lbbb + ttt_gt_4h`.

---

## 4. Output

The total integer score maps to predicted **30-day all-cause mortality** as derived in the InTIME-II validation (Morrow et al. 2000):

| Total Score | 30-Day Mortality |
|:-----------:|:----------------:|
| 0  | 0.8%  |
| 1  | 1.6%  |
| 2  | 2.2%  |
| 3  | 4.4%  |
| 4  | 7.3%  |
| 5  | 12.4% |
| 6  | 16.1% |
| 7  | 23.4% |
| 8  | 26.8% |
| >8 | 35.9% |

Interpretation guidance:
- The score behaves as a **continuous risk gradient**; there are no formal "low/intermediate/high" cut-points in the original derivation.
- The C-statistic for 30-day mortality in the derivation cohort was **0.78** (95% CI 0.76–0.79); validation cohort C-statistic **0.74**.
- Mortality estimates are derived from a **fibrinolytic-treated** population; absolute mortality in contemporary primary PCI cohorts may be lower at any given score, but the relative risk gradient is preserved.

Output contract for implementation:
- `score: int` — total points, range `0–14`.
- `mortality_30d_pct: float` — looked up via the table above (use the `>8` bucket for any score ≥9).
- Optionally surface the per-component point breakdown for transparency.

---

## 5. References

**Primary publication (derivation & validation):**

> Morrow DA, Antman EM, Charlesworth A, Cairns R, Murphy SA, de Lemos JA, Giugliano RP, McCabe CH, Braunwald E. **TIMI risk score for ST-elevation myocardial infarction: A convenient, bedside, clinical score for risk assessment at presentation: An intravenous nPA for treatment of infarcting myocardium early II trial substudy.** *Circulation.* 2000;102(17):2031–2037. doi:10.1161/01.CIR.102.17.2031

URLs:
- Calculator (authoritative source for this spec): https://www.mdcalc.com/calc/99/timi-risk-score-stemi
- Primary publication (AHA/Circulation): https://www.ahajournals.org/doi/10.1161/01.CIR.102.17.2031
- PubMed: https://pubmed.ncbi.nlm.nih.gov/11044416/

**Related / supportive references:**
- Morrow DA, Antman EM, Giugliano RP, et al. *A simple risk index for rapid initial triage of patients with ST-elevation myocardial infarction: an InTIME II substudy.* Lancet. 2001;358(9293):1571–1575. doi:10.1016/S0140-6736(01)06649-1 — companion simplified TIMI risk index (age, HR, SBP only).
