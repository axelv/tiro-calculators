# Ottawa Heart Failure Risk Scale (OHFRS)

Implementation specification for the **Ottawa Heart Failure Risk Scale (OHFRS)**, a 10-criterion clinical decision rule used in the emergency department (ED) to predict the risk of short-term serious adverse events (SAE) in patients with acute heart failure (HF), supporting the disposition decision (admission vs. discharge with close follow-up).

Authoritative source: [MDCalc — Ottawa Heart Failure Risk Scale (OHFRS)](https://www.mdcalc.com/calc/3994/ottawa-heart-failure-risk-scale-ohfrs)

Primary publication: Stiell IG, Clement CM, Brison RJ, et al. *A risk scoring system to identify emergency department patients with heart failure at high risk for serious adverse events.* **Acad Emerg Med.** 2013;20(1):17-26.

---

## 1. Purpose

Stratify ED patients with acute decompensated heart failure by their risk of **short-term serious adverse events (SAE)** in order to inform the disposition decision (admit vs. discharge with timely outpatient follow-up).

### Definition of SAE (study outcome)

Composite of:

- **Death from any cause within 30 days**, **OR** any of the following **within 14 days**:
  - Admission to a monitored unit (ICU, CCU, step-down)
  - Endotracheal intubation or non-invasive ventilation (BiPAP/CPAP) after disposition
  - Acute myocardial infarction (MI)
  - Major procedure (e.g. cardiopulmonary resuscitation, urgent revascularization, intra-aortic balloon pump, new dialysis, etc.)
  - **Relapse and hospital admission for HF** in patients originally discharged home from the ED

### Intended population

- Adult ED patients (≥50 years in the original cohort) being evaluated for **acute heart failure / acute decompensated HF**, after ED therapy (i.e. once initial response to treatment is known).

### Do **not** use when**

- The rule has **not been applied prior to ED intervention** (it is intended to be applied **after** ED therapy / once response is known).
- The patient is **hemodynamically unstable** (hypotension, cardiogenic shock, peri-arrest).
- ST-elevation myocardial infarction (STEMI) or another diagnosis independently mandating admission.
- Non-HF primary diagnosis.

---

## 2. Inputs

The OHFRS comprises **10 clinical, examination, walk-test, and laboratory criteria**. Each criterion is a Boolean (present / absent). Two scoring variants exist (see §3): a **basic** version (1 point per item) and a **quantitative** version with weighted points and a quantitative NT-proBNP threshold.

| # | Domain | Criterion | Type | Definition / threshold | Units |
|---|--------|-----------|------|-------------------------|-------|
| 1 | History | **History of stroke or TIA** | boolean | Any prior documented cerebrovascular accident (ischemic or hemorrhagic) **or** transient ischemic attack. | — |
| 2 | History | **History of intubation for respiratory distress** | boolean | Any prior endotracheal intubation for respiratory failure (any cause). | — |
| 3 | Examination (on arrival) | **Heart rate ≥ 110 bpm on ED arrival** | boolean | First measured heart rate at ED triage / arrival. | bpm |
| 4 | Examination (on arrival) | **SaO₂ < 90 % on arrival** | boolean | First measured peripheral oxygen saturation **on room air or on the patient's usual home O₂**, on ED arrival. | % |
| 5 | Examination (walk test) | **Heart rate ≥ 110 bpm during 3-minute walk test** *(or patient too ill to perform the walk test)* | boolean | After ED therapy, the patient performs a 3-minute walk test (see protocol below). HR ≥ 110 bpm at any time during the walk **or** inability to perform the test counts as positive. | bpm |
| 6 | Examination (walk test) | **Room-air SaO₂ < 90 % during/after 3-minute walk test** *(or patient too ill to perform the walk test)* | boolean | SaO₂ measured **on room air** during/after the 3-minute walk test. SaO₂ < 90 % **or** inability to perform the test counts as positive. | % |
| 7 | Investigations | **New ischemic changes on ECG** | boolean | New ST-segment depression / elevation, new T-wave inversion, or other acute ischemic changes on the 12-lead ECG (compared to prior tracing where available). | — |
| 8 | Investigations | **Urea ≥ 12 mmol/L** *(≈ BUN ≥ 33 mg/dL)* | boolean | Serum urea nitrogen on ED labs. | mmol/L (or mg/dL for BUN) |
| 9 | Investigations | **Serum CO₂ ≥ 35 mmol/L** | boolean | Serum total CO₂ (bicarbonate) on ED labs (venous or arterial). | mmol/L |
| 10 | Investigations | **Troponin elevation to MI level** | boolean | Troponin I or T elevated to a level meeting the local laboratory's myocardial-infarction cutoff (i.e. above the MI-decision threshold, not merely above the 99th percentile reference limit unless that is the local MI threshold). | — |
| 11 | Investigations *(quantitative version only)* | **NT-proBNP ≥ 5 000 ng/L** | boolean | Quantitative NT-proBNP measured in the ED. Only used in the **quantitative** version of the score. | ng/L (pg/mL) |

### Notes on inputs

- **HR thresholds** use **≥ 110 bpm** (not > 110).
- **SaO₂ thresholds** use **< 90 %** (not ≤ 90 %).
- The **walk-test HR criterion** is **on the patient's usual O₂ supplementation** (room air or home O₂); the **walk-test SaO₂ criterion** is specifically **on room air**.
- A patient who is **too ill to perform the walk test** is scored **positive** for both walk-test items.
- Apply the rule **after** initial ED treatment, when response to therapy can be assessed.

### 3-minute walk-test protocol

1. After initial ED therapy, once the patient is felt to be approaching disposition, ask the patient to **walk for up to 3 minutes** at a self-selected pace (corridor walk).
2. **HR criterion (item 5):** record HR continuously / at end-of-walk; HR ≥ 110 bpm at any point counts as positive. Performed on the patient's **usual O₂** (room air or home O₂).
3. **SaO₂ criterion (item 6):** record SaO₂ during/after the walk **on room air**. SaO₂ < 90 % counts as positive.
4. **Inability to perform** (e.g. too dyspneic, unable to ambulate due to acute illness) **counts as positive** for both walk-test items.

### Input data model (suggested)

```text
OhfrsInputs {
  history_stroke_or_tia:                boolean
  history_intubation_resp_distress:     boolean
  hr_arrival_ge_110:                    boolean      # bpm threshold
  sao2_arrival_lt_90:                   boolean      # %
  walk_test_hr_ge_110_or_unable:        boolean      # bpm (or unable)
  walk_test_room_air_sao2_lt_90_or_unable: boolean   # % (or unable)
  ecg_new_ischemia:                     boolean
  urea_ge_12_mmol_l:                    boolean      # mmol/L  (≈ BUN ≥ 33 mg/dL)
  serum_co2_ge_35_mmol_l:               boolean      # mmol/L
  troponin_elevated_to_mi_level:        boolean
  nt_probnp_ge_5000_ng_l:               boolean | null  # quantitative version only
  variant: "basic" | "quantitative"
}
```

---

## 3. Calculation

The OHFRS supports **two scoring variants**. Implementations should expose both; the *quantitative* variant is preferred when NT-proBNP is available, as it has improved sensitivity.

### 3.1 Basic OHFRS (1 point per criterion)

Each of the **10 criteria** (items 1–10 above) contributes **1 point**.

```
OHFRS_basic = sum of 10 boolean criteria, each worth 1 point
```

- **Score range: 0 – 10** (integer).

### 3.2 Quantitative OHFRS (weighted, with NT-proBNP)

Per the MDCalc encoding of Stiell 2013, weighted points are:

| # | Criterion | Points |
|---|-----------|--------|
| 1 | History of stroke or TIA | **+1** |
| 2 | History of intubation for respiratory distress | **+2** |
| 3 | Heart rate ≥ 110 bpm on ED arrival | **+2** |
| 4 | SaO₂ < 90 % on arrival | **+1** |
| 5 | HR ≥ 110 during 3-minute walk test (or too ill to perform) | **+1** |
| 6 | New ischemic changes on ECG | **+2** |
| 7 | Urea ≥ 12 mmol/L (BUN ≥ 33 mg/dL) | **+1** |
| 8 | Serum CO₂ ≥ 35 mmol/L | **+2** |
| 9 | Troponin I or T elevated to MI level | **+2** |
| 10 | NT-proBNP ≥ 5 000 ng/L | **+1** |

```
OHFRS_quantitative = sum of weighted criteria
```

- **Score range: 0 – 15** (integer).
- The walk-test SaO₂ < 90 % item is **not part of** the quantitative weighted formulation as encoded in MDCalc; implementations should follow the variant's defined item set strictly.

### Algorithm (pseudocode)

```text
def ohfrs(inputs: OhfrsInputs) -> int:
    if inputs.variant == "basic":
        return sum([
            inputs.history_stroke_or_tia,
            inputs.history_intubation_resp_distress,
            inputs.hr_arrival_ge_110,
            inputs.sao2_arrival_lt_90,
            inputs.walk_test_hr_ge_110_or_unable,
            inputs.walk_test_room_air_sao2_lt_90_or_unable,
            inputs.ecg_new_ischemia,
            inputs.urea_ge_12_mmol_l,
            inputs.serum_co2_ge_35_mmol_l,
            inputs.troponin_elevated_to_mi_level,
        ])
    else:  # "quantitative"
        return (
            1 * inputs.history_stroke_or_tia
          + 2 * inputs.history_intubation_resp_distress
          + 2 * inputs.hr_arrival_ge_110
          + 1 * inputs.sao2_arrival_lt_90
          + 1 * inputs.walk_test_hr_ge_110_or_unable
          + 2 * inputs.ecg_new_ischemia
          + 1 * inputs.urea_ge_12_mmol_l
          + 2 * inputs.serum_co2_ge_35_mmol_l
          + 2 * inputs.troponin_elevated_to_mi_level
          + 1 * (inputs.nt_probnp_ge_5000_ng_l or False)
        )
```

---

## 4. Output

### 4.1 14-day SAE risk by score (basic OHFRS)

The original derivation reported a graded relationship between OHFRS score and 14-day SAE risk, ranging from approximately **2.8 % at score 0** to **~89 %** at the highest scores (Stiell 2013). Implementations should expose the score and its band rather than a precise per-point probability when not directly cited from the derivation paper.

| Total score (basic) | Approximate 14-day SAE risk | Risk band |
|---|---|---|
| **0** | ~2.8 % | **Low** |
| **1** | ~5–7 % | **Low–intermediate** |
| **2** | ~10–15 % | **Intermediate** |
| **3** | ~20–25 % | **High** |
| **4** | ~30–40 % | **High** |
| **≥ 5** | up to ~89 % at top of scale | **Very high** |

> The exact stepwise probabilities are tabulated in the Stiell 2013 derivation paper and the 2017 validation paper; implementations that display per-score risks should source those numbers directly from the publication and cite them.

### 4.2 Sensitivity / specificity for SAE (validation cohort, Stiell 2017)

| Cutoff | Variant | Sensitivity for SAE | Resulting admission rate |
|---|---|---|---|
| Score ≥ 1 | basic (no NT-proBNP) | ~91.8 % | ~77.6 % (vs. 57.6 % usual care) |
| Score ≥ 1 | quantitative (with NT-proBNP) | ~95.8 % | ~88.0 % (vs. 60.8 % usual care) |
| Score ≥ 2 | basic | ~71.2 % | comparable to physician judgment (~71.8 %) |

### 4.3 Disposition recommendation

The OHFRS is intended to **support, not replace**, clinical judgment. Recommended thresholds (per MDCalc / Stiell):

| Score (basic) | Disposition guidance |
|---|---|
| **0 – 1** with **good response to ED therapy** | **Discharge** is reasonable, with **early outpatient HF follow-up (e.g. ≤ 7 days)**. Use a **higher** cutoff (≥ 2) if the goal is to limit admission rates closer to current practice. |
| **≥ 2** *(preferred operating point, comparable sensitivity to physician gestalt with reduced admissions)* | **Strongly consider admission** for monitored observation, IV diuresis, and risk modification. |
| **≥ 1** *(more sensitive operating point)* | Admit; this maximizes sensitivity at the cost of higher admission rates. Choice of cutoff is a system / shared-decision-making decision. |

### 4.4 Output data model (suggested)

```text
OhfrsResult {
  score:           integer       # 0..10 (basic) or 0..15 (quantitative)
  variant:         "basic" | "quantitative"
  risk_band:       "low" | "low_intermediate" | "intermediate" | "high" | "very_high"
  sae_14d_pct:     number | null # representative 14-day SAE probability if cited
  disposition:     "discharge_with_followup" | "admit_observe"
  components: {
    history_stroke_or_tia: 0|1,
    history_intubation_resp_distress: 0|1,
    hr_arrival_ge_110: 0|1,
    sao2_arrival_lt_90: 0|1,
    walk_test_hr_ge_110_or_unable: 0|1,
    walk_test_room_air_sao2_lt_90_or_unable: 0|1,   # basic only
    ecg_new_ischemia: 0|1,
    urea_ge_12_mmol_l: 0|1,
    serum_co2_ge_35_mmol_l: 0|1,
    troponin_elevated_to_mi_level: 0|1,
    nt_probnp_ge_5000_ng_l: 0|1|null                 # quantitative only
  }
}
```

### 4.5 Important caveats

- Apply the rule **after** ED therapy and only in **hemodynamically stable** patients.
- The **walk test** is integral to the score — skipping it (other than the documented "too ill to perform" pathway) invalidates the prediction.
- A **low score does not guarantee absence of SAE**; arrange close (≤ 7 day) HF follow-up for any discharged patient.
- The score has been derived and validated in a Canadian ED population; local recalibration may be needed.
- Use **local lab thresholds** for "troponin elevated to MI level"; document the assay used.
- The **quantitative variant** with NT-proBNP improves sensitivity and is preferred where NT-proBNP is available.
- The OHFRS has not yet been incorporated into a prospective interventional RCT demonstrating outcome improvement; use as a decision-support adjunct.

---

## 5. References

### Primary publication

1. **Stiell IG, Clement CM, Brison RJ, Rowe BH, Borgundvaag B, Aaron SD, Lang E, Calder LA, Perry JJ, Forster AJ, Wells GA.**
   *A risk scoring system to identify emergency department patients with heart failure at high risk for serious adverse events.*
   **Academic Emergency Medicine.** 2013;20(1):17-26.
   DOI: 10.1111/acem.12056 — <https://doi.org/10.1111/acem.12056>

### Validation

2. **Stiell IG, Perry JJ, Clement CM, Brison RJ, Rowe BH, Aaron SD, McRae AD, Borgundvaag B, Calder LA, Forster AJ, Wells GA.**
   *Prospective and explicit clinical validation of the Ottawa Heart Failure Risk Scale, with and without use of quantitative NT-proBNP.*
   **Academic Emergency Medicine.** 2017;24(3):316-327.
   DOI: 10.1111/acem.13141 — <https://doi.org/10.1111/acem.13141>
   PubMed: <https://pubmed.ncbi.nlm.nih.gov/27976497/>

### Calculator source

- MDCalc — Ottawa Heart Failure Risk Scale (OHFRS): <https://www.mdcalc.com/calc/3994/ottawa-heart-failure-risk-scale-ohfrs>

### Supporting commentary / reviews

- The Skeptics Guide to Emergency Medicine, SGEM #170 — Don't Go Breaking My Heart – Ottawa Heart Failure Risk Scale: <https://thesgem.com/2017/03/sgem170-dont-go-breaking-my-heart-ottawa-heart-failure-risk-scale/>
- CoreEM journal review — Performance of the Ottawa Heart Failure Risk Score: <https://coreem.net/journal-reviews/ohfrs/>
