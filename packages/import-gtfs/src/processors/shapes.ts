/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { parseCsvFile } from '@/utils/parse-csv.js';
import { type GtfsStrictV29Shapes, GtfsStrictV29ShapesSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Processes the shapes.txt file from the GTFS dataset.
 * Include only the shapes referenced by the previously saved trips.
 * @param context The import GTFS context containing references to SQL tables and other metadata.
 */
export async function processShapesFile(context: ImportGtfsContext): Promise<void> {
	try {
		//

		const shapesParseTimer = new Timer();

		Logger.info({ message: 'Reading zip entry "shapes.txt"...' });

		const parseEachRow = async (data: GtfsStrictV29Shapes) => {
			// Validate the current row against the proper type
			const validatedData = GtfsStrictV29ShapesSchema.safeParse(data);
			// For each route, only save the ones referenced
			// by the previously saved trips.
			if (!context.referenced_shape_ids.has(validatedData.data.shape_id)) return;
			// Save the exported row
			context.gtfs.shapes.write(validatedData.data);
			// Log progress
			if (context.counters.shapes % 100000 === 0) Logger.info({ message: `Parsed ${context.counters.shapes} shapes.txt rows so far (${shapesParseTimer.get()})` });
			// Increment the counter
			context.counters.shapes++;
		};

		//
		// Setup the CSV parsing operation

		await parseCsvFile(`${context.workdir.extract_dir_path}/shapes.txt`, parseEachRow);

		context.gtfs.shapes.flush();

		Logger.success(`Finished processing "shapes.txt": ${context.gtfs.shapes.size} rows saved in ${shapesParseTimer.get()}.`, 1);

		//
	} catch (error) {
		Logger.error({ error, message: `Error processing "shapes.txt" file: ${error.message}` });
		throw new Error('✖︎ Error processing "shapes.txt" file.', error);
	}
}
