/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationPostersV1CalendarAssignmentsExt, type OperationPostersV1CalendarDates, type OperationPostersV1Calendars } from '@tmlmobilidade/go-types-operation';
import { type OperationalDate, OperationalDateIntSchema, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { generateRandomString } from '@tmlmobilidade/strings';

import { DAY_TYPES } from '../day-types.js';
import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type DayTypeConfig } from '../types/day-type-config.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { type GtfsCalendar } from '../types/gtfs-date.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportCalendarFiles(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig, calendarsByService: Map<string, GtfsCalendar>) {
	//

	//
	// Build the day-type date lists from the generated GTFS date metadata.

	const dayTypesByPlan = new Map<string, DayTypeConfig[]>();
	for (const calendar of new Set(calendarsByService.values())) {
		const dayTypesConfig: DayTypeConfig[] = DAY_TYPES.map(dayType => ({ ...dayType, dates: [] }));
		for (const date of calendar.dates.values()) {
			const dayTypeTable = dayTypesConfig.find(dt => dt.period === date.period && dt.day_type === date.day_type);
			if (dayTypeTable) dayTypeTable.dates.push(date.date);
		}
		dayTypesByPlan.set(calendar.plan_id, dayTypesConfig);
	}

	//
	// Get all unique Shape IDs from trips

	const allShapeIds = sqlTables.trips.all().map(trip => trip.shape_id).sort();
	const allUniqueShapeIds = Array.from(new Set(allShapeIds));

	Logger.info({ message: `Found ${allUniqueShapeIds.length} unique shape IDs in trips.` });

	const updatedServiceIds: Record<string, { _id: string, calendar: GtfsCalendar, dates: OperationalDate[], day_type: string, period: string }> = {};

	//
	// Loop through each shape_id and find trips associated with it

	for (const shapeId of allUniqueShapeIds) {
		//

		//
		// Get all trips with this shape_id

		const allTripsForThisShapeId = sqlTables.trips.all('WHERE shape_id = ?', [shapeId]);

		if (!allTripsForThisShapeId?.length) continue;

		//

		//
		// Get the calendar for the first trip

		const calendar = calendarsByService.get(allTripsForThisShapeId[0].service_id);
		if (!calendar) throw new Error(`No plan calendar found for shape ${shapeId}.`);
		const datesMap = calendar.dates;

		//
		// Group trips that have the same stop_times

		const equalTrips: Record<string, { sample_stop_times: GtfsStrictV30StopTimes[], sample_trip: GtfsStrictV30Trips, service_ids: string[], start_time: string, trip_ids: string[] }> = {};

		for (const tripData of allTripsForThisShapeId) {
			// Get stop_times for this trip
			const stopTimesForTrip = sqlTables.stop_times.all('WHERE trip_id = ? ORDER BY stop_sequence ASC', [tripData.trip_id]);
			if (!stopTimesForTrip?.length) continue;
			// Stringify stop_times to use as a key.
			// This ignores trip_id to group trips with same stop_times but different trip_ids,
			// essentially grouping trips with same shape and timings but different service_ids.
			// Save the arrival_time of the first stop as start_time for later reference,
			// as well as the list of service_ids associated with these trips.
			const stopTimesKey = stopTimesForTrip.map(st => JSON.stringify({ ...st, trip_id: null })).join('|');
			if (!equalTrips[stopTimesKey]) {
				equalTrips[stopTimesKey] = {
					sample_stop_times: stopTimesForTrip,
					sample_trip: tripData,
					service_ids: [],
					start_time: stopTimesForTrip[0].arrival_time.slice(0, 5).replaceAll(':', ''),
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

			const combinedDatesMap: Record<string, { dates: Set<OperationalDate>, day_type: string, period: string, service_ids: Set<string> }> = {};

			for (const serviceId of equalTripsData.service_ids) {
				// Get all dates for this service_id
				const serviceDates = sqlTables.calendar_dates[serviceId];
				if (!serviceDates.length) continue;
				// Categorize each date
				serviceDates.forEach((gtfsDate) => {
					const date = validateOperationalDate(String(gtfsDate));
					// Get the generated metadata for this date
					const matchingDateEntry = datesMap.get(date);
					if (!matchingDateEntry) throw new Error(`Date ${date} for service_id ${serviceId} has no generated date metadata.`);
					// Build a key for this combination.
					// By categorizing by day_type and period, the concept of trips and services
					// becomes more about the category of service rather than the specific service_id,
					// allowing for rebuilding calendars based on semantic service patterns.
					const combinedDateKey = `${matchingDateEntry.period}|${matchingDateEntry.day_type}`;
					if (!combinedDatesMap[combinedDateKey]) {
						combinedDatesMap[combinedDateKey] = {
							dates: new Set(),
							day_type: matchingDateEntry.day_type,
							period: matchingDateEntry.period,
							service_ids: new Set(),
						};
					}
					combinedDatesMap[combinedDateKey].dates.add(date);
					combinedDatesMap[combinedDateKey].service_ids.add(serviceId);
				});
			}

			//
			// Now that equal trips have been combined into categorized date sets,
			// representing their actual operational patterns (e.g., weekday, weekend, only on monday),
			// we can proceed to rebuild the trips, stop_times, calendar and the calendar_dates tables.

			for (const combinedDatesData of Object.values(combinedDatesMap)) {
				//

				//
				// Setup a service ID, or reuse an existing one if
				// the exact set of dates already exists.

				const sortedDates = Array.from(combinedDatesData.dates).sort();

				const serviceIdKey = `${calendar.plan_id}|${combinedDatesData.period}|${combinedDatesData.day_type}|${sortedDates.join('|')}`;

				if (!updatedServiceIds[serviceIdKey]) {
					updatedServiceIds[serviceIdKey] = {
						_id: generateRandomString(),
						calendar,
						dates: sortedDates,
						day_type: combinedDatesData.day_type,
						period: combinedDatesData.period,
					};
				}

				//
				// Delete original entries from trips and stop_times

				equalTripsData.trip_ids.forEach((tripId) => {
					sqlTables._db.databaseInstance.prepare('DELETE FROM trips WHERE trip_id = ?').run(tripId);
					sqlTables._db.databaseInstance.prepare('DELETE FROM stop_times WHERE trip_id = ?').run(tripId);
				});

				//
				// Recreate trips and stop_times with new service_id,
				// and a new trip_id. Notice that before there were multiple trips
				// with different service_ids, but now there will be only one trip with the updated service_id.
				// This is because we are merging identical services into a single one. Before, there were more trips
				// spread across multiple service_ids, now there will be fewer trips but with more dates on each service.

				const newTripId = `${equalTripsData.sample_trip.shape_id}||${equalTripsData.start_time}|${combinedDatesData.period}|${combinedDatesData.day_type}|${updatedServiceIds[serviceIdKey]._id}`;

				sqlTables.trips.write({ ...equalTripsData.sample_trip, service_id: updatedServiceIds[serviceIdKey]._id, trip_id: newTripId });
				equalTripsData.sample_stop_times.forEach(st => sqlTables.stop_times.write({ ...st, trip_id: newTripId }));

				//
				// Flush changes to trips and stop_times tables to ensure
				// all deletions and insertions are committed.

				sqlTables.trips.flush();
				sqlTables.stop_times.flush();

				//
			}

			//
		}

		await yieldToEventLoop();

		//
	}

	//
	// Output calendar dates and day-type assignments for the merged services.

	const calendarAssignmentsExtRows: OperationPostersV1CalendarAssignmentsExt[] = [];
	let exportedDates = 0;

	//
	// Loop through each service_id and output the calendar files

	for (const serviceIdData of Object.values(updatedServiceIds)) {
		//
		// Sort the dates

		const sortedDates = serviceIdData.dates.sort();

		//
		// Output the calendar file

		if (exportConfig.source_has_calendar) {
			//
			// Output the calendar data

			const calendarData: OperationPostersV1Calendars = {
				end_date: OperationalDateIntSchema.parse(sortedDates.at(-1) ?? exportConfig.date_range.end),
				friday: '0',
				monday: '0',
				saturday: '0',
				service_id: serviceIdData._id,
				start_date: OperationalDateIntSchema.parse(sortedDates.at(0) ?? exportConfig.date_range.start),
				sunday: '0',
				thursday: '0',
				tuesday: '0',
				wednesday: '0',
			};
			await context.writers.calendars.write(calendarData);
		}

		//
		// Output the calendar assignments file

		for (const dayTypeConfig of dayTypesByPlan.get(serviceIdData.calendar.plan_id)) {
			// Check if this service operates on the same day_type
			// and period for this day_type.
			const matchedDayType = serviceIdData.day_type === dayTypeConfig.day_type;
			const matchedPeriod = serviceIdData.period === dayTypeConfig.period;
			if (!matchedDayType || !matchedPeriod) continue;
			// If it matches, create an assignment
			const assignment: OperationPostersV1CalendarAssignmentsExt = {
				day_type_id: dayTypeConfig._id,
				service_id: serviceIdData._id,
			};
			calendarAssignmentsExtRows.push(assignment);
		}

		//
		// Output all dates for this service_id

		for (const operationalDate of sortedDates) {
			const data: OperationPostersV1CalendarDates = {
				date: OperationalDateIntSchema.parse(operationalDate),
				exception_type: '1',
				service_id: serviceIdData._id,
			};
			await context.writers.calendar_dates.write(data);
			exportedDates++;
			await yieldToEventLoop(exportedDates);
		}
	}

	//
	// Flush the calendar files

	await context.writers.calendars.flush();
	await context.writers.calendar_dates.flush();

	//
	// Output the calendar assignments file

	if (calendarAssignmentsExtRows.length) {
		//
		// Output the calendar assignments data

		await context.writers.calendar_assignments_ext.write(calendarAssignmentsExtRows);
		await context.writers.calendar_assignments_ext.flush();
	}

	//
	// Log the exported calendar files

	const exportedCalendarFiles = [
		...(exportConfig.source_has_calendar ? ['calendar.txt'] : []),
		'calendar_dates.txt',
		...(calendarAssignmentsExtRows.length ? ['calendar_assignmentsExt.txt'] : []),
	];

	Logger.info({ message: `Exported ${exportedCalendarFiles.join(', ')} files.` });

	//
	// Log completion

	Logger.info({ message: 'Merged service IDs into new calendars.' });

	for (const serviceIdData of Object.values(updatedServiceIds)) {
		Logger.info({ message: `Service ID "${serviceIdData._id}" has ${serviceIdData.dates.length} dates.` });
	}

	//
}
