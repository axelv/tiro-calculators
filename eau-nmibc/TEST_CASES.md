# EAU NMIBC Risk Calculator — Test Cases

Five fictional clinical test cases for the EAU 2021 NMIBC risk-group classifier (Sylvester et al., *Eur Urol* 2021;79(4):480–488). Risk-group rules apply per SPEC §3, progression risks per §4.1 / §4.2, and treatment recommendations per §4.3.

ARF count: `(age>70) + (multiple) + (≥3cm) + (recurrent)` — integer in [0, 4]. Stage, grade, and CIS are evaluated separately by rule.

---

## Test case 1 — Low risk (WHO 2004/2016)

**Vignette.** Mr. Stefan Bauer, a 62-year-old finance manager, undergoes TURBT for an incidentally found 1.4 cm solitary primary papillary bladder lesion. Pathology: Ta low-grade urothelial carcinoma; no concomitant CIS on random biopsies.

**Inputs**

| Field | Value |
|---|---|
| `age` | ≤70 |
| `tumor_status` | Primary |
| `number_of_tumors` | Single |
| `max_diameter` | <3 cm |
| `stage` | Ta |
| `cis` | No |
| `classification` | WHO 2004/2016 |
| `grade_who_2004` | LG |

**ARF count**

```
ARF = 0 (age≤70) + 0 (single) + 0 (<3cm) + 0 (primary) = 0
```

**Rule trace**

- Rule 1 fires: `Ta` AND `LG` AND `CIS = No` AND `ARF_count = 0` → **Low**.

**Expected outcome**

- Risk class: **Low**
- 1-year progression: **0.06 %**
- 5-year progression: **0.93 %**
- 10-year progression: **3.7 %**
- Treatment recommendation: **one immediate post-TURBT instillation of intravesical chemotherapy**; no further adjuvant therapy required.

---

## Test case 2 — Intermediate risk (WHO 2004/2016)

**Vignette.** Mrs. Greta Lindqvist, a 74-year-old retired translator, is found to have two synchronous papillary bladder lesions (largest 1.8 cm) at her first cystoscopy. TURBT shows Ta low-grade urothelial carcinoma; no CIS.

**Inputs**

| Field | Value |
|---|---|
| `age` | >70 |
| `tumor_status` | Primary |
| `number_of_tumors` | Multiple |
| `max_diameter` | <3 cm |
| `stage` | Ta |
| `cis` | No |
| `classification` | WHO 2004/2016 |
| `grade_who_2004` | LG |

**ARF count**

```
ARF = 1 (age>70) + 1 (multiple) + 0 (<3cm) + 0 (primary) = 2
```

**Rule trace**

- Rule 1 fails (ARF ≠ 0).
- Rule 2 fires: `Ta` AND `LG` AND `CIS = No` AND `ARF_count ∈ {1, 2}` → **Intermediate**.

**Expected outcome**

- Risk class: **Intermediate**
- 1-year progression: **1.0 %**
- 5-year progression: **4.9 %**
- 10-year progression: **8.5 %**
- Treatment recommendation: **intravesical chemotherapy** (schedule not standardized) **OR** 1-year full-dose **BCG** induction + maintenance at 3, 6, 12 months.

---

## Test case 3 — High risk (WHO 2004/2016)

**Vignette.** Mr. Dimitri Kowalski, a 67-year-old former smoker, presents with painless macroscopic hematuria. Cystoscopy shows a single 4.5 cm sessile bladder tumor; TURBT pathology returns T1 high-grade urothelial carcinoma. Random biopsies are negative for CIS.

**Inputs**

| Field | Value |
|---|---|
| `age` | ≤70 |
| `tumor_status` | Primary |
| `number_of_tumors` | Single |
| `max_diameter` | ≥3 cm |
| `stage` | T1 |
| `cis` | No |
| `classification` | WHO 2004/2016 |
| `grade_who_2004` | HG |

**ARF count**

```
ARF = 0 (age≤70) + 0 (single) + 1 (≥3cm) + 0 (primary) = 1
```

**Rule trace**

- Very-High rules: T1 + HG + no CIS, but ARF = 1 (not 4) → no match.
- Rule 8 fires: `T1` AND `HG` AND `CIS = No` → **High**.

**Expected outcome**

- Risk class: **High**
- 1-year progression: **3.5 %**
- 5-year progression: **9.6 %**
- 10-year progression: **14 %**
- Treatment recommendation: **full-dose BCG for 1–3 years** (induction + maintenance at 3, 6, 12, 18, 24, 30, 36 months); **discuss radical cystectomy** as an alternative.

---

## Test case 4 — Very High risk (WHO 2004/2016)

**Vignette.** Mr. Hervé Dubois, a 78-year-old retired chef with a history of two prior NMIBC recurrences over the past 6 years, presents with a recurrent 3.5 cm solitary bladder tumor. TURBT pathology: T1 high-grade urothelial carcinoma; concomitant CIS confirmed on selected-site mapping biopsies.

**Inputs**

| Field | Value |
|---|---|
| `age` | >70 |
| `tumor_status` | Recurrent |
| `number_of_tumors` | Single |
| `max_diameter` | ≥3 cm |
| `stage` | T1 |
| `cis` | Yes |
| `classification` | WHO 2004/2016 |
| `grade_who_2004` | HG |

**ARF count**

```
ARF = 1 (age>70) + 0 (single) + 1 (≥3cm) + 1 (recurrent) = 3
```

**Rule trace**

- Very-High rule: `T1` AND `HG` AND `CIS = Yes` AND `ARF ≥ 1` → **Very High** (rule 10 in §3.1).

**Expected outcome**

- Risk class: **Very High**
- 1-year progression: **16 %**
- 5-year progression: **40 %**
- 10-year progression: **53 %**
- Treatment recommendation: **radical cystectomy is preferred**; full-dose BCG for 1–3 years offered to patients who decline or are unfit for cystectomy. Mandatory discussion of variant histology, prostatic urethra CIS, and lympho-vascular invasion.

---

## Test case 5 — Edge case: Maximum ARF count Ta HG (WHO 1973 path: T1G3 + 4 ARFs)

**Vignette.** Mr. Augusto Silvestri, a 79-year-old retired bricklayer with a long history of NMIBC and frequent recurrences, undergoes another TURBT showing three separate bladder tumors, the largest 4.2 cm. Pathology returns T1 G3 urothelial carcinoma per the WHO 1973 system; random biopsies are negative for CIS. The clinician requests scoring under WHO 1973 only.

**Inputs**

| Field | Value |
|---|---|
| `age` | >70 |
| `tumor_status` | Recurrent |
| `number_of_tumors` | Multiple |
| `max_diameter` | ≥3 cm |
| `stage` | T1 |
| `cis` | No |
| `classification` | WHO 1973 |
| `grade_who_1973` | G3 |

**ARF count**

```
ARF = 1 (age>70) + 1 (multiple) + 1 (≥3cm) + 1 (recurrent) = 4   ← maximum
```

**Rule trace (WHO 1973, §3.2)**

- Very-High first: `T1` AND `G3` AND `CIS = No` AND `ARF ≥ 3` → matches → **Very High** (per rule 15).

**Expected outcome**

- Risk class: **Very High**
- 1-year progression: **20 %**
- 5-year progression: **44 %**
- 10-year progression: **59 %**
- Treatment recommendation: **radical cystectomy is preferred**; full-dose BCG for 1–3 years offered if cystectomy declined or unfit. Discuss variant histology, prostatic urethra CIS, and LVI.
- Edge-case note: this case has the **maximum ARF count = 4** with T1 G3, demonstrating the WHO-1973 Very-High pathway without CIS.
