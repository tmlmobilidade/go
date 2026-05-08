/* * */

import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SERVERDB } from '@tmlmobilidade/go-navegante-shared-services/SERVERDB';
import { SERVERDB_KEYS } from '@tmlmobilidade/go-navegante-shared-settings';
import { type Plan } from '@tmlmobilidade/go-navegante-shared-types';
import { sortCollator } from '@tmlmobilidade/go-navegante-shared-utils';

/* * */

export const syncPlans = async () => {
	//

	LOGGER.title(`Sync Plans`);
	const globalTimer = new TIMETRACKER();

	//
	// Fetch all Plans from NETWORKDB

	const { db } = getGtfsSqliteContext();
	const allPlans = db.prepare('SELECT * FROM plans').all() as {
		agency_id: string
		plan_end_date: string
		plan_id: string
		plan_start_date: string
	}[];

	//
	// For each item, update its entry in the database

	const allPlansData: Plan[] = [];
	let updatedPlansCounter = 0;

	for (const plan of allPlans) {
		//
		const parsedPlan: Plan = {
			agency_id: plan.agency_id,
			id: plan.plan_id,
			valid_range: {
				end: plan.plan_end_date,
				start: plan.plan_start_date,
			},
		};
		//
		allPlansData.push(parsedPlan);
		//
		updatedPlansCounter++;
		//
	}

	//
	// Save to the database

	allPlansData.sort((a, b) => sortCollator.compare(a.valid_range.start, b.valid_range.start));
	await SERVERDB.set(SERVERDB_KEYS.NETWORK.PLANS, JSON.stringify(allPlansData));

	LOGGER.success(`Done updating ${updatedPlansCounter} Plans (${globalTimer.get()})`);

	//
};
