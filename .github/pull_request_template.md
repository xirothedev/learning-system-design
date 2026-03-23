## Summary

<!--
Describe the change in 2-5 sentences.
Focus on the problem, the approach, and the expected outcome.
-->

## Why This Change

<!--
Explain why this work is needed.
Include product, technical, operational, or maintenance motivation.
-->

## Related Issues / References

<!--
Examples:
- Closes #123
- Relates to #456
- RFC / ADR / design doc:
- Incident / task / ticket:
-->

## Scope

<!--
List the areas touched by this PR.
Replace or remove items that do not apply.
-->

- [ ] API / backend logic
- [ ] Redis integration / caching / queues
- [ ] Data model / contracts / DTOs
- [ ] Configuration / environment variables
- [ ] Build / CI / tooling
- [ ] Tests
- [ ] Documentation
- [ ] Refactor / cleanup

## Type Of Change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Performance improvement
- [ ] Security improvement
- [ ] Documentation update
- [ ] Chore / maintenance
- [ ] Breaking change

## Implementation Notes

<!--
Call out the important design or implementation decisions.
Examples:
- new modules/providers added
- contract changes
- fallback behavior
- tradeoffs and non-obvious decisions
-->

## Behavior Changes

<!--
Describe the observable before/after behavior.
If there are API or workflow changes, include request/response examples.
-->

### Before

<!-- Previous behavior -->

### After

<!-- New behavior -->

## Testing

<!--
Check what you ran locally and add relevant outputs/details if needed.
If something could not be tested, explain why.
-->

- [ ] `bun run lint`
- [ ] `bun run check-types`
- [ ] `bun run build`
- [ ] App-level manual testing completed
- [ ] Unit tests added or updated
- [ ] Integration / e2e tests added or updated

### Test Details

<!--
Add exact commands, scenarios tested, and noteworthy results.
Examples:
- `bun run lint --filter=redis`
- `bun run check-types --filter=redis`
- validated API response for ...
-->

## Screenshots / Logs / API Examples

<!--
For UI, CLI, or API changes, paste screenshots, terminal output, curl examples,
JSON payloads, or request/response samples if they help reviewers.
-->

## Breaking Changes

- [ ] No breaking changes
- [ ] Yes, this PR introduces breaking changes

### Migration / Upgrade Notes

<!--
Required only if breaking changes exist.
Explain what consumers, teammates, or deployers must update.
-->

## Deployment And Rollout Notes

<!--
Document anything reviewers or deployers should know.
Examples:
- feature flags
- required env vars / secrets
- order of deployment
- data backfills
- Redis prerequisites
- rollback approach
-->

## Risks And Mitigations

<!--
What could go wrong, where is the highest risk, and how is that risk reduced?
-->

## Reviewer Focus Areas

<!--
Point reviewers at the most important files, logic, or assumptions to verify.
Examples:
- retry logic in Redis service
- DTO compatibility
- config default behavior
-->

## Checklist

- [ ] I have reviewed my own changes
- [ ] I have kept the PR focused and reasonably scoped
- [ ] I have updated documentation/comments where needed
- [ ] I have added or updated tests where needed
- [ ] I have considered error handling and edge cases
- [ ] I have considered logging, observability, and debugging impact
- [ ] I have considered performance impact where relevant
- [ ] I have considered security implications where relevant
- [ ] I have documented new environment variables, secrets, or config changes
- [ ] I have documented breaking changes and rollout steps, if applicable
