/* * */

import { getQualifiedPatternId, getQualifiedRouteId, getQualifiedServiceId, getQualifiedShapeId, getQualifiedTripId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type GtfsTrips } from '@tmlmobilidade/go-types-gtfs';
import { type HubV1ApiStop, HubV1GtfsTripsSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';

import { type NetworkContext } from '../types/network.js';
import { getEncodedPolyline } from '../utils/get-encoded-polyline.js';
import { parsePatternTrip } from '../utils/parse-pattern-trip.js';
import { parseTripPath } from '../utils/parse-trip-path.js';
import { updateLinesRoutes } from '../utils/update-lines-routes.js';

/* * */

export async function syncLinesRoutesPatterns(plan: Plan, importedGtfsSql: GtfsSQLTables, context: NetworkContext, stops: Map<string, HubV1ApiStop>) {
	/* * *
	 * INTRODUCTION
	 *
	 * The goal of this script is to parse one GTFS feed into a cohesive and intuitive JSON representation.
	 * GTFS feeds are notoriously big and contain a lot of duplicated data, which maybe makes sense for GTFS
	 * but for an API might be too expensive. Therefore, here we try to condense the information, reducing duplication,
	 * by structuring network data into three main levels:
	 * (1) The first level is the line, which is the highest level grouping, usually indentified by a 4 digit ID.
	 * A line does not have schedules or path, since it represents a <group> of similar routes and patterns that serve
	 * an area with a given intent.
	 * (2) The second level is the route. There is no hard limit on how many routes one line can have, but there is effort
	 * to keep this number low. The route is identified by the 4 digits of the parent line_id followed by an underscore
	 * and a zero based index. For example, line_id 1234 would have routes 1234_0, 1234_1, etc. A route also has no schedules
	 * or path, but it contains references to child patterns that actually describe the available service.
	 * (3) The pattern is a logic representation of a direction of a route. One route can have at most two patterns, one for each direction.
	 * A pattern is built from the unique combination of trips with the same route_id, direction_id, trip_headsign, shape_id and stop_sequence.
	 * It is important to note that the pattern is not part of the GTFS standard, but a common way to structure network data in a logical
	 * and familiar way for passengers. In the current iteration of this API, it is sometimes necessary to create multiple versions of the same patten,
	 * in order to be able to present the evolution of the network. For example, a pattern may change shape or stops starting next month,
	 * and both versions need to be available for the consumers of this API. This is why one pattern can actually have multiple pattern groups.
	 * (3.1) One pattern group represents a particular version of that pattern. All pattern groups have the same pattern ID (which is composed
	 * of the parent route ID followed by an underscore and the direction ID of the GTFS trips used to build it) but each group is valid on a different
	 * set of dates. This is what should control the pattern group visibility in a frontend application. It is the pattern group that has a path,
	 * an associated shape and a set of schedules for each serviced stop.
	 * (4) In GTFS, trips are the atomic unit of service. They represent a given sequence of stops serviced on a particular time on set of dates.
	 * In this API, we group trips into schedules, which are all the GTFS trips that serve a path at the same time. For example, the 9h trip
	 * in a given direction can be found in the GTFS "separated" into 3 distinct trips, since each can have a different associated calendar (set of dates).
	 * While this allows for great flexibility in the GTFS format, it makes it hard to consume for users. By grouping trips into schedules,
	 * we simplify consumption while improving service readability as a whole. A schedule represents all trips serving the same path at the same time.
	 */

	const timer = new Timer();

	for await (const tripItem of importedGtfsSql.trips.stream('ORDER BY shape_id, trip_id')) {
		const sourceTrip: GtfsTrips = tripItem;
		const trip = HubV1GtfsTripsSchema.parse({
			...sourceTrip,
			block_id: sourceTrip.block_id ?? undefined,
			pattern_id: getQualifiedPatternId(plan.agency_id, sourceTrip.shape_id),
			route_id: getQualifiedRouteId(plan.agency_id, sourceTrip.route_id),
			service_id: getQualifiedServiceId(plan._id, plan.agency_id, sourceTrip.service_id),
			shape_id: getQualifiedShapeId(plan._id, plan.agency_id, sourceTrip.shape_id),
			trip_id: getQualifiedTripId(plan._id, plan.agency_id, sourceTrip.trip_id),
		});
		const route = context.route_data.get(trip.route_id);
		if (!route) throw new Error(`Route ${trip.route_id} not found for plan ${plan._id}`);

		const stopTimes = importedGtfsSql.stop_times.all('WHERE trip_id = ? ORDER BY stop_sequence', [sourceTrip.trip_id]).map((stopTime) => {
			const stop = stops.get(stopTime.stop_id);
			if (!stop) throw new Error(`Stop ${stopTime.stop_id} not found for plan ${plan._id}`);
			return { ...stopTime, stop_id: stop._id };
		});
		const tripPath = parseTripPath(stopTimes, context.stops);
		const polyline = await getEncodedPolyline(importedGtfsSql, sourceTrip.shape_id);
		const validDates = importedGtfsSql.calendar_dates[sourceTrip.service_id];
		if (!validDates) throw new Error(`Service ${sourceTrip.service_id} not found for plan ${plan._id}`);

		const patterns = context.patterns.get(trip.pattern_id) ?? new Map();
		parsePatternTrip(trip, route, polyline, validDates, tripPath, patterns);
		context.patterns.set(trip.pattern_id, patterns);
		updateLinesRoutes(context, trip, route, tripPath);
	}

	Logger.success(`Parsed lines, routes and patterns for plan ${plan._id} (${timer.get()})`);
}
