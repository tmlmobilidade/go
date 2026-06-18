/* * */

import type { TripRef } from '@/parse-trip-ref.js';
import type { CurrVehicleEvent, EnrichedEta, ReplaySnapshot } from '@/types.js';
import type { ClickHouseClient } from '@clickhouse/client';
import type { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

import { pipelinePath, qualifiedTable, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const SYNC_CURR_VEHICLE_EVENT_SQL = 'test/sync-curr-vehicle-event.sql';
const REPLAY_PRED_TRIP_STOP_ETAS_SQL = 'test/replay-pred-trip-stop-etas.sql';

async function readCurrVehicleEvent(clickhouseClient: ClickHouseClient, database: string, eventId: string): Promise<CurrVehicleEvent | null> {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT * FROM ${qualifiedTable(database, 'curr_vehicle_events')}
			WHERE _id = {event_id:String}
			ORDER BY created_at DESC
			LIMIT 1
		`,
		query_params: { event_id: eventId },
	});
	const rows = await result.json<CurrVehicleEvent>();
	return rows[0] ?? null;
}

/**
 * Verifies that `curr_rides` contains a row for the trip. The sync SQL joins on
 * `curr_rides`, so a missing ride silently drops every replayed event.
 */
async function ensureRidePresent(clickhouseClient: ClickHouseClient, database: string, tripRef: TripRef) {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT count() AS n FROM ${qualifiedTable(database, 'curr_rides')}
			WHERE trip_id = {trip_id:String}
		`,
		query_params: { trip_id: tripRef.tripId },
	});
	const rows = await result.json<{ n: string }>();
	const count = Number.parseInt(rows[0]?.n ?? '0', 10);
	if (count === 0) {
		throw new Error(
			`No row in curr_rides for trip_id=${tripRef.tripId}. The loader's current window does not cover this trip's operational date `
			+ `(${tripRef.operationalDate}). Re-run without --skip-loader so the analyzer picks the correct day, or pass a --time-start that falls within ${tripRef.operationalDate}.`,
		);
	}
	Logger.info({ message: `curr_rides has ${count} row(s) for trip_id=${tripRef.tripId}` });
}

/**
 * Replays vehicle events through the ETA pipeline one at a time and captures
 * the stop ETA snapshot produced after each event. Each iteration:
 *   1. Inserts the snapped position into curr_vehicle_events via test SQL.
 *   2. Reads back the inserted row for inclusion in the snapshot.
 *   3. Runs the replay ETA query (mirrors mv_pred_trip_stop_etas) using the
 *      event's `created_at` as the wall clock.
 */
export async function replayEvents(
	clickhouseClient: ClickHouseClient,
	database: string,
	tripRef: TripRef,
	events: SimplifiedVehicleEvent[],
): Promise<ReplaySnapshot[]> {
	Logger.title('Phase 3: Replaying events through ETA pipeline');

	await ensureRidePresent(clickhouseClient, database, tripRef);

	const snapshots: ReplaySnapshot[] = [];
	const phaseTimer = new Timer();
	let missingSyncs = 0;

	for (let index = 0; index < events.length; index++) {
		const event = events[index];
		const eventTimer = new Timer();

		await queryEtaFromFile(clickhouseClient, database, pipelinePath(SYNC_CURR_VEHICLE_EVENT_SQL), {
			event_id: event._id,
			trip_id: tripRef.tripId,
		});

		const currVehicleEvent = await readCurrVehicleEvent(clickhouseClient, database, event._id);

		const etas = await queryEtaFromFile<EnrichedEta>(clickhouseClient, database, pipelinePath(REPLAY_PRED_TRIP_STOP_ETAS_SQL), {
			now_ms: event.created_at,
			trip_id: tripRef.tripId,
		});

		snapshots.push({
			curr_vehicle_event: currVehicleEvent,
			etas,
			event,
			event_index: index,
		});

		if (currVehicleEvent === null) missingSyncs += 1;

		Logger.progress({ message: `[${index + 1}/${events.length}] event=${event._id} node=${currVehicleEvent?.node_index ?? 'n/a'} stops=${etas.length} (${eventTimer.get()}s)`, spacesAfterOrBefore: 1 });
	}

	if (missingSyncs > 0) {
		Logger.error(
			{ message: `${missingSyncs}/${events.length} events did not produce a curr_vehicle_events row. ` + 'Likely the trip\'s hashed_shape_id has no rows in hist_shape_nodes (loader skipped it).', spacesAfterOrBefore: 1 },
		);
	}

	Logger.success(`Replay phase completed in ${phaseTimer.get()} seconds (${snapshots.length} snapshots)`);
	return snapshots;
}
