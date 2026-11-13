/* * */

import { type CalendarAssignmentsExt } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { DAY_TYPES } from '../day-types.js';
import { type OperationPostersV1Context } from '../types/context.js';
import { type CalendarService } from '../types/interfaces.js';

/* * */

export async function exportCalendarAssignmentsExtFile(context: OperationPostersV1Context, services: readonly CalendarService[]) {
	//

	//
	// A. Assign each rebuilt service to its matching day type

	const assignments: CalendarAssignmentsExt[] = [];

	for (const service of services) {
		for (const dayType of DAY_TYPES) {
			if (service.day_type !== dayType.day_type) continue;
			assignments.push({ day_type_id: dayType._id, service_id: service._id });
		}
	}

	//
	// B. Write and flush calendar_assignmentsExt.txt when assignments exist

	if (assignments.length) {
		await context.writers.calendar_assignments_ext.write(assignments);
		await context.writers.calendar_assignments_ext.flush();
	}

	Logger.info({ message: assignments.length ? 'Exported calendar_assignmentsExt.txt file.' : 'Skipped calendar_assignmentsExt.txt file because no assignments were found.' });
}
