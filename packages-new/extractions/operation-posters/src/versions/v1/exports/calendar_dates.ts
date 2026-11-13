/* * */

import { type CalendarDates } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context } from '../types/context.js';
import { type CalendarService } from '../types/interfaces.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportCalendarDatesFile(context: OperationPostersV1Context, services: readonly CalendarService[]) {
	//

	//
	// A. Activate each rebuilt service's operating dates

	let exportedDates = 0;

	for (const service of services) {
		for (const date of service.dates) {
			const calendarDate: CalendarDates = {
				date: OperationalDateIntSchema.parse(date),
				exception_type: '1',
				service_id: service._id,
			};
			await context.writers.calendar_dates.write(calendarDate);
			await yieldToEventLoop(++exportedDates);
		}
	}

	//
	// B. Flush calendar_dates.txt

	await context.writers.calendar_dates.flush();

	Logger.info({ message: 'Exported calendar_dates.txt file.' });
}
