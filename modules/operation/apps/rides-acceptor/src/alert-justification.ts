/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance, RideJustificationSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { hasJustificationHistory } from './has-justification-history.js';
import { type RideWithAnalyses } from './types/ride-with-analyses.js';

/* * */

export async function alertJustification(ride: RideWithAnalyses, acceptance: RideAcceptance) {
	if (hasJustificationHistory(acceptance)) return;

	try {
		//

		//
		// Find a recent alert that references this ride or its line.
		const foundAlert = await goDb.operation.alerts.findOne({
			created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 2 }).unix_milliseconds },
			reference_type: { $in: ['rides', 'lines'] },
			references: { $elemMatch: { parent_id: { $in: [ride._id, ride.route_short_name] } } },
		});

		if (!foundAlert) return;

		//
		// Justify the acceptance with the alert.
		const now = Dates.now('utc').unix_milliseconds;
		const justification = RideJustificationSchema.parse({
			alert_id: foundAlert._id,
			created_at: now,
			created_by: foundAlert.created_by,
			justification_cause: foundAlert.cause,
			justification_source: 'alert',
			pto_message: foundAlert.description,
			updated_at: now,
			updated_by: foundAlert.created_by,
		});
		const audit = { created_at: now, created_by: 'system', type: 'field_changed' as const, updated_at: now, updated_by: 'system' };
		const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();
		const result = await rideAcceptances.updateOne(
			{ _id: acceptance._id, acceptance_status: 'justification_required', comments: acceptance.comments ?? null, justification: null },
			{
				$push: { comments: { $each: [
					{ ...audit, curr_value: justification, field: 'justification', prev_value: null },
					{ ...audit, curr_value: 'under_review', field: 'acceptance_status', prev_value: 'justification_required' },
				] } },
				$set: { acceptance_status: 'under_review', justification, updated_at: now, updated_by: 'system' },
			},
		);
		if (!result.modifiedCount) return;

		Logger.info({ message: `Justified ride ${ride._id} with alert ${foundAlert._id}.` });
	} catch (error) {
		Logger.error({ error, message: 'An error occurred. Halting execution.' });
	}
}
