/* * */

import { externalClients } from '@tmlmobilidade/external';
import { type UnirVehicleLocationResponse } from '@tmlmobilidade/external/dist/clients/unir/types.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmpUnir } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import crypto from 'node:crypto';

import { ut1Writer, ut2Writer, ut3Writer, ut4Writer, ut5Writer } from '../utils/writers.js';

/* * */

const AGENCY_NAME_ID_MAP = {
	'UT1 - VIANORBUS': {
		collection: 'ptTmpUnirUt1',
		id: 'KJTOU',
		version: 'pt-tmp-unir-ut1-v1',
	},
	'UT2 - NEX': {
		collection: 'ptTmpUnirUt2',
		id: '1H6XC',
		version: 'pt-tmp-unir-ut2-v1',
	},
	'UT3 - Porto Mobilidade': {
		collection: 'ptTmpUnirUt3',
		id: 'OP1VZ',
		version: 'pt-tmp-unir-ut3-v1',
	},
	'UT4 - Transportes Beira Douro': {
		collection: 'ptTmpUnirUt4',
		id: 'VZAS3',
		version: 'pt-tmp-unir-ut4-v1',
	},
	'UT5 - XERBUS': {
		collection: 'ptTmpUnirUt5',
		id: '8NDX4',
		version: 'pt-tmp-unir-ut5-v1',
	},
	// 'UT6 - Transporte Fluvial': {
	// 	collection: 'ptTmpUnirUt6',
	// 	id: 'VZAS3',
	// 	version: 'pt-tmp-unir-ut6-v1',
	// },
} as const;

/* * */

/**
 * Fetches the TMP UNIR vehicle locations from the API and writes the ones
 * not yet stored to the RawVehicleEvents collection of the matching operator.
 * @param iteration The current run number, used to tag log messages
 * @returns The number of new Vehicle Events saved, or null if the API call failed
 */
export async function fetchVehicleEvents(iteration: number): Promise<null | number> {
	//

	let saveCount = 0;

	//
	// Fetch the TMP UNIR Vehicle Events data from the API

	Logger.info({ message: `[${iteration}] Fetching TMP UNIR data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	let response: UnirVehicleLocationResponse;
	try {
		response = await externalClients.unir.vehiclePositions();
	} catch (error) {
		Logger.error({ error, message: `[${iteration}] Error fetching TMP UNIR data from API:` });
		return null;
	}

	Logger.info({ message: `[${iteration}] Found ${response.message.length ?? 0} Vehicle Events in the TMP UNIR data.` });

	//
	// Transform each message into a RawVehicleEvent

	for (const event of response.message) {
		//

		//
		// Hash the whole event to create a unique identifier for it.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database.

		const hashableRawEventHash = crypto
			.createHash('sha256')
			.update(JSON.stringify(event))
			.digest('hex');

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmpUnir> = {
			agency_id: AGENCY_NAME_ID_MAP[event.nomeOperador].id,
			created_at: Dates.fromFormat(event.recordedAtTime, 'yyyy-MM-dd HH:mm:ss', 'Europe/Lisbon').unix_milliseconds,
			entity_id: hashableRawEventHash,
			payload: event,
			version: AGENCY_NAME_ID_MAP[event.nomeOperador].version,
		};

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection of the matching operator

		const collection = AGENCY_NAME_ID_MAP[event.nomeOperador].collection;

		const alreadyExists = await rawDb.vehicleEvents[collection].findOne({ _id: hashableRawEventHash });

		if (alreadyExists) continue;

		const insertableDocument = {
			...hashableRawEvent,
			_id: hashableRawEventHash,
			received_at: Dates.now('Europe/Lisbon').unix_milliseconds,
		} as typeof insertableDocument[number];

		if (collection === 'ptTmpUnirUt1') await ut1Writer.write(insertableDocument);
		if (collection === 'ptTmpUnirUt2') await ut2Writer.write(insertableDocument);
		if (collection === 'ptTmpUnirUt3') await ut3Writer.write(insertableDocument);
		if (collection === 'ptTmpUnirUt4') await ut4Writer.write(insertableDocument);
		if (collection === 'ptTmpUnirUt5') await ut5Writer.write(insertableDocument);

		saveCount++;
	}

	return saveCount;

	//
}
