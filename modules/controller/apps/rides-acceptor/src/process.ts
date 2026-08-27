/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { PerformInTimeChunksItem } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { alertJustification } from './alert-justification.js';
import { createRideAcceptance } from './create-ride-acceptance.js';
import { ridesWithAnalysesQuery } from './queries/rides-with-analyses-query.js';
import { type RideWithAnalyses } from './types/ride-with-analyses.js';
import { updateRideAcceptance } from './update-ride-acceptance.js';

/* * */

export async function processRideAcceptanceChunk(chunk: PerformInTimeChunksItem) {
	//

	const chunkTimer = new Timer();
	const progress = `[${chunk.index + 1}/${chunk.total}]`;

	const chunkStartDate = Dates
		.fromUnixTimestamp(chunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(chunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.title(`${progress} - ${chunkEndDate.toLocaleString('only_time_with_seconds')} › ${chunkStartDate.toLocaleString('only_time_with_seconds')}`);

	//
	// Fetch the rides.
	// const foundRides = await goDb.operation.rides.findMany({ start_time_scheduled: { $gte: chunkStartDate.unix_timestamp, $lte: chunkEndDate.unix_timestamp } });
	const foundRides = await labDb.queryFromString<RideWithAnalyses>(ridesWithAnalysesQuery, { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });

	//
	// Bulk fetch acceptances.
	const acceptances: RideAcceptance[] = await goDb.operation.rideAcceptances.findMany({ ride_id: { $in: foundRides.map(r => r._id) } });
	const acceptanceMap = new Map<string, RideAcceptance>(acceptances.map(a => [a._id, a]));

	//
	// Loop through the found rides and process
	let totalRides = 0;
	for (const ride of foundRides) {
		//

		totalRides++;

		const acceptance = acceptanceMap.get(ride._id);

		//
		// If the ride does not have an acceptance, create one.
		if (!acceptance) {
			await createRideAcceptance(ride);
			continue;
		}

		//
		// If the ride has an acceptance, update it.
		await updateRideAcceptance(ride, acceptance);

		//
		// If justification is required, try to justify from a matching alert.
		if (acceptance.acceptance_status === 'justification_required') {
			await alertJustification(ride, acceptance);
		}
	}
}
