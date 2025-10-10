/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_Route } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

/* * */

export async function exportRoutesFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const routesCsv = new CsvWriter('routes.txt', `${exportConfig.workdir}/routes.txt`, { batch_size: 100000 });

	for (const routeData of sqlTables.routes.all()) {
		const data: GTFS_Route = {
			agency_id: routeData.agency_id,
			route_color: routeData.route_color,
			route_desc: routeData.route_desc,
			route_id: routeData.route_id,
			route_long_name: routeData.route_long_name,
			route_short_name: routeData.route_short_name,
			route_text_color: routeData.route_text_color,
			route_type: routeData.route_type,
			route_url: routeData.route_url,
		};
		await routesCsv.write(data);
	}

	await routesCsv.flush();

	Logs.info('Exported routes.txt file.');
}
