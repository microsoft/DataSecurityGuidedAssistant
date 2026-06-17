
# Data Security Guided Assistant

A browser based, interactive decision tool that turns Microsoft data security best
practices into guided, context aware recommendations for **sensitivity labeling**
and **Data Loss Prevention (DLP)**. It walks you through a short series of questions
and produces tailored label recommendations, DLP policy guidance, supporting
rationale, explicit exceptions, and real world examples in a single flow.

> **Use the hosted tool:** https://microsoft.github.io/DataSecurityGuidedAssistant

## Purpose

Translating security guidance into concrete, defensible labeling and DLP decisions
is hard: the "right" answer depends on your industry, geography, regulations, data
types, licensing, and existing posture. This assistant captures that context once,
then keeps every recommendation aligned to it so you can:

- Choose the correct **sensitivity label** for a given piece of content using a
  consistent, repeatable escalation path.
- Plan **DLP policy** scope, posture, notifications, exceptions, and rollout based on
  your Microsoft 365 licensing and environment.
- Review the **rationale, exceptions, and examples** behind each recommendation
  instead of guessing.
- Produce shareable output you can export, print, or hand to stakeholders.

Everything runs **client side in your browser**. No data you enter is sent to a
server by the tool itself. Optional, anonymous usage analytics (Microsoft Clarity)
only load if you explicitly consent.

## Key features

- **Three entry points** from the landing page:
  - **Labeling tool**: guided decision flow to choose labels, review rationale, and
    export recommendations.
  - **DLP tool**: go directly to DLP policy guidance (licensing, scope, posture,
    notifications, exceptions, rollout).
  - **Combined flow**: run the label decision flow first, then continue into DLP
    enforcement using the selected label set.
- **Context aware tailoring** by industry, region/geography, country/market, data
  types, and applicable regulations.
- **Two labeling models**: an 8 tier implementation model or a simplified 4 tier
  model (Public, General, Confidential, Highly Confidential).
- **Live supporting sections**: Reference, Exceptions, and Examples update
  dynamically as you answer.
- **Regulatory suggestions** surfaced as planning prompts (not legal advice) based on
  your selections.
- **DLP specific inputs**: licensing, add ons/readiness, workforce, device model,
  contractors, existing DLP posture, sensitivity labels deployed, Conditional Access,
  and Sensitive Information Type (SIT) selection.
- **Export, print, and "save & label another"** to build a repeatable set of results.
- **Accessibility and theming**: light/dark/auto themes, keyboard navigation, and
  ARIA labeled controls. For other languages, use your browser's built in
  *Translate page* feature.

## How to use it

1. **Open the tool** at
   https://microsoft.github.io/DataSecurityGuidedAssistant (or open `index.html`
   locally, see below).
2. **Pick a workflow** on the landing page: *Labeling*, *DLP*, or the *combined flow*.
3. **Provide your context.** Select your industry (required), then optionally add
   geography, data types, regulations, and, for DLP, licensing and environment
   details. The flow only asks for what's relevant to the path you chose.
4. **Start the decision flow** and answer each question in order. The recommended
   label and the Reference, Exceptions, and Examples sections update as you go.
5. **Review the recommendation**: label name, rationale, and protection baseline (or
   DLP policy guidance). Use **Back** to revise an answer if needed.
6. **Save or export.** Use **Save & label another** to log a result and start a new
   item, or export/print everything from the Reference section.

## Running locally

The app is a single static `index.html` file with no build step or dependencies.

- **Quickest:** open `index.html` directly in a modern browser.
- **Recommended (matches hosting):** serve the folder over a local web server, for example:

  ```powershell
  # From the repository root
  python -m http.server 8000
  # then browse to http://localhost:8000
  ```

## Disclaimer

Recommendations, regulatory suggestions, and examples are planning aids to help you
apply Microsoft data security best practices. They are **not legal advice** and do not
replace review by your security, compliance, and legal teams. Validate all label and
DLP decisions against your organization's policies and obligations.

## Contributing

See [SECURITY.md](SECURITY.md) for reporting security issues, [SUPPORT.md](SUPPORT.md)
for getting help, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community
guidelines. Notable changes are tracked in [CHANGELOG.md](CHANGELOG.md).

## License

This project is licensed under the terms in [LICENSE](LICENSE).
