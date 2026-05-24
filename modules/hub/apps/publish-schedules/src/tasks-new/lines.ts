/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { type InitImportGtfsContext } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type HubLine } from '@tmlmobilidade/types';

/**
 * Generate lines from the import context.
 */
export async function generateLines(context: InitImportGtfsContext) {
	//

	//
	// Get all routes from all agencies,
	// and group them by 'agency_id-line_id' key.

	const queryResult = context.gtfs.routes.all();

	const groupedRoutes = new Map<string, typeof queryResult>();

	for (const queryItem of queryResult) {
		const key = `${queryItem.agency_id}-${queryItem.line_id}`;
		if (!groupedRoutes.has(key)) groupedRoutes.set(key, []);
		groupedRoutes.get(key)?.push(queryItem);
	}

	//
	// Parse the grouped routes into hub lines.

	const hubLines: HubLine[] = [];

	for (const [key, routes] of groupedRoutes.entries()) {
		hubLines.push({
			color: routes[0].route_color,
			district_ids: [],
			facilities: [],
			id: key,
			locality_ids: [],
			long_name: routes[0].line_long_name,
			municipality_ids: [],
			pattern_ids: [],
			region_ids: [],
			route_ids: routes.map(route => route.route_id),
			short_name: routes[0].line_short_name,
			stop_ids: [],
			text_color: routes[0].route_text_color,
			tts_name: '',
		});
	}

	//
	// Save the parsed lines to the API cache.

	await apiCache.set('hub:network:lines', JSON.stringify(hubLines));

	Logger.info(`Generated ${hubLines.length} lines from the import context.`);
}
