# Steinhart Model for Acute Heart Failure (AHF) in Undifferentiated Dyspnea

> Implementation specification.
> Authoritative source: [MDCalc — Steinhart Model for AHF in Undifferentiated Dyspnea](https://www.mdcalc.com/calc/10065/steinhart-model-acute-heart-failure-ahf-undifferentiated-dyspnea)
> Primary publication: Steinhart B, Thorpe KE, Bayoumi AM, Moe G, Januzzi JL Jr, Mazer CD. **Improving the diagnosis of acute heart failure using a validated prediction model.** *J Am Coll Cardiol* 2009;54(16):1515–1521. doi:10.1016/j.jacc.2009.05.065. PMID: 19815122.
>
> Note on the citation in the task brief: the originating brief referenced *J Card Fail* 2009;15:572–580. The MDCalc calculator (id 10065) cites the **JACC 2009;54:1515–21** paper above (the IMPROVE CHF derivation). Both report the same Steinhart prediction model; this SPEC follows the JACC reference used by MDCalc.

---

## 1. Purpose

Estimates the probability of **acute heart failure (AHF)** in adult patients presenting to the emergency department (ED) with **undifferentiated dyspnea**, by combining the clinician's pre-test (gestalt) probability with two objective inputs (patient age and NT-proBNP).

Intended use:

- ED triage / decision support for dyspneic patients in whom AHF is one of several plausible causes.
- To **reclassify** patients whose pre-test probability is intermediate into a more confident low- or high-probability category once NT-proBNP and age are factored in. In the derivation cohort the model reclassified ~44% of intermediate-probability patients to either low or high probability.
- Pearl (per MDCalc / Steinhart): if AHF is ruled out, actively investigate alternative causes of dyspnea (PE, pneumonia, COPD exacerbation, ACS, etc.).

Not intended for:

- Patients with a clearly established non-cardiac cause of dyspnea.
- Chronic / stable heart failure prognostication.
- Pediatric populations.

---

## 2. Inputs

The MDCalc implementation of the Steinhart model exposes **three** inputs. The "pre-test probability" input is the physician's clinical gestalt — informed by history (prior HF, prior MI, orthopnea, PND), medications (loop diuretic use), and exam findings (rales, S3, JVD, edema) — but those individual findings are **not** separate fields in the calculator; they feed the gestalt.

| # | Field | Type | Units | Allowed values / range | Notes |
|---|-------|------|-------|------------------------|-------|
| 1 | `age` | number (integer) | years | typically 18–110 | Patient age at presentation. |
| 2 | `pretest_probability` | number (percent) **or** category | % (0–100) | 0–100 | Physician's pre-test estimate of AHF probability. In the Steinhart 2009 paper the physician's gestalt was bucketed as **low (0–20%)**, **intermediate (21–79%)**, or **high (80–100%)**. The MDCalc UI accepts a free-form percentage. |
| 3 | `nt_probnp` | number (positive) | **pmol/L** on MDCalc | > 0 | NT-proBNP concentration. Many labs report **pg/mL**; convert with **1 pmol/L ≈ 8.457 pg/mL** (i.e., `pg/mL = pmol/L × 8.457`). The model uses **log10(NT-proBNP)**. |

### Clinical findings that informed the gestalt (for documentation / UI helper text only — not standalone inputs)

These are the elements the original investigators expected clinicians to weigh when forming their pre-test probability. They are listed here so an implementation can surface them as a tooltip or a guided gestalt picker, but they are not entered as discrete model variables.

- History of heart failure
- History of myocardial infarction
- Orthopnea / paroxysmal nocturnal dyspnea
- Current loop-diuretic use (e.g., furosemide, bumetanide, torsemide)
- Rales / pulmonary crackles on auscultation
- Other supporting signs the clinician chooses to weigh (S3 gallop, elevated JVD, peripheral edema, CXR congestion)

### Input validation

| Field | Validation |
|-------|------------|
| `age` | integer ≥ 18 (warn < 18; not validated in pediatrics) |
| `pretest_probability` | numeric, 0 ≤ x ≤ 100 |
| `nt_probnp` | numeric, > 0; reject 0 or negative; flag values < 5 pmol/L (≈ < 42 pg/mL) as implausibly low |

---

## 3. Calculation

The Steinhart model is a **logistic regression** with three predictors: age, pre-test probability, and **log10(NT-proBNP)**.

### General form

```
logit(p_AHF) = β0
             + β1 · age
             + β2 · pretest_probability        // entered as % or as ordinal level
             + β3 · log10(NT_proBNP_pgmL)

p_AHF = 1 / (1 + exp(-logit(p_AHF)))
```

Output `p_AHF` is the predicted probability of AHF (0 to 1; multiply by 100 for %).

### Coefficients

> **TBD — see Steinhart 2009 (JACC 2009;54:1515–1521) Online Appendix.**
> The exact intercept (β0) and the three slope coefficients (β1 for age, β2 for pre-test probability, β3 for log10(NT-proBNP)) are reported in the online supplement of the JACC paper and are not reproduced verbatim on MDCalc's public-facing page. Implementations must obtain the coefficients from the published Online Appendix and pin the exact values, units, and the unit (pg/mL vs pmol/L) assumed for NT-proBNP before going live.
>
> **Resolution attempted (2026-05-06):** The PubMed abstract (PMID 19815122), MDCalc page (calc/10065), JACC publisher page, ScienceDirect mirror, ResearchGate, Northwestern Scholars, Semantic Scholar, the GASP4Ar follow-up (PMID 27565045), the ACEM Martindale 2016 meta-analysis, the PRIDE study (PMID 15820160), and several open-access AHF diagnosis reviews (PMC6860389, PMC5336936, PMC8126502, PMC9536694) were searched. The publisher pages (JACC, ScienceDirect, AHA, Wiley) all return HTTP 403 / Cloudflare interstitials to non-institutional clients; the abstract reports only the LR triple (<300, 2700–8099, ≥8100 pg/mL) and not the regression coefficients. The Online Appendix containing β values was not reachable from open-access sources at the time of authoring.

| Symbol | Meaning | Value | Source |
|--------|---------|-------|--------|
| β0 | Intercept | TBD | Steinhart 2009 Online Appendix |
| β1 | Coefficient on age (per year) | TBD | Steinhart 2009 Online Appendix |
| β2 | Coefficient on pre-test probability | TBD (verify whether entered as %, proportion, or ordinal low/intermediate/high indicator) | Steinhart 2009 Online Appendix |
| β3 | Coefficient on log10(NT-proBNP) | TBD (verify unit: pg/mL vs pmol/L) | Steinhart 2009 Online Appendix |

### NT-proBNP unit handling

- The MDCalc input is in **pmol/L**.
- The published model uses NT-proBNP measured in **pg/mL** with **base-10 log**.
- Conversion: `NT_proBNP_pgmL = NT_proBNP_pmolL × 8.457`.
- Apply the conversion **before** taking log10 if the published coefficient assumes pg/mL.

### Likelihood ratios at NT-proBNP cut-points (Steinhart 2009, derivation cohort)

These are useful sanity checks for an implementation and for clinician-facing helper text; they are **not** part of the regression itself. Values below are the three points reported verbatim in the Steinhart 2009 abstract (PubMed 19815122).

| NT-proBNP (pg/mL) | Likelihood ratio for AHF | 95% CI |
|-------------------|--------------------------|--------|
| < 300 | **0.11** | 0.06 – 0.19 |
| 2,700 – 8,099 | **3.43** | 2.34 – 5.03 |
| ≥ 8,100 | **12.80** | 5.21 – 31.45 |

> **TBD — intermediate categories.** The Steinhart 2009 abstract reports only the three LRs above. The full table (with the 300–1,799 pg/mL and 1,800–2,699 pg/mL bands) is in the JACC paper's main Table / Online Appendix and is not reproduced in any of the open-access secondary sources searched (see Resolution-attempted note above). Implementations must source those two intermediate LRs from the JACC paper before exposing a full LR table.

### Pseudocode

```python
import math

def steinhart_ahf_probability(
    age_years: float,
    pretest_probability_percent: float,   # 0–100
    nt_probnp_pmol_l: float,
    *,
    beta0: float,   # TBD from Steinhart 2009
    beta_age: float,
    beta_pretest: float,
    beta_log10_ntprobnp_pgml: float,
) -> float:
    if nt_probnp_pmol_l <= 0:
        raise ValueError("NT-proBNP must be > 0")
    nt_probnp_pgml = nt_probnp_pmol_l * 8.457
    log10_ntprobnp = math.log10(nt_probnp_pgml)

    logit = (
        beta0
        + beta_age * age_years
        + beta_pretest * pretest_probability_percent
        + beta_log10_ntprobnp_pgml * log10_ntprobnp
    )
    return 1.0 / (1.0 + math.exp(-logit))
```

---

## 4. Output

| Field | Type | Units | Range | Description |
|-------|------|-------|-------|-------------|
| `probability_ahf` | number | percent | 0–100 | Predicted probability that the patient's dyspnea is due to acute heart failure. |

### Interpretation thresholds

The Steinhart paper does not mandate fixed action thresholds; it categorizes probability the same way the pre-test gestalt is categorized. A typical implementation surfaces:

| Predicted probability | Interpretation |
|-----------------------|----------------|
| **0–20%** | **Low** probability of AHF — AHF unlikely; actively pursue alternative diagnoses (PE, pneumonia, COPD/asthma, ACS). |
| **21–79%** | **Intermediate** probability — diagnosis remains uncertain; consider further testing (echocardiography, CXR review, repeat clinical assessment, additional biomarkers). |
| **80–100%** | **High** probability of AHF — treat for AHF while continuing to evaluate for contributing or alternative causes. |

### Performance (derivation / validation)

| Cohort | n | C-statistic |
|--------|---|-------------|
| IMPROVE CHF derivation | 500 | 0.905 |
| PRIDE external validation | 573 | 0.97 |
| Reclassification of intermediate-probability patients | — | ~44% moved to low or high |

---

## 5. References

### Primary publication

1. Steinhart B, Thorpe KE, Bayoumi AM, Moe G, Januzzi JL Jr, Mazer CD. **Improving the diagnosis of acute heart failure using a validated prediction model.** *J Am Coll Cardiol* 2009;54(16):1515–1521. doi:[10.1016/j.jacc.2009.05.065](https://doi.org/10.1016/j.jacc.2009.05.065). PubMed: [19815122](https://pubmed.ncbi.nlm.nih.gov/19815122/). [Publisher page](https://www.jacc.org/doi/10.1016/j.jacc.2009.05.065).

### Calculator implementation reference

2. MDCalc. **Steinhart Model for Acute Heart Failure (AHF) in Undifferentiated Dyspnea.** <https://www.mdcalc.com/calc/10065/steinhart-model-acute-heart-failure-ahf-undifferentiated-dyspnea>

### Supporting / related literature

3. Januzzi JL Jr, Camargo CA, Anwaruddin S, et al. **The N-terminal Pro-BNP Investigation of Dyspnea in the Emergency department (PRIDE) study.** *Am J Cardiol* 2005;95:948–954. (Source of the PRIDE external-validation dataset.)
4. Brophy JM. **ACP Journal Club. A model combining clinical assessment and NT-proBNP level accurately predicted heart failure in ED patients with dyspnea.** *Ann Intern Med* 2010;152(2):JC1-12. PubMed: [20083816](https://pubmed.ncbi.nlm.nih.gov/20083816/). (Commentary on Steinhart 2009.)

### Open items for implementers

- [ ] Pull β0, β_age, β_pretest, β_log10(NT-proBNP) from the **Online Appendix** of the JACC 2009 paper and pin exact values.
- [ ] Confirm the **unit** of NT-proBNP assumed by the published coefficient (pg/mL vs pmol/L) and the **log base** (log10 vs ln).
- [ ] Confirm whether `pretest_probability` enters the regression as a **continuous percent (0–100)**, a **proportion (0–1)**, or as **ordinal indicator variables** (low / intermediate / high) — this materially changes β2 and the implementation.
- [ ] Validate output against MDCalc for a small fixture set (e.g., 70-year-old, intermediate gestalt 50%, NT-proBNP 1,000 pmol/L) before release.
