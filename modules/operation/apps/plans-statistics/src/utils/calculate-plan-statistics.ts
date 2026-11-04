/* * */

import { type PlanStatistics, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';
import { NonNegativeFloatSchema } from '@tmlmobilidade/go-types-shared';
import { type GtfsStrictV30SQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

interface ScheduledTrip {
	route_count: number
	route_id: null | string
	service_days: number
	shape_count: number
	shape_id: null | string
	trip_id: string
}

/** The importer has already resolved calendars within the plan's inclusive dates. */
export function calculatePlanStatistics(gtfs: GtfsStrictV30SQLTables): PlanStatistics {
	const database = gtfs._db.databaseInstance;
	const lineIds = new Set<string>();
	const processedRouteIds = new Set<string>();
	const shapeDistances = new Map<string, number>();
	let distanceMeters = 0;
	let tripCount = 0;

	const trips = database.prepare<[], ScheduledTrip>(`
		SELECT t.trip_id, MIN(t.route_id) AS route_id, MIN(t.shape_id) AS shape_id,
		       COUNT(DISTINCT t.route_id) AS route_count,
		       COUNT(DISTINCT t.shape_id) AS shape_count,
		       COUNT(DISTINCT c.date) AS service_days
		FROM trips t
		LEFT JOIN calendar_dates c ON t.service_id = c.service_id AND c.exception_type = '1'
		GROUP BY t.trip_id
	`);
	const route = database.prepare<[string], { route_short_name: null | string }>(`
		SELECT DISTINCT route_short_name FROM routes WHERE route_id = ?
	`);
	const shape = database.prepare<[string], { distance: unknown }>(`
		SELECT shape_dist_traveled AS distance FROM shapes WHERE shape_id = ?
		ORDER BY CAST(shape_pt_sequence AS INTEGER) DESC LIMIT 1
	`);

	for (const trip of trips.iterate()) {
		if (!trip.trip_id?.trim() || trip.route_count !== 1 || trip.shape_count !== 1 || !trip.route_id || !trip.shape_id || !trip.service_days) {
			throw new Error(`Incomplete or conflicting data for trip "${trip.trip_id}".`);
		}

		if (!processedRouteIds.has(trip.route_id)) {
			const lines = route.all(trip.route_id);
			const line = lines[0]?.route_short_name;
			if (lines.length !== 1 || !line?.trim()) throw new Error(`Missing or ambiguous line for route "${trip.route_id}".`);
			processedRouteIds.add(trip.route_id);
			lineIds.add(line);
		}

		let extensionMeters = shapeDistances.get(trip.shape_id);
		if (extensionMeters === undefined) {
			const value = shape.get(trip.shape_id)?.distance;
			if (value == null || (typeof value === 'string' && !value.trim())) throw new Error(`Missing distance for shape "${trip.shape_id}".`);
			const kilometers = NonNegativeFloatSchema.parse(value);
			// Operation GTFS distances are kilometers; retain the existing meter precision.
			extensionMeters = Math.round(kilometers * 1000);
			shapeDistances.set(trip.shape_id, extensionMeters);
		}

		distanceMeters += extensionMeters * trip.service_days;
		tripCount += trip.service_days;
	}

	return PlanStatisticsSchema.parse({
		distance_meters: distanceMeters,
		line_count: lineIds.size,
		trip_count: tripCount,
	});
}
