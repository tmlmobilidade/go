# Load-testing plan

## Purpose and scope

This is a reusable plan for testing a service under realistic HTTP traffic. Its first application is MOTIS, before the route planner is released in the app.

The goal is not to find a single impressive maximum requests-per-second (RPS) number. The goal is to answer:

> Can MOTIS serve the expected route-planner demand, with acceptable latency and correct-looking results, for a sustained period?

MOTIS is not yet called by the app, so the PRD deployment may be used for this test. That avoids impact on app users, but it must still be treated as a shared operational system: use an agreed test window, notify relevant operators, avoid timetable/deployment changes during the run, and stop if the abort conditions below are reached.

## What the current dashboards can and cannot prove

Use the three dashboards together:

| Dashboard | Use during the test |
| --- | --- |
| `Routing overview` | Normal routing traffic, routing execution latency, and result shape. |
| `Realtime & timetable health` | Confirms that GTFS-Realtime ingestion and timetable coverage stay healthy while the test runs. |
| `Routing load test` | Primary test view: observed RPS, p50/p95/p99 execution duration, returned journeys, and annotations for every stage. |

The current MOTIS metrics do **not** expose HTTP status codes, timeouts, CPU, memory, or a label identifying load-test traffic. The load generator must therefore be the source of truth for client-visible errors/timeouts, and the test should run on PRD only while no normal application traffic uses MOTIS.

## Estimating a first target from 1,000 daily users

`1,000 users/day` is not enough by itself to determine peak RPS. What matters is how route-search activity clusters in time and how many backend calls the app creates for each visible user search.

Estimate expected sustained request rate with:

```text
peak RPS = daily active users
         × route-planner adoption
         × searches per active user per day
         × backend requests per visible search
         × share of daily searches in the peak window
         ÷ peak-window seconds
```

Use a separate short burst target of roughly 3× the sustained target until real product telemetry exists.

These are deliberately conservative planning scenarios, not forecasts:

| Scenario | Assumptions | Sustained peak | Short burst |
| --- | --- | ---: | ---: |
| Launch | 30% use route planner; 3 searches/user/day; 1 backend call/search; 60% of searches in 2 peak hours | ~0.08 RPS | ~0.25 RPS |
| Working target | 60%; 5 searches; 2 backend calls/search; 70% in 1 peak hour | ~1.2 RPS | ~3.5 RPS |
| Stress envelope | 100%; 10 searches; 3 backend calls/search; 80% in 1 peak hour | ~6.7 RPS | ~20 RPS |

The `backend requests per visible search` term is especially important. Search-as-you-type, map changes, retries, and alternative queries can turn one user action into several MOTIS requests. Confirm this during route-planner integration and revise the table using real telemetry.

For the first MOTIS run, test the working target and the stress envelope. Do not treat the low launch estimate as sufficient evidence of capacity.

## Define success before running the test

Record these values in the test ticket or run log before starting:

| Decision | Initial rule |
| --- | --- |
| Test endpoint | The PRD route-planning endpoint actually used by the future app/proxy, rather than an internal shortcut where possible. |
| Dataset | Production-like timetable and GTFS-Realtime data. |
| Request corpus | A fixed, versioned list of realistic origins, destinations, dates/times, and routing options. |
| Primary latency target | Product decision: maximum acceptable p95 and p99 route-search time. |
| Client failure target | Product decision: maximum acceptable load-generator error/timeout percentage. |
| Sustained target | Start at 1.2 RPS; revise once adoption and frontend request multiplication are known. |
| Burst target | Start at 3.5 RPS; test 20 RPS as the initial stress envelope. |

Until product targets are agreed, use the quiet-system baseline as a guardrail: p95/p99 should not rise materially and remain elevated at the expected sustained target. A service that is fast but returns timeouts or malformed journeys has not passed.

## Prepare the test

1. Choose a change-free PRD window and tell relevant operators when the test starts and ends.
2. Confirm the exact HTTP endpoint, authentication, headers, request body, and rate-limit behaviour used by the future route planner.
3. Build a route corpus with a mix of ordinary and expensive requests. Suggested initial split:
   - 70% ordinary urban origin/destination searches.
   - 20% common high-demand routes and peak-time departures.
   - 10% deliberately more expensive cases: longer cross-network trips, transfer-heavy queries, or options likely to expand the search.
4. Keep the corpus deterministic: record the request JSON, departure times, and expected basic response properties.
5. Configure the load generator for a **constant arrival rate**, not only a fixed number of virtual users. A fixed-user test can hide saturation because a slower server naturally causes fewer requests to be sent.
6. Capture a quiet five-to-ten-minute baseline in all three dashboards before injecting traffic.
7. Open `Routing load test` and set its time range to include the baseline, warm-up, and full test.
8. Open `Realtime & timetable health` beside it.

## Annotations and alerts

Keep `Annotations & Alerts (Built-in)` enabled in the load-test dashboard. It does not generate alerts on its own; it makes manual test-stage notes and future alert events visible over the charts.

Add an annotation at every material moment. Use a consistent naming convention so a screenshot or exported dashboard remains understandable:

```text
LT-YYYY-MM-DD | START | corpus=v1 | target=prd
LT-YYYY-MM-DD | BASELINE | no injected traffic
LT-YYYY-MM-DD | WARM-UP | 0.25 RPS
LT-YYYY-MM-DD | STAGE | 0.5 RPS | 10m
LT-YYYY-MM-DD | STAGE | 1.2 RPS | 30m | expected sustained peak
LT-YYYY-MM-DD | BURST | 3.5 RPS | 5m
LT-YYYY-MM-DD | STRESS | 6.7 RPS | 10m
LT-YYYY-MM-DD | STRESS-BURST | 20 RPS | 2m
LT-YYYY-MM-DD | STOP | load generator stopped
LT-YYYY-MM-DD | RECOVERY CONFIRMED
```

Also create a short external run log with the same timestamps. It must contain the load-generator command/configuration, corpus revision, environment, results, and any manual intervention. Dashboard annotations explain the graphs; the run log makes the test reproducible.

Existing dashboard colour thresholds are visual guidance, not automated alerts. For the first run, manually stop the test if one of these conditions persists for two minutes:

- MOTIS availability is `Down`.
- The load generator reports more than the agreed client-error or timeout rate.
- p99 routing execution duration exceeds 5× the quiet-system baseline.
- Realtime update age keeps rising unexpectedly, or its dashboard turns red.
- Returned journeys become implausible for a stable request corpus.

## MOTIS test sequence

The duration is long enough to show sustained degradation and gives Prometheus enough samples for percentile charts.

| Stage | Rate | Duration | Intent |
| --- | ---: | ---: | --- |
| Baseline | no injected traffic | 10 min | Establish normal latency, freshness, and background request rate. |
| Warm-up | 0.25 RPS | 5 min | Warm connections/caches without making a performance claim. |
| Low | 0.5 RPS | 10 min | Verify corpus, dashboards, and response validation. |
| Expected peak | 1.2 RPS | 30 min | Main acceptance test. |
| Burst | 3.5 RPS | 5 min | Test short clustering above expected sustained demand. |
| Stress | 6.7 RPS | 10 min | Establish headroom under a high-adoption model. |
| Stress burst | 20 RPS | 2 min | Optional. Observe failure behaviour; stop on abort conditions. |
| Recovery | no injected traffic | 10 min | Confirm latency, availability, and realtime ingestion return to baseline. |

Do not advance to the next stage if the previous stage has unresolved failures. End the run immediately if an abort condition is met, add an annotation, retain the dashboard time range, and begin recovery observation.

## What to watch in real time

### Routing load test dashboard

- `Routing requests/sec` should match the arrival rate configured in the load generator. If it does not, investigate the endpoint, proxy, dropped requests, or traffic already reaching MOTIS.
- `Routing execution duration` is the key graph. Compare p95 and p99 against the baseline at every annotated stage.
- `Routing requests in selected range` validates that the intended number of requests reached MOTIS.
- `Journeys found/sec` and `Journeys per request` should remain consistent for the same fixed corpus. Inspect sample responses too; this is only a coarse correctness signal.
- `Measured routing executions/sec` should broadly track routing requests/sec. A large mismatch is useful evidence that request and execution metrics represent different work.

### Realtime & timetable health dashboard

- `Realtime update age` should not climb continuously due to the test.
- `Feed data age` separates a stale source feed from a MOTIS ingestion issue.
- `Update success ratio` should remain near 100% when updates occur.
- Trip-resolution and update-error rates should not suddenly rise.

### Load-generator report

Record separately:

- attempted requests, completed requests, HTTP status distribution, client errors, and timeouts;
- client-observed p50/p95/p99 duration, which includes proxy/network overhead absent from MOTIS execution duration;
- a small sample of responses checked against expected properties, such as a non-empty journey where one is expected.

## After the test

1. Keep the dashboard time range on the completed run and save/export screenshots with annotations visible.
2. Produce a short result table for every stage: observed RPS, generator errors/timeouts, client p95/p99, MOTIS p95/p99 execution duration, journeys/request, and realtime update age.
3. State one of three outcomes:
   - **Pass:** expected peak held for 30 minutes within agreed latency/error targets and recovered cleanly.
   - **Conditional pass:** expected peak passed, but missing resource/error telemetry prevents a confident headroom claim.
   - **Fail:** identify the first failing stage and the observed symptom.
4. Turn the most useful test findings into the next monitoring work: HTTP outcome metrics, container CPU/memory, and alerts for availability/realtime freshness.
5. Update the traffic model when real route-planner telemetry becomes available. Replace assumptions with observed adoption, searches/user, request multiplication, peak-window concentration, and burstiness.

## Reuse for another service

Keep the structure, but replace the service-specific pieces:

- Define the user action and backend request multiplication factor.
- Use the endpoint users actually reach.
- Choose service-specific correctness checks and dependency-health dashboards.
- Base the sustained target on observed or modelled peak demand, then test a higher burst/stress envelope.
- Record stages as annotations and make the test reproducible from a versioned corpus and load-generator configuration.

