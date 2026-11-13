/* * */

import { quoteIdentifier } from '../lib/quote-identifier.js';
import { type OperationPostersV1Tables } from '../types/context.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * Merge an imported plan into the combined database, preserving IDs and the union of GTFS columns.
 */
export function mergeGtfsTables(target: OperationPostersV1Tables | undefined, source: OperationPostersV1Tables): OperationPostersV1Tables {
	//

	//
	// A. Use the first imported plan as the combined database

	if (!target) return source;

	//
	// B. Reject poster routes shared by multiple selected plans

	const existingRouteIds = new Set(target.routes.all().map(route => getPosterRouteId(route.route_id)));
	for (const route of source.routes.all()) {
		if (existingRouteIds.has(getPosterRouteId(route.route_id))) {
			throw new Error(`Route ${route.route_id} is used by more than one selected plan.`);
		}
	}

	//
	// C. Open the source and target databases

	const sourceDb = source._db.databaseInstance;
	const targetDb = target._db.databaseInstance;

	//
	// D. Attach the source database to the target database

	targetDb.prepare('ATTACH DATABASE ? AS imported_plan').run(sourceDb.name);
	try {
		//
		// E. Extend the combined schema and copy rows by column name in one transaction

		targetDb.transaction(() => {
			for (const table of ['routes', 'trips', 'stop_times', 'shapes', 'stops'] as const) {
				const targetColumns = targetDb.prepare(`PRAGMA main.table_info("${table}")`).all() as { name: string }[];
				const sourceColumns = targetDb.prepare(`PRAGMA imported_plan.table_info("${table}")`).all() as { name: string }[];
				const existingColumns = new Set(targetColumns.map(column => column.name.toLowerCase()));

				for (const column of sourceColumns) {
					if (existingColumns.has(column.name.toLowerCase())) continue;
					targetDb.exec(`ALTER TABLE main."${table}" ADD COLUMN ${quoteIdentifier(column.name)} TEXT`);
					existingColumns.add(column.name.toLowerCase());
				}

				// Omitted target columns become NULL; the explicit list also handles reordered headers.
				const columns = sourceColumns.map(column => quoteIdentifier(column.name)).join(', ');
				const values = sourceColumns.map(column => `incoming.${quoteIdentifier(column.name)}`).join(', ');
				const filter = table === 'stops'
					? ' WHERE NOT EXISTS (SELECT 1 FROM main.stops AS existing WHERE existing.stop_id = incoming.stop_id)'
					: '';
				targetDb.exec(`INSERT INTO main."${table}" (${columns}) SELECT ${values} FROM imported_plan."${table}" AS incoming${filter}`);
			}
		})();

		// Calendar rebuilding writes trips and stop times again, so include newly added columns.
		for (const table of ['routes', 'trips', 'stop_times', 'shapes', 'stops'] as const) target[table].refreshColumns();
		Object.assign(target.calendar_dates, source.calendar_dates);
	} finally {
		//
		// E. Detach the source database on success or failure

		targetDb.exec('DETACH DATABASE imported_plan');
	}

	//
	// F. Return the merged tables

	return target;
}
