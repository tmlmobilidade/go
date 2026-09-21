/* * */

import { getQualifiedServiceId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type HubV1GtfsCalendarDatesInput, HubV1GtfsCalendarDatesSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the calendar_dates.txt file.
 * @param context The export context.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 */
export async function exportCalendarDatesFile(context: ExportGtfsContext, planData: Plan, sqlTables: GtfsSQLTables) {
	//

	for (const [serviceId, calendarDatesList] of Object.entries(sqlTables.calendar_dates)) {
		for (const calendarDate of calendarDatesList.sort()) {
			const parsedCalendarDatesRow: HubV1GtfsCalendarDatesInput = {
				date: calendarDate,
				exception_type: '1',
				service_id: getQualifiedServiceId(planData._id, planData.agency_id, serviceId),
			};
			const validatedCalendarDatesRow = HubV1GtfsCalendarDatesSchema.parse(parsedCalendarDatesRow);
			await context.writers.calendar_dates.write(validatedCalendarDatesRow);
		}
	}

	await context.writers.calendar_dates.flush();

	Logger.info({ message: 'Exported calendar_dates.txt file.' });
}
