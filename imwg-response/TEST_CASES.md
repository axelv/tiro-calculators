# IMWG 2016 Multiple Myeloma Response Criteria — Fictional Test Cases

Five fictional clinical vignettes that walk through the IMWG 2016 response decision tree (§3 of `SPEC.md`). Each case lists the relevant baseline and current measurements (§2), then maps the findings against the deepest-first response hierarchy (§3.3) to assign a single category.

Convention: SPEP = serum protein electrophoresis; UPEP = 24-h urine protein electrophoresis; IFE = immunofixation electrophoresis; FLC = serum free light chains; BMPC = bone-marrow plasma cells; SPD = sum of products of perpendicular diameters; NGF = next-gen flow; NGS = next-gen sequencing.

---

## Test case 1 — Partial Response (PR)

**Vignette.** Mr. Diego Fernández, 64-year-old man with newly diagnosed IgGκ multiple myeloma. After 4 cycles of VRd (bortezomib/lenalidomide/dexamethasone) his paraprotein has dropped substantially but is still readily detectable on SPEP and his urine is improving. Two consecutive monthly assessments confirm the values below; no new plasmacytomas, no CRAB features.

**Inputs**

| Field | Baseline | Current |
|---|---|---|
| Serum M-protein (g/dL) | 4.2 | 1.8 |
| Urine M-protein (mg / 24 h) | 850 | 150 |
| Serum IFE | positive | positive |
| Urine IFE | positive | positive |
| BMPC (%) | 45 | 12 |
| Plasmacytoma at baseline | no | — |
| FLC ratio | abnormal | abnormal |

**Decision-tree reasoning.**

- **CR / sCR / MRD-negative?** No — IFE remains positive in serum and urine, BMPC ≥ 5%. Skip MRD branch.
- **VGPR?** Requires serum/urine detectable by IFE only (negative on SPEP) **OR** ≥90% serum-M reduction with urine < 100 mg/24 h. Serum M-protein still 1.8 g/dL on SPEP (43% of baseline); reduction is 1 − 1.8/4.2 = **57%** (< 90%). VGPR not met.
- **PR?** Requires ≥50% reduction in serum M-protein **and** ≥90% reduction in urinary M-protein **or** to <200 mg/24 h.
  - Serum: 1 − 1.8/4.2 = **57.1%** (≥50%) ✓
  - Urine: 150 mg/24 h < 200 mg/24 h ✓ (also a 1 − 150/850 = **82.4%** reduction)
- Confirmed on two consecutive assessments.

**Expected output.**

```json
{
  "category": "PR",
  "category_label": "Partial Response",
  "criteria_met": [
    "≥50% serum M-protein reduction (57.1%)",
    "Urine M-protein < 200 mg/24h"
  ],
  "confirmed": true
}
```

---

## Test case 2 — Very Good Partial Response (VGPR)

**Vignette.** Ms. Aoife Kavanagh, 58-year-old woman with IgAλ myeloma, post-autologous stem-cell transplant day +100 evaluation. SPEP now shows no discernible peak but IFE remains faintly positive. Urine is below the measurable threshold and BMPC is 4%. Two assessments 4 weeks apart agree.

**Inputs**

| Field | Baseline | Current |
|---|---|---|
| Serum M-protein (g/dL) | 3.6 | not detectable on SPEP |
| Serum IFE | positive | **positive** (faint band) |
| Urine M-protein (mg / 24 h) | 320 | < 50 |
| Urine IFE | positive | positive (trace) |
| BMPC (%) | 38 | 4 |
| Plasmacytoma at baseline | no | — |

**Decision-tree reasoning.**

- **CR?** Requires negative IFE in serum **and** urine. Serum IFE remains positive — **CR not met**, so MRD branch is not reachable (per §3.4: MRD-negative requires CR).
- **VGPR?** Met when M-protein detectable by IFE but **not on electrophoresis**. Serum SPEP shows no measurable peak; serum IFE positive ✓.
- Confirmed on two consecutive timepoints.

**Expected output.**

```json
{
  "category": "VGPR",
  "category_label": "Very Good Partial Response",
  "criteria_met": [
    "M-protein detectable by IFE but not by SPEP",
    "Urine M-protein < 100 mg/24h"
  ],
  "confirmed": true
}
```

---

## Test case 3 — Stringent Complete Response (sCR)

**Vignette.** Dr. Margarethe Holst, 61-year-old retired physician with IgGκ myeloma, evaluated 6 months after VRd induction + ASCT + lenalidomide maintenance. SPEP/UPEP/IFE all negative; BM aspirate shows 1% plasma cells, polyclonal by 4-color flow; FLC ratio 0.95 (within normal 0.26–1.65). NGF MRD assessment was **not performed** at this visit.

**Inputs**

| Field | Current |
|---|---|
| Serum IFE | **negative** |
| Urine IFE | **negative** |
| BMPC (%) | 1 |
| Bone-marrow clonality | polyclonal |
| Plasmacytoma at baseline | no |
| FLC ratio | 0.95 (normal) |
| MRD performed | no |

**Decision-tree reasoning.**

- **CR criteria.** Negative serum and urine IFE ✓; no plasmacytomas at baseline (auto-met) ✓; BMPC < 5% ✓ → CR satisfied.
- **MRD branch.** NGF/NGS not performed — cannot assign Flow / Sequencing / Imaging+ MRD-negative or Sustained MRD-negative.
- **sCR refinement.** All CR criteria, **plus** normal FLC ratio (0.95) ✓ **and** absence of clonal plasma cells in BM by flow ✓ → **sCR**.

**Expected output.**

```json
{
  "category": "sCR",
  "category_label": "Stringent Complete Response",
  "criteria_met": [
    "Negative serum and urine IFE",
    "BMPC < 5% (1%)",
    "Normal FLC ratio (0.95)",
    "No clonal plasma cells in BM by 4-color flow"
  ],
  "confirmed": true,
  "mrd": { "performed": false }
}
```

---

## Test case 4 — Sustained MRD-negative (deepest category)

**Vignette.** Mr. Tobias Lindqvist, 56-year-old man with IgGλ myeloma in deep, durable remission post-tandem-ASCT and 2 years of maintenance. He has been in CR with negative IFE, normal FLC ratio, and BMPC 0% on serial biopsies. Two NGF MRD assessments at sensitivity 10⁻⁶ on bone marrow aspirates obtained **14 months apart** are both negative for clonal plasma cells. Baseline FDG-PET/CT had two avid lesions; current PET/CT shows complete resolution to below mediastinal blood-pool SUV.

**Inputs**

| Field | Current |
|---|---|
| Serum IFE | negative |
| Urine IFE | negative |
| BMPC (%) | 0 |
| BM clonality | polyclonal |
| FLC ratio | 1.10 (normal) |
| Plasmacytoma at baseline | yes (PET-avid) |
| Plasmacytoma current | resolved |
| NGF MRD (timepoint 1) | negative (sensitivity 10⁻⁶) |
| NGF MRD (timepoint 2, 14 months later) | negative |
| PET/CT current | all baseline lesions resolved (< mediastinal blood-pool SUV) |

**Decision-tree reasoning.**

- **CR met?** IFE serum & urine negative, BMPC < 5%, plasmacytomas resolved → ✓.
- **Imaging plus MRD-negative?** NGF negative ✓ + PET resolution ✓ → meets Imaging+ MRD-negative.
- **Sustained MRD-negative?** Two confirmed MRD-negative results ≥ 1 year apart with no intervening positive result and imaging clear → meets the deepest category. Per §3.3 evaluation order, **Sustained MRD-negative** is selected (it sits above Imaging+ MRD-negative in the hierarchy in §4 output ordering).

**Expected output.**

```json
{
  "category": "Sustained MRD-negative",
  "category_label": "Sustained MRD-negative (≥ 1 year)",
  "criteria_met": [
    "CR criteria",
    "NGF MRD-negative at sensitivity 10^-6 on two assessments 14 months apart",
    "PET/CT: all baseline tracer-avid lesions resolved",
    "No intervening MRD-positive result"
  ],
  "confirmed": true,
  "mrd": {
    "performed": true,
    "method": "NGF",
    "sensitivity": "10^-6",
    "interval_months": 14,
    "imaging_negative": true
  }
}
```

---

## Test case 5 — Edge case: Progressive Disease (PD) from nadir

**Vignette.** Mr. Yusuf Demir, 70-year-old man with relapsed IgGκ myeloma. After 6 cycles of carfilzomib-based therapy he reached a serum-M nadir of 0.4 g/dL with negative IFE and BMPC 3% (best response: VGPR-bordering-CR; IFE was originally just-positive at nadir). At today's visit (no intervening therapy), his serum-M has risen to 1.2 g/dL on SPEP, urine-M jumped from < 50 mg/24 h to 320 mg/24 h, and serum IFE is more strongly positive. Two consecutive assessments 4 weeks apart confirm the rise. No new bone lesions, no hypercalcaemia, no anaemia.

**Inputs**

| Field | Nadir (best response) | Current |
|---|---|---|
| Serum M-protein (g/dL) | 0.4 | 1.2 |
| Urine M-protein (mg / 24 h) | < 50 | 320 |
| Serum IFE | positive (faint) | positive (stronger) |
| BMPC (%) | 3 | 8 |
| Corrected calcium (mg/dL) | 9.4 | 9.5 |
| New plasmacytoma | no | no |

**Decision-tree reasoning (PD definition, §3.2).** Any one criterion is sufficient when confirmed on 2 consecutive assessments before next therapy.

- **Serum-M criterion.** Increase from nadir = 1.2 − 0.4 = **+0.8 g/dL**. Required: ≥25% increase from nadir AND absolute ≥ 0.5 g/dL (nadir < 5 g/dL).
  - Relative increase: 0.8 / 0.4 = **+200%** (≫ 25%) ✓
  - Absolute increase: 0.8 g/dL ≥ 0.5 g/dL ✓
  - **Serum-M criterion met.**
- **Urine-M criterion.** Increase from nadir = 320 − ~0 = +320 mg/24 h ✓ (≥ 200 mg/24 h absolute and ≥ 25% relative).
- No hypercalcaemia, no new plasmacytoma — those criteria do not contribute, but the M-protein criteria already establish PD.
- Confirmed on 2 consecutive assessments ✓.

**Expected output.**

```json
{
  "category": "PD",
  "category_label": "Progressive Disease",
  "criteria_met": [
    "Serum M-protein +0.8 g/dL from nadir (200% relative, ≥0.5 g/dL absolute)",
    "Urine M-protein +320 mg/24h from nadir"
  ],
  "confirmed": true,
  "notes": "Two consecutive assessments before any new therapy."
}
```
