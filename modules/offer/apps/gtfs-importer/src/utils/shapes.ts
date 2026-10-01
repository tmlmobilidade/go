/* * */

import { parseCsv, readGtfsFile } from '@/helpers/index.js';
import { GtfsStrictV29Shapes, GtfsStrictV29ShapesSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

export async function loadGtfsShapes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'shapes.txt');
	const rawShapes = parseCsv<GtfsStrictV29Shapes>(content);
	const shapes: GtfsStrictV29Shapes[] = [];

	for (const raw of rawShapes) {
		try {
			shapes.push(GtfsStrictV29ShapesSchema.parse(raw));
		} catch (error) {
			Logger.warning({ error, message: 'Skipping shape due to validation error' });
		}
	}

	return shapes;
}
