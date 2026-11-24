/* * */

import { getQualifiedRouteId } from '@tmlmobilidade/go-hub-pckg-utils';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { HubV1ApiLineSchema, HubV1ApiPatternSchema, HubV1ApiRouteSchema, HubV1ApiStopSchema, HubV1GtfsRoutesSchema } from '@tmlmobilidade/go-types-hub';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type Network, type NetworkContext } from '../types/network.js';
import { getActivePlans } from '../utils/get-active-plans.js';
import { getStopAliases } from '../utils/get-stop-aliases.js';
import { syncLinesRoutesPatterns } from './sync-lines-routes-patterns.js';
import { syncStops } from './sync-stops.js';

/* * */

export async function buildNetwork(agencyId: string, currentDate: OperationalDateInt): Promise<Network> {
	const context: NetworkContext = {
		lines: new Map(),
		patterns: new Map(),
		route_data: new Map(),
		routes: new Map(),
		stops: new Map(),
	};
	const plans = await getActivePlans(agencyId, currentDate);
	const stopAliases = plans.length ? await getStopAliases(agencyId) : new Map();

	// Plans are ordered by precedence, so the first definition of each route wins.
	for (const plan of plans) {
		Logger.info({ message: `Processing agency ${agencyId} plan ${plan._id}...` });

		if (!plan.attachments.operation_gtfs_normalized) throw new Error(`Plan ${plan._id} has no normalized GTFS attachment`);
		const url = await storageProvider.getSignedUrl({ fileId: plan.attachments.operation_gtfs_normalized });
		const importedGtfsSql = await importGtfsToDatabase({
			source: { url },
			sqlite_config: { memory: true },
			time_range: {
				date_range: {
					end: plan.active_until,
					start: plan.active_from <= currentDate ? OperationalDateIntSchema.parse('20010101') : plan.active_from,
				},
			},
		});

		try {
			for (const route of importedGtfsSql.routes.all()) {
				const routeId = getQualifiedRouteId(agencyId, route.route_id);
				if (!context.route_data.has(routeId)) {
					context.route_data.set(routeId, HubV1GtfsRoutesSchema.parse({ ...route, agency_id: agencyId, route_id: routeId }));
				}
			}

			const stops = await syncStops(plan, importedGtfsSql, context, stopAliases);
			await syncLinesRoutesPatterns(plan, importedGtfsSql, context, stops);
		} finally {
			importedGtfsSql._db.cleanup();
		}
	}

	return {
		lines: HubV1ApiLineSchema.array().parse(Array.from(context.lines.values())),
		patterns: Array.from(context.patterns.values(), versions => HubV1ApiPatternSchema.array().parse(Array.from(versions.values()))),
		routes: HubV1ApiRouteSchema.array().parse(Array.from(context.routes.values())),
		stops: HubV1ApiStopSchema.array().parse(Array.from(context.stops.values())),
	};
}
