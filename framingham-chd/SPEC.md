# Framingham Risk Score for Hard Coronary Heart Disease (10-Year)

## 1. Purpose

Estimates the **10-year risk of "hard" coronary heart disease (CHD) events** — defined as **myocardial infarction (MI) and coronary death** — in adults **without prior CHD**.

- **Target population:** Adults aged **30–79 years** (MDCalc applies the score from age 30; the original Wilson 1998 derivation/coefficients cover 30–74 and ATP III tables cover 20–79) **without** known CHD or diabetes.
- **Use case:** Primary prevention risk stratification, ATP III lipid-treatment decision support.
- **Do NOT use in:** Patients with established CHD, peripheral arterial disease, abdominal aortic aneurysm, carotid artery disease, or diabetes mellitus (already considered CHD risk-equivalents in ATP III).

---

## 2. Inputs

| Input | Type | Allowed values / range | Units (MDCalc default) |
|---|---|---|---|
| Sex | enum | `male`, `female` | — |
| Age | integer | 30–79 years (calculator accepts 20–79 in ATP III tables) | years |
| Total cholesterol | numeric | typical 100–400 | **mg/dL** (MDCalc default; alternate: mmol/L) |
| HDL cholesterol | numeric | typical 20–100 | **mg/dL** (MDCalc default; alternate: mmol/L) |
| Systolic blood pressure (SBP) | integer | typical 90–250 | mm Hg |
| Treated for hypertension | boolean | `yes` / `no` | — |
| Current smoker | boolean | `yes` / `no` | — |

**Unit conversion (when input arrives in mmol/L):**

- Total cholesterol: `mg/dL = mmol/L × 38.67`
- HDL cholesterol: `mg/dL = mmol/L × 38.67`

The point tables below are defined in **mg/dL**; convert any mmol/L input first.

---

## 3. Calculation

The score is a **point-table system** (Wilson 1998 / ATP III). For the chosen sex, look up the points for each variable, sum them, and convert the total to a 10-year risk percentage.

```
total_points = age_pts + tc_pts(age, total_chol) + smoker_pts(age) + hdl_pts(hdl) + sbp_pts(sbp, treated)
risk_10yr_pct = points_to_risk(total_points, sex)
```

### 3.1 Age points

| Age (years) | Men | Women |
|---|---:|---:|
| 20–34 | −9 | −7 |
| 35–39 | −4 | −3 |
| 40–44 | 0 | 0 |
| 45–49 | 3 | 3 |
| 50–54 | 6 | 6 |
| 55–59 | 8 | 8 |
| 60–64 | 10 | 10 |
| 65–69 | 11 | 12 |
| 70–74 | 12 | 14 |
| 75–79 | 13 | 16 |

### 3.2 Total cholesterol points (depends on age band)

#### Men

| Total cholesterol (mg/dL) | Age 20–39 | 40–49 | 50–59 | 60–69 | 70–79 |
|---|---:|---:|---:|---:|---:|
| < 160 | 0 | 0 | 0 | 0 | 0 |
| 160–199 | 4 | 3 | 2 | 1 | 0 |
| 200–239 | 7 | 5 | 3 | 1 | 0 |
| 240–279 | 9 | 6 | 4 | 2 | 1 |
| ≥ 280 | 11 | 8 | 5 | 3 | 1 |

#### Women

| Total cholesterol (mg/dL) | Age 20–39 | 40–49 | 50–59 | 60–69 | 70–79 |
|---|---:|---:|---:|---:|---:|
| < 160 | 0 | 0 | 0 | 0 | 0 |
| 160–199 | 4 | 3 | 2 | 1 | 1 |
| 200–239 | 8 | 6 | 4 | 2 | 1 |
| 240–279 | 11 | 8 | 5 | 3 | 2 |
| ≥ 280 | 13 | 10 | 7 | 4 | 2 |

### 3.3 Smoker points (depends on age band)

| Age (years) | Men (smoker) | Women (smoker) |
|---|---:|---:|
| 20–39 | 8 | 9 |
| 40–49 | 5 | 7 |
| 50–59 | 3 | 4 |
| 60–69 | 1 | 2 |
| 70–79 | 1 | 1 |

Non-smokers receive **0 points** in every age band.

### 3.4 HDL cholesterol points (same for both sexes)

| HDL (mg/dL) | Points |
|---|---:|
| ≥ 60 | −1 |
| 50–59 | 0 |
| 40–49 | 1 |
| < 40 | 2 |

### 3.5 Systolic blood pressure points

#### Men

| SBP (mm Hg) | Untreated | Treated |
|---|---:|---:|
| < 120 | 0 | 0 |
| 120–129 | 0 | 1 |
| 130–139 | 1 | 2 |
| 140–159 | 1 | 2 |
| ≥ 160 | 2 | 3 |

#### Women

| SBP (mm Hg) | Untreated | Treated |
|---|---:|---:|
| < 120 | 0 | 0 |
| 120–129 | 1 | 3 |
| 130–139 | 2 | 4 |
| 140–159 | 3 | 5 |
| ≥ 160 | 4 | 6 |

### 3.6 Total points → 10-year hard CHD risk

#### Men

| Total points | 10-year risk |
|---|---|
| < 0 | < 1 % |
| 0 | < 1 % |
| 1 | 1 % |
| 2 | 1 % |
| 3 | 1 % |
| 4 | 1 % |
| 5 | 2 % |
| 6 | 2 % |
| 7 | 3 % |
| 8 | 4 % |
| 9 | 5 % |
| 10 | 6 % |
| 11 | 8 % |
| 12 | 10 % |
| 13 | 12 % |
| 14 | 16 % |
| 15 | 20 % |
| 16 | 25 % |
| ≥ 17 | ≥ 30 % |

#### Women

| Total points | 10-year risk |
|---|---|
| < 9 | < 1 % |
| 9 | 1 % |
| 10 | 1 % |
| 11 | 1 % |
| 12 | 1 % |
| 13 | 2 % |
| 14 | 2 % |
| 15 | 3 % |
| 16 | 4 % |
| 17 | 5 % |
| 18 | 6 % |
| 19 | 8 % |
| 20 | 11 % |
| 21 | 14 % |
| 22 | 17 % |
| 23 | 22 % |
| 24 | 27 % |
| ≥ 25 | ≥ 30 % |

---

## 4. Output

| Field | Type | Description |
|---|---|---|
| `total_points` | integer | Sum of all sub-scores (may be negative). |
| `risk_10yr_pct` | numeric (or banded string) | **10-year risk of hard CHD (MI or coronary death)** as a percentage. The official tables return banded values (`< 1 %`, integer %, or `≥ 30 %`); implementations may also expose the raw point total. |
| `risk_category` *(optional, ATP III)* | enum | `low` (< 10 %), `intermediate` (10–20 %), `high` (> 20 %). |

**Interpretation (ATP III):**

- **< 10 %** — low 10-year risk
- **10–20 %** — intermediate 10-year risk
- **> 20 %** — high 10-year risk (CHD risk-equivalent for treatment thresholds)

---

## 5. References

### Primary publication
- **Wilson PWF, D'Agostino RB, Levy D, Belanger AM, Silbershatz H, Kannel WB.** *Prediction of coronary heart disease using risk factor categories.* **Circulation. 1998;97(18):1837–1847.** doi:10.1161/01.CIR.97.18.1837
  URL: https://www.ahajournals.org/doi/10.1161/01.CIR.97.18.1837

### Operationalization (point tables used in this spec)
- **National Cholesterol Education Program (NCEP) Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (Adult Treatment Panel III).** *Third Report — Final Report.* **Circulation. 2002;106(25):3143–3421.** (Risk-assessment tool, Tables on hard-CHD point scoring.)
  URL: https://www.nhlbi.nih.gov/sites/default/files/media/docs/atp-3-cholesterol-full-report.pdf

### Source / calculator references
- **MDCalc — Framingham Risk Score for Hard Coronary Heart Disease:** https://www.mdcalc.com/calc/38/framingham-risk-score-hard-coronary-heart-disease
- **Framingham Heart Study — Hard Coronary Heart Disease (10-year risk):** https://www.framinghamheartstudy.org/fhs-risk-functions/hard-coronary-heart-disease-10-year-risk/
