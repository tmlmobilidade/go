/* * */

import { type GtfsStrictV30SteppAgency, type GtfsStrictV30SteppCalendar, type GtfsStrictV30SteppCalendarDates, GtfsStrictV30SteppShapes, type GtfsStrictV30SteppStops } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';
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
	 * The last date to include in calendar.txt and calendar_dates.txt, inclusive
	 */
	end_date: OperationalDate

	/**
	 * The first date to include in calendar.txt and calendar_dates.txt, inclusive
	 */
	start_date: OperationalDate

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
	calendar: CsvWriter<GtfsStrictV30SteppCalendar>
	calendar_dates: CsvWriter<GtfsStrictV30SteppCalendarDates>
	shapes: CsvWriter<GtfsStrictV30SteppShapes>
	stops: CsvWriter<GtfsStrictV30SteppStops>
}
