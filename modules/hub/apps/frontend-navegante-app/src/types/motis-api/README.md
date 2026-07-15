# MOTIS API Types

Generated from the MOTIS v2.10.2 OpenAPI:

Only `types.gen.ts` and `schemas.gen.ts` are copied into this app. `services.gen.ts` is intentionally omitted because it depends on `@hey-api/client-fetch`, and the Navegante app currently uses its local `/api/motis` proxy plus `fetch`.

When the pinned MOTIS image changes, regenerate/copy these files from the matching MOTIS OpenAPI output and keep `route-planner-motis.ts` as the normalization boundary for UI-facing route planner types.
