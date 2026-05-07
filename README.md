# Tiro Calculators

41 clinical risk calculators shipped as **FHIR R5 SDC Questionnaires** and rendered with the [Tiro Web SDK](https://cdn.tiro.health/sdk/next/tiro-web-sdk.iife.js). Every calculator is verified end-to-end against its published test cases by a [Playwright suite](./tests/) (~205 tests).

Each link below opens a live, interactive form.

## Cardiology

| Calculator | Use case | Live |
|---|---|---|
| EuroSCORE II | Cardiac surgery operative mortality | [open](https://axelv.github.io/tiro-calculators/harness/?q=euroscore-ii) |
| CHA₂DS₂-VASc | AF stroke risk | [open](https://axelv.github.io/tiro-calculators/harness/?q=cha2ds2-vasc) |
| CHADS₂ | AF stroke risk (predecessor) | [open](https://axelv.github.io/tiro-calculators/harness/?q=chads2) |
| HAS-BLED | Bleeding risk on anticoagulation in AF | [open](https://axelv.github.io/tiro-calculators/harness/?q=has-bled) |
| HEMORR₂HAGES | Bleeding risk in elderly AF | [open](https://axelv.github.io/tiro-calculators/harness/?q=hemorr2hages) |
| ORBIT Bleeding Score | Bleeding risk on anticoagulation in AF | [open](https://axelv.github.io/tiro-calculators/harness/?q=orbit-bleeding) |
| HATCH Score | AF recurrence after cardioversion | [open](https://axelv.github.io/tiro-calculators/harness/?q=hatch-score) |
| AFISS | AF in sepsis | [open](https://axelv.github.io/tiro-calculators/harness/?q=afiss) |
| TRI-SCORE | Isolated tricuspid valve surgery risk | [open](https://axelv.github.io/tiro-calculators/harness/?q=tri-score) |
| GRACE ACS | Mortality in ACS admissions | [open](https://axelv.github.io/tiro-calculators/harness/?q=grace-acs) |
| HEART Score | 6-week MACE in chest pain | [open](https://axelv.github.io/tiro-calculators/harness/?q=heart-score) |
| TIMI Risk Score for STEMI | 30-day mortality in STEMI | [open](https://axelv.github.io/tiro-calculators/harness/?q=timi-stemi) |
| TIMI Risk Score for UA/NSTEMI | 14-day adverse outcome in UA/NSTEMI | [open](https://axelv.github.io/tiro-calculators/harness/?q=timi-ua-nstemi) |
| TIMI Risk Index | ACS mortality from BP / HR / age | [open](https://axelv.github.io/tiro-calculators/harness/?q=timi-risk-index) |
| Subtle Anterior STEMI (4-Variable) | Distinguish early STEMI from BER | [open](https://axelv.github.io/tiro-calculators/harness/?q=subtle-anterior-stemi) |
| T-MACS Decision Aid | Troponin-only ACS rule-out | [open](https://axelv.github.io/tiro-calculators/harness/?q=t-macs) |
| CARE Score for ACS | ACS mortality risk | [open](https://axelv.github.io/tiro-calculators/harness/?q=care-score) |
| SCORE2 | 10-yr CV risk (40–69 y) | [open](https://axelv.github.io/tiro-calculators/harness/?q=score2) |
| SCORE2-OP | 10-yr CV risk (older persons) | [open](https://axelv.github.io/tiro-calculators/harness/?q=score2-op) |
| SCORE2-Diabetes | 10-yr CV risk in T2DM | [open](https://axelv.github.io/tiro-calculators/harness/?q=score2-diabetes) |
| Framingham Risk (Hard CHD) | 10-yr MI / cardiac death | [open](https://axelv.github.io/tiro-calculators/harness/?q=framingham-chd) |
| PCP-HF | 10-yr heart failure risk | [open](https://axelv.github.io/tiro-calculators/harness/?q=pcp-hf) |
| MAGGIC | 1- / 3-yr HF mortality | [open](https://axelv.github.io/tiro-calculators/harness/?q=maggic) |
| Seattle Heart Failure Model | HF survival prediction (1/2/3/5 y, mean LE) | [open](https://axelv.github.io/tiro-calculators/harness/?q=seattle-heart-failure) |
| Ottawa Heart Failure Risk Scale | ED disposition for AHF | [open](https://axelv.github.io/tiro-calculators/harness/?q=ottawa-hf-risk) |
| Killip Classification | HF severity post-MI | [open](https://axelv.github.io/tiro-calculators/harness/?q=killip) |
| Steinhart Model | Acute HF in undifferentiated dyspnea | [open](https://axelv.github.io/tiro-calculators/harness/?q=steinhart-ahf) |
| ADHERE Algorithm | In-hospital AHF mortality | [open](https://axelv.github.io/tiro-calculators/harness/?q=adhere) |
| Infective Endocarditis Mortality | 6-mo IE mortality | [open](https://axelv.github.io/tiro-calculators/harness/?q=ie-mortality) |

## Hematology / Oncology

| Calculator | Use case | Live |
|---|---|---|
| IPSS-M | MDS prognostic score | [open](https://axelv.github.io/tiro-calculators/harness/?q=ipss-m) |
| DIPSS | Dynamic IPSS for myelofibrosis | [open](https://axelv.github.io/tiro-calculators/harness/?q=dipss) |
| MIPSS70 / MIPSS70+ v2.0 | Mutation-enhanced PMF score | [open](https://axelv.github.io/tiro-calculators/harness/?q=mipss70) |
| EBMT Transplant Score | Stem cell transplantation risk | [open](https://axelv.github.io/tiro-calculators/harness/?q=ebmt-transplant) |
| R-ISS | Multiple myeloma staging | [open](https://axelv.github.io/tiro-calculators/harness/?q=r-iss) |
| IMWG Response Criteria | Multiple myeloma response | [open](https://axelv.github.io/tiro-calculators/harness/?q=imwg-response) |
| SOKAL Index | CML prognostic score | [open](https://axelv.github.io/tiro-calculators/harness/?q=sokal) |
| ELTS | EUTOS Long-Term Survival in CML | [open](https://axelv.github.io/tiro-calculators/harness/?q=elts) |
| HCT-CI | HCT-specific Comorbidity Index | [open](https://axelv.github.io/tiro-calculators/harness/?q=hct-ci) |
| HEMATOTOX | CAR-T hematologic toxicity | [open](https://axelv.github.io/tiro-calculators/harness/?q=hematotox) |
| CCRS | Clonal cytopenia risk score | [open](https://axelv.github.io/tiro-calculators/harness/?q=ccrs) |

## Urology

| Calculator | Use case | Live |
|---|---|---|
| EAU NMIBC Risk Calculator | Progression risk in NMIBC | [open](https://axelv.github.io/tiro-calculators/harness/?q=eau-nmibc) |

---

## Repository structure

Each calculator lives under `<slug>/`:

```
<slug>/
├── SPEC.md            # source of truth — what to compute and why
├── TEST_CASES.md      # source of truth — input/output assertions
├── FHIRPATH.md        # advisory FHIRPath sketch
├── questionnaire.json # the FHIR R5 SDC Questionnaire
└── README.md          # (some calcs) implementer notes / SPEC deviations
```

Workspace files:
- [`harness/index.html`](./harness/index.html) — minimal page that fetches a calc's `questionnaire.json` and renders it inline via `<tiro-form-filler>`.
- [`tests/`](./tests/) — one Playwright spec per calculator + shared `_helpers.ts`.
- [`CONVENTIONS.md`](./CONVENTIONS.md) — locked SDK quirks, item-type rules, FHIRPath patterns.
- [`INDEX.md`](./INDEX.md) — Notion-synced project metadata and priority view.

## Developing locally

```bash
bun install
bunx playwright install chromium
bun run test
```

The dev server runs at `http://localhost:4173/`; open `http://localhost:4173/harness/?q=<slug>` to drive any calc by hand.

## SPEC items needing follow-up before clinical deployment

Surfaced by the implementation pass; tracked per-calc in each `<slug>/README.md`:

- **SCORE2 / SCORE2-OP / SCORE2-Diabetes** — the published β-equation diverges from the ESC chart-published illustrative values in the mid-to-high-risk region. All three need a unified review on chart-mode vs formula-mode.
- **AFISS** — Klein Klouwenberg 2017 β coefficients are paywalled; ships with a count-based surrogate.
- **MAGGIC** — mortality lookup is "TBD" for 49 / 51 rows in SPEC; only `total_points` + `risk_band` are exposed.
- **GRACE ACS** — GRACE 2.0 / Eagle 6-month nomogram coefficients aren't public; only the in-hospital nomogram ships.
- **Steinhart-AHF** — primary regression β unavailable; ships an LR-Bayesian path with two interpolated LRs (300–1799 and 1800–2699 pg/mL bands) that aren't from the literature.
- **Seattle Heart Failure** — CRT-P uses the CARE-HF 0.64 fallback; LVAD support is omitted.
- **CCRS** — SPEC §3.1 (sums to 15.5) and §3.2 (claims max 16.5) are internally inconsistent.
- **IPSS-M** — SPEC §3.2 means snapshot drifts from `TEST_CASES.md` by ~0.04–0.10 log₂HR units; risk bands are still correct.
