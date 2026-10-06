/* * */

import { type GtfsHubV1SQLTables } from '@tmlmobilidade/import-gtfs';

/**
 * Merges organization feeds while deduplicating shared plans and stops.
 * @param target The combined network tables.
 * @param source The next organization's tables.
 */
export async function mergeGtfsTables(target: GtfsHubV1SQLTables, source: GtfsHubV1SQLTables) {
	//

	for (const [serviceId, dates] of Object.entries(source.calendar_dates)) {
		target.calendar_dates[serviceId] = [...new Set([...(target.calendar_dates[serviceId] ?? []), ...dates])];
	}

	const existingTripIds = new Set(target.trips.distinct('trip_id'));
	const newTripIds = new Set<string>();

	for await (const trip of source.trips.stream()) {
		if (existingTripIds.has(trip.trip_id)) continue;
		target.trips.write(trip);
		existingTripIds.add(trip.trip_id);
		newTripIds.add(trip.trip_id);
	}
	target.trips.flush();

	for await (const stopTime of source.stop_times.stream()) {
		if (newTripIds.has(stopTime.trip_id)) target.stop_times.write(stopTime);
	}
	target.stop_times.flush();

	const existingRouteIds = new Set(target.routes.distinct('route_id'));

	for await (const route of source.routes.stream()) {
		if (existingRouteIds.has(route.route_id)) continue;
		target.routes.write(route);
		existingRouteIds.add(route.route_id);
	}
	target.routes.flush();

	const existingShapeIds = new Set(target.shapes.distinct('shape_id'));

	for await (const shape of source.shapes.stream()) {
		if (!existingShapeIds.has(shape.shape_id)) target.shapes.write(shape);
	}
	target.shapes.flush();

	//
	// A shared stop keeps the flags from every organization's agencies.

	const updateStopFlags = target._db.databaseInstance.prepare('UPDATE stops SET flags = ? WHERE stop_id = ?');

	for await (const stop of source.stops.stream()) {
		const existingStop = target.stops.get('stop_id', stop.stop_id);
		if (!existingStop) {
			target.stops.write(stop);
			continue;
		}
		const flags = [...new Set([
			...(existingStop.flags ?? '').split('|'),
			...(stop.flags ?? '').split('|'),
		].filter(Boolean))].join('|');
		updateStopFlags.run(flags, stop.stop_id);
	}
	target.stops.flush();
}
