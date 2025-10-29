/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { CsvWriter } from '@helperkits/writer';
import { fileExports, rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { FileExport, RideAcceptance, RideNormalized } from '@tmlmobilidade/types';
import { generateRandomString } from '@tmlmobilidade/utils';
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
	const timer = new TIMETRACKER();

	await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Get the rides batch
	const pipeline = ridesBatchAggregationPipeline(fileExport.properties);
	const ridesBatch = await rides.aggregate([
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
	]);

	//
	// Write the rides batch to the file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter(fileExport.file_name, tempFilePath, { batch_size: 10000 });

	let count = 0;
	for await (const ride of ridesBatch) {
		await csvWriter.write(parseRide(ride as RideNormalized & { acceptance: null | RideAcceptance }));
		count++;
	}

	await csvWriter.flush();

	LOGGER.success(`Exported ${count} rides in ${timer.get()}`, 1);
	LOGGER.info(`File path: ${tempFilePath}`);
	LOGGER.spacer(1);

	return tempFilePath;
}
