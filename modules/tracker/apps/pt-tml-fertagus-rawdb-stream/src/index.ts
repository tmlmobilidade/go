/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { parseRawVehicleEventPtTmlFertagusV1 } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEventPtTmlFertagusV1, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

/* * */

const AGENCY_ID = '7NTB1';

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 1_000,
	batch_timeout: 250,
	idle_timeout: 250,
	insertFn: async (data) => {
		await labDb.operation.simplifiedVehicleEvents.insert('JSONEachRow', data);
	},
	title: `pt-tml-fertagus-rawdb-stream`,
});

const ridesMap = new Map<string, string>();

/* * */

async function findTripId(event: RawVehicleEventPtTmlFertagusV1['payload']): Promise<null | string> {
	if (!event.startsAt || !event.stop_id_start || !event.stop_id_end) return null;

	const rideKey = `${event.stop_id_start}-${event.stop_id_end}-${event.startsAt}`;
	const cached = ridesMap.get(rideKey);
	if (cached) return cached;

	const startTimeScheduled = Dates.fromISO(event.startsAt).unix_timestamp;

	const foundRides = await labDb.queryFromString<{ trip_id: string }>(`
		WITH
			rides_latest AS (
				SELECT
					_id,
					hashed_trip_id,
					trip_id
				FROM operation.rides
				WHERE
					agency_id = $1
					AND start_time_scheduled = $2
				ORDER BY
					updated_at DESC
				LIMIT 1 BY _id
			),
			trip_stops AS (
				SELECT
					_id,
					argMin(stop_id, stop_sequence) AS first_stop_id,
					argMax(stop_id, stop_sequence) AS last_stop_id
				FROM (
					SELECT
						_id,
						stop_id,
						stop_sequence
					FROM operation.hashed_trips
					WHERE _id IN (SELECT hashed_trip_id FROM rides_latest)
					ORDER BY
						updated_at DESC
					LIMIT 1 BY _id, stop_sequence
				)
				GROUP BY _id
			)
		SELECT
			r.trip_id
		FROM rides_latest AS r
		INNER JOIN trip_stops AS t ON r.hashed_trip_id = t._id
		WHERE
			t.first_stop_id = $3
			AND t.last_stop_id = $4
	`, {
		1: AGENCY_ID,
		2: startTimeScheduled,
		3: event.stop_id_start,
		4: event.stop_id_end,
	});

	if (foundRides.length === 0) {
		Logger.error({ message: `[pt-tml-fertagus-rawdb-stream] No ride found for event start time scheduled: ${startTimeScheduled} - ${event.stop_id_start} -> ${event.stop_id_end}.` });
		return null;
	}

	if (foundRides.length > 1) {
		Logger.error({ message: `[pt-tml-fertagus-rawdb-stream] Multiple rides found for event start time scheduled: ${startTimeScheduled} - ${event.stop_id_start} -> ${event.stop_id_end}.` });
		return null;
	}

	ridesMap.set(rideKey, foundRides[0].trip_id);
	return foundRides[0].trip_id;
}

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'pt-tml-fertagus-rawdb-stream', message: 'Sentry Tracker Fertagus LabDb Stream initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker Fertagus LabDb Stream' });
	}

	//
	// Watch for changes to the raw Fertagus collection
	// and transform those documents into SimplifiedVehicleEvents.

	const collection = await rawDb.vehicleEvents.ptTmlFertagus.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', async (change) => {
			//

			if (change.operationType !== 'insert' || !change.fullDocument) {
				Logger.error({ message: `[pt-tml-fertagus-rawdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
				return;
			}

			try {
				const tripId = await findTripId(change.fullDocument.payload);
				if (!tripId) return;

				const simplified = parseRawVehicleEventPtTmlFertagusV1(change.fullDocument, tripId);
				if (!simplified) return;

				await writer.write(simplified, { flushCallback: setRidesAsWaiting });
			} catch (error) {
				console.error(error);
				Logger.error({ error, message: `[pt-tml-fertagus-rawdb-stream] Failed to transform document _id="${change.fullDocument._id}"` });
			}
		});
})();
