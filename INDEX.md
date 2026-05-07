# Calculators Index

Source-of-truth: Notion brief [GTM #1 — Cardio Calculators](https://www.notion.so/318bd303e1d88107844cf09c123e779b). Synced 2026-05-05 from the `MDCalc calculators` data source (`collection://317bd303-e1d8-80e2-87da-000b6ead6a08`) filtered to `Specialty contains "Cardiology"`.

## Project metadata

| Field | Value |
|---|---|
| Project | GTM #1 — Cardio Calculators |
| Specialty | Cardiology |
| Priority | P0 |
| Status | Running |
| SPOC | Andries |
| Dates | 2026-03-03 → 2026-03-17 |
| Live app | [calculators.tiro.health](https://calculators.tiro.health) (preview: [tiro-health.github.io/calculators-v2](https://tiro-health.github.io/calculators-v2/)) |
| Sprint board | [GH project — cardiology filter](https://github.com/orgs/Tiro-health/projects/6/views/1?filterQuery=repo%3A+cardiology) |
| Reference | [tiro-marker](https://github.com/Tiro-health/tiro-marker) |

**Pitch:** Fast, clean web app for cardiologists to run the standard clinical risk calculators they use daily. No login, no EHR — just results.

**MVP scope:** Clean result with clinical interpretation, mobile-friendly.
**Out of scope:** No login, no saved history, no EHR integration, no payments, no PDF export.
**Tech:** Tiro web-SDK + lightweight React, pure JS calculator logic, hosted on Vercel, no auth.
**Success metrics:** 50+ unique users within 2 weeks of launch, 5+ traceable shares, 3+ unsolicited "this is exactly what I needed" messages.

---

## Cardiology — P0 (shipped or in progress)

These are the only entries in the Notion DB with `Priority = P0`. All five have a `templates.tiro.health` public reference, meaning they're wired into the live app.

| # | Calculator | Use case | Status | Public reference | MDCalc |
|---|---|---|---|---|---|
| 1 | **Euroscore II** | Cardiac surgery operative mortality | ✅ Done | [template](http://templates.tiro.health/templates/3171b88fff9a4b61af84fe354a26b48b) | [calc/3955](https://www.mdcalc.com/calc/3955/euroscore-ii) |
| 2 | **CHADS₂ Score** | AF stroke risk (predecessor to CHA₂DS₂-VASc) | ✅ Done | [template](http://templates.tiro.health/templates/9f1f296ba5ae415f97c8e71464c402df) | [calc/1840](https://www.mdcalc.com/calc/1840/chads2-score-atrial-fibrillation-stroke-risk) |
| 3 | **HAS-BLED Score** | Bleeding risk on anticoagulation in AF | ✅ Done | [template](http://templates.tiro.health/templates/71a49276146c4492a9053bfb296d0d17) | [calc/807](https://www.mdcalc.com/calc/807/has-bled-score-major-bleeding-risk) |
| 4 | **TRI-SCORE** | Isolated tricuspid valve surgery risk | ✅ Done | [template](http://templates.tiro.health/templates/718620a797d84dd58bd2c92d395e0e90) | [tri-score.com](https://www.tri-score.com/) |
| 5 | **GRACE ACS Risk and Mortality** | Mortality in ACS admissions | 🟡 In progress | — | [calc/1099](https://www.mdcalc.com/calc/1099/grace-acs-risk-mortality-calculator) |

> **Notion-vs-brief discrepancy:** The brief's pain-point section names CHA₂DS₂-VASc, EuroSCORE, GRACE, and HAS-BLED. CHA₂DS₂-VASc is currently `Status = Not started` with no Priority set in Notion — only its predecessor CHADS₂ is shipped. Worth confirming whether CHA₂DS₂-VASc should be promoted (Germonpré feedback flagged it as less clinically essential since cardiologists compute it from memory).

---

## Cardiology — backlog (in DB, no priority assigned)

All other cardiology entries from the data source. None have `Priority = P0/P1/P2` set, so they're not in the Notion view's scope today, but they exist in the database as candidates.

| # | Calculator | Use case | Status | MDCalc |
|---|---|---|---|---|
| 1 | Atrial Fibrillation Stroke Risk (CHA₂DS₂-VASc) | AF stroke risk | Not started | [calc/801](https://www.mdcalc.com/calc/801/cha2ds2-vasc-score-atrial-fibrillation-stroke-risk) |
| 2 | HEMORR₂HAGES | Bleeding risk in elderly AF | Not started | [calc/1785](https://www.mdcalc.com/calc/1785/hemorr2hages-score-major-bleeding-risk) |
| 3 | ORBIT Bleeding Score | Bleeding risk on anticoagulation in AF | Not started | [calc/10092](https://www.mdcalc.com/calc/10092/orbit-bleeding-score-atrial-fibrillation) |
| 4 | HATCH Score | AF recurrence after cardioversion | Not started | [calc/2056](https://www.mdcalc.com/calc/2056/hatch-score-atrial-fibrillation-recurrence-cardioversion) |
| 5 | AFISS | AF in sepsis | Not started | [calc/10646](https://www.mdcalc.com/calc/10646/atrial-fibrillation-sepsis-score-afiss) |
| 6 | HEART Score | 6-week MACE in chest pain | Not started | [calc/1752](https://www.mdcalc.com/calc/1752/heart-score-major-cardiac-events) |
| 7 | TIMI Risk Score for STEMI | 30-day mortality in STEMI | Not started | [calc/99](https://www.mdcalc.com/calc/99/timi-risk-score-stemi) |
| 8 | TIMI Risk Score for UA/NSTEMI | 14-day adverse outcome in UA/NSTEMI | Not started | [calc/111](https://www.mdcalc.com/calc/111/timi-risk-score-ua-nstemi) |
| 9 | TIMI Risk Index | ACS mortality from BP/HR/age | Not started | [calc/665](https://www.mdcalc.com/calc/665/timi-risk-index) |
| 10 | Subtle Anterior STEMI (4-Variable) | Distinguish early STEMI from BER | Not started | [calc/10079](https://www.mdcalc.com/calc/10079/subtle-anterior-stemi-calculator-4-variable) |
| 11 | T-MACS Decision Aid | Troponin-only ACS rule-out | Not started | [calc/3942](https://www.mdcalc.com/calc/3942/troponin-manchester-acute-coronary-syndromes-t-macs-decision-aid) |
| 12 | CARE Score for ACS | ACS mortality risk | Not started | [calc/10591](https://www.mdcalc.com/calc/10591/care-score-acute-coronary-syndrome) |
| 13 | SCORE2 | 10-yr CV risk (40–69 y) | Not started | [calc/10499](https://www.mdcalc.com/calc/10499/systematic-coronary-risk-evaluation-score2) |
| 14 | SCORE2-OP | 10-yr CV risk (older persons) | Not started | [calc/10503](https://www.mdcalc.com/calc/10503/score2-older-persons-score2-op) |
| 15 | SCORE2-Diabetes | 10-yr CV risk in T2DM | Not started | [calc/10510](https://www.mdcalc.com/calc/10510/score2-diabetes) |
| 16 | Framingham Risk (Hard CHD) | 10-yr MI/cardiac death | Not started | [calc/38](https://www.mdcalc.com/calc/38/framingham-risk-score-hard-coronary-heart-disease) |
| 17 | PCP-HF Risk Score | 10-yr heart failure risk | Not started | [calc/10638](https://www.mdcalc.com/calc/10638/pooled-cohort-equations-prevent-heart-failure-pcp-hf-risk-score) |
| 18 | MAGGIC | 1/3-yr HF mortality | Not started | [calc/3803](https://www.mdcalc.com/calc/3803/maggic-risk-calculator-heart-failure) |
| 19 | Seattle Heart Failure Model | HF survival prediction | Not started | [calc/3808](https://www.mdcalc.com/calc/3808/seattle-heart-failure-model) |
| 20 | Ottawa Heart Failure Risk Scale | ED disposition for AHF | Not started | [calc/3994](https://www.mdcalc.com/calc/3994/ottawa-heart-failure-risk-scale-ohfrs) |
| 21 | Killip Classification | HF severity post-MI | Not started | [calc/1353](https://www.mdcalc.com/calc/1353/killip-classification-heart-failure) |
| 22 | Steinhart Model | Acute HF in undifferentiated dyspnea | Not started | [calc/10474](https://www.mdcalc.com/calc/10474/steinhart-model-acute-heart-failure-ahf-undifferentiated-dyspnea) |
| 23 | ADHERE Algorithm | In-hospital AHF mortality | Not started | [calc/3829](https://www.mdcalc.com/calc/3829/acute-decompensated-heart-failure-national-registry-adhere-algorithm) |
| 24 | Infective Endocarditis Mortality | 6-mo IE mortality | Not started | [calc/3121](https://www.mdcalc.com/calc/3121/infective-endocarditis-ie-mortality-risk-score) |

---

## Hematology-Oncology

From the "Calculators Valentine" shortlist embedded in the GTM-1 page (highlighted rows = on MDCalc). Notion DB view filter: `Specialty contains "Hematology and Oncology" AND Priority in (P0, P1)`. Per-row priority not yet enriched.

| # | Calculator | Indication | Source |
|---|---|---|---|
| 1 | IPSS-M | MDS | [mds-risk-model.com](https://mds-risk-model.com/) — *not on MDCalc* |
| 2 | DIPSS | Myelofibrosis | MDCalc — Dynamic International Prognostic Scoring System |
| 3 | MIPSS70 / MIPSS70+ | Myelofibrosis | MDCalc — Mutation-Enhanced International Prognostic Score |
| 4 | EBMT Transplant Score | Stem cell transplantation | MDCalc — EBMT Risk Score |
| 5 | R-ISS | Multiple myeloma | MDCalc — Revised Multiple Myeloma International Staging System |
| 6 | IMWG Response Criteria | Multiple myeloma | MDCalc — Multiple Myeloma Response Criteria |
| 7 | SOKAL | CML | MDCalc — Sokal Index for CML |
| 8 | ELTS | CML | EUTOS Long-Term Survival Score — *not on MDCalc* |
| 9 | HCT-CI | Stem cell transplantation | MDCalc — Hematopoietic Cell Transplantation-specific Comorbidity Index |
| 10 | HEMATOTOX | CAR-T | *not on MDCalc* |
| 11 | CCRS | Clonal cytopenia | *not on MDCalc* |

---

## Urology / Oncology

### EAU NMIBC Risk Calculator
- **Domain:** Urology — Non-Muscle-Invasive Bladder Cancer
- **Purpose:** Predicts risk of progression in NMIBC patients per EAU guidelines.
- **Reference implementation:** [nmibc.net](https://nmibc.net)
- **Inputs:**
  - Age (`≤ 70` / `> 70`)
  - Tumor status (`Primary` / `Recurrent`)
  - Number of tumors (`Single` / `Multiple`)
  - Maximum tumor diameter (`< 3 cm` / `≥ 3 cm`)
  - Stage (`Ta` / `T1`)
  - Concomitant CIS (`No` / `Yes`)
  - WHO Grade 2004/2016 (`LMP-LG` / `HG`)
  - WHO Grade 1973 (`G1` / `G2` / `G3`)
  - Selectable classification system: WHO 1973, WHO 2004/2016, or both
- **Output:** Progression risk stratification per selected classification system.
- **Status:** `planned`
