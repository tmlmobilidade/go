/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Route } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';

/* * */

export async function exportRoutesFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const routesCsv = new CsvWriter('routes.txt', `${exportConfig.workdir}/routes.txt`, { batch_size: 100000 });

	//
	// Get all routes and group them by line_id

	const routesByLineId: Record<string, GTFS_Route[]> = {};

	sqlTables.routes.all().forEach((route) => {
		if (!routesByLineId[route.line_id]) routesByLineId[route.line_id] = [];
		routesByLineId[route.line_id].push(route);
	});

	for await (const routesGroup of Object.values(routesByLineId)) {
		// If this line only has one route, export it as is
		if (routesGroup.length === 1) {
			const data: GTFS_Route = {
				agency_id: routesGroup[0].agency_id,
				route_color: routesGroup[0].route_color,
				route_desc: routesGroup[0].route_desc,
				route_id: routesGroup[0].route_id,
				route_long_name: routesGroup[0].route_long_name,
				route_short_name: routesGroup[0].route_short_name,
				route_text_color: routesGroup[0].route_text_color,
				route_type: routesGroup[0].route_type,
				route_url: routesGroup[0].route_url,
			};
			await routesCsv.write(data);
			continue;
		}
		// If this line has multiple routes, sort them by route_id
		// and add a suffix (A, B, C, ...) to the route_short_name
		// to differentiate between them.
		routesGroup.sort((a, b) => (a.route_id < b.route_id ? -1 : 1));
		for (let i = 0; i < routesGroup.length; i++) {
			const data: GTFS_Route = {
				agency_id: routesGroup[i].agency_id,
				route_color: routesGroup[i].route_color,
				route_desc: routesGroup[i].route_desc,
				route_id: routesGroup[i].route_id,
				route_long_name: routesGroup[i].route_long_name,
				route_short_name: `${routesGroup[i].route_short_name}${String.fromCharCode(65 + i)}`, // 65 is 'A' in ASCII
				route_text_color: routesGroup[i].route_text_color,
				route_type: routesGroup[i].route_type,
				route_url: routesGroup[i].route_url,
			};
			await routesCsv.write(data);
		}
	}

	await routesCsv.flush();

	Logger.info({ message: 'Exported routes.txt file.' });
}
