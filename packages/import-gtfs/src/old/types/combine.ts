/* * */

import { type GtfsSQLTables } from '@/versions/standard/sql-tables.js';
import { type GtfsStrictV29ExtSQLTables } from '@/versions/v29-ext/sql-tables.js';
import { type GtfsStrictV29SQLTables } from '@/versions/v29/sql-tables.js';

/**
 * Combines the SQL tables from the `standard`,
 * `v29` and `v29-ext` versions of the GTFS specification.
 */
export type CombinedGtfsSQLTables = GtfsSQLTables & GtfsStrictV29ExtSQLTables & GtfsStrictV29SQLTables;
