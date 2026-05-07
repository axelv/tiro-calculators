# HEART Score — Fictional Test Cases

Five fictional clinical vignettes for the HEART Score (Backus 2010 / 2013).
Scoring uses the five-component table from `SPEC.md` §2 and the risk-band /
disposition table from §4.1.

All patients and details are fictional.

---

## Test case 1 — HEART 1 (low — discharge)

**Vignette.** Ms Aïsha Karimi, a 28-year-old PhD student and current smoker,
presents with 30 minutes of left submammary pleuritic pain that started
while studying. The pain is reproducible on palpation, unrelated to
exertion, and resolved spontaneously. She has no other risk factors and no
family history of CVD. ECG is completely normal. Initial troponin is below
the assay's reference limit.

**Inputs and component scoring**

| Component | Value | Points |
|---|---|---|
| H — History | Slightly suspicious (atypical, reproducible) | 0 |
| E — ECG | Normal | 0 |
| A — Age | 28 (< 45) | 0 |
| R — Risk factors | 1 (smoker) | 1 |
| T — Troponin | ≤ URL (ratio ~ 0.3) | 0 |

**Total HEART:** 0 + 0 + 0 + 1 + 0 = **1**

**Expected output**

- Score: 1
- Risk band: **Low** (0–3)
- 6-week MACE (Backus 2013 prospective): ~1.7 %
- Disposition: **discharge** with appropriate outpatient follow-up;
  consider further workup only if clinical suspicion persists.

---

## Test case 2 — HEART 3 (low — top of low band)

**Vignette.** Mr Jonas Müller, a 42-year-old accountant, presents with a
30-minute episode of central chest tightness during a stressful meeting.
Pain was non-radiating; partial relief with rest. He has hypertension and
a 20-pack-year smoking history (quit 2 weeks ago, so still counts as
current per the score). ECG is normal with no ST deviation, no LBBB, and
no repolarisation abnormality. Initial troponin is 1.5× the assay's upper
reference limit.

**Inputs and component scoring**

| Component | Value | Points |
|---|---|---|
| H — History | Moderately suspicious | 1 |
| E — ECG | Normal | 0 |
| A — Age | 42 (< 45) | 0 |
| R — Risk factors | 2 (HTN, smoker) | 1 |
| T — Troponin | 1.5× URL | 1 |

**Total HEART:** 1 + 0 + 0 + 1 + 1 = **3**

**Expected output**

- Score: 3
- Risk band: **Low** (0–3)
- 6-week MACE: ~1.7 %
- Disposition: **discharge** — but at the top of the low band; many
  institutional HEART Pathway protocols would still observe for serial
  troponins (hs-cTn 0/3-h) before final disposition. Counsel patient and
  arrange outpatient cardiology follow-up.

---

## Test case 3 — HEART 5 (moderate — admit/observe)

**Vignette.** Mrs Carmen Reyes, a 61-year-old woman with hypertension,
hypercholesterolaemia, and type 2 diabetes, presents with 90 minutes of
retrosternal pressure with mixed features — partly exertional, partly at
rest, no clear radiation, only partial relief with rest. ECG shows
non-specific T-wave flattening in the lateral leads without significant
ST deviation, BBB, or LVH. Initial troponin is below the assay's upper
reference limit.

**Inputs and component scoring**

| Component | Value | Points |
|---|---|---|
| H — History | Moderately suspicious | 1 |
| E — ECG | Non-specific repolarisation | 1 |
| A — Age | 61 (45–64) | 1 |
| R — Risk factors | ≥ 3 (HTN, hypercholesterolaemia, DM) | 2 |
| T — Troponin | ≤ URL | 0 |

**Total HEART:** 1 + 1 + 1 + 2 + 0 = **5**

**Expected output**

- Score: 5
- Risk band: **Moderate** (4–6)
- 6-week MACE: ~16.6 %
- Disposition: **admit/observe** — serial troponins, repeat ECG, and
  non-invasive ischaemia evaluation (exercise stress, stress imaging,
  or coronary CT angiography) per institutional protocol.

---

## Test case 4 — HEART 8 (high — early invasive)

**Vignette.** Mr Wilhelm Hartmann, a 72-year-old man with a prior MI and PCI
4 years ago, presents with 2 hours of crushing retrosternal pain radiating
to both arms, diaphoretic and pale. Pain is unrelieved by sublingual
nitrate. ECG shows non-specific T-wave inversion in the inferior leads
without significant ST deviation, BBB, or LVH. Initial troponin is 2.5× the
assay's upper reference limit.

**Inputs and component scoring**

| Component | Value | Points |
|---|---|---|
| H — History | Highly suspicious (classical) | 2 |
| E — ECG | Non-specific repolarisation | 1 |
| A — Age | 72 (≥ 65) | 2 |
| R — Risk factors | Prior MI/PCI ⇒ atherosclerotic disease (auto = 2) | 2 |
| T — Troponin | 2.5× URL (1 < ratio ≤ 3) | 1 |

**Total HEART:** 2 + 1 + 2 + 2 + 1 = **8**

**Expected output**

- Score: 8
- Risk band: **High** (7–10)
- 6-week MACE: ~50.1 %
- Disposition: **early invasive** — cardiology consultation, consider
  invasive coronary angiography. Initiate guideline-directed medical
  therapy (DAPT, anticoagulation, statin, beta-blocker) per local NSTE-ACS
  pathway.

---

## Test case 5 — HEART 10 (edge case, maximum)

**Vignette.** Mr Mehmet Demir, an 80-year-old man with prior MI, prior CABG,
prior stroke, and peripheral arterial disease, presents with 3 hours of
classical crushing chest pain unrelieved by nitrate, diaphoretic. ECG shows
2 mm ST depression across the precordium without LBBB or LVH (no STEMI
indication for emergent reperfusion). Initial troponin is 12× URL.

**Inputs and component scoring**

| Component | Value | Points |
|---|---|---|
| H — History | Highly suspicious | 2 |
| E — ECG | Significant ST depression | 2 |
| A — Age | 80 (≥ 65) | 2 |
| R — Risk factors | Multiple atherosclerotic disease (auto = 2) | 2 |
| T — Troponin | 12× URL (> 3) | 2 |

**Total HEART:** 2 + 2 + 2 + 2 + 2 = **10** (maximum)

**Expected output**

- Score: 10
- Risk band: **High** (7–10)
- 6-week MACE: ~50–65 % (Backus 2010 retrospective ~65.2 %; Backus 2013
  prospective ~50.1 %)
- Disposition: **early invasive** — urgent cardiology consultation;
  proceed to invasive coronary angiography per ESC NSTE-ACS guidelines
  (very-high-risk features may push toward immediate < 2 h
  catheterisation if there is haemodynamic or electrical instability).

---

*Disposition recommendations and 6-week MACE estimates follow Backus 2010 /
2013 as reproduced in `SPEC.md` §4.1.*
