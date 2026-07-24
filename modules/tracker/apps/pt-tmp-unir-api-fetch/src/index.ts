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
	'UT1 - VIANORBUS': {
		collection: 'ptTmpUnirUt1',
		id: 'KJTOU',
	},
	'UT2 - NEX': {
		collection: 'ptTmpUnirUt2',
		id: '1H6XC',
	},
	'UT3 - Porto Mobilidade': {
		collection: 'ptTmpUnirUt3',
		id: 'OP1VZ',
	},
	'UT4 - Transportes Beira Douro': {
		collection: 'ptTmpUnirUt4',
		id: 'VZAS3',
	},
	'UT5 - XERBUS': {
		collection: 'ptTmpUnirUt5',
		id: '8NDX4',
	},
};

/* * */

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tmp-unir-api-fetch', message: 'Sentry Tracker TMP UNIR Fetch initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker TMP UNIR Fetch' });
}

const main = async () => {
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
			agency_id: AGENCY_NAME_ID_MAP[event.nomeOperador].id,
			created_at: Dates.fromFormat(event.recordedAtTime, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_timestamp,
			entity_id: hashableRawEventHash,
			payload: event,
			version: 'pt-tmp-unir-v1',
		};

		//
		const collection = AGENCY_NAME_ID_MAP[event.nomeOperador].collection;

		const alreadyExists = await rawDb.vehicleEvents[collection].findOne({ _id: hashableRawEventHash });

		if (alreadyExists) continue;

		await rawDb.vehicleEvents[collection].insertOne({
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

await runOnInterval(main, { intervalMs: '1s', throwOnError: false });
