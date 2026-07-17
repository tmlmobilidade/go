# MOTIS API Types

Generated from the MOTIS v2.10.2 OpenAPI:

Only `types.gen.ts` and `schemas.gen.ts` are copied into this app. `services.gen.ts` is intentionally omitted because it depends on `@hey-api/client-fetch`. Navegante calls the Hub API MOTIS endpoints and keeps these types only for rendering the returned data.

When the pinned MOTIS image changes, regenerate/copy these files from the matching MOTIS OpenAPI output. MOTIS proxying and Hub pattern normalization belong to `modules/hub/apps/api`.
