# AGENTS.md — DataSecurityGuidedAssistant

A **static, single-page web guided assistant** (`index.html`) for Microsoft Purview / data
security guidance. No build system or backend — the page is self-contained and served
statically (e.g. GitHub Pages). This file is the entry point for humans and coding agents.

## Repository map
| Path | What lives here |
| --- | --- |
| `index.html` | The entire application (markup, styles, and script). |
| `README.md`, `CHANGELOG.md` | Overview and change log. |
| `.github/` | Issue templates. |
| `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `LICENSE` | Governance. |

## Conventions
See [`docs/conventions.md`](docs/conventions.md).

## Verification / Definition of Done
```powershell
npm ci
npx playwright install chromium
pwsh scripts/verify.ps1
```
Run the setup commands once after cloning or when dependencies change. `verify.ps1` validates
the HTML and inline JavaScript, exercises a representative labeling workflow in Chromium, and
checks the primary flow for serious or critical accessibility violations. A change is done when
`verify.ps1` passes and the affected behavior has been reviewed in a browser.

## PR & work-item telemetry — required
Every PR must follow [`.github/instructions/telemetry.instructions.md`](.github/instructions/telemetry.instructions.md).
