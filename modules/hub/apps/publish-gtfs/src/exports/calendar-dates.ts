/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate, type Plan } from '@tmlmobilidade/types';

/* * */

export interface ExportedCalendarDatesRow {
	service_id: string
	date: OperationalDate
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
				service_id: `[${planData._id}]${serviceId}`,
				date: operationalDate,
				exception_type: 1,
			};
			await context.writers.calendar_dates.write(parsedCalendarDatesRow);
		}
	}

	await context.writers.calendar_dates.flush();

	Logger.info('Exported calendar_dates.txt file.');
}
