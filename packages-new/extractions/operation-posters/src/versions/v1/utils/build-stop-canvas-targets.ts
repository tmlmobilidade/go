/* * */

import { type OperationPostersV1StopToCanvasExt } from '@tmlmobilidade/go-types-operation';

import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

interface StopRouteDirection {
	direction_id: number
	route_id: string
	stop_count: number
	stop_id: string
}

/** Choose one stop Canvas profile per direction, counting route variants as one route. */
export function buildStopCanvasTargets(rows: StopRouteDirection[], config: Pick<ExportHitouchConfig, 'canvas_profile' | 'content_mode'>): OperationPostersV1StopToCanvasExt[] {
	//

	//
	// A. Collect the distinct poster routes serving each stop and direction

	const groups = new Map<string, { direction_id: number, routes: Set<string>, stop_id: string, stopCount: number }>();
	for (const row of rows) {
		const key = JSON.stringify([row.stop_id, row.direction_id]);
		let group = groups.get(key);
		if (!group) {
			group = { direction_id: row.direction_id, routes: new Set(), stop_id: row.stop_id, stopCount: 0 };
			groups.set(key, group);
		}
		group.routes.add(getPosterRouteId(row.route_id));
		group.stopCount = Math.max(group.stopCount, row.stop_count);
	}

	//
	// B. Automatically fit all-content exports or keep the selected stop profile

	return [...groups.values()].map(group => ({
		canvas_profile: config.content_mode === 'all' ? getAutomaticCanvasProfile(group.routes.size, group.stopCount) : config.canvas_profile,
		direction_id: group.direction_id,
		stop_id: group.stop_id,
	}));
}

function getAutomaticCanvasProfile(routeCount: number, stopCount: number): ExportHitouchConfig['canvas_profile'] {
	//

	//
	// A. Use two pages for a single route only when its serving pattern exceeds 123 stops

	if (routeCount === 1) return stopCount > 123 ? '0Master.B' : '0Master.A';

	//
	// B. Use the multi-route layout for two to six routes

	if (routeCount <= 6) return '0Master.C';

	//
	// C. Use the largest available layout for seven or more routes

	return '0Master.F';
}
