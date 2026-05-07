# CAR-HEMATOTOX Score — FHIRPath expressions

> Encodes the Rejeski 2021 per-item thresholds from SPEC §3.1 and the
> binary HT-low / HT-high classification from §4.1 (with the optional
> 3-tier split from §4.2) into FHIRPath. Expects pre-lymphodepletion lab
> values in the units defined in SPEC §2.

---

## Item linkIds (QuestionnaireResponse contract)

| linkId | type | required | source field in SPEC | notes |
|---|---|---|---|---|
| `platelet_x10e9_per_L` | decimal | yes | §2 Platelet count | Units ×10⁹/L (= ×10³/µL). Thresholds: `>175` → 0; `75–175` → 1; `<75` → 2. Boundary `==75` is 1, `==175` is 1 (per SPEC §3.1 implementation note). |
| `anc_per_uL` | decimal | yes | §2 ANC | Units cells/µL. `≥1200` → 0; `<1200` → 1. |
| `hemoglobin_g_dL` | decimal | yes | §2 Hemoglobin | Units g/dL. `≥9.0` → 0; `<9.0` → 1. |
| `crp_mg_dL` | decimal | yes | §2 CRP | Units mg/dL (divide EU mg/L values by 10). `<3.0` → 0; `≥3.0` → 1. |
| `ferritin_ng_mL` | decimal | yes | §2 Ferritin | Units ng/mL (= µg/L). `<650` → 0; `650–2000` → 1; `>2000` → 2. Boundary `==650` is 1, `==2000` is 1. |
| `score` | integer | computed | §3.2 sum | Range 0–7. |
| `category` | choice | computed | §4.1 | `HT-low` (0–1) \| `HT-high` (≥2). |
| `category_3tier` | choice | computed (optional) | §4.2 | `low` (0–1) \| `intermediate` (2–4) \| `high` (≥5). Use only if institutional protocol mandates it. |

---

## Variables

| name | expression |
|---|---|
| `plt` | `%resource.repeat(item).where(linkId='platelet_x10e9_per_L').answer.valueDecimal.first()` |
| `anc` | `%resource.repeat(item).where(linkId='anc_per_uL').answer.valueDecimal.first()` |
| `hgb` | `%resource.repeat(item).where(linkId='hemoglobin_g_dL').answer.valueDecimal.first()` |
| `crp` | `%resource.repeat(item).where(linkId='crp_mg_dL').answer.valueDecimal.first()` |
| `fer` | `%resource.repeat(item).where(linkId='ferritin_ng_mL').answer.valueDecimal.first()` |
| `pltPts` | `iif(%plt < 75, 2, iif(%plt <= 175, 1, 0))` |
| `ancPts` | `iif(%anc < 1200, 1, 0)` |
| `hgbPts` | `iif(%hgb < 9.0, 1, 0)` |
| `crpPts` | `iif(%crp >= 3.0, 1, 0)` |
| `ferPts` | `iif(%fer > 2000, 2, iif(%fer >= 650, 1, 0))` |

---

## Calculated expressions

### `score` (primary output, integer 0–7)

```fhirpath
%pltPts + %ancPts + %hgbPts + %crpPts + %ferPts
```

### `category` (binary, Rejeski 2021 primary classification)

```fhirpath
iif(%score <= 1, 'HT-low', 'HT-high')
```

### `category_3tier` (optional secondary classification)

```fhirpath
iif(%score <= 1, 'low',
  iif(%score <= 4, 'intermediate', 'high'))
```

---

## Worked example — test case 3 (HT 3, HT-high)

Inputs (Mrs Helena Marković, day −5 pre-lymphodepletion):

| linkId | value |
|---|---|
| `platelet_x10e9_per_L` | 110 |
| `anc_per_uL` | 950 |
| `hemoglobin_g_dL` | 10.1 |
| `crp_mg_dL` | 4.2 |
| `ferritin_ng_mL` | 540 |

Per-item points:

- `%pltPts = iif(110 < 75, 2, iif(110 <= 175, 1, 0)) = 1`
- `%ancPts = iif(950 < 1200, 1, 0) = 1`
- `%hgbPts = iif(10.1 < 9.0, 1, 0) = 0`
- `%crpPts = iif(4.2 >= 3.0, 1, 0) = 1`
- `%ferPts = iif(540 > 2000, 2, iif(540 >= 650, 1, 0)) = 0`

Total:

- `score = 1 + 1 + 0 + 1 + 0 = 3` ✓
- `category = iif(3 <= 1, 'HT-low', 'HT-high') = 'HT-high'` ✓
- `category_3tier = iif(3 <= 1, 'low', iif(3 <= 4, 'intermediate', 'high')) = 'intermediate'` ✓

Matches `TEST_CASES.md` §3 expected output.

---

## Notes

- Boundary semantics from SPEC §3.1 are preserved exactly:
  - Platelet exactly 75 → 1 point (handled by `%plt < 75` for the 2-pt tier).
  - Platelet exactly 175 → 1 point (handled by `%plt <= 175`).
  - Ferritin exactly 650 → 1 point (handled by `%fer >= 650`).
  - Ferritin exactly 2000 → 1 point (handled by `%fer > 2000` for the 2-pt tier).
- The optional 3-tier split (`category_3tier`) is **not** part of the
  Rejeski 2021 primary publication; it comes from secondary multiple-myeloma
  validations (SPEC §4.2). Default to the binary classification unless
  protocol-mandated.
- Predicted clinical outcomes from SPEC §4.3 (median neutropenia duration,
  thrombocytopenia/anemia rates, etc.) are descriptive narrative, not
  calculator outputs — encode as static `display` items keyed off `category`
  via SDC `enableWhen`, not as FHIRPath expressions.
- No TBD coefficients in the binary path. The 3-tier split is flagged
  `TBD — see Rejeski 2021` in SPEC §4.2; document as such if exposed.
- No CQL escalation needed.
