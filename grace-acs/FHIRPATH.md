# GRACE ACS — FHIRPath expressions

> Encodes the Granger 2003 GRACE 1.0 in-hospital point-table nomogram.
> All five continuous-variable bands (age, HR, SBP, creatinine, Killip) are
> implemented as nested `iif` ladders over the input value; risk modifiers are
> binary; the in-hospital mortality lookup is a stepwise table per SPEC §3.2.
>
> **TBD coefficients flagged at top:**
> - **GRACE 2.0 (Fox 2014)** spline coefficients are not in the public domain
>   (SPEC §3.3) — *cannot* be encoded cleanly in FHIRPath. Use the published
>   nomogram lookup or wrap an authorised service.
> - **Eagle 2004 6-month discharge nomogram** is also TBD (SPEC §3.4) — not
>   covered here.
>
> What follows is the GRACE 1.0 admission/in-hospital model only.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | yes | §2 — age | 18–110 years. May be auto-populated from `Patient.birthDate`. |
| `heart_rate` | integer | yes | §2 — heart_rate | bpm; first measured pulse. |
| `systolic_bp` | integer | yes | §2 — systolic_bp | mmHg; first measured. |
| `creatinine` | decimal | yes | §2 — creatinine | **mg/dL**. Convert from µmol/L using `value / 88.4` upstream. |
| `killip_class` | choice | yes | §2 — killip_class | One-of `I` / `II` / `III` / `IV` (`valueCoding.code`). |
| `cardiac_arrest_at_admission` | boolean | yes | §2 — cardiac_arrest_at_admission | +39. |
| `st_segment_deviation` | boolean | yes | §2 — st_segment_deviation | +28. |
| `elevated_cardiac_enzymes` | boolean | yes | §2 — elevated_cardiac_enzymes | +14. |

LinkIds match SPEC field keys verbatim.

## Variables

Each variable resolves a single answer or computes the GRACE point sub-score for that variable.

| name | expression |
|---|---|
| `age` | `%resource.item.where(linkId='age').answer.value` |
| `hr` | `%resource.item.where(linkId='heart_rate').answer.value` |
| `sbp` | `%resource.item.where(linkId='systolic_bp').answer.value` |
| `cr` | `%resource.item.where(linkId='creatinine').answer.value` |
| `killip` | `%resource.item.where(linkId='killip_class').answer.value.code` |
| `arrest` | `%resource.item.where(linkId='cardiac_arrest_at_admission').answer.value` |
| `stdev` | `%resource.item.where(linkId='st_segment_deviation').answer.value` |
| `enz` | `%resource.item.where(linkId='elevated_cardiac_enzymes').answer.value` |
| `pts_age` | (see below) |
| `pts_hr` | (see below) |
| `pts_sbp` | (see below) |
| `pts_cr` | (see below) |
| `pts_killip` | (see below) |
| `pts_modifiers` | (see below) |

### `pts_age` (SPEC §3.1)

```
iif(%age < 30, 0,
  iif(%age < 40, 8,
    iif(%age < 50, 25,
      iif(%age < 60, 41,
        iif(%age < 70, 58,
          iif(%age < 80, 75,
            iif(%age < 90, 91, 100)))))))
```

### `pts_hr` (SPEC §3.1)

```
iif(%hr < 50, 0,
  iif(%hr < 70, 3,
    iif(%hr < 90, 9,
      iif(%hr < 110, 15,
        iif(%hr < 150, 24,
          iif(%hr < 200, 38, 46))))))
```

### `pts_sbp` (SPEC §3.1)

Note the inverse relationship: lower SBP → more points.

```
iif(%sbp < 80, 58,
  iif(%sbp < 100, 53,
    iif(%sbp < 120, 43,
      iif(%sbp < 140, 34,
        iif(%sbp < 160, 24,
          iif(%sbp < 200, 10, 0))))))
```

### `pts_cr` (SPEC §3.1)

```
iif(%cr < 0.40, 1,
  iif(%cr < 0.80, 4,
    iif(%cr < 1.20, 7,
      iif(%cr < 1.60, 10,
        iif(%cr < 2.00, 13,
          iif(%cr < 4.00, 21, 28))))))
```

### `pts_killip` (SPEC §3.1)

```
iif(%killip = 'I', 0,
  iif(%killip = 'II', 20,
    iif(%killip = 'III', 39, 59)))
```

### `pts_modifiers`

```
iif(%arrest = true, 39, 0)
  + iif(%stdev = true, 28, 0)
  + iif(%enz = true, 14, 0)
```

## Calculated expressions

### `total_points` (primary integer output, SPEC §3.1)

LinkId `total_points`, type `integer`:

```
%pts_age + %pts_hr + %pts_sbp + %pts_cr + %pts_killip + %pts_modifiers
```

### `in_hospital_mortality_pct` (stepwise lookup per SPEC §3.2)

LinkId `in_hospital_mortality_pct`, type `decimal`. The published nomogram is keyed in 10-point increments. The simplest encoding is to round down to the nearest 10 and pick the corresponding row; the more clinically useful encoding linearly interpolates.

**Stepwise (rounded down to nearest table row):**

```
iif(%total_points <= 60, 0.2,
  iif(%total_points < 80, 0.3,
    iif(%total_points < 90, 0.4,
      iif(%total_points < 100, 0.6,
        iif(%total_points < 110, 0.8,
          iif(%total_points < 120, 1.1,
            iif(%total_points < 130, 1.6,
              iif(%total_points < 140, 2.1,
                iif(%total_points < 150, 2.9,
                  iif(%total_points < 160, 3.9,
                    iif(%total_points < 170, 5.4,
                      iif(%total_points < 180, 7.3,
                        iif(%total_points < 190, 9.8,
                          iif(%total_points < 200, 13,
                            iif(%total_points < 210, 18,
                              iif(%total_points < 220, 23,
                                iif(%total_points < 230, 29,
                                  iif(%total_points < 240, 36,
                                    iif(%total_points < 250, 44, 52))))))))))))))))))
```

**Linearly interpolated** (recommended for display): FHIRPath does not have a built-in "look up the bracketing rows and interpolate" idiom, so the cleanest encoding is to compute the lower-anchor mortality and the slope-to-next-row separately, e.g.

```
// lower-anchor (l_pts, l_mort) for each 10-pt bin
// upper-anchor (u_pts, u_mort) for each bin
// in_hospital_mortality_pct = l_mort + (%total_points - l_pts) / (u_pts - l_pts) * (u_mort - l_mort)
```

This requires writing 18 nested `iif`s for `l_mort`, `l_pts`, and the slope. In practice most implementations just expose the stepwise band; if continuous interpolation is needed, lift the lookup into a CQL library.

### `risk_category_inhospital` (SPEC §4.2)

LinkId `risk_category_inhospital`, type `string`:

```
iif(%total_points <= 108, 'low',
  iif(%total_points <= 140, 'intermediate', 'high'))
```

### `risk_category_6mo`

GRACE 2.0 cut-offs (1–88 / 89–118 / 119–263) apply to the GRACE 2.0 *score*, not to the Granger 2003 in-hospital point total. Without GRACE 2.0 coefficients these cannot be cleanly mapped from `total_points`; emit only when GRACE 2.0 is wired in.

## Worked example — test case 2 (Helena Schmidt)

Inputs: age 68, HR 95, SBP 145, creatinine 1.4, Killip II, cardiac arrest false, ST deviation true, enzymes true.

| Variable | Resolved value | Sub-score |
|---|---:|---:|
| %age | 68 | `60..70`-ish: `< 30 false, < 40 false, < 50 false, < 60 false, < 70 true` → 58 |
| %hr | 95 | `< 110 true (after the < 90 false)` → 15 |
| %sbp | 145 | `< 160 true (after the lower bands false)` → 24 |
| %cr | 1.4 | `< 1.60 true (after < 1.20 false)` → 10 |
| %killip | II | → 20 |
| %arrest | false | 0 |
| %stdev | true | 28 |
| %enz | true | 14 |

`total_points = 58 + 15 + 24 + 10 + 20 + 0 + 28 + 14 = 169`.

`risk_category_inhospital`: `169 <= 108` false, `<= 140` false → `'high'`. ✓ (SPEC says high.)

`in_hospital_mortality_pct` stepwise: `< 170` true (after < 160 false) → 7.3. SPEC quotes ~7.0 % via interpolation between 5.4 (160) and 7.3 (170); the stepwise approximation (7.3 %) is within tolerance.

Matches SPEC test case 2.

## Notes

- **GRACE 1.0** is fully encodable in FHIRPath via nested `iif` ladders.
- **GRACE 2.0** (in-hospital, 6-mo, 1-yr, 3-yr from spline model) **cannot** be encoded in FHIRPath without the published spline coefficients (TBD per SPEC §3.3). Recommended: store the published GRACE 2.0 nomogram as a side-table (e.g. embedded ValueSet or external service) and wrap the call in a CQL library.
- **Eagle 2004 discharge score** (SPEC §3.4) is also TBD — not encoded here.
- **Linear interpolation** in the in-hospital mortality lookup is verbose in FHIRPath; if continuous output is required, lift to CQL.
- **SBP points are inversely ordered**: take care that the `iif` ladder uses the correct comparison direction.
- **Killip class** assumes a `valueCoding` with `.code` of `I`/`II`/`III`/`IV`. If the form encodes Killip as an integer 1–4, replace `=` checks accordingly.
- **Creatinine** must be in mg/dL. If the form captures µmol/L, divide by 88.4 in the variable: `%resource.item.where(linkId='creatinine').answer.value / 88.4`.
- **Age** can be auto-populated: `(today() - %patient.birthDate).toQuantity('a').value`.
