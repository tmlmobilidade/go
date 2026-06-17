/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubPlan, HubPlanSchema } from '@tmlmobilidade/types';

/* * */

export async function publishApprovedPlans() {
	//

	Logger.title('Publishing approved plans JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve all plans

	const allPlansData = await plans.all();

	Logger.info(`Retrieved ${allPlansData.length} approved plans...`);

	//
	// For each plan, get the file URL

	const approvedPlans: HubPlan[] = [];

	for (const planData of allPlansData) {
		try {
			// Get the operation file URL
			const operationFile = await files.findById(planData.operation_file_id);
			if (!operationFile) throw new Error(`Operation file not found for plan ${planData._id}`);
			// Check if the plans is active
			const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date;
			const nowIsAfterStartDate = planData.gtfs_feed_info?.feed_start_date && currentOperationalDate >= planData.gtfs_feed_info?.feed_start_date;
			const nowIsBeforeEndDate = planData.gtfs_feed_info?.feed_end_date && currentOperationalDate <= planData.gtfs_feed_info?.feed_end_date;
			const isActive = nowIsAfterStartDate && nowIsBeforeEndDate;
			// Parse the plan data
			const parsedPlan = HubPlanSchema.safeParse({
				...planData,
				agency_id: planData.gtfs_agency?.agency_id,
				is_active: isActive,
				operation_file_url: operationFile.url,
			});
			if (!parsedPlan.success) throw new Error(`Error parsing plan ${planData._id}: ${parsedPlan.error.message}`);
			// Add the plan to the list
			approvedPlans.push(parsedPlan.data);
		} catch (error) {
			Logger.error(`Error parsing plan ${planData._id}: ${error.message}`);
		}
	}

	Logger.info(`Parsed ${approvedPlans.length} approved plans...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:plans:approved:json', JSON.stringify(approvedPlans));

	Logger.success(`Finished publishing ${approvedPlans.length} approved plans JSON feed. (${globalTimer.get()})`);

	//
};
