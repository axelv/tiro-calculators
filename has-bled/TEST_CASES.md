# HAS-BLED — Fictional Test Cases

Five fictional clinical vignettes for the HAS-BLED bleeding-risk score (Pisters
2010). Scoring uses the 9 binary subitems and bleeding-rate / interpretation
tables from `SPEC.md` §3 and §4.

All patients and details are fictional.

---

## Test case 1 — Score 0 (low risk)

**Vignette.** Anke De Smet, a 58-year-old woman with newly diagnosed paroxysmal
non-valvular AF and well-controlled hypertension, has a baseline DOAC review.
She is on apixaban; SBP today is 128 mmHg. Renal and liver function are
normal, no prior stroke or bleeding, no antiplatelet/NSAID use, social
drinker (≤ 3 units/week).

**Inputs**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled, SBP > 160) | false |
| `A` Abnormal renal function | false |
| `A` Abnormal liver function | false |
| `S` Stroke history | false |
| `B` Bleeding history / predisposition | false |
| `L` Labile INR | false (on DOAC) |
| `E` Elderly (> 65) | false |
| `D` Drugs predisposing to bleeding | false |
| `D` Alcohol (≥ 8 units/week) | false |

**Point breakdown:** all 0.

**Total HAS-BLED:** **0**

**Expected output**

- Score: 0
- Bleeds per 100 patient-years: ~1.13
- Risk category: **Low**
- Interpretation: anticoagulation generally favorable; routine monitoring.

---

## Test case 2 — Score 2 (moderate risk)

**Vignette.** Mr Wim Vermeulen, a 71-year-old man with permanent AF, is on
warfarin. His last 6 months of INR readings show TTR 48 % (multiple
out-of-range values). He has no stroke history, no liver/kidney problems,
and a normal blood count. He drinks 2 beers per evening (≈ 14/week) and
takes ibuprofen sporadically for back pain.

Wait — drinks 14/week ≥ 8, so alcohol is positive; ibuprofen counts as
NSAID, so drugs is positive. Let me re-tally and pick a cleaner moderate
case.

Revised vignette: Mr Wim Vermeulen, 71, on warfarin with TTR 48 %, no
stroke, no liver/kidney issues, no antiplatelets/NSAIDs, occasional wine
(≤ 4 units/week), SBP today 142 mmHg.

**Inputs**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled, SBP > 160) | false (142 ≤ 160) |
| `A` Abnormal renal function | false |
| `A` Abnormal liver function | false |
| `S` Stroke history | false |
| `B` Bleeding history / predisposition | false |
| `L` Labile INR | true (TTR 48 % on VKA) |
| `E` Elderly (> 65) | true (age 71) |
| `D` Drugs predisposing to bleeding | false |
| `D` Alcohol (≥ 8 units/week) | false |

**Point breakdown:** L=1, E=1; rest=0.

**Total HAS-BLED:** **2**

**Expected output**

- Score: 2
- Bleeds per 100 patient-years: ~1.88
- Risk category: **Moderate**
- Interpretation: anticoagulation generally favorable; address modifiable
  factors — improve TTR (review adherence, dietary vitamin K, drug
  interactions) or consider switching to a DOAC, which would zero out the
  L item.

---

## Test case 3 — Score 3 (high risk)

**Vignette.** Mrs Olga Petrov, a 78-year-old woman with non-valvular AF, prior
ischaemic stroke (3 years ago, residual mild aphasia), CKD with creatinine
220 µmol/L. She is on apixaban. SBP 144 mmHg today. Liver normal. No
NSAIDs or aspirin, light alcohol (≤ 2 units/week).

**Inputs**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled, SBP > 160) | false |
| `A` Abnormal renal function | true (creatinine 220 µmol/L ≥ 200) |
| `A` Abnormal liver function | false |
| `S` Stroke history | true |
| `B` Bleeding history / predisposition | false |
| `L` Labile INR | false (DOAC) |
| `E` Elderly (> 65) | true (78) |
| `D` Drugs predisposing to bleeding | false |
| `D` Alcohol (≥ 8 units/week) | false |

**Point breakdown:** A_renal=1, S=1, E=1; rest=0.

**Total HAS-BLED:** **3**

**Expected output**

- Score: 3
- Bleeds per 100 patient-years: ~3.74
- Risk category: **High**
- Interpretation: anticoagulation likely still indicated (high stroke risk);
  schedule frequent review (every ~4 weeks initially), aggressive BP
  control, careful renal-dose adjustment of DOAC, avoid NSAIDs.

---

## Test case 4 — Score 5 (high / very-high modifiable burden)

**Vignette.** Mr Jorge Almeida, a 73-year-old man with persistent AF on
warfarin, has poorly controlled hypertension (clinic SBP 172 mmHg today),
known cirrhosis with bilirubin 3.5× ULN and AST 4× ULN, prior GI bleed
1 year ago, TTR over the last 6 months 42 %, daily aspirin 80 mg
prescribed by his cardiologist after a recent PCI. He drinks ~ 3 beers
per night (≈ 21/week).

**Inputs**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled, SBP > 160) | true (172) |
| `A` Abnormal renal function | false (creatinine normal) |
| `A` Abnormal liver function | true (bilirubin 3.5× and AST 4×) |
| `S` Stroke history | false |
| `B` Bleeding history / predisposition | true (prior GI bleed) |
| `L` Labile INR | true (TTR 42 % on VKA) |
| `E` Elderly (> 65) | true (73) |
| `D` Drugs predisposing to bleeding | true (aspirin) |
| `D` Alcohol (≥ 8 units/week) | true (≈ 21/week) |

**Point breakdown:** H=1, A_liver=1, B=1, L=1, E=1, D_drugs=1, D_alcohol=1.

That sums to 7 — let me re-read the vignette. To target a score of 5, I
revise the vignette to drop two factors (no liver disease and no aspirin):

Revised vignette: Mr Jorge Almeida, 73, persistent AF on warfarin, clinic
SBP 172 mmHg, prior GI bleed 1 year ago, TTR 42 %, drinks ~ 21
units/week. Liver and kidneys normal. No antiplatelets or NSAIDs.

**Inputs (revised)**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled) | true (172) |
| `A` Abnormal renal function | false |
| `A` Abnormal liver function | false |
| `S` Stroke history | false |
| `B` Bleeding history / predisposition | true |
| `L` Labile INR | true |
| `E` Elderly (> 65) | true |
| `D` Drugs predisposing to bleeding | false |
| `D` Alcohol (≥ 8 units/week) | true |

**Total HAS-BLED:** 1 + 0 + 0 + 0 + 1 + 1 + 1 + 0 + 1 = **5**

**Expected output**

- Score: 5
- Bleeds per 100 patient-years: ~12.50
- Risk category: **High**
- Interpretation: high bleeding risk, but several **modifiable** drivers —
  treat hypertension to target, switch warfarin → DOAC (eliminates the L
  item and stabilises control), brief intervention for harmful alcohol use.
  Anticoagulation can still be appropriate if stroke risk is high; close
  follow-up mandatory.

---

## Test case 5 — Edge case: maximum score 9

**Vignette.** Mr Hideki Tanaka, an 84-year-old man with permanent AF on
warfarin, has clinic SBP 184 mmHg, ESRD on haemodialysis, decompensated
hepatitis-C cirrhosis (bilirubin 4× ULN, ALT 5× ULN), prior haemorrhagic
stroke 2 years ago, recurrent epistaxis with thrombocytopenia (platelets
65 × 10⁹/L), TTR 38 %. He takes daily aspirin 100 mg post-CABG and
admits to drinking a half-bottle of whisky most evenings (≈ 25 units/week).

**Inputs**

| Field | Value |
|---|---|
| `H` Hypertension (uncontrolled) | true (184) |
| `A` Abnormal renal function | true (haemodialysis) |
| `A` Abnormal liver function | true (cirrhosis + biochemistry) |
| `S` Stroke history | true |
| `B` Bleeding history / predisposition | true (epistaxis + thrombocytopenia) |
| `L` Labile INR | true (TTR 38 %, on VKA) |
| `E` Elderly (> 65) | true (84) |
| `D` Drugs predisposing to bleeding | true (aspirin) |
| `D` Alcohol (≥ 8 units/week) | true (≈ 25/week) |

**Total HAS-BLED:** 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 = **9** (maximum)

**Expected output**

- Score: 9
- Bleeds per 100 patient-years: data limited (very high; > 12.5 %)
- Risk category: **Very high**
- Interpretation: extreme bleeding risk. This is *not* an automatic
  contraindication, but mandates an explicit shared-decision conversation,
  aggressive correction of every modifiable factor (BP, switch off VKA or
  optimise it, stop aspirin if not strictly indicated, alcohol cessation
  support, transfusion strategy for thrombocytopenia), and consideration
  of left atrial appendage occlusion as an alternative to lifelong oral
  anticoagulation.

---

*Bleeding-rate and risk-band labels follow Pisters 2010 (Euro Heart Survey
AF) as reproduced in `SPEC.md` §4.2 / §4.3.*
