/* * */

import { type ShapesExt } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportShapesExtFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, shapeExtensions: ReadonlyMap<string, ShapesExt>) {
	//

	//
	// A. Write one extension per exported pattern, in shape order
	// The main pattern still needs sequence/priority even though its note is blank.

	let exportedRows = 0;

	for (const { shape_id: shapeId } of sqlTables.shapes.query<{ shape_id: string }>('SELECT DISTINCT shape_id FROM shapes ORDER BY shape_id ASC')) {
		const extension = shapeExtensions.get(shapeId);
		if (!extension) continue;
		await context.writers.shapes_ext.write(extension);
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	//
	// B. Flush shapesExt.txt

	await context.writers.shapes_ext.flush();

	Logger.info({ message: `Exported ${exportedRows} rows in shapesExt.txt with pattern ordering and notes.` });
}
