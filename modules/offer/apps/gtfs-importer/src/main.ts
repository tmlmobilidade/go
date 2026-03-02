/* * */

import path from 'path';

import { importLinesAndRoutes } from './imports/lines-routes.js';
import { type ImportOptions } from './types.js';

/* * */

export async function runImport() {
	const options: ImportOptions = {
		agencyIds: ['41'],
		dryRun: false,
		gtfsPath: path.resolve('/Users/afonsoesteves/Downloads/GTFS_Reference_41'),
	};
	await importLinesAndRoutes(options);
}
