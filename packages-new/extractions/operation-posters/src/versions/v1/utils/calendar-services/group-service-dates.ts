/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';

import { type DateGroup } from '../../types/calendar-services.js';
import { type OperationPostersV1Tables } from '../../types/context.js';
import { type GtfsCalendar, type GtfsDate } from '../../types/gtfs-date.js';

/* * */

export function groupServiceDates(tables: OperationPostersV1Tables, serviceIds: Set<string>, calendar: GtfsCalendar, datesByService: Map<string, DateGroup[]>): DateGroup[] {
	//

	//
	// A. Prepare date groups for each day type

	const groups = new Map<GtfsDate['day_type'], DateGroup>();

	//
	// B. Classify each source service once per plan calendar, then reuse its date groups

	for (const serviceId of serviceIds) {
		let serviceGroups = datesByService.get(serviceId);
		if (!serviceGroups) {
			const serviceDates = new Map<GtfsDate['day_type'], DateGroup>();
			for (const gtfsDate of tables.calendar_dates[serviceId]) {
				const date = OperationalDateIntSchema.parse(gtfsDate);
				const metadata = calendar.dates.get(date);
				if (!metadata) throw new Error(`Date ${date} for service_id ${serviceId} has no generated date metadata.`);
				let group = serviceDates.get(metadata.day_type);
				if (!group) {
					group = { dates: new Set(), day_type: metadata.day_type };
					serviceDates.set(metadata.day_type, group);
				}
				group.dates.add(date);
			}
			serviceGroups = [...serviceDates.values()];
			datesByService.set(serviceId, serviceGroups);
		}

		for (const serviceGroup of serviceGroups) {
			let group = groups.get(serviceGroup.day_type);
			if (!group) {
				group = { dates: new Set(), day_type: serviceGroup.day_type };
				groups.set(serviceGroup.day_type, group);
			}
			for (const date of serviceGroup.dates) group.dates.add(date);
		}
	}
	return [...groups.values()];
}
