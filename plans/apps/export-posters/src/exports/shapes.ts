/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_Shape } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

/* * */

export async function exportShapesFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const shapesCsv = new CsvWriter('shapes.txt', `${exportConfig.workdir}/shapes.txt`, { batch_size: 100000 });

	for (const shapeData of sqlTables.shapes.all()) {
		const data: GTFS_Shape = {
			shape_dist_traveled: shapeData.shape_dist_traveled,
			shape_id: shapeData.shape_id,
			shape_pt_lat: shapeData.shape_pt_lat,
			shape_pt_lon: shapeData.shape_pt_lon,
			shape_pt_sequence: shapeData.shape_pt_sequence,
		};
		await shapesCsv.write(data);
	}

	await shapesCsv.flush();

	Logs.info('Exported shapes.txt file.');
}
