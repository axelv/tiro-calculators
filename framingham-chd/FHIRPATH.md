# Framingham Risk Score (Hard CHD, 10-yr) — FHIRPath expressions

> Encodes the Wilson 1998 / ATP III hard-CHD point-table system. All five
> sub-scores are sex-stratified and (except HDL) age-stratified, so the FHIRPath
> ladders are 2D. The point-to-risk lookup is also sex-stratified.
>
> No TBD coefficients — the entire calculator is a deterministic point lookup.
> The original publication's full Cox/logistic model (with `ln(age)`,
> `ln(TC)`, `ln(HDL)`, `ln(SBP)`, mean centering, and survival-to-baseline-
> hazard escalation) is **not** what MDCalc / ATP III implementations use; this
> spec encodes the ATP III point tables only.

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `sex` | choice | yes | §2 — Sex | One-of `male` / `female` (`valueCoding.code`). |
| `age` | integer | yes | §2 — Age | 30–79 years. Auto-populatable from `Patient.birthDate`. |
| `total_chol` | decimal | yes | §2 — Total cholesterol | **mg/dL**. Convert from mmol/L using `value * 38.67` upstream. |
| `hdl` | decimal | yes | §2 — HDL cholesterol | **mg/dL**. Same conversion. |
| `sbp` | integer | yes | §2 — Systolic BP | mmHg. |
| `treated_htn` | boolean | yes | §2 — Treated for hypertension | — |
| `smoker` | boolean | yes | §2 — Current smoker | — |

LinkIds use SPEC field keys (snake_cased).

## Variables

| name | expression |
|---|---|
| `sex` | `%resource.item.where(linkId='sex').answer.value.code` |
| `age` | `%resource.item.where(linkId='age').answer.value` |
| `tc` | `%resource.item.where(linkId='total_chol').answer.value` |
| `hdl` | `%resource.item.where(linkId='hdl').answer.value` |
| `sbp` | `%resource.item.where(linkId='sbp').answer.value` |
| `treated` | `%resource.item.where(linkId='treated_htn').answer.value` |
| `smoker` | `%resource.item.where(linkId='smoker').answer.value` |
| `pts_age` | (see below) |
| `pts_tc` | (see below) |
| `pts_smk` | (see below) |
| `pts_hdl` | (see below) |
| `pts_sbp` | (see below) |

### `pts_age` (SPEC §3.1; sex-stratified)

```
iif(%sex = 'male',
  iif(%age < 35, -9,
    iif(%age < 40, -4,
      iif(%age < 45, 0,
        iif(%age < 50, 3,
          iif(%age < 55, 6,
            iif(%age < 60, 8,
              iif(%age < 65, 10,
                iif(%age < 70, 11,
                  iif(%age < 75, 12, 13))))))))),
  iif(%age < 35, -7,
    iif(%age < 40, -3,
      iif(%age < 45, 0,
        iif(%age < 50, 3,
          iif(%age < 55, 6,
            iif(%age < 60, 8,
              iif(%age < 65, 10,
                iif(%age < 70, 12,
                  iif(%age < 75, 14, 16))))))))))
```

### `pts_tc` (SPEC §3.2; sex × age-band × TC-band 3D table)

The TC age-bands are wider than the §3.1 age-bands (5 bands: 20–39, 40–49, 50–59, 60–69, 70–79). Implement as nested `iif` keyed first by sex, then by age-band, then by TC-band.

**Men:**

```
iif(%sex = 'male',
  iif(%age < 40,
    iif(%tc < 160, 0, iif(%tc < 200, 4, iif(%tc < 240, 7, iif(%tc < 280, 9, 11)))),
    iif(%age < 50,
      iif(%tc < 160, 0, iif(%tc < 200, 3, iif(%tc < 240, 5, iif(%tc < 280, 6, 8)))),
      iif(%age < 60,
        iif(%tc < 160, 0, iif(%tc < 200, 2, iif(%tc < 240, 3, iif(%tc < 280, 4, 5)))),
        iif(%age < 70,
          iif(%tc < 160, 0, iif(%tc < 200, 1, iif(%tc < 240, 1, iif(%tc < 280, 2, 3)))),
          iif(%tc < 160, 0, iif(%tc < 200, 0, iif(%tc < 240, 0, iif(%tc < 280, 1, 1)))))))),
  // women branch:
  iif(%age < 40,
    iif(%tc < 160, 0, iif(%tc < 200, 4, iif(%tc < 240, 8, iif(%tc < 280, 11, 13)))),
    iif(%age < 50,
      iif(%tc < 160, 0, iif(%tc < 200, 3, iif(%tc < 240, 6, iif(%tc < 280, 8, 10)))),
      iif(%age < 60,
        iif(%tc < 160, 0, iif(%tc < 200, 2, iif(%tc < 240, 4, iif(%tc < 280, 5, 7)))),
        iif(%age < 70,
          iif(%tc < 160, 0, iif(%tc < 200, 1, iif(%tc < 240, 2, iif(%tc < 280, 3, 4)))),
          iif(%tc < 160, 0, iif(%tc < 200, 1, iif(%tc < 240, 1, iif(%tc < 280, 2, 2)))))))))
```

(Replace the `// women branch:` comment with a real comma-separated continuation in production — FHIRPath has no comments. Shown here only for readability.)

### `pts_smk` (SPEC §3.3)

If non-smoker → 0; otherwise sex × age-band lookup.

```
iif(%smoker = false, 0,
  iif(%sex = 'male',
    iif(%age < 40, 8,
      iif(%age < 50, 5,
        iif(%age < 60, 3,
          iif(%age < 70, 1, 1)))),
    iif(%age < 40, 9,
      iif(%age < 50, 7,
        iif(%age < 60, 4,
          iif(%age < 70, 2, 1))))))
```

### `pts_hdl` (SPEC §3.4; sex-independent)

```
iif(%hdl >= 60, -1,
  iif(%hdl >= 50, 0,
    iif(%hdl >= 40, 1, 2)))
```

### `pts_sbp` (SPEC §3.5; sex × treated × SBP-band)

**Men:**

```
iif(%sex = 'male',
  iif(%treated = false,
    iif(%sbp < 120, 0,
      iif(%sbp < 130, 0,
        iif(%sbp < 140, 1,
          iif(%sbp < 160, 1, 2)))),
    iif(%sbp < 120, 0,
      iif(%sbp < 130, 1,
        iif(%sbp < 140, 2,
          iif(%sbp < 160, 2, 3))))),
  // women branch:
  iif(%treated = false,
    iif(%sbp < 120, 0,
      iif(%sbp < 130, 1,
        iif(%sbp < 140, 2,
          iif(%sbp < 160, 3, 4)))),
    iif(%sbp < 120, 0,
      iif(%sbp < 130, 3,
        iif(%sbp < 140, 4,
          iif(%sbp < 160, 5, 6))))))
```

## Calculated expressions

### `total_points` (primary integer output)

LinkId `total_points`, type `integer`:

```
%pts_age + %pts_tc + %pts_smk + %pts_hdl + %pts_sbp
```

### `risk_10yr_pct` (sex-stratified lookup, SPEC §3.6)

Returned as a *string* because the table contains banded values (`'< 1 %'`, integer percentages, `'>= 30 %'`). LinkId `risk_10yr_pct`, type `string`:

**Men:**

```
iif(%sex = 'male',
  iif(%total_points < 1, '< 1 %',
    iif(%total_points <= 4, '1 %',
      iif(%total_points <= 6, '2 %',
        iif(%total_points = 7, '3 %',
          iif(%total_points = 8, '4 %',
            iif(%total_points = 9, '5 %',
              iif(%total_points = 10, '6 %',
                iif(%total_points = 11, '8 %',
                  iif(%total_points = 12, '10 %',
                    iif(%total_points = 13, '12 %',
                      iif(%total_points = 14, '16 %',
                        iif(%total_points = 15, '20 %',
                          iif(%total_points = 16, '25 %', '>= 30 %'))))))))))))),
  // women branch:
  iif(%total_points < 9, '< 1 %',
    iif(%total_points <= 12, '1 %',
      iif(%total_points <= 14, '2 %',
        iif(%total_points = 15, '3 %',
          iif(%total_points = 16, '4 %',
            iif(%total_points = 17, '5 %',
              iif(%total_points = 18, '6 %',
                iif(%total_points = 19, '8 %',
                  iif(%total_points = 20, '11 %',
                    iif(%total_points = 21, '14 %',
                      iif(%total_points = 22, '17 %',
                        iif(%total_points = 23, '22 %',
                          iif(%total_points = 24, '27 %', '>= 30 %')))))))))))))
)
```

### `risk_10yr_pct_numeric` (numeric mid-point, optional)

For decision logic that needs a comparable number, expose the integer-percentage as a decimal, mapping `'< 1 %'` → 0.5 and `'>= 30 %'` → 30:

```
iif(%sex = 'male',
  iif(%total_points < 1, 0.5,
    iif(%total_points <= 4, 1,
      iif(%total_points <= 6, 2,
        iif(%total_points = 7, 3,
          iif(%total_points = 8, 4,
            iif(%total_points = 9, 5,
              iif(%total_points = 10, 6,
                iif(%total_points = 11, 8,
                  iif(%total_points = 12, 10,
                    iif(%total_points = 13, 12,
                      iif(%total_points = 14, 16,
                        iif(%total_points = 15, 20,
                          iif(%total_points = 16, 25, 30))))))))))))),
  iif(%total_points < 9, 0.5,
    iif(%total_points <= 12, 1,
      iif(%total_points <= 14, 2,
        iif(%total_points = 15, 3,
          iif(%total_points = 16, 4,
            iif(%total_points = 17, 5,
              iif(%total_points = 18, 6,
                iif(%total_points = 19, 8,
                  iif(%total_points = 20, 11,
                    iif(%total_points = 21, 14,
                      iif(%total_points = 22, 17,
                        iif(%total_points = 23, 22,
                          iif(%total_points = 24, 27, 30))))))))))))))
```

### `risk_category` (ATP III, SPEC §4)

```
iif(%risk_10yr_pct_numeric < 10, 'low',
  iif(%risk_10yr_pct_numeric <= 20, 'intermediate', 'high'))
```

## Worked example — test case 3 (Marco Bianchi, 53 y/o male smoker)

Inputs: sex `male`, age 53, TC 210, HDL 45, SBP 128, treated_htn false, smoker true.

| Variable | Resolved | Sub-score | SPEC table |
|---|---|---:|---|
| %pts_age | male, 53 → `< 55` true (after `< 50` false) | 6 | §3.1 (50–54, men) |
| %pts_tc | male, age `[50,60)`, TC `[200,240)` | 3 | §3.2 (200–239, age 50–59, men) |
| %pts_smk | smoker, male, age `[50,60)` | 3 | §3.3 (50–59, men) |
| %pts_hdl | HDL 45 → `>= 40 true` after `>= 50 false` | 1 | §3.4 (40–49) |
| %pts_sbp | male, untreated, SBP `[120,130)` | 0 | §3.5 (120–129, untreated, men) |

`total_points = 6 + 3 + 3 + 1 + 0 = 13`.

Men's `risk_10yr_pct` ladder: `< 1` false, `<= 4` false, `<= 6` false, `= 7..12` false, `= 13` true → `'12 %'`.
`risk_10yr_pct_numeric = 12`.
`risk_category`: `12 < 10` false, `<= 20` true → `'intermediate'`.

Matches SPEC test case 3 (13 points, 12 %, intermediate).

## Notes

- The table is large but every row is a deterministic threshold — pure FHIRPath suffices; no `ln`/`exp` needed because ATP III gives the integer points table directly. (The Wilson 1998 *underlying* Cox model does use `ln(age)`, `ln(TC)`, `ln(HDL)`, `ln(SBP)`, smoking, and mean-centering against the population means, but ATP III re-discretised it.)
- TC and HDL inputs must be in **mg/dL**. Convert mmol/L → mg/dL by `× 38.67` upstream.
- `pts_tc` is the most verbose ladder (5 age-bands × 5 TC-bands × 2 sexes = 50 cells). Implementations may prefer to lift it into a CQL library or split into 10 sub-variables (one per sex × age-band) for readability.
- `risk_10yr_pct` returns banded strings to match the published table; `risk_10yr_pct_numeric` exposes a comparable number for downstream logic and ATP III categorisation.
- The "women < 9 → < 1 %" floor and "men >= 17 → >= 30 %" ceiling are encoded with the leading `iif` and the trailing fallback respectively.
- ATP III caveat (SPEC §1): do **not** apply this score to patients with established CHD/PAD/AAA/carotid disease/diabetes — those are CHD risk-equivalents. The Questionnaire should gate the calculator behind an exclusion-criteria item; the FHIRPath layer does not enforce it.
