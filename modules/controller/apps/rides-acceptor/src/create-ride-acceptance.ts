/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';

import { testRide } from './test-ride.js';
import { type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export async function createRideAcceptance(ride: RideWithAnalyses) {
	try {
		//

		//
		// If the ride is not ended or missed, skip it.
		if (ride.operational_status !== 'ended' && ride.operational_status !== 'missed') return;

		//
		// Test the ride against the required tests.
		const { analysisSummary, pass } = testRide(ride);

		//
		// Create the acceptance.
		await goDb.operation.rideAcceptances.insertOne({
			acceptance_status: pass ? 'accepted' : 'justification_required',
			analysis_summary: analysisSummary,
			comments: [],
			created_by: 'system',
			is_locked: false,
			justification: null,
			overrides: {
				trip_id: null,
			},
			ride_id: ride._id,
		});

		Logger.info({ message: `Created acceptance for ride ${ride._id} with status ${pass ? 'accepted' : 'justification_required'}.` });
	} catch (err) {
		Logger.error({ error: err, message: 'An error occurred. Halting execution.' });
	}
}
