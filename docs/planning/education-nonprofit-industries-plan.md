# Plan: Add "Education" and "Non-Profit" Industries

Status: **Implemented in PR #7.**
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
| 3 | `contextMap` | ~3156-3187 | Per-industry `labels` and `industryName` used for label scope and display |
| 4 | `industryDataTypes` | ~3215-3222 | Which data-type checkboxes are shown/pre-relevant per industry |
| 5 | `model.exceptions` | ~2860-2960 | Guidance cards filtered by an `industries` array per entry |
| 6 | `model.industryExamples` | ~2962-3151 | Per-industry scenario cards (largest content-authoring task) |
| 7 | `regulationDefs[].autoSuggest.industries` | ~3568-3875+ | Regulation auto-suggestion per industry |
| 8 | `getRelevantIndustries()` hardcoded array | ~4744 | `["healthcare","financial","legal","retail","manufacturing","education","nonprofit"]` — aggregate "cross-industry scenarios" view when no industry selected; easy to miss |
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
| `state_student_privacy_us` | State Student Data Privacy Laws (US) | `["education"]` | `["personal_ids"]` | Add to `geographyRegulationRules["US"]` |
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
not proposed as a regulationDef (resolved in detail, §4.3).

**Caveat on `state_privacy_us` (existing entry, no change proposed):**
nonprofit *exemption* from state comprehensive privacy laws is
state-dependent, not uniform — e.g. California's CCPA broadly exempts
nonprofits, while Colorado and New Jersey regulate qualifying nonprofits the
same as for-profits above volume/revenue thresholds. `state_privacy_us` is
already `industries: null` and stays that way: the app models data-type/
industry sensitivity, not entity-type (nonprofit vs. for-profit) exemption
logic, and a nonprofit hospital is still "healthcare," not "nonprofit," for
this app's industry model. This nuance is better suited to a short
`model.exceptions`/guidance note than a new regulationDef or a tagging
change.

### 2.3 Other geographies researched — no new regulation entries needed

| Geography | Findings | Action |
|---|---|---|
| EU / EEA | GDPR applies to education and nonprofits/NGOs with **no sectoral exemption**. Sector nuance (DPO requirement for schools, children's consent age 13-16 depending on member state, special-category data for health/ethnicity) is guidance-level, not a distinct law. `gdpr` already `industries: null` (cross-cutting) — correctly inherited once industry keys exist. | No new regulationDef. Consider industry-specific `regulationNotes`/exception content only. |
| UK | UK GDPR + Data Protection Act 2018 — same pattern as EU. Charities/education nonprofits get ICO sector guidance, not a separate statute. `uk_gdpr` already `industries: null`. | No new regulationDef. |
| Canada | PIPEDA (federal) + provincial acts; no education/nonprofit-specific federal statute found — provincial school-specific privacy rules exist but are guidance/administrative, not modeled elsewhere in this app at the provincial level. `pipeda` already `industries: null`. | No new regulationDef. |
| Australia | Privacy Act 1988 / Australian Privacy Principles apply to education and (turnover-threshold-dependent) nonprofits; no separate children's-data statute (guidance-based best-interests test instead). `privacy_act_au` already `industries: null`. | No new regulationDef. |
| India | DPDPA — no standalone education law; schools/NGOs are "data fiduciaries" under the general act. Sectoral guidance (UGC/AICTE) exists but is administrative, not a distinct statute. `dpdp` already `industries: null`. | No new regulationDef. |
| Singapore | PDPA applies fully to schools and NGOs, no broad exemption; sector guidance only. `pdpa_sg` already `industries: null`. | No new regulationDef. |
| China | PIPL/CSL/DSL apply fully; strict minors'-data rules (parental consent under 14) but no separate education/nonprofit statute. `pipl_cn`/`dsl_cn`/`csl_cn`/`cac_transfer_cn` already `industries: null`. | No new regulationDef. |
| Japan | APPI applies with no sectoral exemption; ministry-level guidance for schools, not a distinct law. `appi_jp` and related Japan keys already `industries: null`. | No new regulationDef. |
| South Korea | PIPA applies fully; Ministry of Education guidance only. `pipa_kr` already `industries: null`. | No new regulationDef. |
| Brazil | LGPD applies to nonprofits/schools with no sector exemption; narrow exemptions only for purely non-economic, journalistic, artistic, or academic-research purposes (research still needs de-identification safeguards). `lgpd` already `industries: null`. | No new regulationDef. |
| Mexico | LFPDPPP applies to nonprofits/private schools with no sector exemption (only personal/family/domestic-use data is exempt). `lfpdppp_mx` already `industries: null`. | No new regulationDef. |
| South Africa | POPIA applies to nonprofits/schools with no sector exemption; de-identified research/education processing may qualify for lighter treatment, not a carve-out law. `popia_za` already `industries: null`. | No new regulationDef. |
| Taiwan | PDPA applies broadly to education/nonprofit; sectoral authorities (Ministry of Education) may issue additional rules but not exemptions. `pdpa_tw` already `industries: null`. | No new regulationDef. |
| New Zealand | Privacy Act 2020 applies to all "agencies" incl. schools/charities; sectoral codes of practice adjust *how* to comply, not exemptions. `nz_privacy` already `industries: null`. | No new regulationDef. |
| Thailand | PDPA applies; narrow exemptions exist for specific state/security functions, not education/nonprofit broadly. `pdpa_th` already `industries: null`. | No new regulationDef. |
| Indonesia | New PDP law covers all sectors incl. education/nonprofit, no exemption. `pdp_id` already `industries: null`. | No new regulationDef. |
| Philippines | Data Privacy Act (RA 10173) applies broadly; NPC may issue sector guidelines, not exemptions. `dpa_ph` already `industries: null`. | No new regulationDef. |
| Malaysia | PDPA covers commercial-sector processing incl. private schools/NGOs; excludes government processing only. `pdpa_my` already `industries: null`. | No new regulationDef. |
| Hong Kong | PDPO applies to all data users incl. education/charities; PCPD guidance notes, not exemptions. `pdpo_hk` already `industries: null`. | No new regulationDef. |
| Vietnam | New PDPL (2026) applies broadly, no education/nonprofit exemption. `pdpd_vn` already `industries: null`. | No new regulationDef. |
| Switzerland | FADP applies broadly; no sectoral exemption for education/nonprofit (narrow carve-out only for host-state-immune international orgs, e.g. ICRC/UN in Geneva — not a general nonprofit exemption). `fadp_ch` already `industries: null`. | No new regulationDef. |
| Argentina | Law 25.326 applies broadly, no education/nonprofit exemption. `lpdp_ar` already `industries: null`. | No new regulationDef. |
| Colombia | Law 1581 of 2012 applies broadly, no education/nonprofit exemption (sectoral guidance on student consent only). `law_1581_co` already `industries: null`. | No new regulationDef. |
| Chile | Law 19.628 applies broadly, no education/nonprofit exemption. `data_protection_cl` already `industries: null`. | No new regulationDef. |
| UAE, Saudi Arabia, Qatar, Bahrain, Oman | All have comprehensive PDPL-style laws; no blanket exemption for private schools/nonprofits (only government-entity and personal/family-use exemptions, which are generic carve-outs already implied by "no sectoral targeting" and not modeled per-industry elsewhere in this app). `pdpl_uae`, `pdpl_ksa`, `data_protection_qa`, `pdpl_bh`, `pdpl_om` already `industries: null`. | No new regulationDef. |
| Turkey | KVKK applies broadly, no education/nonprofit exemption. `kvkk_tr` already `industries: null`. | No new regulationDef. |
| Israel | Protection of Privacy Law 1981 applies broadly; narrow exceptions for religious/non-commercial processing exist but don't constitute a sector exemption. `privacy_il` already `industries: null`. | No new regulationDef. |

**Geography coverage is now exhaustive against every key in
`geographyRegulationRules`** (41 keys, cross-referencing to ~40 distinct
country/region entries after grouping duplicate rows like "APAC"/"APAC /
Oceania" and "Africa"/"South Africa"). Every single geography checked
resolves to the same conclusion: general-purpose, cross-cutting privacy laws
already tagged `industries: null` correctly cover education and nonprofit
once those industry keys exist — with the **sole exception of the US**,
which is the only jurisdiction layering dedicated sector statutes (FERPA,
COPPA, state student-privacy laws, charitable solicitation registration) on
top of its general law.

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
- `model.exceptions` — review existing entries' `industries` arrays for whether education/nonprofit should be added; add new entries for:
  - Research-data exceptions for universities
  - Grant-restricted-data handling for nonprofits (contractual, not statutory — guidance only)
  - Form 990 Schedule B donor-identity redaction (nonprofit; resolved detail in §4.3)
  - State-privacy-law nonprofit-exemption variance note (CA exempt vs. CO/NJ regulated — resolved detail in §2.2/§4.1)
- `industryDataTypes.education` / `.nonprofit` — which data-type checkboxes are relevant (e.g., student records, donor/gift data, grant financials)

---

## 4. Open questions (unresolved, pending further research)

1. ~~APAC, Latin America, Middle East/Africa: do any countries have
   education- or nonprofit-specific statutes?~~ **Resolved (2026-09-01):**
   every single key in `geographyRegulationRules` has now been individually
   checked (29 distinct countries/regions: US, EU/EEA, UK, Switzerland,
   Canada, Australia, India, Singapore, South Korea, Japan, China, Taiwan,
   New Zealand, Thailand, Indonesia, Philippines, Malaysia, Hong Kong,
   Vietnam, Brazil, Mexico, Argentina, Colombia, Chile, South Africa, UAE,
   Saudi Arabia, Qatar, Bahrain, Oman, Turkey, Israel — plus aggregate rows
   California/EU-UK/APAC-Oceania/Latin America/Middle East/Africa/
   Multi-region which reuse these same underlying regulation keys). All are
   general-purpose, cross-cutting privacy laws with no sectoral exemption for
   education/nonprofit.
   **Conclusion: the US is the only geography needing new regulationDefs**
   for this feature; all others need industry-tag confirmation only (already
   correct, since existing cross-cutting regs are `industries: null`).
2. Does Non-Profit need any regulation entry beyond charitable solicitation
   registration + inherited cross-cutting laws, or are there
   nonprofit-specific data-handling rules elsewhere (e.g., grant-funder
   data-sharing requirements, UBIT) worth modeling? **Resolved (2026-09-01):**
   No additional US or international nonprofit-specific *statutory*
   data-handling requirement surfaced beyond charitable solicitation
   registration. Related findings, none of which warrant a new
   regulationDef: FTC Act deceptive-practices enforcement applies if a
   nonprofit breaks its own stated privacy promises (cross-cutting, already
   covered by general consumer-protection law, not nonprofit-specific);
   HIPAA applies only if the nonprofit is itself a covered healthcare entity
   (already modeled under "healthcare," not nonprofit-specific); grant-funder
   data-sharing terms and donor-list-sharing consent norms are contractual/
   best-practice, not statutory. One nuance surfaced that affects *existing*
   content rather than adding new regulationDefs: **nonprofit exemption from
   state comprehensive privacy laws is state-dependent**, not uniform (CA
   broadly exempts nonprofits; CO/NJ regulate qualifying nonprofits like
   for-profits above volume/revenue thresholds) — see §2.2 caveat.
   **Conclusion: no new regulationDef beyond the two already proposed in
   §2.2.**
3. Should IRS Form 990 disclosure be included as a lightweight
   `model.exceptions` entry (not a full regulationDef) given it's
   disclosure-adjacent but not really a DLP/sensitivity concern? **Resolved
   (2026-09-01): yes, as an exception/guidance note, not a regulationDef.**
   Most 501(c)(3) public charities report donor names/amounts to the IRS on
   Schedule B, but donor **names and addresses are redacted** before public
   inspection — only contribution amounts/non-cash descriptions stay public.
   Two exceptions where donor identity remains fully public: private
   foundations (Form 990-PF) and political organizations (IRC §527). This is
   a genuinely useful DLP-guidance nuance (explains why donor PII in
   Schedule B needs different handling depending on entity subtype) but is a
   disclosure-redaction rule, not a data-sensitivity regulation. Model as a
   `model.exceptions` entry scoped to `industries: ["nonprofit"]`, e.g.
   "Donor identity in Form 990 Schedule B — redact name/address before
   public release unless filing as a private foundation (990-PF) or §527
   political organization," not as a regulationDef.

---

## 5. Documentation updates required at implementation time

- `README.md` — check lines ~15, 40, 62 for any explicit industry enumeration to update (currently believed generic, but re-verify before implementation)
- `CHANGELOG.md` — new version entry per repo's existing format (e.g., `## vX.Y.Z — YYYY-MM-DD`)

---

*Last updated: 2026-09-10. Geography research is complete and exhaustive —
every key in `geographyRegulationRules` (29 distinct countries/regions,
covering all 41 map entries once aggregate/duplicate rows are accounted for)
has been individually researched. US confirmed as the only geography
requiring new regulationDefs. All open questions in §4 are now resolved:
nonprofit needs no regulationDef beyond the two already proposed (§2.2), and
Form 990 Schedule B donor-identity redaction is modeled as a `model.exceptions`
entry, not a regulationDef. The implementation work for §1, §2.1, §2.2, §3,
and §5 is complete in PR #7; no open research or implementation questions
remain.*
