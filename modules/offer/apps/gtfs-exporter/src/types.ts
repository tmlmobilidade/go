/* eslint-disable perfectionist/sort-interfaces */
/* * */

import {
	type GTFS_CalendarDate,
	type GTFS_Shape,
	type GTFS_StopTime,
	type GTFS_Trip,
	GtfsTMLAgency,
	GtfsTMLFareAttributes,
	GtfsTMLFareRules,
	GtfsTMLFeedInfo,
	GtfsTMLRoute,
	GtfsTMLStop,
	GtfsTMLTrip,
	OperationalDate,
} from '@tmlmobilidade/types';
import { type CsvWriter } from '@tmlmobilidade/writers';

/* * */

/**
 * Configuration for GTFS v29 export
 */
export interface GtfsV29ExportConfig {
	/**
	 * The agency IDs to export data for
	 */
	agency_ids: string[]

	/**
	 * Start date used to clip calendars — trips outside this range are excluded
	 */
	calendars_clip_start_date: OperationalDate

	/**
	 * End date used to clip calendars — trips outside this range are excluded
	 */
	calendars_clip_end_date: OperationalDate

	/**
	 * Whether to clip calendars to the specified date range
	 */
	clip_calendars: boolean

	/**
	 * Feed end date written to feed_info.txt — informational only
	 */
	feed_end_date: OperationalDate

	/**
	 * Feed start date written to feed_info.txt — informational only
	 */
	feed_start_date: OperationalDate

	/**
	 * Lines to exclude from export (array of line IDs)
	 */
	lines_exclude: string[]

	/**
	 * Lines to include in export (array of line IDs)
	 * If empty, all lines will be included (except those in lines_exclude)
	 */
	lines_include: string[]

	/**
	 * Whether to use numeric calendar codes instead of string codes
	 */
	numeric_calendar_codes: boolean

	/**
	 * Whether to export all stops or only referenced ones
	 */
	stops_export_all: boolean

	/**
	 * Starting value for stop_sequence (0 or 1)
	 */
	stop_sequence_start: number

	/**
	 * Export version string
	 */
	version: string

	/**
	 * Working directory for temporary files
	 */
	workdir: string

	/**
	 * CSV writers for each GTFS file
	 */
	writers: GtfsV29Writers
}

/* * */

/**
 * CSV writers for all GTFS v29 files
 */
export interface GtfsV29Writers {
	afetacao: CsvWriter<ExportedAfetacaoRow>
	agency: CsvWriter<GtfsTMLAgency>
	calendar_dates: CsvWriter<ExportedCalendarDatesRow>
	calendar_map?: CsvWriter<ExportedCalendarMapRow>
	fare_attributes: CsvWriter<GtfsTMLFareAttributes>
	fare_rules: CsvWriter<GtfsTMLFareRules>
	feed_info: CsvWriter<GtfsTMLFeedInfo>
	routes: CsvWriter<GtfsTMLRoute>
	shapes: CsvWriter<GTFS_Shape>
	stop_times: CsvWriter<GTFS_StopTime>
	stops: CsvWriter<GtfsTMLStop>
	trips: CsvWriter<GtfsTMLTrip>
}

/* * */

/**
 * Export progress tracking
 */
export interface ExportProgress {
	_id: string
	progress_current: number
	progress_total: number
	workdir: string
}

/* * */
/* GTFS V29 ROW TYPES */
/* * */

/**
 * Afetacao row for GTFS v29
 * This is a TML-specific extension, not part of standard GTFS
 */
export interface ExportedAfetacaoRow {
	operator_id: string
	line_id: string
	line_type: string
	pattern_id: string
	stop_id: string
	stop_name: string
	stop_sequence: number
	accepted_zone_codes: string
	accepted_zone_names: string
	onboard_fares: string
	prepaid_fare: string
	prepaid_fare_price: string
	interchange: string
}

/**
 * Extended calendar dates row for GTFS v29
 * Extends standard GTFS_CalendarDate with TML-specific fields
 */
export interface ExportedCalendarDatesRow extends GTFS_CalendarDate {
	period: string
	holiday: 0 | 1
	day_type: number
}

/**
 * Calendar map row for numeric calendar codes
 * Maps numeric service IDs back to their original text labels
 */
export interface ExportedCalendarMapRow {
	service_id: string
	service_label: string
}

/**
 * Extended trips row for GTFS v29
 * Extends standard GTFS_Trip with TML-specific fields
 */
export interface ExportedTripsRow extends GTFS_Trip {
	pattern_id: string
	pattern_short_name: string
	calendar_desc: string
}
