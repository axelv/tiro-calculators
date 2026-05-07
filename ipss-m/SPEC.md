# IPSS-M — Molecular International Prognostic Scoring System for MDS

Implementation specification for the IPSS-M risk score, an integrated clinical, cytogenetic, and molecular prognostic model for adult patients with myelodysplastic syndromes (MDS) and MDS/AML overlap (<20% BM blasts).

**Authoritative source:** [https://mds-risk-model.com](https://mds-risk-model.com)
**Primary publication:** Bernard E, Tuechler H, Greenberg PL, Hasserjian RP, Arango Ossa JE, et al. *Molecular International Prognostic Scoring System for Myelodysplastic Syndromes.* **NEJM Evidence** 2022;1(7):EVIDoa2200008. DOI: [10.1056/EVIDoa2200008](https://doi.org/10.1056/EVIDoa2200008)
**Reference R implementation:** [github.com/papaemmelab/ipssm](https://github.com/papaemmelab/ipssm)

---

## 1. Purpose

The IPSS-M provides refined risk stratification in MDS by integrating somatic mutations across a curated panel of 31 genes with the clinical and cytogenetic variables already used by the IPSS-R. Compared with IPSS-R, IPSS-M improves prognostic discrimination across overall survival (OS), leukemia-free survival (LFS), and risk of transformation to acute myeloid leukemia (AML), and **restratifies approximately 46% of patients** (most often upstaging adverse-mutation carriers and downstaging mutationally favorable cases). It is designed to inform treatment intensity decisions, including timing of allogeneic stem cell transplant.

---

## 2. Inputs

All inputs are required. Genes use HGNC symbols. Variant allele fraction (VAF) cutoffs and "mutation present" definitions follow the cohort conventions of Bernard 2022 (oncogenic / likely-oncogenic somatic variants on a curated MDS NGS panel).

### 2.1 Clinical variables

| Variable | Type | Unit | Transform used in score | Notes |
|---|---|---|---|---|
| `BM_BLAST` | numeric | % of nucleated BM cells | `BLAST5 = min(BM_BLAST, 20) / 5` | Bone marrow blast percentage. Capped at 20% (MDS / MDS-AML overlap range). |
| `HB` | numeric | g/dL | `HB1 = min(HB, 20)` | Hemoglobin. |
| `PLT` | numeric | ×10⁹/L | `TRANSF_PLT100 = min(PLT, 250) / 100` | Platelet count, capped at 250. |

### 2.2 Cytogenetic variable

| Variable | Type | Allowed values | Encoding (`CYTOVEC`) |
|---|---|---|---|
| `CYTO_IPSSR` | categorical (ordinal) | `Very Good`, `Good`, `Intermediate`, `Poor`, `Very Poor` | 0, 1, 2, 3, 4 |

`CYTO_IPSSR` is the IPSS-R cytogenetic category derived from the karyotype per Greenberg 2012 (IPSS-R) rules. It is required even when del(5q), -7/del(7q), and complex karyotype are also captured separately for clinical interpretation.

### 2.3 Molecular variables — main-effect genes (16)

Each entered as a binary indicator (`0` = wild-type, `1` = mutated). `NA` is allowed and triggers the best/worst/mean imputation logic of the published model (`IPSSMmean`, `IPSSMbest`, `IPSSMworst`).

| Gene | Variable | Notes |
|---|---|---|
| TP53 (multi-hit) | `TP53multi` | TP53 multi-hit: ≥2 TP53 mutations, OR a single TP53 mutation with concomitant del(17p) / TP53 LOH / VAF ≥50%. Single-hit TP53 contributes only via the residual-gene channel and SF3B1 stratification. |
| FLT3 (ITD or TKD) | `FLT3` | Either FLT3-ITD or FLT3-TKD activating mutation. |
| MLL (KMT2A) PTD | `MLL_PTD` | Partial tandem duplication of KMT2A. |
| SF3B1 (5q context) | `SF3B1_5q` | SF3B1-mutated **with isolated del(5q) cytogenetic abnormality**. Mutually exclusive with `SF3B1_alpha`. |
| SF3B1 (alpha / favorable) | `SF3B1_alpha` | SF3B1 mutated **without** any of: del(5q), TP53multi, FLT3, MLL_PTD, RUNX1, NRAS, EZH2, IDH2, BCOR, BCORL1, RUNX1, STAG2, SRSF2, U2AF1. Captures the favorable SF3B1 phenotype; modulated by comutations. |
| NPM1 | `NPM1` | |
| RUNX1 | `RUNX1` | |
| NRAS | `NRAS` | |
| ETV6 | `ETV6` | |
| IDH2 | `IDH2` | |
| CBL | `CBL` | |
| EZH2 | `EZH2` | |
| U2AF1 | `U2AF1` | |
| SRSF2 | `SRSF2` | |
| DNMT3A | `DNMT3A` | |
| ASXL1 | `ASXL1` | |
| KRAS | `KRAS` | |

**SF3B1 with comutation handling.** SF3B1 is split into two mutually exclusive features:
- `SF3B1_5q` — SF3B1 mutated with isolated del(5q): treated as **adverse**.
- `SF3B1_alpha` — SF3B1 mutated without del(5q) and without any of the listed adverse comutations: treated as **favorable**.
- SF3B1 mutated with any other adverse comutation (e.g. SRSF2, RUNX1, EZH2, NRAS, IDH2, BCOR, BCORL1, STAG2, U2AF1) is **not** counted as `SF3B1_alpha`; the comutation drives the score directly.

**TP53 mono- vs multi-hit handling.** Only `TP53multi` (multi-hit TP53) carries the heavy adverse weight. Mono-allelic TP53 is *not* counted as multi-hit; a single TP53 mutation in the absence of LOH/high VAF/second hit contributes only as one of the residual-gene mutations (`Nres2`).

### 2.4 Molecular variables — residual gene set (15)

Mutations in these 15 genes are aggregated into a single integer feature `Nres2` representing the number of mutated residual genes, **capped at 2**: `Nres2 = min(count_of_mutated_residual_genes, 2)`.

| BCOR | BCORL1 | CEBPA | ETNK1 | GATA2 | GNB1 | IDH1 | NF1 |
| PHF6 | PPM1D | PRPF8 | PTPN11 | SETBP1 | STAG2 | WT1 |

Total panel: **16 main-effect genes + 15 residual genes = 31 genes**.

---

## 3. Calculation

### 3.1 Formula

The IPSS-M score is a linear combination of mean-centered features, scaled to a log₂-hazard-ratio interpretation:

```
contribution_i = (x_i - mean_i) * beta_i / log(2)
IPSSM_score    = Σ_i contribution_i
```

A score of `0` corresponds to the average MDS patient in the Bernard 2022 cohort; each unit on the score corresponds to a doubling of hazard (log₂ HR scale).

### 3.2 Feature weights (β coefficients, Bernard 2022)

Weights are extracted from the reference R implementation [`papaemmelab/ipssm`](https://github.com/papaemmelab/ipssm) and correspond to the published Cox multivariable model.

#### Clinical / cytogenetic features

| Feature | β | Direction |
|---|---:|---|
| `BLAST5` (capped BM blast %, /5) | **+0.352** | adverse |
| `TRANSF_PLT100` (capped PLT, /100) | **−0.222** | favorable |
| `HB1` (capped hemoglobin) | **−0.171** | favorable |
| `CYTOVEC` (IPSS-R cytogenetic 0–4) | **+0.287** | adverse |

#### Main-effect gene features

| Feature | β | Direction |
|---|---:|---|
| `TP53multi` | **+1.180** | adverse (largest) |
| `FLT3` | **+0.798** | adverse |
| `MLL_PTD` | **+0.798** | adverse |
| `SF3B1_5q` | **+0.504** | adverse |
| `NPM1` | **+0.430** | adverse |
| `RUNX1` | **+0.423** | adverse |
| `NRAS` | **+0.417** | adverse |
| `ETV6` | **+0.391** | adverse |
| `IDH2` | **+0.379** | adverse |
| `CBL` | **+0.295** | adverse |
| `EZH2` | **+0.270** | adverse |
| `U2AF1` | **+0.247** | adverse |
| `SRSF2` | **+0.239** | adverse |
| `DNMT3A` | **+0.221** | adverse |
| `ASXL1` | **+0.213** | adverse |
| `KRAS` | **+0.202** | adverse |
| `SF3B1_alpha` | **−0.0794** | favorable |

#### Residual-gene aggregate

| Feature | β | Direction |
|---|---:|---|
| `Nres2` (mutated residual genes, capped at 2) | **+0.231** | adverse, per residual mutation |

#### Reference population means (`mean_i`)

Reproduced verbatim from the reference R implementation [`papaemmelab/ipssm`](https://github.com/papaemmelab/ipssm/blob/main/R/IPSSMmain.R) (`IPSSMmain()` default `meanValues` vector). These are the Bernard 2022 training-cohort means used to mean-center each feature in the score computation.

| Feature | Reference mean |
|---|---:|
| `HB1` (capped hemoglobin, g/dL) | **9.87** |
| `TRANSF_PLT100` (capped platelets / 100) | **1.41** |
| `BLAST5` (capped BM blast % / 5) | **0.922** |
| `CYTOVEC` (IPSS-R cytogenetic 0–4) | **1.39** |
| `TP53multi` | **0.0710** |
| `FLT3` | **0.0108** |
| `MLL_PTD` | **0.0247** |
| `SF3B1_5q` | **0.0166** |
| `NPM1` | **0.0112** |
| `RUNX1` | **0.1260** |
| `NRAS` | **0.0362** |
| `ETV6` | **0.0216** |
| `IDH2` | **0.0429** |
| `CBL` | **0.0473** |
| `EZH2` | **0.0588** |
| `U2AF1` | **0.0866** |
| `SRSF2` | **0.1580** |
| `DNMT3A` | **0.1610** |
| `ASXL1` | **0.2520** |
| `KRAS` | **0.0271** |
| `SF3B1_alpha` | **0.1860** |
| `nRes2` (residual-gene aggregate, 0–2) | **0.3880** |

For binary gene features the mean equals the prevalence of mutation in the Bernard 2022 cohort (e.g. ASXL1 mutated in ~25.2% of patients).

#### Best / worst imputation values for missing genotypes

When a gene call is `NA`, the reference implementation imputes per-feature best- and worst-case values to produce `IPSSMbest` and `IPSSMworst` bounds. Values from `papaemmelab/ipssm`:

| Feature | Best value | Worst value |
|---|---:|---:|
| `HB1` | 20 | 4 |
| `TRANSF_PLT100` | 2.5 | 0 |
| `BLAST5` | 0 | 4 |
| `CYTOVEC` | 0 | 4 |
| All adverse genes (TP53multi, FLT3, MLL_PTD, SF3B1_5q, NPM1, RUNX1, NRAS, ETV6, IDH2, CBL, EZH2, U2AF1, SRSF2, DNMT3A, ASXL1, KRAS) | 0 (wild-type) | 1 (mutated) |
| `SF3B1_alpha` (favorable) | 1 (mutated → favorable) | 0 (wild-type) |

### 3.3 Risk categories

Six categories are obtained by binning the continuous `IPSSM_score` (log₂ HR scale). Cutpoints are taken verbatim from `papaemmelab/ipssm` (`risk.cutpoints = c(-1.5, -0.5, 0, 0.5, 1.5)` in [`R/IPSSMmain.R`](https://github.com/papaemmelab/ipssm/blob/main/R/IPSSMmain.R)) and from Bernard 2022 Figure 2:

| IPSSM_score range | Category | Code |
|---|---|---|
| ≤ −1.5 | Very Low | `VL` |
| > −1.5 and ≤ −0.5 | Low | `L` |
| > −0.5 and ≤ 0 | Moderate Low | `ML` |
| > 0 and ≤ 0.5 | Moderate High | `MH` |
| > 0.5 and ≤ 1.5 | High | `H` |
| > 1.5 | Very High | `VH` |

### 3.4 Handling missing genotypes

When one or more gene calls are missing (`NA`), the reference implementation reports three scores:

- `IPSSMbest` — assume all missing values are wild-type (lower bound).
- `IPSSMworst` — assume all missing values are mutated (upper bound).
- `IPSSMmean` — best/worst midpoint, used as the point estimate.

Implementations should expose all three when missingness is non-trivial.

---

## 4. Output

For each patient the calculator returns:

| Output | Type | Description |
|---|---|---|
| `IPSSM_score` | numeric (log₂ HR) | Continuous risk score; `0` ≈ average MDS patient. |
| `IPSSM_score_best` | numeric | Lower-bound score under best-case imputation of missing genes. |
| `IPSSM_score_worst` | numeric | Upper-bound score under worst-case imputation. |
| `IPSSM_category` | enum | One of `VL`, `L`, `ML`, `MH`, `H`, `VH`. |
| `median_OS_years` | numeric | Median overall survival (see table). |
| `AML_transformation_risk` | qualitative + reference rate | Risk of leukemic transformation (see table). |
| `feature_contributions` | map<string, numeric> | Per-feature contribution to `IPSSM_score` (for explainability). |

### 4.1 Outcomes by IPSS-M category (Bernard 2022)

| Category | Median OS (years) | Median OS (months) | Leukemic transformation |
|---|---:|---:|---|
| Very Low (VL) | ~11.7 | ~156.0 | very low |
| Low (L) | ~7.1 | ~85.5–185.5* | low |
| Moderate Low (ML) | ~4.4 | ~85.2 | intermediate-low |
| Moderate High (MH) | ~3.1 | ~57.6 | intermediate-high |
| High (H) | ~2.3 | ~31.1 | high |
| Very High (VH) | ~1.3 | ~12.5 | very high |

*Months figures correspond to the original Bernard 2022 NEJM Evidence cohort; year figures are the rounded values widely cited in subsequent validation studies. Implementations should display both and link the patient's individual continuous score to its position on the published Kaplan–Meier curves.

Per-category cumulative incidence of AML transformation at 1 / 3 / 5 years is reported in the Bernard 2022 paper (Figure 3 / Supplementary Tables). Numerical values not reproduced here.

> **Resolution attempted**: NEJM Evidence article PDF and full text are paywalled (HTTP 403 from evidence.nejm.org). The cumulative-incidence values must be transcribed manually from the Bernard 2022 paper Figure 3 panel / Supplementary Tables S5–S7 once a credentialed user has access. The per-category continuous score and median-OS values above are sourced from the open `papaemmelab/ipssm` reference R package and from validation publications that quote Bernard 2022 directly.

---

## 5. References

1. **Bernard E, Tuechler H, Greenberg PL, Hasserjian RP, Arango Ossa JE, et al.** Molecular International Prognostic Scoring System for Myelodysplastic Syndromes. *NEJM Evidence* 2022;1(7):EVIDoa2200008. [https://evidence.nejm.org/doi/full/10.1056/EVIDoa2200008](https://evidence.nejm.org/doi/full/10.1056/EVIDoa2200008) — primary publication, model derivation and supplementary tables (feature weights, training-cohort means, KM curves).
2. **Online IPSS-M risk calculator.** [https://mds-risk-model.com](https://mds-risk-model.com) — authoritative web calculator maintained by the Papaemmanuil lab.
3. **papaemmelab/ipssm** (R reference implementation). [https://github.com/papaemmelab/ipssm](https://github.com/papaemmelab/ipssm) — open-source code with model coefficients, feature means, and gene categorization.
4. **Greenberg PL, Tuechler H, Schanz J, et al.** Revised International Prognostic Scoring System for Myelodysplastic Syndromes (IPSS-R). *Blood* 2012;120(12):2454-2465. — basis for the `CYTO_IPSSR` cytogenetic category used as input.
5. **Sauta E, Robin M, Bersanelli M, et al.** Real-World Validation of Molecular International Prognostic Scoring System for Myelodysplastic Syndromes. *J Clin Oncol* 2023;41(15):2827-2842. [https://ascopubs.org/doi/10.1200/JCO.22.01784](https://ascopubs.org/doi/10.1200/JCO.22.01784) — independent validation.
6. **Aguirre LE, Al Ali N, Sallman DA, et al.** Validation of the molecular international prognostic scoring system in patients with MDS defined by ICC. *Blood Cancer Journal* 2023;13:128. [https://www.nature.com/articles/s41408-023-00894-8](https://www.nature.com/articles/s41408-023-00894-8) — ICC-MDS validation.
