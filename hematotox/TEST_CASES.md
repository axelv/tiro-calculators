# CAR-HEMATOTOX — Fictional Test Cases

Five fictional clinical vignettes for the CAR-HEMATOTOX (HT) score
(Rejeski 2021), used pre-lymphodepletion to risk-stratify hematologic
toxicity and severe infections after CD19 CAR-T therapy in r/r LBCL.

Scoring uses the per-item points from `SPEC.md` §3.1 and the binary
HT-low / HT-high categorisation from §4.1.

All patients and details are fictional.

---

## Test case 1 — HT 0 (HT-low)

**Vignette.** Ms Eva Rønning, a 41-year-old woman with r/r DLBCL, two prior
lines (R-CHOP, then R-DHAP-failed ASCT bridge), referred for axicabtagene
ciloleucel. Pre-lymphodepletion labs (day −6): well-preserved haematopoiesis
and no inflammation.

**Inputs**

| Variable | Value | Points |
|---|---|---|
| Platelet count | 220 × 10⁹/L | 0 (> 175) |
| ANC | 3,400 cells/µL | 0 (≥ 1,200) |
| Hemoglobin | 12.4 g/dL | 0 (≥ 9.0) |
| CRP | 0.8 mg/dL | 0 (< 3.0) |
| Ferritin | 180 ng/mL | 0 (< 650) |

**Total HT:** 0 + 0 + 0 + 0 + 0 = **0**

**Expected output**

- Score: 0
- Category (Rejeski 2021 binary): **HT-low** (0–1)
- Optional 3-tier (secondary): **Low**
- Predicted outcomes: short median severe-neutropenia duration (~5.5 d),
  short total neutropenia (~7 d), severe thrombocytopenia ~34 %, anemia
  ~40 %, severe infection rate low (~8–13 %), lower NRM.
- Suggested actions: standard monitoring; routine antimicrobial prophylaxis
  per institution.

---

## Test case 2 — HT 1 (HT-low, edge of low band)

**Vignette.** Mr Lukas Bauer, 58, with relapsed DLBCL after frontline
R-CHOP, planned for tisagenlecleucel. Pre-lymphodepletion bloods:
mildly cytopenic from prior chemotherapy but no inflammation.

**Inputs**

| Variable | Value | Points |
|---|---|---|
| Platelet count | 130 × 10⁹/L | 1 (75–175) |
| ANC | 1,800 cells/µL | 0 (≥ 1,200) |
| Hemoglobin | 10.5 g/dL | 0 (≥ 9.0) |
| CRP | 1.4 mg/dL | 0 (< 3.0) |
| Ferritin | 320 ng/mL | 0 (< 650) |

**Total HT:** 1 + 0 + 0 + 0 + 0 = **1**

**Expected output**

- Score: 1
- Category (Rejeski 2021 binary): **HT-low** (0–1)
- Predicted outcomes: as for HT-low cohort.
- Suggested actions: standard monitoring; an additional risk hit (e.g. CRP
  edging above 3.0 in the days before infusion) would tip him to HT-high,
  so re-check labs immediately before lymphodepletion.

---

## Test case 3 — HT 3 (HT-high)

**Vignette.** Mrs Helena Marković, 64, heavily pre-treated r/r DLBCL (4
prior lines including ASCT), referred for axicabtagene ciloleucel.
Pre-lymphodepletion labs (day −5): persistent post-chemotherapy cytopenias
and modestly elevated inflammatory markers.

**Inputs**

| Variable | Value | Points |
|---|---|---|
| Platelet count | 110 × 10⁹/L | 1 (75–175) |
| ANC | 950 cells/µL | 1 (< 1,200) |
| Hemoglobin | 10.1 g/dL | 0 (≥ 9.0) |
| CRP | 4.2 mg/dL | 1 (≥ 3.0) |
| Ferritin | 540 ng/mL | 0 (< 650) |

**Total HT:** 1 + 1 + 0 + 1 + 0 = **3**

**Expected output**

- Score: 3
- Category (Rejeski 2021 binary): **HT-high** (≥ 2)
- Optional 3-tier: **Intermediate** (2–4)
- Predicted outcomes: prolonged severe neutropenia (median ~12 d), longer
  total neutropenia (~16.5 d), markedly higher rates of severe
  thrombocytopenia (~87 %), anemia (~96 %), and grade ≥ 3 infections
  (~30–40 %).
- Suggested actions: heightened infection surveillance, broader
  antimicrobial / antifungal prophylaxis, earlier G-CSF, multidisciplinary
  review pre-infusion.

---

## Test case 4 — HT 5 (HT-high, "ultra high" in 3-tier)

**Vignette.** Mr Yousef Habib, 70, double-refractory DLBCL with marrow
involvement on biopsy, planned for axicabtagene ciloleucel after a long
bridging chemo-immunotherapy course. Pre-lymphodepletion labs (day −6):
significant cytopenias and anaemia, with moderately raised ferritin but
CRP just below the threshold.

**Inputs**

| Variable | Value | Points |
|---|---|---|
| Platelet count | 60 × 10⁹/L | 2 (< 75) |
| ANC | 700 cells/µL | 1 (< 1,200) |
| Hemoglobin | 8.5 g/dL | 1 (< 9.0) |
| CRP | 2.4 mg/dL | 0 (< 3.0) |
| Ferritin | 1,400 ng/mL | 1 (650–2,000) |

**Total HT:** 2 + 1 + 1 + 0 + 1 = **5**

**Expected output**

- Score: 5
- Category (Rejeski 2021 binary): **HT-high** (≥ 2)
- Optional 3-tier: **High / "ultra high"** (≥ 5)
- Predicted outcomes: substantially prolonged cytopenias and high
  infectious-complication rates expected (per HT-high cohort, with the
  ultra-high subset showing the worst outcomes in subsequent
  validations).
- Suggested actions: full HT-high bundle — broad antimicrobial /
  antifungal prophylaxis, low threshold for G-CSF and pre-emptive
  thrombopoietin-receptor agonists, early stem-cell-boost discussion,
  inpatient management with proactive surveillance cultures, early ICU
  consultation in the event of CRS or infection.

---

## Test case 5 — HT 7 (edge case, maximum)

**Vignette.** Mrs Aïda Benali, 67, with extensively pretreated r/r DLBCL
(5 prior lines), bone-marrow involvement, recent neutropenic enterocolitis
that prolonged her bridging course. Pre-lymphodepletion labs (day −5)
show profound cytopenias and severe systemic inflammation. The team is
debating whether to proceed with CAR-T given the predicted toxicity
profile.

**Inputs**

| Variable | Value | Points |
|---|---|---|
| Platelet count | 40 × 10⁹/L | 2 (< 75) |
| ANC | 400 cells/µL | 1 (< 1,200) |
| Hemoglobin | 7.8 g/dL | 1 (< 9.0) |
| CRP | 9.5 mg/dL | 1 (≥ 3.0) |
| Ferritin | 3,200 ng/mL | 2 (> 2,000) |

**Total HT:** 2 + 1 + 1 + 1 + 2 = **7** (maximum)

**Expected output**

- Score: 7
- Category (Rejeski 2021 binary): **HT-high** (≥ 2)
- Optional 3-tier: **High / "ultra high"** (≥ 5)
- Predicted outcomes: highest tier of expected toxicity in the published
  validation cohorts — markedly prolonged severe neutropenia, near-universal
  severe cytopenias, high infection rate and elevated NRM.
- Suggested actions: maximal HT-high bundle (see case 4) plus explicit
  multidisciplinary discussion about whether the toxicity-benefit balance
  still favours CAR-T. Consider delaying infusion to control inflammation
  (treat occult infection, optimise nutrition, transfusion support) and
  reassess HT score immediately before lymphodepletion if delay is
  feasible.

---

*Per-item thresholds and binary HT-low / HT-high categorisation follow
Rejeski 2021 (`SPEC.md` §3.1, §4.1). The optional 3-tier split is taken
from secondary validation cohorts as flagged in `SPEC.md` §4.2.*
