/* * */

import { type GTFS_Date } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { GTFS_Trip_Extended, type OperationalDate } from '@tmlmobilidade/types';
import { Dates, generateRandomString, Logs } from '@tmlmobilidade/utils';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

export function mergeServiceIds(sqlTables: GtfsSQLTables) {
	//

	//
	// Import the dates.txt file into a map of date strings and their associated categorizations

	if (!fs.existsSync('/Users/joao/Developer/tmlmobilidade/sae/plans/apps/export-posters/src/dates.txt')) {
		Logs.error(`Missing dates.txt file in ${process.cwd()}`);
	}

	const datesCat = Papa.parse<GTFS_Date>(fs.readFileSync('/Users/joao/Developer/tmlmobilidade/sae/plans/apps/export-posters/src/dates.txt', 'utf-8'), {
		header: true,
		skipEmptyLines: true,
	});

	const datesMap = new Map<string, GTFS_Date>();
	datesCat.data.forEach(d => datesMap.set(d.date, d));

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

		const tripsByStartTime: Record<string, GTFS_Trip_Extended[]> = {};

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
			// Merge all dates from all service_ids into a single one

			const combinedDates = new Set<OperationalDate>();

			for (const serviceId of uniqueServiceIds) {
				const serviceDates = sqlTables.calendar_dates.get(serviceId);
				if (!serviceDates.length) continue;
				serviceDates.forEach(date => combinedDates.add(date));
			}

			//
			// Deduplicate combined dates based on day_type, period and weekday

			for (const date of Array.from(combinedDates)) {
				const matchingDateEntry = datesMap.get(date);
				if (!matchingDateEntry) continue;
				// Get weekday from date
				const weekday = Dates
					.fromOperationalDate(date, 'Europe/Lisbon')
					.toFormat('c'); // '1' (Mon) to '7' (Sun)
				// Check if another date with same day_type, period and weekday exists
				const isDuplicate = Array.from(combinedDates).find((d) => {
					if (d === date) return false; // Skip self
					const dEntry = datesMap.get(d);
					if (!dEntry) return false;
					const dWeekday = Dates
						.fromOperationalDate(d, 'Europe/Lisbon')
						.toFormat('c'); // '1' (Mon) to '7' (Sun)
					return dEntry.day_type === matchingDateEntry.day_type && dEntry.period === matchingDateEntry.period && dWeekday === weekday;
				});
				// If a duplicate is found, remove it from the combined dates
				if (isDuplicate) combinedDates.delete(date);
			}

			//
			// Check if a service_id with this set of dates already exists.
			// If so, reuse it. If not, create a new one. When creating a new one,
			// check if the new randomly generated ID already exists (very unlikely but possible).
			// If it does, generate a new one until we find a unique ID.

			let newServiceId = null;

			for (const [existingId, existingDates] of Object.entries(finalServiceIdMap)) {
				// Skip if number of dates differ
				if (existingDates.length !== combinedDates.size) continue;
				// Check if all dates match
				const stringifiedExistingDates = JSON.stringify(existingDates.sort());
				const stringifiedCombinedDates = JSON.stringify(Array.from(combinedDates).sort());
				if (stringifiedExistingDates === stringifiedCombinedDates) {
					newServiceId = existingId;
					break;
				}
			}

			if (!newServiceId) {
				let uniqueCheckId = generateRandomString();
				while (finalServiceIdMap[uniqueCheckId]) {
					uniqueCheckId = generateRandomString();
				}
				finalServiceIdMap[uniqueCheckId] = Array.from(combinedDates).sort();
				newServiceId = uniqueCheckId;
			}

			//
			// Finally, update all trips in this group to use the merged service_id

			similarTrips.forEach((trip) => {
				sqlTables.trips.query('UPDATE trips SET service_id = ? WHERE trip_id = ?', [newServiceId, trip.trip_id]);
			});

			Logs.info(`Merged service IDs [${uniqueServiceIds.join(', ')}] into ${newServiceId} for pattern ${patternId} with ${similarTrips.length} trips.`);

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
