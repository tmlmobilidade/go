/* * */

import { generateRandomString } from '@tmlmobilidade/strings';

import { type CalendarService, type DateGroup, type TripGroup } from '../../types/calendar-services.js';
import { type OperationPostersV1Tables } from '../../types/context.js';
import { type GtfsCalendar } from '../../types/gtfs-date.js';

/* * */

/** Prepare a transaction that replaces each merged trip group and reuses matching services. */
export function createTripReplacer(tables: OperationPostersV1Tables, services: Map<string, CalendarService>) {
	//

	//
	// A. Prepare indexed deletions once for the complete rebuild

	const database = tables._db.databaseInstance;
	// The shape/trip index cannot serve deletions by trip_id alone.
	database.exec('CREATE INDEX IF NOT EXISTS idx_trips_trip_id ON trips (trip_id)');
	const deleteTrip = database.prepare('DELETE FROM trips WHERE trip_id = ?');
	const deleteStopTimes = database.prepare('DELETE FROM stop_times WHERE trip_id = ?');

	//
	// B. Delete source trips and commit all replacements in the same transaction

	return database.transaction((group: TripGroup, calendar: GtfsCalendar, dateGroups: DateGroup[]) => {
		for (const tripId of group.tripIds) {
			deleteTrip.run(tripId);
			deleteStopTimes.run(tripId);
		}

		//
		// Reuse services with identical dates and day types within the same plan

		for (const dateGroup of dateGroups) {
			const dates = [...dateGroup.dates].sort((a, b) => a - b);
			const key = `${calendar.plan_id}|${dateGroup.day_type}|${dates.join('|')}`;
			let service = services.get(key);
			if (!service) {
				service = { _id: generateRandomString(), dates, day_type: dateGroup.day_type };
				services.set(key, service);
			}
			const tripId = `${group.trip.shape_id}||${group.startTime}|${service.day_type}|${service._id}`;
			tables.trips.write({ ...group.trip, service_id: service._id, trip_id: tripId });
			for (const stopTime of group.stopTimes) tables.stop_times.write({ ...stopTime, trip_id: tripId });
		}
		tables.trips.flush();
		tables.stop_times.flush();
	});
}
