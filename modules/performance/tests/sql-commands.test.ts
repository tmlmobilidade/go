import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

const commands: string[] = [];
mock.module('@tmlmobilidade/go-interfaces-labdb', {
	namedExports: { labDb: { command: async ({ query }: { query: string }) => { commands.push(query); } } },
});
const { executeSql } = await import('../packages/scripts/src/storage.js');
const params = { end_date: 20261031, exclude_months: [], partition: 202610, stage: 'hub_demand_test', start_date: 20261001 };
const files = ['create-stage', 'by-agency-by-operational-date', 'replace-partition', 'clear-partition', 'drop-stage'];

async function demandCommands() {
	commands.length = 0;
	for (const file of files) await executeSql(`demand/${file}.sql`, params);
	return [...commands];
}

test('demand DDL binds staging identifiers before reaching ClickHouse, retaining value parameters', async () => {
	const queries = await demandCommands();
	assert.equal(queries.length, files.length);
	for (const query of queries) assert.doesNotMatch(query, /\{stage:Identifier\}/);
	assert.match(queries[2], /FROM temp_performance\.`hub_demand_test`/);
	assert.match(queries[2], /\{partition:UInt32\}/);
});

test('missing or unsafe SQL identifiers fail before submitting a command', async () => {
	for (const stage of ['', 'stage`; DROP TABLE x', 'stage.name', 123]) {
		commands.length = 0;
		await assert.rejects(() => executeSql('demand/replace-partition.sql', { stage }), /Invalid SQL identifier: stage/);
		assert.equal(commands.length, 0);
	}
	await assert.rejects(() => executeSql('demand/replace-partition.sql'), /Invalid SQL identifier: stage/);
});

test('ClickHouse parses every demand command without executing it', { skip: !process.env.PERFORMANCE_VERIFY_SQL }, async () => {
	const { ClickHouseDatabaseClient } = await import('@tmlmobilidade/go-clients-clickhouse');
	try {
		const client = await ClickHouseDatabaseClient.getClient({ prefix: 'LABDB', tunnelType: 'GO' });
		for (const query of await demandCommands()) {
			const result = await client.query({ query: `EXPLAIN AST ${query}`, query_params: params, format: 'JSONEachRow' });
			assert.ok((await result.text()).length);
		}
	} finally {
		await ClickHouseDatabaseClient.disconnectAll();
	}
});
