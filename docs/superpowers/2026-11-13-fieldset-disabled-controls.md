# Checkbox and switch inherited disabled state

## Scope

Fix audit finding 1 only: checkbox and switch must honor disabled fieldsets without modifying their own disabled attributes.

## Checklist

- [x] Trace the missing form-disabled lifecycle against existing form controls.
- [x] Add browser regressions and observe the expected failures.
- [x] Propagate effective disabled state to native inputs, styling, and the switch click guard.
- [x] Verify focused tests, the full component suite, and the package build.
- [x] Review the diff and record the results.

## Implementation

Both controls now track `formDisabledCallback` as internal reactive state, following the existing search-bar pattern. The callback also updates an existing native input synchronously so immediate clicks respect fieldset changes before Lit renders. Their rendered native inputs combine that state with their own disabled property. Disabled styling uses the form-associated host's `:disabled` pseudo-class, so inherited state and the first-legend exception follow browser semantics. The switch's existing host click guard also honors inherited state.

## Verification

- Before implementation, the focused browser run failed five inherited-disabled assertions; the other 45 tests passed.
- After implementation, all 50 checkbox/switch tests passed.
- Final `npm test`: 23 files, 514 tests passed.
- `npm run build`: passed, with the existing two token-collision warnings.
- Thirteen added regressions cover inherited disabled activation/focus/events/styling, fieldset transitions and form data, immediate same-task clicks, explicit disabled preservation, first-legend behavior, and the switch host click guard.

## Review

Independent review identified a synchronous-transition gap in the initial reactive-only implementation. Four immediate-transition cases reproduced three failures before the synchronous native input update. The final full suite passes, and the follow-up review approved the scoped changes with no remaining substantive findings. `git diff --check` passes. Unrelated user plan/spec files remain untouched.
