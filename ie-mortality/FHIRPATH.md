# IE 6-Month Mortality Risk Score (Park / ICE-PCS) — FHIRPath expressions

> Encodes the 14 typed inputs from SPEC §2, the integer score from §3.1, and
> the published logistic mortality model from §3.2, plus the quintile bands
> from §4.2.
>
> **Coefficients are taken verbatim from Park 2016 JAHA Table 5** (no TBD).
> The published equation prints only the linear predictor; SPEC §3.2 makes
> explicit that the inverse-logit transform is required to obtain a probability
> in [0, 1] — these expressions apply that transform.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age_band` | choice | yes | §2.1 Age | Codes: `<=45` (0), `46-60` (+2), `61-70` (+3), `>70` (+4). |
| `history_of_dialysis` | boolean | yes | §2.1 Dialysis | +3 if true. |
| `nosocomial` | boolean | yes | §2.2 Infection acquisition | +2 if true. |
| `valve_type` | choice | yes | §2.2 Infection type / valve | Codes: `NVE` (0), `PVE` (+1), `device` (+1). |
| `symptoms_gt_1_month` | boolean | yes | §2.2 Symptoms > 1 month | **−1** if true (subacute). |
| `pathogen` | choice | yes | §2.2 Pathogen | Codes: `s_aureus` (+1), `vgs` (−2), `fungal` (0), `other` (0). |
| `aortic_vegetation` | boolean | yes | §2.2 Aortic vegetation | +1 if true. Stacks with mitral. |
| `mitral_vegetation` | boolean | yes | §2.2 Mitral vegetation | +1 if true. Stacks with aortic. |
| `nyha_3_or_4_heart_failure` | boolean | yes | §2.3 NYHA III/IV HF | +3 if true. |
| `stroke` | boolean | yes | §2.3 Stroke | +2 if true. |
| `paravalvular_complication` | boolean | yes | §2.3 Paravalvular | +2 if true. |
| `persistent_bacteremia` | boolean | yes | §2.3 Persistent bacteremia | +2 if true. |
| `surgical_treatment` | boolean | yes | §2.3 Surgery undertaken | **−2** if true (observed survival benefit; not a counterfactual). |
| `score` | integer | computed | §3.1 sum | Typically −3..+22. |
| `probability_6mo_mortality` | decimal | computed | §3.2 logistic | Wrapped in inverse-logit; clamp `[0,1]`. |
| `risk_band` | choice | computed | §4.2 quintiles | `Q1` (0–6) \| `Q2` (7–8) \| `Q3` (9–10) \| `Q4` (11–16) \| `Q5` (17–22) \| `<Q1` (<0) for negative scores. |
| `risk_band_observed_pct` | decimal | computed | §4.2 quintiles | Observed 6-month mortality % per quintile. |

---

## Variables

| name | expression |
|---|---|
| `ageCode` | `%resource.repeat(item).where(linkId='age_band').answer.valueCoding.code.first()` |
| `ageP` | `iif(%ageCode = '<=45', 0, iif(%ageCode = '46-60', 2, iif(%ageCode = '61-70', 3, 4)))` |
| `dialP` | `iif(%resource.repeat(item).where(linkId='history_of_dialysis').answer.valueBoolean.first(), 3, 0)` |
| `nosoP` | `iif(%resource.repeat(item).where(linkId='nosocomial').answer.valueBoolean.first(), 2, 0)` |
| `valveCode` | `%resource.repeat(item).where(linkId='valve_type').answer.valueCoding.code.first()` |
| `valveP` | `iif(%valveCode = 'PVE' or %valveCode = 'device', 1, 0)` |
| `symP` | `iif(%resource.repeat(item).where(linkId='symptoms_gt_1_month').answer.valueBoolean.first(), -1, 0)` |
| `pathCode` | `%resource.repeat(item).where(linkId='pathogen').answer.valueCoding.code.first()` |
| `pathP` | `iif(%pathCode = 's_aureus', 1, iif(%pathCode = 'vgs', -2, 0))` |
| `aoP` | `iif(%resource.repeat(item).where(linkId='aortic_vegetation').answer.valueBoolean.first(), 1, 0)` |
| `miP` | `iif(%resource.repeat(item).where(linkId='mitral_vegetation').answer.valueBoolean.first(), 1, 0)` |
| `hfP` | `iif(%resource.repeat(item).where(linkId='nyha_3_or_4_heart_failure').answer.valueBoolean.first(), 3, 0)` |
| `strkP` | `iif(%resource.repeat(item).where(linkId='stroke').answer.valueBoolean.first(), 2, 0)` |
| `pvP` | `iif(%resource.repeat(item).where(linkId='paravalvular_complication').answer.valueBoolean.first(), 2, 0)` |
| `bactP` | `iif(%resource.repeat(item).where(linkId='persistent_bacteremia').answer.valueBoolean.first(), 2, 0)` |
| `surgP` | `iif(%resource.repeat(item).where(linkId='surgical_treatment').answer.valueBoolean.first(), -2, 0)` |
| `score` | `%ageP + %dialP + %nosoP + %valveP + %symP + %pathP + %aoP + %miP + %hfP + %strkP + %pvP + %bactP + %surgP` |
| `lp` | `-4.849 + 2.416 * %score + 0.109 * (%score * %score)` |

---

## Calculated expressions

### `score` (integer)

```fhirpath
%score
```

(Equivalently inline the sum; the `%score` variable above is the
canonical implementation.)

### `probability_6mo_mortality` (decimal in [0, 1])

```fhirpath
(1.0 / (1.0 + (-%lp).exp())).min(1.0).max(0.0)
```

> Uses the inverse-logit `1/(1+e^{−lp})`. Clamp defensively per SPEC §3.2.
> Note: in the FHIRPath spec, `Decimal.exp()` and `min/max` are part of the
> [FHIRPath additional functions](https://hl7.org/fhirpath/#math) — confirmed
> available in HAPI/Pathling/Tiro renderers. If your engine lacks `exp`, fall
> back to the equivalent `Math.exp` via `cqf-expression` with
> `language = "text/cql"`.

### `risk_band` (quintile label per §4.2)

```fhirpath
iif(%score < 0, '<Q1',
  iif(%score <= 6, 'Q1 (0-6)',
    iif(%score <= 8, 'Q2 (7-8)',
      iif(%score <= 10, 'Q3 (9-10)',
        iif(%score <= 16, 'Q4 (11-16)', 'Q5 (17-22)')))))
```

### `risk_band_observed_pct` (observed cohort 6-month mortality %)

```fhirpath
iif(%score <= 6, 10.3,
  iif(%score <= 8, 17.0,
    iif(%score <= 10, 25.5,
      iif(%score <= 16, 37.8, 52.9))))
```

> SPEC §4.2 advises reporting the **continuous** logistic prediction as the
> primary calculator output, with the observed quintile rate as contextual
> interpretation. TEST_CASES.md §3–§5 also flag that the logistic equation
> saturates near `p ≈ 1` for mid-to-high integer scores; downstream UIs
> should display **both** the formula output and the quintile-observed rate
> rather than the formula output alone.

---

## Worked example — test case 1 (low risk, VGS NVE, score = −2)

Inputs (Ms Camille Laurent):

| linkId | value |
|---|---|
| `age_band` | `<=45` |
| `history_of_dialysis` | false |
| `nosocomial` | false |
| `valve_type` | `NVE` |
| `symptoms_gt_1_month` | true |
| `pathogen` | `vgs` |
| `aortic_vegetation` | true |
| `mitral_vegetation` | false |
| `nyha_3_or_4_heart_failure` | false |
| `stroke` | false |
| `paravalvular_complication` | false |
| `persistent_bacteremia` | false |
| `surgical_treatment` | false |

Variable evaluation:

- `%ageP = 0`, `%dialP = 0`, `%nosoP = 0`, `%valveP = 0` (NVE)
- `%symP = -1` (subacute)
- `%pathP = -2` (VGS)
- `%aoP = 1`, `%miP = 0`
- `%hfP = 0`, `%strkP = 0`, `%pvP = 0`, `%bactP = 0`, `%surgP = 0`

Calculations:

- `score = 0 + 0 + 0 + 0 + (-1) + (-2) + 1 + 0 + 0 + 0 + 0 + 0 + 0 = -2` ✓
- `lp = -4.849 + 2.416 * (-2) + 0.109 * 4 = -4.849 - 4.832 + 0.436 = -9.245`
- `probability = 1 / (1 + e^{9.245}) ≈ 0.0000965` → ~0.01 % ✓
- `risk_band = iif(-2 < 0, '<Q1', …) = '<Q1'` ✓ (below the published quintile floor)
- `risk_band_observed_pct = iif(-2 <= 6, 10.3, …) = 10.3` (cohort floor)

Matches `TEST_CASES.md` §1.

---

## Notes

- **Coefficients verbatim from Park 2016 JAHA Table 5**: −4.849 intercept,
  2.416 linear, 0.109 quadratic. **No TBD.**
- The logistic equation saturates (`p → 1`) for score ≳ 6 because of the
  +0.109·score² term and the absence of a centring transform — see
  TEST_CASES.md §2 note. This is faithful to the published equation; the
  caveat for clinicians is to surface the **observed quintile rate** alongside
  the formula output.
- Negative scores are possible (VGS + subacute + surgery can sum to < 0).
  The quintile table starts at 0 in §4.2 — the `<Q1` bucket above is a
  defensive label for negative scores; map to the lowest observed rate
  (10.3 %) for `risk_band_observed_pct`.
- Aortic + mitral vegetations stack (+1 + +1 = +2) — handled naturally by
  separate booleans summed independently.
- "Surgery = yes → −2" is an **observed** (not counterfactual) coefficient
  per SPEC §5 caveats; do not present it as "the score will drop by 2 if
  we operate" for an individual patient.
- `exp` is the only non-arithmetic FHIRPath function used — confirmed in
  the FHIRPath additional-functions spec. If your engine doesn't support it,
  use a `cqf-expression` with CQL: `Exp(-lp) / (1 + Exp(-lp))` — but FHIRPath
  alone is sufficient for compliant engines.
- No CQL escalation strictly needed; CQL only as a fallback for engines
  missing `exp()`.
