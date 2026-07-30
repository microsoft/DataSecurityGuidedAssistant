# Copilot instructions — DataSecurityGuidedAssistant

Start with [`AGENTS.md`](../AGENTS.md) for the repository map, conventions, and verification
steps. This file adds Copilot-specific guardrails.

## What this repo is
A single self-contained static page (`index.html`) — a guided assistant for data security /
Purview. No build step, framework, or backend.

## Working here
- Keep the app self-contained in `index.html` unless deliberately splitting out assets.
- Preserve accessibility (labels, headings, keyboard nav) and avoid external runtime
  dependencies that require a build.
- Validate with `scripts/verify.ps1` (checks the HTML document is present and well-formed).
- Never embed secrets, tokens, tenant identifiers, or customer data.

## PR guardrails
- Keep PRs small and single-purpose.
- Apply the PR labels and description footer required by
  [`.github/instructions/telemetry.instructions.md`](instructions/telemetry.instructions.md).
