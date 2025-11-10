/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { CsvWriter } from '@helperkits/writer';
import { ALLOW_ALL_FLAG, Permissions } from '@tmlmobilidade/consts';
import { authProvider, fileExports, rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { FileExport, Permission, RideAcceptance, RideNormalized, RidePermission } from '@tmlmobilidade/types';
import { getPermission } from '@tmlmobilidade/utils';
import os from 'os';
import path from 'path';

import { parseRide } from './lib/parse-ride.js';

/* * */

/**
 * Exports a batch of rides to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function exportRidesFile(fileExport: FileExport): Promise<string> {
	//

	if (fileExport.type !== 'ride') throw new Error(`File export type is not ride: ${fileExport.type}.`);

	//
	// Setup a timer to track the execution time
	const timer = new Timer();

	await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Get the rides batch using native MongoDB cursor with batchSize to prevent memory issues
	const pipeline = ridesBatchAggregationPipeline(fileExport.properties);

	//
	// 4. Filter rides based on permissions for the current user
	const myPermissions = await authProvider.getPermissions({ user_id: fileExport.created_by });
	const ridePermission: Permission<RidePermission> = getPermission(myPermissions, Permissions.rides.scope, Permissions.rides.actions.analysis_read);

	if (ridePermission?.resource) {
		// 4.1. Filter rides based on agency IDs
		if (ridePermission.resource.agency_ids && !ridePermission.resource.agency_ids.includes(ALLOW_ALL_FLAG)) {
			pipeline.push({ $match: { agency_id: { $in: ridePermission.resource.agency_ids } } });
		}
	}

	const ridesCollection = await rides.getCollection();
	const ridesBatchCursor = ridesCollection.aggregate(
		[
			...pipeline,
			{
				$lookup: {
					as: 'acceptance',
					foreignField: 'ride_id',
					from: 'ride_acceptances',
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
	Logger.info(`File path: ${tempFilePath}`);
	Logger.spacer(1);

	return tempFilePath;
}
