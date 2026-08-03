/* * */

import { type OperationalDateInt } from '@tmlmobilidade/types';

/**
 * Source type of the GTFS data to import.
 */
type ImportGtfsToDatabaseConfigSource = {
	path: string
} | {
	url: string
};

/**
 * Time range type of the GTFS data to import.
 */
interface ImportGtfsToDatabaseConfigTimeRange {
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
export interface ImportGtfsToDatabaseConfig {
	source: ImportGtfsToDatabaseConfigSource
	time_range?: ImportGtfsToDatabaseConfigTimeRange
}

