/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

/* * */

interface JsonWriterOptions {
	add_after?: string
	add_before?: string
	batch_size?: number
}

/* * */

export class JsonWriter<T> {
	//

	private readonly ADD_AFTER: null | string = null;

	private readonly ADD_BEFORE: null | string = null;

	private CURRENT_BATCH_DATA: T[] = [];

	private FILE_PATH = null;

	private INSTANCE_NAME = 'Unnamed Instance';

	private MAX_BATCH_SIZE = 5000;

	private SESSION_TIMER = new Timer();

	/* * */

	constructor(instanceName: string, filePath: string, options?: JsonWriterOptions) {
		this.INSTANCE_NAME = instanceName;
		this.FILE_PATH = filePath;
		if (options?.add_after) this.ADD_AFTER = options.add_after;
		if (options?.add_before) this.ADD_BEFORE = options.add_before;
		if (options?.batch_size) this.MAX_BATCH_SIZE = options.batch_size;
	}

	/* * */

	close() {
		this.flush();
		let writableData = ']';
		if (this.ADD_AFTER) writableData = writableData + this.ADD_AFTER;
		fs.appendFileSync(this.FILE_PATH, writableData);
	}

	/* * */

	flush() {
		//

		if (!this.FILE_PATH) throw new Error('File path is not set. Please provide a valid file path.');

		const flushTimer = new Timer();
		const sssionTimerResult = this.SESSION_TIMER.get();

		if (this.CURRENT_BATCH_DATA.length === 0) return;

		// Setup a variable to keep track if the file exists or not
		const fileAlreadyExists = fs.existsSync(this.FILE_PATH);

		// Use papaparse to produce the CSV string
		let writableData = JSON.stringify(this.CURRENT_BATCH_DATA);

		// Remove the first and last characters if they are brackets
		if (writableData.startsWith('[')) writableData = writableData.slice(1);
		if (writableData.endsWith(']')) writableData = writableData.slice(0, -1);

		// If the file already does not yet exist then this is the first flush,
		// which means we need to add an opening bracket. If the file already exists,
		// we need to add a comma before the data.
		if (!fileAlreadyExists) writableData = '[' + writableData;
		else writableData = ',' + writableData;

		// If the file does not exist add the value for ADD_BEFORE, if it is set.
		if (!fileAlreadyExists && this.ADD_BEFORE) writableData = this.ADD_BEFORE + writableData;

		// Append the csv string to the file
		fs.appendFileSync(this.FILE_PATH, writableData);
		Logger.info(`JSONWRITER [${this.INSTANCE_NAME}]: Flush | Length: ${this.CURRENT_BATCH_DATA.length} | File Path: ${this.FILE_PATH} (session: ${sssionTimerResult}) (flush: ${flushTimer.get()})`);
		this.CURRENT_BATCH_DATA = [];
	}

	/* * */

	write(data: T | T[]) {
		// Check if the batch is full
		if (this.CURRENT_BATCH_DATA.length >= this.MAX_BATCH_SIZE) {
			this.flush();
		}

		// Reset the timer
		if (this.CURRENT_BATCH_DATA.length === 0) {
			this.SESSION_TIMER.reset();
		}

		// Add the data to the batch
		if (Array.isArray(data)) {
			this.CURRENT_BATCH_DATA = [...this.CURRENT_BATCH_DATA, ...data];
		} else {
			this.CURRENT_BATCH_DATA.push(data);
		}

		//
	}

	//
}
