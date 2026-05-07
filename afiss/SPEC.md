# AFISS — Atrial Fibrillation In Sepsis (SAFE) Score

> **Note on naming.** The score commonly referenced as **AFISS** (Atrial Fibrillation In Sepsis Score) is the same instrument published by Klein Klouwenberg et al. as the **SAFE score** ("Atrial Fibrillation in Sepsis"). Both names appear in the literature; this spec uses **AFISS** as the canonical short name and notes "SAFE" as the synonym used in the primary publication and the authors' online calculator.
>
> **Note on the MDCalc reference.** The URL supplied in the task brief (`https://www.mdcalc.com/calc/10646/atrial-fibrillation-sepsis-score-afiss`) did not resolve to an AFISS calculator at the time of authoring (it served unrelated content). The authoritative source used here is the original derivation publication and the authors' own web calculator (`https://safescore.shinyapps.io/safe/`). Exact regression coefficients / point values must be confirmed from the primary publication's online supplement before clinical implementation — items below that depend on those values are marked **TBD — see source**.

---

## 1. Purpose

AFISS is a **dynamic (per-day) risk-prediction model** that estimates the probability of **new-onset atrial fibrillation (NOAF) within the next 24 hours** in critically ill adult patients admitted to the ICU with sepsis (Sepsis-3 / pre-Sepsis-3 cohorts in the derivation). It is intended to:

- Identify high-risk patients in whom prophylactic or close-monitoring strategies might be tested or applied.
- Enrich clinical trial populations for AF-prevention studies in sepsis.
- Support clinician situational awareness during the first ~7 days of ICU admission, the period of greatest NOAF incidence.

The score is **not** designed for:
- AF risk in non-septic ICU patients.
- AF recurrence (it predicts *new-onset* AF only).
- Stroke / thromboembolism risk in established AF (use CHA2DS2-VASc).
- Bleeding risk on anticoagulation (use HAS-BLED).

---

## 2. Inputs

The final multivariable logistic-regression model includes the following predictors, evaluated **daily** while the patient remains at risk (no prior AF, still in ICU, within the prediction window). Variable definitions follow the derivation cohort (Klein Klouwenberg 2017).

| # | Variable | Type | Unit / Coding | Definition |
|---|----------|------|---------------|------------|
| 1 | **Age** | Continuous | Years | Patient age at ICU admission. |
| 2 | **Body mass index (BMI)** | Continuous | kg/m² | Calculated from admission weight and height. |
| 3 | **Immunocompromised status** | Binary | Yes / No | Active immunosuppression at presentation: hematologic malignancy, solid-organ transplant, chronic systemic corticosteroids, recent chemotherapy, congenital/acquired immunodeficiency, or other clinically documented immunosuppression. |
| 4 | **Septic shock** | Binary | Yes / No | Sepsis with persistent hypotension requiring vasopressors to maintain MAP ≥ 65 mmHg and serum lactate > 2 mmol/L despite adequate volume resuscitation (Sepsis-3); in the derivation cohort, defined per the contemporaneous criteria used in the parent MARS study. |
| 5 | **Vasopressor or inotrope use** | Binary | Yes / No | Receipt of any continuous IV vasopressor (norepinephrine, epinephrine, vasopressin, dopamine ≥ 5 µg/kg/min, phenylephrine) or inotrope (dobutamine, milrinone) on the day of prediction. |
| 6 | **C-reactive protein (CRP)** | Continuous | mg/L | Most recent CRP value on the day of prediction. |
| 7 | **White blood cell count (WBC)** | Continuous | ×10⁹/L | Most recent WBC count on the day of prediction. |
| 8 | **Renal failure** | Binary (or categorical) | Yes / No | Acute kidney injury meeting KDIGO criteria or receipt of renal replacement therapy on the day of prediction. (Original paper used the renal component of the SOFA score; confirm exact threshold against source.) |
| 9 | **Potassium (K⁺)** | Continuous | mmol/L | Most recent serum potassium on the day of prediction. |
| 10 | **Fraction of inspired oxygen (FiO₂)** | Continuous | Fraction (0.21–1.0) | Highest FiO₂ delivered on the day of prediction (room air = 0.21). |

> **Source for the variable list:** Klein Klouwenberg PM, Frencken JF, Kuipers S, et al. *Am J Respir Crit Care Med* 2017;195(2):205–211, summarised in Cureus review (PMC12229231).

---

## 3. Calculation

AFISS is **not a simple integer points-per-item additive score** in its original form. It is published as a **multivariable logistic-regression equation**:

```
logit(P(AF in next 24h)) = β0 + Σ (βi × Xi)
P(AF in next 24h) = 1 / (1 + exp(−logit))
```

Where:
- `β0` = model intercept — **TBD — see source (Klein Klouwenberg 2017, online supplement Table E#)**
- `βi` = regression coefficients for each of the 10 predictors above — **TBD — see source**
- `Xi` = the patient's value for each predictor (continuous variables entered on their natural scale; binary variables coded 0/1)

The authors also published a **simplified points-based version** intended for bedside use; the per-variable point assignments and the total-points → probability mapping are **TBD — see source (Klein Klouwenberg 2017, Table 4 / online supplement)**.

**Total range of the points-based version:** TBD — see source.

**Reference implementation:** the authors host an interactive calculator at `https://safescore.shinyapps.io/safe/` which encodes the exact coefficients; consult that calculator (or the published supplement) when encoding the model.

> **Resolution attempted (2026-05-06):** The MDCalc URL given in the task brief (`https://www.mdcalc.com/calc/10646/atrial-fibrillation-sepsis-score-afiss`) does **not** serve an AFISS calculator — at fetch time it returned an HFA-ICOS cardio-oncology calculator. The original AJRCCM publisher URL (`atsjournals.org/doi/10.1164/rccm.201603-0618OC`) now redirects to an OUP holding page and the article is no longer reachable from the legacy DOI without an institutional subscription. PubMed (PMID 27467907) carries only the abstract. Open-access secondary sources searched — the Bedford / Rucci 2022 external-validation paper (PMC8996280, PMID 34914569; "External Validation of a Risk Score for Daily Prediction of AF among Critically Ill Patients with Sepsis"), the *Cureus* SAFE-score review (PMC12229231), the *Beyond the Beat* review (PMC11779681), and the AHA 2024 Atrial Fibrillation Occurring During Acute Hospitalization scientific statement — list the predictor variables but do **not** reproduce the per-variable β coefficients or the simplified points table from Klein Klouwenberg's Table 4 / online supplement E. The authors' Shiny calculator (`safescore.shinyapps.io/safe/`) was reachable but rendered only a `Please Wait` loader to non-interactive HTTP clients; the bundled coefficients live in a server-side R object (not exposed in HTML/JS source) and were not extractable by WebFetch. Search-engine queries for the exact β values returned no open-access reproduction. The exact coefficients therefore cannot be filled in without (a) institutional access to the AJRCCM article + Online Data Supplement, (b) interactive use of the Shiny app to back-out the model by probing inputs, or (c) direct correspondence with the authors.

> ⚠ **Implementation guidance.** Do not approximate the coefficients. Either (a) ingest the exact β values from the primary publication's online supplement, or (b) call out to / mirror the authors' Shiny calculator. Approximated coefficients will materially degrade discrimination (the published external validation already showed AUC drop from 0.81 → 0.60 with the unmodified original model — Bedford / Rucci 2022).

---

## 4. Output

### 4.1 Primary output

A **predicted probability of new-onset atrial fibrillation in the next 24 hours**, in the range **0–1** (or 0–100%).

### 4.2 Risk stratification

The original publication did **not** define fixed clinical risk-tier cut-offs (e.g., low / intermediate / high). Instead, it presents the score as a continuous probability used either:

- **As a continuous risk** for trial enrichment or clinician judgement, or
- **At a user-chosen operating point** trading sensitivity vs. specificity.

If a tiered presentation is required for UI display, suggested operational tiers (mark as derived, not authoritative):

| Tier | Predicted 24-h NOAF probability | Suggested clinical posture |
|------|-------------------------------|----------------------------|
| Low  | < 5%   | Routine telemetry; no specific AF prophylaxis. |
| Moderate | 5 – 15% | Continued telemetry, electrolyte optimisation (K⁺, Mg²⁺), reassess daily. |
| High | ≥ 15%  | Heightened monitoring; consider trial enrollment / proactive triggers for early rate-control if AF develops. |

**These cut-offs are not endorsed by the original authors and must be reviewed by clinical leads before being shown to end-users.**

> **Resolution attempted (2026-05-06):** the task brief asked for the *published* score → risk-band thresholds. Klein Klouwenberg 2017 (and the Bedford / Rucci 2022 external validation) treat the SAFE/AFISS output as a continuous probability and report only discrimination (C-statistic) and calibration plots — neither paper, the *Cureus* (PMC12229231) review, nor the AHA scientific statement defines authoritative Low/Moderate/High cut-points. The tiering shown above is therefore a UI convenience, not a citation of the source. If authoritative tiers are needed they must come from a future publication or local clinical-governance decision; they cannot be sourced from Klein Klouwenberg 2017.

### 4.3 Performance (for transparency in UI / docs)

| Cohort | C-statistic (AUC) | Source |
|--------|-------------------|--------|
| Derivation (Dutch MARS, n = 1,782) | **0.81** (95% CI 0.79 – 0.84) | Klein Klouwenberg 2017 |
| Internal validation cohort | **0.80** (95% CI 0.76 – 0.85) | Klein Klouwenberg 2017 |
| External validation (US, MIMIC-style cohort) | **0.598** unmodified; **0.755** after re-fit | Bedford / Rucci, *Ann Am Thorac Soc* 2022 |

### 4.4 Clinical interpretation

- **High predicted probability**: patient is at elevated short-term risk of NOAF in the context of sepsis. NOAF in sepsis is independently associated with increased ICU and hospital mortality, longer LOS, stroke, and higher long-term AF recurrence. Clinical actions are non-specific (electrolyte optimisation, telemetry) — there is currently no proven prophylactic intervention to recommend on the basis of a high score alone.
- **Low predicted probability**: NOAF in the next 24 h is unlikely; this does not exclude later-onset AF as sepsis evolves — re-score daily.
- The score is a **dynamic** instrument: it should be **recomputed each ICU day** while the patient remains at risk.
- External validation has shown **poor portability** of the original coefficients to non-Dutch ICUs. Local re-calibration is recommended before clinical deployment outside the derivation setting.

---

## 5. References

### Primary publication (derivation)

1. **Klein Klouwenberg PMC, Frencken JF, Kuipers S, Ong DSY, Peelen LM, van Vught LA, Schultz MJ, van der Poll T, Bonten MJ, Cremer OL; MARS consortium.** *Incidence, Predictors, and Outcomes of New-Onset Atrial Fibrillation in Critically Ill Patients with Sepsis. A Cohort Study.* **Am J Respir Crit Care Med.** 2017 Jan 15;195(2):205–211.
   DOI: [10.1164/rccm.201603-0618OC](https://doi.org/10.1164/rccm.201603-0618OC)
   PubMed: [27467907](https://pubmed.ncbi.nlm.nih.gov/27467907/)
   Publisher: <https://www.atsjournals.org/doi/10.1164/rccm.201603-0618OC>

### Authors' calculator

2. **SAFE Score: Individualized Prediction of Atrial Fibrillation in Critically Ill Patients with Sepsis.**
   <https://safescore.shinyapps.io/safe/>

### External validation

3. **Bedford JP, Ferrando-Vivas P, Redfern O, Rajappan K, Harrison DA, Watkinson PJ, Doidge JC.** *External Validation of a Risk Score for Daily Prediction of Atrial Fibrillation among Critically Ill Patients with Sepsis.* **Ann Am Thorac Soc.** 2022 Jul;19(7):1191–1194.
   PubMed: [34914569](https://pubmed.ncbi.nlm.nih.gov/34914569/)
   PMC: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8996280/>

### Editorial and supporting context

4. **Walkey AJ, Hammill BG, Curtis LH, Benjamin EJ.** *Long-term Outcomes Following Development of New-Onset Atrial Fibrillation During Sepsis.* **Chest.** 2014;146(5):1187–1195.
   PMC: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4219336/>
   *(Provides the long-term outcomes context for NOAF in sepsis; not the AFISS derivation paper.)*

5. **Editorial: When Rhythm Changes Cause the Blues.** **Am J Respir Crit Care Med.** 2017;195(2):143–144.
   <https://www.atsjournals.org/doi/full/10.1164/rccm.201608-1617ED>

6. **Sepsis-Induced Atrial Fibrillation: Can We Predict and Prevent This High-Risk Complication?** *Cureus* review (2025).
   PMC: <https://pmc.ncbi.nlm.nih.gov/articles/PMC12229231/>
   *(Used here as a secondary source listing the AFISS predictor variables.)*

### MDCalc

7. **MDCalc — Atrial Fibrillation Sepsis Score (AFISS).**
   <https://www.mdcalc.com/calc/10646/atrial-fibrillation-sepsis-score-afiss>
   *(URL supplied in the implementation brief; at the time of writing, this URL did not resolve to an AFISS calculator and content could not be confirmed via WebFetch. Re-check before relying on MDCalc as a reference.)*

---

## 6. Implementation checklist

- [ ] Obtain the **exact β coefficients (and/or points table)** from Klein Klouwenberg 2017 online supplement — do **not** ship without these.
- [ ] Decide whether to ship (a) the original coefficients, (b) a re-fitted model on local data, or (c) both with a toggle.
- [ ] Validate against the authors' Shiny calculator on a panel of test cases before release.
- [ ] Display the C-statistic and external-validation caveat in the UI.
- [ ] Recompute daily for at-risk ICU patients (ICU day 0 through earliest of: AF onset, ICU discharge, 7 days, death).
- [ ] Surface the input definitions (especially "renal failure", "septic shock", "immunocompromised") inline so coding is consistent across users.
