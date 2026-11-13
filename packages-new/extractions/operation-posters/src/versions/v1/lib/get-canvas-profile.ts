/* * */

import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';

/* * */

export function getAutomaticCanvasProfile(routeCount: number, stopCount: number): Exclude<ExportHitouchConfig['canvas_profile'], 'auto'> {
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
