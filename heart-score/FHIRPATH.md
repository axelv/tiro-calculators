# HEART Score for Major Cardiac Events — FHIRPath expressions

> Encodes the SPEC §2 input model and §3 sum + §4.1 risk bands into FHIRPath
> expressions suitable for SDC `Questionnaire.item.extension` calculated
> expressions (`http://hl7.org/fhir/StructureDefinition/variable` and
> `…/cqf-expression`).

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `history` | integer | yes | §2 H — History | Allowed: 0, 1, 2 (slightly / moderately / highly suspicious). Use `valueCoding` if you prefer a coded answer set; the expressions below assume a numeric answer. |
| `ecg` | integer | yes | §2 E — ECG | Allowed: 0, 1, 2 (normal / non-specific repolarisation / significant ST deviation). |
| `age_years` | integer | yes | §2 A — Age (raw years) | Banded into 0/1/2 by the `age` variable below. |
| `risk_factors` | integer | yes | §2 R — Risk factors | Allowed: 0, 1, 2 (none / 1–2 RF / ≥3 RF or atherosclerotic disease). The atherosclerotic-disease auto-2 must be applied client-side before the integer is recorded. |
| `troponin_ratio` | decimal | yes | §2 T — Troponin (initial / URL) | Banded into 0/1/2 by the `troponin` variable below. |
| `score` | integer | computed (read-only) | §3 sum | Total 0–10. |
| `risk_band` | choice | computed | §4.1 | One of `low`, `moderate`, `high`. |
| `mace_6w_pct` | decimal | computed | §4.1 (Backus 2013 prospective) | Representative 6-week MACE %. |
| `disposition` | choice | computed | §4.1 | One of `discharge`, `admit_observe`, `early_invasive`. |

---

## Variables

Declare these on the root `Questionnaire` (or on a containing group) as
`extension[variable]` entries, each with `language = "text/fhirpath"`.

| name | expression |
|---|---|
| `history` | `%resource.repeat(item).where(linkId='history').answer.valueInteger.first()` |
| `ecg` | `%resource.repeat(item).where(linkId='ecg').answer.valueInteger.first()` |
| `ageYears` | `%resource.repeat(item).where(linkId='age_years').answer.valueInteger.first()` |
| `age` | `iif(%ageYears < 45, 0, iif(%ageYears <= 64, 1, 2))` |
| `riskFactors` | `%resource.repeat(item).where(linkId='risk_factors').answer.valueInteger.first()` |
| `tropRatio` | `%resource.repeat(item).where(linkId='troponin_ratio').answer.valueDecimal.first()` |
| `troponin` | `iif(%tropRatio <= 1, 0, iif(%tropRatio <= 3, 1, 2))` |

> If your renderer cannot reach `QuestionnaireResponse` items via `%resource`,
> swap each variable's RHS for `%questionnaire.…` plus an `answers()` helper,
> or scope the variable on the relevant group item and use
> `item.where(linkId=…).answer.valueInteger.first()`.

---

## Calculated expressions

### `score` (primary output, integer 0–10)

```fhirpath
%history + %ecg + %age + %riskFactors + %troponin
```

### `risk_band` (choice: `low` | `moderate` | `high`)

```fhirpath
iif(%score <= 3, 'low',
  iif(%score <= 6, 'moderate', 'high'))
```

### `disposition` (choice)

```fhirpath
iif(%score <= 3, 'discharge',
  iif(%score <= 6, 'admit_observe', 'early_invasive'))
```

### `mace_6w_pct` (decimal — representative Backus 2013 prospective rate)

```fhirpath
iif(%score <= 3, 1.7,
  iif(%score <= 6, 16.6, 50.1))
```

> If you also want to expose the Backus 2010 retrospective rates in §4.1,
> mirror this with `0.99 / 11.6 / 65.2` under a separate linkId
> (`mace_6w_pct_retrospective`).

---

## Worked example — test case 1 (HEART 1, low — discharge)

Inputs (from `TEST_CASES.md` §1 — Ms Aïsha Karimi, 28 y, smoker, normal ECG,
slightly suspicious history, troponin ratio ≈ 0.3):

| linkId | value |
|---|---|
| `history` | 0 |
| `ecg` | 0 |
| `age_years` | 28 |
| `risk_factors` | 1 |
| `troponin_ratio` | 0.3 |

Variable evaluation:

- `%history = 0`
- `%ecg = 0`
- `%age = iif(28 < 45, 0, …) = 0`
- `%riskFactors = 1`
- `%troponin = iif(0.3 <= 1, 0, …) = 0`

Calculations:

- `score = 0 + 0 + 0 + 1 + 0 = 1` ✓
- `risk_band = iif(1 <= 3, 'low', …) = 'low'` ✓
- `disposition = iif(1 <= 3, 'discharge', …) = 'discharge'` ✓
- `mace_6w_pct = iif(1 <= 3, 1.7, …) = 1.7` ✓

Matches SPEC + TEST_CASES expected output (score 1, low band, ~1.7 % MACE,
discharge).

---

## Notes

- Boundary handling matches SPEC §2 exactly: age `<45 → 0`, `45–64 → 1`,
  `≥65 → 2`; troponin `≤1 → 0`, `1<r≤3 → 1`, `>3 → 2`. The nested `iif`s
  use the same `<=`/`<` operators as SPEC.
- The risk-factors component is **pre-aggregated to 0/1/2** at the form
  level — the "≥3 RF OR atherosclerotic disease" rule (SPEC §2 row R) is
  expected to be applied by an upstream UI (or a small auxiliary group)
  before the integer is written to `risk_factors`. If you want to encode
  the auto-2 inside FHIRPath, model the six RF booleans + the atherosclerosis
  boolean as separate linkIds and replace `%riskFactors` with:
  `iif(%atherosclerosis, 2, iif(%rfCount >= 3, 2, iif(%rfCount >= 1, 1, 0)))`.
- `score` is bounded `0..10` by construction; no clamp needed.
- No TBD coefficients. No CQL escalation needed — pure FHIRPath suffices.
