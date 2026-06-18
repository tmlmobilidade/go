/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Shape, type Plan } from '@tmlmobilidade/types';
import { getPublicShapeId } from '@tmlmobilidade/utils';

/* * */

export interface ExportedShapesRow {
	shape_id: string
	shape_pt_sequence: number
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
}

/**
 * Export the shapes.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportShapesFile(planData: Plan, sqlTables: GtfsSQLTables, context: ExportGtfsContext) {
	//

	for await (const shapesItem of sqlTables.shapes.stream('ORDER BY shape_id, shape_pt_sequence ASC')) {
		const shapeData: GTFS_Shape = shapesItem;
		const parsedShapesRow: ExportedShapesRow = {
			shape_id: getPublicShapeId(planData._id, planData.gtfs_agency.agency_id, shapeData.shape_id),
			shape_pt_sequence: shapeData.shape_pt_sequence,
			shape_dist_traveled: shapeData.shape_dist_traveled,
			shape_pt_lat: shapeData.shape_pt_lat,
			shape_pt_lon: shapeData.shape_pt_lon,
		};
		await context.writers.shapes.write(parsedShapesRow);
	}

	await context.writers.shapes.flush();

	Logger.info({ message: 'Exported shapes.txt file.' });
}
