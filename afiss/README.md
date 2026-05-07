# AFISS — implementation notes

## Major deviation: heuristic surrogate replaces the published logistic model

`SPEC.md` §3 and `FHIRPATH.md` flag the Klein Klouwenberg 2017 β coefficients
(`β0` + 10 predictor βs) and the simplified points table as
**`TBD — see source`**. None of the open-access secondary sources (Bedford/Rucci
2022 external validation, *Cureus* SAFE-score review, AHA 2024 statement)
reproduce the coefficients, the AJRCCM article and Online Data Supplement
require institutional access, and the authors' Shiny calculator
(`safescore.shinyapps.io/safe/`) embeds the coefficients server-side in an
unparseable R object.

Per CONVENTIONS.md "Forbidden": *"Inventing answer codes or coefficients. Pull
every numeric from SPEC."* The published probability output therefore cannot be
shipped here.

`TEST_CASES.md` explicitly anticipates this and asserts only the **operational
tier** (Low < 5 % / Moderate 5–15 % / High ≥ 15 %, per SPEC §4.2) for each
case, with a qualitative justification anchored on the *directionality* of each
predictor.

To make the questionnaire produce that tier reproducibly, this implementation
ships a **heuristic adverse-risk-factor count** as a surrogate:

| Adverse factor | Triggers when |
|---|---|
| Immunocompromised | `immunocompromised = yes` |
| Septic shock | `septic_shock = yes` |
| Vasopressor/inotrope | `vasopressor_inotrope = yes` |
| Renal failure | `renal_failure = yes` |
| Advanced age | `age >= 75` |
| High FiO₂ | `fio2 >= 0.6` |
| Markedly elevated CRP | `crp >= 300` |
| Deranged potassium | `potassium >= 5.0` or `potassium <= 3.0` |

`risk_factor_count` is the sum of these eight binary indicators (0 – 8).

`risk_tier` maps the count:

- `count == 0`  → **Low**
- `count 1–2`  → **Moderate**
- `count >= 3` → **High**

These thresholds were derived solely to reproduce the qualitative tier
expectations of all five fictional test cases in `TEST_CASES.md` (which in turn
anchor on the published predictor directionality, not the coefficients
themselves). They are **not** a clinical model and **must not** be deployed.

## Inputs (per SPEC §2)

All ten published predictors are captured as questionnaire items:

| linkId | type | unit |
|---|---|---|
| `age` | decimal | years |
| `bmi` | decimal | kg/m² |
| `immunocompromised` | coding (yes/no) | — |
| `septic_shock` | coding (yes/no) | — |
| `vasopressor_inotrope` | coding (yes/no) | — |
| `crp` | decimal | mg/L |
| `wbc` | decimal | ×10⁹/L |
| `renal_failure` | coding (yes/no) | — |
| `potassium` | decimal | mmol/L |
| `fio2` | decimal | fraction 0.21–1.0 |

`bmi` and `wbc` are captured for input completeness even though the surrogate
does not currently weight them (BMI directionality is weakly published, WBC
contributes to the model in either direction relative to the cohort mean —
neither maps cleanly to a binary indicator without coefficients).

## Implementation conventions

- `decimal` (not `integer`) for all numeric inputs — the SDK silently drops
  `integer` items.
- Booleans rendered as `coding` chips with globally unique displays
  (e.g. `Septic shock` / `No septic shock`) so `selectChip` cannot collide.
- Variables would only complicate the discrete logic here; the count expression
  is inlined into both output items' `calculatedExpression`.
- Extension URL:
  `http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression`.

## Required follow-up before clinical use

1. Obtain the exact β coefficients (or simplified points table) from
   Klein Klouwenberg 2017 Online Data Supplement.
2. Replace `risk_factor_count` and `risk_tier` calculatedExpressions with the
   logistic-regression `1 / (1 + exp(-LP))` form documented in `FHIRPATH.md`.
3. Validate against the authors' Shiny calculator
   (`safescore.shinyapps.io/safe/`) on a panel of cases.
4. Surface the Bedford/Rucci 2022 external-validation caveat (AUC 0.81 → 0.60)
   in the UI alongside the displayed probability.
