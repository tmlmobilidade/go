/* * */

import { DAY_TYPES } from '@/day-types.js';
import { getPeriodName, getWeekdayNames } from '@/get-names.js';
import { type CalendarAssignmentsExt, type CalendarExt, DayTypeConfig, type ExportToHitouchConfig, type GTFS_Date } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_CalendarDate, type GTFS_StopTime, type GTFS_Trip_Extended, type OperationalDate } from '@tmlmobilidade/types';
import { Dates, generateRandomString, Logs } from '@tmlmobilidade/utils';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

export async function exportCalendarFiles(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
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
	const dayTypesConfig: DayTypeConfig[] = DAY_TYPES;

	datesCat.data.forEach((d) => {
		// Ignore dates outside the export range
		// if (d.date.localeCompare(exportConfig.date_range.start) > 0) console.log(d.date);
		if (d.date < exportConfig.date_range.start || d.date > exportConfig.date_range.end) return;
		// Add this date to the corresponding day_type_id
		const dayTypeTable = dayTypesConfig.find(dt => dt.period === d.period && dt.day_type === d.day_type);
		if (dayTypeTable) dayTypeTable.dates.push(d.date);
		// Add to map
		datesMap.set(d.date, d);
	});

	//
	// Get all unique Pattern IDs from trips

	const allPatternIds = sqlTables.trips.all().map(trip => trip.pattern_id).sort();
	const allUniquePatternIds = Array.from(new Set(allPatternIds));

	Logs.info(`Found ${allUniquePatternIds.length} unique pattern IDs in trips.`);

	const updatedServiceIds: Record<string, { _id: string, dates: OperationalDate[], day_type: string, exceptions: { comment: string, index: string }[], period: string }> = {};

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

				const serviceIdKey = sortedDates.join('|');

				if (!updatedServiceIds[serviceIdKey]) {
					updatedServiceIds[serviceIdKey] = {
						_id: generateRandomString(),
						dates: sortedDates,
						day_type: combinedDatesData.day_type,
						exceptions: [],
						period: combinedDatesData.period,
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

				const newTripId = `${equalTripsData.sample_trip.pattern_id}|${equalTripsData.start_time}|${combinedDatesData.period}|${combinedDatesData.day_type}|${updatedServiceIds[serviceIdKey]._id}`;

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

		//
	}

	//
	// Now we have an organized and consolidated set of services.
	// However, since our goal is to export to a analogic support (the posters),
	// we need to further simplify our calendar structure to fit the constraints of the medium.
	// Posters have 9 timetable slots, one for each day_type and period combination.
	// We need to detect the exceptions to these combinations, include them in a separate file,
	// and then simplify our calendar to include only one date per day_type and period combination,
	// so we can fit everything into the 9 slots available.

	for (const [serviceIdKey, serviceIdData] of Object.entries(updatedServiceIds)) {
		//

		//
		// Check if this service_id matches any of the standard
		// day_type and period combinations exactly.

		const matchedDayType = DAY_TYPES.find(dt => dt.day_type === serviceIdData.day_type && dt.period === serviceIdData.period);
		if (!matchedDayType) return Logs.error(`Service ID ${serviceIdData._id} with day_type ${serviceIdData.day_type} and period ${serviceIdData.period} does not match any known day_type and period combination.`);

		const isExactMatch = serviceIdData.dates.length === matchedDayType.dates.length && matchedDayType.dates.every(date => serviceIdData.dates.includes(date));

		if (isExactMatch) continue;

		//
		// If the match is not exact, we need to detect the exceptions
		// to the standard pattern and note them in calendarExt.txt.
		// Exceptions can be of two types:
		// 1. Patterns in the weekdays that are operated on
		// 2. Specific dates that are included or excluded

		//
		// Start with detecting a given pattern for this service_id.
		// For example, does this only operate on mondays? Or only on weekends?
		// If so, add a comment to calendarExt.txt noting this exception.

		const serviceIdWeekdaysMap: Record<string, { count: number, dates: OperationalDate[] }> = {};

		for (const date of serviceIdData.dates) {
			// Get the date entry from dates.txt
			const matchingDateEntry = datesMap.get(date);
			if (!matchingDateEntry) return Logs.error(`Date ${date} for service_id ${serviceIdData._id} not found in dates.txt`);
			// Get the weekday code for this date
			let weekdayCode = Dates
				.fromOperationalDate(date, 'Europe/Lisbon')
				.toFormat('c'); // '1' (Mon) to '7' (Sun)
			// Treat holidays as Sundays
			if (matchingDateEntry.holiday === '1') weekdayCode = '7';
			// Create a new entry for this weekday if it doesn't exist yet
			if (!serviceIdWeekdaysMap[weekdayCode]) serviceIdWeekdaysMap[weekdayCode] = { count: 0, dates: [] };
			// Increment the count for this weekday
			serviceIdWeekdaysMap[weekdayCode].count++;
			serviceIdWeekdaysMap[weekdayCode].dates.push(date);
		}

		const matchedDayTypeWeekdaysMap: Record<string, { count: number, dates: OperationalDate[] }> = {};

		for (const date of matchedDayType.dates) {
			// Get the date entry from dates.txt
			const matchingDateEntry = datesMap.get(date);
			if (!matchingDateEntry) return Logs.error(`Date ${date} for service_id ${serviceIdData._id} not found in dates.txt`);
			// Get the weekday code for this date
			let weekdayCode = Dates
				.fromOperationalDate(date, 'Europe/Lisbon')
				.toFormat('c'); // '1' (Mon) to '7' (Sun)
			// Treat holidays as Sundays
			if (matchingDateEntry.holiday === '1') weekdayCode = '7';
			// Create a new entry for this weekday if it doesn't exist yet
			if (!matchedDayTypeWeekdaysMap[weekdayCode]) matchedDayTypeWeekdaysMap[weekdayCode] = { count: 0, dates: [] };
			// Increment the count for this weekday
			matchedDayTypeWeekdaysMap[weekdayCode].count++;
			matchedDayTypeWeekdaysMap[weekdayCode].dates.push(date);
		}

		//
		// We consider a service to be regular if there are
		// the same number of dates for each weekday in the service
		// as in the matched day type configuration.

		const weekdaysMap: Record<string, boolean> = {};

		for (const [weekdayCode, matchedData] of Object.entries(serviceIdWeekdaysMap)) {
			// If the counts match, we consider this weekday to be regular
			if (serviceIdWeekdaysMap[weekdayCode] && serviceIdWeekdaysMap[weekdayCode].count === matchedData.count) {
				weekdaysMap[weekdayCode] = true;
			}
			// Otherwise, it is an exception
			else weekdaysMap[weekdayCode] = false;
		}

		const serviceIsRegular = Object.values(weekdaysMap).every(v => v === true);

		//
		// Also detect which weekdays are operated on since
		// Saturday and Sunday have their own timetable slots.

		const weekdaysCount = Object.values(serviceIdWeekdaysMap).length;

		const isAllBusinessDays = weekdaysCount === 5 && ['1', '2', '3', '4', '5'].every(d => serviceIdWeekdaysMap[d]);
		const isSaturdaysOnly = weekdaysCount === 1 && serviceIdWeekdaysMap['6'];
		const isSundaysOnly = weekdaysCount === 1 && serviceIdWeekdaysMap['7'];

		if (isAllBusinessDays || isSaturdaysOnly || isSundaysOnly) continue;

		//
		// Add exceptions based on the detected patterns.
		// e.g. only on Mondays and Wednesdays.

		if (serviceIsRegular) {
			const weekdayNames = getWeekdayNames(Object.keys(weekdaysMap));
			const periodName = getPeriodName(serviceIdData.period);
			updatedServiceIds[serviceIdKey].exceptions.push({
				comment: `Às ${weekdayNames.join(', ').replace(/, ([^,]*)$/, ' e $1')} de ${periodName}.`,
				index: '+',
			});
			continue;
		}

		//
		// When this service has only a few dates, for the end user it is clearer
		// to just list the dates rather than the weekdays it operates on.
		// Extract the dates that are not present in the matched day type configuration
		// and list them in the exceptions.

		const missingDates = matchedDayType.dates.filter(date => !serviceIdData.dates.includes(date));

		// Format the dates into a human readable format
		const datesFormatted = missingDates.map((date) => {
			const formattedDate = Dates
				.fromOperationalDate(date, 'Europe/Lisbon')
				.toFormat('dd/LL/yyyy');
			return formattedDate;
		});

		updatedServiceIds[serviceIdKey].exceptions.push({
			comment: `Nos dias ${datesFormatted.join(', ').replace(/, ([^,]*)$/, ' e $1')}`,
			index: 'º',
		});

		//
	}

	//
	// Output the calendar assignments file with the new service_ids,
	// and the calendar exceptions file with the detected exceptions.

	const calendarAssignmentsExtCsv = new CsvWriter('calendar_assignmentsExt.txt', `${exportConfig.workdir}/calendar_assignmentsExt.txt`, { batch_size: 100000 });
	const calendarDatesCsv = new CsvWriter('calendar_dates.txt', `${exportConfig.workdir}/calendar_dates.txt`, { batch_size: 100000 });
	const calendarExtCsv = new CsvWriter('calendarExt.txt', `${exportConfig.workdir}/calendarExt.txt`, { batch_size: 100000 });

	for (const serviceIdData of Object.values(updatedServiceIds)) {
		for (const dayTypeConfig of DAY_TYPES) {
			// Check if this service operates on the same day_type
			// and period for this day_type.
			const matchedDayType = serviceIdData.day_type === dayTypeConfig.day_type;
			const matchedPeriod = serviceIdData.period === dayTypeConfig.period;
			if (!matchedDayType || !matchedPeriod) continue;
			// If it matches, create an assignment
			const assignment: CalendarAssignmentsExt = {
				day_type_id: dayTypeConfig._id,
				service_id: serviceIdData._id,
			};
			await calendarAssignmentsExtCsv.write(assignment);
		}
		// Output any exceptions for this service_id
		for (const exceptionData of serviceIdData.exceptions) {
			const calendarException: CalendarExt = {
				comment: exceptionData.comment,
				index: exceptionData.index,
				service_id: serviceIdData._id,
			};
			await calendarExtCsv.write(calendarException);
		}
		// Output all dates for this service_id
		const sortedDates = serviceIdData.dates.sort();
		for (const operationalDate of sortedDates) {
			const data: GTFS_CalendarDate = {
				date: operationalDate,
				exception_type: 1,
				service_id: serviceIdData._id,
			};
			await calendarDatesCsv.write(data);
		}
	}

	await calendarAssignmentsExtCsv.flush();
	await calendarDatesCsv.flush();
	await calendarExtCsv.flush();

	Logs.info('Exported calendar_assignmentsExt.txt and calendarExt.txt files.');

	//
	// Log completion

	Logs.info('Merged service IDs into new calendars.');

	//
}
