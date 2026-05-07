# R-ISS (Revised International Staging System for Multiple Myeloma) — FHIRPath expressions

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `b2m` | decimal | yes | Serum β2-microglobulin (mg/L) | Used to compute ISS stage. |
| `albumin` | decimal | yes | Serum albumin (g/dL) | Used to compute ISS stage. Threshold 3.5 g/dL. If sourced in g/L, multiply by 0.1 upstream. |
| `high_risk_ca` | boolean | yes | High-risk iFISH CA (any of del(17p), t(4;14), t(14;16)) | `true` = high-risk; `false` = standard-risk. iFISH must be on CD138-purified plasma cells. |
| `ldh_elevated` | boolean | yes | Serum LDH > local ULN | `true` = elevated; `false` = normal. |

> Implementation note: `high_risk_ca` may instead be modelled as three sub-booleans (`del17p`, `t_4_14`, `t_14_16`) combined into a variable; see Variables below.

## Variables

Place these as `extension[http://hl7.org/fhir/StructureDefinition/variable]` on the questionnaire root or on the calculated item.

| name | expression |
|---|---|
| `b2m` | `%resource.item.where(linkId='b2m').answer.value` |
| `alb` | `%resource.item.where(linkId='albumin').answer.value` |
| `caHigh` | `%resource.item.where(linkId='high_risk_ca').answer.value` |
| `ldhHigh` | `%resource.item.where(linkId='ldh_elevated').answer.value` |
| `issStage` | `iif(%b2m >= 5.5, 'III', iif(%b2m < 3.5 and %alb >= 3.5, 'I', 'II'))` |

> Optional: if `high_risk_ca` is decomposed into three booleans, define
> `caHigh = (item.where(linkId='del17p').answer.value = true) or (item.where(linkId='t_4_14').answer.value = true) or (item.where(linkId='t_14_16').answer.value = true)`.

## Calculated expressions

### `iss_stage` (read-only display)

```fhirpath
%issStage
```

Yields `'I' | 'II' | 'III'`.

### `r_iss_stage` (primary output)

```fhirpath
iif(%issStage = 'I' and %caHigh = false and %ldhHigh = false,
    'I',
    iif(%issStage = 'III' and (%caHigh = true or %ldhHigh = true),
        'III',
        'II'))
```

Yields `'I' | 'II' | 'III'`.

### Secondary outputs (interpretation lookup)

`5yr_os_pct`:

```fhirpath
iif(%rIssStage = 'I', 82, iif(%rIssStage = 'III', 40, 62))
```

`5yr_pfs_pct`:

```fhirpath
iif(%rIssStage = 'I', 55, iif(%rIssStage = 'III', 24, 36))
```

`median_os_months` (use string for "not reached"):

```fhirpath
iif(%rIssStage = 'I', 'not reached', iif(%rIssStage = 'III', '43', '83'))
```

`median_pfs_months`:

```fhirpath
iif(%rIssStage = 'I', 66, iif(%rIssStage = 'III', 29, 42))
```

`interpretation`:

```fhirpath
iif(%rIssStage = 'I', 'Favorable prognosis',
  iif(%rIssStage = 'III', 'Poor prognosis; high-risk biology',
    'Intermediate prognosis (heterogeneous group)'))
```

> Add `rIssStage` as a variable referencing the `r_iss_stage` calculated expression to avoid repeating the nested `iif` ladder.

## Worked example — test case 1 (Catherine Aldridge → R-ISS I)

Inputs: `b2m = 2.6`, `albumin = 4.1`, `high_risk_ca = false`, `ldh_elevated = false`.

1. `%issStage = iif(2.6 >= 5.5, 'III', iif(2.6 < 3.5 and 4.1 >= 3.5, 'I', 'II'))`
   - `2.6 >= 5.5` → false
   - `2.6 < 3.5 and 4.1 >= 3.5` → true
   - → `'I'`
2. `r_iss_stage = iif('I' = 'I' and false = false and false = false, 'I', …)` → first branch fires → **`'I'`**
3. Secondary: `5yr_os_pct = 82`, `5yr_pfs_pct = 55`, `median_os_months = 'not reached'`, `median_pfs_months = 66`, `interpretation = 'Favorable prognosis'`.

Matches the expected R-ISS I output in TEST_CASES.md.

Spot-check test case 4 (George Whitfield, ISS III with standard CA + normal LDH):
- `%issStage` → `iif(6.4 >= 5.5, 'III', …)` → `'III'`.
- `r_iss_stage`: first branch false (issStage ≠ 'I'); second branch `'III' = 'III' and (false or false)` → false; default → **`'II'`** (the documented downgrade corner case).

## Notes

- Pure boolean/categorical logic: FHIRPath is sufficient; no CQL needed.
- Coerce `b2m` and `albumin` to decimal upstream — comparisons against `3.5` and `5.5` rely on numeric types.
- The `high_risk_ca` decomposition (three FISH booleans) is recommended for clinical capture; the variable `caHigh` is the only thing the staging logic needs.
- "Missing data" handling per spec §3.3: if any required item is missing, R-ISS cannot be assigned. Express with an `enableWhen` gate or wrap each calc in
  `iif(%b2m.exists() and %alb.exists() and %caHigh.exists() and %ldhHigh.exists(), <expr>, {})`
  to suppress output when inputs are incomplete.
- `median_os_months` returns a String in the "not reached" branch — keep the FHIR item type as `string` (or split into two items: a flag and a numeric).
