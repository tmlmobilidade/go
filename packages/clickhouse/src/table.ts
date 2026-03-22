/* * */

import { ClickHouseClientService } from '@/service.js';
import { type ClickHouseColumn, type ClickHouseTableEngine } from '@/types.js';
import { isSafeIdentifier } from '@/utils.js';
import { type DataFormat } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';

/* * */

abstract class ClickhouseTable<T> {
	//

	protected client!: ClickHouseClientService;
	protected abstract databaseName: string;
	protected engine: ClickHouseTableEngine = 'ReplicatedMergeTree';

	protected orderBy: string = '_id';
	protected abstract schema: ClickHouseColumn<T>[];
	protected abstract tableName: string;

	/**
	 * Constructs the appropriate engine string based on the provided engine type.
	 * @param engine The ClickHouse table engine type.
	 * @param tableName The name of the table (used for ReplicatedMergeTree).
	 * @returns The engine string to be used in the CREATE TABLE statement.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private static getEngineString(engine: ClickHouseTableEngine, tableName: string): string {
		switch (engine) {
			case 'ReplicatedMergeTree':
				return `ReplicatedMergeTree('/clickhouse/tables/{shard}/${tableName}', '{replica}')`;
			default:
				throw new Error(`CLICKHOUSE [${tableName}]: Unsupported engine type: ${engine}`);
		}
	}

	//
}
