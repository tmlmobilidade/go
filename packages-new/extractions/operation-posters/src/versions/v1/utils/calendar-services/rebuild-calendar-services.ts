/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type CalendarService, type DateGroup } from '../../types/calendar-services.js';
import { type OperationPostersV1Tables } from '../../types/context.js';
import { type GtfsCalendar } from '../../types/gtfs-date.js';
import { yieldToEventLoop } from '../yield-to-event-loop.js';
import { createTripReplacer } from './create-trip-replacer.js';
import { groupServiceDates } from './group-service-dates.js';
import { groupTripsByStopTimes } from './group-trips-by-stop-times.js';

/* * */

/** Merge identical trip schedules and rebuild services by plan and day type. */
export async function rebuildCalendarServices(tables: OperationPostersV1Tables, calendarsByService: Map<string, GtfsCalendar>): Promise<CalendarService[]> {
	//

	//
	// A. Prepare shape IDs, service storage and reusable read queries

	const shapeIds = tables.trips.distinct('shape_id').sort();
	const totalTrips = tables.trips.size;
	const services = new Map<string, CalendarService>();
	const datesByCalendar = new Map<GtfsCalendar, Map<string, DateGroup[]>>();
	const database = tables._db.databaseInstance;
	const selectTrips = database.prepare('SELECT * FROM trips WHERE shape_id = ?');
	const selectStopTimes = database.prepare('SELECT * FROM stop_times WHERE trip_id = ? ORDER BY CAST(stop_sequence AS INTEGER) ASC');
	const getStopTimes = (tripId: string) => selectStopTimes.all(tripId) as GtfsStrictV30StopTimes[];

	let processedShapes = 0;
	let processedTrips = 0;
	let processedGroups = 0;
	let lastProgressAt = Date.now();

	//
	// B. Track progress and yield while reading trips

	const logProgress = () => {
		if (Date.now() - lastProgressAt < 5_000) return;
		Logger.info({ message: `Rebuilding poster calendars: ${processedShapes}/${shapeIds.length} shapes, ${processedTrips}/${totalTrips} trips read.` });
		lastProgressAt = Date.now();
	};

	const onTripRead = async () => {
		processedTrips++;
		logProgress();
		await yieldToEventLoop(processedTrips);
	};

	//
	// C. Prepare the transaction that replaces each merged trip group

	const replaceTrips = createTripReplacer(tables, services);

	//
	// D. Group each shape's schedules and rebuild its services

	Logger.info({ message: `Found ${shapeIds.length} unique shape IDs in trips.` });
	for (const shapeId of shapeIds) {
		const trips = selectTrips.all(shapeId) as GtfsStrictV30Trips[];
		if (!trips.length) continue;
		const calendar = calendarsByService.get(trips[0].service_id);
		if (!calendar) throw new Error(`No plan calendar found for shape ${shapeId}.`);
		let datesByService = datesByCalendar.get(calendar);
		if (!datesByService) {
			datesByService = new Map();
			datesByCalendar.set(calendar, datesByService);
		}

		for (const group of await groupTripsByStopTimes(trips, getStopTimes, onTripRead)) {
			const dateGroups = groupServiceDates(tables, group.serviceIds, calendar, datesByService);
			if (!dateGroups.length) continue;
			replaceTrips(group, calendar, dateGroups);
			processedGroups++;
			logProgress();
			await yieldToEventLoop(processedGroups);
		}
		processedShapes++;
		logProgress();
		await yieldToEventLoop();
	}
	return [...services.values()];
}
