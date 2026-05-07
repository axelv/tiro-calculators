# Revised International Staging System (R-ISS) — Fictional Test Cases

Five fictional clinical test cases for the **R-ISS** at diagnosis of newly
diagnosed multiple myeloma (NDMM). Cases cover R-ISS I, II, and III plus the
two well-known corner cases: ISS III with standard cytogenetics and normal LDH
(downgrades to R-ISS II), and ISS I with adverse features (upgrades to R-ISS
II). All patients, demographics, and lab values are illustrative.

---

## Test case 1 — R-ISS I, Favorable

### Vignette
**Catherine Aldridge**, a 61-year-old woman with newly diagnosed IgG-κ multiple
myeloma presenting with fatigue and a single lytic vertebral lesion. CD138-
sorted iFISH is negative for del(17p), t(4;14), and t(14;16); LDH is within
normal limits.

### Inputs

| Field | Value |
|---|---|
| Serum β2-microglobulin | 2.6 mg/L |
| Serum albumin | 4.1 g/dL |
| iFISH high-risk CA | absent |
| Serum LDH | normal (≤ ULN) |

### Derivation

- **ISS step:** β2M = 2.6 (< 3.5) **AND** albumin = 4.1 (≥ 3.5) → **ISS I**
- **R-ISS rule:** ISS I AND standard-risk CA AND normal LDH → **R-ISS I**

**Expected output**

| Field | Value |
|---|---|
| iss_stage | I |
| r_iss_stage | **I** |
| 5-yr OS | 82% |
| 5-yr PFS | 55% |
| Median OS | not reached |
| Median PFS | 66 months |
| Interpretation | Favorable prognosis |

---

## Test case 2 — R-ISS II via ISS I corner case (high-risk CA upgrades)

### Vignette
**Karim Haddad**, a 57-year-old man with NDMM with an excellent biochemical
profile but adverse cytogenetics: CD138-sorted iFISH shows t(4;14). LDH is
normal.

### Inputs

| Field | Value |
|---|---|
| Serum β2-microglobulin | 2.9 mg/L |
| Serum albumin | 3.9 g/dL |
| iFISH high-risk CA | present (t(4;14)) |
| Serum LDH | normal |

### Derivation

- **ISS step:** β2M = 2.9 (< 3.5) AND albumin = 3.9 (≥ 3.5) → **ISS I**
- **R-ISS rule:** ISS I AND high-risk CA present (does not meet R-ISS I requirement of standard-risk CA AND normal LDH; does not meet R-ISS III requirement of ISS III) → **R-ISS II**

**Expected output**

| Field | Value |
|---|---|
| iss_stage | I |
| r_iss_stage | **II** |
| 5-yr OS | 62% |
| 5-yr PFS | 36% |
| Median OS | 83 months |
| Median PFS | 42 months |
| Interpretation | Intermediate prognosis (heterogeneous group) |

---

## Test case 3 — R-ISS II from ISS II baseline (mid-range, typical case)

### Vignette
**Marie-Claire Lambert**, a 68-year-old woman with NDMM presenting with
fatigue and renal impairment (creatinine 1.4 mg/dL). β2M is intermediate at
4.1 mg/L; albumin 3.7 g/dL; iFISH is standard-risk; LDH is mildly elevated.

### Inputs

| Field | Value |
|---|---|
| Serum β2-microglobulin | 4.1 mg/L |
| Serum albumin | 3.7 g/dL |
| iFISH high-risk CA | absent |
| Serum LDH | elevated (> ULN) |

### Derivation

- **ISS step:** β2M = 4.1 (not < 3.5 and not ≥ 5.5) → **ISS II** (neither I nor III)
- **R-ISS rule:** ISS II → falls in default → **R-ISS II**

**Expected output**

| Field | Value |
|---|---|
| iss_stage | II |
| r_iss_stage | **II** |
| 5-yr OS | 62% |
| 5-yr PFS | 36% |
| Median OS | 83 months |
| Median PFS | 42 months |
| Interpretation | Intermediate prognosis |

---

## Test case 4 — R-ISS II via ISS III corner case (downgrade)

### Vignette
**George Whitfield**, a 73-year-old man with NDMM, advanced disease with
β2M 6.4 mg/L (renal involvement contributing) and albumin 2.9 g/dL. CD138-
sorted iFISH is **standard-risk** (no del(17p), no t(4;14), no t(14;16));
serum LDH is **normal**.

### Inputs

| Field | Value |
|---|---|
| Serum β2-microglobulin | 6.4 mg/L |
| Serum albumin | 2.9 g/dL |
| iFISH high-risk CA | absent |
| Serum LDH | normal |

### Derivation

- **ISS step:** β2M ≥ 5.5 → **ISS III**
- **R-ISS rule:** ISS III but **without** any of high-risk CA OR elevated LDH → does not meet R-ISS III criteria → **R-ISS II** (the documented downgrade corner case)

**Expected output**

| Field | Value |
|---|---|
| iss_stage | III |
| r_iss_stage | **II** |
| 5-yr OS | 62% |
| 5-yr PFS | 36% |
| Median OS | 83 months |
| Median PFS | 42 months |
| Interpretation | Intermediate prognosis (corner case: ISS III with standard cytogenetics and normal LDH downgrades to R-ISS II per spec §3.2) |

---

## Test case 5 — R-ISS III, Poor prognosis (high-risk edge case)

### Vignette
**Anita Kowal**, a 65-year-old woman with NDMM and aggressive presentation:
hypercalcemia, anemia, multiple lytic lesions, and acute kidney injury. β2M
is 9.8 mg/L, albumin 2.4 g/dL; CD138-sorted iFISH shows del(17p); serum LDH
is elevated (1.6× ULN).

### Inputs

| Field | Value |
|---|---|
| Serum β2-microglobulin | 9.8 mg/L |
| Serum albumin | 2.4 g/dL |
| iFISH high-risk CA | present (del(17p)) |
| Serum LDH | elevated (> ULN) |

### Derivation

- **ISS step:** β2M ≥ 5.5 → **ISS III**
- **R-ISS rule:** ISS III AND (high-risk CA OR elevated LDH) — both conditions present → **R-ISS III**

**Expected output**

| Field | Value |
|---|---|
| iss_stage | III |
| r_iss_stage | **III** |
| 5-yr OS | 40% |
| 5-yr PFS | 24% |
| Median OS | 43 months |
| Median PFS | 29 months |
| Interpretation | Poor prognosis; high-risk biology — consider clinical trial enrollment and intensified strategies per current guidelines |
