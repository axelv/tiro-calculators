# EAU NMIBC Risk Calculator

EAU 2021 risk stratification model for **non-muscle-invasive bladder cancer (NMIBC)** — predicts probability of progression (and recurrence) and assigns each patient to one of four prognostic risk groups (Low / Intermediate / High / Very High) used to guide adjuvant intravesical therapy and the discussion of early radical cystectomy.

---

## 1. Purpose

After transurethral resection of a bladder tumor (TURBT), Ta/T1 NMIBC patients have widely varying risks of recurrence and, more importantly, progression to muscle-invasive disease. The **EAU 2021 NMIBC scoring model** (Sylvester et al., 2021) was derived and validated on 3,401 patients from individual patient data of EORTC and CUETO trials and is now embedded in the EAU NMIBC guideline. It:

- Stratifies NMIBC patients into **four prognostic risk groups** (Low / Intermediate / High / Very High).
- Estimates **1-, 5-, and 10-year probability of progression** to ≥T2 disease.
- Is reported separately for **WHO 1973** (G1 / G2 / G3) and **WHO 2004/2016** (LG / HG, with LMP collapsed into LG) grading systems, because both are still in clinical use.
- Drives the EAU treatment recommendation: single chemo instillation, intravesical chemotherapy, BCG induction ± 1–3 yr maintenance, or radical cystectomy.

The calculator implemented here mirrors the official online tool at <https://nmibc.net/calculator>.

---

## 2. Inputs

All inputs are **required** and the form must **gate the "Calculate" action** until every required field is completed (including grade fields belonging to the chosen classification system). No calculation may be performed with partial input.

| # | Field | Type | Allowed values | Required | Notes |
|---|---|---|---|---|---|
| 1 | `age` | enum | `≤70`, `>70` | Yes | Patient age at TURBT, dichotomized at 70 yr. |
| 2 | `tumor_status` | enum | `Primary`, `Recurrent` | Yes | First-ever NMIBC vs. recurrence after prior NMIBC. |
| 3 | `number_of_tumors` | enum | `Single`, `Multiple` | Yes | At resection (≥2 = multiple). |
| 4 | `max_diameter` | enum | `<3 cm`, `≥3 cm` | Yes | Largest tumor diameter. |
| 5 | `stage` | enum | `Ta`, `T1` | Yes | TNM stage on TURBT histology. |
| 6 | `cis` | enum | `No`, `Yes` | Yes | Concomitant carcinoma in situ. |
| 7 | `classification` | enum | `WHO 1973`, `WHO 2004/2016`, `Both` | Yes | Selects which grade input(s) to enable and which result table(s) to render. |
| 8 | `grade_who_2004` | enum | `LG` (includes LMP), `HG` | Conditionally required | Required when classification ∈ {WHO 2004/2016, Both}. LMP and LG are merged per the 2021 model. |
| 9 | `grade_who_1973` | enum | `G1`, `G2`, `G3` | Conditionally required | Required when classification ∈ {WHO 1973, Both}. |

**Form gating rules**

- Disable the **Calculate** button until: fields 1–7 are set AND the conditionally required grade(s) for the selected `classification` are set.
- If `classification = Both`, both `grade_who_2004` and `grade_who_1973` must be provided and the result must show **two** risk classes/probability rows (one per system).
- All radio groups start unselected; there is **no default**.

---

## 3. Calculation

The EAU 2021 model is a **rule-based risk-group classifier** built on a count of "additional risk factors" (ARFs) combined with stage, grade, and CIS status. It is *not* a summed numeric score — it is a deterministic decision tree applied separately for each grading system. The four ARFs are:

| # | Additional Risk Factor (ARF) | Counted when |
|---|---|---|
| 1 | Age >70 | `age = >70` |
| 2 | Multiple tumors | `number_of_tumors = Multiple` |
| 3 | Tumor ≥3 cm | `max_diameter = ≥3 cm` |
| 4 | Recurrent tumor | `tumor_status = Recurrent` |

`ARF_count = (age>70) + (multiple) + (≥3cm) + (recurrent)` → integer in **[0, 4]**.

> Note: stage (Ta/T1), grade, and CIS are **not** counted as ARFs — they are used directly in the rules below.

### 3.1 WHO 2004/2016 risk-group rules

Apply rules top-to-bottom; first match wins.

| Rule | Condition | Risk group |
|---|---|---|
| 1 | `Ta` AND `LG` AND `CIS = No` AND `ARF_count = 0` | **Low** |
| 2 | `Ta` AND `LG` AND `CIS = No` AND `ARF_count ∈ {1, 2}` | **Intermediate** |
| 3 | `Ta` AND `LG` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 4 | `Ta` AND `HG` AND `CIS = No` AND `ARF_count ≤ 2` | **Intermediate** |
| 5 | `Ta` AND `HG` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 6 | `T1` AND `LG` AND `CIS = No` AND `ARF_count ≤ 2` | **Intermediate** |
| 7 | `T1` AND `LG` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 8 | `T1` AND `HG` AND `CIS = No` | **High** |
| 9 | `CIS = Yes` AND NOT (rule 10) | **High** |
| 10 | `T1` AND `HG` AND `CIS = Yes` AND `ARF_count ≥ 1` | **Very High** |
| 11 | `T1` AND `HG` AND `CIS = No` AND `ARF_count = 4` | **Very High** |

### 3.2 WHO 1973 risk-group rules

Apply rules top-to-bottom; first match wins. G1 ≈ LG; G3 ≈ HG; **G2 is treated as its own intermediate-grade tier**.

| Rule | Condition | Risk group |
|---|---|---|
| 1 | `Ta` AND `G1` AND `CIS = No` AND `ARF_count = 0` | **Low** |
| 2 | `Ta` AND `G1` AND `CIS = No` AND `ARF_count ∈ {1, 2}` | **Intermediate** |
| 3 | `Ta` AND `G1` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 4 | `Ta` AND `G2` AND `CIS = No` AND `ARF_count ≤ 2` | **Intermediate** |
| 5 | `Ta` AND `G2` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 6 | `Ta` AND `G3` AND `CIS = No` AND `ARF_count ≤ 2` | **Intermediate** |
| 7 | `Ta` AND `G3` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 8 | `T1` AND `G1` AND `CIS = No` AND `ARF_count ≤ 2` | **Intermediate** |
| 9 | `T1` AND `G1` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **High** |
| 10 | `T1` AND `G2` AND `CIS = No` AND `ARF_count = 0` | **Intermediate** |
| 11 | `T1` AND `G2` AND `CIS = No` AND `ARF_count ≥ 1` | **High** |
| 12 | `T1` AND `G3` AND `CIS = No` AND `ARF_count ≤ 2` | **High** |
| 13 | `CIS = Yes` AND NOT (rule 14) | **High** |
| 14 | `T1` AND `G3` AND `CIS = Yes` AND `ARF_count ≥ 1` | **Very High** |
| 15 | `T1` AND `G3` AND `CIS = No` AND `ARF_count ∈ {3, 4}` | **Very High** |

### 3.3 Implementation pseudocode

```python
def arf_count(age_gt_70: bool, multiple: bool, dia_ge_3cm: bool, recurrent: bool) -> int:
    return int(age_gt_70) + int(multiple) + int(dia_ge_3cm) + int(recurrent)

def eau_risk_who_2004(stage: str, grade: str, cis: bool, arf: int) -> str:
    # Very High first
    if stage == "T1" and grade == "HG" and cis and arf >= 1:
        return "Very High"
    if stage == "T1" and grade == "HG" and not cis and arf == 4:
        return "Very High"
    # High
    if stage == "T1" and grade == "HG" and not cis:
        return "High"
    if cis:
        return "High"
    # Low
    if stage == "Ta" and grade == "LG" and not cis and arf == 0:
        return "Low"
    # High via 3 ARFs in lower-grade groups
    if not cis and arf >= 3:
        return "High"
    # Otherwise Intermediate
    return "Intermediate"

def eau_risk_who_1973(stage: str, grade: str, cis: bool, arf: int) -> str:
    # Very High first
    if stage == "T1" and grade == "G3" and cis and arf >= 1:
        return "Very High"
    if stage == "T1" and grade == "G3" and not cis and arf >= 3:
        return "Very High"
    # CIS without Very-High match
    if cis:
        return "High"
    # T1G3 without CIS, ARF<=2 -> High
    if stage == "T1" and grade == "G3":
        return "High"
    # T1G2 without CIS: 0 ARF -> Intermediate, ≥1 -> High
    if stage == "T1" and grade == "G2":
        return "Intermediate" if arf == 0 else "High"
    # Low: Ta G1 0 ARF
    if stage == "Ta" and grade == "G1" and arf == 0:
        return "Low"
    # ≥3 ARF in remaining lower-grade groups -> High
    if arf >= 3:
        return "High"
    return "Intermediate"
```

---

## 4. Output

For each selected classification system, return:

- **Risk class**: Low / Intermediate / High / Very High.
- **Progression risk** at 1, 5, and 10 years (table 4.1 / 4.2).
- **Treatment recommendation** per EAU 2021 (table 4.3).
- The numeric `ARF_count` and the chain of rules that fired, for transparency.

When `classification = Both`, render two side-by-side blocks (one per grading system); if the two systems disagree on the risk class, surface a warning banner advising the clinician to consider the higher of the two.

### 4.1 Progression risk — WHO 2004/2016

| Risk class | 1-year | 5-year | 10-year |
|---|---|---|---|
| Low | 0.06% | 0.93% | 3.7% |
| Intermediate | 1.0% | 4.9% | 8.5% |
| High | 3.5% | 9.6% | 14% |
| Very High | 16% | 40% | 53% |

### 4.2 Progression risk — WHO 1973

| Risk class | 1-year | 5-year | 10-year |
|---|---|---|---|
| Low | 0.12% | 0.57% | 3.0% |
| Intermediate | 0.65% | 3.6% | 7.4% |
| High | 3.8% | 11% | 14% |
| Very High | 20% | 44% | 59% |

### 4.3 Treatment recommendation (EAU 2021)

| Risk class | EAU recommendation |
|---|---|
| **Low** | One **immediate post-TURBT instillation of intravesical chemotherapy**; no further adjuvant therapy required. |
| **Intermediate** | **Intravesical chemotherapy** (schedule not standardized) **OR** 1-year full-dose **BCG** induction + maintenance at 3, 6, 12 months. Choice based on individual recurrence/progression risk and tolerability. |
| **High** | **Full-dose BCG** for **1–3 years** (induction + maintenance at 3, 6, 12, 18, 24, 30, 36 months). **Discuss radical cystectomy** as an alternative. |
| **Very High** | **Radical cystectomy** is preferred. **Full-dose BCG for 1–3 years** is offered to patients who decline or are unfit for cystectomy. Mandatory discussion of variant histology, prostatic urethra CIS, and lympho-vascular invasion implications. |

---

## 5. References

### Primary publication

- **Sylvester RJ, Rodríguez O, Hernández V, Turturica D, Bauerová L, Bruins HM, Bründl J, van der Kwast TH, Brisuda A, Rubio-Briones J, Seles M, Hentschel AE, Kusuma VRM, Hizli F, Mostafid H, Nieuwenhuijzen JA, Colombo R, Wojcieszak P, Skarberg KO, Vasdev N, Soukup V, Burger M, Bosschieter J, Ribal MJ, Pisano F, Zlotta AR, Babjuk M, Palou J, Gontero P, Roupret M, Compérat E.** *European Association of Urology (EAU) Prognostic Factor Risk Groups for Non–muscle-invasive Bladder Cancer (NMIBC) Incorporating the WHO 1973/2004 and WHO 2016 Classifications of Bladder Cancer.* **Eur Urol. 2021;79(4):480–488.** doi:10.1016/j.eururo.2020.12.033. PMID: 33419683.

### Authoritative URLs

- EAU NMIBC Risk Calculator (online tool): <https://nmibc.net/calculator>
- EAU Guidelines on Non-muscle-invasive Bladder Cancer (TaT1 and CIS): <https://uroweb.org/guidelines/non-muscle-invasive-bladder-cancer>
- PubMed entry for the primary publication: <https://pubmed.ncbi.nlm.nih.gov/33419683/>

### Source-of-truth note

Risk-group definitions and progression probabilities reproduced in §3 and §4 of this spec are taken from the EAU 2021 model as published in Sylvester et al. 2021 and as implemented at <https://nmibc.net/calculator>. Treatment recommendations in §4.3 are paraphrased from the EAU Guidelines on Non-muscle-invasive Bladder Cancer (TaT1 and CIS) hosted at <https://uroweb.org/guidelines/non-muscle-invasive-bladder-cancer>.
