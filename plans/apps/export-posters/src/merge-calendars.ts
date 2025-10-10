/* * */

import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type OperationalDate } from '@tmlmobilidade/types';
import { generateRandomString, Logs } from '@tmlmobilidade/utils';

/* * */

export function mergeServiceIds(sqlTables: GtfsSQLTables) {
	//

	//
	// Get all unique Pattern IDs from trips

	const allPatternIds = sqlTables.trips.all().map(trip => trip.pattern_id);
	const allUniquePatternIds = Array.from(new Set(allPatternIds));

	Logs.info(`Found ${allUniquePatternIds.length} unique pattern IDs in trips.`);

	const finalServiceIdMap: Record<string, OperationalDate[]> = {};

	//
	// Loop through each pattern_id and find trips associated with it

	for (const patternId of allUniquePatternIds) {
		//

		//
		// Get all trips with this pattern_id

		const tripsWithPattern = sqlTables.trips.all('WHERE pattern_id = ?', [patternId]);

		if (!tripsWithPattern?.length) continue;

		//
		// Group trips by start_time

		const tripsByStartTime: Record<string, typeof tripsWithPattern> = {};

		for (const trip of tripsWithPattern) {
			// Get stop_times for this trip to determine start_time
			const stopTimesForTrip = sqlTables.stop_times.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [trip.trip_id]);
			if (!stopTimesForTrip?.length) continue;
			// Use arrival_time of first stop
			// as start_time and group trips by it
			if (!tripsByStartTime[stopTimesForTrip[0].arrival_time]) {
				tripsByStartTime[stopTimesForTrip[0].arrival_time] = [];
			}
			tripsByStartTime[stopTimesForTrip[0].arrival_time].push(trip);
		}

		//
		// For each group of trips with same start_time,
		// extract the service_ids used and merge them into a single group

		for (const similarTrips of Object.values(tripsByStartTime)) {
			//

			//
			// Get unique service_ids for these trips

			const uniqueServiceIds = Array.from(new Set(similarTrips.map(t => t.service_id)));
			if (uniqueServiceIds.length <= 1) continue;

			//
			// Merge all dates from all service_ids into the first one

			const allDates = new Set<OperationalDate>();

			for (const serviceId of uniqueServiceIds) {
				const associatedDates = sqlTables.calendar_dates.get(serviceId);
				if (!associatedDates.length) continue;
				associatedDates.forEach(date => allDates.add(date));
			}

			//
			// Check if a service_id with this set of dates already exists.
			// If so, reuse it. If not, create a new one. When creating a new one,
			// check if the new randomly generated ID already exists (very unlikely but possible).
			// If it does, generate a new one until we find a unique ID.

			let existingServiceId = null;

			for (const [existingId, existingDates] of Object.entries(finalServiceIdMap)) {
				// Skip if number of dates differ
				if (existingDates.length !== allDates.size) continue;
				// Check if all dates match
				const allMatch = existingDates.every(d => allDates.has(d));
				if (allMatch) {
					existingServiceId = existingId;
					break;
				}
			}

			if (!existingServiceId) {
				let uniqueCheckId = generateRandomString();
				while (finalServiceIdMap[uniqueCheckId]) {
					uniqueCheckId = generateRandomString();
				}
				finalServiceIdMap[uniqueCheckId] = Array.from(allDates).sort();
				existingServiceId = uniqueCheckId;
			}

			//
			// Finally, update all trips in this group to use the merged service_id

			similarTrips.forEach((trip) => {
				sqlTables.trips.query('UPDATE trips SET service_id = ? WHERE trip_id = ?', [existingServiceId, trip.trip_id]);
			});

			//
		}

		//
	}

	//
	// To terminate, replace the current calendar_dates table
	// with the new merged service_ids.

	sqlTables.calendar_dates.clear();

	Object.entries(finalServiceIdMap).forEach(([serviceId, dates]) => {
		sqlTables.calendar_dates.set(serviceId, dates);
	});

	//
	// Log completion

	Logs.info('Merged service IDs into new calendars.');
}
