/* * */

import { type GtfsStrictV30SteppAgency, type GtfsStrictV30SteppCalendarDates, type GtfsStrictV30SteppStops } from '@tmlmobilidade/go-types-gtfs-strict';
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
	agency: CsvWriter<GtfsStrictV30SteppAgency>
	calendar_dates: CsvWriter<GtfsStrictV30SteppCalendarDates>
	stops: CsvWriter<GtfsStrictV30SteppStops>
}
