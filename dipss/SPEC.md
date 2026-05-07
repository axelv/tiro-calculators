# DIPSS — Dynamic International Prognostic Scoring System for Myelofibrosis

A dynamic clinical prognostic model for primary myelofibrosis (PMF) that
estimates median overall survival from any time point during the disease
course. Originally derived and validated by Passamonti et al. on behalf of the
IWG-MRT (International Working Group for Myeloproliferative Neoplasms Research
and Treatment) using 525 PMF patients enrolled in the IPSS cohort
(*Blood*, 2010).

Unlike the original IPSS — which uses the same five clinical variables but is
intended for application **only at diagnosis** — DIPSS may be re-applied at any
follow-up assessment, and is therefore the standard tool for reassessing
prognosis in patients with established PMF.

---

## 1. Purpose

DIPSS is used by clinicians to:

- **Stratify** patients with primary myelofibrosis into four prognostic
  categories (Low, Intermediate-1, Intermediate-2, High) and report the
  expected median overall survival.
- **Reassess prognosis dynamically** at any time during follow-up, not only at
  diagnosis. This is the defining advantage over IPSS.
- **Inform treatment decisions**, particularly the timing of allogeneic
  hematopoietic stem cell transplantation referral. Per Mayo / ELN guidance,
  Intermediate-2 and High-risk patients are typical transplant candidates,
  whereas Low and Intermediate-1 patients are generally managed with
  symptom-directed therapy (e.g. JAK inhibitors, supportive care).
- Serve as the clinical backbone for the refined **DIPSS-Plus** model
  (Gangat et al., *JCO* 2011), which adds karyotype, platelet count, and
  red-cell transfusion status to the basic DIPSS score.

**Patient population** — adults with histologically confirmed primary
myelofibrosis (PMF). Validation in post-PV / post-ET myelofibrosis is limited;
the **MYSEC-PM** model (Passamonti 2017) is preferred for secondary MF.

**Caveats**

- DIPSS does **not** incorporate cytogenetics, transfusion dependence, platelet
  count, or molecular drivers (JAK2/CALR/MPL/ASXL1, etc.). For more granular
  risk assessment, use **DIPSS-Plus**, **MIPSS70 / MIPSS70+ v2.0**, or
  **GIPSS**.
- Constitutional symptoms are inherently subjective; document explicitly the
  presence/absence of weight loss, fevers, and night sweats.
- The model was validated in adult PMF; pediatric and post-PV/post-ET MF
  populations are out of scope.

---

## 2. Inputs

DIPSS uses **five binary clinical/laboratory variables**, identical to the
IPSS variables. All thresholds are taken verbatim from Passamonti et al.,
*Blood* 2010;115(9):1703–1708.

| Field key | Display name | Type | Clinical definition |
|---|---|---|---|
| `age_gt_65` | Age > 65 years | boolean | Patient's age at the time of assessment is strictly greater than 65 years. |
| `constitutional_symptoms` | Constitutional symptoms | boolean | Presence of any of: unintentional weight loss > 10% of baseline body weight in the preceding 6 months, unexplained fever (> 37.5 °C), or drenching night sweats persisting for more than 1 month. |
| `hgb_lt_10` | Hemoglobin < 10 g/dL | boolean | Most recent hemoglobin concentration is strictly less than 10 g/dL (equivalently < 100 g/L or < 6.2 mmol/L). |
| `wbc_gt_25` | Leukocyte count > 25 × 10⁹/L | boolean | Most recent peripheral white-blood-cell count is strictly greater than 25 × 10⁹/L (equivalently > 25 000/μL). |
| `blasts_ge_1` | Peripheral blood blasts ≥ 1 % | boolean | Circulating blasts on peripheral smear differential are ≥ 1 % of total leukocytes. |

**Implementation notes**

- All five inputs are strictly boolean. Missing values must not be coerced to
  `false`; surface a validation error and require the caller to confirm
  absence vs. unknown.
- Hemoglobin: input units must be normalised to g/dL before threshold
  comparison. Conversion: `g/L → g/dL` divide by 10; `mmol/L → g/dL` multiply
  by ~1.611.
- WBC: input units must be normalised to 10⁹/L (= 10³/μL = K/μL) before
  threshold comparison.
- Blasts: when reported as an absolute count, recompute the percentage
  `100 × blasts / WBC` and apply the ≥ 1 % threshold.

---

## 3. Calculation

DIPSS departs from IPSS by giving the hemoglobin criterion **double weight**
(2 points instead of 1), reflecting the strong prognostic impact of anemia
that emerges over the disease course.

| Variable | Points if present |
|---|:-:|
| Age > 65 years | **+1** |
| Constitutional symptoms | **+1** |
| Hemoglobin < 10 g/dL | **+2** |
| Leukocytes > 25 × 10⁹/L | **+1** |
| Peripheral blasts ≥ 1 % | **+1** |

```
DIPSS = age_gt_65
      + constitutional_symptoms
      + 2 * hgb_lt_10
      + wbc_gt_25
      + blasts_ge_1
```

Total score is an integer in the closed range **[0, 6]**.

---

## 4. Output

### 4.1 Total score

Integer, 0 to 6 inclusive.

### 4.2 Risk stratification and median overall survival

Per Passamonti F et al., *Blood* 2010;115(9):1703–1708. Median survival values
are from the original IWG-MRT derivation/validation cohort.

| DIPSS score | Risk group | Median overall survival |
|:-:|---|:-:|
| **0** | Low | Not reached (median survival ≈ ≥ 15 years; reported as "not reached" in the derivation cohort) |
| **1 – 2** | Intermediate-1 | **14.2 years** |
| **3 – 4** | Intermediate-2 | **4.0 years** |
| **5 – 6** | High | **1.5 years** |

Independent validation in 1 000 consecutive Mayo Clinic PMF patients
(Gangat et al., *JCO* 2011) reported median survivals of **17.5 / 6.3 / 2.7 /
1.5 years** for Low / Int-1 / Int-2 / High, respectively — consistent with the
derivation cohort.

### 4.3 Suggested clinical action

The DIPSS publication does not itself prescribe therapy; the table below
summarises consensus practice (Tefferi 2018 / ELN 2018 / NCCN MPN guidelines)
that pairs with DIPSS risk groups. Defer to current local guidelines for any
treatment decision.

| Risk group | Typical management |
|---|---|
| Low | Observation; symptom-directed therapy only. Allogeneic HSCT generally not indicated. |
| Intermediate-1 | Symptom-directed therapy (JAK inhibitors for splenomegaly / constitutional symptoms; ESA / danazol / lenalidomide for anemia). HSCT considered case-by-case in younger patients with adverse features (high-risk mutations, transfusion dependence, unfavourable karyotype — i.e. apply DIPSS-Plus or MIPSS70+). |
| Intermediate-2 | **Allogeneic HSCT evaluation** if eligible. JAK inhibition for symptom control as bridge or definitive therapy if not transplant-eligible. |
| High | **Allogeneic HSCT evaluation** if eligible. Otherwise JAK inhibition, clinical trial, or best supportive care. |

### 4.4 Output schema (implementation reference)

```json
{
  "score": 3,
  "risk_group": "intermediate-2",
  "median_survival_years": 4.0,
  "median_survival_label": "4.0 years"
}
```

For the Low risk group, `median_survival_years` should be reported as `null`
with `median_survival_label` set to `"Not reached"`.

---

## 5. DIPSS-Plus extension (optional)

**DIPSS-Plus** (Gangat N et al., *JCO* 2011) refines DIPSS by adding three
additional adverse prognostic variables on top of the DIPSS risk-group
mapping. It requires availability of a karyotype.

### 5.1 Additional inputs

| Field key | Display name | Definition |
|---|---|---|
| `dipss_score` | Underlying DIPSS risk group | Categorical: Low / Int-1 / Int-2 / High (mapped to 0 / 1 / 2 / 3 points). |
| `platelets_lt_100` | Platelet count < 100 × 10⁹/L | Most recent platelet count strictly less than 100 × 10⁹/L. |
| `transfusion_dependent` | Red-cell transfusion need | Patient requires red-cell transfusions. |
| `unfavorable_karyotype` | Unfavorable karyotype | Complex karyotype, or sole/two abnormalities including +8, −7/7q−, i(17q), inv(3), −5/5q−, 12p−, or 11q23 rearrangement. |

### 5.2 DIPSS-Plus scoring

| Variable | Points |
|---|:-:|
| DIPSS — Low | 0 |
| DIPSS — Intermediate-1 | 1 |
| DIPSS — Intermediate-2 | 2 |
| DIPSS — High | 3 |
| Unfavorable karyotype | +1 |
| Platelets < 100 × 10⁹/L | +1 |
| Transfusion-dependent | +1 |

Total range: **0 – 6**.

### 5.3 DIPSS-Plus risk stratification

| DIPSS-Plus score | Risk group | Median overall survival |
|:-:|---|:-:|
| 0 | Low | **15.4 years** |
| 1 | Intermediate-1 | **6.5 years** |
| 2 – 3 | Intermediate-2 | **2.9 years** |
| 4 – 6 | High | **1.3 years** |

---

## 6. References

1. **Passamonti F, Cervantes F, Vannucchi AM, Morra E, Rumi E, Pereira A,
   Guglielmelli P, Pungolino E, Caramella M, Maffioli M, Pascutto C,
   Lazzarino M, Cazzola M, Tefferi A.** A dynamic prognostic model to predict
   survival in primary myelofibrosis: a study by the IWG-MRT (International
   Working Group for Myeloproliferative Neoplasms Research and Treatment).
   *Blood.* 2010;115(9):1703–1708.
   doi:10.1182/blood-2009-09-245837.
   https://ashpublications.org/blood/article/115/9/1703/27216

2. **Gangat N, Caramazza D, Vaidya R, George G, Begna K, Schwager S, Van Dyke D,
   Hanson C, Wu W, Pardanani A, Cervantes F, Passamonti F, Tefferi A.**
   DIPSS Plus: a refined Dynamic International Prognostic Scoring System for
   primary myelofibrosis that incorporates prognostic information from
   karyotype, platelet count, and transfusion status.
   *Journal of Clinical Oncology.* 2011;29(4):392–397.
   doi:10.1200/JCO.2010.32.2446.
   https://ascopubs.org/doi/10.1200/JCO.2010.32.2446

3. **MDCalc — DIPSS / DIPSS Plus (Dynamic International Prognostic Scoring
   System) for Myelofibrosis.**
   https://www.mdcalc.com/calc/10066/dipss-dynamic-international-prognostic-scoring-system-myelofibrosis

4. **Cervantes F, Dupriez B, Pereira A, Passamonti F, Reilly JT, Morra E,
   Vannucchi AM, Mesa RA, Demory JL, Barosi G, Rumi E, Tefferi A.** New
   prognostic scoring system for primary myelofibrosis based on a study of the
   International Working Group for Myelofibrosis Research and Treatment
   (IPSS — the static predecessor to DIPSS).
   *Blood.* 2009;113(13):2895–2901.
   doi:10.1182/blood-2008-07-170449.

5. **Tefferi A.** Primary myelofibrosis: 2021 update on diagnosis, risk
   stratification and management. *American Journal of Hematology.*
   2021;96(1):145–162. doi:10.1002/ajh.26050.
   *(Modern reference for risk-adapted therapy mapping to DIPSS / DIPSS-Plus
   risk groups.)*
