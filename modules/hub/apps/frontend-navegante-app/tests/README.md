# Navegante app tests

This directory contains unit tests for application rules and browser tests for rendered UI behavior. Static accessibility checks run alongside source linting. Remaining accessibility work and device verification are tracked in [accessibility-plan.md](../accessibility-plan.md).

## Test layers

| Layer | Tools | Purpose |
| --- | --- | --- |
| Static checks | ESLint, `eslint-plugin-jsx-a11y`, TypeScript | Catch source-level accessibility issues, coding errors, and incompatible types. |
| Unit tests | Node's `node:test`, `node:assert`, `tsx` | Verify rules and calculations using controlled inputs, without rendering React or opening a browser. |
| Browser tests | Playwright, Chromium, Axe | Exercise the running app, keyboard interactions, focus behavior, accessibility semantics, and complete route flows. |

The layers complement each other. A unit test can check that a departure warning uses the boarding time; a browser test can check that the warning and surrounding controls are exposed correctly in the interface.

## Directory structure

```text
tests/
├── accessibility/
│   ├── app-shell.spec.ts
│   ├── route-accessibility.spec.ts
│   ├── route-preview.spec.ts
│   └── eslint-baseline.json
├── common/
│   └── *.test.ts
├── feedback/
│   └── *.test.ts
└── route-planner/
    └── *.test.ts
```

| Location | Coverage |
| --- | --- |
| `common/` | Sheet navigation and snap behavior, map filtering and geometry, location sensors, search normalization, agency/vehicle matching, translations, and analytics. |
| `feedback/` | Reason selection, navigation between steps, and submission cooldowns. |
| `route-planner/` | MOTIS request parameters, location mapping, modes, sorting/filtering, itinerary geometry and progress, navigation decisions, announcement rules, and realtime departure deviations. |
| `accessibility/app-shell.spec.ts` | Language and landmarks, focus styling, touch/text selection behavior, global search focus containment/restoration, Escape dismissal, semantic search results, and Axe scans. |
| `accessibility/route-accessibility.spec.ts` | Nested filters, keyboard focus containment/restoration, radios and checkboxes, date validation, compact-sheet expansion, preview focus, origin/destination search, planning busy/error/empty states, and Axe scans of those views. |
| `accessibility/route-preview.spec.ts` | Card selection and compact previews, visible trip actions, result selection/filter/scroll preservation, starting/ending trips, and clearing route/search state when the final sheet closes. |

## Running tests

Use the repository's normal dependency setup first. Run the commands below from `modules/hub/apps/frontend-navegante-app`.

```bash
# All unit tests
npm test

# One unit test file
node --import tsx --test tests/route-planner/realtime.test.ts

# All browser tests, one worker for predictable local runs
npm run test:accessibility -- --workers=1

# One browser test file
npm run test:accessibility -- route-accessibility.spec.ts

# One browser scenario by its test name
npm run test:accessibility -- route-accessibility.spec.ts --grep "nested sorting"

# Static accessibility checks only
npm run lint:accessibility

# Source lint, accessibility baseline check, and TypeScript
npm run lint
```

If Playwright reports that Chromium is missing, install its browser binary:

```bash
npx playwright install chromium
```

The unit runner discovers `tests/*/*.test.ts`; keep unit files one feature-directory level below `tests/`, or update the script when introducing a deeper structure. Playwright discovers browser specs under `tests/accessibility/` using [playwright.config.ts](../playwright.config.ts).

Playwright starts `npm run dev` on port `51101`, or reuses an existing server outside CI. The app is opened at `/hub/navegante-app`. The configured browser is Chromium; route specs use a `390 × 844` viewport with a supplied geolocation and permission. A small viewport does not emulate an actual iOS or Android WebView.

The runners are separate: `npm test` does not run Playwright, and `npm run lint` does not run either test suite. Source lint targets `src/`; lint a new browser test explicitly when adding one:

```bash
npx eslint tests/accessibility/route-accessibility.spec.ts
```

## How browser tests work

Tests interact with the real rendered application. Prefer controls identified by role and accessible name, such as `getByRole('button', { name: 'Ver alternativas' })`, rather than CSS classes. This checks whether controls expose meaningful semantics as well as whether they work.

Accessibility scenarios simulate Tab, Shift+Tab, Enter, Space, and Escape. Assertions check the active element, whether focus stays inside a modal, whether background content is hidden from assistive technology, and whether closing a modal restores its trigger. Non-modal previews should keep background controls accessible. Compact sheets should expand when keyboard focus reaches their content, while a selected preview initially stays compact.

The route specs intercept Hub API requests with `page.route()` and return fixed geocoding and itinerary responses in the normal `{ data, error, timestamp }` envelope. Register interception before opening the app. These tests verify frontend behavior with known data; they do not verify live MOTIS routing quality. Map assets and the unmocked app-shell scenarios may still make network requests.

The planning-state tests hold a response until the busy indicator and live status have been checked, then release it with an error or an empty itinerary list. This makes the transition testable without arbitrary sleep delays.

Axe inspects the rendered DOM for automatically detectable accessibility problems. App-shell scans cover the page; the route helper scopes scans to the active dialog. Axe checks complement keyboard assertions and manual screen-reader testing.

## Accessibility baselines and limits

The static baseline in [eslint-baseline.json](accessibility/eslint-baseline.json) is empty. [check-accessibility-lint.mjs](../scripts/check-accessibility-lint.mjs) compares the exact file/rule/count entries with detected `jsx-a11y` findings, so a new violation fails even though those ESLint rules are configured as warnings.

The app-shell Axe tests maintain known findings by rule ID and fail on unexpected findings or resolved entries that still remain in the baseline. The route Axe helper currently excludes `color-contrast` findings, tracked by `VISUAL-02`, and fails on every other finding. This exclusion also allows new contrast problems through; contrast needs its own remediation and verification before that exception can be removed. The route-preview flow test does not run Axe itself.

Do not add a baseline exception just to make a failing test pass. Fix the issue, or document an explicitly tracked remaining task. Remove exceptions when the corresponding issue is resolved.

Passing automation does not establish full accessibility compliance. These tests do not listen to screen-reader speech, verify touch exploration, or exercise real native host behavior. VoiceOver/TalkBack, text scaling, orientation, reduced motion, contrast, Switch Control, and safe-area/keyboard behavior still need the verification recorded in the accessibility plan. A dedicated browser CI job is also still tracked there.

## Debugging failures

Read the failed assertion first. Playwright reports the locator, expected result, actual result, and an accessibility snapshot when available. A missing control can mean that it was removed, renamed, or hidden from the accessibility tree.

Playwright retains traces for failed tests under `test-results/`. Run the `npx playwright show-trace` command printed with the failure to inspect actions, page snapshots, and network requests.

To watch or step through a scenario:

```bash
npm run test:accessibility -- route-accessibility.spec.ts --headed
npm run test:accessibility -- route-accessibility.spec.ts --debug
```

The route-preview test also writes a diagnostic screenshot to `/private/tmp/navegante-route-preview.png`. It is not a screenshot comparison or visual regression assertion.

As of 2026-09-28, source ESLint and the static accessibility baseline pass, but the full `lint` command reaches an existing TypeScript error in `packages/ui/src/contexts/Locale.context.tsx` caused by incompatible `i18next` types from two dependency locations. Treat that separately from a failing test; update this note once resolved.

## Adding coverage

- Put function-level rules in the relevant `common/`, `feedback/`, or `route-planner/` unit folder. Use representative inputs and edge cases, and assert behavior rather than copying the implementation into the test.
- Put rendered interaction scenarios in `accessibility/*.spec.ts`. Keep tests independently runnable with their own data setup.
- Use semantic locators and retrying `expect()` assertions. Wait for observable UI state rather than adding fixed sleeps.
- Mock API responses and location when a scenario depends on them. Control pending responses explicitly when testing loading transitions.
- For a keyboard regression, reproduce the actual key sequence and assert focus before and after it. For rendered accessibility changes, add a suitably scoped Axe scan where useful.
- Give tests names that explain the behavior they protect. Keep a regression test with the corresponding fix.
- Update the coverage descriptions here when adding a new area. Track unfinished work and manual verification in the accessibility plan.
