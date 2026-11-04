import { ClickHouseDatabaseClient, splitClickHouseStatements } from '@tmlmobilidade/go-clients-clickhouse';
import { readFile } from 'node:fs/promises';

try {
	const client = await ClickHouseDatabaseClient.getClient({ prefix: 'LABDB', tunnelType: 'GO' });
	const source = await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8');
	for (const query of splitClickHouseStatements(source)) await client.command({ query });
	console.info('Initialized temp_performance tables and snapshot view.');
} finally {
	await ClickHouseDatabaseClient.disconnectAll();
}
