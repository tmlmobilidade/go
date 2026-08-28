/* * */

import { HubGtfsExportCalendarDates, HubGtfsExportCalendarDatesSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { getPublicServiceId } from '@tmlmobilidade/utils';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the calendar_dates.txt file.
 * @param context The export context.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 */
export async function exportCalendarDatesFile(context: ExportGtfsContext, planData: Plan, sqlTables: GtfsSQLTables) {
	//

	for (const [serviceId, operationalDatesList] of Object.entries(sqlTables.calendar_dates)) {
		for (const operationalDate of operationalDatesList.sort()) {
			const parsedCalendarDatesRow: HubGtfsExportCalendarDates = {
				date: operationalDate,
				exception_type: '1',
				service_id: getPublicServiceId(planData._id, planData.agency_id, serviceId),
			};
			const validatedCalendarDatesRow = HubGtfsExportCalendarDatesSchema.parse(parsedCalendarDatesRow);
			await context.writers.calendar_dates.write(validatedCalendarDatesRow);
		}
	}

	await context.writers.calendar_dates.flush();

	Logger.info({ message: 'Exported calendar_dates.txt file.' });
}
