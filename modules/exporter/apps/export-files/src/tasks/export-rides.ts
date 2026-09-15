/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type FileExport } from '@tmlmobilidade/go-types-downloads';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { type RideNormalized } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import os from 'node:os';
import path from 'node:path';

import { parseRide } from '../utils/parse-ride.js';

/* * */

/**
 * Exports a batch of rides to a CSV file.
 * @param fileExport The file export object.
 * @returns The path to the exported file.
 */
export async function exportRidesFile(fileExport: FileExport): Promise<string> {
	//

	if (fileExport.type !== 'ride') throw new Error(`File export type is not ride: ${fileExport.type}.`);

	if (!fileExport.properties) throw new Error(`File export properties is missing.`);

	//
	// Setup a timer to track the execution time
	// and mark the file export as being processed

	const timer = new Timer();

	await goDb.core.exports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Extract and prepare the search query

	const searchQuery = (fileExport.properties as typeof fileExport.properties & { search?: string }).search?.trim() ?? '';

	//
	// Build the rides batch pipeline from the export properties

	const pipeline = ridesBatchAggregationPipeline({
		...fileExport.properties,
		search: searchQuery || undefined,
	});

	//
	// Narrow the pipeline to the agencies the requesting user can read

	const myPermissions = await authProvider.getPermissionsFromUserId(fileExport.created_by);
	const ridesPermission = PermissionCatalog.get(myPermissions, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read);

	if ('resource' in ridesPermission && ridesPermission.scope === PermissionCatalog.all.rides.scope) {
		if (ridesPermission.resource['agency_ids'] && !ridesPermission.resource['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			pipeline.push({ $match: { agency_id: { $in: ridesPermission.resource['agency_ids'] } } });
		}
	}

	//
	// Get the rides batch using a native MongoDB cursor
	// with a batch size to prevent memory issues

	const ridesCollection = await goDb.operation.rides.getCollection();
	const ridesBatchCursor = ridesCollection.aggregate(
		[
			...pipeline,
			{
				$lookup: {
					as: 'acceptance',
					foreignField: 'ride_id',
					from: 'ride-acceptances',
					localField: '_id',
				},
			},
			{ $unwind: { path: '$acceptance', preserveNullAndEmptyArrays: true } },
		],
		{ cursor: { batchSize: 5000 } },
	);

	//
	// Write the rides batch to the file

	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter(fileExport.file_name, tempFilePath, { batch_size: 10000, include_bom: true });

	let count = 0;
	for await (const ride of ridesBatchCursor) {
		await csvWriter.write(parseRide(ride as RideNormalized & { acceptance: null | RideAcceptance }));
		count++;
	}

	await csvWriter.flush();

	Logger.success(`Exported ${count} rides in ${timer.get()}`, 1);
	Logger.info({ message: `File path: ${tempFilePath}` });
	Logger.spacer(1);

	return tempFilePath;

	//
}
