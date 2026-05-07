# IPSS-M — FHIRPath expressions

A pure-FHIRPath encoding of the **IPSS-M** (Molecular International Prognostic Scoring System) for myelodysplastic syndromes. The score is a continuous linear combination of mean-centred clinical/cytogenetic/molecular features, scaled to a log₂-hazard-ratio scale:

```
IPSSM_score = Σ_i (x_i − mean_i) · β_i / ln 2
```

A score of `0` corresponds to the average MDS patient in the Bernard 2022 NEJM Evidence cohort; each unit corresponds to a doubling of hazard. Six risk bands by hard cutpoints. See SPEC §3 and `papaemmelab/ipssm` (R reference implementation) for the canonical β / mean values.

> **Mean-value source.** The FHIRPath below uses the means **as listed in SPEC §3.2** (`Reference population means` table). `TEST_CASES.md` uses a slightly different means vector taken from a different snapshot of the `papaemmelab/ipssm` settings file (e.g. `NPM1 = 0.0161` vs SPEC `0.0112`; `EZH2 = 0.0809` vs `0.0588`; `DNMT3A = 0.108` vs `0.1610`; `ASXL1 = 0.207` vs `0.2520`; `BLAST5 = 1.094` vs SPEC `0.922`; `Nres2 = 0.39` vs `0.3880`). The discrepancy between SPEC and test cases shifts absolute scores by ~0.05–0.10 log₂-HR units but does not move test-case patients out of their expected risk bands. Implementers must pin the means file to a tagged release of `papaemmelab/ipssm`.

---

## Item linkIds (QuestionnaireResponse contract)

### Clinical / cytogenetic

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `BM_BLAST` | decimal | yes | §2.1 `BM_BLAST` | % nucleated BM cells. Capped at 20 in transform. |
| `HB` | decimal | yes | §2.1 `HB` | g/dL. Capped at 20. |
| `PLT` | decimal | yes | §2.1 `PLT` | ×10⁹/L. Capped at 250. |
| `CYTO_IPSSR` | choice | yes | §2.2 `CYTO_IPSSR` | `Very Good` \| `Good` \| `Intermediate` \| `Poor` \| `Very Poor`. |

### Main-effect gene mutation indicators (16, boolean)

| linkId | type | source | notes |
|---|---|---|---|
| `TP53multi` | boolean | §2.3 | TP53 multi-hit (≥ 2 mut, or single + del(17p) / LOH / VAF ≥ 50%). |
| `FLT3` | boolean | §2.3 | FLT3-ITD or FLT3-TKD. |
| `MLL_PTD` | boolean | §2.3 | KMT2A partial tandem duplication. |
| `SF3B1_5q` | boolean | §2.3 | SF3B1-mut + isolated del(5q). Mutually exclusive with `SF3B1_alpha`. |
| `SF3B1_alpha` | boolean | §2.3 | SF3B1-mut without del(5q) and without listed adverse comutations. |
| `NPM1` | boolean | §2.3 | |
| `RUNX1` | boolean | §2.3 | |
| `NRAS` | boolean | §2.3 | |
| `ETV6` | boolean | §2.3 | |
| `IDH2` | boolean | §2.3 | |
| `CBL` | boolean | §2.3 | |
| `EZH2` | boolean | §2.3 | |
| `U2AF1` | boolean | §2.3 | |
| `SRSF2` | boolean | §2.3 | |
| `DNMT3A` | boolean | §2.3 | |
| `ASXL1` | boolean | §2.3 | |
| `KRAS` | boolean | §2.3 | |

### Residual-gene set (15, boolean — aggregated to `Nres2`)

| linkId | type | source | notes |
|---|---|---|---|
| `BCOR` | boolean | §2.4 | |
| `BCORL1` | boolean | §2.4 | |
| `CEBPA` | boolean | §2.4 | |
| `ETNK1` | boolean | §2.4 | |
| `GATA2` | boolean | §2.4 | |
| `GNB1` | boolean | §2.4 | |
| `IDH1` | boolean | §2.4 | |
| `NF1` | boolean | §2.4 | |
| `PHF6` | boolean | §2.4 | |
| `PPM1D` | boolean | §2.4 | |
| `PRPF8` | boolean | §2.4 | |
| `PTPN11` | boolean | §2.4 | |
| `SETBP1` | boolean | §2.4 | |
| `STAG2` | boolean | §2.4 | |
| `WT1` | boolean | §2.4 | |

### Calculated outputs

| linkId | type | source | notes |
|---|---|---|---|
| `IPSSM_score` | decimal | §4 | Continuous log₂-HR score. |
| `IPSSM_category` | string | §3.3 | `VL` \| `L` \| `ML` \| `MH` \| `H` \| `VH`. |
| `median_OS_years` | decimal | §4.1 | Per category. |
| `AML_transformation_risk` | string | §4.1 | qualitative (`very low` … `very high`). |

> Missingness handling (`IPSSMbest` / `IPSSMworst` / `IPSSMmean`) is **not encoded in FHIRPath** — answer values are required (boolean defaults to false ≡ wild-type). For trinary missingness, expose three parallel scores in the renderer (compute via three separate Questionnaire instances or a hosted CQL library).

---

## Variables

### Clinical / cytogenetic features (transformed)

| name | expression |
|---|---|
| `BM_BLAST` | `%resource.item.where(linkId='BM_BLAST').answer.value.first()` |
| `HB` | `%resource.item.where(linkId='HB').answer.value.first()` |
| `PLT` | `%resource.item.where(linkId='PLT').answer.value.first()` |
| `CYTO_IPSSR` | `%resource.item.where(linkId='CYTO_IPSSR').answer.value.first()` |
| `BLAST5` | `iif(%BM_BLAST > 20, 20, %BM_BLAST) / 5` |
| `HB1` | `iif(%HB > 20, 20, %HB)` |
| `TRANSF_PLT100` | `iif(%PLT > 250, 250, %PLT) / 100` |
| `CYTOVEC` | `iif(%CYTO_IPSSR = 'Very Good', 0, iif(%CYTO_IPSSR = 'Good', 1, iif(%CYTO_IPSSR = 'Intermediate', 2, iif(%CYTO_IPSSR = 'Poor', 3, 4))))` |

### Gene indicators (boolean → 0/1)

For each main-effect gene `G`, define `%G_n` (numeric) so the formulae stay readable:

```
%TP53multi_n   = iif(%resource.item.where(linkId='TP53multi').answer.value.first(),   1, 0)
%FLT3_n        = iif(%resource.item.where(linkId='FLT3').answer.value.first(),        1, 0)
%MLL_PTD_n     = iif(%resource.item.where(linkId='MLL_PTD').answer.value.first(),     1, 0)
%SF3B1_5q_n    = iif(%resource.item.where(linkId='SF3B1_5q').answer.value.first(),    1, 0)
%SF3B1_alpha_n = iif(%resource.item.where(linkId='SF3B1_alpha').answer.value.first(), 1, 0)
%NPM1_n        = iif(%resource.item.where(linkId='NPM1').answer.value.first(),        1, 0)
%RUNX1_n       = iif(%resource.item.where(linkId='RUNX1').answer.value.first(),       1, 0)
%NRAS_n        = iif(%resource.item.where(linkId='NRAS').answer.value.first(),        1, 0)
%ETV6_n        = iif(%resource.item.where(linkId='ETV6').answer.value.first(),        1, 0)
%IDH2_n        = iif(%resource.item.where(linkId='IDH2').answer.value.first(),        1, 0)
%CBL_n         = iif(%resource.item.where(linkId='CBL').answer.value.first(),         1, 0)
%EZH2_n        = iif(%resource.item.where(linkId='EZH2').answer.value.first(),        1, 0)
%U2AF1_n       = iif(%resource.item.where(linkId='U2AF1').answer.value.first(),       1, 0)
%SRSF2_n       = iif(%resource.item.where(linkId='SRSF2').answer.value.first(),       1, 0)
%DNMT3A_n      = iif(%resource.item.where(linkId='DNMT3A').answer.value.first(),      1, 0)
%ASXL1_n       = iif(%resource.item.where(linkId='ASXL1').answer.value.first(),       1, 0)
%KRAS_n        = iif(%resource.item.where(linkId='KRAS').answer.value.first(),        1, 0)
```

### Residual-gene aggregate (`Nres2`)

Sum the 15 residual indicators, cap at 2:

```
%Nres2_raw =
    iif(%resource.item.where(linkId='BCOR').answer.value.first(),    1, 0)
  + iif(%resource.item.where(linkId='BCORL1').answer.value.first(),  1, 0)
  + iif(%resource.item.where(linkId='CEBPA').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='ETNK1').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='GATA2').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='GNB1').answer.value.first(),    1, 0)
  + iif(%resource.item.where(linkId='IDH1').answer.value.first(),    1, 0)
  + iif(%resource.item.where(linkId='NF1').answer.value.first(),     1, 0)
  + iif(%resource.item.where(linkId='PHF6').answer.value.first(),    1, 0)
  + iif(%resource.item.where(linkId='PPM1D').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='PRPF8').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='PTPN11').answer.value.first(),  1, 0)
  + iif(%resource.item.where(linkId='SETBP1').answer.value.first(),  1, 0)
  + iif(%resource.item.where(linkId='STAG2').answer.value.first(),   1, 0)
  + iif(%resource.item.where(linkId='WT1').answer.value.first(),     1, 0)

%Nres2 = iif(%Nres2_raw > 2, 2, %Nres2_raw)
```

### Constant

| name | value |
|---|---|
| `ln2` | `0.6931471805599453` (compute as `2.ln()` if FHIRPath float literal precision is a concern) |

---

## Calculated expressions

### `IPSSM_score`

`Σ (x − mean) · β / ln 2` over all 22 features (4 clinical/cytogenetic + 17 main-effect genes + Nres2).

```
(
    /* Clinical / cytogenetic */
    (%BLAST5         - 0.922 ) *  0.352
  + (%TRANSF_PLT100  - 1.41  ) * -0.222
  + (%HB1            - 9.87  ) * -0.171
  + (%CYTOVEC        - 1.39  ) *  0.287

    /* Main-effect adverse genes */
  + (%TP53multi_n    - 0.0710) *  1.180
  + (%FLT3_n         - 0.0108) *  0.798
  + (%MLL_PTD_n      - 0.0247) *  0.798
  + (%SF3B1_5q_n     - 0.0166) *  0.504
  + (%NPM1_n         - 0.0112) *  0.430
  + (%RUNX1_n        - 0.1260) *  0.423
  + (%NRAS_n         - 0.0362) *  0.417
  + (%ETV6_n         - 0.0216) *  0.391
  + (%IDH2_n         - 0.0429) *  0.379
  + (%CBL_n          - 0.0473) *  0.295
  + (%EZH2_n         - 0.0588) *  0.270
  + (%U2AF1_n        - 0.0866) *  0.247
  + (%SRSF2_n        - 0.1580) *  0.239
  + (%DNMT3A_n       - 0.1610) *  0.221
  + (%ASXL1_n        - 0.2520) *  0.213
  + (%KRAS_n         - 0.0271) *  0.202

    /* Main-effect favourable gene */
  + (%SF3B1_alpha_n  - 0.1860) * -0.0794

    /* Residual-gene aggregate */
  + (%Nres2          - 0.3880) *  0.231
) / 0.6931471805599453
```

### `IPSSM_category`

Six-tier ladder per SPEC §3.3 (cutpoints `−1.5, −0.5, 0, 0.5, 1.5`):

```
iif(%IPSSM_score > 1.5,   'VH',
  iif(%IPSSM_score > 0.5,  'H',
    iif(%IPSSM_score > 0,   'MH',
      iif(%IPSSM_score > -0.5, 'ML',
        iif(%IPSSM_score > -1.5, 'L', 'VL')))))
```

### `median_OS_years`

Per-category median overall survival (Bernard 2022, SPEC §4.1):

```
iif(%IPSSM_category = 'VL', 11.7,
  iif(%IPSSM_category = 'L', 7.1,
    iif(%IPSSM_category = 'ML', 4.4,
      iif(%IPSSM_category = 'MH', 3.1,
        iif(%IPSSM_category = 'H', 2.3, 1.3)))))
```

### `AML_transformation_risk`

Qualitative ladder per SPEC §4.1 (numerical 1/3/5-yr cumulative incidences are TBD — the SPEC notes the NEJM Evidence article was paywalled at compile time, so only the qualitative tier is encoded):

```
iif(%IPSSM_category = 'VL', 'very low',
  iif(%IPSSM_category = 'L', 'low',
    iif(%IPSSM_category = 'ML', 'intermediate-low',
      iif(%IPSSM_category = 'MH', 'intermediate-high',
        iif(%IPSSM_category = 'H', 'high', 'very high')))))
```

---

## Worked example — test case 4 (Anne-Sophie Charron, SF3B1 + del(5q), High band)

Inputs from `TEST_CASES.md` Test case 4:

| variable | raw | transformed |
|---|---|---|
| `BM_BLAST` | 8 | `%BLAST5 = 8/5 = 1.60` |
| `HB` | 7.8 | `%HB1 = 7.8` |
| `PLT` | 280 | `%TRANSF_PLT100 = 250/100 = 2.50` (capped) |
| `CYTO_IPSSR` | Good | `%CYTOVEC = 1` |
| `SF3B1_5q` | true | `%SF3B1_5q_n = 1` |
| `PHF6` (residual) | true | `%Nres2_raw = 1, %Nres2 = 1` |
| All other genes | wild-type | `…_n = 0` |

Per-feature contributions (using SPEC §3.2 means; `BLAST5` mean = 0.922, slightly different from the test-case file which uses 1.094):

| feature | (x − mean) · β | / ln 2 |
|---|---:|---:|
| `BLAST5`         | (1.60 − 0.922) ·  0.352 = +0.2387  | +0.3443 |
| `TRANSF_PLT100`  | (2.50 − 1.41 ) · -0.222 = −0.2420  | −0.3491 |
| `HB1`            | (7.80 − 9.87 ) · -0.171 = +0.3540  | +0.5108 |
| `CYTOVEC`        | (1.00 − 1.39 ) ·  0.287 = −0.1119  | −0.1614 |
| `SF3B1_5q`       | (1.00 − 0.0166) ·  0.504 = +0.4956  | +0.7150 |
| `Nres2`          | (1.00 − 0.388) ·  0.231 = +0.1414  | +0.2040 |
| Adverse genes WT (16 features other than SF3B1_5q): | Σ (−mean·β) / ln 2 | ≈ −0.5476 |
| `SF3B1_alpha` WT | (0 − 0.186) · -0.0794 = +0.01477   | +0.0213 |

Sum: `+0.3443 − 0.3491 + 0.5108 − 0.1614 + 0.7150 + 0.2040 − 0.5476 + 0.0213 ≈ +0.7373`.

```
%IPSSM_score      ≈ +0.74
%IPSSM_category   = 'H'              (0.5 < 0.74 ≤ 1.5)
%median_OS_years  ≈ 2.3
```

`TEST_CASES.md` test case 4 expects `IPSSM_score ≈ +0.63`, `IPSSM_category = H`. Our +0.74 sits in the same band. The 0.11-unit gap is attributable to the two means tables: the SPEC uses `BLAST5 mean = 0.922` (this FHIRPath) vs the test-case `BLAST5 mean = 1.094`. Reproduction of the exact test-case score requires using the test-case means vector. Either way `IPSSM_category = H` matches.

---

## Notes

- All arithmetic is FHIRPath-native (`+`, `-`, `*`, `/`, `iif`); no transcendentals, no `power()`/`exp()`/`ln()` — this is by far the simplest of the four cardiovascular/molecular calculators in this directory to encode.
- The `ln 2` divisor is hard-coded as `0.6931471805599453`. If the FHIRPath engine truncates float literals to single precision, replace with `2.ln()` to defer the precision loss to engine-level math.
- **Means file is load-bearing.** SPEC §3.2 and `TEST_CASES.md` use slightly different means snapshots from the `papaemmelab/ipssm` R package settings file — see the headline note at the top. The means table embedded in this FHIRPath uses **SPEC §3.2 verbatim**. Implementations must pin to a specific commit/release of `papaemmelab/ipssm` and document the choice.
- **TBD numerical values that remain.** SPEC §4.1 lists `median_OS_years` per category but flags AML cumulative-incidence values as TBD (NEJM Evidence paywalled at compile time). Only the qualitative `AML_transformation_risk` tier is encoded; numerical 1/3/5-yr cumulative incidences are not available in FHIRPath form.
- **Missingness (`IPSSMbest` / `IPSSMworst` / `IPSSMmean`).** When a gene call is unknown, the published reference reports three scores by best/worst-case imputation. FHIRPath cannot conditionally route a tri-state ("yes / no / unknown") into three parallel sums in a single `Questionnaire`. Two options:
  1. Render three Questionnaire instances (one per imputation path) and present min/max/mean to the user.
  2. Escalate to **CQL** for the missingness logic — CQL can model `null` propagation natively and compute all three scores in a single library. Recommended if the form is for ad-hoc clinical use where genotype panels are commonly partial.
- **SF3B1 mutual exclusivity.** The SPEC defines `SF3B1_5q` and `SF3B1_alpha` as mutually exclusive, plus a third "SF3B1 with adverse comutation" branch in which neither indicator fires (the comutation drives the score). This routing must be applied **upstream** at intake (when constructing the QuestionnaireResponse) — FHIRPath cannot infer the SF3B1 phenotype from `(SF3B1, del(5q), comutation)` flags alone without re-stating the entire decision tree. Provide the three booleans pre-computed.
- **TP53 multi-hit.** Same upstream-routing requirement: only `TP53multi` carries the heavy +1.180 weight. Mono-allelic TP53 must be folded into `Nres2` upstream — there is no FHIRPath logic encoded here that distinguishes the two.
- **Residual-gene cap at 2.** `Nres2 = min(count, 2)` is encoded as `iif(%Nres2_raw > 2, 2, %Nres2_raw)`. A patient with 3+ residual mutations contributes the same +0.231 × (2 − 0.388) / ln 2 ≈ +0.537 from this aggregate. Reviewers should sanity-check the cap by adding a hidden read-only item exposing `%Nres2_raw` and `%Nres2` side-by-side.
