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
### No-CI policy and compensating controls

CI is explicitly prohibited in this repository. Do not add GitHub Actions, Azure Pipelines,
or any other pipeline configuration. Instead, every pull request author must perform the full
local verification below and record the results in the pull request template. Reviewers must
treat missing or failing local-verification evidence as a merge blocker.

Install the verification dependencies after cloning or when they change:

```powershell
npm ci
npx playwright install chromium
```

Run:

```powershell
pwsh scripts/verify.ps1
pwsh scripts/dependency-health.ps1 -Online
```

`verify.ps1` is the normal, network-free loop. It reports environment versions, blocks
unapproved lockfile registries, validates manifest/lockfile consistency and integrity metadata,
validates the HTML and inline JavaScript, exercises a representative labeling workflow in
Chromium, and checks the primary flow for serious or critical accessibility violations.

The separate online dependency-health run applies `npm audit --audit-level=high` as a blocking
check and reports `npm outdated` as informational. Review dependency and lockfile changes before
the PR is opened. The approved lockfile source is the `npm-public` registry on
`ms-feed-25.pkgs.visualstudio.com`.

The approved feed currently emits SHA-1 integrity entries. The deterministic checker summarizes
and clearly reports those entries as a known feed issue without rewriting or failing them. Do not
attempt to resolve the SHA-1 entries in unrelated changes; review any count or algorithm change.
