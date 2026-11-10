import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { TTL_REALTIME } from '../../config.js';
import { EXTERNAL_FEEDS } from '../external-feeds.js';
import { recordPublication } from '../record-publication.js';
import { getClickHouseEtas } from './get-clickhouse-etas.js';
import { getExternalEtas } from './get-external-etas.js';
import { writeEtaSnapshot } from './write-eta-snapshot.js';

/** Publish one complete agency snapshot, including external feeds, so removed
 * trips disappear from both grouped caches on the next successful cycle. */
export async function publishEtas(agencyId: string): Promise<void> {
	const timer = new Timer();
	const rows = await getClickHouseEtas(agencyId);
	for (const feed of EXTERNAL_FEEDS.filter(feed => feed.agencyId === agencyId)) {
		const external = await getExternalEtas(feed);
		const externalTrips = new Set(external.map(row => row.trip_id));
		for (let i = rows.length - 1; i >= 0; i--) {
			if (externalTrips.has(rows[i].trip_id)) rows.splice(i, 1);
		}
		rows.push(...external);
	}
	await writeEtaSnapshot(cacheDb, agencyId, rows, TTL_REALTIME);
	await recordPublication(agencyId, 'simplified');
	Logger.success(`Finished publishing trip stop ETAs (${timer.get()})`);
}
