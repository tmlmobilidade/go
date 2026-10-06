/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { type TripStopEta } from '../types.js';

/* * */

/**
 * Fetches all simplified trip-stop ETAs from ClickHouse (`select-eta.sql`).
 *
 * Used by {@link cacheAllEtasFromClickHouse} to rebuild `hub:v1:{organizationId}:eta:all`.
 */
export async function getClickHouseEtas(agencyIds: string[]): Promise<TripStopEta[]> {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving trip stop ETAs from ClickHouse...' });

	const etas = await labDb.queryFromFile<TripStopEta>(sqlPath('hub', 'publish-eta/select-eta.sql'), { agency_ids: agencyIds });

	Logger.info({ message: `Found ${etas.length} trip stop ETAs in ${timer.get()}`, spacesAfter: 1 });

	return etas;

	//
};
