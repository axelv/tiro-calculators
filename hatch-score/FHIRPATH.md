# HATCH Score — FHIRPath expressions

> Encodes the De Vos 2010 HATCH score (progression from paroxysmal to persistent
> AF, integer 0–7) for use in an SDC Questionnaire. Five binary inputs with
> weights {H:1, A:1, T:2, C:1, H:2}; band-level probability via nested `iif`.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `hypertension` | boolean | yes | Hypertension | History of HTN, BP > 140/90 on >= 2 occasions, or on antihypertensive Rx. Weight +1. |
| `age_gt_75` | boolean | yes | Age > 75 years | Strict inequality (De Vos definition). May be auto-populated from `Patient.birthDate`. Weight +1. |
| `tia_or_stroke` | boolean | yes | Prior TIA or stroke | Excludes peripheral systemic embolism. Weight +2. |
| `copd` | boolean | yes | COPD | Documented diagnosis (post-bronchodilator FEV1/FVC < 0.70) or on COPD Rx. Weight +1. |
| `heart_failure` | boolean | yes | Heart failure | Any EF; current decompensation or HF hospitalisation history. Weight +2. |

LinkIds match SPEC field keys verbatim.

## Variables

Defined as `Questionnaire.item.extension[variable]` (language `text/fhirpath`).

| name | expression |
|---|---|
| `htn` | `iif(%resource.item.where(linkId='hypertension').answer.value = true, 1, 0)` |
| `age75` | `iif(%resource.item.where(linkId='age_gt_75').answer.value = true, 1, 0)` |
| `tia` | `iif(%resource.item.where(linkId='tia_or_stroke').answer.value = true, 1, 0)` |
| `copd` | `iif(%resource.item.where(linkId='copd').answer.value = true, 1, 0)` |
| `hf` | `iif(%resource.item.where(linkId='heart_failure').answer.value = true, 1, 0)` |

## Calculated expressions

### `score` (primary output, integer 0–7)

LinkId `score`, type `integer`:

```
%htn + %age75 + (2 * %tia) + %copd + (2 * %hf)
```

### `risk_band` (low / moderate / high / very high)

LinkId `risk_band`, type `string`:

```
iif(%score <= 1, 'low',
  iif(%score = 2, 'moderate',
    iif(%score <= 4, 'high', 'very high')))
```

### `progression_probability_pct` (numeric, band-level estimate)

LinkId `progression_probability_pct`, type `decimal`:

```
iif(%score = 0, 6,
  iif(%score = 1, 7,
    iif(%score = 2, 14,
      iif(%score <= 4, 25, 50))))
```

### `interpretation` (free-text guidance, optional)

```
iif(%score <= 1, 'Low likelihood of progression to persistent AF; rhythm-control strategies (including cardioversion) reasonable.',
  iif(%score = 2, 'Intermediate progression risk; rhythm control still reasonable but counsel that recurrence is meaningfully possible.',
    iif(%score <= 4, 'High progression risk; consider antiarrhythmic prophylaxis or early referral for catheter ablation.',
      'Very high progression risk (~50% within 1 year); weigh repeat cardioversions against early rate-control strategy.')))
```

## Worked example — test case 4 (Beatriz Lopes, score 4)

Inputs: hypertension=true, age_gt_75=false, tia_or_stroke=false, copd=true, heart_failure=true.

| Variable | Value |
|---|---:|
| %htn | 1 |
| %age75 | 0 |
| %tia | 0 |
| %copd | 1 |
| %hf | 1 |

`score = 1 + 0 + (2*0) + 1 + (2*1) = 4`.
`risk_band` ladder: `4 <= 1` false, `= 2` false, `<= 4` true → `'high'`.
`progression_probability_pct` ladder: `= 0` false, `= 1` false, `= 2` false, `<= 4` true → `25`.

Matches SPEC test case 4: score 4, high, ~25 %.

## Notes

- Pure-FHIRPath: 5 binary multiplications and a nested `iif` — no CQL required.
- `age_gt_75` may be auto-derived from `Patient.birthDate`:
  `(today() - %patient.birthDate).toQuantity('a').value > 75`.
- The De Vos paper publishes only band-level probabilities; a per-integer table does not exist. The `iif` ladder collapses scores 3–4 (~25 %) and 5–7 (~50 %) into single point estimates, matching SPEC §4.2.
- HATCH does not predict post-ablation recurrence reliably; that caveat is content for the Questionnaire, not the FHIRPath layer.
