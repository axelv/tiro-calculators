# HAS-BLED — FHIRPath expressions

> Encodes the 9-binary-subitem additive HAS-BLED score (Pisters 2010) for use in
> a Structured Data Capture (SDC) Questionnaire. Each subitem is a 0/1 boolean;
> the total is summed via `iif(...)`. Bleeding-rate band lookup is implemented
> as a nested `iif` ladder.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `H` | boolean | yes | Hypertension (uncontrolled, SBP > 160) | Per Pisters 2010 — *uncontrolled* SBP, not history of HTN. Captured directly as bool; an alternative is to compute it from a numeric SBP item (see Notes). |
| `A_renal` | boolean | yes | Abnormal renal function | Dialysis, prior renal transplant, or creatinine >= 200 µmol/L (>= 2.26 mg/dL). |
| `A_liver` | boolean | yes | Abnormal liver function | Cirrhosis OR (bilirubin > 2× ULN AND (AST/ALT/ALP > 3× ULN)). |
| `S` | boolean | yes | Stroke history | Prior ischaemic or haemorrhagic CVA. |
| `B` | boolean | yes | Bleeding history / predisposition | Prior major bleed or diathesis/anaemia/thrombocytopenia. |
| `L` | boolean | yes | Labile INR | TTR < 60 % on VKA. Score 0 if not on VKA. |
| `E` | boolean | yes | Elderly (age > 65) | Strict inequality. May be auto-derived from `Patient.birthDate`. |
| `D_drugs` | boolean | yes | Drugs predisposing to bleeding | Antiplatelets or NSAIDs. |
| `D_alcohol` | boolean | yes | Alcohol >= 8 drinks/week | Harmful use. |

The 9 linkIds map verbatim to the SPEC field keys.

## Variables

Defined as `Questionnaire.item.extension[variable]` with `language = text/fhirpath`. Each variable resolves the corresponding answer in the QuestionnaireResponse and coerces it to a 0/1 integer.

| name | expression |
|---|---|
| `H` | `iif(%resource.item.where(linkId='H').answer.value = true, 1, 0)` |
| `Aren` | `iif(%resource.item.where(linkId='A_renal').answer.value = true, 1, 0)` |
| `Aliv` | `iif(%resource.item.where(linkId='A_liver').answer.value = true, 1, 0)` |
| `S` | `iif(%resource.item.where(linkId='S').answer.value = true, 1, 0)` |
| `B` | `iif(%resource.item.where(linkId='B').answer.value = true, 1, 0)` |
| `L` | `iif(%resource.item.where(linkId='L').answer.value = true, 1, 0)` |
| `E` | `iif(%resource.item.where(linkId='E').answer.value = true, 1, 0)` |
| `Ddrg` | `iif(%resource.item.where(linkId='D_drugs').answer.value = true, 1, 0)` |
| `Dalc` | `iif(%resource.item.where(linkId='D_alcohol').answer.value = true, 1, 0)` |

`%resource` refers to the in-scope QuestionnaireResponse. If you prefer `Questionnaire.item.extension[itemPopulationContext]`, you can elide the prefix and use `item.where(...)`.

## Calculated expressions

### `score` (primary output, integer 0–9)

LinkId `score`, type `integer`, with `questionnaire-calculatedExpression`:

```
%H + %Aren + %Aliv + %S + %B + %L + %E + %Ddrg + %Dalc
```

### `risk_per_100_py` (string, bleeding rate band per Pisters 2010 §4.2)

LinkId `risk_per_100_py`, type `string`:

```
iif(%score = 0, '~1.13',
  iif(%score = 1, '~1.02',
    iif(%score = 2, '~1.88',
      iif(%score = 3, '~3.74',
        iif(%score = 4, '~8.70',
          iif(%score = 5, '~12.50',
            'data limited (very high)'))))))
```

### `risk_category` (enum: low / moderate / high / very high)

LinkId `risk_category`, type `string`:

```
iif(%score <= 1, 'low',
  iif(%score = 2, 'moderate',
    iif(%score <= 5, 'high', 'very high')))
```

### `interpretation` (free-text guidance, optional)

```
iif(%score <= 1, 'Low bleeding risk. Anticoagulation generally favorable; routine monitoring.',
  iif(%score = 2, 'Moderate bleeding risk. Anticoagulation generally favorable; address modifiable factors.',
    'High bleeding risk. Caution and frequent review; aggressive correction of modifiable factors. Not by itself a contraindication to anticoagulation.'))
```

## Worked example — test case 1 (Anke De Smet, score 0)

All 9 booleans are `false`.

| Variable | Value |
|---|---:|
| %H | 0 |
| %Aren | 0 |
| %Aliv | 0 |
| %S | 0 |
| %B | 0 |
| %L | 0 |
| %E | 0 |
| %Ddrg | 0 |
| %Dalc | 0 |

`score = 0+0+0+0+0+0+0+0+0 = 0` → `risk_category = 'low'`, `risk_per_100_py = '~1.13'`. Matches the SPEC test-case-1 expected output.

Sanity-check on test case 5 (Tanaka, all 9 true): `score = 9`, falls into the `risk_category = 'very high'` branch via the outer `iif(%score <= 5, ...)` returning the else-branch — consistent with SPEC.

## Notes

- HAS-BLED is purely additive over binary inputs — pure FHIRPath is sufficient; no CQL needed.
- If the form captures SBP as a numeric value rather than an `H` boolean, replace the `%H` variable with `iif(%resource.item.where(linkId='sbp').answer.value > 160, 1, 0)`.
- `E` (age > 65) may be auto-populated from `Patient.birthDate` using `initialExpression`: `(today() - %patient.birthDate).toQuantity('a').value > 65`.
- `L` is conditional on VKA therapy. If the form models "on VKA?" separately, gate it: `iif(%resource.item.where(linkId='on_vka').answer.value = true and %resource.item.where(linkId='ttr_lt_60').answer.value = true, 1, 0)`.
- Pisters 2010 score = 5 row gives ~12.50 bleeds/100 py; scores 6–9 fall in the "data limited" band — implementation collapses them into a single string.
