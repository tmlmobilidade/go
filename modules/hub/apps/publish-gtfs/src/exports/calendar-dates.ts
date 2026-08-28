/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { getPublicServiceId } from '@tmlmobilidade/utils';

/* * */

export interface ExportedCalendarDatesRow {
	service_id: string
	date: OperationalDateInt
	exception_type: 1 // Only type 1 (added) is supported in merged exports
}

/**
 * Export the calendar_dates.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportCalendarDatesFile(planData: Plan, sqlTables: GtfsSQLTables, context: ExportGtfsContext) {
	//

	for (const [serviceId, operationalDatesList] of Object.entries(sqlTables.calendar_dates)) {
		for (const operationalDate of operationalDatesList.sort()) {
			const parsedCalendarDatesRow: ExportedCalendarDatesRow = {
				service_id: getPublicServiceId(planData._id, planData.agency_id, serviceId),
				date: OperationalDateIntSchema.parse(operationalDate),
				exception_type: 1,
			};
			await context.writers.calendar_dates.write(parsedCalendarDatesRow);
		}
	}

	await context.writers.calendar_dates.flush();

	Logger.info({ message: 'Exported calendar_dates.txt file.' });
}
