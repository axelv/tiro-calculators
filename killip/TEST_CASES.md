# Killip Classification — Fictional Test Cases

Five fictional clinical vignettes exercising the Killip classification (`I` / `II` / `III` / `IV`). The single input field per `SPEC.md` is `killip_class`; the calculator returns the class plus its associated 30-day mortality (Khot et al. 2003 modern figures, with the original 1967 Killip & Kimball figures for context).

Class criteria (recap from §2 of SPEC):

- **I** — No HF signs (no rales, no S3, no elevated JVP).
- **II** — S3 and/or rales over <50% of lung fields, ± elevated JVP.
- **III** — Pulmonary oedema, rales over >50% of lung fields.
- **IV** — Cardiogenic shock: SBP < 90 mmHg **and** signs of peripheral hypoperfusion (oliguria, cyanosis, cool/clammy extremities, altered mentation).

Highest applicable class wins.

---

## Test case 1 — Killip Class I (low risk)

**Vignette.** Mr. Stefan Kovács, a 54-year-old construction-site supervisor, presents 90 minutes after the onset of crushing retrosternal chest pain. ECG shows 3-mm ST-elevation in leads II, III, aVF (inferior STEMI). On admission: BP 138/82 mmHg, HR 78, RR 16, SpO₂ 98% room air. Chest is clear bilaterally, no S3, JVP is not elevated, extremities warm and well-perfused. Troponin elevated; emergent PCI follows.

**Input.** `killip_class` = **I**.

**Class assignment.** No rales, no S3, no elevated JVP → Class I.

**Expected output.**

```json
{
  "killip_class": "I",
  "mortality_30d_modern_pct": 2.8,
  "mortality_6m_modern_pct": 5.0,
  "mortality_inhospital_original_pct": 6,
  "interpretation": "No clinical signs of heart failure; lowest mortality stratum."
}
```

---

## Test case 2 — Killip Class II (S3 only)

**Vignette.** Mrs. Yolanda Meijer, a 68-year-old retired schoolteacher, arrives with 4 hours of substernal chest pressure and mild dyspnoea. ECG shows ST-depression and T-wave inversion in V4–V6 (NSTEMI). BP 152/86 mmHg, HR 92. On auscultation: clear lung fields bilaterally, but a soft **S3 gallop** is heard at the apex. JVP at 3 cm above the sternal angle. Extremities warm.

**Input.** `killip_class` = **II**.

**Class assignment.** S3 present (rales <50% would also qualify) → Class II by SPEC §2 criteria. Highest-class-wins logic does not push to III (no rales) or IV (no shock).

**Expected output.**

```json
{
  "killip_class": "II",
  "mortality_30d_modern_pct": 8.8,
  "mortality_6m_modern_pct": 14.7,
  "mortality_inhospital_original_pct": 17,
  "interpretation": "Mild–moderate left-ventricular failure; ~3× the Class I mortality."
}
```

---

## Test case 3 — Killip Class II (rales <50% of lung fields)

**Vignette.** Mr. Olu Adebayo, a 62-year-old taxi driver, presents 5 hours into anterior STEMI symptoms. ECG: ST-elevation V1–V4. BP 128/76 mmHg, HR 96. He is mildly dyspnoeic. On exam: bibasilar fine crackles audible to roughly the lower third of each lung (well under 50% of the lung fields). No S3 audible above the rales; JVP slightly elevated at 4 cm. Extremities warm, capillary refill < 2 s.

**Input.** `killip_class` = **II**.

**Class assignment.** Rales present but limited to < 50% of lung fields → Class II (not III). No shock → not IV.

**Expected output.**

```json
{
  "killip_class": "II",
  "mortality_30d_modern_pct": 8.8,
  "mortality_6m_modern_pct": 14.7,
  "mortality_inhospital_original_pct": 17,
  "interpretation": "Mild–moderate left-ventricular failure; consider IV diuretic and close haemodynamic monitoring."
}
```

---

## Test case 4 — Killip Class III (acute pulmonary oedema)

**Vignette.** Mrs. Roxana Petrescu, a 75-year-old retired seamstress, is brought to the ED in respiratory distress. ECG shows extensive anterior STEMI. BP 142/88 mmHg (hypertensive on arrival), HR 118, RR 32, SpO₂ 84% on room air. She is using accessory muscles. Auscultation reveals **diffuse coarse crackles audible to the apices bilaterally** (clearly >50% of each lung field) with frothy pink sputum. JVP markedly elevated. Extremities warm but cyanotic at the lips.

**Input.** `killip_class` = **III**.

**Class assignment.** Frank pulmonary oedema with rales >50% of lung fields → Class III. BP is preserved (no hypotension), so not IV.

**Expected output.**

```json
{
  "killip_class": "III",
  "mortality_30d_modern_pct": 14.4,
  "mortality_6m_modern_pct": 23.0,
  "mortality_inhospital_original_pct": 38,
  "note": "Khot et al. 2003 reports Class III/IV combined; Class IV alone in modern STEMI cohorts is substantially higher (~50–60%).",
  "interpretation": "Acute pulmonary oedema; urgent reperfusion, NIV, IV diuretic, vasodilator therapy."
}
```

---

## Test case 5 — Killip Class IV (cardiogenic shock — edge case, highest class)

**Vignette.** Mr. Geoffrey Lambert, an 82-year-old retired engineer, is rushed to the cath lab with anterior STEMI complicated by cardiogenic shock. On arrival: **BP 78/48 mmHg** despite IV fluids, HR 124, RR 30, SpO₂ 88% on 15 L oxygen. He is **drowsy and disoriented to time** (altered mentation). Skin is **cool, clammy, and mottled**. Urine output over the past hour is 10 mL (oliguria). Chest auscultation: rales to mid-zones bilaterally. Lactate 6.2 mmol/L.

**Input.** `killip_class` = **IV**.

**Class assignment.** SBP 78 mmHg (< 90) + signs of peripheral hypoperfusion (oliguria, cool/clammy/mottled extremities, altered mentation) → Class IV. Highest-class-wins logic supersedes the rales finding (which alone would have been Class III).

**Expected output.**

```json
{
  "killip_class": "IV",
  "mortality_30d_modern_pct": 14.4,
  "mortality_6m_modern_pct": 23.0,
  "mortality_inhospital_original_pct": 81,
  "note": "Khot et al. 2003 pools Class III and IV; the original 1967 cohort reports ~81% mortality for Class IV. Contemporary STEMI cohorts report ~50–60% in-hospital mortality for Class IV.",
  "interpretation": "Cardiogenic shock; emergent revascularisation, vasopressors / inotropes, mechanical circulatory support (IABP, Impella, ECMO) per local protocol."
}
```
