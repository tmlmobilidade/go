/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { generateRandomString } from '@tmlmobilidade/strings';

import { type OperationPostersV1Tables } from '../types/context.js';
import { type GtfsCalendar } from '../types/gtfs-date.js';
import { yieldToEventLoop } from './yield-to-event-loop.js';

/* * */

interface CalendarService {
	_id: string
	dates: OperationalDate[]
	day_type: string
	period: string
}

interface TripGroup {
	serviceIds: string[]
	startTime: string
	stopTimes: GtfsStrictV30StopTimes[]
	trip: GtfsStrictV30Trips
	tripIds: string[]
}

interface DateGroup {
	dates: Set<OperationalDate>
	day_type: string
	period: string
}

/* * */

/** Merge identical trip schedules and rebuild services by plan, period and day type. */
export async function rebuildCalendarServices(tables: OperationPostersV1Tables, calendarsByService: Map<string, GtfsCalendar>): Promise<CalendarService[]> {
	//

	//
	// A. Prepare shape IDs, service storage and delete statements

	const shapeIds = tables.trips.distinct('shape_id').sort();
	const totalTrips = tables.trips.size;
	const services = new Map<string, CalendarService>();
	const database = tables._db.databaseInstance;
	const deleteTrip = database.prepare('DELETE FROM trips WHERE trip_id = ?');
	const deleteStopTimes = database.prepare('DELETE FROM stop_times WHERE trip_id = ?');
	let processedShapes = 0;
	let processedTrips = 0;
	let processedGroups = 0;
	let lastProgressAt = Date.now();

	//
	// B. Track progress and yield while reading trips

	const logProgress = () => {
		if (Date.now() - lastProgressAt < 5_000 && processedShapes !== shapeIds.length) return;
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
	// Delete each source trip once and commit all replacements in the same transaction.

	const replaceTrips = database.transaction((group: TripGroup, calendar: GtfsCalendar, dateGroups: DateGroup[]) => {
		for (const tripId of group.tripIds) {
			deleteTrip.run(tripId);
			deleteStopTimes.run(tripId);
		}
		//
		// Reuse services with identical dates, periods and day types within the same plan

		for (const dateGroup of dateGroups) {
			const dates = [...dateGroup.dates].sort();
			const key = `${calendar.plan_id}|${dateGroup.period}|${dateGroup.day_type}|${dates.join('|')}`;
			let service = services.get(key);
			if (!service) {
				service = { _id: generateRandomString(), dates, day_type: dateGroup.day_type, period: dateGroup.period };
				services.set(key, service);
			}
			const tripId = `${group.trip.shape_id}||${group.startTime}|${service.period}|${service.day_type}|${service._id}`;
			tables.trips.write({ ...group.trip, service_id: service._id, trip_id: tripId });
			for (const stopTime of group.stopTimes) tables.stop_times.write({ ...stopTime, trip_id: tripId });
			tables.trips.flush();
			tables.stop_times.flush();
		}
	});

	//
	// D. Group each shape's schedules and rebuild its services

	Logger.info({ message: `Found ${shapeIds.length} unique shape IDs in trips.` });
	for (const shapeId of shapeIds) {
		const trips = tables.trips.all('WHERE shape_id = ?', [shapeId]);
		if (!trips.length) continue;
		const calendar = calendarsByService.get(trips[0].service_id);
		if (!calendar) throw new Error(`No plan calendar found for shape ${shapeId}.`);

		for (const group of await groupTripsByStopTimes(tables, trips, onTripRead)) {
			const dateGroups = groupServiceDates(tables, group.serviceIds, calendar);
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

async function groupTripsByStopTimes(tables: OperationPostersV1Tables, trips: GtfsStrictV30Trips[], onTripRead: () => Promise<void>): Promise<TripGroup[]> {
	//

	//
	// A. Prepare groups for trips with identical stop times

	const groups = new Map<string, TripGroup>();

	//
	// B. Read ordered stop times and collect matching trips and services

	for (const trip of trips) {
		await onTripRead();
		const stopTimes = tables.stop_times.all('WHERE trip_id = ? ORDER BY CAST(stop_sequence AS INTEGER) ASC', [trip.trip_id]);
		if (!stopTimes.length) continue;
		// Ignore trip IDs so identical schedules can share their service dates.
		const key = stopTimes.map(stopTime => JSON.stringify({ ...stopTime, trip_id: null })).join('|');
		let group = groups.get(key);
		if (!group) {
			group = { serviceIds: [], startTime: stopTimes[0].arrival_time.slice(0, 5).replaceAll(':', ''), stopTimes, trip, tripIds: [] };
			groups.set(key, group);
		}
		group.tripIds.push(trip.trip_id);
		group.serviceIds.push(trip.service_id);
	}
	return [...groups.values()];
}

function groupServiceDates(tables: OperationPostersV1Tables, serviceIds: string[], calendar: GtfsCalendar): DateGroup[] {
	//

	//
	// A. Prepare date groups for each period and day type

	const groups = new Map<string, DateGroup>();

	//
	// B. Merge operating dates using the plan's generated date metadata

	for (const serviceId of serviceIds) {
		for (const gtfsDate of tables.calendar_dates[serviceId]) {
			const date = validateOperationalDate(String(gtfsDate));
			const metadata = calendar.dates.get(date);
			if (!metadata) throw new Error(`Date ${date} for service_id ${serviceId} has no generated date metadata.`);
			const key = `${metadata.period}|${metadata.day_type}`;
			let group = groups.get(key);
			if (!group) {
				group = { dates: new Set(), day_type: metadata.day_type, period: metadata.period };
				groups.set(key, group);
			}
			group.dates.add(date);
		}
	}
	return [...groups.values()];
}
