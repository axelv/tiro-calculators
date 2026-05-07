# IMWG 2016 Multiple Myeloma Response Criteria — FHIRPath expressions

> Encodes the SPEC §3.3 deepest-first decision tree as nested `iif`. Unlike
> the additive scores in this calculator family, IMWG response is a
> **categorical decision tree** — the expression is one large nested `iif`
> evaluated in **descending order of response depth** (Sustained MRD-negative
> → Imaging+ MRD-negative → Flow MRD-negative → Sequencing MRD-negative →
> sCR → CR → VGPR → PR → MR → SD → PD).
>
> **Precedence order is load-bearing.** The first matching branch wins; lower
> branches must not be reached if a deeper branch already matches. SPEC §3
> requires this evaluation order verbatim.

---

## Item linkIds (QuestionnaireResponse contract)

### Serum / urine paraprotein (SPEC §2.1)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `serum_m_baseline_g_dL` | decimal | yes | §2.1 Serum M baseline | g/dL |
| `serum_m_current_g_dL` | decimal | yes | §2.1 Serum M current | g/dL; `0` or empty if not measurable on SPEP. |
| `serum_m_nadir_g_dL` | decimal | conditional (PD) | §3.2 PD definition | Lowest (best) prior value; required for PD evaluation. |
| `urine_m_baseline_mg_24h` | decimal | yes | §2.1 Urine M baseline | mg/24h |
| `urine_m_current_mg_24h` | decimal | yes | §2.1 Urine M current | mg/24h |
| `urine_m_nadir_mg_24h` | decimal | conditional (PD) | §3.2 PD definition | mg/24h |
| `serum_ife` | choice | yes | §2.1 Serum IFE | `negative` \| `positive` |
| `urine_ife` | choice | yes | §2.1 Urine IFE | `negative` \| `positive` |

### Serum free light chains (SPEC §2.2)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `flc_ratio` | decimal | conditional (sCR / FLC-only) | §2.2 κ/λ ratio | Normal 0.26–1.65. |
| `dflc_baseline_mg_L` | decimal | conditional (FLC-only) | §2.2 dFLC baseline | involved − uninvolved |
| `dflc_current_mg_L` | decimal | conditional (FLC-only) | §2.2 dFLC current | mg/L |
| `dflc_nadir_mg_L` | decimal | conditional (PD, FLC-only) | §3.2 PD definition | mg/L |

### Bone marrow (SPEC §2.3)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `bmpc_baseline_pct` | decimal | conditional | §2.3 BMPC baseline | Required if non-secretory or for PR fallback (baseline ≥30 % required for PR). |
| `bmpc_current_pct` | decimal | yes | §2.3 BMPC current | % |
| `bmpc_nadir_pct` | decimal | conditional (PD, marrow-only) | §3.2 PD definition | % |
| `bm_clonality` | choice | conditional (sCR) | §2.3 Clonality | `clonal` \| `polyclonal` |

### Plasmacytomas (SPEC §2.4)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `plasmacytoma_baseline_present` | boolean | yes | §2.4 | yes/no |
| `plasmacytoma_spd_baseline_cm2` | decimal | conditional | §2.4 | cm² |
| `plasmacytoma_spd_current_cm2` | decimal | conditional | §2.4 | cm² |
| `plasmacytoma_new_or_enlarged` | boolean | yes | §2.4 | true if definite increase / new lesions |

### MRD (SPEC §2.5)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `mrd_ngf_negative` | boolean | conditional | §2.5 NGF | EuroFlow-NGF ≥10⁻⁵ |
| `mrd_ngs_negative` | boolean | conditional | §2.5 NGS | LymphoSIGHT ≥10⁻⁵ |
| `mrd_imaging_negative` | boolean | conditional | §2.5 Imaging | PET resolution / SUV criteria |
| `mrd_sustained_ge_1y` | boolean | conditional | §3.1 Sustained | Two MRD-neg ≥1 yr apart, no intervening positive. |

### Hypercalcemia / clinical relapse (SPEC §2.6)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `corrected_calcium_mg_dL` | decimal | conditional (PD) | §2.6 | Threshold > 11.5 |

### Confirmation flag

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `confirmed_two_consecutive` | boolean | yes | §3.4 | All response categories require confirmation on 2 consecutive assessments. |

### Computed output

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `category` | choice | computed | §4 | One of `Sustained MRD-negative`, `Imaging plus MRD-negative`, `Flow MRD-negative`, `Sequencing MRD-negative`, `sCR`, `CR`, `VGPR`, `PR`, `MR`, `SD`, `PD`. |

---

## Variables

Define one variable per criterion predicate. Each evaluates to a boolean.

### Helpers

| name | expression |
|---|---|
| `sM0` | `%resource.repeat(item).where(linkId='serum_m_baseline_g_dL').answer.valueDecimal.first()` |
| `sM1` | `%resource.repeat(item).where(linkId='serum_m_current_g_dL').answer.valueDecimal.first()` |
| `sMnadir` | `%resource.repeat(item).where(linkId='serum_m_nadir_g_dL').answer.valueDecimal.first()` |
| `uM0` | `%resource.repeat(item).where(linkId='urine_m_baseline_mg_24h').answer.valueDecimal.first()` |
| `uM1` | `%resource.repeat(item).where(linkId='urine_m_current_mg_24h').answer.valueDecimal.first()` |
| `uMnadir` | `%resource.repeat(item).where(linkId='urine_m_nadir_mg_24h').answer.valueDecimal.first()` |
| `sIFE` | `%resource.repeat(item).where(linkId='serum_ife').answer.valueCoding.code.first()` |
| `uIFE` | `%resource.repeat(item).where(linkId='urine_ife').answer.valueCoding.code.first()` |
| `flcRatio` | `%resource.repeat(item).where(linkId='flc_ratio').answer.valueDecimal.first()` |
| `dFLC0` | `%resource.repeat(item).where(linkId='dflc_baseline_mg_L').answer.valueDecimal.first()` |
| `dFLC1` | `%resource.repeat(item).where(linkId='dflc_current_mg_L').answer.valueDecimal.first()` |
| `dFLCnadir` | `%resource.repeat(item).where(linkId='dflc_nadir_mg_L').answer.valueDecimal.first()` |
| `bmpc0` | `%resource.repeat(item).where(linkId='bmpc_baseline_pct').answer.valueDecimal.first()` |
| `bmpc1` | `%resource.repeat(item).where(linkId='bmpc_current_pct').answer.valueDecimal.first()` |
| `bmpcNadir` | `%resource.repeat(item).where(linkId='bmpc_nadir_pct').answer.valueDecimal.first()` |
| `bmClonal` | `%resource.repeat(item).where(linkId='bm_clonality').answer.valueCoding.code.first() = 'clonal'` |
| `plasm0` | `%resource.repeat(item).where(linkId='plasmacytoma_baseline_present').answer.valueBoolean.first()` |
| `plasmSPD0` | `%resource.repeat(item).where(linkId='plasmacytoma_spd_baseline_cm2').answer.valueDecimal.first()` |
| `plasmSPD1` | `%resource.repeat(item).where(linkId='plasmacytoma_spd_current_cm2').answer.valueDecimal.first()` |
| `plasmNewOrEnlarged` | `%resource.repeat(item).where(linkId='plasmacytoma_new_or_enlarged').answer.valueBoolean.first()` |
| `ngfNeg` | `%resource.repeat(item).where(linkId='mrd_ngf_negative').answer.valueBoolean.first()` |
| `ngsNeg` | `%resource.repeat(item).where(linkId='mrd_ngs_negative').answer.valueBoolean.first()` |
| `imgNeg` | `%resource.repeat(item).where(linkId='mrd_imaging_negative').answer.valueBoolean.first()` |
| `sustainedMRD` | `%resource.repeat(item).where(linkId='mrd_sustained_ge_1y').answer.valueBoolean.first()` |
| `caCorr` | `%resource.repeat(item).where(linkId='corrected_calcium_mg_dL').answer.valueDecimal.first()` |

### Plasmacytoma resolution / response

| name | expression |
|---|---|
| `plasmResolved` | `%plasm0.not() or (%plasmSPD1 = 0)` |
| `plasmReducedGE50` | `%plasm0.not() or (%plasmSPD0 > 0 and (%plasmSPD0 - %plasmSPD1) / %plasmSPD0 >= 0.5)` |

### CR predicate (SPEC §3.2)

| name | expression |
|---|---|
| `isCR` | `%sIFE = 'negative' and %uIFE = 'negative' and %plasmResolved and %bmpc1 < 5` |

### sCR predicate

| name | expression |
|---|---|
| `isSCR` | `%isCR and %flcRatio >= 0.26 and %flcRatio <= 1.65 and %bmClonal.not()` |

### MRD-negative predicates (require CR)

| name | expression |
|---|---|
| `isFlowMRDneg` | `%isCR and %ngfNeg` |
| `isSeqMRDneg` | `%isCR and %ngsNeg` |
| `isImgMRDneg` | `%isCR and (%ngfNeg or %ngsNeg) and %imgNeg` |
| `isSustainedMRDneg` | `%isCR and (%ngfNeg or %ngsNeg) and %sustainedMRD` |

### VGPR predicate (SPEC §3.2)

`(IFE+ but SPEP-negative)` **OR** `(≥90 % serum-M reduction AND urine-M < 100)`.
Falls back to `≥90 % dFLC reduction` for FLC-only evaluable patients.

| name | expression |
|---|---|
| `serumNotOnSPEP` | `%sM1 = 0 or %sM1.empty()` |
| `vgprByIFE` | `(%sIFE = 'positive' or %uIFE = 'positive') and %serumNotOnSPEP and %uM1 < 100` |
| `vgprBy90Pct` | `%sM0 > 0 and (%sM0 - %sM1) / %sM0 >= 0.9 and %uM1 < 100` |
| `vgprByFLC` | `%dFLC0 > 0 and (%dFLC0 - %dFLC1) / %dFLC0 >= 0.9` |
| `isVGPR` | `%vgprByIFE or %vgprBy90Pct or %vgprByFLC` |

### PR predicate

| name | expression |
|---|---|
| `prBySerumUrine` | `%sM0 > 0 and (%sM0 - %sM1) / %sM0 >= 0.5 and ((%uM0 > 0 and (%uM0 - %uM1) / %uM0 >= 0.9) or %uM1 < 200)` |
| `prByFLC` | `%dFLC0 > 0 and (%dFLC0 - %dFLC1) / %dFLC0 >= 0.5` |
| `prByMarrow` | `%bmpc0 >= 30 and (%bmpc0 - %bmpc1) / %bmpc0 >= 0.5` |
| `prPlasmacytomaOK` | `%plasm0.not() or %plasmReducedGE50` |
| `isPR` | `(%prBySerumUrine or %prByFLC or %prByMarrow) and %prPlasmacytomaOK` |

### MR predicate (relapsed/refractory only)

| name | expression |
|---|---|
| `mrSerum` | `%sM0 > 0 and (%sM0 - %sM1) / %sM0 >= 0.25 and (%sM0 - %sM1) / %sM0 <= 0.49` |
| `mrUrine` | `%uM0 > 0 and (%uM0 - %uM1) / %uM0 >= 0.5 and (%uM0 - %uM1) / %uM0 <= 0.89` |
| `isMR` | `%mrSerum and %mrUrine and (%plasm0.not() or %plasmReducedGE50)` |

### PD predicate (SPEC §3.2 — any one criterion suffices)

| name | expression |
|---|---|
| `pdBySerum` | `%sMnadir > 0 and (%sM1 - %sMnadir) / %sMnadir >= 0.25 and ((%sMnadir < 5 and (%sM1 - %sMnadir) >= 0.5) or (%sMnadir >= 5 and (%sM1 - %sMnadir) >= 1.0))` |
| `pdByUrine` | `%uMnadir.exists() and (%uM1 - %uMnadir) / (%uMnadir + 0.0001) >= 0.25 and (%uM1 - %uMnadir) >= 200` |
| `pdByFLC` | `%dFLCnadir > 0 and (%dFLC1 - %dFLCnadir) / %dFLCnadir >= 0.25 and (%dFLC1 - %dFLCnadir) > 100` |
| `pdByMarrow` | `%bmpcNadir > 0 and (%bmpc1 - %bmpcNadir) / %bmpcNadir >= 0.25 and (%bmpc1 - %bmpcNadir) >= 10` |
| `pdByPlasmacytoma` | `%plasmNewOrEnlarged` |
| `pdByCalcium` | `%caCorr > 11.5` |
| `isPD` | `%pdBySerum or %pdByUrine or %pdByFLC or %pdByMarrow or %pdByPlasmacytoma or %pdByCalcium` |

> Implementation note: PD nadir-relative computations need protection against
> nadir ≈ 0 (e.g. urine nadir < 50 mg/24 h reported as 0). The `+0.0001`
> stabiliser is one approach; a cleaner alternative is to short-circuit on
> the absolute-increase clause first: `(%uM1 - %uMnadir) >= 200` is always a
> meaningful trigger irrespective of relative-change division.

---

## Calculated expressions

### `category` (precedence-ordered nested `iif`)

```fhirpath
iif(%confirmed_two_consecutive.not(), 'Pending confirmation',
  iif(%isSustainedMRDneg, 'Sustained MRD-negative',
    iif(%isImgMRDneg, 'Imaging plus MRD-negative',
      iif(%isFlowMRDneg, 'Flow MRD-negative',
        iif(%isSeqMRDneg, 'Sequencing MRD-negative',
          iif(%isSCR, 'sCR',
            iif(%isCR, 'CR',
              iif(%isVGPR, 'VGPR',
                iif(%isPR, 'PR',
                  iif(%isMR, 'MR',
                    iif(%isPD, 'PD', 'SD')))))))))))
```

> **Precedence order matches SPEC §3.3 verbatim.** The `Sustained MRD-negative
> → Imaging+ → Flow → Sequencing → sCR → CR → VGPR → PR → MR → PD → SD`
> sequence is load-bearing — the first matching branch wins, and a deeper
> branch must short-circuit a shallower one. PD is checked **before** SD
> because SD is the residual "none of the above" category.

> **Confirmation gate.** SPEC §3.4 requires two consecutive assessments
> before any response category is final. The outer `iif` branches to
> `'Pending confirmation'` until the form's confirmation flag is true.

---

## Worked example — test case 3 (sCR)

Inputs (Dr Margarethe Holst, post-ASCT + maintenance):

| linkId | value |
|---|---|
| `serum_ife` | `negative` |
| `urine_ife` | `negative` |
| `bmpc_current_pct` | 1 |
| `bm_clonality` | `polyclonal` |
| `plasmacytoma_baseline_present` | false |
| `flc_ratio` | 0.95 |
| `mrd_ngf_negative` / `_ngs_` / `_imaging_` | false / not performed |
| `confirmed_two_consecutive` | true |

Predicate evaluation:

- `%isCR`: `'negative' = 'negative' and 'negative' = 'negative' and (false.not() or 0=0) = true and 1 < 5 = true` → **true** ✓
- `%isFlowMRDneg = %isCR and false = false`
- `%isSeqMRDneg = false`, `%isImgMRDneg = false`, `%isSustainedMRDneg = false` (NGF/NGS not performed)
- `%isSCR = true and 0.95 in [0.26, 1.65] and clonal = false → true` ✓

Decision tree (top-down):

1. `confirmed = true` → continue
2. `isSustainedMRDneg = false`
3. `isImgMRDneg = false`
4. `isFlowMRDneg = false`
5. `isSeqMRDneg = false`
6. `isSCR = true` → **`category = 'sCR'`** ✓

Matches `TEST_CASES.md` §3.

### Cross-check on test case 4 (Sustained MRD-negative)

Inputs include NGF MRD negative at two timepoints 14 months apart, PET
resolution, and CR criteria met.

- `%isCR = true`, `%ngfNeg = true`, `%imgNeg = true`, `%sustainedMRD = true`
- `%isSustainedMRDneg = isCR and (ngfNeg or ngsNeg) and sustainedMRD = true`
- First matching branch in the nested `iif` is `Sustained MRD-negative` ✓

This confirms the precedence — the same patient also satisfies `isImgMRDneg`
and `isFlowMRDneg`, but those branches are never reached because `Sustained
MRD-negative` is checked first (per SPEC §3.3 and §4 hierarchy).

---

## Notes

- **Precedence is load-bearing.** SPEC §3 explicitly evaluates "from deepest
  to shallowest"; the nested `iif` ladder mirrors that order. Reordering
  branches would silently produce incorrect categories for patients who
  satisfy multiple depths.
- **MRD-negative requires CR** (SPEC §3.4): every MRD predicate is gated by
  `%isCR`. A patient with NGF-negative marrow but residual IFE positivity is
  **not** MRD-negative — they're VGPR (or shallower).
- **Confirmation** (SPEC §3.4): the two-assessment requirement is encoded as
  the outer `confirmed_two_consecutive` gate. Until confirmed, the category
  is `Pending confirmation`. An alternative is to defer the calculation
  entirely until the second assessment — depends on UX preference.
- **Non-secretory / FLC-only / marrow-only fallbacks** (SPEC §3.4) are
  handled inside `vgprByFLC`, `prByFLC`, `prByMarrow`, `pdByFLC`, `pdByMarrow`
  via the `dFLC0 > 0` / `bmpc0 >= 30` guards. Empty / missing values short-circuit
  to false, leaving the secretory paths in charge.
- **PD nadir division by ~zero**: the `+0.0001` stabiliser on `pdByUrine` is
  pragmatic; it does not affect outcomes when the absolute-increase clause
  (`>= 200 mg/24 h`) is the dominant criterion. Engines with strict numeric
  semantics may prefer `iif(%uMnadir > 0, …, %uM1 >= 200)` instead.
- **MR is relapsed/refractory only** (SPEC §3.2). If your form is for
  newly-diagnosed evaluation, drop the `iif(%isMR, …)` branch — newly-diagnosed
  patients with 25–49 % reduction are SD per the original criteria.
- **No TBD coefficients.** All thresholds are categorical/percentage
  cut-offs taken verbatim from Kumar 2016 Lancet Oncol §3.2 of the SPEC.
- **No CQL escalation needed** for the response logic itself. CQL would
  only help if the form needs to compute the **best response** (nadir)
  across a longitudinal series — that's an aggregation problem better solved
  upstream (e.g. a CQL `Maximum`/`Minimum` over an Observation series).
