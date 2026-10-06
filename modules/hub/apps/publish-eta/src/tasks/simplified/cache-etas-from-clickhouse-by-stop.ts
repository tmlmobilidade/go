/* * */

import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { TTL_REALTIME } from '../../config.js';
import { type ClickHouseEtaKeyValue } from '../types.js';

/* * */

/**
 * Rebuilds the per-stop simplified ETA cache from ClickHouse.
 *
 * Runs `select-eta-by-stop.sql`, which returns one pre-aggregated JSON blob
 * of trip-stop ETAs per stop, then writes each to
 * `hub:v1:{organizationId}:eta:by-stop:{stopId}`.
 *
 * Use this for the main ClickHouse-sourced ETA pipeline (full replace).
 * For merging in-memory `TripStopEta[]` from an external feed (e.g. CP), use
 * {@link cacheEtasByStop} instead.
 */
export async function cacheEtasFromClickHouseByStop(organizationId: string, agencyIds: string[]) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs grouped by stop from ClickHouse...' });

	const etasByStop = await labDb.queryFromFile<ClickHouseEtaKeyValue>(sqlPath('hub', 'publish-eta/select-eta-by-stop.sql'), { agency_ids: agencyIds });

	await Promise.all(etasByStop.map(row => cacheDb.set(getOrganizationCacheKey(organizationId, `eta:by-stop:${row.key}`), row.value, TTL_REALTIME)));

	Logger.info({ message: `Cached ${etasByStop.length} stop ETA groups in ${timer.get()}`, spacesAfter: 1 });

	return etasByStop.map(row => row.key);

	//
};
