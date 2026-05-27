/* * */

import type { RouteNode, StopWaypoint, TripContext } from '@/types.js';
import type { ClickHouseClient } from '@clickhouse/client';

import { qualifiedTable } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Resolves the trip's `hashed_shape_id` and `hashed_trip_id` from `curr_rides`.
 * The loader phase populates that table; if no row matches, the analyzer's
 * earlier `ensureRidePresent` precheck would already have failed.
 */
export async function fetchTripHashes(clickhouseClient: ClickHouseClient, tripId: string): Promise<TripContext> {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT hashed_shape_id, hashed_trip_id
			FROM ${qualifiedTable('curr_rides')}
			WHERE trip_id = {trip_id:String}
			LIMIT 1
		`,
		query_params: { trip_id: tripId },
	});
	const rows = await result.json<{ hashed_shape_id: string, hashed_trip_id: string }>();
	if (rows.length === 0) {
		throw new Error(`No row in curr_rides for trip_id=${tripId}; cannot resolve trip context for the viewer.`);
	}
	return {
		hashedShapeId: rows[0].hashed_shape_id,
		hashedTripId: rows[0].hashed_trip_id,
	};
}

/**
 * Returns the ordered shape-node polyline (one row per `node_index`).
 * Used by the viewer to draw the route polyline and to look up coordinates of
 * the snapped node referenced by each `curr_vehicle_event.node_index`.
 */
export async function fetchRouteNodes(clickhouseClient: ClickHouseClient, hashedShapeId: string): Promise<RouteNode[]> {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT node_index, latitude, longitude
			FROM ${qualifiedTable('hist_shape_nodes')}
			WHERE hashed_shape_id = {hashed_shape_id:String}
			ORDER BY node_index ASC
		`,
		query_params: { hashed_shape_id: hashedShapeId },
	});
	const nodes = await result.json<RouteNode>();
	Logger.info(`Fetched ${nodes.length} route nodes for hashed_shape_id=${hashedShapeId}`);
	return nodes;
}

/**
 * Returns the trip's stops with their snapped `node_index` and coordinates.
 * Already produced by the loader's `4-snap-waypoints.sql`, so no joins needed.
 */
export async function fetchStopWaypoints(clickhouseClient: ClickHouseClient, hashedTripId: string): Promise<StopWaypoint[]> {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT
				hashed_trip_id,
				hashed_shape_id,
				stop_sequence,
				stop_id,
				stop_name,
				stop_lat,
				stop_lon,
				node_index,
				arrival_time,
				departure_time
			FROM ${qualifiedTable('curr_waypoints_snapped')}
			WHERE hashed_trip_id = {hashed_trip_id:String}
			ORDER BY stop_sequence ASC
		`,
		query_params: { hashed_trip_id: hashedTripId },
	});
	const stops = await result.json<StopWaypoint>();
	Logger.info(`Fetched ${stops.length} stops for hashed_trip_id=${hashedTripId}`);
	return stops;
}
