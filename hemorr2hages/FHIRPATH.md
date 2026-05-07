# HEMORR₂HAGES Score for Major Bleeding Risk — FHIRPath expressions

> Encodes the eleven boolean inputs from SPEC §2 and the score → bleeding-rate
> mapping from §4 (Gage 2006, NRAF cohort) into FHIRPath. The R₂ component
> (rebleeding risk) is double-weighted; every other component contributes 1.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `hepatic_or_renal` | boolean | yes | §2 H (Hepatic / renal disease) | +1 |
| `ethanol_abuse` | boolean | yes | §2 E (Ethanol abuse) | +1 |
| `malignancy` | boolean | yes | §2 M (Malignancy history) | +1 |
| `age_over_75` | boolean | yes | §2 O (strictly > 75 y) | +1. Compute from DOB upstream; `age_over_75 = age_years > 75`. |
| `reduced_platelets` | boolean | yes | §2 R | +1. Includes antiplatelet use, thrombocytopenia, dyscrasia. |
| `rebleeding_risk` | boolean | yes | §2 R₂ (prior major bleed) | **+2 — double-weighted.** |
| `uncontrolled_hypertension` | boolean | yes | §2 H (SBP > 160 despite Rx) | +1 |
| `anemia` | boolean | yes | §2 A (Hb < 13 men / < 12 women) | +1 |
| `genetic_cyp2c9` | boolean | yes | §2 G (CYP2C9*2/*3) | +1 |
| `excessive_fall_risk` | boolean | yes | §2 E (Excessive fall risk) | +1 |
| `stroke_history` | boolean | yes | §2 S (any prior stroke / TIA) | +1 |
| `score` | integer | computed | §3 sum | Range 0–12. |
| `bleeds_per_100_patient_years` | decimal | computed | §4 table | Point estimate per Gage 2006. |
| `risk_category` | choice | computed | §4 table | `Low` \| `Intermediate` \| `Intermediate–high` \| `High` \| `Very high`. |

> SPEC §3 says all eleven components must be answered (no missing-value
> imputation). Mark each boolean linkId `required = true` in the
> Questionnaire so unanswered items block submission rather than defaulting
> to false.

---

## Variables

`iif(<bool>, 1, 0)` is used to project booleans into integer points so that
`+` is well-defined.

| name | expression |
|---|---|
| `H1` | `iif(%resource.repeat(item).where(linkId='hepatic_or_renal').answer.valueBoolean.first(), 1, 0)` |
| `E1` | `iif(%resource.repeat(item).where(linkId='ethanol_abuse').answer.valueBoolean.first(), 1, 0)` |
| `M`  | `iif(%resource.repeat(item).where(linkId='malignancy').answer.valueBoolean.first(), 1, 0)` |
| `O`  | `iif(%resource.repeat(item).where(linkId='age_over_75').answer.valueBoolean.first(), 1, 0)` |
| `R`  | `iif(%resource.repeat(item).where(linkId='reduced_platelets').answer.valueBoolean.first(), 1, 0)` |
| `R2` | `iif(%resource.repeat(item).where(linkId='rebleeding_risk').answer.valueBoolean.first(), 2, 0)` |
| `H2` | `iif(%resource.repeat(item).where(linkId='uncontrolled_hypertension').answer.valueBoolean.first(), 1, 0)` |
| `A`  | `iif(%resource.repeat(item).where(linkId='anemia').answer.valueBoolean.first(), 1, 0)` |
| `G`  | `iif(%resource.repeat(item).where(linkId='genetic_cyp2c9').answer.valueBoolean.first(), 1, 0)` |
| `E2` | `iif(%resource.repeat(item).where(linkId='excessive_fall_risk').answer.valueBoolean.first(), 1, 0)` |
| `S`  | `iif(%resource.repeat(item).where(linkId='stroke_history').answer.valueBoolean.first(), 1, 0)` |

---

## Calculated expressions

### `score` (primary output, integer 0–12)

```fhirpath
%H1 + %E1 + %M + %O + %R + %R2 + %H2 + %A + %G + %E2 + %S
```

### `bleeds_per_100_patient_years` (Gage 2006 point estimate)

```fhirpath
iif(%score = 0, 1.9,
  iif(%score = 1, 2.5,
    iif(%score = 2, 5.3,
      iif(%score = 3, 8.4,
        iif(%score = 4, 10.4, 12.3)))))
```

(Scores ≥ 5 are pooled in the published table at 12.3.)

### `risk_category`

```fhirpath
iif(%score <= 1, 'Low',
  iif(%score = 2, 'Intermediate',
    iif(%score = 3, 'Intermediate-high',
      iif(%score = 4, 'High', 'Very high'))))
```

### Optional: 95 % CI bounds

If you want to expose the CI:

```fhirpath
// lower bound
iif(%score = 0, 0.6,
  iif(%score = 1, 1.3,
    iif(%score = 2, 3.4,
      iif(%score = 3, 4.9,
        iif(%score = 4, 5.1, 5.8)))))

// upper bound
iif(%score = 0, 4.4,
  iif(%score = 1, 4.3,
    iif(%score = 2, 8.1,
      iif(%score = 3, 13.6,
        iif(%score = 4, 18.9, 23.1)))))
```

---

## Worked example — test case 4 (score 4, High)

Inputs (Mrs Patricia O'Connor, prior TIA + prior GI bleed, age 76):

| linkId | value |
|---|---|
| `hepatic_or_renal` | false |
| `ethanol_abuse` | false |
| `malignancy` | false |
| `age_over_75` | **true** |
| `reduced_platelets` | false |
| `rebleeding_risk` | **true** |
| `uncontrolled_hypertension` | false |
| `anemia` | false |
| `genetic_cyp2c9` | false |
| `excessive_fall_risk` | false |
| `stroke_history` | **true** |

Variable evaluation:

- `%O = 1`, `%R2 = 2`, `%S = 1`; all others = 0.

Calculations:

- `score = 0+0+0+1+0+2+0+0+0+0+1 = 4` ✓
- `bleeds_per_100_patient_years = iif(4 = 0, 1.9, iif(4 = 1, 2.5, iif(4 = 2, 5.3, iif(4 = 3, 8.4, iif(4 = 4, 10.4, 12.3))))) = 10.4` ✓
- `risk_category = iif(4 <= 1, 'Low', iif(4 = 2, 'Intermediate', iif(4 = 3, 'Intermediate-high', iif(4 = 4, 'High', 'Very high')))) = 'High'` ✓

Matches `TEST_CASES.md` §4 expected output.

---

## Notes

- The R₂ doubling is encoded by setting the `iif(...)` true-branch to `2`
  (vs. `1` for all other components) — keeps the sum a pure integer.
- Score range: 0–12. Maximum is achieved when all eleven booleans are true
  (10 × 1 + 1 × 2). Test case 5 confirms 12 ⇒ `Very high`, 12.3 / 100 py.
- `age_over_75` is **strictly greater than 75** (SPEC §2 row 4). Compute
  upstream using `today()` minus DOB, e.g.
  `((today() - %birthDate).value div 365.25) > 75` or use the FHIRPath
  date-arithmetic idiom your renderer supports.
- No imputation: per SPEC §3 every component must be answered. Treat the
  underlying boolean as **required** — do not let `valueBoolean.first()`
  silently default to empty (which evaluates as `{}` and would break
  `iif`). If your renderer can yield an empty boolean, wrap each variable
  with `…valueBoolean.first().iif(... , 1, 0)` style or first coerce via
  `…exists() and …valueBoolean.first()`.
- No TBD coefficients. No CQL escalation needed — pure FHIRPath.
