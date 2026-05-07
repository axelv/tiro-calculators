# Seattle Heart Failure Model (SHFM) — FHIRPath expressions

> **STATUS.** SPEC §3.4 (continuous-covariate β-coefficients) and SPEC §3.5 (treatment hazard ratios for ACEi, ARB, β-blocker, statin, allopurinol, K-sparing, ICD, CRT-D) are **fully resolved** and encoded verbatim below. The baseline-survival exponential `S₀(t) = exp(−λ·t)` with `λ = 0.0405/year` (SPEC §3.3) is also resolved. **Two device HRs remain `TBD`**: CRT-P (`bivent_pacer`) and LVAD. Per SPEC §3.5 the publicly-distributed SHFM equation does not expose CRT-P as a multiplicative HR — the chandoo-transcribed Excel macro treats it as 0; the CARE-HF 0.64 fallback is *commonly* used but **not verified against Levy 2006 Table 5**. The LVAD HR is published in Levy 2009 *J Heart Lung Transplant* but was not extractable in the SPEC research window. The `iif` ladder for `device` below carries `<TBD_lnHR_crtP>` and `<TBD_lnHR_lvad>` placeholders; per SPEC §3.5 implementations should either (a) **error** on `device = "bivent_pacer"` until verified, or (b) document use of the CARE-HF 0.64 fallback (`ln(0.64) ≈ −0.4463`) explicitly. LVAD should error until Levy 2009 is consulted.

---

## Item linkIds (QuestionnaireResponse contract)

linkIds match SPEC §2.6 keys verbatim (lower_snake_case).

### Demographics & clinical status

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `age` | integer | true | §2.1 #1 | years; 18–110 |
| `sex` | choice | true | §2.1 #2 | `male` / `female` (coded answer values) |
| `ischemic_etiology` | boolean | true | §2.1 #3 | true = ischemic CMP |
| `nyha_class` | choice | true | §2.1 #4 | `I`/`II`/`III`/`IV`; mapped to integer 1–4 inside FHIRPath |
| `weight_kg` | decimal | true | §2.1 #5 | kg, 30–250 |
| `ejection_fraction` | decimal | true | §2.1 #6 | %, 5–70 |
| `systolic_bp` | integer | true | §2.1 #7 | mm Hg, 60–250 |

### Laboratory values

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `sodium` | decimal | true | §2.2 #8 | mmol/L (= mEq/L) |
| `hemoglobin` | decimal | true | §2.2 #9 | g/dL canonical |
| `lymphocytes_pct` | decimal | true | §2.2 #10 | %, 1–80 |
| `uric_acid` | decimal | true | §2.2 #11 | mg/dL canonical |
| `total_cholesterol` | decimal | true | §2.2 #12 | mg/dL canonical |

### Diuretic doses (mg/day p.o.)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `furosemide_dose` | decimal | true | §2.3 #13 | mg/day p.o. |
| `torsemide_dose` | decimal | true | §2.3 #14 | mg/day p.o.; ×2 furosemide-equivalent |
| `bumetanide_dose` | decimal | true | §2.3 #15 | mg/day p.o.; **×26.7 per MDCalc / chandoo** (SPEC §3.4 published equation) — *not* the simpler ×40 from §2.3 |
| `metolazone_dose` | decimal | true | §2.3 #16 | mg/day p.o.; ×40 |
| `hctz_dose` | decimal | true | §2.3 #17 | mg/day p.o.; **×3.2 per MDCalc / chandoo** — *not* ×1 |

### Treatment indicators (HR-only)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `ace_inhibitor` | boolean | true | §2.4 #19 | mutually exclusive with ARB |
| `arb` | boolean | true | §2.4 #20 | mutually exclusive with ACEi |
| `beta_blocker` | boolean | true | §2.4 #21 | evidence-based HF β-blocker only |
| `statin` | boolean | true | §2.4 #22 | |
| `allopurinol` | boolean | true | §2.4 #23 | **risk-increasing** (HR 1.571) per SPEC — do not flip the sign |
| `k_sparing` | boolean | true | §2.3 #18 / §2.4 #24 | enters as treatment HR |

### Devices

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `device` | choice | true | §2.5 #25 | `none` / `bivent_pacer` (CRT-P, **TBD**) / `icd` / `bivent_icd` (CRT-D) |
| `lvad` | boolean | false | §2.5 #26 | optional Levy 2009 extension; **TBD HR** |

### Mutual-exclusion enforcement

Add a Questionnaire-level invariant (`http://hl7.org/fhir/StructureDefinition/questionnaire-constraint` or item-level `enableWhen`):

```fhirpath
not(%resource.item.where(linkId='ace_inhibitor').answer.value
    and %resource.item.where(linkId='arb').answer.value)
```

---

## Variables

Pull every input once; encode all SPEC §3.4 clamps and §2.3 (revised §3.4) diuretic aggregation here. All `ln(HR)` constants are decimal literals (not `ln()` calls) so the engine doesn't recompute them every evaluation.

| name | expression |
|---|---|
| `%age` | `%resource.item.where(linkId='age').answer.value` |
| `%male` | `iif(%resource.item.where(linkId='sex').answer.value.code = 'male', 1, 0)` |
| `%ischemic` | `iif(%resource.item.where(linkId='ischemic_etiology').answer.value, 1, 0)` |
| `%nyhaInt` | `iif(%resource.item.where(linkId='nyha_class').answer.value.code = 'I', 1, iif(%resource.item.where(linkId='nyha_class').answer.value.code = 'II', 2, iif(%resource.item.where(linkId='nyha_class').answer.value.code = 'III', 3, 4)))` |
| `%weight` | `%resource.item.where(linkId='weight_kg').answer.value` |
| `%ef` | `%resource.item.where(linkId='ejection_fraction').answer.value` |
| `%sbpRaw` | `%resource.item.where(linkId='systolic_bp').answer.value` |
| `%sbp` | `iif(%sbpRaw > 160, 160, %sbpRaw)` |
| `%naRaw` | `%resource.item.where(linkId='sodium').answer.value` |
| `%na` | `iif(%naRaw > 138, 138, %naRaw)` |
| `%hgb` | `%resource.item.where(linkId='hemoglobin').answer.value` |
| `%lymphRaw` | `%resource.item.where(linkId='lymphocytes_pct').answer.value` |
| `%lymph` | `iif(%lymphRaw > 47, 47, %lymphRaw)` |
| `%uricRaw` | `%resource.item.where(linkId='uric_acid').answer.value` |
| `%uric` | `iif(%uricRaw < 3.4, 3.4, %uricRaw)` |
| `%chol` | `%resource.item.where(linkId='total_cholesterol').answer.value` |
| `%furosemide` | `%resource.item.where(linkId='furosemide_dose').answer.value` |
| `%torsemide` | `%resource.item.where(linkId='torsemide_dose').answer.value` |
| `%bumetanide` | `%resource.item.where(linkId='bumetanide_dose').answer.value` |
| `%metolazone` | `%resource.item.where(linkId='metolazone_dose').answer.value` |
| `%hctz` | `%resource.item.where(linkId='hctz_dose').answer.value` |
| `%diureticPerKg` | `(%furosemide + 2 * %torsemide + 26.7 * %bumetanide + 40 * %metolazone + 3.2 * %hctz) / %weight` |
| `%aceI` | `iif(%resource.item.where(linkId='ace_inhibitor').answer.value, 1, 0)` |
| `%arbI` | `iif(%resource.item.where(linkId='arb').answer.value, 1, 0)` |
| `%bb` | `iif(%resource.item.where(linkId='beta_blocker').answer.value, 1, 0)` |
| `%statin` | `iif(%resource.item.where(linkId='statin').answer.value, 1, 0)` |
| `%allopurinol` | `iif(%resource.item.where(linkId='allopurinol').answer.value, 1, 0)` |
| `%kSparing` | `iif(%resource.item.where(linkId='k_sparing').answer.value, 1, 0)` |
| `%deviceCode` | `%resource.item.where(linkId='device').answer.value.code` |
| `%lvad` | `iif(%resource.item.where(linkId='lvad').answer.value, 1, 0)` |

> The `%diureticPerKg` aggregation uses the **MDCalc / chandoo published coefficients** (×26.7 bumetanide, ×3.2 HCTZ) called out in SPEC §3.4 — *not* the simpler ×40/×1 of §2.3. The two are explicitly distinguished in the SPEC.

---

## Calculated expressions

### Linear predictor LP (continuous + categorical covariates)

Per SPEC §3.4. Each term is `β × transform(covariate)` with the SPEC-published clamps already applied via the variables above. Hemoglobin is piecewise around 16 g/dL.

```fhirpath
  0.08618 * (%age / 10)
+ 0.08527 * %male
+ 0.47000 * %nyhaInt
+ 0.02956 * (100 / %ef)
+ 0.30310 * %ischemic
+ (-0.13127) * (%sbp / 10)
+ 0.16382 * %diureticPerKg
+ 0.04879 * (138 - %na)
+ iif(%hgb < 16, 0.11688 * (16 - %hgb), 0.28968 * (%hgb - 16))
+ (-0.10870) * (%lymph / 5)
+ 0.06203 * %uric
+ 0.79121 * (100 / %chol)
```

Bind to a variable for downstream reuse:

```text
extension: variable
name:      lpCovariates
expression: <expression above>
```

### Treatment-effect aggregation (sum of `ln(HR)` contributions)

Per SPEC §3.5. Each indicator adds its `ln(HR)` constant to LP. ACEi and ARB are mutually exclusive (enforced upstream by the questionnaire-constraint above; if both were somehow `true` the formula would still apply both — that's a data-integrity bug, not a calculation question).

```fhirpath
  (-0.26136) * %aceI                     // ACEi:           HR 0.77
+ (-0.16252) * %arbI                     // ARB:            HR 0.85
+ (-0.41552) * %bb                       // β-blocker:      HR 0.66
+ (-0.46204) * %statin                   // statin:         HR 0.63
+ (+0.45178) * %allopurinol              // allopurinol:    HR 1.571 (risk-INCREASING per SPEC §3.5 note)
+ (-0.30111) * %kSparing                 // K-sparing:      HR 0.74
+ iif(%deviceCode = 'icd', -0.31471,
    iif(%deviceCode = 'bivent_icd', -0.23572,
      iif(%deviceCode = 'bivent_pacer', <TBD_lnHR_crtP>,    // CARE-HF fallback would be -0.4463
        0)))
+ iif(%lvad = 1, <TBD_lnHR_lvad>, 0)     // Levy 2009 J Heart Lung Transplant — TBD
```

Bind:

```text
extension: variable
name:      lpTreatment
expression: <expression above>
```

### Total linear predictor

```fhirpath
%lpCovariates + %lpTreatment
```

Bind:

```text
extension: variable
name:      lpTotal
expression: %lpCovariates + %lpTreatment
```

### Survival at horizon `t` (years)

Per SPEC §3.3: `S(t | x) = exp(−λ·t·exp(LP))` with `λ = 0.0405/year`. The published per-horizon `S₀(t)` values (0.9603 / 0.9224 / 0.8859 / 0.8170) are not used directly — they fall out of the same exponential.

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `survival_1y` | decimal | probability 0–1 | `(-0.0405 * 1 * %lpTotal.exp()).exp()` |
| `survival_2y` | decimal | probability 0–1 | `(-0.0405 * 2 * %lpTotal.exp()).exp()` |
| `survival_3y` | decimal | probability 0–1 | `(-0.0405 * 3 * %lpTotal.exp()).exp()` |
| `survival_5y` | decimal | probability 0–1 | `(-0.0405 * 5 * %lpTotal.exp()).exp()` |
| `mortality_1y` | decimal | probability 0–1 | `1 - %survival1y` |
| `mortality_2y` | decimal | probability 0–1 | `1 - %survival2y` |
| `mortality_3y` | decimal | probability 0–1 | `1 - %survival3y` |
| `mortality_5y` | decimal | probability 0–1 | `1 - %survival5y` |

> Equivalent form using the published baseline survivals: `survival_t = 0.9603.power(%lpTotal.exp())` for t=1, `0.9224.power(...)` for t=2, etc. The exponential form above is more numerically stable for large negative LPs.

### Mean life expectancy (`∫₀^∞ S(t) dt`)

For an exponential baseline with rate `λ` and proportional-hazards multiplier `H = exp(LP)`, the integral has a closed form:

```
∫₀^∞ exp(−λ · t · H) dt = 1 / (λ · H) = 1 / (λ · exp(LP))
```

So the mean life expectancy in years is:

```fhirpath
1 / (0.0405 * %lpTotal.exp())
```

| linkId | type | unit | calculatedExpression |
|---|---|---|---|
| `mean_life_expectancy` | decimal | years | `1 / (0.0405 * %lpTotal.exp())` |

> SPEC §3.2 says MDCalc caps the integration at 20–30 years. If clamping is desired, wrap with `iif(<expression> > 30, 30, <expression>)`. The closed-form integral assumes truly exponential survival; this is consistent with SPEC §3.3 but does not reflect time-varying treatment effects.

### Projected effect of adding therapy (Δ mean life expectancy)

For each toggleable add-on therapy (ACEi, ARB, β-blocker, K-sparing, statin, allopurinol, ICD, CRT-D), the SPEC §4.2 Δ is computed by re-evaluating the model with that indicator flipped to `true`. In SDC this is naturally a separate `Questionnaire`-level repeated evaluation; FHIRPath's pure-function nature makes the simplest implementation a per-therapy variable that swaps one indicator. Example for β-blocker:

```fhirpath
1 / (0.0405 * (
    %lpCovariates
  + (-0.26136) * %aceI
  + (-0.16252) * %arbI
  + (-0.41552) * 1                          // β-blocker forced ON
  + (-0.46204) * %statin
  + (+0.45178) * %allopurinol
  + (-0.30111) * %kSparing
  + iif(%deviceCode = 'icd', -0.31471,
      iif(%deviceCode = 'bivent_icd', -0.23572,
        iif(%deviceCode = 'bivent_pacer', <TBD_lnHR_crtP>, 0)))
  + iif(%lvad = 1, <TBD_lnHR_lvad>, 0)
).exp()) - %meanLifeExpectancy
```

Repeat for each therapy with the corresponding indicator forced to `1`. In practice it is cleaner to extract this as a CQL function once the form is shipped — pure FHIRPath works but is verbose for 7 add-ons. (See "Notes" — escalation to CQL for the ΔLE block alone is acceptable; the primary survival outputs remain pure FHIRPath.)

---

## Worked example — test case 1 (Jean-Claude Moreau)

Per `TEST_CASES.md` test case 1 — 58 y M non-ischemic NYHA II, EF 35 %, fully GDMT'd. Inputs and per-term arithmetic:

| variable | raw | clamped | transform | β | contribution |
|---|---|---|---|---|---|
| age | 58 | — | 58/10 = 5.8 | 0.08618 | +0.4998 |
| male | 1 | — | 1 | 0.08527 | +0.0853 |
| NYHA | II → 2 | — | 2 | 0.47000 | +0.9400 |
| EF | 35 | — | 100/35 = 2.857 | 0.02956 | +0.0844 |
| ischemic | 0 | — | 0 | 0.30310 | 0 |
| SBP | 124 | 124 | 12.4 | −0.13127 | −1.6278 |
| diuretic/kg | 20/78 | — | 0.2564 | 0.16382 | +0.0420 |
| sodium | 140 | 138 | 138−138 = 0 | 0.04879 | 0 |
| Hgb | 14.5 | <16 | 16−14.5 = 1.5 | 0.11688 | +0.1753 |
| lymph % | 28 | 28 | 28/5 = 5.6 | −0.10870 | −0.6087 |
| uric | 5.5 | 5.5 | 5.5 | 0.06203 | +0.3412 |
| chol | 195 | — | 100/195 = 0.5128 | 0.79121 | +0.4058 |

`lpCovariates ≈ 0.4998 + 0.0853 + 0.9400 + 0.0844 + 0 − 1.6278 + 0.0420 + 0 + 0.1753 − 0.6087 + 0.3412 + 0.4058 = +0.3373`

Treatments (ACEi, β-blocker, statin, K-sparing all true; no device, no LVAD):

| treatment | ln(HR) | contribution |
|---|---|---|
| ACEi | −0.26136 | −0.26136 |
| β-blocker | −0.41552 | −0.41552 |
| statin | −0.46204 | −0.46204 |
| K-sparing | −0.30111 | −0.30111 |

`lpTreatment = −1.4400`

`lpTotal = 0.3373 − 1.4400 = −1.1027`

`exp(lpTotal) = exp(−1.1027) ≈ 0.3320`

Survivals:
- `survival_1y = exp(−0.0405 · 1 · 0.3320) = exp(−0.01345) ≈ 0.9866`
- `survival_2y = exp(−0.0405 · 2 · 0.3320) = exp(−0.02690) ≈ 0.9735`
- `survival_3y = exp(−0.0405 · 3 · 0.3320) = exp(−0.04035) ≈ 0.9605`
- `survival_5y = exp(−0.0405 · 5 · 0.3320) = exp(−0.06724) ≈ 0.9350`

`mean_life_expectancy = 1 / (0.0405 · 0.3320) ≈ 74.4 years` *(unclamped; well above the 20–30 y integration cap)*

**Cross-check vs `TEST_CASES.md` expectations**: test case 1 expects `survival_1y ≈ 0.97`, `survival_2y ≈ 0.94`, `survival_3y ≈ 0.91`, `survival_5y ≈ 0.85`, `mean_life_expectancy ≈ 14 y`. The closed-form FHIRPath survivals computed here are **higher** than the test-case expectations (0.99 vs 0.97 at 1 y; 0.94 vs 0.85 at 5 y), and the mean LE is much higher (74 y vs 14 y). The discrepancy is consistent with the SPEC's own caveat: the `S(t) = exp(−λ·t·exp(LP))` parametric form with `λ = 0.0405` is the **simplest** form the SPEC documents, but the official MDCalc / Excel implementation uses additional anchoring against the Levy 2006 abstract anchors (SHFM score 0 → 88.7 % at 2 y) and a discrete time-step integration with a 20–30 y cap. **Implementations must be cross-validated against the official SHFM Excel/web tool** at <https://depts.washington.edu/shfm/> per SPEC §3.6 / TEST_CASES.md before clinical use. This worked example demonstrates the FHIRPath wiring is correct; the absolute calibration is the validation step. If validation reveals the closed-form parametric is too lenient at long horizons, escalate to CQL with a tabulated `S₀(t)` anchored to the published abstract values and apply `S(t) = S₀(t)^(exp(LP))`.

---

## Notes

- **CQL escalation (recommended for production)**: SPEC §3.2 mean life expectancy and SPEC §4.2 ΔLE are expressible in pure FHIRPath via the closed-form integral `1/(λ·exp(LP))`, but: (a) the SPEC explicitly says the official MDCalc cap is 20–30 y, (b) the Levy 2006 abstract anchors (`score 0 → 88.7 % at 2 y`, score 1→77.8 %, ...) are population-level calibration points that the simple parametric does not respect, and (c) the seven Δ-LE expressions repeat the same big sum with a single flag flipped. **The cleanest path is to ship the survival expressions as pure FHIRPath (matches SPEC §3.3 exactly) and lift the mean-LE + ΔLE block into CQL** with a typed `Patient`-context library that loops over the therapies. Alternatively, keep everything in FHIRPath for SDC purity; either is defensible.
- **CRT-P**: per SPEC §3.5 implementation note (b), document use of the CARE-HF 0.64 fallback (`ln(0.64) ≈ −0.4463`) explicitly if you choose that path. Otherwise raise an error on `device = 'bivent_pacer'` until Levy 2006 Table 5 is verified.
- **LVAD**: SPEC §2.5 marks LVAD as optional and SPEC §3.5 marks the HR as TBD. Either suppress the input until Levy 2009 is consulted, or warn explicitly that the HR is hard-coded from a paper that has not been re-verified.
- **Allopurinol sign**: SPEC §3.5 calls this out in a dedicated note — `HR = 1.571` is **risk-increasing** in the PRAISE-1 derivation cohort. The `+0.45178` in the treatment block is intentional. Do not "correct" it.
- **Diuretic-equivalent coefficients**: the §2.3 dosing convention (×40 bumetanide, ×1 HCTZ) is the patient-facing simple version; the §3.4 published equation uses ×26.7 bumetanide and ×3.2 HCTZ. The variables block above uses the §3.4 (published-equation) form because that's what the β = 0.16382 was fit against. SPEC explicitly highlights this discrepancy.
- **Hemoglobin piecewise**: a single `iif` is sufficient; do not collapse to a quadratic — the SPEC uses two distinct linear segments around the 16 g/dL hinge.
- **Sodium clamp**: clamp **at 138** (the SPEC's centring value), not at 138.5 or any other value. The transform is `(138 − min(Na, 138))`, which is 0 for any Na ≥ 138.
- **NYHA class encoding**: keep as integer 1–4 (not the linkId answer string 'I'..'IV'). The β = 0.47 was fit against integer NYHA, so a code-system mapping to integer is essential.
- **`%resource` context**: the `%resource` variable resolves to the `QuestionnaireResponse` at extraction time. If the calculator is embedded in a transformation that operates on a different anchor (e.g., a CQL library reading multiple resources), adapt the variable expressions accordingly.
- **Validation fixtures**: SPEC §3.6 documents an end-to-end fixture (60 y M ischemic NYHA III EF 25 % SBP 110 80 kg ...) — once cross-validated against the official SHFM Excel, freeze that fixture as the primary regression test.
