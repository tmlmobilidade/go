/* * */

import { type GTFS_Date } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_StopTime, type GTFS_Trip_Extended, type OperationalDate } from '@tmlmobilidade/types';
import { generateRandomString, Logs } from '@tmlmobilidade/utils';
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

	const allPatternIds = sqlTables.trips.all().map(trip => trip.pattern_id).sort();
	const allUniquePatternIds = Array.from(new Set(allPatternIds));

	Logs.info(`Found ${allUniquePatternIds.length} unique pattern IDs in trips.`);

	const updatedServiceIds: Record<string, { _id: string, dates: OperationalDate[], day_type: string, period: string }> = {};

	//
	// Loop through each pattern_id and find trips associated with it

	for (const patternId of allUniquePatternIds) {
		//

		//
		// Get all trips with this pattern_id

		const allTripsForThisPatternId = sqlTables.trips.all('WHERE pattern_id = ?', [patternId]);

		if (!allTripsForThisPatternId?.length) continue;

		//
		// Group trips that have the same stop_times

		const equalTrips: Record<string, { sample_stop_times: GTFS_StopTime[], sample_trip: GTFS_Trip_Extended, service_ids: string[], start_time: string, trip_ids: string[] }> = {};

		for (const tripData of allTripsForThisPatternId) {
			// Get stop_times for this trip
			const stopTimesForTrip = sqlTables.stop_times.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [tripData.trip_id]);
			if (!stopTimesForTrip?.length) continue;
			// Stringify stop_times to use as a key.
			// This ignores trip_id to group trips with same stop_times but different trip_ids,
			// essentially grouping trips with same pattern and timings but different service_ids.
			// Save the arrival_time of the first stop as start_time for later reference,
			// as well as the list of service_ids associated with these trips.
			const stopTimesKey = stopTimesForTrip.map(st => JSON.stringify({ ...st, trip_id: null })).join('|');
			if (!equalTrips[stopTimesKey]) {
				equalTrips[stopTimesKey] = {
					sample_stop_times: stopTimesForTrip,
					sample_trip: tripData,
					service_ids: [],
					start_time: stopTimesForTrip[0].arrival_time,
					trip_ids: [],
				};
			}
			equalTrips[stopTimesKey].trip_ids.push(tripData.trip_id);
			equalTrips[stopTimesKey].service_ids.push(tripData.service_id);
		}

		//
		// For each group of trips with identical stop_times,
		// merge their service_ids into a single one.

		for (const equalTripsData of Object.values(equalTrips)) {
			//

			//
			// Merge all dates from all service_ids into a single one,
			// and categorize them by day_type, period and weekday.

			const combinedDatesMap: Record<string, { dates: OperationalDate[], day_type: string, period: string, service_ids: string[] }> = {};

			for (const serviceId of equalTripsData.service_ids) {
				// Get all dates for this service_id
				const serviceDates = sqlTables.calendar_dates.get(serviceId);
				if (!serviceDates.length) continue;
				// Categorize each date
				serviceDates.forEach((date) => {
					// Get the date entry from dates.txt
					const matchingDateEntry = datesMap.get(date);
					if (!matchingDateEntry) return Logs.error(`Date ${date} for service_id ${serviceId} not found in dates.txt`);
					// Build a key for this combination.
					// By categorizing by day_type and period, the concept of trips and services
					// becomes more about the category of service rather than the specific service_id,
					// allowing for rebuilding calendars based on semantic service patterns.
					const combinedDateKey = `${matchingDateEntry.period}|${matchingDateEntry.day_type}`;
					if (!combinedDatesMap[combinedDateKey]) {
						combinedDatesMap[combinedDateKey] = {
							dates: [],
							day_type: matchingDateEntry.day_type,
							period: matchingDateEntry.period,
							service_ids: [],
						};
					}
					combinedDatesMap[combinedDateKey].dates.push(date);
					combinedDatesMap[combinedDateKey].service_ids.push(serviceId);
				});
			}

			//
			// Now that equal trips have been combined into categorized date sets,
			// representing their actual operational patterns (e.g., weekday, weekend, only on monday),
			// we can proceed to rebuild the trips, stop_times, calendar and the calendar_dates tables.

			for (const combinedDateGroup of Object.values(combinedDatesMap)) {
				//

				//
				// Setup a service ID, or reuse an existing one if
				// the exact set of dates already exists.

				const sortedDates = Array.from(new Set(combinedDateGroup.dates)).sort();

				const serviceIdKey = sortedDates.join('|');

				if (!updatedServiceIds[serviceIdKey]) {
					updatedServiceIds[serviceIdKey] = {
						_id: generateRandomString(),
						dates: sortedDates,
						day_type: combinedDateGroup.day_type,
						period: combinedDateGroup.period,
					};
				}

				//
				// Delete original entries from trips and stop_times

				equalTripsData.trip_ids.forEach((tripId) => {
					sqlTables.trips.query('DELETE FROM trips WHERE trip_id = ?', [tripId]);
					sqlTables.stop_times.query('DELETE FROM stop_times WHERE trip_id = ?', [tripId]);
				});

				//
				// Recreate trips and stop_times with new service_id,
				// and a new trip_id. Notice that before there were multiple trips
				// with different service_ids, but now there will be only one trip with the updated service_id.
				// This is because we are merging identical services into a single one. Before, there were more trips
				// spread across multiple service_ids, now there will be fewer trips but with more dates on each service.

				const newTripId = `${equalTripsData.sample_trip.pattern_id}|${equalTripsData.start_time.replaceAll(':', '')}|${updatedServiceIds[serviceIdKey]._id}|${combinedDateGroup.day_type}|${combinedDateGroup.period}`;

				sqlTables.trips.write({ ...equalTripsData.sample_trip, service_id: updatedServiceIds[serviceIdKey]._id, trip_id: newTripId });
				equalTripsData.sample_stop_times.forEach(st => sqlTables.stop_times.write({ ...st, trip_id: newTripId }));

				//
			}

			//
		}

		//
	}

	//
	// Flush changes to trips and stop_times tables
	// to ensure all deletions and insertions are committed.

	sqlTables.trips.flush();
	sqlTables.stop_times.flush();

	//
	// To terminate, replace the current calendar_dates table
	// with the new merged service_ids.

	sqlTables.calendar_dates.clear();

	Object.values(updatedServiceIds).forEach(updatedServiceId => sqlTables.calendar_dates.set(updatedServiceId._id, updatedServiceId.dates));

	//
	// Log completion

	Logs.info('Merged service IDs into new calendars.');
}
