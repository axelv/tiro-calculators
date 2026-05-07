# Steinhart Model for AHF in Undifferentiated Dyspnea — FHIRPath expressions

> **TWO PATHS, ONE BLOCKED.** The Steinhart 2009 paper publishes (a) a logistic-regression equation (`logit p = β0 + β1·age + β2·pretest + β3·log10(NT-proBNP)`) whose β coefficients are flagged `TBD — see Steinhart 2009 (JACC 54:1515–1521) Online Appendix` in `SPEC.md` §3, and (b) a likelihood-ratio table at NT-proBNP cut-points (LR 0.11 / 3.43 / 12.80) reported in the paper abstract. **Path (a) — the regression — cannot be calculated until β coefficients are pinned**; the FHIRPath equation below uses `<TBD_β…>` placeholders. **Path (b) — the LR-based Bayesian update on the clinician's gestalt — is fully derivable today** and is the recommended primary calculated expression while the regression coefficients remain blocked. Both expressions are encoded below; pick whichever is appropriate for clinical sign-off, or surface both side-by-side.
>
> **Intermediate LRs (300–1,799 pg/mL and 1,800–2,699 pg/mL) are also `TBD — see SPEC §3 LR table`** — the Steinhart 2009 abstract reports only the three bands above. The middle two LRs are needed for the LR ladder to be complete; until they are extracted, the `<TBD_LR_300_1799>` / `<TBD_LR_1800_2699>` placeholders in the LR ladder must be replaced from the JACC paper main table or Online Appendix.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2 #1 `age` | years; integer ≥18 (warn <18, not validated peds) |
| `pretest_probability` | decimal | true | §2 #2 `pretest_probability` | percent, 0–100; clinician's gestalt informed by HF/MI history, orthopnea/PND, loop diuretic use, rales — those individual findings are **not** separate items per SPEC §2 |
| `nt_probnp` | decimal | true | §2 #3 `nt_probnp` | **pmol/L** (MDCalc convention); convert to pg/mL inside the expression with × 8.457 |

Suggested SDC validation:
- `age` → integer, `min = 18`, `max = 110`.
- `pretest_probability` → decimal, `min = 0`, `max = 100`.
- `nt_probnp` → decimal, `min > 0`; flag values < 5 pmol/L (~ <42 pg/mL) as implausibly low (warning, not hard reject — let the clinician override).

Optional helper items (display-only, not feeding the equation — SPEC §2 explicitly notes these are tooltip helpers, *not* inputs): `history_hf`, `history_mi`, `orthopnea_pnd`, `loop_diuretic_use`, `rales`. If exposed, mark them `readOnly = false` but do **not** include them in the calculated expression.

---

## Variables

| name | expression |
|---|---|
| `%age` | `%resource.item.where(linkId='age').answer.value` |
| `%pretest` | `%resource.item.where(linkId='pretest_probability').answer.value` |
| `%pretestProb` | `%pretest / 100` *(proportion 0–1, used by the Bayesian update)* |
| `%pretestOdds` | `%pretestProb / (1 - %pretestProb)` *(prior odds)* |
| `%ntProBnpPmolL` | `%resource.item.where(linkId='nt_probnp').answer.value` |
| `%ntProBnpPgmL` | `%ntProBnpPmolL * 8.457` *(SPEC §2 conversion factor)* |
| `%log10NtProBnp` | `%ntProBnpPgmL.ln() / (10).ln()` *(FHIRPath has `ln()`, not `log10()`; use change-of-base)* |

---

## Calculated expressions

### Primary path — LR-based Bayesian update on the clinician's gestalt (DERIVABLE TODAY for the three published bands; intermediate bands TBD)

The Steinhart 2009 abstract reports three NT-proBNP bands and their AHF likelihood ratios (SPEC §3 LR table). The Bayesian update is:

```
post_odds  = pre_odds × LR
post_prob  = post_odds / (1 + post_odds)
```

#### NT-proBNP → LR ladder

```fhirpath
iif(%ntProBnpPgmL < 300,
    0.11,
iif(%ntProBnpPgmL < 1800,
    <TBD_LR_300_1799>,        // see Steinhart 2009 main Table / Online Appendix
iif(%ntProBnpPgmL < 2700,
    <TBD_LR_1800_2699>,       // see Steinhart 2009 main Table / Online Appendix
iif(%ntProBnpPgmL < 8100,
    3.43,
    12.80))))
```

Bind to a variable for reuse:

```text
extension: variable
name:      lr
expression: <ladder above>
```

#### Posterior probability of AHF

Define as a calculated item, in percent (0–100) to match SPEC §4 output unit:

```fhirpath
( (%pretestOdds * %lr) / (1 + (%pretestOdds * %lr)) ) * 100
```

Final calculated item:

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `probability_ahf_lr` | decimal | % (0–100) | expression above |

#### Risk band (SPEC §4 thresholds)

```fhirpath
iif(%probabilityAhf < 21,
    'Low',
    iif(%probabilityAhf < 80,
        'Intermediate',
        'High'))
```

Where `%probabilityAhf` is `probability_ahf_lr` (or `probability_ahf_regression` once coefficients land). Bind via a `variable` extension on the parent item.

### Secondary path — full logistic regression (BLOCKED on β coefficients)

The published model from SPEC §3:

```
logit(p_AHF) = β0 + β1·age + β2·pretest_probability + β3·log10(NT-proBNP_pgmL)
p_AHF        = 1 / (1 + exp(-logit))
```

In FHIRPath:

```fhirpath
1 / (1 +
    (-1 *
      ( <TBD_β0>
      + <TBD_β_age>     * %age
      + <TBD_β_pretest> * %pretest          // see SPEC §3 open item: percent? proportion? ordinal indicator?
      + <TBD_β_log10NTproBNP_pgmL> * %log10NtProBnp
      )
    ).exp()
) * 100
```

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `probability_ahf_regression` | decimal | % (0–100) | expression above (TBD coefficients) |

> Three SPEC §5 open items must be resolved before this expression is reliable: (1) exact β values, (2) the unit assumed for NT-proBNP (pg/mL vs pmol/L), (3) whether `pretest_probability` enters as percent (0–100), proportion (0–1), or ordinal low/intermediate/high indicators. Adjust `%pretest` (multiply by 0.01 for proportion; bucketise for ordinal) based on the answer.

### Recommended composition

While the regression coefficients are TBD, ship **`probability_ahf_lr` as the displayed `probability_ahf`** and flag the regression item as `readOnly = true; hidden = true` (or omit) until coefficients are pinned. Once both are available, surface both with a "method" tag for transparency.

---

## Worked example — test case 1 (Sara Janssens)

Per `TEST_CASES.md` test case 1 — pneumonia presentation, low gestalt, low NT-proBNP. Inputs:

| variable | value |
|---|---|
| `%age` | 42 |
| `%pretest` | 10 (%) |
| `%pretestProb` | 0.10 |
| `%pretestOdds` | 0.10 / 0.90 = 0.1111 |
| `%ntProBnpPmolL` | 18 |
| `%ntProBnpPgmL` | 18 × 8.457 = **152.2 pg/mL** |
| `%log10NtProBnp` | log₁₀(152.2) = ln(152.2)/ln(10) ≈ 5.025/2.303 ≈ **2.182** |

LR ladder: 152.2 < 300 → **LR = 0.11**.

Posterior odds = 0.1111 × 0.11 = **0.01222**.
Posterior probability = 0.01222 / (1 + 0.01222) = **0.01208 = 1.21 %**.

Risk band: `1.21 < 21` → **'Low'**.

Test case expected output: `probability_ahf ≈ 3 %` (range 1–6 %). Computed value (1.21 %) falls inside the expected band and inside the test-case plausibility window. The LR-only update under-estimates relative to the test-case point estimate (3 %) — once the regression coefficients are pinned and the regression path is also evaluated, the higher-power 4-predictor model is expected to produce something closer to the test-case midpoint. The `'Low'` band classification matches the test-case primary verifiable output exactly.

---

## Notes

- **`log10` in FHIRPath**: FHIRPath has `ln()` and `exp()` but no native `log10()`. Use the change-of-base identity `log10(x) = ln(x) / ln(10)`. The constant `ln(10) ≈ 2.302585093` may be hard-coded as `2.302585093` if the rendering engine objects to `(10).ln()` (some engines treat that as decimal-method invocation); the change-of-base form is more portable.
- **Unit conversion is in-line**: SPEC §2 specifies pmol/L input, SPEC §3 says the regression uses log₁₀(pg/mL). Apply the × 8.457 factor inside the FHIRPath expression — do **not** ask the clinician to pre-convert.
- **Two paths, transparent UI**: The LR Bayesian update is sufficient for the three reported bands and is robust to the regression-β uncertainty. Until SPEC §3 TBD items are resolved, ship the LR path as the canonical answer and document the choice explicitly in the rendered help text.
- **No CQL needed**: Both the LR ladder (nested `iif`) and the logistic regression (arithmetic + `exp()`) are pure FHIRPath. The Bayesian-update form (`pre_odds × LR / (1 + pre_odds × LR)`) is also expressible in pure FHIRPath. **Do not escalate to CQL.**
- **Pediatric guard**: SPEC §2 says ≥18 only. Add a FHIRPath `enableWhen` or input-validation rule rejecting `%age < 18`, or surface a warning.
- **Implausibly low NT-proBNP**: SPEC §2 says flag values < 5 pmol/L. Add a `validation` extension or a soft warning item; do not silently accept.
- **Validate before release**: SPEC §5 open items include validating against MDCalc fixtures (e.g., 70 y, 50 % gestalt, NT-proBNP 1,000 pmol/L). Once coefficients are pinned, regenerate this worked example with the regression path and confirm it matches the LR path within the expected reclassification envelope.
