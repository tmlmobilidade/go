/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

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
		const { _id, ...fields } = acceptance;

		await goDb.operation.rideAcceptances.updateById(_id, {
			...fields,
			acceptance_status: pass ? 'accepted' : 'justification_required',
			analysis_summary: analysisSummary,
			updated_by: 'system',
		});

		Logger.info({ message: `Updated acceptance for ride ${ride._id} with status ${pass ? 'accepted' : 'justification_required'}.` });
	} catch (err) {
		Logger.error({ error: err, message: 'An error occurred. Halting execution.' });
	}
}
