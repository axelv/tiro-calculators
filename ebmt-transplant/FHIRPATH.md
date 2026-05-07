# EBMT (Gratwohl) Transplant Risk Score — FHIRPath expressions

Encoding of the EBMT Risk Score (Gratwohl 1998 / 2009 / 2012) for SDC. Pure additive integer score in [0, 7] over five components, with two of them encoded as 3-band categoricals.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_band` | choice | true | §2 — Age | Codes: `lt_20`, `20_40`, `gt_40` |
| `disease_stage` | choice | true | §2 / §2.1 — Disease stage | Codes: `early`, `intermediate`, `advanced` |
| `donor_type` | choice | true | §2 — Donor type | Codes: `sibling`, `unrelated` |
| `sex_match` | choice | true | §2 / §2.2 — Donor → recipient sex match | Codes: `female_to_male`, `other` |
| `interval_dx_to_hct` | choice | true | §2 — Time diagnosis → HCT | Codes: `le_12_or_cr1`, `gt_12` |

The form should pre-resolve the CR1 convention: any patient transplanted in CR1 selects `le_12_or_cr1` regardless of actual interval (SPEC §2 footnote ¹). Consider modelling as two questions (`interval` numeric in months + `transplant_in_cr1` boolean) and a derived `interval_dx_to_hct` enableWhen, but the score expression below assumes the resolved enum.

## Variables

| name | expression |
|---|---|
| `ageBand` | `%resource.item.where(linkId='age_band').answer.valueCoding.code` |
| `stage` | `%resource.item.where(linkId='disease_stage').answer.valueCoding.code` |
| `donor` | `%resource.item.where(linkId='donor_type').answer.valueCoding.code` |
| `sexMatch` | `%resource.item.where(linkId='sex_match').answer.valueCoding.code` |
| `interval` | `%resource.item.where(linkId='interval_dx_to_hct').answer.valueCoding.code` |
| `agePts` | `iif(%ageBand = 'lt_20', 0, iif(%ageBand = '20_40', 1, 2))` |
| `stagePts` | `iif(%stage = 'early', 0, iif(%stage = 'intermediate', 1, 2))` |
| `donorPts` | `iif(%donor = 'sibling', 0, 1)` |
| `sexPts` | `iif(%sexMatch = 'female_to_male', 1, 0)` |
| `intervalPts` | `iif(%interval = 'gt_12', 1, 0)` |

## Calculated expressions

### `score` (integer 0–7)

```fhirpath
%agePts + %stagePts + %donorPts + %sexPts + %intervalPts
```

### `risk_category` (string)

Three-tier grouping (SPEC §3 Risk Categories — most widely used grouping). For the optional 4-tier scheme, swap in the configurable variant.

```fhirpath
iif(%score <= 2, 'Low',
iif(%score <= 4, 'Intermediate',
                 'High'))
```

### `os_5yr_pct` (per-score 5-year overall survival, SPEC §4.2)

```fhirpath
iif(%score = 0, 71,
iif(%score = 1, 63,
iif(%score = 2, 55,
iif(%score = 3, 47,
iif(%score = 4, 38,
iif(%score = 5, 32,
iif(%score = 6, 26,
                24)))))))    // score = 7
```

### `trm_5yr_pct` (per-score 5-year transplant-related mortality)

```fhirpath
iif(%score = 0, 14,
iif(%score = 1, 20,
iif(%score = 2, 26,
iif(%score = 3, 32,
iif(%score = 4, 38,
iif(%score = 5, 46,
iif(%score = 6, 52,
                56)))))))
```

### `clinical_interpretation` (string)

```fhirpath
iif(%score <= 2, 'Acceptable transplant risk; standard allo-HCT pathway is appropriate.',
iif(%score <= 4, 'Counsel about substantial mortality risk; consider HCT-CI co-assessment, optimisation of modifiable factors, and reduced-intensity conditioning where indicated.',
                 'Discuss alternative strategies — clinical-trial enrolment, RIC, alternative graft source, or non-transplant approaches; expected 5-yr OS <30%.'))
```

## Worked example — test case 1 (Lukas Bauer)

Inputs: `age_band = lt_20`, `disease_stage = early`, `donor_type = sibling`, `sex_match = other` (M→M), `interval_dx_to_hct = le_12_or_cr1`.

| variable | value |
|---|---|
| `%agePts` | 0 |
| `%stagePts` | 0 |
| `%donorPts` | 0 |
| `%sexPts` | 0 |
| `%intervalPts` | 0 |

`%score = 0 + 0 + 0 + 0 + 0 = 0` → `'Low'`, OS 71 %, TRM 14 %. ✓

Sanity-check test case 5 (José Ramírez): `age_band = gt_40` (2) + `advanced` (2) + `unrelated` (1) + `female_to_male` (1) + `gt_12` (1) = **7** → `'High'`, OS 24 %, TRM 56 %. ✓

## Notes

- All five inputs are categorical with closed value sets — encode as `Coding` with a local `CodeSystem`, no free text.
- The interval rule is the only piece with hidden semantics (CR1 → 0 points). Either (a) front-load the rule in the form's UI as described above, or (b) accept `interval_months` (decimal) + `cr1` (boolean) and replace `%intervalPts` with `iif(%cr1 or %interval_months <= 12, 0, 1)`.
- The score is integer-valued and the OS / TRM lookups are per-score, not per-band. SPEC §4.3 also exposes per-band ranges, but the per-score table is what callers should display.
- For the optional 4-tier band (0-1 / 2 / 3-4 / 5-7) replace the `risk_category` ladder with `iif(%score <= 1, 'Low', iif(%score = 2, 'Low-intermediate', iif(%score <= 4, 'Intermediate', 'High')))`. Make this configurable per SPEC §3.
