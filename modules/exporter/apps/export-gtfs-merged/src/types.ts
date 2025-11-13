/* * */

import { type CsvWriter } from '@helperkits/writer';

/* * */

export interface MergedGtfsExportConfig {
	version: string
	workdir: string
	writers: {
		agency: CsvWriter
		calendar_dates: CsvWriter
		feed_info: CsvWriter
		routes: CsvWriter
		shapes: CsvWriter
		stop_times: CsvWriter
		stops: CsvWriter
		trips: CsvWriter
	}
}
