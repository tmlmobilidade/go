/* * */

import { type StopToCanvasExt } from '@tmlmobilidade/go-types-gtfs-hitouch';

import { getAutomaticCanvasProfile } from '../lib/get-canvas-profile.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { type StopRouteDirection } from '../types/interfaces.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/** Choose one stop Canvas profile per direction, counting route variants as one route. */
export function buildStopCanvasTargets(rows: StopRouteDirection[], config: Pick<ExportHitouchConfig, 'canvas_profile' | 'content_mode'>): StopToCanvasExt[] {
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
	// B. Fit automatic profiles per stop and direction or keep the selected profile

	return [...groups.values()].map(group => ({
		canvas_profile: config.content_mode === 'all' || config.canvas_profile === 'auto' ? getAutomaticCanvasProfile(group.routes.size, group.stopCount) : config.canvas_profile,
		direction_id: group.direction_id,
		stop_id: group.stop_id,
	}));
}
