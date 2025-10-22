/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { CsvWriter } from '@helperkits/writer';
import { AggregationCursor, AggregationPipeline, fileExports, rides } from '@tmlmobilidade/interfaces';
import { FileExport, Ride, RideExportProperties } from '@tmlmobilidade/types';
import { generateRandomString } from '@tmlmobilidade/utils';
import os from 'os';
import path from 'path';

import { parseRide } from './lib/parse-ride.js';

/* * */

/**
 * Gets a batch of Rides built with an aggregation pipeline.
 */
async function getRidesBatchAggregation(properties: RideExportProperties['properties']): Promise<AggregationCursor<Ride>> {
	//
	// Setup an aggregation pipeline to filter data
	// based on the provided parameters.

	const pipeline: AggregationPipeline<Ride> = [];

	pipeline.push({ $match: { start_time_scheduled: { $gte: properties.start_date, $lte: properties.end_date } } });

	if (properties.line_ids) pipeline.push({ $match: { line_id: { $in: properties.line_ids } } });
	if (properties.agency_ids) pipeline.push({ $match: { agency_id: { $in: properties.agency_ids } } });

	//
	// Add acceptance status to the pipeline
	pipeline.push(
		{ $lookup: { as: 'acceptance', foreignField: 'ride_id', from: 'ride_acceptances', localField: '_id' } },
		{ $unwind: { path: '$acceptance', preserveNullAndEmptyArrays: true } },
		{ $addFields: { acceptance_status: { $ifNull: ['$acceptance.acceptance_status', null] } } },
		{ $project: { acceptance: 0 } },
	);

	//
	// Impose a hard limit to the number of rides returned
	// to avoid performance issues.
	const ridesCollection = await rides.getCollection();
	return ridesCollection.aggregate(pipeline, { allowDiskUse: true });
}

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
	const ridesBatch = await getRidesBatchAggregation(fileExport.properties);

	//
	// Write the rides batch to the file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter(fileExport.file_name, tempFilePath, { batch_size: 10000 });

	let count = 0;
	for await (const ride of ridesBatch.stream()) {
		await csvWriter.write(parseRide(ride));
		count++;
	}

	await csvWriter.flush();

	LOGGER.success(`Exported ${count} rides in ${timer.get()}`, 1);
	LOGGER.info(`File path: ${tempFilePath}`);
	LOGGER.spacer(1);

	return tempFilePath;
}
