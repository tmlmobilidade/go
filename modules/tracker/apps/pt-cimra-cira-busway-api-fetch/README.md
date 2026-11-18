# CIRA Busway vehicle events

Agency: `6QI7P` (CIRA Busway), Optibus code: `c-aec56622`.

Set `PT_CIRA_VEHICLE_EVENTS_URL` in the runtime environment to:

```text
https://api.control.optibus.co/opendata/v1/gtfs-rt/vehicle-positions?uid=c-aec56622
```

The `/opendata/v1/gtfs` endpoint serves a static GTFS ZIP, not vehicle positions.

The fetch worker polls every 10 seconds and deduplicates events in the
`vehicle-events.pt-cimra-cira-busway` raw collection. The `pt-cimra-cira-busway-rawdb-stream`
worker converts inserts into simplified vehicle events and triggers ride
processing. The `pt-cimra-cira-busway-rawdb-sync` worker recovers missing simplified
events every 30 minutes.

After installing and building workspace dependencies, run the three workers with
`npm run dev:tracker:pt-cimra-cira-busway` (staging environment) or
`npm run prd:tracker:pt-cimra-cira-busway` (production environment).
