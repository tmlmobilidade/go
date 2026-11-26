/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { HubV1ApiVehicleEventsLast24hSchema } from '@tmlmobilidade/go-types-hub';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const WINDOW_MS = 24 * 60 * 60 * 1000;

/* * */

export async function publishVehicleEventsLast24h() {
	//

	Logger.title('Publishing Vehicle Events in the Last 24h...');

	const globalTimer = new Timer();

	//
	// Count vehicle events created in the window.
	// The operational_date bound prunes partitions and primary key ranges;
	// two days back covers the whole window even across operational day boundaries.

	const to = Date.now();
	const from = to - WINDOW_MS;

	const count = await labDb.operation.simplifiedVehicleEvents.count(
		'*',
		'operational_date >= toUInt32(toYYYYMMDD(now() - INTERVAL 2 DAY)) AND created_at >= $1 AND created_at < $2',
		{ 1: from, 2: to },
	);

	const result = HubV1ApiVehicleEventsLast24hSchema.parse({ count: Number(count), from, to });

	Logger.info({ message: `Counted ${result.count} vehicle events in the last 24h in ${globalTimer.get()}` });

	//
	// Save the result in API Cache

	await cacheDb.set('hub:v1:metrics:vehicle-events:last-24h:json', JSON.stringify(result));

	Logger.success(`Finished publishing Vehicle Events in the Last 24h (${globalTimer.get()})`);

	//
};
