/* * */

import { type GtfsStrictV29Agency } from '@tmlmobilidade/go-types-gtfs-strict';
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
	writers: GtfsV29Writers
}

/**
 * CSV writers for each GTFS file
 */
export interface GtfsV29Writers {
	agency: CsvWriter<GtfsStrictV29Agency>
}
