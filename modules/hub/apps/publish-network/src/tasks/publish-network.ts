/* * */

import { cacheDb, type CacheDbKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiLineSchema, HubV1ApiPatternSchema, HubV1ApiRouteSchema, HubV1ApiStopSchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type Network } from '../types/network.js';

/* * */

export async function publishNetwork(network: Network, agencyId?: string) {
	const prefix: 'hub:v1:network' | `hub:v1:${string}:network` = agencyId ? `hub:v1:${agencyId}:network` : 'hub:v1:network';
	const compareIds = (a: { _id: string }, b: { _id: string }) => a._id.localeCompare(b._id, undefined, { numeric: true });

	// Validate the complete network before replacing any cached entities.
	const stops = HubV1ApiStopSchema.array().parse(network.stops).sort(compareIds);
	const lines = HubV1ApiLineSchema.array().parse(network.lines).sort(compareIds);
	const routes = HubV1ApiRouteSchema.array().parse(network.routes).sort(compareIds);
	const patterns = network.patterns.map(group => HubV1ApiPatternSchema.array().parse(group));
	const updatedKeys = new Set<string>();

	for (const [kind, entities] of [['stops', stops], ['lines', lines], ['routes', routes]] as const) {
		for (const entity of entities) {
			const key: CacheDbKey = `${prefix}:${kind}:${entity._id}`;
			await cacheDb.setNew(key, entity);
			updatedKeys.add(key);
		}
	}
	for (const group of patterns) {
		if (!group.length) continue;
		const key: CacheDbKey = `${prefix}:patterns:${group[0]._id}`;
		await cacheDb.setNew(key, group);
		updatedKeys.add(key);
	}

	await cacheDb.set(`${prefix}:stops`, JSON.stringify(stops));
	await cacheDb.set(`${prefix}:lines`, JSON.stringify(lines));
	await cacheDb.set(`${prefix}:routes`, JSON.stringify(routes));

	for (const kind of ['stops', 'lines', 'routes', 'patterns']) {
		const keys = await cacheDb.scan(`${prefix}:${kind}:*`);
		await cacheDb.deleteMany(keys.filter(key => !updatedKeys.has(key)));
	}

	Logger.success(`Published ${agencyId ? `agency ${agencyId}` : 'global'} network: ${stops.length} stops, ${lines.length} lines, ${routes.length} routes and ${patterns.length} patterns`);
}
