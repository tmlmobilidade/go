/* * */

import { type OperationalDate } from '@tmlmobilidade/types';

/**
 * Base configuration options for importing GTFS data into a database.
 */
interface BaseImportGtfsToDatabaseConfig {
	download_url: string
}

interface ImportGtfsToDatabaseConfigWithDateRange extends BaseImportGtfsToDatabaseConfig {
	date_range: {
		end: OperationalDate
		start: OperationalDate
	}
}

interface ImportGtfsToDatabaseConfigWithDiscreteDates extends BaseImportGtfsToDatabaseConfig {
	discrete_dates: OperationalDate[]
};

/**
 * Configuration options for importing GTFS data into a database.
 * Either a date range or a discrete dates array must be provided.
 */
export type ImportGtfsToDatabaseConfig = ImportGtfsToDatabaseConfigWithDateRange | ImportGtfsToDatabaseConfigWithDiscreteDates;
