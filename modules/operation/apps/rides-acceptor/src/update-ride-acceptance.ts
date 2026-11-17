/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { hasJustificationHistory } from './has-justification-history.js';
import { testRide } from './test-ride.js';
import { type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export async function updateRideAcceptance(ride: RideWithAnalyses, acceptance: RideAcceptance) {
	try {
		//

		//
		// Test the ride against the required tests.
		const { analysisSummary, pass } = testRide(ride);

		//
		// Skip if the analysis summary has not changed.
		if (JSON.stringify(analysisSummary) === JSON.stringify(acceptance.analysis_summary)) return;

		//
		// Update the acceptance.
		const requiresManualJustification = acceptance.acceptance_status === 'justification_required' && hasJustificationHistory(acceptance);
		const acceptanceStatus = pass && !requiresManualJustification ? 'accepted' : 'justification_required';
		const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
		const result = await rideAcceptances.updateOne(
			{
				_id: acceptance._id,
				acceptance_status: acceptance.acceptance_status,
				comments: acceptance.comments ?? null,
				updated_at: acceptance.updated_at,
			},
			{ $set: {
				acceptance_status: acceptanceStatus,
				analysis_summary: analysisSummary,
				updated_at: Dates.now('utc').unix_milliseconds,
				updated_by: 'system',
			} },
		);
		if (!result.modifiedCount) return;

		Logger.info({ message: `Updated acceptance for ride ${ride._id} with status ${acceptanceStatus}.` });
	} catch (err) {
		Logger.critical({ error: err, message: 'An error occurred. Halting execution.' });
	}
}
