# Hub Metrics Publisher

The publisher separates metrics by freshness and storage contract:

```text
src/
├── helpers/
│   ├── historical/
│   └── realtime/
├── tasks/
│   ├── historical/
│   └── realtime/
└── tests/
    ├── historical/
    └── realtime/
```

Realtime tasks publish current operational-day snapshots every 30 seconds and
use the Redis namespace `hub:v2:metrics:realtime:*`.

Historical demand tasks query the canonical Performance history once per
ten-minute slot and use `hub:v2:metrics:historical:*`. Agency, line, and pattern
tasks run sequentially; each task calculates its supported grains concurrently.

During the realtime namespace migration, publishers write both the new
namespaced keys and their previous `hub:v2:metrics:*` equivalents. Hub API
readers prefer the namespaced key and fall back to the legacy key. Historical
keys have no compatibility alias because they are not yet consumed publicly.
