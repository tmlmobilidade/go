/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { RideAcceptance, RideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
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
		const acceptance: RideAcceptance = {
			_id: ride._id,
			acceptance_status: pass ? 'accepted' : 'justification_required',
			analysis_summary: analysisSummary,
			comments: [],
			created_at: Dates.now('utc').unix_timestamp,
			created_by: 'system',
			is_locked: false,
			justification: null,
			overrides: {
				trip_id: null,
			},
			updated_at: Dates.now('utc').unix_timestamp,
			updated_by: 'system',
		};

		const parsedAcceptance = RideAcceptanceSchema.parse(acceptance);
		await goDb.operation.rideAcceptances.insertOneUnsafe(parsedAcceptance);

		Logger.info({ message: `Created acceptance for ride ${ride._id} with status ${pass ? 'accepted' : 'justification_required'}.` });
	} catch (err) {
		Logger.error({ error: err, message: 'An error occurred. Halting execution.' });
	}
}
