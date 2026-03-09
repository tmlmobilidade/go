/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface MongoDbWriterParams {

	/**
	 * The maximum number of items to hold in memory
	 * before flushing to the database.
	 * @default 3000
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
	 * The MongoDB collection to write to.
	 * @required
	 */
	collection: any

	/**
	 * How long to wait, in milliseconds, after the last write operation
	 * before flushing the data to the database. This can be used to prevent
	 * items staying in memory for too long if the batch size is not reached
	 * frequently enough. Disabled by default.
	 * @default disabled
	 */
	idle_timeout?: number

}

export interface MongoDbWriterWriteOptions {
	filter?: object
	upsert?: boolean
	write_mode?: 'replace' | 'update'
}

export interface MongoDBWriterWriteOps<T> {
	data: T
	options: MongoDbWriterWriteOptions
}

/* * */

export class MongoDbWriter<T> {
	//

	private BATCH_SIZE = 3000;
	private BATCH_TIMEOUT_ENABLED = false;
	private BATCH_TIMEOUT_TIMER: NodeJS.Timeout | null = null;
	private BATCH_TIMEOUT_VALUE = -1;

	private DATA_BUCKET_ALWAYS_AVAILABLE: MongoDBWriterWriteOps<T>[] = [];
	private DATA_BUCKET_FLUSH_OPS: MongoDBWriterWriteOps<T>[] = [];

	private DB_COLLECTION: any | null = null;

	private IDLE_TIMEOUT_ENABLED = false;
	private IDLE_TIMEOUT_TIMER: NodeJS.Timeout | null = null;
	private IDLE_TIMEOUT_VALUE = -1;

	private SESSION_TIMER = new Timer();

	/* * */

	constructor(params: MongoDbWriterParams) {
		// Ensure that the MongoDB Collection is provided
		if (!params.collection) throw new Error('MONGODBWRITER: Collection is required');
		this.DB_COLLECTION = params.collection;
		// Setup the optional idle timeout functionality
		if (params.idle_timeout > 0) {
			this.IDLE_TIMEOUT_ENABLED = true;
			this.IDLE_TIMEOUT_VALUE = params.idle_timeout;
		}
		// Override the default batch size
		if (params.batch_size > 0) {
			this.BATCH_SIZE = params.batch_size;
		}
		// Setup the optional batch timeout functionality
		if (params.batch_timeout > 0) {
			this.BATCH_TIMEOUT_ENABLED = true;
			this.BATCH_TIMEOUT_VALUE = params.batch_timeout;
		}
	}

	async flush(callback?: (data?: MongoDBWriterWriteOps<T>[]) => Promise<void>) {
		try {
			//

			const flushTimer = new Timer();
			const sssionTimerResult = this.SESSION_TIMER.get();

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
			// Copy everything in data DATA_BUCKET_ALWAYS_AVAILABLE to DATA_BUCKET_FLUSH_OPS
			// to prevent any new incoming data to be added to the batch. This is to ensure
			// that the batch is not modified while it is being processed.

			this.DATA_BUCKET_FLUSH_OPS = [...this.DATA_BUCKET_FLUSH_OPS, ...this.DATA_BUCKET_ALWAYS_AVAILABLE];

			this.DATA_BUCKET_ALWAYS_AVAILABLE = [];

			//
			// Process the data into MongoDB insert/update operations

			try {
				const writeOperations = this.DATA_BUCKET_FLUSH_OPS.map((item) => {
					switch (item.options?.write_mode) {
						case 'update':
							return {
								updateOne: {
									filter: item.options.filter,
									update: item.data,
									upsert: true,
								},
							};
						case 'replace':
						default:
							return {
								replaceOne: {
									filter: item.options.filter,
									replacement: item.data,
									upsert: item.options?.upsert ? true : false,
								},
							};
					}
				});

				await this.DB_COLLECTION.bulkWrite(writeOperations);

				Logger.info(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Flush | Length: ${this.DATA_BUCKET_FLUSH_OPS.length} (session: ${sssionTimerResult}) (flush: ${flushTimer.get()})`);

				//
				// Call the flush callback, if provided

				if (callback) {
					await callback(this.DATA_BUCKET_FLUSH_OPS);
				}

				//
				// Reset the flush bucket

				this.DATA_BUCKET_FLUSH_OPS = [];

				//
			} catch (error) {
				Logger.error(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Error @ flush().writeOperations(): ${error.message}`);
			}

			//
		} catch (error) {
			Logger.error(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Error @ flush(): ${error.message}`);
		}
	}

	/**
	 * Write data to the MongoDB collection.
	 * @param data The data to write
	 * @param options Options for the write operation
	 * @param writeCallback Callback function to call after the write operation is complete
	 * @param flushCallback Callback function to call after the flush operation is complete
	 */
	async write(data: T, options: MongoDbWriterWriteOptions = {}, writeCallback?: () => Promise<void>, flushCallback?: (data?: MongoDBWriterWriteOps<T>[]) => Promise<void>) {
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
			Logger.info(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Batch full. Flushing data...`);
			await this.flush(flushCallback);
		}

		//
		// Reset the session timer (for logging purposes)

		if (this.DATA_BUCKET_ALWAYS_AVAILABLE.length === 0) {
			this.SESSION_TIMER.reset();
		}

		//
		// Add the current data to the batch

		this.DATA_BUCKET_ALWAYS_AVAILABLE.push({ data: data, options: options });

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
				Logger.info(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Idle timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.IDLE_TIMEOUT_VALUE);
		}

		//
		// Setup the batch timeout timer to flush the data, if the timeout value is reached,
		// even if the batch is not full. Check if this functionality is enabled.

		if (this.BATCH_TIMEOUT_ENABLED && !this.BATCH_TIMEOUT_TIMER) {
			this.BATCH_TIMEOUT_TIMER = setTimeout(async () => {
				Logger.info(`MONGODBWRITER [${this.DB_COLLECTION.collectionName}]: Batch timeout reached. Flushing data...`);
				await this.flush(flushCallback);
			}, this.BATCH_TIMEOUT_VALUE);
		}

		//
	}

	//
}
