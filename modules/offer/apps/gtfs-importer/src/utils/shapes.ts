/* * */

import { parseCsv, readGtfsFile } from '@/helpers/index.js';
import { GTFS_Shape, GTFS_Shape_Raw, validateGtfsShape } from '@tmlmobilidade/types';

/* * */

export async function loadGtfsShapes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'shapes.txt');
	const rawShapes = parseCsv<GTFS_Shape_Raw>(content);
	const shapes: GTFS_Shape[] = [];

	for (const raw of rawShapes) {
		try {
			shapes.push(validateGtfsShape(raw));
		} catch (error) {
			console.warn(`Skipping shape due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return shapes;
}
