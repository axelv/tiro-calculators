# Killip Classification for Heart Failure

> Bedside clinical classification that quantifies severity of heart failure in the setting of acute myocardial infarction (AMI) / acute coronary syndrome (ACS) and predicts short-term mortality.

- **Authoritative reference:** [MDCalc — Killip Classification for Heart Failure](https://www.mdcalc.com/calc/3990/killip-classification-heart-failure)
- **Primary publication:** Killip T, Kimball JT. *Treatment of myocardial infarction in a coronary care unit. A two year experience with 250 patients.* Am J Cardiol. 1967;20(4):457-464. doi:10.1016/0002-9149(67)90023-9. PMID: 6059183.

---

## 1. Purpose

The Killip classification stratifies patients with **acute myocardial infarction** (originally STEMI, now also broadly applied to NSTE-ACS) into four classes based on **simple clinical examination findings** of left-ventricular failure. Higher Killip class predicts higher in-hospital and 30-day mortality.

Use cases:

- Bedside risk stratification of ACS / AMI patients on admission
- Trigger for escalated therapy (reperfusion, inotropes, mechanical circulatory support such as IABP)
- **Component of established risk scores**, most notably the **GRACE** score (in-hospital and 6-month mortality in ACS) and the **TIMI Risk Index** workflows
- Standardized severity descriptor used in cardiology trials and registries since 1967

The score is **categorical and observational**: it does not require labs, imaging, or invasive measurements — only history-taking and physical exam.

---

## 2. Inputs

A single input: the patient's **clinical exam category** at presentation.

| Field          | Type          | Allowed values     | Required |
|----------------|---------------|--------------------|----------|
| `killip_class` | enum / string | `I`, `II`, `III`, `IV` | yes  |

The clinician picks the **highest applicable class** based on the exam findings below.

### Class definitions (input criteria)

| Class | Clinical findings (criteria for assignment)                                                                                       |
|-------|----------------------------------------------------------------------------------------------------------------------------------|
| I     | **No signs of congestion.** No clinical signs of heart failure: no rales, no S3, no elevated JVP.                                 |
| II    | **Mild–moderate HF.** S3 gallop **and/or** bibasilar pulmonary rales/crackles audible over **<50%** of the lung fields; ± elevated JVP. |
| III   | **Severe HF / acute pulmonary edema.** Frank pulmonary edema with rales heard over **>50%** of the lung fields.                  |
| IV    | **Cardiogenic shock.** Hypotension (SBP <90 mmHg) **with** signs of peripheral hypoperfusion: oliguria, cyanosis, cool/clammy/diaphoretic extremities, altered mentation. |

Notes for implementations:

- Classes are **mutually exclusive**; assign the **highest** class for which criteria are met.
- "Rales <50% / >50% of lung fields" is the conventional cutoff used to distinguish Class II from Class III.
- An S3 alone (without rales) is sufficient for Class II.
- Class IV requires both hypotension **and** end-organ hypoperfusion signs — not hypotension alone.

---

## 3. Calculation

There is **no arithmetic**. This is a **direct categorical assignment** based on physical examination.

```
output_class = killip_class   # one of {I, II, III, IV}
```

Pseudocode for clinical UI logic (highest-class-wins evaluation):

```text
if hypotension(SBP < 90) AND signs_of_hypoperfusion:
    return "IV"
elif rales_over_more_than_50_percent_of_lungs OR overt_pulmonary_edema:
    return "III"
elif S3_present OR rales_under_50_percent_of_lungs OR elevated_JVP:
    return "II"
else:
    return "I"
```

No points are summed, no weights, no thresholds beyond the clinical criteria above.

---

## 4. Output

Output is the **Killip class (I–IV)** together with its associated **30-day mortality estimate**. Two reference sets are commonly cited: the **original 1967 Killip & Kimball cohort** (pre-reperfusion era) and the **modern revalidation** in NSTE-ACS by Khot et al. (2003), based on 26,090 patients pooled from GUSTO IIb, PURSUIT, PARAGON A, and PARAGON B.

| Class | Definition (short)        | Original 30-day / in-hospital mortality (Killip & Kimball, 1967, n=250) | Modern 30-day mortality (Khot et al., 2003, n=26,090, NSTE-ACS) | Modern 6-month mortality (Khot et al., 2003) |
|-------|---------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------|------------------------------------------------|
| I     | No HF signs               | ~6%                                                                      | **2.8%**                                                         | 5.0%                                            |
| II    | S3 / rales <50%           | ~17%                                                                     | **8.8%**                                                         | 14.7%                                           |
| III   | Pulmonary edema (rales >50%) | ~38%                                                                  | **14.4%** *(reported as combined Class III/IV in Khot et al.)*   | 23.0% *(combined III/IV)*                      |
| IV    | Cardiogenic shock         | ~81%                                                                     | **14.4%** *(combined III/IV in Khot et al.; class IV alone remains substantially higher in contemporary STEMI cohorts, ~50–60%)* | 23.0% *(combined III/IV)*                      |

Reporting recommendations for implementations:

- Display the assigned class prominently (e.g., "Killip Class II").
- Display **modern figures (Khot et al., 2003)** as the primary mortality estimate, since these reflect contemporary management (reperfusion, antiplatelets, etc.).
- Optionally show original 1967 figures for historical context.
- Note the **combined III/IV** caveat for the modern dataset.
- Higher Killip class → higher mortality is monotonic and statistically significant (P<.001 in Khot et al. for between-class comparisons).
- Killip class II–IV represented only ~11% of the Khot et al. cohort but accounted for ~30% of deaths at both 30 days and 6 months — emphasizing the prognostic weight of any HF signs.

### Suggested machine-readable output schema

```json
{
  "killip_class": "II",
  "mortality_30d_modern_pct": 8.8,
  "mortality_6m_modern_pct": 14.7,
  "mortality_inhospital_original_pct": 17,
  "source_modern": "Khot et al., JAMA 2003",
  "source_original": "Killip & Kimball, Am J Cardiol 1967"
}
```

---

## 5. References

### Primary publication

- Killip T, Kimball JT. **Treatment of myocardial infarction in a coronary care unit. A two year experience with 250 patients.** *Am J Cardiol*. 1967;20(4):457-464. doi:[10.1016/0002-9149(67)90023-9](https://doi.org/10.1016/0002-9149(67)90023-9). PMID: [6059183](https://pubmed.ncbi.nlm.nih.gov/6059183/).

### Modern revalidation (preferred mortality figures)

- Khot UN, Jia G, Moliterno DJ, et al. **Prognostic importance of physical examination for heart failure in non–ST-elevation acute coronary syndromes: the enduring value of Killip classification.** *JAMA*. 2003;290(16):2174-2181. doi:[10.1001/jama.290.16.2174](https://doi.org/10.1001/jama.290.16.2174). PMID: [14570953](https://pubmed.ncbi.nlm.nih.gov/14570953/). Full text: <https://jamanetwork.com/journals/jama/fullarticle/197529>.

### Calculator / clinical reference

- MDCalc — Killip Classification for Heart Failure: <https://www.mdcalc.com/calc/3990/killip-classification-heart-failure>

### Related risk scores incorporating Killip class

- GRACE (Global Registry of Acute Coronary Events) risk score — Killip class is one of the strongest weighted variables.
- Validation in STEMI: De Luca G, et al. *Am Heart J*. 2004;147(2):253-259 (and subsequent contemporary STEMI cohorts).
- Long-term validation: Mello BHG, et al. **Validation of the Killip-Kimball Classification and Late Mortality after Acute Myocardial Infarction.** *Arq Bras Cardiol.* 2014;103(2):107-117. PMC: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4150661/>.

### Background

- *Killip class* — Wikipedia: <https://en.wikipedia.org/wiki/Killip_class>
