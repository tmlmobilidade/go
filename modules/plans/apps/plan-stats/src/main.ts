/* * */

import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { computePlanVkm } from './compute-plan-vkm.js';

export async function main() {
	//
	// Retrieve all Plans from the database
	// and iterate on each one.

	const allPlansData = await plans.findMany({}, { sort: { 'gtfs_feed_info.feed_start_date': 1 } });

	if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

	Logger.info(`Found ${allPlansData.length} Plans to process...`);

	//
	// For each plan, validate it and import its GTFS into
	// a database and cut it according to the plan's feed_info dates.

	for (const [planIndex, planData] of allPlansData.entries()) {
		//

		const planTimer = new Timer();

		Logger.info(`[${planIndex + 1}/${allPlansData.length}] - Agency ${planData.gtfs_agency.agency_id} - Plan ${planData._id}`);

		const calculatevkms = await computePlanVkm(planData);
	}
}
