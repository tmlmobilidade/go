/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

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
		end: OperationalDateInt
		start: OperationalDateInt
	}
	discrete_dates?: OperationalDateInt[]
}

/**
 * Configuration options for importing GTFS data.
 * Source is required, time range is optional.
 */
export interface ImportGtfsConfig {
	source: ImportGtfsConfigSource
	time_range?: ImportGtfsConfigTimeRange
}
