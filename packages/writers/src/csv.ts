/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

interface CsvWriterOptions {
	batch_size?: number
	include_bom?: boolean
	new_line_character?: string
}

/* * */

export default class CsvWriter {
	//

	private CURRENT_BATCH_DATA = [];

	private FILE_PATH = null;

	private INCLUDE_BOM = false;

	private INSTANCE_NAME = 'Unnamed Instance';

	private MAX_BATCH_SIZE = 5000;

	private NEW_LINE_CHARACTER = '\n';

	private SESSION_TIMER = new Timer();

	/* * */

	constructor(instanceName: string, filePath: string, options?: CsvWriterOptions) {
		this.INSTANCE_NAME = instanceName;
		this.FILE_PATH = filePath;
		if (options?.batch_size) this.MAX_BATCH_SIZE = options.batch_size;
		if (options?.new_line_character) this.NEW_LINE_CHARACTER = options.new_line_character;
		if (options?.include_bom) this.INCLUDE_BOM = options.include_bom;
	}

	/* * */

	async flush() {
		return new Promise<void>((resolve, reject) => {
			try {
				//

				if (!this.FILE_PATH) {
					return resolve();
				}

				const flushTimer = new Timer();
				const sssionTimerResult = this.SESSION_TIMER.get();

				if (this.CURRENT_BATCH_DATA.length === 0) return resolve();

				// Setup a variable to keep track if the file exists or not
				let fileAlreadyExists = true;

				// Try to access the file and append data to it
				fs.access(this.FILE_PATH, fs.constants.F_OK, async (error) => {
					//
					// If an error is thrown, then the file does not exist
					if (error) {
						fileAlreadyExists = false;
					}

					// Use papaparse to produce the CSV string
					let csvData = Papa.unparse(this.CURRENT_BATCH_DATA, { header: !fileAlreadyExists, newline: this.NEW_LINE_CHARACTER, skipEmptyLines: 'greedy' });

					// Prepend BOM if this is the first write and BOM is enabled
					if (!fileAlreadyExists && this.INCLUDE_BOM) {
						csvData = '\uFEFF' + csvData;
					}

					// Prepend a new line character to csvData string if it is not the first line on the file
					if (fileAlreadyExists) {
						csvData = this.NEW_LINE_CHARACTER + csvData;
					}

					// Append the csv string to the file
					fs.appendFile(this.FILE_PATH, csvData, (appendErr) => {
						if (appendErr) {
							reject(new Error(`Error appending data to file: ${appendErr.message}`));
						}
						else {
							Logger.info(`CSVWRITER [${this.INSTANCE_NAME}]: Flush | Length: ${this.CURRENT_BATCH_DATA.length} | File Path: ${this.FILE_PATH} (session: ${sssionTimerResult}) (flush: ${flushTimer.get()})`);
							this.CURRENT_BATCH_DATA = [];
							resolve();
						}
					});

					//
				});

				//
			}
			catch (error) {
				reject(new Error(`Error at flush(): ${error.message}`));
			}
		});
	}

	/* * */

	async write(data) {
		// Check if the batch is full
		if (this.CURRENT_BATCH_DATA.length >= this.MAX_BATCH_SIZE) {
			await this.flush();
		}

		// Reset the timer
		if (this.CURRENT_BATCH_DATA.length === 0) {
			this.SESSION_TIMER.reset();
		}

		// Add the data to the batch
		if (Array.isArray(data)) {
			this.CURRENT_BATCH_DATA = [...this.CURRENT_BATCH_DATA, ...data];
		}
		else {
			this.CURRENT_BATCH_DATA.push(data);
		}

		//
	}

	//
}
