# Killip Classification — FHIRPath expressions

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `killip_class` | choice (coding) | yes | `killip_class` | Single-select; allowed answer codes: `I`, `II`, `III`, `IV`. Use answerOption with code values matching the SPEC enum verbatim. |

> Killip is a four-class categorical input. The clinician picks the highest applicable class at the bedside; the calculator does not perform any arithmetic or threshold logic. The SPEC's pseudocode (highest-class-wins evaluation over individual exam findings) is descriptive — it explains how a clinician arrives at the class — but the calculator input is the resolved class itself. Encode it as a single `choice` item; lookups for mortality figures are static maps over the chosen code.

## Variables

| name | expression |
|---|---|
| `killipClass` | `%resource.repeat(item).where(linkId='killip_class').answer.value.code` |

> `value` resolves to whichever `value[x]` is populated. For an `answerCoding`, `.code` reads the `Coding.code` field. If the form uses `answerString` (free-text enum), substitute `.answer.value` (no `.code`).

## Calculated expressions

### `killip_class` (primary output — pass-through)

```
%killipClass
```

### `mortality_30d_modern_pct` (Khot 2003)

```
iif(%killipClass = 'I',  2.8,
iif(%killipClass = 'II', 8.8,
iif(%killipClass = 'III', 14.4,
iif(%killipClass = 'IV',  14.4, {} ))))
```

> Khot et al. report Class III and IV as a combined stratum (14.4 %); both branches return the same value with a note in the UI/Composition that this is the combined III/IV figure.

### `mortality_6m_modern_pct` (Khot 2003)

```
iif(%killipClass = 'I',  5.0,
iif(%killipClass = 'II', 14.7,
iif(%killipClass = 'III', 23.0,
iif(%killipClass = 'IV',  23.0, {} ))))
```

### `mortality_inhospital_original_pct` (Killip & Kimball 1967)

```
iif(%killipClass = 'I',  6,
iif(%killipClass = 'II', 17,
iif(%killipClass = 'III', 38,
iif(%killipClass = 'IV',  81, {} ))))
```

### `interpretation` (display string)

```
iif(%killipClass = 'I',
  'No clinical signs of heart failure; lowest mortality stratum.',
iif(%killipClass = 'II',
  'Mild–moderate left-ventricular failure; ~3× the Class I mortality.',
iif(%killipClass = 'III',
  'Acute pulmonary oedema; urgent reperfusion, NIV, IV diuretic, vasodilator therapy.',
iif(%killipClass = 'IV',
  'Cardiogenic shock; emergent revascularisation, vasopressors / inotropes, mechanical circulatory support.',
  {} ))))
```

## Worked example — test case 1

Mr. Stefan Kovács, inferior STEMI, no rales, no S3, no elevated JVP → clinician picks Class I.

QuestionnaireResponse fragment:

```json
{
  "linkId": "killip_class",
  "answer": [{"valueCoding": {"code": "I"}}]
}
```

- `%killipClass` resolves to `'I'`
- `mortality_30d_modern_pct` → first `iif` matches → **2.8**
- `mortality_6m_modern_pct` → **5.0**
- `mortality_inhospital_original_pct` → **6**
- `interpretation` → "No clinical signs of heart failure; lowest mortality stratum."

Matches the SPEC test case 1 expected output exactly.

## Notes

- Killip is purely categorical — no FHIRPath arithmetic. The whole calculator is a 4-way `iif` ladder over a single choice.
- If the consuming form models the underlying physical-exam findings instead of the class itself (e.g. four boolean items: `hypotension_with_hypoperfusion`, `pulmonary_edema_or_rales_gt_50`, `s3_or_rales_lt_50_or_elevated_jvp`), the highest-class-wins logic in §3 of the SPEC translates directly to:
  ```
  iif(%hypotensionWithHypoperfusion, 'IV',
  iif(%pulmEdemaOrRalesGt50,         'III',
  iif(%s3OrRalesLt50OrElevatedJvp,   'II', 'I')))
  ```
  and feeds the same downstream `iif` ladders. Prefer the single-choice item when the SPEC's `killip_class` field is the source of truth (it is in §2 of this SPEC).
- Coding system: project convention (no formal LOINC/SNOMED code for Killip class). Use the SPEC's verbatim enum values (`I` / `II` / `III` / `IV`) as `Coding.code`.
- Class III and IV share the modern Khot-derived 30-day and 6-month figures (combined III/IV stratum). The original 1967 figures distinguish them. This is intentional per §4 of the SPEC.
