/* * */

import { type CsvWriter } from '@tmlmobilidade/writers';

/* * */

export interface MergedGtfsExportConfig {
	version: string
	workdir: string
	writers: {
		agency: CsvWriter
		calendar_dates: CsvWriter
		dates: CsvWriter
		fare_attributes: CsvWriter
		fare_rules: CsvWriter
		feed_info: CsvWriter
		municipalities: CsvWriter
		periods: CsvWriter
		plans: CsvWriter
		routes: CsvWriter
		shapes: CsvWriter
		stop_times: CsvWriter
		stops: CsvWriter
		trips: CsvWriter
	}
}
