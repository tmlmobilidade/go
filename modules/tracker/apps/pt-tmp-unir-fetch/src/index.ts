/* * */

import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { UnirVehicleLocationResponse } from '@tmlmobilidade/external/dist/clients/unir/types.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmpUnirV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

const AGENCY_NAME_ID_MAP = {
	'UT1 - VIANORBUS': 'KJTOU',
	'UT2 - NEX': '1H6XC',
	'UT3 - Porto Mobilidade': 'OP1VZ',
	'UT4 - Transportes Beira Douro': 'VZAS3',
	'UT5 - XERBUS': '8NDX4',
};

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

	let response: UnirVehicleLocationResponse;
	try {
		response = await externalClients.unir.vehiclePositions();
	} catch (error) {
		Logger.error({ error, message: `[${ITERATION}] Error fetching TMP UNIR data from API:` });
		return;
	}

	Logger.info({ message: `[${ITERATION}] Found ${response.message.length ?? 0} Vehicle Events in the TMP UNIR data.` });

	for (const event of response.message) {
		//

		const hashableRawEventHash = crypto
			.createHash('sha256')
			.update(JSON.stringify(event))
			.digest('hex');

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmpUnirV1> = {
			agency_id: AGENCY_NAME_ID_MAP[event.nomeOperador],
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			entity_id: hashableRawEventHash,
			payload: event,
			version: 'pt-tmp-unir-v1',
		};

		//

		const alreadyExists = await rawDb.raw.rawVehicleEvents.findOne({ _id: hashableRawEventHash });

		if (alreadyExists) continue;

		await rawDb.raw.rawVehicleEvents.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventHash,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from TMP UNIR data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1s', throwOnError: true });
