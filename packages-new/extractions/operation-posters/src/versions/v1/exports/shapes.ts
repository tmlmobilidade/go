/* * */

import { GtfsStrictV30ShapesSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationPostersV1ShapesSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { buildShapeExtensions } from '../utils/build-shape-extensions.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

/**
 * Export geometry and one extension per pattern, including ordering for the main pattern.
 * @param context - The export context and file writers.
 * @param sqlTables - The SQL tables to export from.
 */
export async function exportShapesFiles(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables) {
	//

	//
	// Export shapes.txt and shapesExt.txt

	const shapeExtensions = buildShapeExtensions(sqlTables.trips.all());
	const exportedShapeIds = new Set<string>();
	let exportedRows = 0;
	let extensionRows = 0;

	//
	// Export shapes

	for (const shapeData of sqlTables.shapes.all('ORDER BY shape_id ASC, CAST(shape_pt_sequence AS INTEGER) ASC')) {
		//
		// Export shapes.txt

		const extension = shapeExtensions.get(shapeData.shape_id);
		if (!extension) continue;
		await context.writers.shapes.write(OperationPostersV1ShapesSchema.parse(GtfsStrictV30ShapesSchema.parse(shapeData)));
		exportedRows++;
		await yieldToEventLoop(exportedRows);

		if (exportedShapeIds.has(shapeData.shape_id)) continue;

		//
		// Export shapesExt.txt

		exportedShapeIds.add(shapeData.shape_id);
		// The main pattern still needs sequence/priority even though its note is blank.
		await context.writers.shapes_ext.write(extension);
		extensionRows++;
	}

	//
	// Flush and Log

	await context.writers.shapes.flush();
	await context.writers.shapes_ext.flush();

	Logger.info({ message: `Exported shapes.txt for ${exportedShapeIds.size} patterns and ${extensionRows} rows in shapesExt.txt with pattern ordering and notes.` });
}
