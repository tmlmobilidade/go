/* * */

import { type GtfsStrictV29Agency, GtfsStrictV29CalendarDates, type GtfsStrictV29Stops } from '@tmlmobilidade/go-types-gtfs-strict';
import { type CsvWriter } from '@tmlmobilidade/writers';

/* * */

/**
 * Configuration for GTFS STEPP v1 export
 */
export interface GtfsSteppV1ExportConfig {
	/**
	 * The agency IDs to export data for
	 */
	agency_id: string

	/**
	 * CSV writers for each GTFS file
	 */
	writers: GtfsSteppV1Writers
}

/**
 * CSV writers for each GTFS file
 */
export interface GtfsSteppV1Writers {
	agency: CsvWriter<GtfsStrictV29Agency>
	calendar_dates: CsvWriter<GtfsStrictV29CalendarDates>
	stops: CsvWriter<GtfsStrictV29Stops>
}
