# MAGGIC — implementer notes

## Type
Hybrid lookup-driven integer score (closest to Type 3 — discrete logic — because age and SBP point assignments are stratified by EF band, not a single weight column). All variables and the `calculatedExpression` live on each output item, per CONVENTIONS.

## Inputs (13)
`age`, `sex`, `bmi`, `systolic_bp`, `ejection_fraction`, `nyha_class`, `creatinine` (µmol/L), `current_smoker`, `diabetes`, `copd`, `hf_diagnosed_gt_18mo`, `beta_blocker`, `acei_arb`.

Numeric inputs are `decimal` (per CONVENTIONS — `integer` is silently dropped by the SDK), even where SPEC §2 lists "integer" as the conceptual type.

## Outputs (2)
- `total_points` (decimal) — integer point sum, range 0 to ~56 (test case 5 produces 56, beyond SPEC's nominal 0–50 ceiling).
- `risk_band` (string) — 6-band stratification per FHIRPATH.md (`low`, `low-intermediate`, `intermediate`, `intermediate-high`, `high`, `very-high`) using the cut-points 16/20/24/28/32 derived from Pocock 2013's risk-group bands.

## Deviations from SPEC

### Mortality outputs (`mortality_1yr`, `mortality_3yr`, `survival_1yr`, `survival_3yr`) are **not implemented**

SPEC §3.9 explicitly lists the per-integer score → 1-year and 3-year mortality lookup table for scores 1–49 as **TBD**. Only the two anchor values (score 0 → 1.5 % / 3.9 %; score 50 → 84.2 % / 98.5 %) are authoritative in the SPEC. The SPEC further warns: *"Do not fit a curve to the two anchor points — the published mapping is non-linear ... any synthesised curve would diverge from the reference implementation."*

CONVENTIONS forbids inventing values. The TEST_CASES.md indicative mortality figures (e.g. score 13 ≈ 8.5 % / 20 %) are themselves explicitly labelled "interpolated" and are not authoritative substitutes for Pocock 2013 Appendix S1.

To complete the mortality outputs, a future implementer should:
1. Digitise the 49 missing integer rows from Pocock SJ et al., *Eur Heart J* 2013;34(19):1404–1413, **Appendix S1** (`doi:10.1093/eurheartj/ehs337`), or
2. Cache the responses from <http://heartfailurerisk.org/> for each integer score 1–49, or
3. Reuse the open-source MAGGIC R package's lookup table.

The FHIRPath `iif`-ladder skeletons in `FHIRPATH.md` show where the 49 values plug in.

## Risk-band cut-points

The 6-band ladder uses the inclusive upper-bounds 16/20/24/28/32 (per Pocock 2013 risk groups quoted in SPEC §3.9 resolution-attempted note). TEST_CASES uses 3-band qualitative labels ("low / intermediate / intermediate–high / high / very high") — these were translated to the 6-band canonical labels for assertions in the spec.

## Score clamp

SPEC §3.9 says scores above 50 sit at the published ceiling. Since no mortality output is produced, no clamp is wired into `total_points`; the raw integer sum is surfaced (test case 5 → 56) for transparency. A future mortality lookup must clamp `score > 50 → 50` before lookup.

## Test-case verification

All 5 TEST_CASES.md vignettes assert on `total_points` and `risk_band`, all pass.
