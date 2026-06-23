/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}

/* * */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* * */

function assertClickHouseIdentifier(value: string, label: string) {
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
		throw new Error(`Invalid ClickHouse ${label}: ${value}`);
	}
}

function resolveLimit(value?: string) {
	const parsedValue = Number(value);
	if (!Number.isFinite(parsedValue) || parsedValue <= 0) return DEFAULT_LIMIT;
	return Math.min(Math.floor(parsedValue), MAX_LIMIT);
}

/* * */

export class FeedbackController {
	/**
	 * Retrieve a small preview from the ClickHouse feedback table.
	 */
	static async getPreview(request: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply<FeedbackPreviewResponse>) {
		try {
			const database = process.env.GO_CLICKHOUSE_DATABASE || 'hub';
			const table = process.env.GO_CLICKHOUSE_FEEDBACK_TABLE || 'feedback';
			const limit = resolveLimit(request.query.limit);

			assertClickHouseIdentifier(database, 'database');
			assertClickHouseIdentifier(table, 'table');

			const clickhouseClient = await GOClickHouseClient.getClient();
			const resultSet = await clickhouseClient.query({
				format: 'JSONEachRow',
				query: `SELECT * FROM \`${database}\`.\`${table}\` LIMIT {limit:UInt32}`,
				query_params: { limit },
			});

			const rows = await resultSet.json<Record<string, unknown>>();
			const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));

			reply.send({
				data: {
					columns,
					rows,
					source: {
						database,
						table,
					},
				},
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.error({ error, message: 'Error retrieving feedback preview' });
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve feedback preview');
		}
	}
}
