# Plan: Add "Education" and "Non-Profit" Industries

Status: **Planning only — no code changes made.**
Scope: `index.html` (single-file app). This document is the living record of
research and implementation planning for adding two new industry options to
the guided data-sensitivity/DLP assistant.

---

## 1. Code touch points (structural — required regardless of content)

All industry keys are wired through these locations in `index.html`. Every
new industry (`education`, `nonprofit`) must be added to each:

| # | Location | Line (approx) | What it does |
|---|----------|---------------|---------------|
| 1 | `<select id="industrySelect">` | ~2379-2387 | Dropdown options shown to user |
| 2 | `industryDisplayLabels` | ~4073-4080 | Human-readable label lookup |
| 3 | `contextMap` | ~3156-3187 | Per-industry `labels`, `exceptions` (indices), `industryName` |
| 4 | `industryDataTypes` | ~3215-3222 | Which data-type checkboxes are shown/pre-relevant per industry |
| 5 | `model.exceptions` | ~2860-2960 | Guidance cards filtered by an `industries` array per entry |
| 6 | `model.industryExamples` | ~2962-3151 | Per-industry scenario cards (largest content-authoring task) |
| 7 | `regulationDefs[].autoSuggest.industries` | ~3568-3875+ | Regulation auto-suggestion per industry |
| 8 | `getRelevantIndustries()` hardcoded array | ~4744 | `["healthcare","financial","legal","retail","manufacturing"]` — aggregate "cross-industry scenarios" view when no industry selected; easy to miss |
| 9 | `renderIndustries()` | ~5259-5288 | Rendering function consuming the above (no changes needed itself, just confirms wiring) |

**Not required:** SIT/DLP recommendation logic (`deriveContextualSitFamilies`,
`deriveRecommendedSits`) is driven by `state.context.dataTypes` /
`industryDataTypes` fallback, not hardcoded industry names. Export functions
(`exportWord`, `exportCSV`) use `state.context.industryLabel` generically.
No test suite exists in the repo.

---

## 2. Regulatory practices research

### 2.1 Pre-existing miscategorization (confirmed fix, any geography)

| Regulation | Current `autoSuggest.industries` | Fix |
|---|---|---|
| FERPA (`ferpa`) | `["other"]` | `["education"]` |
| COPPA (`coppa`) | `["retail", "other"]` | add `"education"` (children's data in ed-tech/K-12) |

Both already exist in `geographyRegulationRules["US"]`, so retagging is safe
and won't disappear when a geography filter is active.

### 2.2 New regulation entries needed — US only

The US is the only researched geography with dedicated **sector-specific**
statutes for education/nonprofit layered on top of general privacy law.
Proposed new `regulationDefs` entries:

| Proposed key | Label | `autoSuggest.industries` | `autoSuggest.dataTypes` | Geography wiring |
|---|---|---|---|---|
| `state_student_privacy_us` | State Student Data Privacy Laws (US) | `["education"]` | `["personal_ids","employee_hr"]` | Add to `geographyRegulationRules["US"]` |
| `charitable_solicitation_us` | Charitable Solicitation Registration (US) | `["nonprofit"]` | `["personal_ids"]` (donor PII) | Add to `geographyRegulationRules["US"]` |

**Why aggregated, not state-by-state:** ~150 state student-privacy laws exist
across 47 states (SOPPA/IL, SOPIPA/CA, NY Ed Law §2-d, CT PA 16-189, CO
SDTSA, etc.); charitable solicitation registration applies in ~40 states +
DC. Modeling each state individually doesn't match the app's existing
pattern (`state_privacy_us` is already a single aggregate entry for the
~20-state comprehensive-privacy-law patchwork) — one aggregate entry per
topic is consistent and maintainable.

**Explicitly out of scope:** IRS Form 990 public-disclosure requirement —
tax-disclosure, not a data-sensitivity/DLP concern. Flagged for awareness,
not proposed as a regulationDef.

### 2.3 Other geographies researched — no new regulation entries needed

| Geography | Findings | Action |
|---|---|---|
| EU / EEA | GDPR applies to education and nonprofits/NGOs with **no sectoral exemption**. Sector nuance (DPO requirement for schools, children's consent age 13-16 depending on member state, special-category data for health/ethnicity) is guidance-level, not a distinct law. `gdpr` already `industries: null` (cross-cutting) — correctly inherited once industry keys exist. | No new regulationDef. Consider industry-specific `regulationNotes`/exception content only. |
| UK | UK GDPR + Data Protection Act 2018 — same pattern as EU. Charities/education nonprofits get ICO sector guidance, not a separate statute. `uk_gdpr` already `industries: null`. | No new regulationDef. |
| Canada | PIPEDA (federal) + provincial acts; no education/nonprofit-specific federal statute found — provincial school-specific privacy rules exist but are guidance/administrative, not modeled elsewhere in this app at the provincial level. `pipeda` already `industries: null`. | No new regulationDef. |
| Australia | Privacy Act 1988 / Australian Privacy Principles apply to education and (turnover-threshold-dependent) nonprofits; no separate children's-data statute (guidance-based best-interests test instead). `privacy_act_au` already `industries: null`. | No new regulationDef. |
| APAC (broader), Latin America, Middle East/Africa | **Not yet researched in depth for education/nonprofit sector-specific statutes.** General cross-cutting laws already present (DPDP, PDPA variants, LGPD, POPIA, PDPL variants) are `industries: null` where applicable — same "cross-cutting, no sectoral exemption" pattern is likely but not yet confirmed per-country. | Pending — see Open Questions below. |

### 2.4 Geography-regulation wiring caveat (mechanism, not new content)

`deriveRegulatoryConstraints()` only surfaces a regulation when a geography
filter is active AND the regulation's key is listed in
`geographyRegulationRules[<selected geography>]` — industry match alone is
insufficient once a geography is selected. Any new regulationDef (or a
retagged FERPA) must be added to the relevant geography array or it will
silently disappear when a user narrows by region/country.

---

## 3. Content-authoring tasks (large, not yet scoped in detail)

- `model.industryExamples.education` / `.nonprofit` — scenario cards (biggest lift)
- `model.exceptions` — review existing entries' `industries` arrays for whether education/nonprofit should be added, and whether new exception entries are needed (e.g., research-data exceptions for universities, grant-restricted-data exceptions for nonprofits)
- `industryDataTypes.education` / `.nonprofit` — which data-type checkboxes are relevant (e.g., student records, donor/gift data, grant financials)

---

## 4. Open questions (unresolved, pending further research)

1. **APAC, Latin America, Middle East/Africa**: do any countries have
   education- or nonprofit-specific statutes (vs. general cross-cutting
   privacy law with no sectoral exemption)? Not yet confirmed.
2. Does Non-Profit need any regulation entry beyond charitable solicitation
   registration + inherited cross-cutting laws, or are there
   nonprofit-specific data-handling rules elsewhere (e.g., grant-funder
   data-sharing requirements, UBIT) worth modeling?
3. Should IRS Form 990 disclosure be included as a lightweight
   `model.exceptions` entry (not a full regulationDef) given it's
   disclosure-adjacent but not really a DLP/sensitivity concern?

---

## 5. Documentation updates required at implementation time

- `README.md` — check lines ~15, 40, 62 for any explicit industry enumeration to update (currently believed generic, but re-verify before implementation)
- `CHANGELOG.md` — new version entry per repo's existing format (e.g., `## vX.Y.Z — YYYY-MM-DD`)

---

*Last updated: 2026-09-01. This document will be updated as research continues — do not treat as final until the Open Questions section is empty.*
