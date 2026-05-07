# TRI-SCORE

Tricuspid Regurgitation Impact Score. Predicts in-hospital mortality after isolated tricuspid valve surgery in adults with severe tricuspid regurgitation.

## 1. Purpose

The TRI-SCORE is a dedicated, additive 8-item risk score developed to predict **in-hospital mortality after isolated tricuspid valve surgery** (repair or replacement) in adults. It was derived by Dreyfus et al. (Eur Heart J 2022) on a multicentre cohort of 466 consecutive patients from 12 French centres (2007-2017) because the standard cardiac-surgery risk models (logistic EuroSCORE, EuroSCORE II, STS) systematically under-estimate mortality in this specific, frail, congestion-driven population.

It is run during preoperative work-up to:
- inform shared decision-making with the patient and the Heart Team,
- stratify candidates between conventional surgery, transcatheter tricuspid intervention, and conservative management,
- support timely referral, given that the score worsens with progressive end-organ damage from chronic right-sided congestion.

The score is **not** intended for combined left-sided + tricuspid procedures, congenital tricuspid disease, infective endocarditis as the primary indication, or transplant. Several validation studies (including Asian and Western surgical cohorts and applications to transcatheter intervention) have confirmed its discrimination in those broader populations, but the original target population remains isolated tricuspid valve surgery for tricuspid regurgitation.

## 2. Inputs

All 8 variables are required. Each is dichotomous; the score is the sum of the points assigned to the items that are present.

| # | Field | Type | Allowed values | Clinical definition / threshold | Points if present |
|---|---|---|---|---|---|
| 1 | `age_ge_70` | boolean | `true` / `false` | Patient age **≥ 70 years** at the time of surgery. | 1 |
| 2 | `nyha_class_iii_iv` | boolean | `true` / `false` | New York Heart Association functional class **III or IV** at preoperative assessment (marked limitation of, or inability to carry out, ordinary physical activity without symptoms; or symptoms at rest). | 1 |
| 3 | `right_heart_failure_signs` | boolean | `true` / `false` | At least one clinical sign of right-sided heart failure: **severe jugular venous distension, ascites, and/or marked peripheral oedema** (Dreyfus 2022 verbatim definition). Documented at the most recent preoperative clinical examination. | 2 |
| 4 | `daily_furosemide_ge_125_mg` | boolean | `true` / `false` | Total **daily oral furosemide dose ≥ 125 mg** (or equivalent loop diuretic dose) at the time of preoperative assessment. Equivalences: bumetanide 1 mg ≈ furosemide 40 mg; torasemide 20 mg ≈ furosemide 40 mg. | 2 |
| 5 | `gfr_lt_30` | boolean | `true` / `false` | **Estimated glomerular filtration rate < 30 mL/min/1.73 m²**, calculated by CKD-EPI (or MDRD) on the most recent preoperative serum creatinine. Patients on chronic dialysis are coded `true`. | 2 |
| 6 | `bilirubin_elevated` | boolean | `true` / `false` | **Total serum bilirubin above the local laboratory upper limit of normal (ULN)** on the most recent preoperative measurement. ULN is laboratory-dependent; commonly **> 1.2 mg/dL (≈ > 20.5 μmol/L)** in adults. The original derivation used a binary "elevated" flag relative to local ULN; the exact numeric cut-off was not fixed in the publication. | 2 |
| 7 | `lvef_lt_60` | boolean | `true` / `false` | **Left ventricular ejection fraction < 60 %** measured by transthoracic echocardiography (Simpson biplane preferred). | 1 |
| 8 | `rv_dysfunction_mod_severe` | boolean | `true` / `false` | **Moderate or severe right ventricular systolic dysfunction** on transthoracic echocardiography. Operationalised in the derivation cohort as qualitative assessment integrating TAPSE, S′ at the lateral tricuspid annulus, and RV fractional area change (e.g. TAPSE < 17 mm, S′ < 9.5 cm/s, or FAC < 35 % consistent with at least moderate dysfunction). | 1 |

## 3. Calculation

TRI-SCORE is a simple **additive integer score, range 0-12**.

```
TRI-SCORE =
    1 · age_ge_70
  + 1 · nyha_class_iii_iv
  + 2 · right_heart_failure_signs
  + 2 · daily_furosemide_ge_125_mg
  + 2 · gfr_lt_30
  + 2 · bilirubin_elevated
  + 1 · lvef_lt_60
  + 1 · rv_dysfunction_mod_severe
```

### 3.1 Point allocation (Dreyfus 2022, Table 2)

| Variable | Points |
|---|---|
| Age ≥ 70 years | 1 |
| NYHA class III-IV | 1 |
| Right-sided heart failure signs | 2 |
| Daily furosemide dose ≥ 125 mg | 2 |
| eGFR < 30 mL/min/1.73 m² | 2 |
| Elevated total bilirubin | 2 |
| LVEF < 60 % | 1 |
| Moderate/severe RV dysfunction | 1 |
| **Maximum** | **12** |

The four items derived from end-organ congestion (RHF signs, high-dose loop diuretic, low GFR, elevated bilirubin) carry 2 points each; the four items reflecting age, functional class, and ventricular function carry 1 point each. There are no interaction terms, no continuous coefficients, and no logistic transformation — the raw integer sum is used directly.

## 4. Output

The output is the integer TRI-SCORE plus a predicted in-hospital mortality and a clinical risk band.

### 4.1 Predicted vs observed in-hospital mortality (Dreyfus 2022, Table 3)

| TRI-SCORE | Predicted in-hospital mortality | Observed in-hospital mortality (derivation cohort, n = 466) |
|---|---|---|
| 0  | 1 %  | 0 %   |
| 1  | 2 %  | 4 %   |
| 2  | 3 %  | 1 %   |
| 3  | 5 %  | 0 %   |
| 4  | 8 %  | 10 %  |
| 5  | 14 % | 18 %  |
| 6  | 22 % | 25 %  |
| 7  | 34 % | 32 %  |
| 8  | 48 % | 33 %  |
| ≥ 9 | 65 % | 60 %  |

Discrimination in the derivation cohort: AUC 0.81 (95 % CI 0.75-0.86), substantially higher than logistic EuroSCORE (0.67) and EuroSCORE II (0.63) on the same patients. Calibration was good across the full score range.

### 4.2 Risk band and clinical interpretation

| Risk band | TRI-SCORE | Interpretation |
|---|---|---|
| **Low**          | **0 - 3** | Predicted in-hospital mortality ≤ 5 %. Surgical risk comparable to other elective valve operations; isolated tricuspid surgery generally appropriate when intervention is indicated, ideally **before** further end-organ deterioration. |
| **Intermediate** | **4 - 5** | Predicted in-hospital mortality 8-14 %. Heart Team discussion required; weigh surgical repair vs replacement vs transcatheter edge-to-edge or annuloplasty; optimise volume status, renal and hepatic function preoperatively. |
| **High**         | **≥ 6**   | Predicted in-hospital mortality ≥ 22 %, rising to ≥ 60 % at score ≥ 9. Surgery carries prohibitive risk in many cases; transcatheter therapy or medical management are typically preferred. Strongly favours early referral in earlier-stage disease to avoid reaching this band. |

These bands are those proposed in the original publication ("a risk score ≤ 3 could define a low surgical risk, a score of 4-5 an intermediate risk, and a score ≥ 6 a high surgical risk") and have been re-used in subsequent validation and intervention-benefit studies (e.g. Dreyfus 2024, JACC).

### 4.3 Edge cases

- **Missing input:** every item is required. Do not impute; refuse to compute.
- **Patients on chronic dialysis:** code `gfr_lt_30 = true`.
- **Loop diuretic other than furosemide:** convert to furosemide-equivalent before checking the 125 mg/day threshold.
- **Out-of-scope populations:** combined left-sided + tricuspid surgery, congenital heart disease, primary infective endocarditis, transplant — the score should not be reported as predicting mortality in those settings without an explicit caveat.

## 5. References

### Primary publication
- Dreyfus J, Audureau E, Bohbot Y, Coisne A, Lavie-Badie Y, Bouchery M, Flagiello M, Bazire B, Eggenspieler F, Viau F, Riant E, Mbaki Y, Eyharts D, Sénage T, Modine T, Nicol M, Doguet F, Nguyen V, Le Tourneau T, Tribouilloy C, Donal E, Tournoux F, Habib G, Selton-Suty C, Lim P, Magne J, Bohbot Y, Messika-Zeitoun D. **TRI-SCORE: a new risk score for in-hospital mortality prediction after isolated tricuspid valve surgery.** *European Heart Journal* 2022;43(7):654-662. doi:10.1093/eurheartj/ehab679. PMID: 34586392.
  - Oxford Academic: https://academic.oup.com/eurheartj/article/43/7/654/6377884
  - PubMed: https://pubmed.ncbi.nlm.nih.gov/34586392/
  - PMC full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC8843795/

### Authoritative interactive calculator
- TRI-SCORE official site: https://www.tri-score.com/

### External validation and extensions
- Wang TKM, Akyuz K, Mentias A, et al. **Validation of the TRI-SCORE in patients undergoing surgery for isolated tricuspid regurgitation.** *Eur J Cardiothorac Surg* 2023. PMID: 37217297. https://pubmed.ncbi.nlm.nih.gov/37217297/
- Dreyfus J, Galloo X, Taramasso M, et al. **TRI-SCORE and benefit of intervention in patients with severe tricuspid regurgitation.** *Eur Heart J* 2023. PMID: 37624856. https://pubmed.ncbi.nlm.nih.gov/37624856/
- Wong N, Park JJ, et al. **Validation of TRI-SCORE for outcome prediction after isolated tricuspid valve surgery in Asian patients.** *J Am Heart Assoc* 2024;13:e032929. https://www.ahajournals.org/doi/10.1161/JAHA.123.032929
