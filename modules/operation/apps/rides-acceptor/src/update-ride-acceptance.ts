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
		if (JSON.stringify(analysisSummary) === JSON.stringify(acceptance.analysis_summary)) return acceptance;

		//
		// Update the acceptance.
		const requiresManualJustification = acceptance.acceptance_status === 'justification_required' && hasJustificationHistory(acceptance);
		const acceptanceStatus = pass && !requiresManualJustification ? 'accepted' : 'justification_required';
		const now = Dates.now('utc').unix_milliseconds;
		const audit = { created_at: now, created_by: 'system', type: 'field_changed' as const, updated_at: now, updated_by: 'system' };
		const comments: RideAcceptance['comments'] = [
			{ ...audit, curr_value: analysisSummary, field: 'analysis_summary', prev_value: acceptance.analysis_summary },
		];
		if (acceptanceStatus !== acceptance.acceptance_status) {
			comments.push({ ...audit, curr_value: acceptanceStatus, field: 'acceptance_status', prev_value: acceptance.acceptance_status });
		}
		const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
		const updatedAcceptance = await rideAcceptances.findOneAndUpdate(
			{
				_id: acceptance._id,
				acceptance_status: acceptance.acceptance_status,
				comments: acceptance.comments ?? null,
				updated_at: acceptance.updated_at,
			},
			{
				$push: { comments: { $each: comments } },
				$set: { acceptance_status: acceptanceStatus, analysis_summary: analysisSummary, updated_at: now, updated_by: 'system' },
			},
			{ returnDocument: 'after' },
		);
		if (!updatedAcceptance) return;

		Logger.info({ message: `Updated acceptance for ride ${ride._id} with status ${acceptanceStatus}.` });
		return updatedAcceptance;
	} catch (err) {
		Logger.critical({ error: err, message: 'An error occurred. Halting execution.' });
	}
}
