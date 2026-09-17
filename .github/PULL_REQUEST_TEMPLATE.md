## Summary

<!-- Describe the change and why it is needed. -->

## Mandatory local verification

CI is prohibited in this repository. Complete and record every compensating control before
requesting review.

- [ ] `pwsh scripts/verify.ps1`
  - Result:
- [ ] Browser/manual review of affected behavior
  - Browser, workflow, and result:
- [ ] Dependency changes reviewed
  - Dependencies changed: <!-- none, or list packages and reasons -->
- [ ] `pwsh scripts/dependency-health.ps1 -Online`
  - `npm audit --audit-level=high` result:
  - `npm outdated` result (informational):
- [ ] Lockfile and feed review
  - Approved registry result:
  - Integrity algorithm summary:
  - SHA-1 known-feed-issue count:

## Additional notes

<!-- Include risks, follow-up work, screenshots, or "None". -->
