/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

interface CsvWriterOptions {
	batch_size?: number
	include_bom?: boolean
	logs?: boolean
	new_line_character?: string
}

/**
 * @deprecated This class is deprecated and should not be used for new implementations.
 * It is recommended to use the BatchWriter class instead.
 */
export class CsvWriter<T> {
	//

	private CURRENT_BATCH_DATA: T[] = [];
	private FILE_PATH = null;
	private INCLUDE_BOM = false;
	private INSTANCE_NAME = 'Unnamed Instance';
	private LOGS = true;
	private MAX_BATCH_SIZE = 5000;
	private NEW_LINE_CHARACTER = '\n';
	private SESSION_TIMER = new Timer();

	/* * */

	constructor(instanceName: string, filePath: string, options?: CsvWriterOptions) {
		this.INSTANCE_NAME = instanceName;
		this.FILE_PATH = filePath;
		this.LOGS = options?.logs ?? true;
		if (options?.batch_size) this.MAX_BATCH_SIZE = options.batch_size;
		if (options?.new_line_character) this.NEW_LINE_CHARACTER = options.new_line_character;
		if (options?.include_bom) this.INCLUDE_BOM = options.include_bom;
	}

	/* * */

	async flush() {
		try {
			//

			if (!this.FILE_PATH) return;

			const flushTimer = new Timer();
			const sssionTimerResult = this.SESSION_TIMER.get();

			if (this.CURRENT_BATCH_DATA.length === 0) return;

			//
			// Setup a variable to keep track if the file exists or not

			const fileAlreadyExists = fs.existsSync(this.FILE_PATH);

			//
			// Use papaparse to produce the CSV string

			let csvData = Papa.unparse(this.CURRENT_BATCH_DATA, { header: !fileAlreadyExists, newline: this.NEW_LINE_CHARACTER, skipEmptyLines: 'greedy' });

			//
			// Prepend BOM if this is the first write and BOM is enabled

			if (!fileAlreadyExists && this.INCLUDE_BOM) {
				csvData = '\uFEFF' + csvData;
			}

			//
			// Prepend a new line character to csvData string
			// if it is not the first line on the file.

			if (fileAlreadyExists) {
				csvData = this.NEW_LINE_CHARACTER + csvData;
			}

			//
			// Recurseively ensure that the directory
			// for the file path exists.

			const dirPath = this.FILE_PATH.substring(0, this.FILE_PATH.lastIndexOf('/'));

			if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

			//
			// Append the csv string to the file

			fs.appendFileSync(this.FILE_PATH, csvData, { encoding: 'utf-8', flush: true });

			if (this.LOGS) Logger.info({ message: `CSVWRITER [${this.INSTANCE_NAME}]: Flush | Length: ${this.CURRENT_BATCH_DATA.length} | File Path: ${this.FILE_PATH} (session: ${sssionTimerResult}) (flush: ${flushTimer.get()})` });

			this.CURRENT_BATCH_DATA = [];

			//
		} catch (error) {
			throw new Error(`Error at flush(): ${error.message}`);
		}
	}

	/* * */

	async write(data: T | T[]) {
		//

		//
		// Check if the batch is full

		if (this.CURRENT_BATCH_DATA.length >= this.MAX_BATCH_SIZE) await this.flush();

		//
		// Reset the timer

		if (this.CURRENT_BATCH_DATA.length === 0) this.SESSION_TIMER.reset();

		//
		// Add the data to the batch

		if (Array.isArray(data)) this.CURRENT_BATCH_DATA.push(...data);
		else this.CURRENT_BATCH_DATA.push(data);

		//
	}

	//
}
