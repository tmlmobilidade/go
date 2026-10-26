/* * */

import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { collectPlanCalendars, exportAgencyFile, exportRoutes, exportRoutesStepp, exportShapes, exportStops, exportStopTimes, exportTrips } from './exports/index.js';
import { readById } from './fetchers/csv.js';
import { fetchTrips } from './fetchers/trips.js';
import { type PlanExportConfig } from './types.js';

/* * */

/**
 * Converts one normalized Operation plan into the shared STePP feed.
 * @param config - The configuration of the plan export.
 * @returns The number of trips exported.
 */
export async function exportPlanGtfs(config: PlanExportConfig): Promise<number> {
	const timer = new Timer();
	const prefix = `[STePP plan ${config.planId}]`;
	Logger.info(`${prefix} Resolving service dates inside ${config.startDate}–${config.endDate}...`);
	const services = await collectPlanCalendars(config);
	Logger.info(`${prefix} Found ${services.size} service definitions for calendar merging.`);
	const routes = await readById(config, 'routes', 'route_id');
	const { skippedTrips, trips, usedRoutes, usedServices, usedShapes } = await fetchTrips(config, routes, services);
	const usedStops = new Set<string>();

	Logger.info(`${prefix} Selected ${trips.size} trips, ${usedRoutes.size} routes, ${usedServices.size} services and ${usedShapes.size} shapes; skipped ${skippedTrips} trips with no service in the range.`);
	if (trips.size === 0) {
		Logger.warning(`${prefix} No active trips in ${config.startDate}–${config.endDate}; this plan contributes only calendar overrides, if any.`);
		return 0;
	}

	await exportAgencyFile(config);
	const exportedStopTimes = await exportStopTimes(config, trips, usedStops);
	const stops = await exportStops(config, usedStops);
	const exportedShapePoints = await exportShapes(config, usedShapes);
	const patterns = await exportTrips(config, trips);
	Logger.info(`${prefix} Merging ${usedRoutes.size} routes into routes.txt and checking definitions from earlier plans...`);
	await exportRoutes(config, routes, usedRoutes);
	await exportRoutesStepp(config, routes, usedRoutes, patterns, stops);

	Logger.success({
		attributes: { duration_ms: timer.getMs(), plan_id: config.planId, routes: usedRoutes.size, services: usedServices.size, shape_points: exportedShapePoints, stop_times: exportedStopTimes, stops: usedStops.size, trips: trips.size },
		message: `${prefix} Prepared ${trips.size} trips, ${exportedStopTimes} stop times, ${usedStops.size} referenced stops, ${exportedShapePoints} shape points and ${usedServices.size} calendars in ${timer.get()}.`,
	});
	return trips.size;
}
