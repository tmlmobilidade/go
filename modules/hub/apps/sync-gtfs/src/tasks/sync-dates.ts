/* * */

import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SERVERDB } from '@tmlmobilidade/go-hub-pckg-services/SERVERDB';
import { SERVERDB_KEYS } from '@tmlmobilidade/go-hub-pckg-settings';
import { convertGTFSBoolToBoolean, type NetworkDate } from '@tmlmobilidade/go-hub-pckg-types';
import { sortCollator } from '@tmlmobilidade/go-hub-pckg-utils';

/* * */

export const syncDates = async () => {
	//

	LOGGER.title(`Sync Dates`);
	const globalTimer = new TIMETRACKER();

	//
	// Fetch all Dates from NETWORKDB

	const { db } = getGtfsSqliteContext();
	const allDates = db.prepare('SELECT * FROM dates').all() as {
		date: string
		day_type: string
		description: string
		holiday: string
		period: string
	}[];

	//
	// For each item, update its entry in the database

	const allDatesData: NetworkDate[] = [];
	let updatedDatesCounter = 0;

	for (const date of allDates) {
		//
		const parsedDate: NetworkDate = {
			day_type: date.day_type as NetworkDate['day_type'],
			description: date.description,
			holiday: convertGTFSBoolToBoolean(date.holiday as unknown as Parameters<typeof convertGTFSBoolToBoolean>[0]),
			id: date.date,
			period_id: date.period,
		};
		//
		allDatesData.push(parsedDate);
		//
		updatedDatesCounter++;
		//
	}

	//
	// Save to the database

	allDatesData.sort((a, b) => sortCollator.compare(a.id, b.id));
	await SERVERDB.set(SERVERDB_KEYS.NETWORK.DATES, JSON.stringify(allDatesData));

	LOGGER.success(`Done updating ${updatedDatesCounter} Dates (${globalTimer.get()})`);

	//
};
