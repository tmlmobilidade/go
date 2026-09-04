/* * */

import { getQualifiedShapeId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type GtfsShapes } from '@tmlmobilidade/go-types-gtfs';
import { type HubGtfsExportShapesInput, HubGtfsExportShapesSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the shapes.txt file.
 * @param context The export context.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 */
export async function exportShapesFile(context: ExportGtfsContext, planData: Plan, sqlTables: GtfsSQLTables) {
	//

	for await (const shapesItem of sqlTables.shapes.stream('ORDER BY shape_id, shape_pt_sequence ASC')) {
		const shapeData: GtfsShapes = shapesItem;
		const parsedShapesRow: HubGtfsExportShapesInput = {
			shape_dist_traveled: shapeData.shape_dist_traveled,
			shape_id: getQualifiedShapeId(planData._id, planData.agency_id, shapeData.shape_id),
			shape_pt_lat: shapeData.shape_pt_lat,
			shape_pt_lon: shapeData.shape_pt_lon,
			shape_pt_sequence: shapeData.shape_pt_sequence,
		};
		const validatedShapesRow = HubGtfsExportShapesSchema.parse(parsedShapesRow);
		await context.writers.shapes.write(validatedShapesRow);
	}

	await context.writers.shapes.flush();

	Logger.info({ message: 'Exported shapes.txt file.' });
}
