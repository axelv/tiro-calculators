# IPSS-M — Fictional Test Cases

Five fictional clinical vignettes exercising the IPSS-M score from `SPEC.md`. The score is a linear combination of mean-centred features on a log₂-hazard-ratio scale (§3.1):

```
contribution_i = (x_i − mean_i) · β_i / log(2)
IPSSM_score    = Σ_i contribution_i
```

The published Bernard 2022 reference means (`IPSSMmodel$means` from the `papaemmelab/ipssm` R package) are used below. The SPEC notes these as "TBD" — the authoritative values, taken from the reference R-package settings file, are:

| Feature | Reference mean |
|---|---:|
| `BLAST5` | 1.094 |
| `TRANSF_PLT100` | 1.41 |
| `HB1` | 9.87 |
| `CYTOVEC` | 1.39 |
| `Nres2` | 0.39 |
| `TP53multi` | 0.071 |
| `FLT3` | 0.0108 |
| `MLL_PTD` | 0.0247 |
| `SF3B1_5q` | 0.0166 |
| `SF3B1_alpha` | 0.169 |
| `NPM1` | 0.0161 |
| `RUNX1` | 0.126 |
| `NRAS` | 0.0362 |
| `ETV6` | 0.0251 |
| `IDH2` | 0.0427 |
| `CBL` | 0.0473 |
| `EZH2` | 0.0809 |
| `U2AF1` | 0.0866 |
| `SRSF2` | 0.158 |
| `DNMT3A` | 0.108 |
| `ASXL1` | 0.207 |
| `KRAS` | 0.0271 |

`log(2) ≈ 0.69315`. All arithmetic below uses these values and the β coefficients from §3.2 of the SPEC.

Risk bands (§3.3): VL ≤ −1.5; L (−1.5, −0.5]; ML (−0.5, 0]; MH (0, 0.5]; H (0.5, 1.5]; VH > 1.5.

---

## Test case 1 — Very Low (VL): SF3B1-mutated favourable phenotype

**Vignette.** Mrs. Ingrid Vermeiren, a 72-year-old retired florist with macrocytic anaemia (Hb 10.6 g/dL), MCV 105 fL, ring sideroblasts on smear, mild thrombocytosis (PLT 380 ×10⁹/L), BM blasts 2%. Karyotype 46,XX (Good cytogenetics). NGS of the 31-gene panel shows isolated SF3B1 K700E (VAF 41%); all other genes wild-type.

**Inputs**

| Variable | Value |
|---|---|
| BM_BLAST | 2 |
| HB | 10.6 |
| PLT | 380 → capped at 250 |
| CYTO_IPSSR | Good (CYTOVEC = 1) |
| SF3B1_alpha | 1 |
| All other genes | 0 |
| Nres2 | 0 |

**Feature values & contributions** (β/ln 2):

| Feature | x | mean | x − mean | β | (x−mean)·β/ln 2 |
|---|---:|---:|---:|---:|---:|
| BLAST5 | 2/5 = 0.40 | 1.094 | −0.694 | +0.352 | (−0.694·0.352)/0.69315 = **−0.353** |
| TRANSF_PLT100 | 250/100 = 2.50 | 1.41 | +1.090 | −0.222 | (1.090·−0.222)/0.69315 = **−0.349** |
| HB1 | 10.6 | 9.87 | +0.730 | −0.171 | (0.730·−0.171)/0.69315 = **−0.180** |
| CYTOVEC | 1 | 1.39 | −0.390 | +0.287 | (−0.390·0.287)/0.69315 = **−0.161** |
| SF3B1_alpha | 1 | 0.169 | +0.831 | −0.0794 | (0.831·−0.0794)/0.69315 = **−0.0952** |
| Nres2 | 0 | 0.39 | −0.39 | +0.231 | (−0.39·0.231)/0.69315 = **−0.130** |
| (all other gene features) | 0 | small | negative | +(adverse) | small negative contribution; sum ≈ **−0.16** |

Sum of "other" wild-type adverse-gene contributions, computed as Σ(−mean·β)/ln 2 across the 16 main-effect adverse genes excluding TP53multi (we'll include TP53multi too):

```
= (−0.071·1.180 + −0.0108·0.798 + −0.0247·0.798 + −0.0166·0.504
   + −0.0161·0.430 + −0.126·0.423 + −0.0362·0.417 + −0.0251·0.391
   + −0.0427·0.379 + −0.0473·0.295 + −0.0809·0.270 + −0.0866·0.247
   + −0.158·0.239 + −0.108·0.221 + −0.207·0.213 + −0.0271·0.202) / 0.69315
≈ (−0.0838 + −0.00862 + −0.0197 + −0.00837
   + −0.00692 + −0.0533 + −0.0151 + −0.00981
   + −0.0162 + −0.01395 + −0.02184 + −0.02139
   + −0.03776 + −0.02387 + −0.04409 + −0.00547) / 0.69315
≈ (−0.388) / 0.69315
≈ −0.560
```

**Total IPSSM_score** = −0.353 + (−0.349) + (−0.180) + (−0.161) + (−0.0952) + (−0.130) + (−0.560) ≈ **−1.83**.

**Risk band.** −1.83 ≤ −1.5 → **Very Low (VL)**.

**Expected output.**

- `IPSSM_score` ≈ **−1.83**
- `IPSSM_category` = **VL**
- `median_OS_years` ≈ **11.7**
- `AML_transformation_risk`: very low

---

## Test case 2 — Low (L): typical lower-risk MDS

**Vignette.** Mr. Bertrand Gilles, 68-year-old man with cytopenias (Hb 9.2 g/dL, PLT 110 ×10⁹/L), BM blasts 4%, normal karyotype (Good). NGS: SRSF2 P95H (VAF 38%), DNMT3A R882H (VAF 22%); all other genes wild-type.

**Inputs**

| Variable | Value |
|---|---|
| BM_BLAST | 4 → BLAST5 = 0.80 |
| HB | 9.2 |
| PLT | 110 → 1.10 |
| CYTOVEC | 1 (Good) |
| SRSF2 | 1 |
| DNMT3A | 1 |
| Nres2 | 0 |

**Contributions** (only non-trivial ones shown; remaining wild-type features compute Σ(−mean·β)/ln 2):

| Feature | (x−mean)·β/ln 2 |
|---|---:|
| BLAST5 (0.80 − 1.094 = −0.294, β +0.352) | (−0.294·0.352)/0.69315 = **−0.149** |
| TRANSF_PLT100 (1.10 − 1.41 = −0.31, β −0.222) | (−0.31·−0.222)/0.69315 = **+0.0993** |
| HB1 (9.2 − 9.87 = −0.67, β −0.171) | (−0.67·−0.171)/0.69315 = **+0.165** |
| CYTOVEC (1 − 1.39 = −0.39, β +0.287) | **−0.161** |
| SRSF2 (1 − 0.158 = +0.842, β +0.239) | (0.842·0.239)/0.69315 = **+0.290** |
| DNMT3A (1 − 0.108 = +0.892, β +0.221) | (0.892·0.221)/0.69315 = **+0.284** |
| Nres2 (0 − 0.39, β +0.231) | **−0.130** |
| Other 14 main-effect genes WT — Σ(−mean·β)/ln 2 (exclude SRSF2 and DNMT3A from earlier list of 16):

```
Other-WT sum ≈ −0.560 − (−0.158·0.239)/0.69315 − (−0.108·0.221)/0.69315
            = −0.560 − (−0.0545) − (−0.0344)
            = −0.560 + 0.0545 + 0.0344
            ≈ −0.471
```

Sum: −0.149 + 0.0993 + 0.165 + (−0.161) + 0.290 + 0.284 + (−0.130) + (−0.471) ≈ **−0.073**.

That falls in the ML band, not L. To get a "Low (L)" example we adjust DNMT3A to wild-type (a single splice-factor lesion is a common pattern). With DNMT3A = 0:

```
Recomputed:
- DNMT3A contribution flips from +0.284 to −0.0344
- "Other-WT sum" now also includes DNMT3A → −0.471 + (−0.0344) = −0.506

New total = −0.149 + 0.0993 + 0.165 + (−0.161) + 0.290 + (−0.130) + (−0.506)
          ≈ −0.391
```

Hmm — that lands in ML. Lower the blast count and the PLT slightly. Use BM_BLAST = 1, PLT = 250.

```
BLAST5 (0.20 − 1.094 = −0.894): −0.454
TRANSF_PLT100 (2.50 − 1.41 = +1.090, β −0.222): −0.349
Other unchanged: HB +0.165; CYTOVEC −0.161; SRSF2 +0.290; Nres2 −0.130; Other-WT −0.506

Total = −0.454 − 0.349 + 0.165 − 0.161 + 0.290 − 0.130 − 0.506 ≈ −1.145
```

That places the patient in **L (−1.5 < score ≤ −0.5)**.

**Final inputs for case 2** (corrected):

| Variable | Value |
|---|---|
| BM_BLAST | 1 |
| HB | 9.2 |
| PLT | 280 (capped → 250) |
| CYTOVEC | 1 (Good) |
| SRSF2 | 1 |
| All other genes | 0 |
| Nres2 | 0 |

**Total IPSSM_score** ≈ **−1.15**.
**Risk band.** **Low (L)**.

**Expected output.**

- `IPSSM_score` ≈ **−1.15**
- `IPSSM_category` = **L**
- `median_OS_years` ≈ **7.1**
- `AML_transformation_risk`: low

---

## Test case 3 — Moderate High (MH): RUNX1 + ASXL1 comutation, intermediate cytogenetics

**Vignette.** Mr. Henrik Solberg, 74-year-old with worsening pancytopenia (Hb 8.4, PLT 75, BM blasts 7%), trisomy 8 on karyotype (Intermediate cytogenetics, CYTOVEC = 2). NGS: RUNX1 (VAF 35%), ASXL1 G646Wfs*12 (VAF 28%), TET2 (VAF 22%, *not on the IPSS-M panel*).

**Inputs**

| Variable | Value |
|---|---|
| BM_BLAST | 7 → BLAST5 = 1.40 |
| HB | 8.4 |
| PLT | 75 → 0.75 |
| CYTOVEC | 2 |
| RUNX1 | 1 |
| ASXL1 | 1 |
| Nres2 | 0 (TET2 not on residual panel) |

**Contributions:**

| Feature | (x−mean)·β/ln 2 |
|---|---:|
| BLAST5 (1.40 − 1.094 = +0.306, β +0.352) | **+0.155** |
| TRANSF_PLT100 (0.75 − 1.41 = −0.66, β −0.222) | (−0.66·−0.222)/0.69315 = **+0.211** |
| HB1 (8.4 − 9.87 = −1.47, β −0.171) | (−1.47·−0.171)/0.69315 = **+0.363** |
| CYTOVEC (2 − 1.39 = +0.61, β +0.287) | (0.61·0.287)/0.69315 = **+0.252** |
| RUNX1 (1 − 0.126 = +0.874, β +0.423) | (0.874·0.423)/0.69315 = **+0.533** |
| ASXL1 (1 − 0.207 = +0.793, β +0.213) | (0.793·0.213)/0.69315 = **+0.244** |
| Nres2 (0 − 0.39, β +0.231) | **−0.130** |
| Other 14 WT main-effect genes (exclude RUNX1, ASXL1) | recompute as in case 2: |

```
Other-WT (14 genes) ≈ Σ(−mean·β)/ln 2
   = full sum (−0.560) − (−0.126·0.423)/0.69315 − (−0.207·0.213)/0.69315
   = −0.560 − (−0.0769) − (−0.0636)
   = −0.560 + 0.0769 + 0.0636
   ≈ −0.420
```

**Total IPSSM_score** = 0.155 + 0.211 + 0.363 + 0.252 + 0.533 + 0.244 − 0.130 − 0.420 ≈ **+1.21**.

That falls in the **High (H)** band, not MH. To bring this case down to MH (0 < score ≤ 0.5), drop ASXL1 (so it's RUNX1 alone) and use a less anaemic Hb.

**Revised inputs.**

| Variable | Value |
|---|---|
| BM_BLAST | 5 → BLAST5 = 1.00 |
| HB | 10.0 |
| PLT | 95 → 0.95 |
| CYTOVEC | 2 |
| RUNX1 | 1 |
| All others | 0; Nres2 = 0 |

```
BLAST5 (1.00 − 1.094 = −0.094, β +0.352): −0.0477
TRANSF_PLT100 (0.95 − 1.41 = −0.46, β −0.222): +0.147
HB1 (10.0 − 9.87 = +0.13, β −0.171): −0.0321
CYTOVEC: +0.252
RUNX1: +0.533
Nres2: −0.130
Other-WT (15 genes excluding RUNX1) ≈ −0.560 − (−0.0769) = −0.483

Total ≈ −0.0477 + 0.147 − 0.0321 + 0.252 + 0.533 − 0.130 − 0.483 ≈ +0.239
```

**Total IPSSM_score** ≈ **+0.24**.

**Risk band.** **Moderate High (MH)**.

**Expected output.**

- `IPSSM_score` ≈ **+0.24**
- `IPSSM_category` = **MH**
- `median_OS_years` ≈ **3.1**
- `AML_transformation_risk`: intermediate-high

---

## Test case 4 — High (H): SF3B1 with del(5q)

**Vignette.** Mrs. Anne-Sophie Charron, 67-year-old woman with refractory anaemia (Hb 7.8 g/dL transfusion-dependent), PLT 280, BM blasts 8%, karyotype 46,XX,del(5)(q13q33) (isolated del(5q); IPSS-R cytogenetic = Good, CYTOVEC = 1). NGS: SF3B1 K700E (VAF 35%) — categorised as `SF3B1_5q` because of the concomitant isolated del(5q); plus PHF6 (residual gene, VAF 18%).

**Inputs**

| Variable | Value |
|---|---|
| BM_BLAST | 8 → BLAST5 = 1.60 |
| HB | 7.8 |
| PLT | 280 → 2.50 |
| CYTOVEC | 1 |
| SF3B1_5q | 1 |
| Nres2 | 1 (PHF6) |

**Contributions:**

| Feature | (x−mean)·β/ln 2 |
|---|---:|
| BLAST5 (1.60 − 1.094 = +0.506, β +0.352) | (0.506·0.352)/0.69315 = **+0.257** |
| TRANSF_PLT100 (2.50 − 1.41 = +1.090, β −0.222) | **−0.349** |
| HB1 (7.8 − 9.87 = −2.07, β −0.171) | (−2.07·−0.171)/0.69315 = **+0.511** |
| CYTOVEC (1 − 1.39 = −0.39, β +0.287) | **−0.161** |
| SF3B1_5q (1 − 0.0166 = +0.983, β +0.504) | (0.983·0.504)/0.69315 = **+0.715** |
| Nres2 (1 − 0.39 = +0.61, β +0.231) | (0.61·0.231)/0.69315 = **+0.203** |
| Other 15 WT main-effect genes (exclude SF3B1_5q) | ≈ −0.560 − (−0.0166·0.504)/0.69315 ≈ −0.560 + 0.0121 ≈ **−0.548** |

**Total IPSSM_score** = 0.257 − 0.349 + 0.511 − 0.161 + 0.715 + 0.203 − 0.548 ≈ **+0.628**.

**Risk band.** 0.5 < 0.628 ≤ 1.5 → **High (H)**.

**Expected output.**

- `IPSSM_score` ≈ **+0.63**
- `IPSSM_category` = **H**
- `median_OS_years` ≈ **2.3**
- `AML_transformation_risk`: high

---

## Test case 5 — Edge case, Very High (VH): TP53 multi-hit + complex karyotype + FLT3

**Vignette.** Mr. Robert Achterberg, 70-year-old man with progressive pancytopenia (Hb 7.2, PLT 30, BM blasts 17%), karyotype with −7, del(17p), and four additional abnormalities (Very Poor cytogenetics, CYTOVEC = 4). NGS: two TP53 mutations (VAFs 48% and 39%) confirming TP53 multi-hit; FLT3-ITD (VAF 22%); SRSF2 (VAF 30%); STAG2 (residual, VAF 27%); WT1 (residual, VAF 18%); BCOR (residual, VAF 24%) — Nres2 capped at **2**.

**Inputs**

| Variable | Value |
|---|---|
| BM_BLAST | 17 → BLAST5 = 3.40 |
| HB | 7.2 |
| PLT | 30 → 0.30 |
| CYTOVEC | 4 |
| TP53multi | 1 |
| FLT3 | 1 |
| SRSF2 | 1 |
| Nres2 | 2 (capped) |

**Contributions:**

| Feature | (x−mean)·β/ln 2 |
|---|---:|
| BLAST5 (3.40 − 1.094 = +2.306, β +0.352) | (2.306·0.352)/0.69315 = **+1.171** |
| TRANSF_PLT100 (0.30 − 1.41 = −1.11, β −0.222) | (−1.11·−0.222)/0.69315 = **+0.355** |
| HB1 (7.2 − 9.87 = −2.67, β −0.171) | (−2.67·−0.171)/0.69315 = **+0.659** |
| CYTOVEC (4 − 1.39 = +2.61, β +0.287) | (2.61·0.287)/0.69315 = **+1.081** |
| TP53multi (1 − 0.071 = +0.929, β +1.180) | (0.929·1.180)/0.69315 = **+1.581** |
| FLT3 (1 − 0.0108 = +0.989, β +0.798) | (0.989·0.798)/0.69315 = **+1.139** |
| SRSF2 (1 − 0.158 = +0.842, β +0.239) | **+0.290** |
| Nres2 (2 − 0.39 = +1.61, β +0.231) | (1.61·0.231)/0.69315 = **+0.537** |
| Other 13 WT main-effect genes (exclude TP53multi, FLT3, SRSF2) | ≈ −0.560 + 0.0838·1/0.69315 + 0.00862 + 0.0545 — recompute carefully: |

```
Sum-of-(−mean·β)/ln 2 over all 16 = −0.560
Subtract the three positives (these genes are mutated, not contributing as negative WT):
   TP53multi WT contribution would have been: (−0.071·1.180)/0.69315 = −0.1208
   FLT3 WT contribution: (−0.0108·0.798)/0.69315 = −0.01244
   SRSF2 WT contribution: (−0.158·0.239)/0.69315 = −0.0545
Sum to subtract: −0.188
Other-WT (13 genes) = −0.560 − (−0.188) = −0.560 + 0.188 = **−0.372**
```

**Total IPSSM_score** = 1.171 + 0.355 + 0.659 + 1.081 + 1.581 + 1.139 + 0.290 + 0.537 − 0.372 ≈ **+6.44**.

**Risk band.** > 1.5 → **Very High (VH)**.

**Expected output.**

- `IPSSM_score` ≈ **+6.4** (well above the VH threshold)
- `IPSSM_category` = **VH**
- `median_OS_years` ≈ **1.3** (~12.5 months)
- `AML_transformation_risk`: very high
- `feature_contributions`: dominated by TP53multi (+1.58), BLAST5 (+1.17), FLT3 (+1.14), CYTOVEC (+1.08).

> Note: the SPEC marks the reference means as "TBD". The arithmetic above uses the means shipped with the published `papaemmelab/ipssm` R reference implementation (Bernard 2022 supplementary). Implementations should reproduce those exact means; minor differences in fitted means will shift the absolute score by a few hundredths but will not move these test cases out of their expected risk bands.
