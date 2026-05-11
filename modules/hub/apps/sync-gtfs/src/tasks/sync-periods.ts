/* * */

import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SERVERDB } from '@tmlmobilidade/go-hub-pckg-services/SERVERDB';
import { SERVERDB_KEYS } from '@tmlmobilidade/go-hub-pckg-settings';
import { type DateRange, type NetworkPeriod } from '@tmlmobilidade/go-hub-pckg-types';
import { sortCollator } from '@tmlmobilidade/go-hub-pckg-utils';
import { DateTime } from 'luxon';

/* * */

export const syncPeriods = async () => {
	//

	LOGGER.title(`Sync Periods`);
	const globalTimer = new TIMETRACKER();

	//
	// Fetch all Periods and Dates from NETWORKDB

	const { db } = getGtfsSqliteContext();
	const allPeriods = db.prepare('SELECT * FROM periods').all() as { period_id: string, period_name: string }[];
	const allDates = db.prepare('SELECT * FROM dates').all() as { date: string, period: string }[];

	//
	// Build periods hashmap

	const allPeriodsParsed: NetworkPeriod[] = allPeriods.map((period) => {
		//

		//
		// Parse the dates associated with this period

		const datesForThisPeriod = allDates
			.filter(date => date.period === period.period_id)
			.map(date => date.date)
			.sort((a, b) => sortCollator.compare(a, b));

		//
		// Initiate a variable to hold the active blocks for this period

		const validRanges: DateRange[] = [];

		//
		// Start the block with the first date for this period

		let currentBlock: DateRange = {
			start: datesForThisPeriod[0],
		};

		//
		// Iterate on all dates for this period

		for (let i = 1; i < datesForThisPeriod.length; i++) {
			// Setup the next and previous date strings
			const prevDateString = datesForThisPeriod[i - 1];
			const nextDateString = datesForThisPeriod[i];
			// Setup the next and previous date objects
			const prevDate = DateTime.fromFormat(prevDateString, 'yyyyMMdd');
			const nextDate = DateTime.fromFormat(nextDateString, 'yyyyMMdd');
			// Add a new block if the next date is not sequential to the previous date
			if (prevDate.toFormat('yyyyMMdd') !== nextDate.minus({ days: 1 }).toFormat('yyyyMMdd')) {
				currentBlock.end = prevDateString;
				validRanges.push(currentBlock);
				currentBlock = {
					start: nextDateString,
				};
			}
		}

		//
		// Add the last block

		currentBlock.end = datesForThisPeriod[datesForThisPeriod.length - 1];
		validRanges.push(currentBlock);

		//
		// Return the parsed period

		return {
			id: period.period_id,
			name: period.period_name,
			valid_on: datesForThisPeriod,
			valid_ranges: validRanges,
		};

		//
	});

	//
	// Sort each period in the array

	allPeriodsParsed.sort((a, b) => sortCollator.compare(a.id, b.id));

	//
	// Save the array to the database

	await SERVERDB.set(SERVERDB_KEYS.NETWORK.PERIODS, JSON.stringify(allPeriodsParsed));

	LOGGER.success(`Done updating ${allPeriodsParsed.length} Periods (${globalTimer.get()})`);

	//
};
