/* * */

import { performanceSqlPath } from '@/lib/sql-path.js';
import { buildStopSequenceLookup, patternStopKey } from '@/process/build-stop-sequence-lookup.js';
import { queryEachStatementFromFile, queryFromFile, validationsByStopBySequence } from '@tmlmobilidade/databases';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

interface ValidationByStopRow {
	pattern_id: string
	stop_id: string
	trip_id: string
	validations: number
}

/* * */

export const syncValidationsByStopBySequence = async () => {
	Logger.title('Sync Validations by Stop by Sequence');
	const globalTimer = new Timer();

	const METRIC = 'validations_by_stop_by_sequence';

	const clickhouseClient = await validationsByStopBySequence.getClient();
	const tableName = await validationsByStopBySequence.getTableName();

	//
	// 1. Bootstrap table schema

	Logger.info({ message: 'Running validations_by_stop_by_sequence.sql DDL' });
	await queryEachStatementFromFile(clickhouseClient, performanceSqlPath('demand/validations_by_stop_by_sequence.sql'));

	//
	// 2. Fetch validations aggregated by stop from ClickHouse

	const fetchTimer = new Timer();
	Logger.info({ message: 'Fetching validations by stop from ClickHouse...' });
	const validationsByStop = await queryFromFile<ValidationByStopRow>(
		clickhouseClient,
		performanceSqlPath('demand/select-validations-by-stop.sql'),
	);
	Logger.info({ message: `Fetched ${validationsByStop.length} validation rows (${fetchTimer.get()})` });

	//
	// 3. Load stop_sequence lookup from MongoDB hashed_trips

	const patternIds = [...new Set(validationsByStop.map(row => row.pattern_id))];
	const stopSequenceLookup = await buildStopSequenceLookup(patternIds);

	//
	// 4. Join and insert enriched rows into ClickHouse

	const writer = new BatchWriter({
		batch_size: 10_000,
		insertFn: async (data) => {
			await validationsByStopBySequence.insert('JSONEachRow', data);
		},
		title: tableName,
	});

	let joinedRows = 0;
	let skippedRows = 0;

	for (const row of validationsByStop) {
		const stopSequence = stopSequenceLookup.get(patternStopKey(row.pattern_id, row.stop_id));

		if (stopSequence === undefined) {
			skippedRows++;
			continue;
		}

		joinedRows++;
		await writer.write({
			pattern_id: row.pattern_id,
			stop_id: row.stop_id,
			stop_sequence: stopSequence,
			trip_id: row.trip_id,
			validations: row.validations,
		});
	}

	await writer.flush();

	if (skippedRows > 0) {
		Logger.info({ message: `Skipped ${skippedRows} rows without stop_sequence in hashed_trips` });
	}

	logMetricToFile({
		approach: {
			description: 'ClickHouse validations + MongoDB hashed_trips join by pattern_id and stop_id',
			key: 'clickhouse_mongo_join',
		},
		metric: METRIC,
		queryCount: 2,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Inserted ${joinedRows} validations by stop by sequence rows (${globalTimer.get()})`);
};
