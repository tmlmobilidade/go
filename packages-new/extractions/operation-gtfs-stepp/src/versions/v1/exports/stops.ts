/* * */

import { GtfsStrictV30SteppStopsSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { readCsv } from '../fetchers/csv.js';
import { type PlanExportConfig, type Row } from '../types.js';
import { mergeSharedRow } from '../utils/merge.js';
import { number, pick, required } from '../utils/rows.js';

/* * */

/** Prepare stops definitions from one normalized plan. */
export async function exportStops(config: PlanExportConfig, usedStops: Set<string>) {
	const stops = new Map<string, Row>();
	await readCsv(config, 'stops', async (row) => {
		const id = required(row, 'stop_id');
		if (!usedStops.has(id)) return;
		if (stops.has(id)) throw new Error(`Duplicate stop_id "${id}"`);
		const stop = pick(row, ['stop_id', 'stop_code', 'stop_name', 'stop_desc', 'stop_lat', 'stop_lon', 'zone_id']);
		GtfsStrictV30SteppStopsSchema.parse({ ...stop, stop_lat: number(stop.stop_lat), stop_lon: number(stop.stop_lon) });
		stops.set(id, stop);
		mergeSharedRow(config, 'stops', id, stop);
	});
	for (const id of usedStops) if (!stops.has(id)) throw new Error(`Missing stop "${id}" referenced by stop_times.txt`);

	return stops;
}
