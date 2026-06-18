/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate } from '@tmlmobilidade/types';

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
export async function exportPlansFile(agencyId: string, planId: string, planStartDate: OperationalDate, planEndDate: OperationalDate, context: ExportGtfsContext) {
	//

	const parsedPlansRow: ExportedPlansRow = {
		agency_id: agencyId,
		plan_id: planId,
		plan_end_date: planEndDate,
		plan_start_date: planStartDate,
	};

	await context.writers.plans.write(parsedPlansRow);

	await context.writers.plans.flush();

	Logger.info({ message: 'Exported plans.txt file.' });
}
