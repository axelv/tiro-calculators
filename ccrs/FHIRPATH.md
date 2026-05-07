# CCRS / CHRS — Clonal Hematopoiesis Risk Score (Weeks 2023) — FHIRPath expressions

A pure-FHIRPath encoding of the CHRS (a.k.a. CCRS) calculator. The score is a weighted sum of 8 features (each binary), and the category / 10-year MN risk are derived by nested `iif()` ladders. Suitable for an SDC `Questionnaire` with `cqf-expression` / `calculatedExpression` / `variable` extensions.

---

## Item linkIds (QuestionnaireResponse contract)

The SPEC's data model has both raw clinical inputs (age, RDW, MCV, Hb, platelets, ANC, sex, mutations, VAFs) and the eight CHRS feature flags derived from them. The cleanest split for an SDC form is to capture the raw values and **derive** the binary CHRS features as variables. Both layers are listed below; mark all raw clinical items required.

### Raw clinical inputs (form fields)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_years` | decimal | yes | `age` | Years. Cutoff ≥ 65. |
| `RDW` | decimal | yes | `RDW` | %. Cutoff ≥ 15. |
| `MCV` | decimal | yes | `MCV` | fL. Cutoff > 100. |
| `single_DNMT3A` | boolean | yes | `single_DNMT3A` | Exactly one mutation, in DNMT3A only. Mutually exclusive with `high_risk_mutation = true` and `n_mutations >= 2`. |
| `high_risk_mutation` | boolean | yes | `high_risk_mutation` | Any mutation in SRSF2, SF3B1, ZRSR2, IDH1, IDH2, FLT3, RUNX1, JAK2, TP53. |
| `n_mutations` | integer | yes | `n_mutations` | Total qualifying somatic mutations. ≥ 2 is the adverse bin. |
| `max_VAF` | decimal | yes | `max_VAF` | Fraction 0–1. Cutoff > 0.2. |
| `cytopenia_status` | choice | yes | `cytopenia_status` | One of `CHIP` \| `CCUS`. CCUS = any unexplained, persistent cytopenia per WHO. |

> Optional: capture the underlying CBC values (`Hb`, `platelets`, `ANC`, `sex_for_hb_threshold`) and derive `cytopenia_status` from them; see the Notes section. The SPEC's primary calculator surface is the eight CHRS features, so the form-level inputs above are the contract.

### Calculated outputs

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `points_single_DNMT3A` | decimal | n/a (calculated) | feature_contributions.single_DNMT3A | 0.5 if true, else 1.0. |
| `points_high_risk_mutation` | decimal | n/a (calculated) | feature_contributions.high_risk_mutation | 2.5 if true, else 1.0. |
| `points_n_mutations` | decimal | n/a (calculated) | feature_contributions.n_mutations | 2.0 if `≥ 2`, else 1.0. |
| `points_max_VAF` | decimal | n/a (calculated) | feature_contributions.max_VAF | 2.0 if `> 0.2`, else 1.0. |
| `points_RDW` | decimal | n/a (calculated) | feature_contributions.RDW | 2.5 if `≥ 15 %`, else 1.0. |
| `points_MCV` | decimal | n/a (calculated) | feature_contributions.MCV | 2.5 if `> 100 fL`, else 1.0. |
| `points_cytopenia_status` | decimal | n/a (calculated) | feature_contributions.cytopenia_status | 1.5 if CCUS, else 1.0. |
| `points_age` | decimal | n/a (calculated) | feature_contributions.age | 1.5 if `≥ 65`, else 1.0. |
| `CHRS_score` | decimal | n/a (calculated) | output `CHRS_score` | Sum of the eight points. Range 7.5–16.5. |
| `CHRS_category` | string | n/a (calculated) | output `CHRS_category` | enum: `low` \| `intermediate` \| `high`. |
| `risk_10y_progression_MN` | decimal | n/a (calculated) | output `risk_10y_progression_MN` | Category mean: 0.67 / 7.83 / 52.2. |

---

## Variables

| name | expression |
|---|---|
| `age_years` | `%resource.item.where(linkId='age_years').answer.value.first()` |
| `RDW` | `%resource.item.where(linkId='RDW').answer.value.first()` |
| `MCV` | `%resource.item.where(linkId='MCV').answer.value.first()` |
| `single_DNMT3A` | `%resource.item.where(linkId='single_DNMT3A').answer.value.first()` |
| `high_risk_mutation` | `%resource.item.where(linkId='high_risk_mutation').answer.value.first()` |
| `n_mutations` | `%resource.item.where(linkId='n_mutations').answer.value.first()` |
| `max_VAF` | `%resource.item.where(linkId='max_VAF').answer.value.first()` |
| `cytopenia_status` | `%resource.item.where(linkId='cytopenia_status').answer.value.first()` |

> If `cytopenia_status` is captured as a `choice` item with `Coding` answers, replace the variable expression with `%resource.item.where(linkId='cytopenia_status').answer.value.code.first()`.

---

## Calculated expressions

### `points_single_DNMT3A`

```
iif(%single_DNMT3A, 0.5, 1.0)
```

### `points_high_risk_mutation`

```
iif(%high_risk_mutation, 2.5, 1.0)
```

### `points_n_mutations`

```
iif(%n_mutations >= 2, 2.0, 1.0)
```

### `points_max_VAF`

The SPEC cutoff is `> 0.2` for the adverse bin (note: strict `>`, not `>=`).

```
iif(%max_VAF > 0.2, 2.0, 1.0)
```

### `points_RDW`

Adverse bin is `≥ 15 %` (inclusive).

```
iif(%RDW >= 15, 2.5, 1.0)
```

### `points_MCV`

Adverse bin is `> 100 fL` (strict `>`, per SPEC §2.1).

```
iif(%MCV > 100, 2.5, 1.0)
```

### `points_cytopenia_status`

```
iif(%cytopenia_status = 'CCUS', 1.5, 1.0)
```

### `points_age`

```
iif(%age_years >= 65, 1.5, 1.0)
```

### `CHRS_score`

```
%points_single_DNMT3A
+ %points_high_risk_mutation
+ %points_n_mutations
+ %points_max_VAF
+ %points_RDW
+ %points_MCV
+ %points_cytopenia_status
+ %points_age
```

### `CHRS_category`

Bands per SPEC §3.3: Low ≤ 9.5, Intermediate 10.0–12.0, High ≥ 12.5. Using `< 10` for the low/intermediate boundary (the next valid score above 9.5 is 10.0; CHRS scores are always multiples of 0.5).

```
iif(%CHRS_score >= 12.5, 'high',
  iif(%CHRS_score >= 10, 'intermediate', 'low'))
```

### `risk_10y_progression_MN`

Category-mean 10-year cumulative incidence per SPEC §4.1.

```
iif(%CHRS_category = 'high', 52.2,
  iif(%CHRS_category = 'intermediate', 7.83, 0.67))
```

---

## Worked example — test case 1 (Mr. Ronald Beauchamp, score 7.5)

Inputs from `TEST_CASES.md` Test case 1:

| variable | value |
|---|---|
| `%age_years` | `58` |
| `%RDW` | `13.4` |
| `%MCV` | `92` |
| `%single_DNMT3A` | `true` |
| `%high_risk_mutation` | `false` |
| `%n_mutations` | `1` |
| `%max_VAF` | `0.08` |
| `%cytopenia_status` | `'CHIP'` |

Per-feature points:

| feature | expression | value |
|---|---|---|
| `points_single_DNMT3A` | `iif(true, 0.5, 1.0)` | `0.5` |
| `points_high_risk_mutation` | `iif(false, 2.5, 1.0)` | `1.0` |
| `points_n_mutations` | `iif(1 >= 2, 2.0, 1.0)` | `1.0` |
| `points_max_VAF` | `iif(0.08 > 0.2, 2.0, 1.0)` | `1.0` |
| `points_RDW` | `iif(13.4 >= 15, 2.5, 1.0)` | `1.0` |
| `points_MCV` | `iif(92 > 100, 2.5, 1.0)` | `1.0` |
| `points_cytopenia_status` | `iif('CHIP' = 'CCUS', 1.5, 1.0)` | `1.0` |
| `points_age` | `iif(58 >= 65, 1.5, 1.0)` | `1.0` |

Sum: `0.5 + 1.0 + 1.0 + 1.0 + 1.0 + 1.0 + 1.0 + 1.0 = 7.5` (theoretical minimum).

Evaluating `CHRS_category`: `iif(7.5 >= 12.5, 'high', iif(7.5 >= 10, 'intermediate', 'low')) = 'low'`.

Evaluating `risk_10y_progression_MN`: `iif('low' = 'high', 52.2, iif('low' = 'intermediate', 7.83, 0.67)) = 0.67`.

Matches expected output: `CHRS_score = 7.5`, `CHRS_category = low`, 10-year MN risk **0.67 %**.

---

## Notes

### Threshold conventions (verbatim from SPEC §2)

- Age: `≥ 65` adverse (inclusive).
- RDW: `≥ 15 %` adverse (inclusive).
- MCV: `> 100 fL` adverse (strict — note the asymmetry vs. RDW).
- max_VAF: `> 0.2` adverse (strict — note the asymmetry vs. age and RDW).
- n_mutations: `≥ 2` adverse.

The expressions above match the SPEC's strict-vs-inclusive convention exactly. Do not "round-trip" the cutoffs to the closer-of-two if the input is a borderline real-world value (e.g. RDW = 15.0 % is adverse, MCV = 100 fL is **not** adverse).

### Mutual-exclusion of `single_DNMT3A`

Per SPEC §3.1 the "Single DNMT3A" feature is mutually exclusive with `high_risk_mutation = true` and with `n_mutations ≥ 2`. The form should enforce this with `enableWhen`:

- `single_DNMT3A` is enabled only when `high_risk_mutation = false` **and** `n_mutations = 1`.
- If you want a defensive form expression, AND-gate the `single_DNMT3A` flag in the points expression:

```
points_single_DNMT3A = iif(%single_DNMT3A and %high_risk_mutation.not() and %n_mutations = 1, 0.5, 1.0)
```

### `cytopenia_status` derivation (optional)

If the form captures the underlying CBC + biological sex (instead of asking the clinician to pre-classify CHIP vs CCUS), the derivation in pure FHIRPath is:

```
iif(
  ((%sex = 'male' and %Hb < 13.0) or (%sex = 'female' and %Hb < 12.0))
  or %platelets < 150
  or %ANC < 1.8,
  'CCUS', 'CHIP')
```

Caveat: SPEC §2.2 requires that the cytopenia be **persistent and unexplained, with overt MN excluded by bone marrow** before classifying as CCUS. That precondition cannot be enforced in pure FHIRPath; expose it as a clinician-attested boolean (`cytopenia_persistent_and_unexplained`) and AND-gate the derivation.

### Continuous-probability surface — out of scope

A continuous Cox-regression probability prediction (rather than the three-tier categorical band) requires the per-feature β coefficients and baseline cumulative hazard `h₀(10y)` from the Weeks 2023 Supplementary Appendix (still TBD per SPEC §3.4). If that's needed, FHIRPath's `ln()` / `exp()` / `power()` functions are sufficient in principle (the Cox link function is `1 - exp(-h₀ * exp(β·X))`), but the calculator currently exposes only the categorical output, so a pure-FHIRPath three-tier ladder is sufficient for the standard surface.

### Lookup tables encode cleanly

Both lookups (CHRS score → category, category → 10-year MN risk) are 3-row maps and encode trivially as nested `iif()`. **No CQL library is required.**

### Rounding

- Score is in 0.5 increments by construction; no rounding needed.
- 10-year MN risk percentages are pre-rounded to two decimals (0.67, 7.83, 52.2). Do not re-round.

### Required-conditional inputs (`enableWhen`)

- `single_DNMT3A` enabled only when `high_risk_mutation = false` AND `n_mutations = 1`.
- All other inputs are unconditionally required.
