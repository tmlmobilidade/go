/* * */

import { GtfsStrictV30SteppShapesSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { readCsv } from '../fetchers/csv.js';
import { type PlanExportConfig } from '../types.js';
import { groupSource, mergeSharedRow } from '../utils/merge.js';
import { number, required } from '../utils/rows.js';

/* * */

/** Prepare shapes definitions from one normalized plan. */
export async function exportShapes(config: PlanExportConfig, usedShapes: Set<string>) {
	const { writers } = config;
	let exportedShapePoints = 0;
	for (const id of usedShapes) mergeSharedRow(config, 'shapes', id, {});
	const foundShapes = new Set<string>();
	await readCsv(config, 'shapes', async (row) => {
		const id = required(row, 'shape_id');
		if (!usedShapes.has(id)) return;
		GtfsStrictV30SteppShapesSchema.parse({
			...row,
			shape_dist_traveled: number(row.shape_dist_traveled),
			shape_pt_lat: number(row.shape_pt_lat),
			shape_pt_lon: number(row.shape_pt_lon),
			shape_pt_sequence: number(row.shape_pt_sequence),
		});
		foundShapes.add(id);
		await writers.shapes.writeCandidate(row, groupSource(id, config.planId));
		exportedShapePoints++;
	});
	for (const id of usedShapes) if (!foundShapes.has(id)) throw new Error(`Missing shape "${id}" referenced by trips.txt`);

	return exportedShapePoints;
}
