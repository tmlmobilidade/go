/* * */

import { type StopToCanvasExt } from '@tmlmobilidade/go-types-gtfs-hitouch';

import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { type StopCanvasGroup, type StopRouteDirection } from '../types/interfaces.js';
import { getAutomaticCanvasProfile } from './get-canvas-profile.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/** Choose a Canvas profile from all routes serving each stop. */
export function buildStopCanvasTargets(rows: StopRouteDirection[], config: Pick<ExportHitouchConfig, 'canvas_profile' | 'content'>): StopToCanvasExt[] {
	//

	//
	// A. Collect each stop's directions and distinct routes across those directions

	const stops = new Map<string, StopCanvasGroup>();
	for (const row of rows) {
		let stop = stops.get(row.stop_id);
		if (!stop) {
			stop = { directions: new Set(), routes: new Set(), stopCount: 0 };
			stops.set(row.stop_id, stop);
		}

		stop.directions.add(row.direction_id);
		stop.routes.add(getPosterRouteId(row.route_id));
		stop.stopCount = Math.max(stop.stopCount, row.stop_count);
	}

	//
	// B. Write the same profile for every direction serving the stop

	const targets: StopToCanvasExt[] = [];
	for (const [stopId, stop] of stops) {
		const canvasProfile = config.content === 'all' || config.canvas_profile === 'auto'
			? getAutomaticCanvasProfile(stop.routes.size, stop.stopCount)
			: config.canvas_profile;

		for (const directionId of stop.directions) {
			targets.push({ canvas_profile: canvasProfile, direction_id: directionId, stop_id: stopId });
		}
	}

	return targets;
}
