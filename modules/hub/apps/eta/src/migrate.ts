import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { getAppConfig } from './config.js';
import { aggregateHistNodeTravelTimes } from './tasks/aggregate-hist-node-travel-times.js';
import { bootstrap } from './tasks/bootstrap.js';
import { utcDayChunks } from './utils/day-coverage.js';

/** Add schema, backfill support, then install jobs. Legacy output remains
 * available while the separate v2 trip-stop pipeline warms. */
Logger.init();
await bootstrap({ schemaOnly: true });
const { processing } = await getAppConfig();
await aggregateHistNodeTravelTimes(utcDayChunks(processing.historicalRidesStartTime, processing.historicalRidesEndTime));
await bootstrap();
for (const view of ['eta.mv_cached_shape_node_geometry', 'eta.mv_pred_node_etas', 'eta.mv_curr_vehicle_events', 'eta.mv_pred_trip_stop_etas_v2']) {
	await labDb.command({ query: `SYSTEM REFRESH VIEW ${view}` });
	await labDb.command({ query: `SYSTEM WAIT VIEW ${view}` });
}
Logger.terminate('ETA schema and statistics migrated. Verify fresh v2 coverage before switching publishers.');
