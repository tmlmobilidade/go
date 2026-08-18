/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type MetricRefreshLock } from './run-metric-refresh.js';

/* * */

type ClickHouseQueryParams = Record<string, number | string>;

export function createLockedClickHouseExecutor(lock: MetricRefreshLock) {
	return {
		async assert(query: string, queryParams?: ClickHouseQueryParams) {
			lock.assertOwned();
			const client = await labDb.getClient();
			const result = await client.query({ format: 'JSONEachRow', query, query_params: queryParams });
			await result.json();
			lock.assertOwned();
		},

		async command(query: string, queryParams?: ClickHouseQueryParams) {
			lock.assertOwned();
			const client = await labDb.getClient();
			await client.command({ query, query_params: queryParams });
			lock.assertOwned();
		},

		async query<T>(query: string, queryParams?: ClickHouseQueryParams) {
			lock.assertOwned();
			const client = await labDb.getClient();
			const result = await client.query({ format: 'JSONEachRow', query, query_params: queryParams });
			const rows = await result.json<T>();
			lock.assertOwned();
			return rows;
		},
	};
}

/* * */
