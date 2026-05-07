# HCT-CI — FHIRPath expressions

> Encodes the Sorror 2005 HCT-specific Comorbidity Index plus the 2014
> Comorbidity/Age augmentation (+1 for age >= 40). Pure additive scoring with
> mutually-exclusive severity tiers for hepatic and pulmonary categories
> (encoded with single-select `coding`/`Coding` choice items rather than
> overlapping booleans).

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `arrhythmia` | boolean | yes | Cat. 1 — Arrhythmia | AF/flutter, sick sinus, ventricular arrhythmia. +1. |
| `cardiac` | boolean | yes | Cat. 2 — Cardiac | CAD/CHF/MI/EF<=50%. +1. |
| `ibd` | boolean | yes | Cat. 3 — IBD | Crohn or UC. +1. |
| `diabetes` | boolean | yes | Cat. 4 — Diabetes | On insulin or oral hypoglycaemics. +1. |
| `cerebrovascular` | boolean | yes | Cat. 5 — Cerebrovascular | TIA or CVA. +1. |
| `psychiatric` | boolean | yes | Cat. 6 — Psychiatric | Depression/anxiety needing Rx or referral. +1. |
| `obesity` | boolean | yes | Cat. 8 — Obesity | BMI > 35. +1. |
| `infection` | boolean | yes | Cat. 9 — Infection | Antimicrobial continuation past day 0. +1. |
| `rheumatologic` | boolean | yes | Cat. 10 — Rheumatologic | SLE/RA/PM/MCTD/PMR. +2. |
| `peptic_ulcer` | boolean | yes | Cat. 11 — Peptic ulcer | Treated. +2. |
| `renal` | boolean | yes | Cat. 12 — Renal moderate/severe | Creatinine > 2 mg/dL, dialysis, or renal Tx. +2. |
| `heart_valve` | boolean | yes | Cat. 14 — Heart valve | Any except MVP. +3. |
| `prior_solid_tumor` | boolean | yes | Cat. 17 — Prior solid tumor | Excl. non-melanoma skin cancer. +3. |
| `hepatic` | choice | yes | Cat. 7 / 15 — Hepatic tier | One-of `none` / `mild` (+1) / `moderate_severe` (+3). Mutually exclusive. |
| `pulmonary` | choice | yes | Cat. 13 / 16 — Pulmonary tier | One-of `none` / `moderate` (+2) / `severe` (+3). Mutually exclusive. |
| `age_ge_40` | boolean | yes | §2.2 — Age augmentation | Age >= 40 at HCT. May be auto-populated from `Patient.birthDate`. +1 (composite only). |

LinkIds for the unique-category booleans match SPEC §2.1 keys. The `hepatic` and `pulmonary` choice items collapse the mutually-exclusive severity tiers into single-select questions, which is the cleanest FHIR-SDC encoding of "score the highest applicable tier only".

## Variables

| name | expression |
|---|---|
| `arr` | `iif(%resource.item.where(linkId='arrhythmia').answer.value = true, 1, 0)` |
| `card` | `iif(%resource.item.where(linkId='cardiac').answer.value = true, 1, 0)` |
| `ibd` | `iif(%resource.item.where(linkId='ibd').answer.value = true, 1, 0)` |
| `dm` | `iif(%resource.item.where(linkId='diabetes').answer.value = true, 1, 0)` |
| `cva` | `iif(%resource.item.where(linkId='cerebrovascular').answer.value = true, 1, 0)` |
| `psy` | `iif(%resource.item.where(linkId='psychiatric').answer.value = true, 1, 0)` |
| `ob` | `iif(%resource.item.where(linkId='obesity').answer.value = true, 1, 0)` |
| `inf` | `iif(%resource.item.where(linkId='infection').answer.value = true, 1, 0)` |
| `rheum` | `iif(%resource.item.where(linkId='rheumatologic').answer.value = true, 2, 0)` |
| `pud` | `iif(%resource.item.where(linkId='peptic_ulcer').answer.value = true, 2, 0)` |
| `ren` | `iif(%resource.item.where(linkId='renal').answer.value = true, 2, 0)` |
| `valve` | `iif(%resource.item.where(linkId='heart_valve').answer.value = true, 3, 0)` |
| `tumor` | `iif(%resource.item.where(linkId='prior_solid_tumor').answer.value = true, 3, 0)` |
| `hep` | `iif(%resource.item.where(linkId='hepatic').answer.value.code = 'mild', 1, iif(%resource.item.where(linkId='hepatic').answer.value.code = 'moderate_severe', 3, 0))` |
| `pulm` | `iif(%resource.item.where(linkId='pulmonary').answer.value.code = 'moderate', 2, iif(%resource.item.where(linkId='pulmonary').answer.value.code = 'severe', 3, 0))` |
| `age40` | `iif(%resource.item.where(linkId='age_ge_40').answer.value = true, 1, 0)` |

The `.code` accessor assumes the choice items use `valueCoding`; if they use `valueString`, replace `.code` with the bare path.

## Calculated expressions

### `hct_ci` (Sorror 2005 score, integer)

LinkId `hct_ci`, type `integer`:

```
%arr + %card + %ibd + %dm + %cva + %psy + %ob + %inf
  + %rheum + %pud + %ren + %valve + %tumor + %hep + %pulm
```

### `hct_ci_age` (Sorror 2014 composite, integer)

LinkId `hct_ci_age`, type `integer`:

```
%hct_ci + %age40
```

(Equivalently: repeat the long sum and add `%age40`.)

### `risk_group_2005` (low / intermediate / high; original §3.2)

LinkId `risk_group_2005`, type `string`:

```
iif(%hct_ci = 0, 'low',
  iif(%hct_ci <= 2, 'intermediate', 'high'))
```

### `risk_group_2014` (low / intermediate / high; composite §3.2)

LinkId `risk_group_2014`, type `string`:

```
iif(%hct_ci_age <= 2, 'low',
  iif(%hct_ci_age <= 4, 'intermediate', 'high'))
```

### `nrm_2yr_pct` (2-yr non-relapse mortality estimate, Sorror 2005 cohort §4.1)

```
iif(%hct_ci = 0, 14,
  iif(%hct_ci <= 2, 21, 41))
```

### `os_2yr_pct` (2-yr overall survival estimate, §4.1)

```
iif(%hct_ci = 0, 71,
  iif(%hct_ci <= 2, 60, 34))
```

## Worked example — test case 3 (Sophia Nakamura)

Inputs: arrhythmia=true (1), diabetes=true (1), hepatic=`mild` (1), all others false/none. Age 52 → age_ge_40=true.

| Variable | Value |
|---|---:|
| %arr | 1 |
| %dm | 1 |
| %hep | 1 |
| (all other category vars) | 0 |
| %age40 | 1 |

`hct_ci = 1+0+0+1+0+0+0+0+0+0+0+0+0+1+0 = 3`.
`hct_ci_age = 3 + 1 = 4`.

`risk_group_2005`: `3 = 0` false, `<= 2` false → `'high'` ✓ (SPEC says high).
`risk_group_2014`: `4 <= 2` false, `<= 4` true → `'intermediate'` ✓ (SPEC says intermediate).
`nrm_2yr_pct`: `3 = 0` false, `<= 2` false → `41` ✓.
`os_2yr_pct`: → `34` ✓.

Matches SPEC test case 3.

## Notes

- Pure additive — pure FHIRPath suffices; no CQL.
- The hepatic/pulmonary choice items enforce the SPEC §2.1 "score the highest tier only" rule structurally (one-of), avoiding the bug where both mild + severe could be summed.
- 2-yr NRM and OS values come from the Sorror 2005 *validation* cohort (§4.1). Test case 5 in the SPEC notes that scores >> 3 saturate the high-band estimate (41 % NRM / 34 % OS) but real outcomes worsen — implementations should display the caveat as text content alongside the calculated value.
- `age_ge_40` may be auto-populated:
  `(today() - %patient.birthDate).toQuantity('a').value >= 40`.
- The original HCT-CI score (without age) and the composite are both reported per SPEC §4.3.
