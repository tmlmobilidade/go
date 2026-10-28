/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiLineSchema, type HubV1ApiPattern, HubV1ApiRouteSchema, HubV1ApiStopSchema } from '@tmlmobilidade/go-types-hub';

import { type Network } from '../types/network.js';

/* * */

export async function readCachedNetwork(agencyId: string): Promise<Network> {
	// Fall back to the global cache when migrating an agency that has not been published separately yet.
	const agencyStops = await cacheDb.get(`hub:v1:${agencyId}:network:stops`);
	const prefix: 'hub:v1:network' | `hub:v1:${string}:network` = agencyStops === null ? 'hub:v1:network' : `hub:v1:${agencyId}:network`;
	const rawStops = agencyStops ?? await cacheDb.get('hub:v1:network:stops');
	const rawLines = await cacheDb.get(`${prefix}:lines`);
	const rawRoutes = await cacheDb.get(`${prefix}:routes`);
	const lines = HubV1ApiLineSchema.array().parse(rawLines ? JSON.parse(rawLines) : []).filter(line => line.agency_id === agencyId);
	const routes = HubV1ApiRouteSchema.array().parse(rawRoutes ? JSON.parse(rawRoutes) : []).filter(route => route.agency_id === agencyId);
	const lineIds = new Set(lines.map(line => line._id));
	const routeIds = new Set(routes.map(route => route._id));
	const patternIds = new Set(routes.flatMap(route => route.pattern_ids));
	const stops = HubV1ApiStopSchema.array().parse(rawStops ? JSON.parse(rawStops) : [])
		.filter(stop => stop.agency_ids.includes(agencyId))
		.map(stop => ({
			...stop,
			agency_ids: [agencyId],
			flags: stop.flags.filter(flag => flag.agency_id === agencyId),
			line_ids: stop.line_ids.filter(id => lineIds.has(id)),
			pattern_ids: stop.pattern_ids.filter(id => patternIds.has(id)),
			route_ids: stop.route_ids.filter(id => routeIds.has(id)),
		}));
	const patterns: HubV1ApiPattern[][] = [];

	for (const patternId of patternIds) {
		const cached = await cacheDb.getNew<HubV1ApiPattern[]>(`${prefix}:patterns:${patternId}`);
		if (cached?.data.length) patterns.push(cached.data.filter(pattern => pattern.agency_id === agencyId));
	}

	return { lines, patterns, routes, stops };
}
