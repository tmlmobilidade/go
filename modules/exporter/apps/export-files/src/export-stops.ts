/* * */

import { authProvider, fileExports, type Filter, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { FileExport, type Stop, type StopExportProperties } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import os from 'os';
import path from 'path';

import { assertCanExportStopFromFlags, parseStops, type StopExportCsvData } from './lib/parse-stops.js';

/* * */

function buildDirectFilters(properties: StopExportProperties['properties']): Filter<Stop> {
	const directFilters: Filter<Stop> = {};

	if (properties.connections?.length) directFilters.connections = { $in: properties.connections };
	if (properties.equipment?.length) directFilters.equipment = { $in: properties.equipment };
	if (properties.facilities?.length) directFilters.facilities = { $in: properties.facilities };
	if (properties.flags?.length) directFilters.flags = { $in: properties.flags };
	if (properties.jurisdiction?.length) directFilters.jurisdiction = { $in: properties.jurisdiction };
	if (properties.lifecycle_statuses?.length) directFilters.lifecycle_status = { $in: properties.lifecycle_statuses };

	return directFilters;
}

function buildSearchFilter(searchQuery: string): Filter<Stop> {
	const searchRegex = new RegExp(searchQuery, 'i');
	return {
		$or: [
			{ _id: Number(searchQuery) || -1 },
			{ legacy_id: searchRegex },
			{ legacy_ids: searchRegex },
			{ name: searchRegex },
			{ short_name: searchRegex },
			{ tts_name: searchRegex },
		],
	};
}

function buildStopExportFilters(properties: StopExportProperties['properties']): Filter<Stop> {
	const directFilters = buildDirectFilters(properties);
	const searchQuery = properties.search?.trim();
	const searchFilter = searchQuery ? buildSearchFilter(searchQuery) : null;

	const andFilters = [directFilters, searchFilter].filter(Boolean) as Filter<Stop>[];
	return andFilters.length > 1 ? { $and: andFilters } : andFilters[0] ?? {};
}

/* * */

/**
 * Exports a batch of stops to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function exportStopsFile(fileExport: FileExport): Promise<string> {
	//

	if (fileExport.type !== 'stop') throw new Error(`File export type is not stop: ${fileExport.type}.`);

	if (!fileExport.properties) throw new Error('File export properties is missing.');

	//
	// Setup a timer to track the execution time
	const timer = new Timer();

	await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Build filters from export properties
	const properties = fileExport.properties as StopExportProperties['properties'];

	const myPermissions = await authProvider.getPermissionsFromUserId(fileExport.created_by);
	const filters = buildStopExportFilters(properties);

	const stopsCollection = await stops.getCollection();
	const stopsCursor = stopsCollection.find(filters, { batchSize: 5000 });

	//
	// Write the stops batch to the file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter<StopExportCsvData>(fileExport.file_name, tempFilePath, { batch_size: 10000, include_bom: true });

	let count = 0;
	for await (const stop of stopsCursor) {
		assertCanExportStopFromFlags(stop, myPermissions);

		await csvWriter.write(parseStops({ _id: stop._id, stop }));
		count++;
	}

	await csvWriter.flush();

	Logger.success(`Exported ${count} stops in ${timer.get()}`, 1);
	Logger.info(`File path: ${tempFilePath}`);
	Logger.spacer(1);

	return tempFilePath;
}
