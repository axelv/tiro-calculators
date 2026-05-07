# Calculator implementation conventions

Read this **before** implementing or modifying any calculator. The pilot calcs (`cha2ds2-vasc`, `euroscore-ii`, `r-iss`) are the canonical references — when in doubt, mimic them.

These conventions reflect what **actually works** with the current Tiro Web SDK build at `https://cdn.tiro.health/sdk/next/tiro-web-sdk.iife.js`. Several patterns documented in upstream FHIR / SDC guides do **not** work and are explicitly forbidden below.

## File layout (per calculator)

```
<slug>/
├── SPEC.md              # source of truth — what to compute and why
├── TEST_CASES.md        # source of truth — input/output assertions
├── FHIRPATH.md          # FHIRPath sketch (advisory)
├── questionnaire.json   # the FHIR R4 SDC Questionnaire you produce
└── README.md            # optional: implementer notes, deviations
```

The Playwright spec lives at `tests/<slug>.spec.ts`.

## Questionnaire root

- FHIR version: **R5**. The Tiro Web SDK speaks R5 (per `mock-questionnaires.js` and the production `templates.tiro.health` payloads). This is why item type `coding` is used everywhere — `coding` is the R5 type that replaced R4's `choice` / `open-choice`. Using `choice` here would not render.
- `resourceType: "Questionnaire"`, `status: "active"`, `subjectType: "Patient"` (singular string — the Tiro `$validate` endpoint rejects the FHIR-spec array form `["Patient"]` with `code-invalid` "Input should be 'Patient'", which causes a failed validate cycle on every populate roundtrip and makes the form feel like it's reloading).
- `url`: `http://calculators.tiro.health/Questionnaire/<slug>`.
- `name`: PascalCase of the slug.
- `title`: human title from SPEC.
- `description`: ~2 sentences from SPEC §1, crediting the primary publication.

## Item structure

Two top-level groups, in this order:

1. `inputs` (group) — one item per SPEC input.
2. `outputs` (group) — calculated outputs.

### Input item types

| SPEC type | Use | Why |
|---|---|---|
| boolean / enum / categorical | `coding` with `chips` itemControl | The SDK only renders `coding` chips for booleans; `boolean` items render as native checkboxes which we don't want. |
| continuous numeric | `decimal` | **Never `integer`.** The SDK silently drops `integer` items — no input element appears. |
| free text | `string` | Rare in calculators. |
| date | `date` | Use only when the SPEC requires a date. |

For boolean items, use a `coding` item with two `answerOption`s:
- `code: "no"`, weight 0
- `code: "yes"`, weight equal to the SPEC point value

**Make every chip's `display` globally unique within the questionnaire.** The SDK doesn't expose the question text on chip buttons, so test selectors scope by `data-testid="<linkId>"` and then match by chip display text. If two questions both have a "Yes" chip the helper will hit the wrong one. Use distinct displays like `"CHF"` / `"No CHF"`, `"Hypertension"` / `"No hypertension"`, etc.

### LinkIds

Lowercase snake_case, matching the field names used in `SPEC.md` §Inputs / §Output schema. LinkIds are stable contracts — do not rename.

### itemWeight (Type 1 only)

Each `answerOption` carries:

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/itemWeight",
  "valueDecimal": <weight>
}
```

## Calculation patterns

### Type 1 — weight-based

Place the score-computing variable on the **score output item itself** (NOT the questionnaire root, NOT the outputs group). Read the sum via `weight()`:

```json
{
  "linkId": "score",
  "type": "decimal",
  "extension": [
    {
      "url": "http://hl7.org/fhir/StructureDefinition/variable",
      "valueExpression": {
        "name": "totalScore",
        "language": "text/fhirpath",
        "expression": "%resource.item.where(linkId='inputs').item.answer.value.weight().sum()"
      }
    },
    {
      "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
      "valueExpression": { "language": "text/fhirpath", "expression": "%totalScore" }
    }
  ]
}
```

Downstream output items (e.g. `risk_band`, `recommendation`, lookup-table values) need their **own copy of the variable** — variables defined on one item are not visible from sibling items. See `cha2ds2-vasc/questionnaire.json` for the canonical pattern (4 outputs, each with its own `totalScore` variable).

### Type 2 — formula-based

Place input-reading variables on each output item that needs them. For multi-output formulas where intermediates are shared, either:

- Re-declare the same variables on each output item (clean, self-contained), OR
- Inline the full expression directly into each `calculatedExpression` (verbose but fewer moving parts — used in `euroscore-ii/questionnaire.json`).

FHIRPath supports `exp(): Decimal`, `ln(): Decimal`, `power(exponent): Decimal` natively (per https://build.fhir.org/ig/HL7/FHIRPath/). Use them directly. **Confirmed working** in this SDK (EuroSCORE II's logistic regression evaluates correctly to within 0.05 percentage points).

### Type 3 — discrete logic

Place all intermediate boolean variables on the single `classification` item, alongside its `calculatedExpression`. See `r-iss/questionnaire.json` for the canonical pattern.

## Variable scoping — SDK reality check

What works and what doesn't (verified empirically):

| Placement | Resolves in `calculatedExpression`? |
|---|---|
| Same item as the `calculatedExpression` | ✅ Yes |
| **Parent group of the output item** | ✅ **Yes — preferred for shared variables** |
| Questionnaire root | ❌ No — throws "undefined environment variable", output is dropped |

**Preferred pattern:** define variables on the **`outputs` group** when they're used by more than one output item. Define on the same item only when the variable is unique to that item. This is materially more compact than redeclaring `totalScore` on each of N output items.

Example (Type 1, multiple outputs share a `totalScore` and `sexFemale`):

```json
{
  "linkId": "outputs",
  "type": "group",
  "extension": [
    {
      "url": "http://hl7.org/fhir/StructureDefinition/variable",
      "valueExpression": {
        "name": "totalScore",
        "language": "text/fhirpath",
        "expression": "%resource.item.where(linkId='inputs').item.answer.value.weight().sum()"
      }
    }
  ],
  "item": [
    { "linkId": "score",     "type": "decimal", "extension": [{ "url": "...calculatedExpression", "valueExpression": { "expression": "%totalScore" } }] },
    { "linkId": "risk_band", "type": "string",  "extension": [{ "url": "...calculatedExpression", "valueExpression": { "expression": "iif(%totalScore >= 7, 'very_high', ...)" } }] }
  ]
}
```

Other rules:
- Extension URL must be `http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression`. The base FHIR `cqf-expression` URL is silently ignored.

> Many of the existing calculators in this repo were written before group-scoped variables were verified, so they redeclare `totalScore` on each output item. That pattern is functionally correct and tests pass — don't refactor unless you're already touching the file.

## Item controls

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
  "valueCodeableConcept": {
    "coding": [{ "system": "http://fhir.tiro.health/CodeSystem/tiro-questionnaire-item-control", "code": "<code>" }]
  }
}
```

| Code | Use for |
|---|---|
| `chips` | All `coding` inputs |
| `decimal-field` | Calculated `decimal` outputs |
| `text-field` | Calculated `string` outputs |

## Playwright spec contract

Each `tests/<slug>.spec.ts`:

1. Imports from `./_helpers`.
2. Uses `openCalc(page, "<slug>")` to navigate + wait ready.
3. Calls `selectChip(page, "<linkId>", "<display>")` for each input. The helper polls until the item is rendered, then clicks via `element.click()` inside `page.evaluate` — this bypasses the SDK's re-render churn that breaks Playwright's stability waits.
4. Calls `setNumber(page, "<linkId>", value)` for `decimal` inputs.
5. Asserts via `expectCalculatedDecimal` / `expectCalculatedString` / `expectCalculatedInt`.

Numeric tolerance:
- Type 1 weight-based: exact (use default `tol`, or `0` for integers).
- Type 2 formula-based: SPEC dictates. EuroSCORE II uses 0.05 pp; follow the SPEC's stated rounding.

## SDK selectors (reference)

The SDK renders, for each item:

```html
<div data-testid="<linkId>" qr-item-linkid="<linkId>" qr-item-id="<group>.<linkId>">
  ...
  <div name="<group>.<linkId>.answer">
    <button aria-pressed="false">{{ display }}</button>   <!-- chips -->
  </div>
  <input name="<group>.<linkId>.answer">                  <!-- decimals/strings -->
</div>
```

Inside the shadow DOM of `<tiro-form-filler>`. Playwright auto-pierces.

## Forbidden

- Editing `SPEC.md`, `TEST_CASES.md`, `harness/`, `tests/_helpers.ts`, `playwright.config.ts`, or `package.json`.
- Inventing answer codes or coefficients. Pull every numeric from SPEC. Surface SPEC ambiguities in `<slug>/README.md`.
- Loading remote questionnaires. Always inline via `<script type="application/fhir+json" slot="questionnaire">` (the harness handles this).
- Using `type: "integer"`, `type: "boolean"`, root-level `variable` extensions, or the FHIR-core `calculatedExpression` URL.
- Reusing identical chip displays across different questions.
