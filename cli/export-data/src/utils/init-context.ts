/* * */

import { type ExportContext } from '@/types.js';
import { generateRandomString } from '@tmlmobilidade/strings';
import { readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import path from 'node:path';

/* * */

export function initExportContext(): ExportContext {
	//

	//
	// Generate a random export ID

	const exportId = generateRandomString();

	//
	// Get the app version from the package.json file

	const pjsonPath = findPackageJSON('@tmlmobilidade/export-data', import.meta.url);
	const pjsonFile = readFileSync(pjsonPath, 'utf-8');
	const appVersion = JSON.parse(pjsonFile).version;

	//
	// Setup the output path for the export by joining
	// the current working directory with the export ID

	const outputPath = path.join(process.cwd(), `export-${exportId}`);

	//
	// Build and return the export context object

	return {
		_id: exportId,
		app_version: appVersion,
		dates: {
			end: undefined,
			start: undefined,
		},
		filters: {
			agency_ids: [],
			line_ids: [],
			pattern_ids: [],
			stop_ids: [],
			vehicle_ids: [],
		},
		output: outputPath,
	};
}
