# Frontend Navegante accessibility execution plan

Last updated: 2026-09-28

This plan covers the accessibility gaps found in the current `frontend-navegante-app` source audit. The target is WCAG 2.2 AA behavior in the web UI, followed by verification in the real iOS and Android WebView hosts with VoiceOver and TalkBack.

## Decisions

- Keep one DOM and one visual implementation. Do not render a separate screen-reader-only version and do not attempt to detect whether a screen reader is running.
- Keep `react-modal-sheet` for its existing animation, snap-point, drag, safe-area, and virtual-keyboard behavior.
- Add React Aria primitives to the app-owned `BottomSheet` adapter. `react-modal-sheet` deliberately does not provide dialog semantics, background hiding, focus containment, or focus restoration itself and documents React Aria as its integration path.
- Make modality explicit at every sheet call site:
  - `modal`: blocks the rest of the UI both visually and semantically, contains focus, hides background content from assistive technology, and restores focus on close.
  - `non-modal`: leaves the map and floating controls available, does not set `aria-modal`, and does not trap focus.
- Preserve the current handle-only appearance. Every sheet still gets an accessible title; handle-mode sheets render that title visually hidden.
- Make the drag handle an operable control without changing its normal appearance. Drag remains available, while click, keyboard, Switch Control, VoiceOver, and TalkBack can expand or collapse the sheet.
- Use input-agnostic behavior rather than screen-reader detection: when keyboard or assistive-technology focus enters clipped sheet content, expand the sheet so the focused control is visible.
- Use semantic HTML first. React Aria is for overlay/dialog and focus behavior, not a replacement for native buttons, links, labels, radios, and checkboxes.
- Put all new user-facing accessibility text in `src/i18n/namespaces/default/pt.json`.

## Bottom-sheet design

### Public contract

Change `BottomSheet` so each consumer must provide:

```ts
interface BottomSheetProps {
  accessibleTitle: string
  modality: 'modal' | 'non-modal'
  initialFocusRef?: RefObject<HTMLElement | null>
  // Existing visual and behavioral props remain.
}
```

`title` remains the optional visible title. `accessibleTitle` is always required. Where `title` exists, it can also be the accessible title; handle-mode sheets use a visually hidden heading with `accessibleTitle`.

Do not infer modality from `withOverlay` alone. A backdrop is presentation and dismissal UI; modality is an interaction contract. It is acceptable to default `modality` temporarily during migration, but the final API should require it so a future call site cannot silently claim the wrong semantics.

### React Aria integration

Use the primitives demonstrated by the `react-modal-sheet` accessibility example:

- `OverlayProvider` at the app provider boundary.
- `useDialog` for the named dialog container and title relationship.
- `useOverlay` for Escape and outside-interaction handling, coordinated with the existing backdrop so `onClose` fires only once.
- `useModal` only for modal sheets so background content is hidden from assistive technology.
- `FocusScope contain autoFocus restoreFocus` only for modal sheets.
- A non-containing focus scope, or explicit focus bookkeeping, for non-modal sheets when focus restoration is needed.

Keep `Sheet.Container`, `Sheet.Header`, and `Sheet.Content` in their existing direct-child relationship. The library warns that extra DOM wrappers can break scrolling and keyboard avoidance.

Do not map the existing `disableDismiss` prop directly to keyboard dismissal. Today that prop prevents drag dismissal, while the close button remains usable. Escape and the Android back action should continue to close unless a new, explicitly named prop disables them for a justified case.

### Sheet classification

| Sheet | Modality | Accessible title source |
|---|---|---|
| Global search | `modal` | Search title from i18n; focus the search field |
| Route origin/destination search | `modal` | Existing origin/destination title |
| Route time/sort/mode filter | `modal` nested above results | Existing filter title; restore focus to its trigger |
| Map layer/operator filters | `modal` | Existing visible title; restore focus to layers button |
| Feedback flow | `modal` | Current view title; restore focus to feedback trigger |
| Route results | `non-modal` | “Route options”/equivalent i18n label |
| Route place detail | `non-modal` | “Place details” or the place name |
| Route itinerary detail/navigation | `non-modal` | Existing route-summary label |
| Line detail | `non-modal` | Generic line-detail label, enriched with the line name when available |
| Stop detail | `non-modal` | Generic stop-detail label, enriched with the stop name when available |
| Vehicle detail | `non-modal` | Generic vehicle-detail label, enriched with line/vehicle data when available |
| Alert detail | `non-modal` | Generic alert-detail label, enriched with the alert title when available |

### Snap-point behavior

- Render the visible 44-by-5-pixel handle inside a real button with at least a 44-by-44-pixel hit area. Keep the button chrome transparent so the resting visuals do not change.
- Give the button localized “Expand panel” or “Collapse panel” text and `aria-expanded` reflecting whether the full snap point is active.
- Pressing the handle toggles between the compact and full visible snap points. Dragging the header continues to work.
- When keyboard focus enters an operable control in `Sheet.Content` while a map-aware sheet is compact, snap to full so the focused control is visible. Pointer selection and programmatic focus of the new view must preserve its compact preview height. Focusing the close/back/handle controls must not force expansion. Verify assistive-technology exploration separately on real devices.
- After a snap, announce only the state change (“Panel expanded”/“Panel collapsed”), not continuous drag progress.
- Ensure content clipped by the compact snap point cannot receive invisible keyboard focus. The expand-on-focus rule and focus-order browser tests are the release gate.
- Route-planner view changes inside an already-open sheet must move focus to the new view heading or primary control and announce the new view. Do not rely on the sheet open event because it does not run during these transitions.
- When the nested route-filter modal opens, the parent result sheet remains mounted but is unavailable to keyboard and assistive technology until the filter closes. Focus returns to the exact filter trigger.

## Agent-sized backlog

Status values: `pending`, `in progress`, `complete`, and `blocked`.

### Foundation and bottom sheet

| ID | Task | Primary files | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| A11Y-01 | Add an accessibility test baseline | `package.json`, `eslint.config.mjs`, new browser-test config/specs | — | Added an exact file/rule-count baseline, Playwright keyboard/focus coverage, and Axe scans whose known findings point to their remediation task. The static accessibility baseline now contains zero known violations. New or resolved findings fail until the implementation and baseline move together. | complete |
| SHEET-01 | Add React Aria and define the sheet accessibility contract | `package.json`, `src/app/providers.tsx`, `BottomSheet/index.tsx` | A11Y-01 recommended | `OverlayProvider` is mounted once; `accessibleTitle` and `modality` are typed; no visual or snap regression. | complete |
| SHEET-02 | Implement true modal behavior | `BottomSheet/index.tsx`, `styles.module.css` | SHEET-01 | Named dialog; background hidden from AT; focus enters and remains inside; Escape/backdrop close once; focus returns to trigger; existing close/back controls work. | complete |
| SHEET-03 | Implement non-modal and accessible snap behavior | `BottomSheet/index.tsx`, `styles.module.css`, bottom-sheet constants/utilities/tests | SHEET-01 | No false `aria-modal`; map controls remain reachable; handle is operable and labeled; content focus expands the sheet; drag and visual handle remain unchanged. | complete |
| SHEET-04 | Migrate and label every sheet call site | Every `BottomSheet` consumer, `pt.json` | SHEET-02, SHEET-03 | Every sheet has an explicit correct modality and non-empty accessible title; search uses its input as initial focus; no unnamed dialogs. | complete |
| SHEET-05 | Fix nested filters and route-view focus transitions | `RoutePlanner`, `RoutePlannerResultsFilters`, route views | SHEET-04 | Only the top modal is exposed while a filter is open; focus restores to trigger; search/results/place/itinerary transitions announce and place focus predictably. | complete |

Because `SHEET-01` through `SHEET-03` all edit the same adapter, one agent should own that sequence. `SHEET-04` and `SHEET-05` can be handed to a second agent only after the contract lands.

### Route planner and search

| ID | Task | Primary files | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| ROUTE-01 | Make search and result lists semantic | `Search`, `SearchGroup`, `RegularListItem` | SHEET-04 | Search has a programmatic label and status region; results are lists; click-only list items become native buttons or links; all actions work with Enter/Space. | complete |
| ROUTE-02 | Make itinerary selection and summaries understandable | `RoutePlannerResults`, `RoutePlannerItineraryCard`, `RoutePlannerItineraryDetail`, itinerary strip/mode components | SHEET-05 | Each result card has one native selection button covering the card, with an accessible summary of times, duration, modes, transfers, and walking. Selection opens a compact preview and moves focus to its view. The preview exposes a separate “Ir” action and “Ver alternativas”; starting a trip requires explicit activation of “Ir”. The selected result remains identified by `aria-pressed` when returning to alternatives. | complete |
| ROUTE-03 | Correct filter semantics | Route filter button/panel, mode/sort/time filters | SHEET-05 | Triggers use `aria-expanded` and `aria-controls`; sort/time are single-selection radio groups; modes are independent toggles/checkboxes; datetime input has a label and validation/error association. | complete |
| ROUTE-04 | Announce planning and navigation state | Route context/results/live bar/active-leg hook | ROUTE-02 | Planning busy, failure, no-results, result count, selected itinerary, and meaningful active-leg changes are announced; rapidly changing distance values do not spam live regions. | complete |

`ROUTE-01`, `ROUTE-02`, and `ROUTE-03` have mostly separate file ownership and can run in parallel after the sheet migration. `ROUTE-04` should follow `ROUTE-02` so the final announcement text reflects the final card semantics.

### Remaining controls and content

| ID | Task | Primary files | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| COMMON-01 | Replace remaining click-only generic elements | `CopyBadge`, `AlertsCarouselSlide`, `SelectOperationalDate` | — | Actions use native buttons/links; copy completion is announced; custom date opens from the actual segmented-control action; icons that add no text are hidden from AT. | complete |
| TRANSIT-01 | Make line, stop, and timetable interactions semantic | `PathWaypoint*`, `Timetable*`, stop timetable rows | — | Expanders expose `aria-expanded`/`aria-controls`; next-date, exception, past-arrival, copy-ID, row, and stop actions are keyboard and screen-reader operable. | complete |
| STATUS-01 | Give loaders, errors, empty states, and feedback completion usable status behavior | app loading, detail loaders, `DetailUnavailable`, feedback flow | — | Loading regions have localized names and `aria-busy`; errors use alerts where appropriate; focus moves to blocking errors; feedback confirmation remains until explicit dismissal instead of disappearing after two seconds. | complete |
| STRUCTURE-01 | Add page landmarks and coherent headings | `app/page.tsx`, sheet/view headers | SHEET-04 | A primary `main` landmark exists; headings describe each view without duplicate visible titles; landmark/heading navigation works in VoiceOver and TalkBack. | complete |

These tasks can run in parallel, with one agent per row to avoid file conflicts.

### Map equivalence and WebView behavior

| ID | Task | Primary files | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| MAP-01 | Define and implement non-pointer alternatives for map actions | `MapView`, overlays, base-map interaction hooks, search/route entry points | ROUTE-01 | Stops, alerts, lines, and places are reachable through search. The map canvas is named and tells the user to search. Vehicles stay on the map. | complete |
| WEBVIEW-01 | Audit the native host contract | Native iOS/Android WebView projects or integration handoff | SHEET-04 | Web content accessibility is not disabled or flattened; native overlays do not steal exploration/focus; Android back closes the top sheet before leaving; reduced motion, text scaling, keyboard, and safe-area values reach the web content. | blocked |

`MAP-01` decision: search is the non-pointer path. Stops, alerts, lines, and places are already there, and a place search replaces press-and-hold. Do not add a “select map centre” button, and do not list live vehicles in search: a line number should find the line, and a fleet number is not something a passenger looks up. Vehicles remain available by tapping the map. Do not make raw map markers individually tabbable.

`WEBVIEW-01` is blocked. This repo has no iOS or Android project that loads `frontend-navegante-app`. The sibling React Native app only embeds WebViews for content pages such as FAQ and news, not this map. Those WebViews do not disable accessibility, and they also do not pass text scaling, reduced motion, or safe-area insets into the page. The web app already reads `env(safe-area-inset-*)` and lets the sheet avoid the keyboard. Android back is not handled here, so a host that leaves on back will not close the top sheet first. Device checks stay in QA-02.

### Visual access and input behavior

| ID | Task | Primary files | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| VISUAL-01 | Restore zoom, selection, and focus visibility | `src/styles/reset.css`, `Search/styles.module.css`, shared interactive CSS | — | Pinch zoom is not blocked; `touch-action: none` is scoped to the map surface; readable text can be selected; every interactive element has a visible high-contrast `:focus-visible` state. | complete |
| VISUAL-02 | Fix contrast failures through tokens | Navegante color tokens and affected component styles | — | Normal text reaches 4.5:1, large text and UI indicators 3:1 in light/dark themes; known failing blue/red/grey combinations are replaced at the token level where possible. | pending |
| VISUAL-03 | Improve target sizes and reflow | compact buttons, chips, close/back, filters, viewport layouts | VISUAL-01 | WCAG 24-by-24 minimum and spacing are met everywhere; primary mobile targets aim for 44-by-44 without changing visible icon sizes; UI remains usable at 200% text and narrow width. | pending |
| MOTION-01 | Verify reduced-motion behavior | sheet/map/carousel motion styles and options | SHEET-03 | `prefers-reduced-motion` removes non-essential transitions and animated map/sheet movement without hiding state changes. | pending |

`VISUAL-01` and `VISUAL-02` can run in parallel. `VISUAL-03` should follow them to avoid repeated edits to the same component styles.

### Verification and release gate

| ID | Task | Scope | Dependencies | Acceptance criteria | Status |
|---|---|---|---|---|---|
| QA-01 | Expand automated accessibility coverage | Browser tests and CI scripts | All implementation tasks | Axe has no serious/critical violations in covered flows; keyboard tests cover open/close, focus containment/restoration, nested filters, snap controls, search, itinerary selection, and errors. Route browser coverage is implemented; contrast remediation, remaining entity/feedback flows, and CI integration still need completion. | in progress |
| QA-02 | Run physical-device screen-reader matrix | iOS WKWebView and Android WebView | QA-01, WEBVIEW-01 | Required flows pass on current supported iOS/VoiceOver and Android/TalkBack devices; defects are recorded by task ID and retested. | pending |
| QA-03 | Run non-screen-reader accessibility matrix | WebView and browser | QA-01 | External keyboard/Switch Control, 200% text, orientation, dark mode, increased contrast where supported, reduced motion, pinch zoom, software keyboard, and safe areas pass. | pending |

### Current automated browser coverage

- `tests/accessibility/app-shell.spec.ts`: landmarks/language, touch and selection behavior, keyboard focus ring, global search focus containment/restoration, Escape dismissal, semantic search results, and Axe scans.
- `tests/accessibility/route-preview.spec.ts`: card selection, compact preview actions, result selection/sort/scroll preservation, starting/ending a trip, compact new results, and route/search cleanup after closing the final sheet.
- `tests/accessibility/route-accessibility.spec.ts`: nested sort focus containment and restoration, hiding the parent from assistive technology, radio/checkbox semantics and keyboard operation, transport filtering and no-results announcements, labelled date validation, keyboard expansion of compact content, preview focus and background controls, origin/destination modal search, and controlled planning busy/failure/empty states. Axe scans cover filters, preview, route search, and planning errors.

The new route scans allow only the existing `color-contrast` finding tracked by `VISUAL-02`; every other finding fails. Passing these tests does not complete the contrast release gate or replace VoiceOver/TalkBack verification. Remaining automated coverage includes entity-detail loading/unavailable states and feedback completion, plus CI execution of the browser suite.

The nested-filter keyboard regression exposed focus remaining on the background trigger while the modal opened. Modal sheets now ensure focus is inside the dialog when the opening animation finishes, preserving an explicit search-input focus target when provided.

Minimum physical-device flow:

1. Launch and reach search, layers, location, and route-planner controls.
2. Open and close every modal sheet; verify announced name, contained focus, Escape/back behavior, and focus restoration.
3. Open every map-aware sheet; verify the map remains reachable, the sheet is named, the handle expands/collapses, and no clipped control receives invisible focus.
4. Search for origin/destination, plan a route, hear loading/result count, select a route, use all filters, open itinerary detail, and start/end navigation.
5. Open line, stop, vehicle, and alert details through both map and equivalent non-map paths.
6. Trigger loading, empty, error, copy-success, and feedback-success states.

## Recommended delivery slices

1. **Infrastructure:** `A11Y-01`.
2. **Bottom-sheet foundation:** `SHEET-01` to `SHEET-03` by one agent.
3. **Sheet migration:** `SHEET-04` and `SHEET-05`.
4. **Parallel semantic pass:** route/search, common controls, transit controls, statuses/structure, and visual tasks.
5. **Map equivalence and native-host pass:** `MAP-01` and `WEBVIEW-01`.
6. **Release validation:** `QA-01` to `QA-03`.

Do not split a single component folder across concurrent agents. Keep every task independently lintable and reviewable, and add the relevant automated checks in the same change as the behavior.

## Required checks for each implementation task

```bash
npm test -w @tmlmobilidade/go-hub-frontend-navegante-app
npm run lint -w @tmlmobilidade/go-hub-frontend-navegante-app
git diff --check
```

Once `A11Y-01` lands, also run the new browser accessibility command for every task that changes rendered UI.

## References

- React Modal Sheet accessibility guidance: <https://github.com/Temzasse/react-modal-sheet#accessibility>
- React Aria `useDialog`/`useModalOverlay`: <https://react-aria.adobe.com/Modal/useModalOverlay.html>
- React Aria `FocusScope`: <https://react-aria.adobe.com/FocusScope>
