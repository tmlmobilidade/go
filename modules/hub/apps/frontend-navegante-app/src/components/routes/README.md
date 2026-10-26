# Route planner

## Context and state ownership

[RoutePlanner.context.tsx](./RoutePlanner.context.tsx) owns the planner's interaction state and coordinates endpoint selection, views, sheets, itinerary selection, and trip start/end. Components consume it through `useRoutePlannerContext()`:

- `actions`: operations such as `selectDestination`, `planRoute`, and `startItinerary`.
- `data`: endpoints, itineraries, selection, current view, and map geometry.
- `flags`: planning, restoration, navigation, and whether the trip can start.

The public contract is defined in [context.ts](../../types/route-planner/context.ts). The provider composes existing contexts: `UserLocation` owns GPS and heading tracking; `BottomSheet` owns sheet navigation and snap state. Route-specific suspended sheet history is kept in the planner state while a trip is active.

## Reducer and dispatch

[state.ts](../../utils/route-planner/planning/state.ts) defines `RoutePlannerState`, its initial values, and the typed events handled by `routePlannerReducer`.

```tsx
dispatch({ type: 'preview-itinerary', index: 2 });
```

`dispatch` queues an event. React passes the current state and event to the reducer, which returns the next state. In this example, the selected itinerary changes and the view becomes `itinerary-detail`. The updated state is available on a subsequent render; dispatch does not update variables captured by the current action.

Reducer transitions are pure. HTTP requests, GPS requests, translations, and sheet operations happen in the context or hooks. Related field changes belong in one named transition rather than being spread across individual setters.

## Planning and supporting hooks

Hooks live in [hooks/route-planner](../../hooks/route-planner/).

| Hook | Responsibility |
| --- | --- |
| `useRoutePlannerPlanning` | Planning and restoration workflows, error handling, invalidation, and request lifetime guards. |
| `useRoutePlannerPlanData` | MOTIS requests through SWR, fetched itineraries, and loading state. |
| `useRoutePlannerOrigin` | Creates planner endpoints from device location; resolves an existing origin or cached location and can explicitly request a fresh position. |
| `useRoutePlannerMapLayers` | Prepares itinerary-related alerts, contextual line shapes, vehicle filters, and camera-fit features. |
| `useRoutePlannerActiveLeg` | Calculates the active leg and progress from the itinerary and user position. |
| `useMotisLegDisplayLabel` | Provides translated leg labels. |

Fetched itineraries and loading state belong to SWR; interaction state belongs to the reducer. The context combines both and derives the selected itinerary and map geometry.

## Typical flow

Selecting a destination calls a context action, invalidates the previous plan, stores the endpoint, and resolves the origin. If an origin is missing, the picker opens. Otherwise, the planning hook dispatches `plan-started` and requests itineraries. SWR supplies results, the planning hook handles errors or empty results, and the context exposes the updated selection and geometry.

Planning and restoration share request guards. Older completions must not dispatch changes after a newer request, invalidation, or unmount. Preserve these checks when changing async workflows.

[AppStatePersistence](../common/persistence/AppStatePersistence/index.tsx) reads and writes saved sessions and calls the planner's restoration actions. It pauses saving while session route restoration is in progress.

## Making changes

- Put user action coordination in the main context, async planning/restoration in the planning hook, and pure state transitions in the reducer.
- Keep the `actions`, `data`, and `flags` contract consistent for consumers.
- Cover transition rules in `tests/route-planner/state.test.ts`; cover request races in `tests/accessibility/route-request-races.spec.ts`.
- Check endpoint editing, previews, trip start/end, and reload restoration when changing planner behavior. See [the test guide](../../../tests/README.md).
