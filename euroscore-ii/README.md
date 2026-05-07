# EuroSCORE II — implementation notes

## Deviations from CONVENTIONS.md

1. **Age input is `type: "decimal"` instead of `"integer"`.** The Tiro web SDK
   (`https://cdn.tiro.health/sdk/next/tiro-web-sdk.iife.js`) does not render an
   input for `type: "integer"` items — they are silently dropped from the form.
   `decimal` renders correctly as an `<input type="number">` and the SPEC age
   coding logic (`x_age = max(1, age - 59)`) works on whole-number decimal
   values just as well as integers.

2. **Variable extensions are not used.** CONVENTIONS §"Type 2 — formula-based"
   suggests defining intermediate questionnaire-level `variable` extensions
   (e.g. `%y`, `%pMort`) and referencing them from `calculatedExpression`.
   In the current SDK build `%<name>` references inside calculatedExpression
   raise FHIRPath "Attempting to access an undefined environment variable"
   warnings and the output items are dropped from the QuestionnaireResponse,
   even when the variable's expression resolves to a literal (e.g.
   `expression: "1.5"`). To work around this we inline the linear predictor
   formula directly into each of the three output `calculatedExpression`s.
   Coefficients remain verbatim from SPEC §3.3 / Nashef 2012 Table 4.

3. **Booleans use `coding` items with `yes`/`no` codes** (per CONVENTIONS) so
   they can be rendered as chips. The FHIRPath compares to `'yes'`.

## Verification

`tests/euroscore-ii.spec.ts` covers all 5 cases from `TEST_CASES.md`.
`predicted_mortality_percent` is asserted within ±0.05 percentage points of
the expected value (per SPEC §3.4 "reproduce to within rounding").

`exp()` works as expected in the SDK's FHIRPath runtime.
