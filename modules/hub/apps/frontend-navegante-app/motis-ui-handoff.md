# MOTIS UI Consumption Handoff

## Purpose

This handoff is for building a new UI that consumes the local MOTIS instance in `/Users/afonsoesteves/Documents/Motis/motis-demo`.

The new UI does not need to know about the demo frontend implementation. It only needs a running MOTIS HTTP API and the endpoints below.

## Suggested Skills

- `diagnose`: use if MOTIS returns empty trips, 404s, bad dates, or proxy failures.
- `browser:control-in-app-browser`: use when testing a browser UI against the local API.
- `prototype`: use if designing a replacement trip-planner UI quickly.

## What Must Be Running

For a new UI, the only required long-running MOTIS service is:

```bash
cd /Users/afonsoesteves/Documents/Motis/motis-demo
docker compose up motis-server
```

That exposes MOTIS at:

```txt
http://localhost:8080
```

The existing `trip-planner` container is only the demo UI/nginx wrapper. A new UI does not need it unless you want to reuse its same-origin `/api/*` proxy pattern.

## One-Time Data Build Lifecycle

MOTIS requires data to be generated before `motis-server` can serve routes.

Input files:

```txt
/Users/afonsoesteves/Documents/Motis/motis-demo/input/osm.pbf
/Users/afonsoesteves/Documents/Motis/motis-demo/input/gtfs/GTFS.zip
```

Run these after changing OSM/GTFS inputs or rebuilding from scratch:

```bash
cd /Users/afonsoesteves/Documents/Motis/motis-demo
docker compose run --rm motis-config
docker compose run --rm motis-import
```

Then run the API:

```bash
docker compose up motis-server
```

`motis-config` and `motis-import` are one-off jobs. They should exit. `motis-server` is the long-running API.

## Base URL For A New UI

If the new UI can call the API directly:

```txt
http://localhost:8080
```

If the new UI is browser-based and hits CORS issues, put a local backend/proxy in front of MOTIS and expose same-origin routes such as:

```txt
/api/v1/geocode
/api/v6/plan
```

The current demo uses nginx to proxy `/api/*` from `http://localhost:5173` to `motis-server:8080`.

## Health Check

Use this as a lightweight API health check:

```http
GET http://localhost:8080/api/v1/map/initial
```

Do not use `HEAD /api/v6/plan` as a health check. MOTIS can return `404` there because `/plan` expects query parameters.

## Search / Autocomplete Endpoint

Use this endpoint to search stops, addresses, and places:

```http
GET http://localhost:8080/api/v1/geocode?text={query}&type=STOP,ADDRESS,PLACE&numResults=8
```

Example:

```bash
curl "http://localhost:8080/api/v1/geocode?text=castanheira&type=STOP,ADDRESS,PLACE&numResults=8"
```

Expected UI behavior:

- User types into From/To.
- UI queries `/api/v1/geocode`.
- UI displays returned matches.
- When the user selects a result:
  - if `type` is `STOP` and `id` exists, route with that stop id.
  - otherwise route with `lat,lon`.

The current demo stores selected stops as `fromPlace=GTFS_...` style ids, which MOTIS accepts.

## Route Planning Endpoint

Use this endpoint to get routes:

```http
GET http://localhost:8080/api/v6/plan
```

Minimum useful query parameters:

```txt
fromPlace=38.7359,-9.1457
toPlace=38.7064,-9.1433
time=2026-06-16T09:00:00+01:00
preTransitModes=WALK
postTransitModes=WALK
directModes=WALK
transitModes=TRANSIT
maxItineraries=5
detailedLegs=true
```

Example with coordinates:

```bash
curl "http://localhost:8080/api/v6/plan?fromPlace=38.7359,-9.1457&toPlace=38.7064,-9.1433&time=2026-06-16T09:00:00%2B01:00&preTransitModes=WALK&postTransitModes=WALK&directModes=WALK&transitModes=TRANSIT&maxItineraries=5&detailedLegs=true"
```

Example with a selected stop id from geocode:

```bash
curl "http://localhost:8080/api/v6/plan?fromPlace=GTFS_439816&toPlace=38.7064,-9.1433&time=2026-06-16T09:00:00%2B01:00&preTransitModes=WALK&postTransitModes=WALK&directModes=WALK&transitModes=TRANSIT&maxItineraries=5&detailedLegs=true"
```

## Route Response Shape

The UI should primarily look for:

```txt
itineraries[]
```

Each itinerary may include:

```txt
startTime
endTime
duration
transfers
legs[]
```

Each leg may include mode, route/headsign metadata, start/end time, and from/to names.

Implementation should be defensive because exact fields vary by mode and result type.

## Current Demo References

Existing demo files:

```txt
/Users/afonsoesteves/Documents/Motis/motis-demo/docker-compose.yml
/Users/afonsoesteves/Documents/Motis/motis-demo/app/app.js
/Users/afonsoesteves/Documents/Motis/motis-demo/nginx.conf
/Users/afonsoesteves/Documents/Motis/motis-demo/README.md
```

The current demo UI is not required for a new UI. Its useful parts are:

- `app/app.js`: request construction examples for geocode and plan.
- `nginx.conf`: same-origin `/api/*` proxy example.
- `docker-compose.yml`: `motis-server` service definition.

## Common Failure Modes

- `MOTIS offline` while routes work: bad health check endpoint. Use `/api/v1/map/initial`.
- Empty trip results: GTFS calendar date is invalid for the requested `time`.
- Empty trip results: coordinates are outside the OSM/GTFS coverage.
- Empty trip results: stops from different feeds are not connected by transfers or walkable OSM paths.
- Browser CORS failure: use a same-origin proxy instead of calling `localhost:8080` directly from another frontend origin.
- Import errors after moving data: rerun `motis-config`, then `motis-import`.

## What The New UI Actually Needs

Required:

```txt
MOTIS API base URL: http://localhost:8080
Route endpoint: GET /api/v6/plan
Search endpoint: GET /api/v1/geocode
Health endpoint: GET /api/v1/map/initial
```

Required running container:

```txt
motis-server
```

Only needed when rebuilding data:

```txt
motis-config
motis-import
```

Not needed for a new UI unless reusing the demo:

```txt
trip-planner
```
