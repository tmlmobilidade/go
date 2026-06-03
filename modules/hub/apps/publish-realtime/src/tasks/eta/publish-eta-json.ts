/* * */

import { apiCache, GOClickHouseClient } from '@tmlmobilidade/databases';
import { pipelinePath, querySqlFromFile } from '@tmlmobilidade/go-hub-pckg-sql';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishEtaJson() {
	//

	Logger.title('Publishing Estimated Time of Arrivals JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve ETA from the database

	const clickhouseClient = await GOClickHouseClient.getClient();
	const allEtas = await querySqlFromFile(clickhouseClient, pipelinePath('select-arrivals.sql'));

	Logger.info(`Retrieved ${allEtas.length} ETA...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:eta:json', JSON.stringify(allEtas));

	Logger.success(`Finished publishing Estimated Time of Arrivals (${globalTimer.get()})`);

	//
};
