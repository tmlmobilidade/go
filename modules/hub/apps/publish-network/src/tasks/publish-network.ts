/* * */

import { cacheDb, type CacheDbKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiLineSchema, HubV1ApiPatternSchema, HubV1ApiRouteSchema, HubV1ApiStopSchema } from '@tmlmobilidade/go-types-hub';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
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
	const entries: { key: CacheDbKey, value: unknown }[] = [];

	for (const [kind, entities] of [['stops', stops], ['lines', lines], ['routes', routes]] as const) {
		for (const entity of entities) {
			const key: CacheDbKey = `${prefix}:${kind}:${entity._id}`;
			entries.push({ key, value: entity });
			updatedKeys.add(key);
		}
	}
	for (const group of patterns) {
		if (!group.length) continue;
		const key: CacheDbKey = `${prefix}:patterns:${group[0]._id}`;
		entries.push({ key, value: group });
		updatedKeys.add(key);
	}

	Logger.info({ message: `Publishing ${entries.length} network entries to ${prefix}...` });
	let published = 0;
	await performInChunks(entries, async (chunk) => {
		await Promise.all(chunk.map(({ key, value }) => cacheDb.setNew(key, value)));
		published += chunk.length;
		Logger.info({ message: `Published ${published}/${entries.length} network entries to ${prefix}` });
	}, 100);

	Logger.info({ message: `Publishing network lists to ${prefix}...` });
	await cacheDb.set(`${prefix}:stops`, JSON.stringify(stops));
	await cacheDb.set(`${prefix}:lines`, JSON.stringify(lines));
	await cacheDb.set(`${prefix}:routes`, JSON.stringify(routes));

	for (const kind of ['stops', 'lines', 'routes', 'patterns']) {
		Logger.info({ message: `Removing obsolete ${prefix}:${kind} entries...` });
		const keys = await cacheDb.scan(`${prefix}:${kind}:*`);
		await cacheDb.deleteMany(keys.filter(key => !updatedKeys.has(key)));
	}

	Logger.success(`Published ${agencyId ? `agency ${agencyId}` : 'global'} network: ${stops.length} stops, ${lines.length} lines, ${routes.length} routes and ${patterns.length} patterns`);
}
