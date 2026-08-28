/* * */

import { type HubGtfsExportPlans, HubGtfsExportPlansSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the plans.txt file.
 * @param context The export context.
 * @param planData The plan data.
 */
export async function exportPlansFile(context: ExportGtfsContext, planData: Plan) {
	//

	const parsedPlansRow: HubGtfsExportPlans = {
		agency_id: planData.agency_id,
		plan_end_date: planData.gtfs_feed_info.feed_end_date,
		plan_id: planData._id,
		plan_start_date: planData.gtfs_feed_info.feed_start_date,
	};

	const validatedPlansRow = HubGtfsExportPlansSchema.parse(parsedPlansRow);

	await context.writers.plans.write(validatedPlansRow);

	await context.writers.plans.flush();

	Logger.info({ message: 'Exported plans.txt file.' });
}
