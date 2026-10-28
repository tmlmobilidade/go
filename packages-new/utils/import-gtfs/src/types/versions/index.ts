/* * */

import { type GtfsHubV1SQLTables } from './gtfs-hub-v1.js';
import { type GtfsStandardSQLTables } from './gtfs-standard.js';
import { type GtfsStrictV30SQLTables } from './gtfs-strict-v30.js';

/* * */

export type GtfsSQLTables =
  GtfsHubV1SQLTables
  | GtfsStandardSQLTables
  | GtfsStrictV30SQLTables;

export {
	type GtfsHubV1SQLTables,
	type GtfsStandardSQLTables,
	type GtfsStrictV30SQLTables,
};
