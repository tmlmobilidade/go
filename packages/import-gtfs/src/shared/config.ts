/* * */

import { type GtfsDate } from '@tmlmobilidade/go-types-gtfs';

/**
 * Source type of the GTFS data to import.
 */
type ImportGtfsConfigSource = {
	path: string
} | {
	url: string
};

/**
 * Time range type of the GTFS data to import.
 */
interface ImportGtfsConfigTimeRange {
	date_range?: {
		end: GtfsDate
		start: GtfsDate
	}
	discrete_dates?: (GtfsDate)[]
}

/**
 * Configuration options for importing GTFS data.
 * Source is required, time range is optional.
 */
export interface ImportGtfsConfig {
	source: ImportGtfsConfigSource
	time_range?: ImportGtfsConfigTimeRange
}
