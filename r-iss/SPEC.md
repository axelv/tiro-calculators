# Revised International Staging System (R-ISS) for Multiple Myeloma

Implementation specification for the **Revised International Staging System
(R-ISS)** — a prognostic risk-stratification tool for patients with newly
diagnosed multiple myeloma (NDMM) that combines the original ISS, high-risk
chromosomal abnormalities by interphase FISH (iFISH), and serum LDH.

Primary publication: Palumbo A, Avet-Loiseau H, Oliva S, et al. *Revised
International Staging System for Multiple Myeloma: A Report From International
Myeloma Working Group.* **J Clin Oncol. 2015;33(26):2863–2869.**

---

## 1. Purpose

The R-ISS provides **prognostic risk stratification at diagnosis** of multiple
myeloma. It refines the original International Staging System (ISS) by
incorporating two additional prognostic factors known to independently affect
outcome:

1. **High-risk chromosomal abnormalities (CA)** detected by interphase
   fluorescent in situ hybridization (iFISH) on CD138-purified plasma cells —
   specifically del(17p), t(4;14), and t(14;16).
2. **Serum lactate dehydrogenase (LDH)** — normal vs above the upper limit of
   normal.

The combination identifies three categories with clearly different survival
outcomes (R-ISS I, II, III).

**Clinical use**

- Risk stratification at diagnosis of NDMM to inform prognosis discussions,
  trial eligibility, and intensity-of-treatment decisions.
- Used in clinical trial reporting as the standard staging system for NDMM
  since 2015.
- Complements (and largely supersedes for prognostic purposes) the original
  ISS in NDMM.

**Population**

- Adults with **newly diagnosed, symptomatic multiple myeloma**.
- Original derivation cohort: 4,445 NDMM patients pooled from 11 international
  trials (3,060 with simultaneously available ISS, CA, and LDH data); median
  follow-up 46 months.

**Out of scope**

- Smoldering multiple myeloma (SMM) and MGUS — do not use R-ISS.
- Relapsed / refractory multiple myeloma — R-ISS is a **diagnosis-time**
  prognostic tool and is not validated for restaging at relapse.
- Plasma cell leukemia, solitary plasmacytoma, AL amyloidosis.
- Patients without iFISH or LDH data — R-ISS cannot be assigned. The original
  ISS may be reported instead.
- The R-ISS does **not** by itself dictate therapy outside a clinical trial.

---

## 2. Inputs

R-ISS requires three categorical inputs:

| # | Field name             | Type        | Allowed values                          |
|---|------------------------|-------------|-----------------------------------------|
| 1 | ISS stage              | enum        | `I`, `II`, `III`                        |
| 2 | High-risk iFISH CA     | boolean     | `present` (high-risk) / `absent` (standard-risk) |
| 3 | Serum LDH              | enum        | `normal` / `elevated` (> ULN)           |

The ISS stage itself is computed from two laboratory values:

| Lab           | Type    | Unit                        |
|---------------|---------|-----------------------------|
| Serum β2-microglobulin (β2M) | numeric | mg/L            |
| Serum albumin                | numeric | g/dL            |

### 2.1 ISS stage definition (Greipp et al. 2005)

| ISS stage | Criteria                                                     |
|-----------|--------------------------------------------------------------|
| **I**     | β2M **< 3.5 mg/L** **AND** albumin **≥ 3.5 g/dL**            |
| **II**    | Neither stage I nor stage III                                |
| **III**   | β2M **≥ 5.5 mg/L** (regardless of albumin)                   |

Notes:
- Albumin in g/dL (multiply g/L by 0.1 if reported in g/L; threshold 35 g/L).
- β2M in mg/L is equivalent to µg/mL.
- Renal failure does not exclude assignment; β2M is interpreted as measured.

### 2.2 High-risk chromosomal abnormalities (iFISH)

**High-risk CA** is defined as the **presence of any one or more** of the
following abnormalities on iFISH performed on **CD138-purified plasma cells**:

| Abnormality        | Description                                       |
|--------------------|---------------------------------------------------|
| **del(17p)**       | Deletion of the short arm of chromosome 17 (TP53 locus). |
| **t(4;14)**        | Translocation t(4;14)(p16;q32) — *IGH/FGFR3-MMSET*. |
| **t(14;16)**       | Translocation t(14;16)(q32;q23) — *IGH/MAF*.      |

**Standard-risk CA** = absence of all three high-risk abnormalities.

Notes:
- Detection requires iFISH on CD138-selected plasma cells; conventional
  karyotyping is insufficiently sensitive in MM.
- Other abnormalities (e.g. 1q gain/amp, t(14;20), del(1p), hyperdiploidy)
  are **not** part of the original R-ISS — see §6 (R2-ISS update).
- Local laboratory cutoff for positivity (commonly ≥ 10 % of analyzed plasma
  cells, or ≥ 20 % for translocations / ≥ 60 % for trisomies, varies by lab)
  should be used; the Palumbo derivation accepted standard local thresholds.

### 2.3 LDH

| LDH category | Definition                                         |
|--------------|----------------------------------------------------|
| **Normal**   | Serum LDH ≤ upper limit of normal (ULN) for the local laboratory. |
| **Elevated** | Serum LDH > ULN for the local laboratory.         |

The ULN is **assay- and laboratory-specific**; use the reference range
reported by the measuring lab.

---

## 3. Calculation

R-ISS is a **categorical (rule-based) algorithm**, not a points score. Stage
is assigned by combining the three inputs:

| R-ISS stage  | Required combination                                                                  |
|--------------|---------------------------------------------------------------------------------------|
| **R-ISS I**  | ISS **I**  **AND** standard-risk CA **AND** normal LDH                                |
| **R-ISS III**| ISS **III** **AND** (high-risk CA **OR** elevated LDH)                                |
| **R-ISS II** | All other combinations (i.e. neither R-ISS I nor R-ISS III)                           |

### 3.1 Decision pseudocode

```
def r_iss(iss, high_risk_ca, ldh_elevated):
    """
    iss              : 'I' | 'II' | 'III'
    high_risk_ca     : bool   # True if del(17p) and/or t(4;14) and/or t(14;16)
    ldh_elevated     : bool   # True if LDH > ULN
    returns          : 'I' | 'II' | 'III'
    """
    if iss == 'I' and not high_risk_ca and not ldh_elevated:
        return 'I'
    if iss == 'III' and (high_risk_ca or ldh_elevated):
        return 'III'
    return 'II'
```

### 3.2 Truth-table (all 12 input combinations)

CA = high-risk chromosomal abnormality; LDH↑ = LDH > ULN.

| ISS | CA high-risk | LDH elevated | R-ISS  |
|-----|--------------|--------------|--------|
| I   | no           | no           | **I**  |
| I   | yes          | no           | **II** |
| I   | no           | yes          | **II** |
| I   | yes          | yes          | **II** |
| II  | no           | no           | **II** |
| II  | yes          | no           | **II** |
| II  | no           | yes          | **II** |
| II  | yes          | yes          | **II** |
| III | no           | no           | **II** |
| III | yes          | no           | **III**|
| III | no           | yes          | **III**|
| III | yes          | yes          | **III**|

Important corner case: **ISS III with standard-risk CA and normal LDH is
R-ISS II**, not R-ISS III.

### 3.3 Missing data

R-ISS requires all three inputs. If iFISH or LDH is unavailable, the R-ISS
**cannot be assigned**; report ISS alone and flag the missing component.

---

## 4. Output

### 4.1 Stage

Categorical: **R-ISS I**, **R-ISS II**, or **R-ISS III**.

### 4.2 Survival outcomes (Palumbo et al. 2015, median follow-up 46 months)

| R-ISS stage | % of derivation cohort | 5-yr OS | 5-yr PFS | Median OS         | Median PFS |
|-------------|-----------------------:|--------:|---------:|-------------------|------------|
| **I**       | 28 %                   | **82 %**| **55 %** | Not reached       | 66 months  |
| **II**      | 62 %                   | **62 %**| **36 %** | 83 months         | 42 months  |
| **III**     | 10 %                   | **40 %**| **24 %** | 43 months         | 29 months  |

OS = overall survival; PFS = progression-free survival.

### 4.3 Clinical interpretation

| Stage  | Interpretation                                                                 |
|--------|--------------------------------------------------------------------------------|
| **I**  | **Favorable prognosis.** Standard-risk biology; long expected OS and PFS.      |
| **II** | **Intermediate prognosis.** The largest and most heterogeneous group in NDMM.  |
| **III**| **Poor prognosis.** High-risk biology (ISS III plus adverse CA and/or elevated LDH); shorter OS/PFS; consider clinical trial enrollment and intensified strategies where appropriate. |

### 4.4 Pearls / pitfalls

- **R-ISS is prognostic, not predictive.** It does not by itself dictate
  therapy outside a clinical trial; treatment selection should follow current
  guidelines (e.g. IMWG, ESMO, NCCN) and individual patient factors.
- **Apply only at diagnosis of symptomatic MM** (not SMM, not MGUS, not
  relapse).
- **iFISH must be on CD138-purified plasma cells**; whole-marrow FISH or
  conventional karyotyping is not adequate.
- **The high-risk CA list is closed**: only del(17p), t(4;14), t(14;16) count
  for R-ISS. Additional adverse CAs (notably 1q gain/amplification) are
  **not** captured by the original R-ISS — see §6.
- **R-ISS II is large and heterogeneous** (~60 % of NDMM); the R2-ISS (§6)
  was developed to refine this group.
- **LDH thresholds are laboratory-specific** — always use the local ULN.
- **ISS III with standard cytogenetics and normal LDH downgrades to R-ISS II.**

---

## 5. References

**Primary publication**

1. Palumbo A, Avet-Loiseau H, Oliva S, Lokhorst HM, Goldschmidt H, Rosinol L,
   Richardson P, Caltagirone S, Lahuerta JJ, Facon T, Bringhen S, Gay F,
   Attal M, Passera R, Spencer A, Offidani M, Kumar S, Musto P, Lonial S,
   Petrucci MT, Orlowski RZ, Zamagni E, Morgan G, Dimopoulos MA, Durie BGM,
   Anderson KC, Sonneveld P, San Miguel J, Cavo M, Rajkumar SV, Moreau P.
   *Revised International Staging System for Multiple Myeloma: A Report From
   International Myeloma Working Group.*
   **J Clin Oncol. 2015;33(26):2863–2869.**
   doi:10.1200/JCO.2015.61.2267
   PMID: 26240224
   <https://ascopubs.org/doi/10.1200/JCO.2015.61.2267>
   PMC: <https://pmc.ncbi.nlm.nih.gov/articles/mid/NIHMS747695/>

**Original ISS reference**

2. Greipp PR, San Miguel J, Durie BGM, et al. *International staging system
   for multiple myeloma.* **J Clin Oncol. 2005;23(15):3412–3420.**
   doi:10.1200/JCO.2005.04.242

**Calculator references**

3. MDCalc — Revised Multiple Myeloma International Staging System (R-ISS).
   <https://www.mdcalc.com/calc/3842/revised-multiple-myeloma-international-staging-system-r-iss>

4. International Myeloma Foundation — International Staging System (ISS) and
   Revised ISS (R-ISS).
   <https://www.myeloma.org/international-staging-system-iss-reivised-iss-r-iss>

---

## 6. Note on R2-ISS (Second Revision, 2022)

A second revision — the **R2-ISS** — was proposed by D'Agostino et al. on
behalf of the European Myeloma Network (EMN) within the HARMONY project,
based on 10,843 NDMM patients from 16 clinical trials.

**Key change vs R-ISS:** the R2-ISS is a **weighted additive points score**
that explicitly includes **chromosome 1q gain/amplification (1q+)** as an
independent adverse factor and discards t(14;16) (which lost statistical
significance in the larger cohort).

| Variable                                  | Points |
|-------------------------------------------|-------:|
| ISS II                                    | 1      |
| ISS III                                   | 1.5    |
| del(17p)                                  | 1      |
| Elevated LDH (> ULN)                      | 1      |
| t(4;14)                                   | 1      |
| 1q gain or amplification (1q+)            | 0.5    |

Total score → R2-ISS group:

| R2-ISS group              | Total points | Approx. % | Median OS         |
|---------------------------|--------------|-----------|-------------------|
| **I — Low**               | 0            | ~19 %     | Not reached       |
| **II — Low-intermediate** | 0.5 – 1      | ~31 %     | 109.2 months      |
| **III — Intermediate-high**| 1.5 – 2.5   | ~41 %     | 68.5 months       |
| **IV — High**             | 3 – 5        | ~9 %      | 37.9 months       |

Reference:

5. D'Agostino M, Cairns DA, Lahuerta JJ, et al. *Second Revision of the
   International Staging System (R2-ISS) for Overall Survival in Multiple
   Myeloma: A European Myeloma Network (EMN) Report Within the HARMONY
   Project.* **J Clin Oncol. 2022;40(29):3406–3418.**
   doi:10.1200/JCO.21.02614
   PMID: 35605179
   <https://ascopubs.org/doi/10.1200/JCO.21.02614>

The R2-ISS is **not** a drop-in replacement for R-ISS in this specification —
it requires 1q FISH data and uses a different (additive) algorithm — but
implementations may choose to expose both staging systems side-by-side when
1q+ status is available.
