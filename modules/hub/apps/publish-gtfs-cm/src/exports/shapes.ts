/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Shape, type Plan } from '@tmlmobilidade/types';

/* * */

export interface ExportedShapesRow {
	shape_id: string
	shape_pt_sequence: number
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
}

/* * */

export async function exportShapesRows(planData: Plan, sqlTables: GtfsSQLTables, exportConfig: MergedGtfsExportConfig) {
	//

	for await (const shapesItem of sqlTables.shapes.stream('ORDER BY shape_id, shape_pt_sequence ASC')) {
		const shapeData: GTFS_Shape = shapesItem;
		const parsedShapesRow: ExportedShapesRow = {
			shape_id: `[${planData._id}]${shapeData.shape_id}`,
			shape_pt_sequence: shapeData.shape_pt_sequence,
			shape_dist_traveled: shapeData.shape_dist_traveled,
			shape_pt_lat: shapeData.shape_pt_lat,
			shape_pt_lon: shapeData.shape_pt_lon,
		};
		await exportConfig.writers.shapes.write(parsedShapesRow);
	}

	await exportConfig.writers.shapes.flush();

	Logger.info({ message: 'Exported shapes.txt file.' });
}
