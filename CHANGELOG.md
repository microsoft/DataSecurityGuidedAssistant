# Changelog

All notable changes to the Guided Labeling Assistant are documented here.
Format: `## vX.Y.Z — YYYY-MM-DD` followed by bullet points.

## v2.0.1570 — 2026-06-16
- Expand regulatory considerations with country/region-specific options, consistent `Name (Country/Region)` naming, region-filtered population, and shared DLP/labeling suggestions.
- Consolidate the region picker into broader groups while keeping every regulation available through its assigned region.
- Add a dynamic country/market filter under regulatory considerations to narrow options within selected region groups.
- Always include Public and General in sensitivity label recommendations as baseline labels.

## v2.0.1569 — 2026-06-12
- Clarify the Labeling decision flow so users understand questions apply to a specific content scenario, not to a preselected label.
- Add Back navigation from completed label recommendations so users can revise the answer that produced an outcome.
- Add a wide-view toggle for the decision tree visualization and increase the app layout cap for large screens.
- Hide and reset the decision tree visualization when returning to tool selection.
- Tighten DLP checkbox behavior where “None” is mutually exclusive with other selections.

## v2.0.1568 — 2026-06-09
- Repair Quick Start DLP defaults when returning to or restarting the wizard, including a default external-sharing choice, and consistently focus/highlight the exact required field behind setup, label-selection, and DLP wizard validation popups.
- Simplify DLP licensing to concise capability buckets, rename E5 Compliance to Purview Suite, and preserve legacy SKU aliases.
- Align label deployment defaults and DLP review/export guidance to the Microsoft Purview secure-by-default blueprint for files/sites, email, auto-labeling, and sharing controls.
- Move Sensitive Information Type selection into its own DLP wizard step before baseline posture so users confirm detection scope before enforcement is generated.
- Add color-toned DLP wizard sections, distinct question cards, and progress chips so users can see the current setup category at a glance.
- Add the full Microsoft built-in SIT catalog to the Advanced SIT step behind an explicit reveal, with local search and category/region/recommended filters.
- Treat full-catalog SITs as recommended when they match selected geography, data types, or regulations so contextual filters include regional matches such as US SITs.
- Make Standard SIT defaults dynamic from selected data types, industry, geography, and regulations instead of falling back to a single generic SIT in DLP-only flows.
- Show category, region, and recommendation tags in Review Standard SITs and make the full built-in SIT catalog reveal available from Quick Start as an advanced option.
- Add light/transparent alternating question backgrounds across setup, the Labeling decision flow, DLP wizard, and review fields to make adjacent questions easier to distinguish.
- Remove the visible Multi-region geography option because the setup pane already supports selecting multiple regions directly.
- Remove SMB-specific wording from active titles, Quick Start text, DLP guidance, and generated report titles while preserving Microsoft SKU names.
- Add E7 licensing, a Microsoft 365 Copilot licensed/planned add-on signal, and Copilot-aware DLP risk, scope, SIT, warning, rollout, review, and export guidance.
- Keep the SIT selector expanded when editing it from final review and return focus to the edited review card after saving.
- Add a dedicated Copilot readiness and exposure card to the DLP final review with status, risks, workload coverage, access hygiene, rollout gate, and capability notes.
- Consolidate baseline posture with user experience and exceptions in the DLP final review and apply alternating backgrounds to review cards.

## v2.0.1567 — 2026-06-08
- Remove unused user-count context from the active DLP setup flow and sample policy exports.
- Add DLP outcome navigation for editing answers, restarting DLP setup, and returning to tool selection.
- Convert DLP identity, domain, and extension list fields from comma-separated text entry to one-value-per-line inputs while preserving export compatibility.
- Turn the DLP outcome into an editable final review with section-level edit actions and a Save and return to review path.
- Move DLP setting acceptance to the final review acknowledgment and gate export/copy actions until the reviewed settings are accepted.
- Improve final review card layout with adaptive columns and cleaner card sizing across viewport widths.
- Remove the per-label review block from the Rollout wizard step and move per-label edit and Why these settings details into the final DLP outcome review.
- Hide the DLP label-selection walkthrough panel after DLP completion so it no longer appears below the final outcome.
- Keep per-label enforcement visible in a standard review card and replace comma-style label editing prompts with select-based inline controls.
- Keep 4-tier DLP selections as four selected labels instead of expanding them into implementation sublabels.
- Route alert, confirmation, and text-entry popups through the styled in-app action dialog instead of browser-native prompt and confirm UI.
- Show the first per-label enforcement card by default, collapse remaining label cards behind an expand indicator, and remove copy-settings actions.

## v2.0.1563 — 2026-06-05
- Align Labeling deployment preference questions in a dedicated responsive grid with consistent label and dropdown positioning.
- Set default Labeling deployment preferences for pilot rollout, regulated-team scope, required labeling for sensitive content, General default label, recommended labels first, and quarterly review.
- Add Labeling tool deployment preferences for rollout, publishing scope, mandatory labeling, defaults, auto-labeling readiness, review cadence, and export/reference guidance.
- Add China and Taiwan APAC sub-region options with local privacy, cybersecurity, cross-border transfer, DLP warning, and SIT suggestion guidance.
- Refine DLP resume and export UX
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1562 — 2026-06-05
- Remove the one-page intro skip action and make the combined-flow intro a two-page Labeling plus DLP walkthrough.
- Temporarily hide PDF export buttons and comment out PDF-only export functions while reliability issues are reviewed.
- Remove redundant DLP reset-to-selection action and rename the remaining DLP exit button to match its tool-selection behavior.
- Add context-page resume buttons for Labeling and DLP, and preserve in-progress Labeling decision state in encrypted session exports.
- Route DLP setup reset back to tool selection, add a Labeling tool selection button, and mark decision-flow questions as optional.
- Add encrypted DLP progress save/resume controls that preserve the current walkthrough step and restore users directly into DLP.
- Improve accessibility and UI clarity
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1561 — 2026-06-05
- Simplify DLP workflow and SIT selection
- Add selectable DLP workflow modes, compact grouped progress, tier-aware SIT recommendations, expandable individual SIT selection, and global validation alerts.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1560 — 2026-06-05
- Highlight the Microsoft Clarity consent banner with the same high-visibility action-needed treatment used for required-action prompts.
- Make sensitivity label colors static and consistent across Labeling, DLP Outcome, reference cards, exports, and saved-session fallbacks.
- Add reusable informational tooltip icons to ambiguous setup, Labeling, DLP, SIT, rollout, and export configuration terms.
- Audit and improve common text/background contrast pairs across light and dark themes, including muted text, accent-soft components, and colored label badges.
- Improve required-field badge contrast in dark mode by separating required annotation colors from danger/error colors.
- Replace the red global accent theme with a Fluent-style blue accent while keeping danger/error states red.
- Normalize button sizing, shape, and action wording across Labeling, DLP, exports, dialogs, and review controls while preserving color semantics.
- Align Labeling and DLP tool presentation with shared accented panels, card styling, and progress-header patterns.
- Add visible label color swatches and stronger color borders to the Labeling Word export so label colors are preserved in generated documents.
- Add selectable 4-tier and 8-tier labeling models for Labeling, DLP, and Combined flows.
- Keep 8-tier labels as the canonical implementation model while grouping reference and exports into simplified 4-tier labels when selected.
- Add model information icons that explain the label breakdown on hover or keyboard focus.
- Preserve exact implementation labels and baselines for DLP, saved sessions, imports, and exception-label clarity.
- Add DLP workflow mode selection with Guided Quick Start and Advanced DLP Design paths.
- Apply SMB-oriented suggested defaults for DLP data movement, scope, SIT families, notifications, exceptions, and rollout.
- Annotate DLP fields as Required, Suggested, or Advanced so users can see which choices need input versus review.
- Reduce the visible DLP walkthrough from 8 steps into 4 grouped sections while keeping the underlying policy detail intact.
- Keep Advanced mode available for the full DLP configuration path while Quick Start skips non-essential exception-detail setup.
- Make DLP SIT suggestions tier-aware so low, confidential, highly confidential, and exception labels receive different SIT subsets.
- Replace SIT family-only selection with expandable SIT families so individual sensitive information types can be selected.
- Compact the DLP SIT selector with a summary-first view, selected-family chips, and an expandable detailed checklist.
- Replace hard-to-see DLP required-field popups with an inline validation banner and outlined step card.
- Add a global in-app alert dialog so validation and export messages are more visible throughout the tool.
- Annotate required and suggested fields across setup, DLP label selection, and the labeling decision flow.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1559 — 2026-06-04
- Add multi-region context selection
- Update the maintained app and archived mockup with multi-select region and geography context, including explicit Latin America and Middle East regulatory suggestion coverage.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1558 — 2026-06-04
- Change region/geography context to multi-select.
- Add explicit Latin America and Middle East geography options while preserving existing regulatory auto-suggestions.
- Archive the landing-page mockup now that the workflow selector is merged into the main app.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1557 — 2026-06-04
- Promote landing workflow to main app
- Merge the landing-page workflow selector into the production index, including Labeling, DLP, and combined-flow entry paths with flow-specific setup context and return-to-tool-selection controls.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1556 — 2026-06-04
- Promote the landing-page workflow selector into the main app.
- Add Labeling, DLP, and combined-flow entry paths with flow-specific setup context and return-to-tool-selection controls.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1555 — 2026-06-03
- Improve accessibility and regulatory suggestions
- Derive regulatory suggestions from industry, data types, and geography while preserving manual overrides. Improve contrast for status chips, action buttons, and disclaimer panels across the main app and landing mockup.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1554 — 2026-06-03
- Add Word exports and landing mockup
- Derive regulatory suggestions from industry, data types, and geography while preserving manual overrides.
- Improve light and dark theme contrast for status chips, action buttons, and disclaimer panels.
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1554 — 2026-06-03
- Add Word report export options alongside existing PDF exports for Label and DLP reports.
- Default optional Clarity analytics consent to declined until users explicitly opt in.

## v2.0.1553 — 2026-06-02
- Updated Clarity Notification verbiage.

## v2.0.1552 — 2026-06-01
- Updated Disclaimer sub text

## v2.0.1551 — 2026-05-29
- Enable browser translation support
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1550 — 2026-05-29
- Add Clarity consent flow and rename assistant
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1549 — 2026-05-26
- Use custom DLP identity fields
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1548 — 2026-05-26
- Fix feedback from SMB Asset review - Purview:
- - Add a first-use Decision Flow intro dialog after Start decision flow is clicked
- - Allow customer-specific high-risk groups/aliases with comma-delimited entries
- - Validate custom high-risk entries as `<name>@<domain>` and document entry/character limits in the tooltip/help text
- - Include the high-risk watch list in DLP policy JSON, UI summaries, copied summaries, and PDF output
- - Fix Finish DLP setup navigation so completion lands on the DLP results instead of returning focus to the wizard
- - Fix version badge styling to use defined theme tokens and a safe monospace font stack
- - Replace predefined DLP recipient/group choices with customer-specific text fields, examples, tooltips, and safe `<name>@<domain>` validation
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1547 — 2026-05-22
- Refine DLP wizard for per-label model clarity
- - Reword b1 questions to clarify org-level context (not per-label)
- - Replace b3 actor-style exclusions with location/site exclusions
- - Move user/group exemptions cleanly to b6 (Exceptions)
- - Add helper text to b4 clarifying defaults feed per-label review
- - Update b6 exempt groups with break-glass admins, compliance team
- - Rename 'Start Over' to 'Restart Wizard' - now restarts DLP from b1
-   while preserving selected labels (no longer goes to context screen)
- - Clarify b1 approved domains vs b6 always-allowed domains wording
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1546 — 2026-05-22
- feat: per-label DLP configurations with auto-suggestions
- Replaced universal DLP config with per-label enforcement settings:
- - New Policy Posture step (b4) sets baseline enforcement intent and SIT families
- - Auto-generates per-label configs based on sensitivity tier (low/medium/high)
- - Per-Label Review step (b8) with accept-all, edit, copy-from, and reasoning
- - getEffectiveDlpConfig(labelKey) helper for clean per-label merging
- - Updated buildDlpPolicyObject to produce labelPolicies array (version 3)
- - Updated PDF export to use per-label actions/SITs
- - Updated results summary to show per-label enforcement
- - Wizard reduced to 8 steps: DataFlow, Risk, Scopes, Posture, Notifications, Exceptions, Rollout, Review

## v2.0.1545 — 2026-05-22
- feat: add reference section labels as DLP label source option
- Added 4th radio option in DLP wizard label selection: 'Reference section labels'
- pulls from state.visibleLabelKeys (context-filtered labels visible in labeling assistant).
- Disabled when no labels are available (context not locked).

## v2.0.1544 — 2026-05-22
- Remove PS1 export, add DLP PDF report, add encrypted JSON export, add test mode
- - Removed PowerShell script generation and export from DLP wizard
- - Added per-label structured DLP PDF report for compliance review
- - Added encrypted JSON export (AES-GCM-256) for DLP configurations
- - Added test/review mode (?testMode=true) with import and tabbed output review
- - CHANGELOG.md updated with full v1 history (28 versioned entries)
- - Git hooks updated for correct repo paths
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## v2.0.1543 — 2026-05-22
- Added version badge (top-right header) with auto-increment pre-commit hook
- Added automated CHANGELOG.md with commit-msg hook integration
- Fixed "External contractors" field alignment (shortened label to prevent wrapping)

## v2.0.1542 — 2026-05-22
- Dead code cleanup: removed 13 duplicate function definitions (~677 lines)
- Removed 9 orphaned CSS selectors
- Removed unused `getCurrentPolicySummaryNode` function
- File reduced from 6049 → 5296 lines (297KB → 264KB)

## v2.0.1541 — 2026-05-22
- DLP walkthrough redesigned as completely separate mode from label decision flow
- Added "DLP Walkthrough →" button in context row (appears after context lock)
- New label selection screen with three options: Default all labels, Import from JSON, Pick and choose (multi-select)
- DLP 8-step wizard runs against all selected labels simultaneously
- "← Back to Label Assistant" returns to label flow without losing progress
- "← Start Over" replaces "Change context" link (resets all state including DLP)
- Added DLP Start Over button within wizard navigation bar

## v2.0.0 — 2026-05-22
### Major Version: Complete Rebuild

**Architecture:**
- Complete single-file HTML rebuild (~5300 lines)
- No external dependencies, vanilla ES6 JavaScript
- CSS custom properties theming (light/dark/auto mode support)
- Encrypted export using AES-GCM-256 with PBKDF2-SHA-256 (310,000 iterations) via Web Crypto API

**Label Decision Flow:**
- Full sensitivity label decision tree for SMB (≤300 seats, Business Premium) and SMEC (E3/E5, ≤2500 seats)
- Organizational context profiling (industry, regulatory, collaboration patterns)
- Interactive tree visualization with expand/collapse
- Reference section with label cards (save, edit, delete)
- Exceptions and examples documentation sections
- JSON export/import for label configurations

**Terminology Updates:**
- Replaced "8-label DEFEND aligned" with "Best Practice Security recommendations" throughout
- Updated all references to align with current Microsoft guidance

**DLP Integration (Phase 2):**
- 8-step DLP walkthrough (B1–B8): Scope, SIT selection, policy actions, notifications, overrides, exceptions, testing, Copilot DLP
- Context-aware defaults derived from organizational profile
- Licensing gate awareness (Business Premium vs Purview Suite add-on)
- PowerShell script generation for policy deployment
- Multi-label support (configure DLP for multiple labels simultaneously)

**Exports & Sharing:**
- JSON export/import (plain and encrypted)
- PowerShell deployment script generation
- Label configuration summary cards

# v1.x — Legacy Version History

## v1.0.5623 — 2026-05-01
### Final v1 Release
- Updated decision tree to 8-label DEFEND playbook model
- Replaced flat 5-label model with 2 parent groups (Confidential, Highly Confidential) × 3 sublabels each + Public + General
- Rebuilt question graph (7 nodes: q1–q6_hc / q5_internal / q5_external)
- Updated CSS color tokens for all 8 labels
- Updated hero text and section headings to reference DEFEND model

## v1.0.5200 — 2026-04-28
### GitHub Pages Deployment
- Deployed to https://cj-scott.github.io/label-decision-tree/
- Created public repo `label-decision-tree` via GitHub CLI
- Enabled GitHub Pages (master branch, root path)

## v1.0.5100 — 2026-04-28
### Disclaimer at Top of All Exports
- PDF: amber-bordered `.disclaimer-top` banner as first element in popup body
- CSV: prepended `Disclaimer` row and blank row before column headers

## v1.0.5000 — 2026-04-28
### Remove "Visualize Decision Tree" Button & Progress Bar from Section Header
- Removed `<button id="openTreeButton">` from Decision Flow section header
- Removed `<div id="progress">` answer-chip progress bar
- Kept "Visualize tree" button inside the question card (questions pane)

## v1.0.4900 — 2026-04-28
### PDF Export Overhaul + Auto-Close
- Replaced `window.print()` with popup-window generator (`window.open` + `document.write`)
- Self-contained A4 HTML: 2-column reference cards, 3-column exceptions/examples grids
- Decision-flow annotation blocks, regulatory notes, header/footer
- Auto-print on load, auto-close after print dialog dismissed (`afterprint` event)
- Added `escHtml()` helper for XSS prevention

## v1.0.4800 — 2026-04-28
### PowerShell Export Removed
- Removed PS1 export button, disclaimer modal, and all affiliated code (~90 lines CSS, modal HTML, JS functions)
- Kept general disclaimer banner and `--disclaimer-*` CSS variables

## v1.0.4700 — 2026-04-28
### PS1 Export Disclaimer Modal
- Added `#ps1DisclaimerModal` fixed overlay with blur backdrop
- Warning heading, liability body, Cancel/Acknowledge buttons
- Backdrop click and Escape key dismiss

## v1.0.4600 — 2026-04-28
### Reference Section Edit Mode + Unified Exports
- `state.hiddenLabelKeys` — users can remove labels they don't want to export
- Edit toggle button with visual dashed-outline mode
- "Restore removed (N)" button to undo removals
- All exports (PDF, CSV) reflect only visible labels

## v1.0.4500 — 2026-04-28
### PDF, CSV Export
- Added export bar with PDF and CSV buttons
- CSV: Label, Definition, Baseline, Session Saved, Rationale, Decision Path, Regulatory Considerations
- PDF: triggered via `window.print()` with `@media print` rules
- `downloadFile()` Blob helper, `buildExportBar()` initialization

## v1.0.4200 — 2026-04-28
### Canonical Label Order + Balanced Column Algorithm
- Labels sorted by canonical model order (public → general → confidential_all → ... → hc_exception)
- `applyDynamicColumns` balanced algorithm: minimizes trailing empty cells across rows

## v1.0.4100 — 2026-04-28
### Reference Section Annotation Redesign
- Removed separate session log panel
- Saved results surfaced directly in reference section as annotated label cards
- "✓ Labeled by decision flow" badge with rationale and condensed path
- `applyDynamicColumns` called with total key count

## v1.0.4000 — 2026-04-28
### Multi-Item Session Log
- "Save & label another" on result card — saves label/rationale/path to `state.sessionLog`
- Session log panel with numbered entries, "Copy all" and "Clear all" buttons
- `changeContext()` confirms before clearing non-empty log

## v1.0.3800 — 2026-04-24
### Accessibility Scan (WCAG 2 A/AA)
- axe-core v4 scan: 0 hard violations in both light and dark mode
- 3 "needs review" items confirmed as jsdom false positives

## v1.0.3700 — 2026-04-24
### Section Descriptions + UI Cleanup
- Added 2–3 sentence descriptions to Recommendation, Reference, Exceptions, Examples sections
- Moved "Visualize Decision Tree" button from hero to Decision Flow section
- Renamed eyebrow: "Interactive draft" → "Introduction"
- Renamed H1: "SMB MIP Label decision tree" → "SMB Data Security Guided Assistant"

## v1.0.3500 — 2026-04-24
### CSV Regulatory Considerations + Modal Bug Fix
- CSV export now includes full regulatory guidance text per label (pipe-separated)
- Fixed JS abort caused by modal HTML placed after `</script>` tag
- Reference, Exceptions, Examples sections hidden until context is set (`hidden` attribute)

## v1.0.3200 — 2026-04-24
### Regulatory Framework Integration
- Added `regulationDefs` (7 regulations: HIPAA, PCI-DSS, GDPR, CCPA, SOX, GLBA, ITAR/EAR)
- Added `regulationNotes` (per-label regulatory guidance)
- Auto-suggest badges based on industry + data type selections
- "Applicable regulations" fieldset in context panel
- "Regulatory considerations" block on result card and reference cards

## v1.0.3100 — 2026-04-24
### Regulatory Coverage Expansion
- Added 12 new regulations from PPTX source deck
- High-priority: DORA, NIS2, UK GDPR/DPA 2018, PIPEDA/Quebec Law 25
- Global: LGPD, APRA CPS 234, DPDP/CERT-In, PDPA, PIPA, APPI, Gulf PDPL, NZ Privacy Act
- Total regulation entries: 19 (7 original + 12 new)

## v1.0.2800 — 2026-04-24
### Dynamic Exceptions and Examples
- `model.exceptions` expanded from 4 to 10 tagged items with industry/dataType filters
- `model.industries` replaced with `model.industryExamples` (per-industry, per-dataType cards)
- Both sections now filter dynamically by industry AND data types

## v1.0.2600 — 2026-04-24
### Industry-Driven Data Types + Blank Sections on Load
- `industryDataTypes` map rebuilds checkboxes per industry selection
- Reference, Exceptions, Examples start blank — populate only after context lock

## v1.0.2400 — 2026-04-24
### Context-Gathering Phase + Dynamic Filtering
- Full-width context panel on load: industry dropdown + 10 data-type checkboxes
- "Start decision flow" gated on industry selection
- `contextMap` filters Reference/Exceptions/Examples to selected context
- Active filter chip with × clear button
- Result label card pulse animation + scroll-into-view on completion
- "Change context" button resets flow and context

## v1.0.2000 — 2026-04-22
### UI Improvements: Other Data Type, Dynamic Columns, Tree Width
- Added "Other / Unknown Data Types" checkbox to all industries
- `applyDynamicColumns()` helper for responsive grid columns (max 4/3)
- `fitTreeToWidth()` auto-zoom + window resize listener (debounced)

## v1.0.1800 — 2026-04-22
### Tree Zoom Controls
- Zoom in/out buttons (±10%, capped 0.3–2.0)
- Live zoom % label (aria-live)
- "Fit width" button for auto-fit
- `openTreeVisualization()` always opens at auto-fit zoom

## v1.0.1500 — 2026-04-22
### Compact Tree Spacing
- Reduced stem heights (28px→14px, 12px→6px)
- Reduced branch padding, node padding, font sizes
- Tightened Public/General nodes toward center
- Changed reference grid to 4 columns with responsive breakpoints

## v1.0.1200 — 2026-04-22
### Visio-Style Vertical Tree Diagram
- Replaced horizontal indented list with top-down flowchart
- New `.vd-*` CSS class system (root, group, stem, row, branch, node)
- Horizontal crossbars connecting siblings, vertical stems between levels
- Yes/No chip labels on connectors
- Floating horizontal scrollbar (sticky bottom viewport)

## v1.0.0800 — 2026-04-21
### JS Syntax Hotfix
- Fixed SyntaxError from model data injected inside `getRelevantLabelKeys()`
- Removed stray `}` from `renderIndustries()`

## v1.0.0500 — 2026-04-21
### Fluent 2 Visual System
- Applied Fluent 2-inspired surfaces, elevation, corner radii, spacing tokens, button treatments
- No Microsoft logos or protected brand assets used

## v1.0.0300 — 2026-04-21
### Light/Dark Mode + Accessibility
- System theme detection + manual toggle
- Focus-visible styles, skip link, ARIA live regions
- Reduced-motion support, semantic landmarks
- 0 axe WCAG 2 A/AA violations

## v1.0.0200 — 2026-04-21
### Draft Disclaimer + Source Cleanup
- Added visible "Draft disclaimer (not CELA-approved language)" banner
- Removed all internal source/deck references for public-facing use

## v1.0.0100 — 2026-04-21
### Tree Visualization
- Added "Visualize decision tree" button with collapsible tree map
- Full branch structure rendered, current node highlighted dynamically

## v1.0.0 — 2026-04-21
### Initial Release
- Interactive 5-label decision tree (single self-contained HTML file)
- Reference cards for all labels, exception cards, cross-industry examples
- Back button in decision flow, Copy summary on result card
- Built from SharePoint deck slide 14 as source of record
