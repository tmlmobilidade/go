/* eslint-disable perfectionist/sort-objects */
/* * */

import { type Calendars } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { type CalendarService } from '../types/interfaces.js';

/* * */

export async function exportCalendarFile(context: OperationPostersV1Context, services: readonly CalendarService[], exportConfig: ExportHitouchConfig) {
	//

	//
	// A. Write each rebuilt service's date range
	// Dates are activated explicitly in calendar_dates.txt, so all weekdays stay off.

	if (exportConfig.source_has_calendar) {
		for (const service of services) {
			const calendar: Calendars = {
				service_id: service._id,
				start_date: OperationalDateIntSchema.parse(service.dates.at(0) ?? exportConfig.date_range.start),
				end_date: OperationalDateIntSchema.parse(service.dates.at(-1) ?? exportConfig.date_range.end),
				monday: '0',
				tuesday: '0',
				wednesday: '0',
				thursday: '0',
				friday: '0',
				saturday: '0',
				sunday: '0',
			};
			await context.writers.calendars.write(calendar);
		}
	}

	//
	// B. Flush calendar.txt

	await context.writers.calendars.flush();

	Logger.info({ message: exportConfig.source_has_calendar ? 'Exported calendar.txt file.' : 'Skipped calendar.txt file because the source has no calendar.' });
}
