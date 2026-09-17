# Dependency integrity exception

## Status

The repository requests development dependencies from the approved Microsoft package proxy:

```text
https://packagefeedproxy.microsoft.io/npm/
```

The proxy returns tarball URLs on its canonical Azure Artifacts host:

```text
https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/
```

Accordingly, `package-lock.json` records this canonical host in its `resolved` entries; it is
the expected redirect target for restores through the approved proxy and does not require a
repository `.npmrc`.

As of 2026-09-16, package metadata returned by this feed includes a SHA-1 `dist.shasum`
but does not include a modern `dist.integrity` value. npm therefore records SHA-1 integrity
entries in `package-lock.json`.

Do not manually replace these values. Lockfile integrity metadata must match metadata supplied
by the approved registry.

## Verification evidence

The following packages were sampled through the approved feed:

| Package | Feed metadata |
| --- | --- |
| `@axe-core/playwright@4.13.0` | `dist.shasum` and approved-feed tarball URL; no `dist.integrity` |
| `@playwright/test@1.63.0` | `dist.shasum` and approved-feed tarball URL; no `dist.integrity` |

The lockfile uses version 3 and its `resolved` entries use the approved feed's canonical host.
A local `npm audit --audit-level=high` completed with no reported vulnerabilities at the review
date.

## Compensating controls

- Restore with `npm ci` so installed versions and package hashes must match the committed lockfile.
- Keep dependency versions and resolved registry URLs under pull-request review.
- Run `npm audit --audit-level=high` whenever dependencies or the lockfile change.
- Reject lockfile changes that introduce an unapproved package registry.
- Never suppress integrity verification or use `--ignore-scripts` as a substitute for reviewing
  package lifecycle behavior.

## Resolution criteria

Regenerate and commit `package-lock.json` when the approved feed supplies SHA-512
`dist.integrity` metadata. Review the resulting package versions and resolved URLs before
accepting the regenerated lockfile.

Until then, this is an upstream registry limitation with documented compensating controls,
not a value that can be safely corrected inside this repository.

## Ownership and review

- Owner: DataSecurityGuidedAssistant maintainers
- Review cadence: quarterly and whenever dependency metadata or the approved registry changes
- Last reviewed: 2026-09-16
