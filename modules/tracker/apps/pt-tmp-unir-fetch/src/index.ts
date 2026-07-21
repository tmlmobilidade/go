/* * */

import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmpUnirV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'tmp-unir-fetch', message: 'Sentry Tracker TMP UNIR Fetch initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker TMP UNIR Fetch' });
	}

	//

	const timer = new Timer();
	let saveCount = 0;

	//

	Logger.info({ message: `[${ITERATION}] Fetching TMP UNIR data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	let response;
	try {
		response = await externalClients.unir.vehiclePositions();
	} catch (error) {
		Logger.error({ error, message: `[${ITERATION}] Error fetching TMP UNIR data from API:` });
		return;
	}

	Logger.info({ message: `[${ITERATION}] Found ${response.message.length ?? 0} Vehicle Events in the TMP UNIR data.` });

	for (const event of response.message) {
		//

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmpUnirV1> = {
			agency_id: 'X7B3N',
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			entity_id: event.id,
			payload: event,
			version: 'pt-tmp-unir-v1',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//

		const alreadyExists = await rawDb.raw.rawVehicleEvents.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawDb.raw.rawVehicleEvents.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from TMP UNIR data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s', throwOnError: true });
