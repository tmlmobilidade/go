# Component Reference

This document provides a detailed reference to the specific files, classes, queries, and materialized views that make up the `@modules/eta` architecture.

## 1. Node.js Applications (`apps/`)

### Loader App (`apps/loader/src/index.ts`)
The primary ingress and processing orchestration service.
*   `fetchCurrentWindowRides(ridesQuery)`: Polls MongoDB for rides active within +/- 1 hour of the current time.
*   `fetchHistoricalRidesForDayIndex(ridesQuery, dayIndex)`: Batches historical rides up to `AppConfig.historicalDataDaysBack`.
*   `syncShapeNodes(clickhouseClient, hashedShapeIds)`: Orchestrates the GeoJSON chunking logic using `@tmlmobilidade/geo` tools, chunking lines by distance (e.g. 25 meters).
*   `buildHistNodeTravelTimes(clickhouseClient, windowStart)`: Wrapper to execute the heavy historical snapping SQL in manageable date chunks.
*   `syncCurrentWaypoints(clickhouseClient, hashedTripIds)`: Pulls live waypoints for trips active in the current window.

### Cleaner App (`apps/cleaner/src/index.ts`)
The garbage collection service. Runs on an interval to fire cleanup SQL macros.
*   `cleanupCurrentRides()`: Invokes `1-delete-out-of-window-curr-rides.sql`.
*   `cleanupCurrentWaypoints()`: Invokes `3-delete-orphan-curr-waypoints.sql`.
*   `cleanupCurrentVehicleEvents()`: Invokes `2-delete-out-of-window-curr-vehicle-events.sql`.

### API App (`apps/api/src/endpoints/eta/eta.controller.ts`)
The Fastify HTTP interface.
*   `EtaController.getAll()`: Returns all active live ETAs.
*   `EtaController.getByTripId()`: Returns live ETAs specifically for the path parameter `trip_id`.

## 2. ClickHouse Materialized Views (`sql/bootstrap/`)

Materialized Views in ClickHouse act as continuous insert triggers, allowing the ETA system to react to real-time events asynchronously.

*   **`eta.mv_curr_vehicle_events`** (`mv-sync-curr-vehicle-events.sql`)
    *   **Source:** `operation.simplified_vehicle_events` (System-wide streaming telemetry table).
    *   **Action:** When a live ping lands, this MV joins it against `eta.curr_rides` to resolve the shape, fetches the `hist_shape_nodes`, and uses `argMin` + `greatCircleDistance` to locate the current node index.

*   **`eta.mv_pred_node_etas`** (`mv-predict-node-etas.sql`)
    *   **Frequency:** Refreshes every 3 minutes.
    *   **Source:** `eta.hist_node_travel_times_aggregation`.
    *   **Action:** Applies weighted rolling window logic (3d, 7d, 14d, 30d, weekday matches, period matches) to distill historical buckets down to a single definitive float representing seconds to traverse the node.

*   **`eta.mv_pred_trip_stop_etas`** (`mv-predict-trip-stop-etas.sql`)
    *   **Frequency:** Refreshes every 30 seconds.
    *   **Source:** `eta.curr_vehicle_events` (Live positions), `eta.curr_waypoints_snapped` (Upcoming targets), `eta.pred_node_etas` (Predictions).
    *   **Action:** Performs the `sumIf` of travel times strictly between the `current_node_index` and the target `stop_node_index`. Generates the final output table consumed by the `api` submodule.

## 3. SQL Transformation Macros (`sql/loader/`)

*   **`1-insert-historical-vehicle-events.sql`**: Bootstraps basic vehicle event histories.
*   **`2-build_hist_node_travel_times.sql`**: The most complex script in the system. Performs spatial bloom filter pruning, geohash expansion, `lag()`-based speed and bearing validation, monotonic index filtering, and gap interpolation.
*   **`3-aggregate_hist_node_travel_times.sql`**: Responsible for the statistical aggregation into `eta.hist_node_travel_times_aggregation`. Handles mapping absolute timestamps into domain-specific 'School', 'Summer', 'Peak', etc. contexts.
*   **`4-snap-waypoints.sql`**: Once a day, resolves exact waypoint coordinates into strict node indexes so the final summation step (`mv_pred_trip_stop_etas`) operates purely on sequential node math rather than complex spatial logic.