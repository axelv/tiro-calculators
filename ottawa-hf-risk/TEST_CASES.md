# Ottawa Heart Failure Risk Scale (OHFRS) — Fictional Test Cases

Five fictional clinical test cases applied **after** initial ED therapy in
hemodynamically stable patients with acute decompensated heart failure. Cases
span low to very-high risk plus minimum and maximum-score edges. All patients,
demographics, and lab values are illustrative.

---

## Test case 1 — Basic OHFRS = 0, Low risk (minimum-score edge case)

### Vignette
**Beatrice Lemmens**, a 68-year-old woman with chronic HFpEF presenting with
2 days of orthopnea after dietary indiscretion. After 80 mg IV furosemide
in the ED she feels much better, completes a 3-minute corridor walk without
desaturation, and is hemodynamically stable.

### Inputs (basic variant)

| Field key | Value |
|---|---|
| `variant` | `basic` |
| `history_stroke_or_tia` | false |
| `history_intubation_resp_distress` | false |
| `hr_arrival_ge_110` | false (HR 92) |
| `sao2_arrival_lt_90` | false (SaO₂ 94% RA) |
| `walk_test_hr_ge_110_or_unable` | false (peak HR 96) |
| `walk_test_room_air_sao2_lt_90_or_unable` | false (SaO₂ 93% RA on walk) |
| `ecg_new_ischemia` | false |
| `urea_ge_12_mmol_l` | false (urea 6.8) |
| `serum_co2_ge_35_mmol_l` | false (HCO₃ 26) |
| `troponin_elevated_to_mi_level` | false |

### Expected output

- Sum of 10 boolean criteria, each 1 point: 0+0+0+0+0+0+0+0+0+0

**Total basic = 0 → Low risk; ~2.8% 14-day SAE risk**
- Disposition: **Discharge** with early outpatient HF follow-up (≤ 7 days) is reasonable

---

## Test case 2 — Basic OHFRS = 1, Low–intermediate

### Vignette
**Robert Macintyre**, a 74-year-old man with HFrEF (EF 30%) and a remote TIA
two years ago, presenting with a one-week increase in dyspnea on exertion. He
arrives stable and responds well to ED diuresis; walk test is unremarkable;
labs and ECG are unchanged.

### Inputs (basic variant)

| Field key | Value |
|---|---|
| `variant` | `basic` |
| `history_stroke_or_tia` | true (TIA 2 yr ago) |
| `history_intubation_resp_distress` | false |
| `hr_arrival_ge_110` | false (HR 88) |
| `sao2_arrival_lt_90` | false (SaO₂ 95% RA) |
| `walk_test_hr_ge_110_or_unable` | false (peak HR 102) |
| `walk_test_room_air_sao2_lt_90_or_unable` | false (SaO₂ 92%) |
| `ecg_new_ischemia` | false |
| `urea_ge_12_mmol_l` | false (urea 9.4) |
| `serum_co2_ge_35_mmol_l` | false (HCO₃ 28) |
| `troponin_elevated_to_mi_level` | false |

### Expected output

- History stroke/TIA: **1** · all other items: 0

**Total basic = 1 → Low–intermediate; ~5–7% 14-day SAE risk**
- Disposition (cutoff ≥ 1 = sensitive): admit; (cutoff ≥ 2): discharge with ≤ 7-day follow-up acceptable. Decision is system-/clinician-dependent

---

## Test case 3 — Basic OHFRS = 3, High risk; quantitative = 6

### Vignette
**Aïsha Belkacem**, a 79-year-old woman with HFrEF presenting with worsening
dyspnea and lower-limb edema. After diuresis she is stable but tachycardic on
arrival, has elevated urea on baseline labs, and her ECG shows new lateral
T-wave inversions that were not present on her tracing 3 months ago. NT-proBNP
8 200 ng/L. Troponin is not elevated to MI threshold; SaO₂ is preserved.

### Inputs

| Field key | Value |
|---|---|
| `history_stroke_or_tia` | false |
| `history_intubation_resp_distress` | false |
| `hr_arrival_ge_110` | true (HR 116 on arrival) |
| `sao2_arrival_lt_90` | false (SaO₂ 92%) |
| `walk_test_hr_ge_110_or_unable` | false (peak HR 104 post-Rx) |
| `walk_test_room_air_sao2_lt_90_or_unable` | false |
| `ecg_new_ischemia` | true (new lateral T-wave inversions) |
| `urea_ge_12_mmol_l` | true (urea 14.8 mmol/L) |
| `serum_co2_ge_35_mmol_l` | false (HCO₃ 27) |
| `troponin_elevated_to_mi_level` | false |
| `nt_probnp_ge_5000_ng_l` | true (NT-proBNP 8 200) |

### Expected output

**Basic (1 point each, items 1–10):**
- HR arrival ≥ 110: **1**
- ECG new ischemia: **1**
- Urea ≥ 12: **1**
- All other items: 0

**Total basic = 3 → High risk; ~20–25% 14-day SAE risk**

**Quantitative (weighted):**
- HR arrival ≥ 110: **+2**
- ECG new ischemia: **+2**
- Urea ≥ 12: **+1**
- NT-proBNP ≥ 5 000: **+1**

**Total quantitative = 6**

- Disposition: **Admit** for monitored observation, IV diuresis, and ischemia work-up

---

## Test case 4 — Basic OHFRS = 5, Very high risk

### Vignette
**Giorgio Bellini**, an 81-year-old man with severe HFrEF and a prior
intubation for respiratory failure 3 years ago, presenting with acute
decompensation. After IV furosemide and BiPAP weaning he is stable but
remains too dyspneic to perform a corridor walk; his arrival vitals showed
tachycardia and hypoxemia, urea is elevated, and ECG shows no new ischemia.
Troponin and serum CO₂ are within normal limits.

### Inputs

| Field key | Value |
|---|---|
| `variant` | `basic` |
| `history_stroke_or_tia` | false |
| `history_intubation_resp_distress` | true |
| `hr_arrival_ge_110` | true (HR 118) |
| `sao2_arrival_lt_90` | true (SaO₂ 87% RA) |
| `walk_test_hr_ge_110_or_unable` | true (unable to perform) |
| `walk_test_room_air_sao2_lt_90_or_unable` | true (unable to perform) |
| `ecg_new_ischemia` | false |
| `urea_ge_12_mmol_l` | false (urea 11.4) |
| `serum_co2_ge_35_mmol_l` | false (HCO₃ 26) |
| `troponin_elevated_to_mi_level` | false |

### Expected output (basic)

- History intubation: **1**
- HR arrival ≥ 110: **1**
- SaO₂ arrival < 90%: **1**
- Walk-test HR (unable): **1**
- Walk-test SaO₂ (unable): **1**
- All other items: 0

**Total basic = 5 → Very high risk; up to ~89% top-of-scale**
- Disposition: **Admit** to monitored bed; consider step-down/CCU given prior intubation history and inability to walk

---

## Test case 5 — Basic OHFRS = 10 / Quantitative = 15 (maximum-score edge case)

### Vignette
**Olivia Carmichael**, an 83-year-old woman with severe HFrEF, prior
intubation for respiratory distress and a prior ischemic stroke, presenting
with acute pulmonary edema. After ED therapy she is hemodynamically stable
but remains too unwell to ambulate. ECG shows new anterior ST depression;
labs show urea 19 mmol/L, HCO₃ 38 mmol/L, troponin elevated to MI level,
NT-proBNP 21 000 ng/L; SaO₂ 86% on RA at arrival.

### Inputs

| Field key | Value |
|---|---|
| `history_stroke_or_tia` | true |
| `history_intubation_resp_distress` | true |
| `hr_arrival_ge_110` | true (HR 124) |
| `sao2_arrival_lt_90` | true (SaO₂ 86% RA) |
| `walk_test_hr_ge_110_or_unable` | true (unable) |
| `walk_test_room_air_sao2_lt_90_or_unable` | true (unable) |
| `ecg_new_ischemia` | true |
| `urea_ge_12_mmol_l` | true (urea 19) |
| `serum_co2_ge_35_mmol_l` | true (HCO₃ 38) |
| `troponin_elevated_to_mi_level` | true |
| `nt_probnp_ge_5000_ng_l` | true (NT-proBNP 21 000) |

### Expected output

**Basic (1 point each, all 10 items positive):**
1+1+1+1+1+1+1+1+1+1 = **10 (maximum on basic scale)**

**Quantitative (weighted):**
- History stroke/TIA: **+1**
- History intubation: **+2**
- HR arrival ≥ 110: **+2**
- SaO₂ arrival < 90: **+1**
- Walk-test HR ≥ 110 (unable): **+1**
- ECG new ischemia: **+2**
- Urea ≥ 12: **+1**
- Serum CO₂ ≥ 35: **+2**
- Troponin to MI level: **+2**
- NT-proBNP ≥ 5 000: **+1**

**Total quantitative = 15 (maximum on quantitative scale)**

- Risk band: **Very high**; expected 14-day SAE risk approaches the top of the scale (~89%)
- Disposition: **Admit** to monitored unit (CCU/ICU consideration given the troponin elevation, ischemic ECG changes, and inability to ambulate)
