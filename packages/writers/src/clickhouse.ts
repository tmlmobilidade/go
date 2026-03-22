/* eslint-disable perfectionist/sort-classes */
/* * */

import { type ClickHouseColumn, ClickhouseService } from '@tmlmobilidade/clickhouse';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ClickHouseWriterParams<T> {
	/**
	 * The maximum number of items to hold in memory
	 * before flushing to the database.
	 * @default 10_000
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
	 * The ClickHouse table name to write to.
	 * @required
	 */
	databaseName: string

	/**
	 * If enabled, starts an async one-time table ensure operation in the constructor.
	 * Use `await writer.init()` if you need to block startup until it is completed.
	 * @default false
	 */
	ensure_table_on_init?: boolean

	/**
	 * How long to wait, in milliseconds, after the last write operation
	 * before flushing the data to the database. This can be used to prevent
	 * items staying in memory for too long if the batch size is not reached
	 * frequently enough. Disabled by default.
	 * @default disabled
	 */
	idle_timeout?: number

	/**
	 * An instance of ClickHouseService to use for database operations.
	 * @required
	 */
	service: ClickhouseService

	/**
	 * The ClickHouse table name to write to.
	 * @required
	 */
	tableName: string

	/**
	 * Optional ClickHouse column definitions for auto-creating the table.
	 */
	tableSchema: ClickHouseColumn<T>[]

	/**
	 * Optional transformation function to convert documents before writing to ClickHouse.
	 * Use this to map MongoDB document fields to ClickHouse column names.
	 */
	transformFn?: (data: T) => Record<string, unknown>

}

/* * */

export class ClickHouseWriter<T> {
	//

	//
	private params: ClickHouseWriterParams<T>;
	private service: ClickhouseService;

	//
	private dataBucketAlwaysAvailable: T[] = [];
	private dataBucketFlushOps: T[] = [];

	//
	private batchTimeoutTimer: NodeJS.Timeout | null = null;
	private idleTimeoutTimer: NodeJS.Timeout | null = null;
	private sessionTimer = new Timer();
	private isInitialized = false;

	/* * */

	constructor(params: ClickHouseWriterParams<T>) {
		if (!params.tableName) throw new Error('CLICKHOUSEWRITER: Table name is required');
		if (!params.service) throw new Error('CLICKHOUSEWRITER: ClickHouse service instance is required');
		this.params = params;
		this.service = params.service;
	}

	/**
	 * Initializes the writer by ensuring the table exists.
	 * Safe to call multiple times.
	 */
	async init() {
		if (this.isInitialized) return;
		await this.service.verifyTableExists(this.params.databaseName, this.params.tableName);
		this.isInitialized = true;
	}

	/**
	 * Flushes the current batch of data to ClickHouse.
	 * This method is called internally when the batch size or timeouts are reached,
	 * but can also be called manually if needed.
	 * @param callback Optional callback to execute after the flush is complete, receiving the flushed data as a parameter
	 */
	async flush(callback?: (data?: T[]) => Promise<void>) {
		try {
			await this.init();

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
				await this.service.getClient().then(client => client.insert({
					format: 'JSONEachRow',
					table: this.params.tableName,
					values: insertData,
				}));

				Logger.info(`CLICKHOUSEWRITER [${this.params.tableName}]: Flush | Length: ${this.dataBucketFlushOps.length} (session: ${sessionTimerResult}) (flush: ${flushTimer.get()})`);

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
				Logger.error(`CLICKHOUSEWRITER [${this.params.tableName}]: Error @ flush().insert(): ${(error as Error).message}`);
				throw error; // Re-throw to allow retry logic at higher level
			}

			//
		} catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.params.tableName}]: Error @ flush(): ${(error as Error).message}`);
			throw error; // Re-throw to allow retry logic at higher level
		}
	}

	/**
	 * Write data to the ClickHouse table.
	 * @param data The data to write
	 * @param options Options for the write operation (reserved for future use)
	 * @param writeCallback Callback function to call after the write operation is complete
	 * @param flushCallback Callback function to call after the flush operation is complete
	 */
	async write(data: T | T[], { flushCallback, writeCallback }: { flushCallback?: (data?: T[]) => Promise<void>, writeCallback?: () => Promise<void> } = {}) {
		//
		await this.init();

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
			Logger.info(`CLICKHOUSEWRITER [${this.params.tableName}]: Batch full. Flushing data...`);
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
				Logger.info(`CLICKHOUSEWRITER [${this.params.tableName}]: Idle timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.idle_timeout);
		}

		//
		// Setup the batch timeout timer to flush the data, if the timeout value is reached,
		// even if the batch is not full. Check if this functionality is enabled.

		if (this.params.batch_timeout && this.params.batch_timeout > 0 && !this.batchTimeoutTimer) {
			this.batchTimeoutTimer = setTimeout(async () => {
				Logger.info(`CLICKHOUSEWRITER [${this.params.tableName}]: Batch timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.batch_timeout);
		}

		//
	}

	//
}
