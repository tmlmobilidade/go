/* * */

import { type ClickHouseClient, type ClickHouseClientConfigOptions, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ClickHouseWriterParams<T> {
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
	 * ClickHouse client configuration options.
	 * @required
	 */
	clientConfig: ClickHouseClientConfigOptions

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
	 * Optional transformation function to convert documents before writing to ClickHouse.
	 * Use this to map MongoDB document fields to ClickHouse column names.
	 */
	transformFn?: (data: T) => Record<string, unknown>
}

export interface ClickHouseWriterWriteOps<T> {
	data: T
}

/* * */

export class ClickHouseWriter<T> {
	//

	private BATCH_SIZE = 10000;
	private BATCH_TIMEOUT_ENABLED = false;
	private BATCH_TIMEOUT_TIMER: NodeJS.Timeout | null = null;
	private BATCH_TIMEOUT_VALUE = -1;

	private CLIENT: ClickHouseClient;

	private DATA_BUCKET_ALWAYS_AVAILABLE: ClickHouseWriterWriteOps<T>[] = [];
	private DATA_BUCKET_FLUSH_OPS: ClickHouseWriterWriteOps<T>[] = [];

	private IDLE_TIMEOUT_ENABLED = false;
	private IDLE_TIMEOUT_TIMER: NodeJS.Timeout | null = null;
	private IDLE_TIMEOUT_VALUE = -1;

	private SESSION_TIMER = new Timer();

	private TABLE: string;
	private TRANSFORM_FN?: (data: T) => Record<string, unknown>;

	/* * */

	constructor(params: ClickHouseWriterParams<T>) {
		// Ensure that the table name is provided
		if (!params.table) throw new Error('CLICKHOUSEWRITER: Table name is required');
		this.TABLE = params.table;
		// Ensure that the client config is provided
		if (!params.clientConfig) throw new Error('CLICKHOUSEWRITER: Client configuration is required');
		this.CLIENT = createClient(params.clientConfig);
		// Setup the optional transformation function
		if (params.transformFn) {
			this.TRANSFORM_FN = params.transformFn;
		}
		// Setup the optional idle timeout functionality
		if (params.idle_timeout && params.idle_timeout > 0) {
			this.IDLE_TIMEOUT_ENABLED = true;
			this.IDLE_TIMEOUT_VALUE = params.idle_timeout;
		}
		// Override the default batch size
		if (params.batch_size && params.batch_size > 0) {
			this.BATCH_SIZE = params.batch_size;
		}
		// Setup the optional batch timeout functionality
		if (params.batch_timeout && params.batch_timeout > 0) {
			this.BATCH_TIMEOUT_ENABLED = true;
			this.BATCH_TIMEOUT_VALUE = params.batch_timeout;
		}
	}

	/* * */

	async close() {
		await this.CLIENT.close();
		Logger.info(`CLICKHOUSEWRITER [${this.TABLE}]: Connection closed.`);
	}

	/* * */

	async flush(callback?: (data?: ClickHouseWriterWriteOps<T>[]) => Promise<void>) {
		try {
			//

			const flushTimer = new Timer();
			const sessionTimerResult = this.SESSION_TIMER.get();

			//
			// Invalidate all timers since a flush operation is being performed

			if (this.IDLE_TIMEOUT_TIMER) {
				clearTimeout(this.IDLE_TIMEOUT_TIMER);
				this.IDLE_TIMEOUT_TIMER = null;
			}

			if (this.BATCH_TIMEOUT_TIMER) {
				clearTimeout(this.BATCH_TIMEOUT_TIMER);
				this.BATCH_TIMEOUT_TIMER = null;
			}

			//
			// Skip if there is no data to flush

			if (this.DATA_BUCKET_ALWAYS_AVAILABLE.length === 0) return;

			//
			// Copy everything in DATA_BUCKET_ALWAYS_AVAILABLE to DATA_BUCKET_FLUSH_OPS
			// to prevent any new incoming data to be added to the batch. This is to ensure
			// that the batch is not modified while it is being processed.

			this.DATA_BUCKET_FLUSH_OPS = [...this.DATA_BUCKET_FLUSH_OPS, ...this.DATA_BUCKET_ALWAYS_AVAILABLE];

			this.DATA_BUCKET_ALWAYS_AVAILABLE = [];

			//
			// Process the data for ClickHouse insert

			try {
				// Transform data if a transformation function is provided
				const insertData = this.DATA_BUCKET_FLUSH_OPS.map((item) => {
					if (this.TRANSFORM_FN) {
						return this.TRANSFORM_FN(item.data);
					}
					return item.data as Record<string, unknown>;
				});

				// Insert data using ClickHouse client
				await this.CLIENT.insert({
					format: 'JSONEachRow',
					table: this.TABLE,
					values: insertData,
				});

				Logger.info(`CLICKHOUSEWRITER [${this.TABLE}]: Flush | Length: ${this.DATA_BUCKET_FLUSH_OPS.length} (session: ${sessionTimerResult}) (flush: ${flushTimer.get()})`);

				//
				// Call the flush callback, if provided

				if (callback) {
					await callback(this.DATA_BUCKET_FLUSH_OPS);
				}

				//
				// Reset the flush bucket

				this.DATA_BUCKET_FLUSH_OPS = [];

				//
			}
			catch (error) {
				Logger.error(`CLICKHOUSEWRITER [${this.TABLE}]: Error @ flush().insert(): ${(error as Error).message}`);
				throw error; // Re-throw to allow retry logic at higher level
			}

			//
		}
		catch (error) {
			Logger.error(`CLICKHOUSEWRITER [${this.TABLE}]: Error @ flush(): ${(error as Error).message}`);
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

	async write(data: T | T[], writeCallback?: () => Promise<void>, flushCallback?: (data?: ClickHouseWriterWriteOps<T>[]) => Promise<void>) {
		//

		//
		// Invalidate the previously set idle timeout timer
		// since we are performing a write operation again.

		if (this.IDLE_TIMEOUT_TIMER) {
			clearTimeout(this.IDLE_TIMEOUT_TIMER);
			this.IDLE_TIMEOUT_TIMER = null;
		}

		//
		// Check if the batch is full

		if (this.DATA_BUCKET_ALWAYS_AVAILABLE.length >= this.BATCH_SIZE) {
			Logger.info(`CLICKHOUSEWRITER [${this.TABLE}]: Batch full. Flushing data...`);
			await this.flush(flushCallback);
		}

		//
		// Reset the session timer (for logging purposes)

		if (this.DATA_BUCKET_ALWAYS_AVAILABLE.length === 0) {
			this.SESSION_TIMER.reset();
		}

		//
		// Add the current data to the batch

		if (Array.isArray(data)) {
			const combinedDataWithOptions = data.map(item => ({ data: item }));
			this.DATA_BUCKET_ALWAYS_AVAILABLE = [...this.DATA_BUCKET_ALWAYS_AVAILABLE, ...combinedDataWithOptions];
		}
		else {
			this.DATA_BUCKET_ALWAYS_AVAILABLE.push({ data: data });
		}

		//
		// Call the write callback, if provided

		if (writeCallback) {
			await writeCallback();
		}

		//
		// Setup the idle timeout timer to flush the data if too long has passed
		// since the last write operation. Check if this functionality is enabled.

		if (this.IDLE_TIMEOUT_ENABLED && !this.IDLE_TIMEOUT_TIMER) {
			this.IDLE_TIMEOUT_TIMER = setTimeout(async () => {
				Logger.info(`CLICKHOUSEWRITER [${this.TABLE}]: Idle timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.IDLE_TIMEOUT_VALUE);
		}

		//
		// Setup the batch timeout timer to flush the data, if the timeout value is reached,
		// even if the batch is not full. Check if this functionality is enabled.

		if (this.BATCH_TIMEOUT_ENABLED && !this.BATCH_TIMEOUT_TIMER) {
			this.BATCH_TIMEOUT_TIMER = setTimeout(async () => {
				Logger.info(`CLICKHOUSEWRITER [${this.TABLE}]: Batch timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.BATCH_TIMEOUT_VALUE);
		}

		//
	}

	//
}
