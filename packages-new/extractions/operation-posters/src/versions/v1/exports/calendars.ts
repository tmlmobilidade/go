/* eslint-disable perfectionist/sort-objects */
/* * */

import { type OperationPostersV1CalendarAssignmentsExt, type OperationPostersV1CalendarDates, type OperationPostersV1Calendars } from '@tmlmobilidade/go-types-operation';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { DAY_TYPES } from '../day-types.js';
import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { type GtfsCalendar } from '../types/gtfs-date.js';
import { rebuildCalendarServices } from '../utils/rebuild-calendar-services.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportCalendarFiles(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig, calendarsByService: Map<string, GtfsCalendar>) {
	//

	//
	// A. Rebuild services and prepare the calendar assignments

	const services = await rebuildCalendarServices(sqlTables, calendarsByService);
	const assignments: OperationPostersV1CalendarAssignmentsExt[] = [];
	let exportedDates = 0;

	//
	// B. Write calendars, day-type assignments and operating dates

	Logger.info({ message: 'Writing rebuilt calendar files...' });

	for (const service of services) {
		//
		// 1. Write the service date range
		// Dates are activated explicitly in calendar_dates.txt, so all weekdays stay off.

		if (exportConfig.source_has_calendar) {
			const calendar: OperationPostersV1Calendars = {
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

		//
		// 2. Assign the service to its matching day type

		for (const dayType of DAY_TYPES) {
			if (service.day_type !== dayType.day_type) continue;
			assignments.push({ day_type_id: dayType._id, service_id: service._id });
		}

		//
		// 3. Activate each operating date explicitly

		for (const date of service.dates) {
			const calendarDate: OperationPostersV1CalendarDates = {
				date: OperationalDateIntSchema.parse(date),
				exception_type: '1',
				service_id: service._id,
			};
			await context.writers.calendar_dates.write(calendarDate);
			await yieldToEventLoop(++exportedDates);
		}
	}

	//
	// C. Flush the calendar files and assignments

	await context.writers.calendars.flush();
	await context.writers.calendar_dates.flush();
	if (assignments.length) {
		await context.writers.calendar_assignments_ext.write(assignments);
		await context.writers.calendar_assignments_ext.flush();
	}

	//
	// D. Log the exported files and service date counts

	const files = [
		...(exportConfig.source_has_calendar ? ['calendar.txt'] : []),
		'calendar_dates.txt',
		...(assignments.length ? ['calendar_assignmentsExt.txt'] : []),
	];
	Logger.info({ message: `Exported ${files.join(', ')} files.` });
	Logger.info({ message: 'Merged service IDs into new calendars.' });
	for (const service of services) {
		Logger.info({ message: `Service ID "${service._id}" has ${service.dates.length} dates.` });
	}
}
