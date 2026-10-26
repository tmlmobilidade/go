/* * */

import { GtfsStrictV30SteppRoutesSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { type PlanExportConfig, type Row } from '../types.js';
import { mergeSharedRow } from '../utils/merge.js';
import { pick, referenced } from '../utils/rows.js';

/* * */

/** Prepare routes definitions from one normalized plan. */
export async function exportRoutes(config: PlanExportConfig, routes: Map<string, Row>, usedRoutes: Set<string>) {
	for (const id of usedRoutes) {
		const route = pick(referenced(routes, id, 'route'), ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_desc', 'route_type']);
		GtfsStrictV30SteppRoutesSchema.parse(route);
		mergeSharedRow(config, 'routes', id, route);
	}
}
