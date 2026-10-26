/* * */

import { type PlanExportConfig, type Row, type Trip } from '../types.js';
import { required } from '../utils/rows.js';
import { readCsv } from './csv.js';

/* * */

/** Select active trips and their references from one normalized plan. */
export async function fetchTrips(config: PlanExportConfig, routes: Map<string, Row>, services: Map<string, Set<string>>) {
	const trips = new Map<string, Trip>();
	const usedRoutes = new Set<string>();
	const usedServices = new Set<string>();
	const usedShapes = new Set<string>();
	let skippedTrips = 0;

	await readCsv(config, 'trips', async (row) => {
		if (!services.get(required(row, 'service_id'))?.size) {
			skippedTrips++;
			return;
		}
		const id = required(row, 'trip_id');
		if (trips.has(id)) throw new Error(`Duplicate trip_id "${id}"`);
		const routeId = required(row, 'route_id');
		const route = routes.get(routeId);
		if (!route) throw new Error(`Trip "${id}" references missing route "${routeId}"`);
		if (route.agency_id !== config.agencyCode) throw new Error(`Route "${routeId}" does not belong to agency "${config.agencyCode}"`);
		trips.set(id, { row });
		usedRoutes.add(routeId);
		usedServices.add(required(row, 'service_id'));
		usedShapes.add(required(row, 'shape_id'));
	});

	return { skippedTrips, trips, usedRoutes, usedServices, usedShapes };
}
