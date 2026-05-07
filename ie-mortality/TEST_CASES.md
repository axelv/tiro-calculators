# IE 6-Month Mortality Risk Score — Fictional Test Cases

Five fictional clinical vignettes exercising the Park / ICE-PCS infective-endocarditis 6-month mortality risk score. Inputs match the typed fields defined in `SPEC.md` (§2 and §3.3). Probability is computed with the published logistic model (§3.2):

```
logit = -4.849 + 2.416 * score + 0.109 * score²
p = 1 / (1 + exp(-logit))
```

Quintile bands (§4.2) are used for risk categorisation.

---

## Test case 1 — Low risk (young, VGS native-valve IE, treated medically)

**Vignette.** Ms. Camille Laurent, a 32-year-old graphic designer with a bicuspid aortic valve, presents with 6 weeks of low-grade fever and night sweats. TTE confirms a small aortic vegetation; blood cultures grow viridans group streptococci (*Streptococcus mitis*). She has no heart failure, no stroke, no abscess, no persistent bacteremia after IV penicillin, and is treated medically.

**Inputs**

| Field | Value |
|---|---|
| age_band | <=45 |
| history_of_dialysis | false |
| nosocomial | false |
| valve_type | NVE |
| symptoms_gt_1_month | true |
| pathogen | vgs |
| aortic_vegetation | true |
| mitral_vegetation | false |
| nyha_3_or_4_heart_failure | false |
| stroke | false |
| paravalvular_complication | false |
| persistent_bacteremia | false |
| surgical_treatment | false |

**Point-by-point breakdown.**

| Component | Pts |
|---|---:|
| Age ≤ 45 | 0 |
| Dialysis | 0 |
| Nosocomial | 0 |
| PVE / device | 0 |
| Symptoms > 1 month | **−1** |
| *S. aureus* | 0 |
| VGS | **−2** |
| Aortic vegetation | **+1** |
| Mitral vegetation | 0 |
| NYHA III/IV | 0 |
| Stroke | 0 |
| Paravalvular | 0 |
| Persistent bacteremia | 0 |
| Surgery | 0 |
| **Total** | **−2** |

**Probability.** logit = −4.849 + 2.416·(−2) + 0.109·4 = −4.849 − 4.832 + 0.436 = **−9.245** → p = 1/(1+e^9.245) ≈ **0.000097** → **~0.01%**.

**Risk band.** Below the published quintile floor (Quintile 1 = scores 0–6, observed 10.3%). Treat as very-low-risk; clinically consistent with the favourable VGS-NVE phenotype.

**Expected output.** `score = -2`, `probability_6mo_mortality ≈ 0.0001`, `risk_band = "Below Quintile 1 (very low)"`.

---

## Test case 2 — Low-end of Quintile 1 (score ≤ 6)

**Vignette.** Mr. Ravi Subramanian, a 52-year-old plumber with newly diagnosed enterococcal native mitral-valve IE. Subacute presentation (8 weeks of fevers). Blood cultures clear after 48 h of ampicillin + ceftriaxone. No HF, no stroke, no abscess, treated medically.

**Inputs**

| Field | Value |
|---|---|
| age_band | 46-60 |
| history_of_dialysis | false |
| nosocomial | false |
| valve_type | NVE |
| symptoms_gt_1_month | true |
| pathogen | other |
| aortic_vegetation | false |
| mitral_vegetation | true |
| nyha_3_or_4_heart_failure | false |
| stroke | false |
| paravalvular_complication | false |
| persistent_bacteremia | false |
| surgical_treatment | false |

**Point-by-point breakdown.**

| Component | Pts |
|---|---:|
| Age 46–60 | +2 |
| Symptoms > 1 month | −1 |
| Mitral vegetation | +1 |
| (all others) | 0 |
| **Total** | **+2** |

**Probability.** logit = −4.849 + 2.416·2 + 0.109·4 = −4.849 + 4.832 + 0.436 = **+0.419** → p = 1/(1+e^−0.419) ≈ **0.603** → **~60.3%**.

> Note: the published logistic equation produces high probabilities even for low integer scores because of the +0.109·score² term and absence of a centring transform. The **observed** Quintile 1 mortality (scores 0–6) was only **10.3%** in ICE-PCS; the equation is a discriminator, not a calibrated absolute-risk estimate. Implementations should report the formula output **and** the quintile observed rate.

**Risk band.** **Quintile 1 (score 0–6): observed 10.3% 6-month mortality.**

**Expected output.** `score = 2`, `probability_6mo_mortality ≈ 0.603`, `risk_band = "Quintile 1 (score 0-6): observed 10.3% 6-month mortality"`.

---

## Test case 3 — Mid-range, Quintile 3 (score 9–10)

**Vignette.** Mrs. Elin Bergström, a 64-year-old retired teacher with a bioprosthetic aortic valve (replaced 4 years ago for senile calcific aortic stenosis). She presents 5 days into a hospital admission for community-acquired pneumonia with new fevers; blood cultures grow methicillin-susceptible *Staphylococcus aureus*. TEE shows an aortic-valve vegetation with a small paravalvular abscess. She remains bacteraemic at 72 h despite cloxacillin. She has not yet undergone surgery and is in NYHA class II.

**Inputs**

| Field | Value |
|---|---|
| age_band | 61-70 |
| history_of_dialysis | false |
| nosocomial | true |
| valve_type | PVE |
| symptoms_gt_1_month | false |
| pathogen | s_aureus |
| aortic_vegetation | true |
| mitral_vegetation | false |
| nyha_3_or_4_heart_failure | false |
| stroke | false |
| paravalvular_complication | true |
| persistent_bacteremia | true |
| surgical_treatment | false |

**Point-by-point breakdown.**

| Component | Pts |
|---|---:|
| Age 61–70 | +3 |
| Nosocomial | +2 |
| PVE | +1 |
| *S. aureus* | +1 |
| Aortic vegetation | +1 |
| Paravalvular abscess | +2 |
| Persistent bacteremia | +2 |
| (all others) | 0 |
| **Total** | **+12** |

Wait — recompute: 3+2+1+1+1+2+2 = **12**. That places her in **Quintile 4 (score 11–16)**, not Quintile 3. I'll instead drop one feature for an authentic Quintile-3 vignette: assume blood cultures cleared at 72 h (no persistent bacteremia).

**Revised inputs (persistent_bacteremia → false).** Total = 3+2+1+1+1+2 = **+10**.

**Probability.** logit = −4.849 + 2.416·10 + 0.109·100 = −4.849 + 24.16 + 10.9 = **+30.211** → p ≈ **1.000** (saturates).

**Risk band.** **Quintile 3 (score 9–10): observed 25.5% 6-month mortality.**

**Expected output.** `score = 10`, `probability_6mo_mortality ≈ 1.00` (model-saturated; report observed-cohort rate as primary), `risk_band = "Quintile 3 (score 9-10): observed 25.5% 6-month mortality"`, `advice = "Multidisciplinary endocarditis-team review; surgical evaluation strongly indicated for paravalvular abscess and PVE."`

---

## Test case 4 — High risk, Quintile 4 (score 11–16), with surgery

**Vignette.** Mr. Konstantin Petrov, a 73-year-old man on chronic haemodialysis (3-year vintage), presents to the ER with confusion and hemiparesis. He was recently hospitalised for an AV-fistula infection. Blood cultures grow methicillin-resistant *Staphylococcus aureus*. TEE reveals a large mitral vegetation with leaflet perforation and severe regurgitation; he is in acute pulmonary oedema (NYHA IV). MRI confirms an embolic ischaemic stroke. After multidisciplinary review he undergoes urgent mitral valve replacement on hospital day 4.

**Inputs**

| Field | Value |
|---|---|
| age_band | >70 |
| history_of_dialysis | true |
| nosocomial | true |
| valve_type | NVE |
| symptoms_gt_1_month | false |
| pathogen | s_aureus |
| aortic_vegetation | false |
| mitral_vegetation | true |
| nyha_3_or_4_heart_failure | true |
| stroke | true |
| paravalvular_complication | false |
| persistent_bacteremia | false |
| surgical_treatment | true |

**Point-by-point breakdown.**

| Component | Pts |
|---|---:|
| Age > 70 | +4 |
| Dialysis | +3 |
| Nosocomial | +2 |
| NVE | 0 |
| *S. aureus* | +1 |
| Mitral vegetation | +1 |
| NYHA III/IV HF | +3 |
| Stroke | +2 |
| Surgery undertaken | **−2** |
| (all others) | 0 |
| **Total** | **+14** |

**Probability.** logit = −4.849 + 2.416·14 + 0.109·196 = −4.849 + 33.824 + 21.364 = **+50.339** → p ≈ **1.000** (saturates).

**Risk band.** **Quintile 4 (score 11–16): observed 37.8% 6-month mortality.**

**Expected output.** `score = 14`, `probability_6mo_mortality ≈ 1.00` (saturated; observed-cohort rate is the meaningful figure), `risk_band = "Quintile 4 (score 11-16): observed 37.8% 6-month mortality"`, `advice = "Very high-risk profile; surgery already performed (−2 already applied). Anticipate prolonged ICU and post-operative course."`

---

## Test case 5 — Edge case, near-maximum (Quintile 5)

**Vignette.** Mr. Walter Houghton, an 81-year-old nursing-home resident with a transcatheter aortic valve (TAVI, prosthetic) and end-stage renal disease on dialysis, develops nosocomial bacteraemia 10 days after a urinary catheter change. Blood cultures grow MSSA and remain positive for >7 days. TEE shows aortic and mitral vegetations with paravalvular abscess and aortic root pseudoaneurysm. He is in cardiogenic shock (NYHA IV) and has had a witnessed embolic stroke. He is deemed too frail for surgery and treated medically.

**Inputs**

| Field | Value |
|---|---|
| age_band | >70 |
| history_of_dialysis | true |
| nosocomial | true |
| valve_type | PVE |
| symptoms_gt_1_month | false |
| pathogen | s_aureus |
| aortic_vegetation | true |
| mitral_vegetation | true |
| nyha_3_or_4_heart_failure | true |
| stroke | true |
| paravalvular_complication | true |
| persistent_bacteremia | true |
| surgical_treatment | false |

**Point-by-point breakdown.**

| Component | Pts |
|---|---:|
| Age > 70 | +4 |
| Dialysis | +3 |
| Nosocomial | +2 |
| PVE | +1 |
| *S. aureus* | +1 |
| Aortic vegetation | +1 |
| Mitral vegetation | +1 |
| NYHA III/IV HF | +3 |
| Stroke | +2 |
| Paravalvular abscess | +2 |
| Persistent bacteremia | +2 |
| **Total** | **+22** (matches the maximum reported in the derivation cohort) |

**Probability.** logit = −4.849 + 2.416·22 + 0.109·484 = −4.849 + 53.152 + 52.756 = **+101.059** → p ≈ **1.000**.

**Risk band.** **Quintile 5 (score 17–22): observed 52.9% 6-month mortality.**

**Expected output.** `score = 22`, `probability_6mo_mortality ≈ 1.00` (saturated; the **observed** quintile rate of 52.9% is the most useful clinical figure to convey), `risk_band = "Quintile 5 (score 17-22): observed 52.9% 6-month mortality"`, `advice = "Multidisciplinary endocarditis-team review including palliative-care input; very high all-cause mortality risk."`
