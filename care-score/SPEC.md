# CARE Score for Acute Coronary Syndrome

Implementation specification for the **CARE Score** (also known as the **CARE rule** / **HEAR score**), a bedside, troponin-independent risk-stratification rule used in the emergency department (ED) to identify patients with non-traumatic chest pain who are at very low risk of acute coronary syndrome (ACS) and may be safely discharged without biological testing.

Authoritative source (calculator): [MDCalc — CARE Score for Acute Coronary Syndrome](https://www.mdcalc.com/calc/10591/care-score-acute-coronary-syndrome)

> **Note on source recoverability.** The MDCalc page at the URL above currently returns a 404 to automated fetch and could not be retrieved verbatim during preparation of this spec. The variable definitions, scoring, and risk bands below are reconstructed from the **primary publication** (Moumneh et al., *Intern Emerg Med* 2018) and the **HEART Score** derivation (Six et al., *Neth Heart J* 2008), since the CARE rule is by definition the **first four components of the HEART Score** (History, ECG, Age, Risk factors — i.e. HEART **without** the Troponin term). Items that depend on MDCalc-specific wording or thresholds and could not be confirmed are flagged `TBD — see [MDCalc]`.

---

## 1. Purpose

Identify ED patients with non-traumatic chest pain who are at **very low risk of major adverse cardiac events (MACE) at 6 weeks** using only history, 12-lead ECG, age, and cardiovascular risk factors — i.e. **without any laboratory / troponin assay**.

The CARE rule is intended as a **rule-out tool**: a "negative CARE" result supports safe early discharge from the ED without serial troponin testing. It is *not* designed to risk-stratify higher-risk patients — those should be evaluated with the full HEART Score (or HEART Pathway) plus troponin.

### Outcome predicted

**6-week MACE**, defined (per Moumneh 2018, aligning with HEART Score validation) as the composite of:

- All-cause mortality
- Acute myocardial infarction (AMI)
- Coronary revascularization (PCI or CABG)

### Intended population

- Adult ED patients with **non-traumatic chest pain** suggestive of possible ACS.

### Do **not** use when any of the following are present

- ST-segment elevation on the presenting ECG meeting STEMI criteria (these patients require immediate reperfusion).
- Other new diagnostic ECG changes mandating immediate intervention.
- Hemodynamic instability / hypotension / shock.
- Obvious alternative diagnosis (e.g. trauma, pneumothorax) explaining the presentation.
- Life expectancy <1 year or another non-cardiac illness independently requiring admission.

---

## 2. Inputs

The CARE Score is the sum of **four components**, each scored **0**, **1**, or **2** points. Definitions for each level mirror the HEART Score (Six 2008, Backus 2010/2013), of which CARE is the troponin-omitting subset.

| # | Component (mnemonic) | Type | Allowed values | Definition per level |
|---|----------------------|------|----------------|----------------------|
| 1 | **History** | enum (0\|1\|2) | 0 = Slightly suspicious<br>1 = Moderately suspicious<br>2 = Highly suspicious | Clinician's overall impression of the chest-pain history (location, character, radiation, onset, duration, relation to exertion, accompanying symptoms, response to nitrates, prior similar episodes).<br>**0** Mostly non-classical / atypical features.<br>**1** Mixed classical and atypical features.<br>**2** Predominantly classical ACS features. |
| 2 | **ECG** | enum (0\|1\|2) | 0 = Normal<br>1 = Non-specific repolarization disturbance<br>2 = Significant ST-deviation | **0** Completely normal 12-lead ECG.<br>**1** Repolarization abnormalities without significant ST-depression/elevation; ST changes in the presence of bundle-branch block, typical LVH, or post-cardioversion / digoxin effect.<br>**2** Significant ST-segment depression or elevation in the **absence** of bundle-branch block, LVH, or digoxin effect. |
| 3 | **Age** | enum (0\|1\|2) | 0 = <45 years<br>1 = 45–64 years<br>2 = ≥65 years | Patient age in completed years at time of presentation. |
| 4 | **Risk factors** | enum (0\|1\|2) | 0 = No known risk factors<br>1 = 1–2 risk factors<br>2 = ≥3 risk factors **OR** history of atherosclerotic disease | Risk factors counted (HEART definitions):<br>• Hypertension<br>• Hypercholesterolemia<br>• Diabetes mellitus<br>• Obesity (BMI > 30 kg/m²)<br>• Current smoking, or smoking cessation ≤ 3 months ago<br>• Positive family history of CVD (parent or sibling with CVD before age 65)<br><br>**Atherosclerotic disease** (auto-scores 2 regardless of count): prior MI, prior PCI or CABG, prior CVA / TIA, or peripheral arterial disease. |

### Input data model (suggested)

```text
CareScoreInputs {
  history:       0 | 1 | 2          # H — clinician judgment
  ecg:           0 | 1 | 2          # E — 12-lead ECG interpretation
  age_years:     integer ≥ 0        # A — mapped to 0/1/2 below
  risk_factors:  0 | 1 | 2          # R — count + atherosclerotic-disease override
}
```

**Age mapping:** `age_years < 45 → 0`; `45 ≤ age_years ≤ 64 → 1`; `age_years ≥ 65 → 2`.

**Risk-factor mapping:** count the risk factors above. If patient has any documented atherosclerotic disease, force the value to `2` regardless of count. Otherwise: `0 risk factors → 0`; `1 or 2 → 1`; `≥3 → 2`.

---

## 3. Calculation

```
CARE = History + ECG + Age + Risk factors
```

- Each component contributes **0, 1, or 2** points.
- Total score range: **0 – 8** (integer).
- The CARE Score is exactly the HEART Score with the Troponin term omitted.

---

## 4. Output

### 4.1 Risk bands

The CARE rule was derived primarily as a binary **rule-out** test. Two thresholds appear in the published literature; the calculator should expose the threshold defined on MDCalc (TBD) and may default to the original Moumneh threshold.

| Total score | Risk band | 6-week MACE (Moumneh 2018, n = 641) | Recommended disposition |
|-------------|-----------|--------------------------------------|--------------------------|
| **0 – 1**   | **Low** ("negative CARE")  | 0 % (95 % CI 0.0 – 1.9 %); ~31 % of ED chest-pain patients ruled out without any biomarker | Consider safe **discharge** from the ED without troponin testing; arrange appropriate follow-up. |
| **≥ 2**     | **Not low** ("positive CARE") | TBD — see [MDCalc] | **Do not** rule out with CARE alone; proceed to full HEART Score with troponin (or HEART Pathway / serial hs-cTn protocol). |

> **Alternative threshold.** The closely related **HEAR score** (Moumneh et al., *Acad Emerg Med* 2021 — same four components) was validated with a low-risk cutoff of **< 2** (i.e. 0 or 1) yielding 30-day MACE 0.1 % (95 % CI 0.1 – 0.3 %), sensitivity 97.9 %, in ~19 % of patients. This is operationally equivalent to "CARE ≤ 1". Some implementations may also expose **CARE ≤ 3** as an extended low-risk band by analogy with the HEART Score's 0–3 low-risk band; this is **not** the originally validated cutoff and should be labelled accordingly. `TBD — confirm against MDCalc`.

### 4.2 Output data model (suggested)

```text
CareScoreResult {
  score:        integer 0..8
  risk_band:    "low" | "not_low"
  threshold:    1                      # the cutoff used; surface in UI
  mace_6w_pct:  number | null          # 0 % for negative CARE per Moumneh 2018; null otherwise
  disposition:  "discharge_no_troponin" | "proceed_to_full_workup"
  components: {
    history: 0|1|2,
    ecg: 0|1|2,
    age: 0|1|2,
    risk_factors: 0|1|2
  }
}
```

### 4.3 Important caveats

- The CARE rule **rules out**, but does not rule in, ACS. A score above the low-risk threshold means "not low risk by CARE" — **not** "high risk".
- A negative CARE supports discharge **only** when overall clinical judgment agrees and there is no other indication for admission (e.g. ongoing pain of unclear cause, concerning vital signs, social factors).
- The rule has been validated on adult ED chest-pain populations with relatively low STEMI prevalence; performance in primary care or non-chest-pain presentations is **not** established.
- As CARE excludes troponin, it deliberately accepts a slightly higher residual MACE risk than the troponin-inclusive HEART Score in exchange for avoiding biological testing in roughly one-third of patients.
- The score is a **decision aid**, not a substitute for clinical judgment, and does not replace standard chest-pain workup when symptoms are ongoing or the ECG is dynamic.

---

## 5. References

### Primary publication

1. **Moumneh T, Richard-Jourjon V, Friou E, Hugli O, Soulié C, Brunel P, Vandercamere T, Choukroun J, Carneiro B, Soulat L, Roy P-M, Penaloza A.** Reliability of the CARE rule and the HEART score to rule out an acute coronary syndrome in non-traumatic chest pain patients. *Internal and Emergency Medicine.* 2018 Oct;13(7):1111–1119.
   DOI: 10.1007/s11739-018-1803-4 — PMID: 29500619 — <https://pubmed.ncbi.nlm.nih.gov/29500619/>

### Supporting / related publications

2. **Six AJ, Backus BE, Kelder JC.** Chest pain in the emergency room: value of the HEART score. *Netherlands Heart Journal.* 2008;16(6):191–196.
   PMCID: PMC2442661 — <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2442661/>

3. **Backus BE, Six AJ, Kelder JC, et al.** A prospective validation of the HEART score for chest pain patients at the emergency department. *International Journal of Cardiology.* 2013;168(3):2153–2158.
   DOI: 10.1016/j.ijcard.2013.01.255 — <https://doi.org/10.1016/j.ijcard.2013.01.255>

4. **Moumneh T, Penaloza A, Cismaș A-M, Charpentier S, Yordanov Y, Roy P-M, Douillet D.** Identifying patients with low risk of acute coronary syndrome without troponin testing: validation of the HEAR score. *Academic Emergency Medicine.* 2021 Jan;28(1):76–82. (HEAR = the four-component, troponin-free variant; same components as CARE, low-risk cutoff < 2.)
   PMID: 33127371 — <https://pubmed.ncbi.nlm.nih.gov/33127371/>

### Calculator source

- MDCalc — CARE Score for Acute Coronary Syndrome: <https://www.mdcalc.com/calc/10591/care-score-acute-coronary-syndrome>
