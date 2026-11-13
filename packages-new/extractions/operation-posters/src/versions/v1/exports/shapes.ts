/* * */

import { type ShapesExt, ShapesSchema } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportShapesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, shapeExtensions: ReadonlyMap<string, ShapesExt>) {
	//

	//
	// A. Write geometry for patterns referenced by the rebuilt trips

	let exportedRows = 0;

	for (const shapeData of sqlTables.shapes.all('ORDER BY shape_id ASC, CAST(shape_pt_sequence AS INTEGER) ASC')) {
		if (!shapeExtensions.has(shapeData.shape_id)) continue;
		await context.writers.shapes.write(ShapesSchema.parse(shapeData));
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	//
	// B. Flush shapes.txt

	await context.writers.shapes.flush();

	Logger.info({ message: 'Exported shapes.txt file.' });
}
