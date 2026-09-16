import { AppConfig } from '@/lib/config.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';

const LIST_PARTITIONS_SQL = sqlPath('hub', 'eta/cleanup/6-delete-orphan-hist-node-travel-times.sql');
const TABLE = 'eta.hist_node_travel_times';

interface PartitionRow {
	partition_id: string
	rows: number | string
}

/**
 * Ages `eta.hist_node_travel_times` out of the historical window by dropping
 * whole UTC-day partitions (the table is partitioned by day of `created_at`).
 * A partition drop is instant and creates no mutation, unlike the previous
 * `ALTER TABLE ... DELETE WHERE ride_id NOT IN (...)`.
 */
export async function cleanupHistoricalNodeTravelTimes() {
	Logger.title('6. Cleanup out-of-window historical node travel times');

	const partitions = await labDb.queryFromFile<PartitionRow>(LIST_PARTITIONS_SQL, {
		historical_data_days_back: AppConfig.historicalDataDaysBack,
	});

	let rowsDropped = 0;
	for (const partition of partitions) {
		if (!/^\d{8}$/.test(partition.partition_id)) continue;
		await labDb.command({ query: `ALTER TABLE ${TABLE} DROP PARTITION ${partition.partition_id}` });
		rowsDropped += Number(partition.rows);
	}

	Logger.progress({ message: `Dropped ${partitions.length} partitions (${rowsDropped} rows) from ${TABLE}` });
	return rowsDropped;
}
