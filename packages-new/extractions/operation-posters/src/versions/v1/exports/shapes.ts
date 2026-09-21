/* * */

import { OperationPostersV1ShapesSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { buildVariantNotes } from '../utils/build-variant-notes.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

/**
 * Export geometry and explicit pattern ordering to match the letters in stop-time notes.
 * @param context - The export context and file writers.
 * @param sqlTables - The SQL tables to export from.
 */
export async function exportShapesFiles(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables) {
	//

	//
	// Export shapes.txt and shapesExt.txt

	const { shapeSequences } = buildVariantNotes(sqlTables.trips.all());
	const exportedShapeIds = new Set<string>();
	let exportedRows = 0;

	//
	// Export shapes

	for (const shapeData of sqlTables.shapes.all('ORDER BY shape_id ASC, shape_pt_sequence ASC')) {
		//
		// Export shapes.txt

		const sequence = shapeSequences.get(shapeData.shape_id);
		if (!sequence) continue;
		await context.writers.shapes.write(OperationPostersV1ShapesSchema.parse(shapeData));
		exportedRows++;
		await yieldToEventLoop(exportedRows);

		if (exportedShapeIds.has(shapeData.shape_id)) continue;

		//
		// Export shapesExt.txt

		const extension = {
			direction_description: '',
			note: '',
			priority_number: sequence === 1 ? 1 : 2,
			sequence_number: sequence,
			shape_id: shapeData.shape_id,
			via_text: '',
		};
		await context.writers.shapes_ext.write(extension);
		exportedShapeIds.add(shapeData.shape_id);
	}

	//
	// Flush and Log

	await context.writers.shapes.flush();
	await context.writers.shapes_ext.flush();

	Logger.info({ message: `Exported shapes.txt and shapesExt.txt for ${exportedShapeIds.size} patterns.` });
}
