# AGENTS.md — DataSecurityGuidedAssistant

A **static, single-page web guided assistant** (`index.html`) for Microsoft Purview / data
security guidance. No build system or backend — the page is self-contained and served
statically (e.g. GitHub Pages). This file is the entry point for humans and coding agents.

## Repository map
| Path | What lives here |
| --- | --- |
| `index.html` | The entire application (markup, styles, and script). |
| `README.md`, `CHANGELOG.md` | Overview and change log. |
| `.github/` | Issue templates and the pull request template. |
| `scripts/` | Local verification, environment, and dependency-health checks. |
| `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `LICENSE` | Governance. |

## Conventions
See [`docs/conventions.md`](docs/conventions.md).

## Verification / Definition of Done
**Repository policy prohibits CI of any kind.** Do not add GitHub Actions, Azure Pipelines,
or any other hosted or self-hosted pipeline configuration. Mandatory local verification
is the compensating control: every author must run and record the following checks before
opening a PR.

```powershell
npm ci
npx playwright install chromium
pwsh scripts/verify.ps1
pwsh scripts/dependency-health.ps1 -Online
```
Run the setup commands once after cloning or when dependencies change. `verify.ps1` validates
the approved dependency source and lockfile structure without network access, validates the HTML
and inline JavaScript, exercises a representative labeling workflow in Chromium, and checks the
primary flow for serious or critical accessibility violations. The online dependency-health run
blocks on high-severity `npm audit` findings and reports `npm outdated` for review. A change is
done only when these commands pass, the affected behavior has been reviewed in a browser, and the
results are recorded in the pull request template.

## PR & work-item telemetry — required
Every PR must follow [`.github/instructions/telemetry.instructions.md`](.github/instructions/telemetry.instructions.md).
