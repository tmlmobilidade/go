import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { TTL_REALTIME } from '../../config.js';
import { EXTERNAL_FEEDS } from '../external-feeds.js';
import { getClickHouseEtas } from './get-clickhouse-etas.js';
import { getExternalEtas } from './get-external-etas.js';
import { groupEtasByStop, groupEtasByTrip } from './trip-updates-to-etas.js';

export async function publishEtas(organizationId: string, agencyIds: string[]) {
	let etas = await getClickHouseEtas(agencyIds);

	for (const feed of EXTERNAL_FEEDS.filter(feed => agencyIds.includes(feed.agencyId))) {
		const externalEtas = await getExternalEtas(organizationId, feed);
		const externalTripIds = new Set(externalEtas.map(eta => eta.trip_id));
		etas = [...etas.filter(eta => !externalTripIds.has(eta.trip_id)), ...externalEtas];
	}

	const currentKeys = new Set<string>();
	for (const [resource, grouped] of [['by-trip', groupEtasByTrip(etas)], ['by-stop', groupEtasByStop(etas)]] as const) {
		for (const [id, rows] of grouped) {
			const key = getOrganizationCacheKey(organizationId, `eta:${resource}:${id}`);
			const sorted = [...rows].sort((a, b) => a.stop_sequence - b.stop_sequence);
			await cacheDb.set(key, JSON.stringify(sorted), TTL_REALTIME);
			currentKeys.add(key);
		}
	}
	await cacheDb.set(getOrganizationCacheKey(organizationId, 'eta:all'), JSON.stringify(etas), TTL_REALTIME);

	for (const resource of ['by-trip', 'by-stop']) {
		const staleKeys = (await cacheDb.scan(getOrganizationCacheKey(organizationId, `eta:${resource}:*`))).filter(key => !currentKeys.has(key));
		if (staleKeys.length) await cacheDb.deleteMany(staleKeys);
	}

	Logger.success(`Published ${etas.length} ETAs for organization ${organizationId}.`);
}
