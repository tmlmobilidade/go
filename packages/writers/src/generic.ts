/* eslint-disable perfectionist/sort-classes */
/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface BatchWriterParams<T> {

	/**
	 * The maximum number of items to hold in memory
	 * before flushing to the database.
	 * @required
	 */
	batch_size: number

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
	 * The insert function to use for inserting data into the batch.
	 * @required
	 */
	insertFn: (data: T[]) => Promise<void>

	/**
	 * Maximum number of retries for transient insert errors.
	 * @default 3
	 */
	max_retries?: number

	/**
	 * Base delay in milliseconds for exponential backoff.
	 * @default 1000
	 */
	retry_base_delay_ms?: number

	/**
	 * The title of this BatchWriter instance,
	 * used to identify the source of the logs.
	 * @required
	 */
	title: string

}

/* * */

export class BatchWriter<T> {
	//

	private params: BatchWriterParams<T>;

	private dataBucketAlwaysAvailable: T[] = [];
	private dataBucketFlushOps: T[] = [];

	private batchTimeoutTimer: NodeJS.Timeout | null = null;
	private idleTimeoutTimer: NodeJS.Timeout | null = null;
	private sessionTimer = new Timer();

	constructor(params: BatchWriterParams<T>) {
		if (!params.title) throw new Error('BATCHWRITER: Title is required.');
		if (!params.insertFn) throw new Error('BATCHWRITER: Insert function is required.');
		if (!params.batch_size) throw new Error('BATCHWRITER: Batch size is required.');
		this.params = params;
	}

	/**
	 * Flushes the current batch of data.
	 * This method is called internally when the batch size or timeouts are reached,
	 * but can also be called manually if needed.
	 * @param callback Optional callback to execute after the flush is complete, receiving the flushed data as a parameter
	 */
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
			// Process the data for batch insert

			try {
				// Call the insert function provided in the params to perform the actual database insertion.
				if (!this.params.insertFn) throw new Error('BATCHWRITER: No insert function provided in params');
				await this.insertWithRetry(this.dataBucketFlushOps);
				Logger.info(`BATCHWRITER [${this.params.title}]: Flush | Length: ${this.dataBucketFlushOps.length} (session: ${sessionTimerResult}) (flush: ${flushTimer.get()})`);
				// Call the flush callback, if provided
				if (callback) await callback(this.dataBucketFlushOps);
				// Reset the flush bucket
				this.dataBucketFlushOps = [];
			} catch (error) {
				Logger.error(`BATCHWRITER [${this.params.title}]: Error @ flush().insert(): ${(error as Error).message}`);
				throw error; // Re-throw to allow retry logic at higher level
			}

			//
		} catch (error) {
			Logger.error(`BATCHWRITER [${this.params.title}]: Error @ flush(): ${(error as Error).message}`);
			throw error; // Re-throw to allow retry logic at higher level
		}
	}

	/**
	 * Helper method to perform insert operations with retry logic for transient errors.
	 * This method will attempt to insert the data using the provided insert function,
	 * and if an error occurs, it will retry the operation with exponential backoff
	 * until the maximum number of retries is reached.
	 * @param data The data to insert.
	 * @returns A promise that resolves when the insert operation is successful, or rejects if all retries fail.
	 */
	private async insertWithRetry(data: T[]) {
		const maxRetries = this.params.max_retries ?? 3;
		const retryBaseDelayMs = this.params.retry_base_delay_ms ?? 1000;
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				await this.params.insertFn(data);
				return;
			} catch (error) {
				const parsedError = error as Error & { code?: string };
				const nextAttempt = attempt + 1;
				const delayMs = retryBaseDelayMs * (2 ** attempt);
				Logger.error(`BATCHWRITER [${this.params.title}]: Transient insert error (${parsedError.code ?? 'unknown'}). Retrying ${nextAttempt}/${maxRetries} in ${delayMs}ms. ${parsedError.message}`);
				await new Promise(resolve => setTimeout(resolve, delayMs));
			}
		}
	}

	/**
	 * Write data to the batch.
	 * @param data The data to write.
	 * @param options Options for the write operation (reserved for future use).
	 * @param writeCallback Callback function to call after the write operation is complete.
	 * @param flushCallback Callback function to call after the flush operation is complete.
	 */
	async write(data: T | T[], { flushCallback, writeCallback }: { flushCallback?: (data?: T[]) => Promise<void>, writeCallback?: () => Promise<void> } = {}) {
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
			Logger.info(`BATCHWRITER [${this.params.title}]: Batch full. Flushing data...`);
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
				Logger.info(`BATCHWRITER [${this.params.title}]: Idle timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.idle_timeout);
		}

		//
		// Setup the batch timeout timer to flush the data, if the timeout value is reached,
		// even if the batch is not full. Check if this functionality is enabled.

		if (this.params.batch_timeout && this.params.batch_timeout > 0 && !this.batchTimeoutTimer) {
			this.batchTimeoutTimer = setTimeout(async () => {
				Logger.info(`BATCHWRITER [${this.params.title}]: Batch timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.params.batch_timeout);
		}

		//
	}

	//
}
