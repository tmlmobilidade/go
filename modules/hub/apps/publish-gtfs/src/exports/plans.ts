/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate, Plan } from '@tmlmobilidade/types';

/* * */

export interface ExportedPlansRow {
	agency_id: string
	plan_end_date: OperationalDate
	plan_id: string
	plan_start_date: OperationalDate
}

/**
 * Export the plans.txt file.
 * @param agencyId The agency ID.
 * @param planId The plan ID.
 * @param planStartDate The plan start date.
 * @param planEndDate The plan end date.
 * @param context The export context.
 */
export async function exportPlansFile(planData: Plan, context: ExportGtfsContext) {
	//

	const parsedPlansRow: ExportedPlansRow = {
		agency_id: planData.agency_id,
		plan_id: planData._id,
		plan_end_date: planData.gtfs_feed_info.feed_end_date,
		plan_start_date: planData.gtfs_feed_info.feed_start_date,
	};

	await context.writers.plans.write(parsedPlansRow);

	await context.writers.plans.flush();

	Logger.info({ message: 'Exported plans.txt file.' });
}
