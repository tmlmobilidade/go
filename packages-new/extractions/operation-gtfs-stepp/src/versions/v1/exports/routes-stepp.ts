/* * */

import { GtfsStrictV30SteppRouteSteppSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { readCsv } from '../fetchers/csv.js';
import { type Pattern, type PlanExportConfig, type Row } from '../types.js';
import { groupSource, mergeSharedRow } from '../utils/merge.js';
import { referenced, required } from '../utils/rows.js';

/* * */

const CONTRACTS: Record<string, string> = { 41: 'TML 24/2020', 42: 'TML 25/2020', 43: 'TML 26/2020', 44: 'TML 27/2020' };

/** Prepare routes-stepp definitions from one normalized plan. */
export async function exportRoutesStepp(config: PlanExportConfig, routes: Map<string, Row>, usedRoutes: Set<string>, patterns: Map<string, Pattern>, stops: Map<string, Row>) {
	const { writers } = config;
	const routeExtensions = new Map<string, Row[]>();
	await readCsv(config, 'routes_stepp', async (row) => {
		const id = required(row, 'route_id');
		routeExtensions.set(id, [...(routeExtensions.get(id) ?? []), row]);
	}, true);

	for (const routeId of usedRoutes) {
		mergeSharedRow(config, 'routes_stepp', routeId, {});
		const seenExtensions = new Set<string>();
		const route = referenced(routes, routeId, 'route');
		const routePatterns = Array.from(patterns.values()).filter(pattern => pattern.routeId === routeId);
		const extensions = routeExtensions.get(routeId);
		// Source extension rows describe a route and have no reliable pattern key.
		// Preserve each once instead of pairing it with every active pattern.
		const records = extensions
			? extensions.map(extension => ({ extension, pattern: { ...routePatterns[0], circular: routePatterns.every(pattern => pattern.circular) } }))
			: routePatterns.map(pattern => ({ extension: route, pattern }));
		for (const { extension, pattern } of records) {
			const output = {
				circular: extensions && extension.circular !== undefined ? extension.circular : pattern.circular ? '1' : '0',
				contract: extension.contract ?? route.contract ?? CONTRACTS[config.agencyCode] ?? '',
				path_type: extension.path_type ?? route.path_type ?? '1',
				route_destination: extension.route_destination ?? route.route_destination ?? referenced(stops, pattern.lastStop, 'stop').stop_name,
				route_id: pattern.routeId,
				route_origin: extension.route_origin ?? route.route_origin ?? referenced(stops, pattern.firstStop, 'stop').stop_name,
			};
			GtfsStrictV30SteppRouteSteppSchema.parse(output);
			// Multiple directions may share a route ID, as in the Offer STePP format.
			const key = JSON.stringify(output);
			if (seenExtensions.has(key)) continue;
			seenExtensions.add(key);
			await writers.routes_stepp.writeCandidate(output, groupSource(routeId, config.planId));
		}
	}
}
