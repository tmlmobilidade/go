/* * */

import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/**
 * Select source routes by their poster line ID without requiring a line_id column.
 * @param routeIds - Route IDs present in the imported GTFS.
 * @param config - The requested Canvas selection.
 * @returns A SQL condition and bound parameters for the trips table.
 */
export function getCanvasLineFilter(routeIds: string[], config: ExportHitouchConfig): { clause: string, parameters: string[] } {
	if (config.content_mode !== 'lines' && config.content_mode !== 'lines_stops') {
		return { clause: '', parameters: [] };
	}
	if (!config.line_codes.length) throw new Error('Selected lines are required for line poster targets.');
	const selectedLines = new Set(config.line_codes);
	const parameters = routeIds.filter((routeId) => {
		const selected = selectedLines.has(getPosterRouteId(routeId));
		return config.lines_mode === 'exclude' ? !selected : selected;
	});
	return {
		clause: parameters.length ? `trips.route_id IN (${parameters.map(() => '?').join(', ')})` : '1 = 0',
		parameters,
	};
}
