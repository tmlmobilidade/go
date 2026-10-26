/* * */

import { type PlanExportConfig } from '../types.js';
import { groupSource } from '../utils/merge.js';
import { type SteppWriters } from '../utils/writers.js';
import { exportCalendars } from './calendar.js';

/* * */

/**
 * Writes final definitions, complete row groups and merged calendars with original IDs.
 * @param sharedRows - The shared rows to write.
 * @param writers - The writers to write the shared rows to.
 */
export async function writeSharedFiles(sharedRows: PlanExportConfig['sharedRows'], writers: SteppWriters) {
	const services = await exportCalendars(sharedRows, writers);
	let exportedTrips = 0;
	for (const table of ['agency', 'routes', 'stops', 'trips'] as const) {
		for (const [key, source] of sharedRows) {
			if (!key.startsWith(`${table}:`)) continue;
			if (table === 'trips' && !services.get(String(source.row.service_id))?.size) continue;
			await writers[table].write(source.row);
			if (table === 'trips') exportedTrips++;
		}
	}
	for (const [table, ownerTable] of [['stop_times', 'trips'], ['shapes', 'shapes'], ['routes_stepp', 'routes_stepp']] as const) {
		const sources = new Set<string>();
		for (const [key, source] of sharedRows) {
			if (!key.startsWith(`${ownerTable}:`)) continue;
			if (ownerTable === 'trips' && !services.get(String(source.row.service_id))?.size) continue;
			sources.add(groupSource(key.slice(ownerTable.length + 1), source.planId));
		}
		await writers[table].writeSelected(sources);
	}
	return exportedTrips;
}
