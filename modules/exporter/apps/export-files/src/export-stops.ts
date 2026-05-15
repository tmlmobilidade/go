/* * */

import { authProvider, fileExports, type Filter, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { FileExport, PermissionCatalog, type Stop, type StopExportData, type StopExportProperties } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import os from 'os';
import path from 'path';

import { parseStops } from './lib/parse-stops.js';

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
	// Build filters from export properties and user permissions
	const properties = fileExport.properties as StopExportProperties['properties'];
	const searchQuery = properties.search?.trim();
	const directFilters: Filter<Stop> = {};

	if (properties.connections?.length) {
		directFilters.connections = { $in: properties.connections };
	}

	if (properties.equipment?.length) {
		directFilters.equipment = { $in: properties.equipment };
	}

	if (properties.facilities?.length) {
		directFilters.facilities = { $in: properties.facilities };
	}

	if (properties.flags?.length) {
		directFilters.flags = { $in: properties.flags };
	}

	if (properties.jurisdiction?.length) {
		directFilters.jurisdiction = { $in: properties.jurisdiction };
	}

	if (properties.lifecycle_statuses?.length) {
		directFilters.lifecycle_status = { $in: properties.lifecycle_statuses };
	}

	let searchFilter: Filter<Stop> | null = null;
	if (searchQuery) {
		const searchRegex = new RegExp(searchQuery, 'i');
		searchFilter = {
			$or: [
				{ _id: Number(searchQuery) || -1 },
				{ name: searchRegex },
				{ short_name: searchRegex },
				{ tts_name: searchRegex },
			],
		};
	}

	const myPermissions = await authProvider.getPermissionsFromUserId(fileExport.created_by);
	const stopsPermission = PermissionCatalog.get(myPermissions, PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.read);

	let permissionFilter: Filter<Stop> | null = null;
	if ('resource' in stopsPermission && stopsPermission.scope === PermissionCatalog.all.stops.scope) {
		if (stopsPermission.resource['agency_ids'] && !stopsPermission.resource['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			permissionFilter = {
				$or: [
					{ flags: { $elemMatch: { agency_ids: { $in: stopsPermission.resource['agency_ids'] } } } },
					{ flags: { $size: 0 } },
				],
			};
		}
	}

	const andFilters = [directFilters, searchFilter, permissionFilter].filter(Boolean) as Filter<Stop>[];
	const filters: Filter<Stop> = andFilters.length > 1 ? { $and: andFilters } : andFilters[0] ?? {};

	const stopsCollection = await stops.getCollection();
	const stopsCursor = stopsCollection.find(filters, { batchSize: 5000 });

	//
	// Write the stops batch to the file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter<StopExportData>(fileExport.file_name, tempFilePath, { batch_size: 10000, include_bom: true });

	let count = 0;
	for await (const stop of stopsCursor) {
		await csvWriter.write(parseStops({ _id: stop._id, stop }));
		count++;
	}

	await csvWriter.flush();

	Logger.success(`Exported ${count} stops in ${timer.get()}`, 1);
	Logger.info(`File path: ${tempFilePath}`);
	Logger.spacer(1);

	return tempFilePath;
}
