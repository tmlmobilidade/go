/* eslint-disable perfectionist/sort-classes */
/* * */

import { type ClickHouseClient, type ClickHouseClientConfigOptions, createClient } from '@clickhouse/client';
import { NodeClickHouseClient } from '@clickhouse/client/dist/client.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

/**
 * Supported ClickHouse data types
 */
export type ClickHouseType
	= | 'Bool'
	  | 'Boolean' | 'Date32' | 'Date' | 'DateTime' | 'Decimal' | 'Float32'
	  | 'Float64' | 'Int8' | 'Int16' | 'Int32' | 'Int64' | 'Int128'
	  | 'Int256' | 'String'
	  | 'UInt8' | 'UInt16'
	  | 'UInt32' | 'UInt64'
	  | 'UInt128' | 'UInt256' | 'UUID' | `Array(${string})`
	  | `DateTime64(${number})`
	  | `Decimal(${number}, ${number})`
	  | `Enum8(${string})`
	  | `Enum16(${string})`
	  | `FixedString(${number})`
	  | `LowCardinality(${string})` | `Map(${string}, ${string})`
	  | `Nullable(${string})`;

export interface ClickHouseColumn<T> {
	/** Alias expression (computed on read) */
	alias?: string

	/** Column codec for compression */
	codec?: string

	/** Comment for the column */
	comment?: string

	/** Default value expression */
	default?: string

	/** Create a secondary index (skipping index) on this column */
	indexed?: boolean

	/** Granularity for the index. Default: 4 */
	indexGranularity?: number

	/** Type of skipping index. Default: 'minmax' */
	indexType?: 'bloom_filter' | 'minmax' | 'ngrambf_v1' | 'set' | 'tokenbf_v1'

	/** Use LowCardinality wrapper for low-cardinality strings */
	lowCardinality?: boolean

	/** Materialized value expression (computed on insert) */
	materialized?: string

	name: Extract<keyof T, string>

	/** Whether the column can be null (wraps type in Nullable) */
	nullable?: boolean

	/** Include this column in the ORDER BY clause (ClickHouse's primary index) */
	primaryKey?: boolean

	/** Order of this column in the primary key (lower = first). Default: 0 */
	primaryKeyOrder?: number

	/** TTL expression for this column */
	ttl?: string

	/** The ClickHouse data type */
	type: ClickHouseType
}

type ClickHouseWriterParams<T> = {
	/**
	 * The maximum number of items to hold in memory
	 * before flushing to the database.
	 * @default 10000
	 */
	batch_size?: number

	/**
	 * How long, in milliseconds, data should be kept in memory before
	 * flushing to the database. If this feature is enabled, a flush will
	 * be triggered even if the batch is not full. Disabled by default.
	 * @default disabled
	 */
	batch_timeout?: number

	/**
	 * How long to wait, in milliseconds, after the last write operation
	 * before flushing the data to the database. This can be used to prevent
	 * items staying in memory for too long if the batch size is not reached
	 * frequently enough. Disabled by default.
	 * @default disabled
	 */
	idle_timeout?: number

	/**
	 * The ClickHouse table name to write to.
	 * @required
	 */
	table: string

	/**
	 * Optional ClickHouse column definitions for auto-creating the table.
	 */
	tableSchema: ClickHouseColumn<T>[]

	/**
	 * Optional transformation function to convert documents before writing to ClickHouse.
	 * Use this to map MongoDB document fields to ClickHouse column names.
	 */
	transformFn?: (data: T) => Record<string, unknown>
} & (
  | { client: NodeClickHouseClient, clientConfig?: never }
  | { client?: never, clientConfig: ClickHouseClientConfigOptions }
);

/* * */

export class ClickHouseWriter<T> {
	//

	//
	private params: ClickHouseWriterParams<T>;
	private client: ClickHouseClient;

	//
	private dataBucketAlwaysAvailable: T[] = [];
	private dataBucketFlushOps: T[] = [];

	//
	private batchTimeoutTimer: NodeJS.Timeout | null = null;
	private idleTimeoutTimer: NodeJS.Timeout | null = null;
	private sessionTimer = new Timer();

	/* * */

	constructor(params: ClickHouseWriterParams<T>) {
		if (!params.table) throw new Error('CLICKHOUSEWRITER: Table name is required');
		if (params.client) {
			this.params = params;
			this.client = params.client as ClickHouseClient;
		} else if (params.clientConfig) {
			const { database, password, url, username } = params.clientConfig;
			if (!database || !password || !url || !username) {
				throw new Error('CLICKHOUSEWRITER: Client configuration is invalid. Ensure database, password, url and username are provided.');
			}
			this.params = params;
			this.client = createClient(params.clientConfig);
		} else {
			throw new Error('CLICKHOUSEWRITER: Either client or clientConfig is required.');
		}
	}

	/* * */

	async close() {
		await this.client.close();
		Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Connection closed.`);
	}

	/* * */

	/**
	 * Ensures the table exists in ClickHouse by creating it if it doesn't exist.
	 * Uses the tableSchema provided in the constructor, or an optional schema parameter.
	 *
	 * @param schema Optional schema to use instead of the constructor-provided tableSchema
	 * @param engine The ClickHouse table engine to use (default: MergeTree)
	 * @param orderBy The ORDER BY clause for the table (default: tuple())
	 */
	async ensureTable(schema?: ClickHouseColumn<T>[], engine = 'MergeTree', orderBy = 'tuple()') {
		const tableSchemaToUse = schema ?? this.params.tableSchema;
		const tableSchema = tableSchemaToUse?.map(column => `${column.name} ${column.type}`).join(', ');

		if (!tableSchema) {
			throw new Error(`CLICKHOUSEWRITER [${this.params.table}]: Cannot ensure table without a schema. Provide tableSchema in constructor or as parameter.`);
		}

		try {
			const createTableQuery = `
				CREATE TABLE IF NOT EXISTS ${this.params.table} (
					${tableSchema}
				) ENGINE = ${engine}
				ORDER BY ${orderBy}
			`;

			await this.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Table ensured.`);
		} catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.params.table}]: Error @ ensureTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/* * */

	/**
	 * Builds a WHERE clause from a filter object.
	 * Supports simple equality, range queries ($gte, $lte, $gt, $lt), and $in queries.
	 *
	 * @param filter Filter object with column names as keys
	 * @returns WHERE clause string (without the WHERE keyword)
	 */
	private buildWhereClause(filter?: Record<string, unknown>): null | string {
		if (!filter || Object.keys(filter).length === 0) {
			return null;
		}

		const conditions: string[] = [];

		for (const [key, value] of Object.entries(filter)) {
			if (value === null || value === undefined) {
				continue;
			}

			// Handle range queries (MongoDB-style operators)
			if (typeof value === 'object' && !Array.isArray(value)) {
				const operators = value as Record<string, unknown>;
				for (const [op, opValue] of Object.entries(operators)) {
					switch (op) {
						case '$gt':
							conditions.push(`${key} > ${this.formatValue(opValue)}`);
							break;
						case '$gte':
							conditions.push(`${key} >= ${this.formatValue(opValue)}`);
							break;
						case '$in':
							if (Array.isArray(opValue)) {
								const values = opValue.map(v => this.formatValue(v)).join(', ');
								conditions.push(`${key} IN (${values})`);
							}
							break;
						case '$lt':
							conditions.push(`${key} < ${this.formatValue(opValue)}`);
							break;
						case '$lte':
							conditions.push(`${key} <= ${this.formatValue(opValue)}`);
							break;
					}
				}
			} else {
				// Simple equality
				conditions.push(`${key} = ${this.formatValue(value)}`);
			}
		}

		return conditions.length > 0 ? conditions.join(' AND ') : null;
	}

	/**
	 * Formats a value for use in a SQL query.
	 */
	private formatValue(value: unknown): string {
		if (typeof value === 'string') {
			return `'${value}'`;
		}
		return String(value);
	}

	/* * */

	/**
	 * Counts the number of documents in the table that match the given filter.
	 * Supports simple equality and range queries ($gte, $lte, $gt, $lt).
	 *
	 * @param filter Optional WHERE clause conditions (e.g., { operational_date: '2024-01-01' } or { received_at: { $gte: 1234567890 } })
	 * @returns The count of matching documents
	 */
	async countDocuments(filter?: Record<string, unknown>): Promise<number> {
		try {
			let query = `SELECT count() as count FROM ${this.params.table}`;

			const whereClause = this.buildWhereClause(filter);
			if (whereClause) {
				query += ` WHERE ${whereClause}`;
			}

			const result = await this.client.query({
				format: 'JSONEachRow',
				query,
			});

			const data = await result.json() as { count: string }[];
			return parseInt(data[0]?.count ?? '0', 10);
		} catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.params.table}]: Error @ countDocuments(): ${(error as Error).message}`);
			throw error;
		}
	}

	/* * */

	/**
	 * Returns distinct values for a given column, optionally filtered.
	 * Supports simple equality and range queries ($gte, $lte, $gt, $lt).
	 *
	 * @param column The column name to get distinct values for
	 * @param filter Optional WHERE clause conditions
	 * @returns Array of distinct values
	 */
	async distinct<K = string>(column: string, filter?: Record<string, unknown>): Promise<K[]> {
		try {
			let query = `SELECT DISTINCT ${column} FROM ${this.params.table}`;

			const whereClause = this.buildWhereClause(filter);
			if (whereClause) {
				query += ` WHERE ${whereClause}`;
			}

			const result = await this.client.query({
				format: 'JSONEachRow',
				query,
			});

			const data = await result.json() as Record<string, K>[];
			return data.map(row => row[column]);
		} catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.params.table}]: Error @ distinct(): ${(error as Error).message}`);
			throw error;
		}
	}

	/* * */

	async flush(callback?: (data?: T[]) => Promise<void>) {
		try {
			//

			const flushTimer = new Timer();
			const sessionTimerResult = this.sessionTimer.get();

			//
			// Invalidate all timers since a flush operation is being performed

			if (this.idleTimeoutTimer) {
				clearTimeout(this.idleTimeoutTimer);
				this.idleTimeoutTimer = null;
			}

			if (this.batchTimeoutTimer) {
				clearTimeout(this.batchTimeoutTimer);
				this.batchTimeoutTimer = null;
			}

			//
			// Skip if there is no data to flush

			if (this.dataBucketAlwaysAvailable.length === 0) return;

			//
			// Copy everything in dataBucketAlwaysAvailable to dataBucketFlushOps
			// to prevent any new incoming data to be added to the batch. This is to ensure
			// that the batch is not modified while it is being processed.

			this.dataBucketFlushOps = [...this.dataBucketFlushOps, ...this.dataBucketAlwaysAvailable];

			this.dataBucketAlwaysAvailable = [];

			//
			// Process the data for ClickHouse insert

			try {
				// Transform data if a transformation function is provided
				const insertData = this.dataBucketFlushOps.map((item) => {
					if (this.params.transformFn) {
						return this.params.transformFn(item);
					}
					return item as Record<string, unknown>;
				});

				// Insert data using ClickHouse client
				await this.client.insert({
					format: 'JSONEachRow',
					table: this.params.table,
					values: insertData,
				});

				Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Flush | Length: ${this.dataBucketFlushOps.length} (session: ${sessionTimerResult}) (flush: ${flushTimer.get()})`);

				//
				// Call the flush callback, if provided

				if (callback) {
					await callback(this.dataBucketFlushOps);
				}

				//
				// Reset the flush bucket

				this.dataBucketFlushOps = [];

				//
			} catch (error) {
				Logger.error(`CLICKHOUSEWRITER [${this.params.table}]: Error @ flush().insert(): ${(error as Error).message}`);
				throw error; // Re-throw to allow retry logic at higher level
			}

			//
		} catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.params.table}]: Error @ flush(): ${(error as Error).message}`);
			throw error; // Re-throw to allow retry logic at higher level
		}
	}

	/* * */

	/**
	 * Write data to the ClickHouse table.
	 *
	 * @param data The data to write
	 * @param options Options for the write operation (reserved for future use)
	 * @param writeCallback Callback function to call after the write operation is complete
	 * @param flushCallback Callback function to call after the flush operation is complete
	 */

	async write(data: T | T[], writeCallback?: () => Promise<void>, flushCallback?: (data?: T[]) => Promise<void>) {
		//

		//
		// Invalidate the previously set idle timeout timer
		// since we are performing a write operation again.

		if (this.idleTimeoutTimer) {
			clearTimeout(this.idleTimeoutTimer);
			this.idleTimeoutTimer = null;
		}

		//
		// Check if the batch is full

		const batchSize = this.params.batch_size ?? 10_000;
		if (this.dataBucketAlwaysAvailable.length >= batchSize) {
			Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Batch full. Flushing data...`);
			await this.flush(flushCallback);
		}

		//
		// Reset the session timer (for logging purposes)

		if (this.dataBucketAlwaysAvailable.length === 0) {
			this.sessionTimer.reset();
		}

		//
		// Add the current data to the batch

		if (Array.isArray(data)) {
			const combinedDataWithOptions = data.map(item => item);
			this.dataBucketAlwaysAvailable = [...this.dataBucketAlwaysAvailable, ...combinedDataWithOptions];
		} else {
			this.dataBucketAlwaysAvailable.push(data);
		}

		//
		// Call the write callback, if provided

		if (writeCallback) {
			await writeCallback();
		}

		//
		// Setup the idle timeout timer to flush the data if too long has passed
		// since the last write operation. Check if this functionality is enabled.

		if (this.params.idle_timeout && this.params.idle_timeout > 0 && !this.idleTimeoutTimer) {
			this.idleTimeoutTimer = setTimeout(async () => {
				Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Idle timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.idle_timeout);
		}

		//
		// Setup the batch timeout timer to flush the data, if the timeout value is reached,
		// even if the batch is not full. Check if this functionality is enabled.

		if (this.params.batch_timeout && this.params.batch_timeout > 0 && !this.batchTimeoutTimer) {
			this.batchTimeoutTimer = setTimeout(async () => {
				Logger.info(`CLICKHOUSEWRITER [${this.params.table}]: Batch timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.batch_timeout);
		}

		//
	}

	//
}
