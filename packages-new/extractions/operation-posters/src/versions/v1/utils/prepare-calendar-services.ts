/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Tables } from '../types/context.js';
import { type CalendarService, type GtfsCalendar } from '../types/interfaces.js';
import { buildDatesMap } from './build-dates-map.js';
import { rebuildCalendarServices } from './rebuild-calendar-services.js';

/* * */

export async function prepareCalendarServices(sqlTables: OperationPostersV1Tables, plansByService: ReadonlyMap<string, Plan>): Promise<CalendarService[]> {
	//

	//
	// A. Classify operating dates using each service's source plan
	// The imported GTFS defines when each service runs; this map classifies those
	// dates as weekdays, Saturdays or Sundays/holidays using the operator's holidays.
	// For example, a holiday Monday belongs to the Sunday/holiday group.

	const calendarsByPlan = new Map<string, GtfsCalendar>();
	const calendarsByService = new Map<string, GtfsCalendar>();

	for (const [serviceId, plan] of plansByService) {
		let calendar = calendarsByPlan.get(plan._id);
		if (!calendar) {
			const agencyHolidays = await goDb.dates.holidays.findMany({ agency_ids: { $in: [plan.agency_id] } });
			calendar = {
				dates: buildDatesMap({
					end: OperationalDateIntSchema.parse(plan.active_until),
					start: OperationalDateIntSchema.parse(plan.active_from),
				}, agencyHolidays),
				plan_id: plan._id,
			};
			calendarsByPlan.set(plan._id, calendar);
		}
		calendarsByService.set(serviceId, calendar);
	}

	//
	// B. Rebuild services once before any file exporter reads trips or stop times

	const services = await rebuildCalendarServices(sqlTables, calendarsByService);

	Logger.info({ message: 'Merged service IDs into new calendars.' });
	for (const service of services) {
		Logger.info({ message: `Service ID "${service._id}" has ${service.dates.length} dates.` });
	}

	return services;
}
