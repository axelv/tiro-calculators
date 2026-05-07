# AFISS (SAFE Score) — FHIRPath expressions

> **BLOCKED ON COEFFICIENTS.** The form contract below (linkIds, types, required flags, enableWhen patterns) is fully buildable today. The **calculated expression for `score` cannot be finalised** because Klein Klouwenberg 2017 β-coefficients (β0 + β1…β10) are flagged `TBD — see source` in `SPEC.md` §3 and could not be extracted from the AJRCCM Online Data Supplement, the authors' Shiny calculator (`safescore.shinyapps.io/safe/`), or any open-access secondary source. All `<TBD_β…>` placeholders below must be replaced verbatim from the primary publication's online supplement (or by reverse-engineering the Shiny app's server-side R object) **before** the questionnaire is wired into clinical use. Approximation will materially degrade discrimination — the published external validation already showed AUC drop 0.81 → 0.60 with the *unmodified* original model (Bedford / Rucci 2022, *Ann Am Thorac Soc*), so any guessed values will be worse.

---

## Item linkIds (QuestionnaireResponse contract)

linkIds match SPEC §2 variable keys verbatim (lower_snake_case). All items are evaluated **per ICU-day** while the patient remains at risk.

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2 #1 Age | years; 18–110 expected |
| `bmi` | decimal | true | §2 #2 BMI | kg/m²; can be derived from height + weight if SDC `valueExpression` is preferred |
| `immunocompromised` | boolean | true | §2 #3 Immunocompromised | per SPEC definition (heme malignancy, transplant, chronic steroids, recent chemo, congenital/acquired ID) |
| `septic_shock` | boolean | true | §2 #4 Septic shock | Sepsis-3: vasopressors for MAP ≥65 + lactate >2 despite resus |
| `vasopressor_inotrope` | boolean | true | §2 #5 Vasopressor / inotrope use | any continuous IV vasopressor or inotrope on day-of-prediction |
| `crp` | decimal | true | §2 #6 CRP | mg/L |
| `wbc` | decimal | true | §2 #7 WBC | ×10⁹/L |
| `renal_failure` | boolean | true | §2 #8 Renal failure | KDIGO AKI or RRT on day-of-prediction |
| `potassium` | decimal | true | §2 #9 Potassium | mmol/L |
| `fio2` | decimal | true | §2 #10 FiO₂ | fraction 0.21–1.0 |

Suggested unit / value-set hints (SDC):
- `age` → `min = 18`, `max = 110`, integer.
- `bmi` → `decimal`, `min = 10`, `max = 80`.
- `crp`, `wbc`, `potassium` → `decimal`, with UCUM `mg/L`, `10*9/L`, `mmol/L`.
- `fio2` → `decimal`, `min = 0.21`, `max = 1.0`.
- Booleans rendered as Yes/No radios; coded with `true`/`false`.

---

## Variables

Pull each predictor once into a typed FHIRPath variable. `iif` converts booleans to numeric 0/1. The `bool01` helper is the canonical idiom — repeated inline below for clarity.

| name | expression |
|---|---|
| `%age` | `%resource.item.where(linkId='age').answer.value` |
| `%bmi` | `%resource.item.where(linkId='bmi').answer.value` |
| `%immunocompromised` | `iif(%resource.item.where(linkId='immunocompromised').answer.value, 1, 0)` |
| `%septicShock` | `iif(%resource.item.where(linkId='septic_shock').answer.value, 1, 0)` |
| `%vasopressor` | `iif(%resource.item.where(linkId='vasopressor_inotrope').answer.value, 1, 0)` |
| `%crp` | `%resource.item.where(linkId='crp').answer.value` |
| `%wbc` | `%resource.item.where(linkId='wbc').answer.value` |
| `%renalFailure` | `iif(%resource.item.where(linkId='renal_failure').answer.value, 1, 0)` |
| `%k` | `%resource.item.where(linkId='potassium').answer.value` |
| `%fio2` | `%resource.item.where(linkId='fio2').answer.value` |

> Implementation tip: in SDC declare each with `http://hl7.org/fhir/StructureDefinition/variable` extensions on the root `Questionnaire` (or on a parent group). `%resource` resolves to the `QuestionnaireResponse` at extraction time.

---

## Calculated expressions

### `score` (predicted 24-h NOAF probability) — BLOCKED on β coefficients

The full logistic linear predictor and inverse-logit transform, with β placeholders that must be replaced from Klein Klouwenberg 2017 supplement Table E# before clinical use:

```fhirpath
( <TBD_β0>
  + <TBD_β_age>               * %age
  + <TBD_β_bmi>               * %bmi
  + <TBD_β_immunocompromised> * %immunocompromised
  + <TBD_β_septicShock>       * %septicShock
  + <TBD_β_vasopressor>       * %vasopressor
  + <TBD_β_crp>               * %crp
  + <TBD_β_wbc>               * %wbc
  + <TBD_β_renalFailure>      * %renalFailure
  + <TBD_β_potassium>         * %k
  + <TBD_β_fio2>              * %fio2
)
```

Wrap in the inverse-logit (FHIRPath supports `exp()` and `power()` per the FHIRPath spec; `1 / (1 + exp(-x))` is the canonical form):

```fhirpath
1 / (1 + (-1 *
    ( <TBD_β0>
    + <TBD_β_age>               * %age
    + <TBD_β_bmi>               * %bmi
    + <TBD_β_immunocompromised> * %immunocompromised
    + <TBD_β_septicShock>       * %septicShock
    + <TBD_β_vasopressor>       * %vasopressor
    + <TBD_β_crp>               * %crp
    + <TBD_β_wbc>               * %wbc
    + <TBD_β_renalFailure>      * %renalFailure
    + <TBD_β_potassium>         * %k
    + <TBD_β_fio2>              * %fio2
    )
  ).exp())
```

Final probability item:

```text
linkId: probability_noaf_24h
type:   decimal     // 0.0 – 1.0
extension: http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression
expression: <inverse-logit expression above>
readOnly: true
```

### Operational risk tier (UI convenience — not authoritative per SPEC §4.2)

The original publication does **not** define risk-band cut-offs; the tiers below are the spec's *suggested* operational tiers and must be reviewed by clinical leads before display:

```fhirpath
iif(%probability < 0.05,
    'Low',
    iif(%probability < 0.15,
        'Moderate',
        'High'))
```

Where `%probability` is the calculated item above. Suggested companion items:

| linkId | type | calculatedExpression |
|---|---|---|
| `probability_noaf_24h` | decimal | inverse-logit expression (TBD coefficients) |
| `risk_tier` | string | nested `iif` ladder above on `%probability` |

---

## Worked example — test case 1 (Mr. Liam O'Sullivan-Park)

Per `TEST_CASES.md` test case 1 — young, mild sepsis, room air. Inputs:

| variable | value |
|---|---|
| `%age` | 32 |
| `%bmi` | 23 |
| `%immunocompromised` | 0 |
| `%septicShock` | 0 |
| `%vasopressor` | 0 |
| `%crp` | 95 |
| `%wbc` | 12.0 |
| `%renalFailure` | 0 |
| `%k` | 4.1 |
| `%fio2` | 0.21 |

The linear predictor evaluates to:

```
LP = <TBD_β0>
   + <TBD_β_age>               × 32
   + <TBD_β_bmi>               × 23
   + <TBD_β_immunocompromised> × 0
   + <TBD_β_septicShock>       × 0
   + <TBD_β_vasopressor>       × 0
   + <TBD_β_crp>               × 95
   + <TBD_β_wbc>               × 12.0
   + <TBD_β_renalFailure>      × 0
   + <TBD_β_potassium>         × 4.1
   + <TBD_β_fio2>              × 0.21
```

`probability_noaf_24h = 1 / (1 + exp(-LP))`. Per the SPEC and qualitative test-case expectation (every binary risk factor absent, continuous predictors near baseline), this should evaluate to **< 5 %** and the `risk_tier` ladder should fall through to `'Low'`. Numeric verification cannot be performed here because the β values are still TBD; once coefficients are loaded, this test case is the suggested floor sanity check (alongside test case 5 which probes the practical predictor-space floor).

---

## Notes

- **Daily re-evaluation**: AFISS is a dynamic, per-day model. Either (a) capture each scoring as a separate `QuestionnaireResponse` keyed to ICU-day, or (b) tag each response with `Encounter.period` + `effectiveDateTime` so the same questionnaire can be filled in multiple times across a single ICU stay. Stop scoring at the earliest of: AF onset, ICU discharge, day 7, death.
- **`iif` for binary inputs**: SPEC §3 says binary variables are coded 0/1 in the linear predictor — use `iif(boolean, 1, 0)` (FHIRPath does not have an implicit boolean→integer cast).
- **No CQL needed**: AFISS is a single-equation logistic regression; once the β-coefficients are pinned, pure FHIRPath suffices for `calculatedExpression`. Do **not** escalate to CQL.
- **Helper findings as documentation only**: SPEC §2 does *not* split the gestalt-supporting findings (orthopnea, JVD, etc.) into separate inputs; the model uses only the 10 predictors above. Resist the urge to add helper booleans that don't feed the equation.
- **Unit handling**: SPEC §2 fixes units (mg/L, ×10⁹/L, mmol/L, fraction). Add UCUM coding on the questionnaire items and reject mismatched units at extraction.
- **Reference implementation**: validate against the authors' Shiny app (`safescore.shinyapps.io/safe/`) on a panel of test cases before release.
- **External-validation caveat**: Bedford / Rucci 2022 showed AUC drop 0.81 → 0.60 in a US cohort. Surface this caveat next to the displayed probability.
