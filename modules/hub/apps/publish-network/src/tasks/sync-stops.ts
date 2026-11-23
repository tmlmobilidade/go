/* * */

import { getQualifiedLineId, getQualifiedPatternId, getQualifiedRouteId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

import { type NetworkContext } from '../types/network.js';
import { parseStop } from '../utils/parse-stop.js';

/* * */

interface StopReference {
	route_id: string
	shape_id: string
	stop_id: string
}

/* * */

export async function syncStops(plan: Plan, importedGtfsSql: GtfsSQLTables, context: NetworkContext, aliases: Map<string, Stop>): Promise<Map<string, HubV1ApiStop>> {
	const references = importedGtfsSql.stop_times.query<StopReference>(`
		SELECT DISTINCT st.stop_id, t.route_id, t.shape_id
		FROM stop_times st
		JOIN trips t ON st.trip_id = t.trip_id
	`);
	const stops = new Map<string, HubV1ApiStop>();

	for (const reference of references) {
		let sourceStop = aliases.get(reference.stop_id);
		if (!sourceStop) {
			const foundStop = await goDb.infrastructure.stops.findById(reference.stop_id);
			if (!foundStop || foundStop.is_deleted) throw new Error(`Stop ${reference.stop_id} not found for agency ${plan.agency_id}`);
			sourceStop = foundStop;
			aliases.set(reference.stop_id, sourceStop);
		}

		let stop = context.stops.get(sourceStop._id);
		if (!stop) {
			stop = parseStop(sourceStop, plan.agency_id);
			context.stops.set(stop._id, stop);
		}

		const routeId = getQualifiedRouteId(plan.agency_id, reference.route_id);
		const route = context.route_data.get(routeId);
		if (!route) throw new Error(`Route ${routeId} not found for plan ${plan._id}`);

		stop.line_ids = Array.from(new Set([...stop.line_ids, getQualifiedLineId(plan.agency_id, route.route_short_name)]));
		stop.route_ids = Array.from(new Set([...stop.route_ids, routeId]));
		stop.pattern_ids = Array.from(new Set([...stop.pattern_ids, getQualifiedPatternId(plan.agency_id, reference.shape_id)]));
		stops.set(reference.stop_id, stop);
	}

	return stops;
}
