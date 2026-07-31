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
pwsh scripts/verify.ps1
```
`verify.ps1` confirms `index.html` exists, is non-empty, and contains a well-formed
`<html>...</html>` document. A change is done when `verify.ps1` passes and the page renders
correctly in a browser.

## PR & work-item telemetry — required
Every PR must follow [`.github/instructions/telemetry.instructions.md`](.github/instructions/telemetry.instructions.md).

## Copilot
See [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
