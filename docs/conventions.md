# Conventions — DataSecurityGuidedAssistant

Observed conventions. Derived from the current structure; update as it evolves.

## Layout
- **`index.html`** — the whole app: markup + inline styles/script.
- **Governance** — `README.md`, `CHANGELOG.md`, `SECURITY.md`, `SUPPORT.md`,
  `CODE_OF_CONDUCT.md`, `LICENSE`; issue templates in `.github/ISSUE_TEMPLATE/`.

## Authoring conventions
- Static, dependency-free HTML/CSS/JS — no build tooling required.
- Keep content self-contained; prefer inline or same-repo assets over external CDNs where practical.
- Preserve accessible labels, heading structure, and keyboard navigation.
- Avoid external runtime dependencies that require a build.
- Keep pull requests small and single-purpose.
- Update `CHANGELOG.md` for user-facing changes.
- No secrets, tokens, tenant identifiers, or customer data in markup or scripts.

## Validation
Install the verification dependencies after cloning or when they change:

```powershell
npm ci
npx playwright install chromium
```

Run `pwsh scripts/verify.ps1` to validate the HTML and inline JavaScript, exercise a
representative labeling workflow in Chromium, and check the primary flow for serious or
critical accessibility violations.
