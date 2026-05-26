import type { EtaRideRow } from '@/lib/eta-ride-row.js';
import type { ClickHouseClient } from '@clickhouse/client';

import { Logger } from '@tmlmobilidade/logger';

export async function insertEtaRides(
	clickhouseClient: ClickHouseClient,
	table: string,
	ridesMapped: EtaRideRow[],
	logLabel: string,
) {
	Logger.progress(`Inserting ${ridesMapped.length} ${logLabel} into clickhouse`, 1);
	await clickhouseClient.insert({
		format: 'JSONEachRow',
		table,
		values: ridesMapped,
	});
}
