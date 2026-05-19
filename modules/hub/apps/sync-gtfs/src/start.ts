/* * */

import allGtfsFiles from '@/config/files.js';
import createHashFromFile from '@/modules/createHashFromFile.js';
import { initGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import normalizeDirectoryPermissions from '@/modules/normalizeDirectoryPermissions.js';
import prepareAndImportFile from '@/modules/prepareAndImportFile.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import extract from 'extract-zip';
import fs from 'node:fs';

/* * */

import { syncDates } from '@/tasks/sync-dates.js';
import { syncLinesRoutesPatterns } from '@/tasks/sync-lines-routes-patterns.js';
import { syncPeriods } from '@/tasks/sync-periods.js';
import { syncPlans } from '@/tasks/sync-plans.js';
import { syncShapes } from '@/tasks/sync-shapes.js';
import { syncStops } from '@/tasks/sync-stops.js';

/* * */

let LAST_GTFS_HASH = null;

/* * */

const RAW_DIR_PATH = '/tmp/raw';
const RAW_FILE_PATH = `${RAW_DIR_PATH}/gtfs.zip`;
const PREPARED_DIR_PATH = `/tmp/prepared`;

/* * */

const resolveGtfsExtractedDirPath = () => {
	const expectedFileName = `${allGtfsFiles[0]._key}.${allGtfsFiles[0].extension}`;
	const directPath = `${RAW_DIR_PATH}/${expectedFileName}`;

	if (fs.existsSync(directPath)) {
		return RAW_DIR_PATH;
	}

	for (const dirEntry of fs.readdirSync(RAW_DIR_PATH, { withFileTypes: true })) {
		if (!dirEntry.isDirectory()) continue;

		const candidatePath = `${RAW_DIR_PATH}/${dirEntry.name}`;
		const candidateExpectedFilePath = `${candidatePath}/${expectedFileName}`;
		if (fs.existsSync(candidateExpectedFilePath)) {
			return candidatePath;
		}
	}

	throw new Error(`Could not locate extracted GTFS files in "${RAW_DIR_PATH}". Missing expected "${expectedFileName}".`);
};

/* * */

export const ENABLED_MODULES = [
	'gtfs_import',
	'periods_parser',
	'dates_parser',
	'plans_parser',
	'stops_parser',
	'shapes_parser',
	'lines_routes_patterns_parser',
];

/* * */

export default async () => {
	try {
		//

		LOGGER.init();
		const globalTimer = new TIMETRACKER();

		/* * */

		LOGGER.spacer(1);
		LOGGER.title('1. Fetching latest GTFS...');
		const importGtfsTimer = new TIMETRACKER();

		//
		// Prepare working directories

		fs.rmSync(RAW_DIR_PATH, { force: true, recursive: true });
		fs.mkdirSync(RAW_DIR_PATH, { recursive: true });

		//
		// Import GTFS from source URL

		LOGGER.info(`Downloading file from "https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs"...`);
		const downloadedCsvFile = await fetch('https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs');
		const downloadedCsvArrayBuffer = await downloadedCsvFile.arrayBuffer();
		fs.writeFileSync(RAW_FILE_PATH, Buffer.from(downloadedCsvArrayBuffer));

		LOGGER.success(`Done fetching latest GTFS (${importGtfsTimer.get()})`);

		//
		// Compare GTFS hash to determine if we need to proceed

		const currentGtfsHash = await createHashFromFile(RAW_FILE_PATH);

		if (LAST_GTFS_HASH === currentGtfsHash) {
			LOGGER.terminate(`Skipping this run as latest GTFS is the same as previous run (${globalTimer.get()})`);
			return;
		}

		LAST_GTFS_HASH = currentGtfsHash;

		LOGGER.info('Latest GTFS is not the same as previous run. Proceeding...');

		/* * */

		if (ENABLED_MODULES.includes('gtfs_import')) {
			LOGGER.spacer(1);
			LOGGER.title('2. Unzip, prepare and import each GTFS file...');
			initGtfsSqliteContext();

			//
			// Extract GTFS plan into prepared directory
			// and normalize directory permissions

			await extract(RAW_FILE_PATH, { dir: RAW_DIR_PATH });
			normalizeDirectoryPermissions(RAW_DIR_PATH);

			LOGGER.success('Done extracting GTFS plan and normalizing directory permissions');

			//
			// For each file, eliminate unwanted columns and normalize their positions.
			// This is required to use a special import command that expects a CSV file
			// to have the exact same structure as the table it is being imported into.
			// Even though this may seem wasteful, it dramatically speeds up the import process.

			fs.rmSync(PREPARED_DIR_PATH, { force: true, recursive: true });
			fs.mkdirSync(PREPARED_DIR_PATH, { recursive: true });
			const extractedGtfsDirPath = resolveGtfsExtractedDirPath();
			LOGGER.info(`Using extracted GTFS directory "${extractedGtfsDirPath}".`);

			for (const fileOptions of allGtfsFiles) {
				const rawFilePath = `${extractedGtfsDirPath}/${fileOptions._key}.${fileOptions.extension}`;
				await prepareAndImportFile(PREPARED_DIR_PATH, rawFilePath, fileOptions);
			}

			LOGGER.success('Done preparing and importing GTFS files');

			//
		}

		/* * */

		if (ENABLED_MODULES.includes('periods_parser')) {
			await syncPeriods();
			LOGGER.spacer(1);
		}

		/* * */

		if (ENABLED_MODULES.includes('dates_parser')) {
			await syncDates();
			LOGGER.spacer(1);
		}

		/* * */

		if (ENABLED_MODULES.includes('plans_parser')) {
			await syncPlans();
			LOGGER.spacer(1);
		}

		/* * */

		if (ENABLED_MODULES.includes('shapes_parser')) {
			await syncShapes();
			LOGGER.spacer(1);
		}
		/* * */

		if (ENABLED_MODULES.includes('stops_parser')) {
			await syncStops();
			LOGGER.spacer(1);
		}

		/* * */

		if (ENABLED_MODULES.includes('lines_routes_patterns_parser')) {
			await syncLinesRoutesPatterns();
			LOGGER.spacer(1);
		}

		//

		LOGGER.terminate(`Run complete (${globalTimer.get()})`);

		//
	} catch (error) {
		LOGGER.error('An error occurred. Halting execution.', error);
	}

	//
};
