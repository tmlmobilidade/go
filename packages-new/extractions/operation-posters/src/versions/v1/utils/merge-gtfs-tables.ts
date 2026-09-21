/* * */

import { type OperationPostersV1Tables } from '../types/context.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * Merge an imported plan into the combined database, preserving the original IDs.
 */
export function mergeGtfsTables(target: OperationPostersV1Tables | undefined, source: OperationPostersV1Tables): OperationPostersV1Tables {
	if (!target) return source;

	const existingRouteIds = new Set(target.routes.all().map(route => getPosterRouteId(route.route_id)));
	for (const route of source.routes.all()) {
		if (existingRouteIds.has(getPosterRouteId(route.route_id))) {
			throw new Error(`Route ${route.route_id} is used by more than one selected plan.`);
		}
	}

	const sourceDb = source._db.databaseInstance;
	const targetDb = target._db.databaseInstance;
	targetDb.prepare('ATTACH DATABASE ? AS imported_plan').run(sourceDb.name);
	try {
		targetDb.transaction(() => {
			for (const table of ['routes', 'trips', 'stop_times', 'shapes']) {
				targetDb.exec(`INSERT INTO main.${table} SELECT * FROM imported_plan.${table}`);
			}
			targetDb.exec('INSERT INTO main.stops SELECT * FROM imported_plan.stops AS incoming WHERE NOT EXISTS (SELECT 1 FROM main.stops WHERE stop_id = incoming.stop_id)');
		})();
		Object.assign(target.calendar_dates, source.calendar_dates);
	} finally {
		targetDb.exec('DETACH DATABASE imported_plan');
	}

	return target;
}
