/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { RideAcceptance, RideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

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
		const now = Dates.now('utc').unix_milliseconds;
		const acceptanceStatus = pass ? 'accepted' : 'justification_required';
		const audit = { created_at: now, created_by: 'system', updated_at: now, updated_by: 'system' };
		const acceptance: RideAcceptance = {
			_id: ride._id,
			acceptance_status: acceptanceStatus,
			analysis_summary: analysisSummary,
			comments: [
				{ ...audit, action: 'create', type: 'crud' },
				{ ...audit, curr_value: analysisSummary, field: 'analysis_summary', prev_value: null, type: 'field_changed' },
				{ ...audit, curr_value: acceptanceStatus, field: 'acceptance_status', prev_value: null, type: 'field_changed' },
			],
			is_locked: false,
			justification: null,
			overrides: {
				trip_id: null,
			},
			...audit,
		};

		const parsedAcceptance = RideAcceptanceSchema.parse(acceptance);
		await goDb.operation.rideAcceptances.insertOneUnsafe(parsedAcceptance);

		Logger.info({ message: `Created acceptance for ride ${ride._id} with status ${pass ? 'accepted' : 'justification_required'}.` });
	} catch (err) {
		Logger.critical({ error: err, message: `Failed to create acceptance for ride ${ride._id}.` });
	}
}
