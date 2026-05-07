# T-MACS — Test Cases

Five fictional clinical test cases for the T-MACS decision aid (Body 2017).

Logistic model:
`p = 1 / (1 + exp(−(−4.766 + 1.713·E + 0.847·A + 0.607·R + 1.417·V + 2.058·S + 1.208·H + 0.089·T)))`

Risk bands: `p < 0.02` very low (rule out) · `0.02–0.05` low · `0.05–0.95`
moderate · `p ≥ 0.95` high (rule in).

Inputs use `T` = hs-cTnT (Roche Elecsys 5th-gen, ng/L) and binary flags
`E, A, R, V, S, H` as defined in SPEC.md.

---

## Test case 1 — Very low risk (rule out)

**Vignette.** Jana Bekker, 28-year-old woman, no cardiac history, presents
with sharp left-sided chest pain reproducible on palpation. ECG normal,
no diaphoresis, no vomiting, no radiation, no crescendo angina, BP 124/78,
hs-cTnT 3 ng/L.

**Inputs:**

| Symbol | Value |
|---|---|
| `T` | 3 ng/L |
| `E` | 0 |
| `A` | 0 |
| `R` | 0 |
| `V` | 0 |
| `S` | 0 |
| `H` | 0 |

**Calculation:**

```
linear = -4.766 + 0 + 0 + 0 + 0 + 0 + 0 + 0.089 × 3
       = -4.766 + 0.267
       = -4.499
p      = 1 / (1 + exp(4.499))
       = 1 / (1 + 89.94)
       ≈ 0.01099
```

**Expected output:**
- `p` ≈ **0.011 (1.1 %)**
- Risk band: **Very low — ACS effectively ruled out.**
- Disposition: discharge from ED after this single blood test is reasonable,
  pending clinical judgement.

---

## Test case 2 — Low risk

**Vignette.** Adrian Costa, 56-year-old man with treated hypertension,
reports two hours of mild central chest discomfort with no radiation, no
vomiting, no diaphoresis. ECG non-ischaemic, BP 138/82, hs-cTnT 8 ng/L. He
notes his chronic stable angina has not changed.

**Inputs:**

| Symbol | Value |
|---|---|
| `T` | 8 ng/L |
| `E` | 0 |
| `A` | 0 |
| `R` | 0 |
| `V` | 0 |
| `S` | 0 |
| `H` | 0 |

**Calculation:**

```
linear = -4.766 + 0.089 × 8
       = -4.766 + 0.712
       = -4.054
p      = 1 / (1 + exp(4.054))
       = 1 / (1 + 57.66)
       ≈ 0.01704
```

**Expected output:**
- `p` ≈ **0.017 (1.7 %)** — borderline very-low/low; sits just below 0.02.
- Risk band: **Very low — ACS effectively ruled out** (p < 0.02).
- Disposition: consider discharge after a single blood test, with
  safety-netting as per local pathway. (Had hs-cTnT been 9 ng/L, p would
  cross into the 0.02–0.05 low-risk band, requiring serial troponin in a
  low-dependency area.)

---

## Test case 3 — Moderate risk (observation zone)

**Vignette.** Robert Kingsley, 64-year-old man with type 2 diabetes and a
20-pack-year smoking history. Presents with three hours of central chest
pressure radiating to the right shoulder; the pattern is more frequent and
less exertional than usual (crescendo). No vomiting, no diaphoresis, BP
135/86, ECG with non-specific T-wave flattening (clinician judges no clear
ischaemia), hs-cTnT 18 ng/L.

**Inputs:**

| Symbol | Value |
|---|---|
| `T` | 18 ng/L |
| `E` | 0 |
| `A` | 1 |
| `R` | 1 |
| `V` | 0 |
| `S` | 0 |
| `H` | 0 |

**Calculation:**

```
linear = -4.766 + 0.847 × 1 + 0.607 × 1 + 0.089 × 18
       = -4.766 + 0.847 + 0.607 + 1.602
       = -1.710
p      = 1 / (1 + exp(1.710))
       = 1 / (1 + 5.529)
       ≈ 0.15316
```

**Expected output:**
- `p` ≈ **0.153 (15.3 %)**
- Risk band: **Moderate — observational zone.**
- Disposition: ongoing investigation with serial troponin sampling on a
  general / acute medical ward.

---

## Test case 4 — High risk (rule in)

**Vignette.** Margaret O'Sullivan, 78-year-old woman with prior MI, presents
with one hour of severe central chest pain, vomited twice, observed
profusely diaphoretic, BP 92/58 (SBP < 100), pain radiates to right
shoulder, ECG shows new lateral ST depression (clinician calls ischaemic),
hs-cTnT 95 ng/L. Symptoms are crescendo over the past 48 h.

**Inputs:**

| Symbol | Value |
|---|---|
| `T` | 95 ng/L |
| `E` | 1 |
| `A` | 1 |
| `R` | 1 |
| `V` | 1 |
| `S` | 1 |
| `H` | 1 |

**Calculation:**

```
linear = -4.766
       + 1.713 × 1   (E)
       + 0.847 × 1   (A)
       + 0.607 × 1   (R)
       + 1.417 × 1   (V)
       + 2.058 × 1   (S)
       + 1.208 × 1   (H)
       + 0.089 × 95  (T)
       = -4.766 + 1.713 + 0.847 + 0.607 + 1.417 + 2.058 + 1.208 + 8.455
       = 11.539
p      = 1 / (1 + exp(-11.539))
       ≈ 1 / (1 + 9.74e-6)
       ≈ 0.99999
```

**Expected output:**
- `p` ≈ **>0.999 (effectively 100 %)**
- Risk band: **High — ACS effectively ruled in.**
- Disposition: immediate referral for cardiology assessment / treatment per
  local ACS pathway.

---

## Test case 5 — Edge case: all features absent except very high troponin

**Vignette.** Pieter Aldenberg, 71-year-old man, found by his daughter to
have been "off" for several hours; no chest pain reported (silent
presentation). ECG non-ischaemic per clinician, no diaphoresis observed,
no vomiting, no pain radiation, no crescendo angina, BP 132/78. hs-cTnT
returns markedly elevated at 250 ng/L.

**Inputs:**

| Symbol | Value |
|---|---|
| `T` | 250 ng/L |
| `E` | 0 |
| `A` | 0 |
| `R` | 0 |
| `V` | 0 |
| `S` | 0 |
| `H` | 0 |

**Calculation:**

```
linear = -4.766 + 0.089 × 250
       = -4.766 + 22.250
       = 17.484
p      = 1 / (1 + exp(-17.484))
       ≈ 1 / (1 + 2.55e-8)
       ≈ 0.99999997
```

**Expected output:**
- `p` ≈ **>0.99999 (effectively 100 %)**
- Risk band: **High — ACS effectively ruled in.**
- Disposition: cardiology referral. Demonstrates that troponin alone, when
  markedly elevated, drives the score above the 0.95 rule-in threshold even
  when none of the six binary clinical features are present. Note the
  positive predictive value at this band is ~84 % in validation; alternative
  causes of troponin elevation (myocarditis, PE, sepsis, severe CKD) should
  still be considered alongside the high T-MACS probability.
