# HEART Score for Major Cardiac Events

Implementation specification for the **HEART Score**, a bedside risk-stratification tool used in the emergency department (ED) for patients presenting with undifferentiated chest pain suggestive of acute coronary syndrome (ACS).

Authoritative source: [MDCalc — HEART Score for Major Cardiac Events](https://www.mdcalc.com/calc/1752/heart-score-major-cardiac-events)

---

## 1. Purpose

Predict the **6-week risk of Major Adverse Cardiac Events (MACE)** in adult patients (≥21 years) presenting to the emergency department with chest pain suggestive of ACS. MACE is defined as the composite of:

- All-cause mortality
- Acute myocardial infarction (AMI)
- Coronary revascularization (PCI or CABG)

The score supports the disposition decision (safe early discharge vs. observation/admission vs. early invasive workup).

### Intended population
- Adult ED patients (≥21 years) with chest pain symptoms suggestive of ACS.

### Do **not** use when any of the following are present
- New ST-segment elevation ≥1 mm requiring immediate reperfusion (i.e. STEMI).
- Other new diagnostic ECG changes mandating immediate intervention.
- Hemodynamic instability / hypotension.
- Life expectancy <1 year.
- Another non-cardiac illness independently requiring admission.

---

## 2. Inputs

The HEART Score is the sum of five components, each scored **0**, **1**, or **2** points.

| # | Component (mnemonic) | Type | Allowed values | Definition per level |
|---|----------------------|------|----------------|----------------------|
| 1 | **H — History** | enum (0\|1\|2) | 0 = Slightly suspicious<br>1 = Moderately suspicious<br>2 = Highly suspicious | Clinician's overall impression of the chest-pain history (location, character, radiation, onset, duration, relation to exertion, accompanying symptoms, response to nitrates, prior similar episodes). "Highly suspicious" = mostly classical ACS features; "slightly suspicious" = mostly non-classical / atypical; "moderately suspicious" = mixed. |
| 2 | **E — ECG** | enum (0\|1\|2) | 0 = Normal<br>1 = Non-specific repolarization disturbance<br>2 = Significant ST-deviation | **0** Completely normal 12-lead ECG (per Minnesota criteria).<br>**1** Repolarization abnormalities without significant ST-depression/elevation; ST-depression or elevation in the presence of a bundle branch block, typical LVH, or post-cardioversion / digoxin effect.<br>**2** Significant ST-segment depression or elevation in the absence of a bundle branch block, LVH, or digoxin effect. |
| 3 | **A — Age** | enum (0\|1\|2) | 0 = <45 years<br>1 = 45–64 years<br>2 = ≥65 years | Patient age in completed years at time of presentation. |
| 4 | **R — Risk factors** | enum (0\|1\|2) | 0 = No known risk factors<br>1 = 1–2 risk factors<br>2 = ≥3 risk factors **OR** history of atherosclerotic disease | Risk factors counted: <br>• Hypertension<br>• Hypercholesterolemia<br>• Diabetes mellitus<br>• Obesity (BMI >30 kg/m²)<br>• Current smoking or smoking cessation ≤3 months ago<br>• Positive family history of cardiovascular disease (parent or sibling with CVD before age 65)<br><br>**Atherosclerotic disease** (auto-scores 2): prior MI, prior PCI or CABG, prior CVA/TIA, or peripheral arterial disease. |
| 5 | **T — Troponin** (initial) | enum (0\|1\|2) | 0 = ≤ normal limit<br>1 = 1–3× normal limit<br>2 = >3× normal limit | Initial troponin level on presentation, expressed as a multiple of the assay's upper reference limit (URL / 99th percentile). Use the **local, regular- (standard-) sensitivity troponin assay** with the institution-specific cutoff. The original HEART Score was not derived/validated using high-sensitivity troponin in the same way; if hs-cTn is used, refer to the HEART Pathway or modified protocols. |

### Input data model (suggested)

```text
HeartScoreInputs {
  history:       0 | 1 | 2          # H
  ecg:           0 | 1 | 2          # E
  age_years:     integer ≥ 0        # A (mapped to 0/1/2 below)
  risk_factors:  0 | 1 | 2          # R
  troponin_ratio: number ≥ 0        # T (initial troponin / URL; mapped to 0/1/2 below)
}
```

**Age mapping:** `age_years < 45 → 0`; `45 ≤ age_years ≤ 64 → 1`; `age_years ≥ 65 → 2`.

**Troponin mapping:** `ratio ≤ 1 → 0`; `1 < ratio ≤ 3 → 1`; `ratio > 3 → 2`.

---

## 3. Calculation

```
HEART = History + ECG + Age + Risk factors + Troponin
```

- Each component contributes **0, 1, or 2** points.
- Total score range: **0 – 10** (integer).

---

## 4. Output

### 4.1 Risk bands

| Total score | Risk band | 6-week MACE (retrospective cohort, Backus 2010) | 6-week MACE (prospective cohort, Backus 2013) | Recommended disposition |
|-------------|-----------|--------------------------------------------------|-----------------------------------------------|--------------------------|
| **0 – 3**   | **Low**       | ~0.99 %  | ~1.7 %  | **Discharge** from the ED with appropriate outpatient follow-up; consider further workup only if clinical suspicion remains. |
| **4 – 6**   | **Moderate**  | ~11.6 %  | ~16.6 % | **Admit / observe** for serial troponins, repeat ECG, and non-invasive ischemia evaluation (e.g. stress test, CCTA). |
| **7 – 10**  | **High**      | ~65.2 %  | ~50.1 % | **Early invasive strategy** — cardiology consultation; consider invasive coronary angiography. |

### 4.2 Output data model (suggested)

```text
HeartScoreResult {
  score:        integer 0..10
  risk_band:    "low" | "moderate" | "high"
  mace_6w_pct:  number          # representative 6-week MACE probability for the band
  disposition:  "discharge" | "admit_observe" | "early_invasive"
  components: {
    history: 0|1|2, ecg: 0|1|2, age: 0|1|2,
    risk_factors: 0|1|2, troponin: 0|1|2
  }
}
```

### 4.3 Important caveats

- The HEART Score **supports**, but does not replace, clinical judgment.
- Re-check the calculation; do not use it as the sole basis for disposition.
- A "low" score does **not** guarantee absence of disease — counsel the patient and arrange follow-up.
- Use only the **initial** troponin for the original HEART Score. Serial-troponin protocols (e.g. **HEART Pathway**) use the same five components plus 0- and 3-hour (or 0/1 h hs-cTn) troponins to further refine the low-risk classification.

---

## 5. References

### Primary publications

1. **Six AJ, Backus BE, Kelder JC.** Chest pain in the emergency room: value of the HEART score. *Netherlands Heart Journal.* 2008;16(6):191-196.
   PMCID: PMC2442661 — <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2442661/>

2. **Backus BE, Six AJ, Kelder JC, et al.** Chest pain in the emergency room: a multicenter validation of the HEART Score. *Critical Pathways in Cardiology.* 2010;9(3):164-169.
   DOI: 10.1097/HPC.0b013e3181ec36d8 — <https://doi.org/10.1097/HPC.0b013e3181ec36d8>

3. **Backus BE, Six AJ, Kelder JC, et al.** A prospective validation of the HEART score for chest pain patients at the emergency department. *International Journal of Cardiology.* 2013;168(3):2153-2158.
   DOI: 10.1016/j.ijcard.2013.01.255 — <https://doi.org/10.1016/j.ijcard.2013.01.255>

### Supporting / related references

4. **Mahler SA, Riley RF, Hiestand BC, et al.** The HEART Pathway randomized trial: identifying emergency department patients with acute chest pain for early discharge. *Circulation: Cardiovascular Quality and Outcomes.* 2015;8(2):195-203.
   DOI: 10.1161/CIRCOUTCOMES.114.001384 — <https://doi.org/10.1161/CIRCOUTCOMES.114.001384>

5. **Poldervaart JM, Reitsma JB, Backus BE, et al.** Effect of using the HEART score in patients with chest pain in the emergency department: a stepped-wedge, cluster randomized trial. *Annals of Internal Medicine.* 2017;166(10):689-697.
   DOI: 10.7326/M16-1600 — <https://doi.org/10.7326/M16-1600>

### Calculator source

- MDCalc — HEART Score for Major Cardiac Events: <https://www.mdcalc.com/calc/1752/heart-score-major-cardiac-events>
